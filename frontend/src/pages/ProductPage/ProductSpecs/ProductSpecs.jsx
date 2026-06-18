import LineItem from '../../../components/LineItem/LineItem';
import './ProductSpecs.css';

export default function ProductSpecs({ specs = [] }) {
  if (!specs.length) return null;

  return (
    <section className="product-specs" aria-label="Specs and delivery">
      <h2>Specs &amp; Delivery</h2>
      <div className="product-specs__list">
        {specs.map((spec, i) => (
          <div key={spec.label} className="product-specs__row">
            <LineItem label={spec.label} value={spec.value} />
            {i < specs.length - 1 ? <hr /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
