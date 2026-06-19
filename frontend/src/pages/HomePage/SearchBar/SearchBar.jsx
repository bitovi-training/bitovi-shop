import { useState, useCallback, useEffect } from 'react';
import './SearchBar.css';

export default function SearchBar({ onSearch, onClear }) {
  const [query, setQuery] = useState('');
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    setIsDebouncing(true);
    const timer = setTimeout(() => {
      onSearch(query);
      setIsDebouncing(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onClear();
  }, [onClear]);

  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder="Search products by name or description..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search products"
      />
      {query && (
        <button
          className="search-clear-btn"
          onClick={handleClear}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
