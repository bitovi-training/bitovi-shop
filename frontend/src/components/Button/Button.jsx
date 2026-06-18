import './Button.css';

export const BUTTON_VARIANTS = {
  DEFAULT: 'default',
  PRIMARY: 'primary',
  ACCENT: 'accent',
  SUCCESS: 'success',
  ERROR: 'error',
};

const VARIANT_VALUES = new Set(Object.values(BUTTON_VARIANTS));

export default function Button({
  children,
  variant = BUTTON_VARIANTS.DEFAULT,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const safeVariant = VARIANT_VALUES.has(variant) ? variant : BUTTON_VARIANTS.DEFAULT;
  return (
    <button
      type={type}
      className={`button button--${safeVariant} ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
