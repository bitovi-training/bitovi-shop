-- Design system rules store
--
-- The problem this solves: most design system rules are not about a single
-- component. They are about how components combine, and those rules live in
-- designers' heads rather than in documentation. A flat list does not hold
-- them because the relationships are many-to-many: one rule can touch several
-- components, and one component appears in many rules.
--
-- So: rules in one table, and junction tables for what each rule touches.
-- Retrieval is a join, which means it is deterministic. Given the components
-- present in a design, you get exactly the rules that apply, every time.

CREATE TABLE IF NOT EXISTS rules (
  id          TEXT PRIMARY KEY,

  -- The rule in plain language. Written for both a designer and an agent:
  -- the tags decide which rules get retrieved, this text carries the nuance
  -- and the exceptions.
  text        TEXT NOT NULL,

  -- Why the rule exists, when that isn't obvious from the text. Optional.
  rationale   TEXT,

  -- What the rule governs.
  --   component - a single component in isolation
  --   pair      - how two or more components relate
  --   screen    - a property of the whole screen
  --   global    - applies everywhere
  scope       TEXT NOT NULL CHECK (scope IN ('component','pair','screen','global')),

  -- How hard the rule is. Lets findings be ranked rather than dumped, and
  -- lets a design deviate deliberately without it reading as an error.
  strength    TEXT NOT NULL CHECK (strength IN ('must','should','consider')),

  -- Where the rule came from. This is the difference between something a
  -- designer asserted and something an agent inferred, and it stays attached
  -- to the rule for its whole life.
  --   session   - captured in a working session with the design team
  --   inferred  - parsed by an agent from existing shipped designs
  --   proposed  - drafted by an agent, not yet confirmed by a human
  source      TEXT NOT NULL CHECK (source IN ('session','inferred','proposed')),

  -- Nothing enforces against a rule until a human with standing approves it.
  status      TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','approved','retired')),

  -- Who approved it and when. Null until someone does.
  approved_by TEXT,
  approved_on TEXT,

  created     TEXT NOT NULL DEFAULT (date('now'))
);

-- Which components a rule touches. A pair rule lists both sides; retrieval
-- finds the rule when either is present in the design under review.
CREATE TABLE IF NOT EXISTS rule_components (
  rule_id   TEXT NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
  component TEXT NOT NULL,
  PRIMARY KEY (rule_id, component)
);

-- Which design tokens a rule governs. Some rules are about color or spacing
-- rather than any particular component, and would otherwise have nowhere to live.
CREATE TABLE IF NOT EXISTS rule_tokens (
  rule_id TEXT NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
  token   TEXT NOT NULL,
  PRIMARY KEY (rule_id, token)
);

CREATE INDEX IF NOT EXISTS idx_rule_components_component ON rule_components(component);
CREATE INDEX IF NOT EXISTS idx_rule_tokens_token ON rule_tokens(token);
CREATE INDEX IF NOT EXISTS idx_rules_status ON rules(status);

-- ---------------------------------------------------------------------------
-- Component inventory
--
-- The rules above say how components combine. This table says what exists and
-- how to reach for it. An agent without an inventory cannot tell "this
-- component does not exist" from "I did not find it", so it invents something
-- that looks right and detaches from the design system. With an inventory,
-- failing to find a match is a signal: this is a genuinely new pattern, and it
-- should be routed for review rather than quietly built.
--
-- Everything here is extracted from the codebase, never hand-written. The
-- source of truth stays where engineers already maintain it.

CREATE TABLE IF NOT EXISTS components (
  name           TEXT PRIMARY KEY,

  -- Where the component lives in the repo.
  source_path    TEXT,

  -- The Figma node it maps to, from Code Connect. Null when a component ships
  -- but has not been mapped yet, which is itself worth knowing.
  figma_node     TEXT,

  -- Prose on how the component is meant to be used, ingested from wherever the
  -- team already writes it. On a client engagement that might be GitLab Pages; here it is
  -- docs/components. Stored whole rather than chunked: the component name is
  -- the key, so there is no search problem to solve, and the agent reads the
  -- text and reasons about it the same way a designer would.
  usage_docs     TEXT,

  -- Whether the docs exist at all. A component with no guidance is a gap in
  -- the same way an undocumented combination rule is.
  documented     INTEGER NOT NULL DEFAULT 0,

  code_connected INTEGER NOT NULL DEFAULT 0
);

-- The variants a component ships, so an agent composes from real options
-- rather than inventing a plausible-sounding one.
CREATE TABLE IF NOT EXISTS component_variants (
  component TEXT NOT NULL REFERENCES components(name) ON DELETE CASCADE,
  variant   TEXT NOT NULL,
  PRIMARY KEY (component, variant)
);
