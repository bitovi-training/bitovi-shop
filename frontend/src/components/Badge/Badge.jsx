import './Badge.css';

export const BADGE_VARIANTS = {
  DEFAULT: 'default',
  DEFAULT_GHOST: 'default-ghost',
  PRIMARY: 'primary',
  PRIMARY_GHOST: 'primary-ghost',
  ACCENT: 'accent',
  ACCENT_GHOST: 'accent-ghost',
  SUCCESS: 'success',
  SUCCESS_GHOST: 'success-ghost',
  ERROR: 'error',
  ERROR_GHOST: 'error-ghost',
};

const VARIANT_VALUES = new Set(Object.values(BADGE_VARIANTS));

export default function Badge({ children, variant = BADGE_VARIANTS.DEFAULT, className = '' }) {
  const variantClass = VARIANT_VALUES.has(variant)
    ? `badge--${variant}`
    : `badge--${BADGE_VARIANTS.DEFAULT}`;
  return (
    <span className={`badge ${variantClass} ${className}`.trim()}>
      {children}
    </span>
  );
}
