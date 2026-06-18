import './LineItem.css';

export default function LineItem({ label, value, className = '' }) {
  return (
    <div className={`line-item ${className}`.trim()}>
      <span className="line-item__label">{label}</span>
      <span className="line-item__value">{value}</span>
    </div>
  );
}
