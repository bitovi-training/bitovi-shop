---
name: detect-fraudulent-reviews
description: Detects suspicious or fraudulent product reviews. Use this skill when reviewing fake reviews, review spam, astroturfing patterns, duplicated testimonials, or overly promotional product feedback in large review datasets.
argument-hint: Path to the review data plus any constraints, such as whether to return only high-confidence suspects.
---

⚠️ CRITICAL: You MUST read the EVERY review from the dataset from start to finish. DO NOT skip sections, sample, or use strategic reads. Read all reviews sequentially in chunks until you have processed every single line. Sampling or skipping any part of the dataset will result in missing fraud patterns. This is non-negotiable. 

If presented with a large file or dataset, invoke the `review-fraud-subagent` to read the data in manageable chunks, but ensure that the subagent processes every line without skipping. The integrity of the analysis depends on a complete review of the dataset.

# Detect Fraudulent Reviews

Use this skill when a user wants to analyze product reviews and identify reviews that are likely fraudulent.

This workflow is optimized for large datasets. Keep the working set narrow and return findings, not the whole file.

IMPORTANT: Do not use a script or code interpreter for this skill. The analysis should be done through reasoning and pattern recognition, not by executing code. Analyze the data manually. 

## Signals To Look For

- Language that is unnaturally promotional, generic, or detached from the actual product.
- Repeated or near-repeated phrasing across multiple reviews or products.
- Reviewer behavior that looks coordinated, such as bursts of similar reviews on the same date.
- Review text that conflicts with the star rating or with product-specific details.
- Extremely vague praise that avoids concrete usage details.
- Reviews that read like ads, slogans, or affiliate copy instead of lived experience.
- Suspicious reviewer reuse patterns, including the same reviewer name across unrelated products with nearly identical language.

## Examples

### Example: likely authentic

Review:

> I keep this bottle in my backpack every day. It stays cold through my commute and the finish still looks good after a month.

Why it looks authentic:

- Mentions a believable usage context.
- Includes product-specific details.
- Sounds personal instead of promotional.

### Example: likely fraudulent

Review:

> Absolutely life-changing craftsmanship with elite premium performance. Everyone needs this masterpiece immediately.

Why it looks suspicious:

- Heavy promotional language.
- No real usage details.
- Reads more like marketing copy than a customer review.

### Example: likely authentic

Review:

> The lamp looks great on my desk, but the dimmer knob feels a little loose. Keeping it because the light is warm and soft at night.

Why it looks authentic:

- Contains balanced sentiment.
- Names a concrete feature.
- Includes a believable tradeoff.

### Example: likely fraudulent

Review cluster:

> Superb innovation and unmatched quality for modern living.

> Unmatched quality and superb innovation for any modern lifestyle.

Why it looks suspicious:

- Near-duplicate wording.
- Generic copy that could apply to any product.
- Suggests templated or coordinated submissions.

## Procedure

1. Inspect the available fields and identify the review text, rating, reviewer, product, and date signals.
2. Sample the data before reading deeply. If the dataset is large, pull only the slices needed to test patterns.
3. Group suspicious reviews by pattern instead of reviewing every row in isolation.
4. Compare wording across products to catch duplicated testimonials.
5. Prioritize high-confidence suspects with concrete evidence from the data.
6. Keep the response compact. Quote only the short snippets needed to justify each flag.

## Guardrails

- Do not claim a review is definitely fraudulent unless the evidence is explicit.
- Use confidence language such as `high`, `medium`, or `low` suspicion.
- Prefer review IDs and short excerpts over dumping large source sections into the chat.
- If a dataset already includes labels or moderation outcomes, ignore them unless the user explicitly asks for an evaluation against ground truth.
- If the input is very large, recommend delegating the read to a focused subagent so the parent conversation stays clean.

## Output Format

Return:

1. A one-paragraph summary of overall fraud risk in the dataset.
2. A short table with: `review_id`, `product`, `suspicion`, `signals`, and `excerpt`.
3. A short note on recurring patterns, such as repeated phrases or reviewer clusters.
4. If useful, a final line with what to inspect next.