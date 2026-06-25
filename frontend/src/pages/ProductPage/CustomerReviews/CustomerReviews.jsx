import { useState } from 'react';
import Button, { BUTTON_VARIANTS } from '../../../components/Button/Button';
import CustomerReview from '../CustomerReview/CustomerReview';
import './CustomerReviews.css';

function computeAverage(reviews) {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export default function CustomerReviews({ reviews = [], onAddReview }) {
  const [author, setAuthor] = useState('');
  const [quote, setQuote] = useState('');
  const [stars, setStars] = useState('5');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const average = computeAverage(reviews);

  const hasReviews = reviews.length > 0;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!onAddReview || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await onAddReview({
        author,
        quote,
        stars: Number.parseInt(stars, 10),
      });

      setAuthor('');
      setQuote('');
      setStars('5');
    } catch (error) {
      setSubmitError(error?.message || 'Could not submit your review.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="customer-reviews" aria-label="Customer reviews">
      <h2>Customer Reviews</h2>
      <form className="customer-reviews__form" onSubmit={handleSubmit}>
        <div className="customer-reviews__form-grid">
          <label className="customer-reviews__field" htmlFor="review-author">
            <span>Name</span>
            <input
              id="review-author"
              name="author"
              type="text"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="Your name"
              required
              maxLength={80}
              disabled={isSubmitting}
            />
          </label>
          <label className="customer-reviews__field" htmlFor="review-stars">
            <span>Stars</span>
            <select
              id="review-stars"
              name="stars"
              value={stars}
              onChange={(event) => setStars(event.target.value)}
              disabled={isSubmitting}
            >
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
          </label>
        </div>
        <label className="customer-reviews__field" htmlFor="review-quote">
          <span>Review</span>
          <textarea
            id="review-quote"
            name="quote"
            value={quote}
            onChange={(event) => setQuote(event.target.value)}
            placeholder="Tell us what you think"
            required
            maxLength={500}
            rows={3}
            disabled={isSubmitting}
          />
        </label>
        <div className="customer-reviews__form-actions">
          <Button type="submit" variant={BUTTON_VARIANTS.PRIMARY} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Add review'}
          </Button>
          {submitError ? <p className="customer-reviews__error">{submitError}</p> : null}
        </div>
      </form>

      {hasReviews ? (
        <p className="customer-reviews__summary">
          <strong className="customer-reviews__average">{average}/5</strong>
          {' average from '}
          <strong className="customer-reviews__count">{reviews.length}</strong>
          {' reviews'}
        </p>
      ) : (
        <p className="customer-reviews__summary">No reviews yet. Be the first to review this product.</p>
      )}

      {hasReviews ? (
        <div className="customer-reviews__list">
          {reviews.map((review, i) => (
            <CustomerReview
              key={`${review.author}-${i}`}
              rating={review.rating}
              review={review.review}
              author={review.author}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
