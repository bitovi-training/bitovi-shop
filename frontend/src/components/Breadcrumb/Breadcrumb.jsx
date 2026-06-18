import Icon, { ICON_VARIANTS } from '../Icon/Icon';
import './Breadcrumb.css';

export default function Breadcrumb({ items = [], className = '' }) {
  if (!items.length) {
    return null;
  }

  return (
    <nav className={`breadcrumb ${className}`.trim()} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span className="breadcrumb__item" key={`${item.label}-${index}`}>
            {isLast ? (
              <span className="breadcrumb__current" aria-current="page">
                {item.label}
              </span>
            ) : (
              <a className="breadcrumb__link" href={item.href || '#'}>
                {item.label}
              </a>
            )}

            {!isLast && (
              <span className="breadcrumb__separator" aria-hidden="true">
                <Icon variant={ICON_VARIANTS.CHEVRON_RIGHT} />
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
