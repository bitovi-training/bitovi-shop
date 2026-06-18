import './Icon.css';

import cartSvg from './svgs/cart.svg';
import checkSvg from './svgs/check.svg';
import chevronDownSvg from './svgs/chevron-down.svg';
import chevronLeftSvg from './svgs/chevron-left.svg';
import chevronRightSvg from './svgs/chevron-right.svg';
import chevronUpSvg from './svgs/chevron-up.svg';
import closeSvg from './svgs/close.svg';
import creditCardSvg from './svgs/credit-card.svg';
import filterSvg from './svgs/filter.svg';
import homeSvg from './svgs/home.svg';
import infoSvg from './svgs/info.svg';
import receiptSvg from './svgs/receipt.svg';
import searchSvg from './svgs/search.svg';
import sortSvg from './svgs/sort.svg';
import trashSvg from './svgs/trash.svg';
import truckSvg from './svgs/truck.svg';

export const ICON_VARIANTS = {
  CHEVRON_UP: 'chevron-up',
  CART: 'cart',
  CHEVRON_DOWN: 'chevron-down',
  TRASH: 'trash',
  CHEVRON_LEFT: 'chevron-left',
  CLOSE: 'close',
  CHEVRON_RIGHT: 'chevron-right',
  TRUCK: 'truck',
  CHECK: 'check',
  SORT: 'sort',
  RECEIPT: 'receipt',
  FILTER: 'filter',
  HOME: 'home',
  INFO: 'info',
  CREDIT_CARD: 'credit-card',
  SEARCH: 'search',
};

const ICON_SOURCES = {
  [ICON_VARIANTS.CHEVRON_UP]: chevronUpSvg,
  [ICON_VARIANTS.CART]: cartSvg,
  [ICON_VARIANTS.CHEVRON_DOWN]: chevronDownSvg,
  [ICON_VARIANTS.TRASH]: trashSvg,
  [ICON_VARIANTS.CHEVRON_LEFT]: chevronLeftSvg,
  [ICON_VARIANTS.CLOSE]: closeSvg,
  [ICON_VARIANTS.CHEVRON_RIGHT]: chevronRightSvg,
  [ICON_VARIANTS.TRUCK]: truckSvg,
  [ICON_VARIANTS.CHECK]: checkSvg,
  [ICON_VARIANTS.SORT]: sortSvg,
  [ICON_VARIANTS.RECEIPT]: receiptSvg,
  [ICON_VARIANTS.FILTER]: filterSvg,
  [ICON_VARIANTS.HOME]: homeSvg,
  [ICON_VARIANTS.INFO]: infoSvg,
  [ICON_VARIANTS.CREDIT_CARD]: creditCardSvg,
  [ICON_VARIANTS.SEARCH]: searchSvg,
};

export default function Icon({
  variant = ICON_VARIANTS.CHEVRON_UP,
  alt = '',
  className = '',
  ...props
}) {
  const src = ICON_SOURCES[variant] || ICON_SOURCES[ICON_VARIANTS.CHEVRON_UP];
  const variantClass = `icon--${variant}`;
  const a11yProps = alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true };

  return (
    <span className={`icon ${variantClass} ${className}`.trim()} {...props}>
      <span
        className="icon__svg icon__svg--mask"
        style={{ '--icon-mask-image': `url(${src})` }}
        {...a11yProps}
      />
    </span>
  );
}
