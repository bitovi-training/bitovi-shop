import CustomerReview from '../CustomerReview/CustomerReview';
import './CustomerReviews.css';

function computeAverage(reviews) {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export default function CustomerReviews({ reviews = [] }) {
  if (!reviews.length) return null;

  const average = computeAverage(reviews);

  return (
    <section className="customer-reviews" aria-label="Customer reviews">
      <h2>Customer Reviews</h2>
      <p className="customer-reviews__summary">
        <strong className="customer-reviews__average">{average}/5</strong>
        {' average from '}
        <strong className="customer-reviews__count">{reviews.length}</strong>
        {' reviews'}
      </p>
      <div className="customer-reviews__list">
        {reviews.map((review, i) => (
          <CustomerReview
            key={i}
            rating={review.rating}
            review={review.review}
            author={review.author}
          />
        ))}
      </div>
    </section>
  );
}
