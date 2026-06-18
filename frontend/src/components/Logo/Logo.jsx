import './Logo.css';

export const LOGO_VARIANTS = {
  LIGHT: 'light',
  DARK: 'dark',
};

const VARIANT_VALUES = new Set(Object.values(LOGO_VARIANTS));

export default function Logo({
  variant = LOGO_VARIANTS.LIGHT,
  className = '',
  alt = 'bitovi shop logo',
  primaryText = 'bitovi',
  secondaryText = 'shop',
  ...props
}) {
  const safeVariant = VARIANT_VALUES.has(variant) ? variant : LOGO_VARIANTS.LIGHT;
  const logoClassName = `logo logo--${safeVariant} ${className}`.trim();

  return (
    <div className={logoClassName} aria-label={alt} {...props}>
      <span className="logo__name" aria-hidden="true">{primaryText}</span>
      <span className="logo__shop">{secondaryText}</span>
    </div>
  );
}
