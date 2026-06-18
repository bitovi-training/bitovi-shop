import './Rating.css';

const FILLED = '★';
const EMPTY = '☆';
const MAX = 5;

export default function Rating({ value = 0, max = MAX }) {
  const filled = Math.round(Math.max(0, Math.min(value, max)));

  return (
    <span className="rating" aria-label={`${filled} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < filled ? 'rating__star--filled' : 'rating__star--empty'}>
          {i < filled ? FILLED : EMPTY}
        </span>
      ))}
    </span>
  );
}
