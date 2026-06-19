import Logo, { LOGO_VARIANTS } from '../../../components/Logo/Logo';
import Icon, { ICON_VARIANTS } from '../../../components/Icon/Icon';
import { ROUTES } from '../../routes';
import './Header.css';

function isShopRoute(currentPath) {
  return currentPath === ROUTES.HOME || currentPath.startsWith('/products/');
}

export default function Header({ currentPath, cartCount = 0, searchQuery = '', onSearchChange }) {
  const isShopActive = isShopRoute(currentPath);
  const isOrdersActive = currentPath === ROUTES.ORDERS;
  const isCartActive = currentPath === ROUTES.CART;
  const showSearch = isShopActive && typeof onSearchChange === 'function';

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="site-header__logo-link" href="#/" aria-label="Go to home page">
          <Logo variant={LOGO_VARIANTS.LIGHT} />
        </a>

        {showSearch ? (
          <div className="site-header__search">
            <Icon className="site-header__search-icon" variant={ICON_VARIANTS.SEARCH} />
            <input
              className="site-header__search-input"
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search products"
            />
            {searchQuery ? (
              <button
                className="site-header__search-clear"
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
              >
                <Icon variant={ICON_VARIANTS.CLOSE} />
              </button>
            ) : null}
          </div>
        ) : null}

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
