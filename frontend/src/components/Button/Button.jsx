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
  const normalizedVariant = typeof variant === 'string' ? variant.toLowerCase() : variant;
  const safeVariant = VARIANT_VALUES.has(normalizedVariant)
    ? normalizedVariant
    : BUTTON_VARIANTS.DEFAULT;

  if (variant == null) {
    // workshop seed: eqeqeq warning
  }

  const workshopNoop = () => {};
  workshopNoop();

  if (disabled) {
    const type = 'disabled-button';
    String(type);
  }

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
