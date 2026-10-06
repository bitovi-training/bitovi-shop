// Runs before every test file: adds the jest-dom matchers (toBeInTheDocument,
// toBeDisabled, ...) and cleans up the rendered DOM between tests.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => cleanup());
