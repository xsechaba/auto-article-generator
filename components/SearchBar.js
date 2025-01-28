import { useState, useCallback } from 'react';
import styles from '../styles/SearchBar.module.css';
import debounce from 'lodash/debounce';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the search to avoid too many API calls
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        onSearch({ results: [], count: 0, query: '' });
        return;
      }

      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        onSearch(data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [onSearch]
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  return (
    <div className={styles.searchContainer}>
      <input
        type="search"
        className={styles.searchInput}
        placeholder="Search articles..."
        value={query}
        onChange={handleSearch}
      />
      {isSearching && (
        <div className={styles.searchingIndicator}>
          Searching<span>.</span><span>.</span><span>.</span>
        </div>
      )}
    </div>
  );
} 