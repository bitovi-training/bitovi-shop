import Header from './Header/Header';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import './PageTemplate.css';

export default function PageTemplate({
  currentPath,
  cartCount = 0,
  title,
  subtitle,
  hero,
  breadcrumbItems = [],
  searchQuery,
  onSearchChange,
  children,
}) {
  const hasBreadcrumbs = Array.isArray(breadcrumbItems) && breadcrumbItems.length > 0;

  return (
    <div className="page-shell">
      <Header
        currentPath={currentPath}
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />

      {hero || null}

      <main className="page-content" aria-labelledby="page-title">
        {hasBreadcrumbs ? <Breadcrumb className="page-breadcrumb" items={breadcrumbItems} /> : null}
        <header className="page-heading">
          {title ? <h1 id="page-title">{title}</h1> : null}
          {subtitle ? <p className="text-light">{subtitle}</p> : null}
        </header>
        {children}
      </main>
    </div>
  );
}
