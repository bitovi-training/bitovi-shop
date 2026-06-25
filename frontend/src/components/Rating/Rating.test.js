import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import Rating from './Rating.jsx';

describe('Rating component', () => {
  it('renders rounded number of filled stars', () => {
    const html = renderToStaticMarkup(React.createElement(Rating, { value: 3.4 }));

    const filledCount = (html.match(/rating__star--filled/g) || []).length;
    const emptyCount = (html.match(/rating__star--empty/g) || []).length;

    expect(filledCount).toBe(3);
    expect(emptyCount).toBe(2);
    expect(html).toContain('aria-label="3 out of 5 stars"');
  });

  it('caps value at max', () => {
    const html = renderToStaticMarkup(React.createElement(Rating, { value: 99, max: 4 }));

    const filledCount = (html.match(/rating__star--filled/g) || []).length;
    expect(filledCount).toBe(4);
    expect(html).toContain('aria-label="4 out of 4 stars"');
  });

  it('does not render negative filled stars', () => {
    const html = renderToStaticMarkup(React.createElement(Rating, { value: -2, max: 5 }));

    const filledCount = (html.match(/rating__star--filled/g) || []).length;
    expect(filledCount).toBe(0);
  });
});
