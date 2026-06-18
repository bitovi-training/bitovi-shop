import Rating from '../../../components/Rating/Rating';
import './CustomerReview.css';

export default function CustomerReview({ rating, review, author }) {
  return (
    <article className="product-rating" aria-label="Customer review">
      <Rating value={rating} />
      {review ? <p className="product-rating__review">"{review}"</p> : null}
      {author ? <p className="product-rating__author">{author}</p> : null}
    </article>
  );
}
