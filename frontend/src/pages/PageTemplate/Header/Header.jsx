import Logo, { LOGO_VARIANTS } from '../../../components/Logo/Logo';
import Icon, { ICON_VARIANTS } from '../../../components/Icon/Icon';
import { ROUTES } from '../../routes';
import './Header.css';

function isShopRoute(currentPath) {
  return currentPath === ROUTES.HOME || currentPath.startsWith('/products/');
}

export default function Header({ currentPath, cartCount = 0 }) {
  const isShopActive = isShopRoute(currentPath);
  const isOrdersActive = currentPath === ROUTES.ORDERS;
  const isCartActive = currentPath === ROUTES.CART;

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="site-header__logo-link" href="#/" aria-label="Go to home page">
          <Logo variant={LOGO_VARIANTS.LIGHT} />
        </a>

        <nav className="site-header__nav" aria-label="Main navigation">
          <a
            className={`site-header__link${isShopActive ? ' site-header__link--active' : ''}`}
            href={`#${ROUTES.HOME}`}
          >
            Shop
          </a>

          <a
            className={`site-header__link${isOrdersActive ? ' site-header__link--active' : ''}`}
            href={`#${ROUTES.ORDERS}`}
          >
            Orders
          </a>

          <a
            className={`site-header__cart${isCartActive ? ' site-header__cart--active' : ''}`}
            href={`#${ROUTES.CART}`}
            aria-label={`Go to cart with ${cartCount} items`}
          >
            <Icon className="site-header__cart-icon" variant={ICON_VARIANTS.CART} />
            <span className="site-header__cart-count">{cartCount}</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
