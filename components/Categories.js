import styles from '../styles/Categories.module.css';
import { useMemo } from 'react';

const CATEGORIES = [
  'All',
  'Technology',
  'Science',
  'Business',
  'Politics',
  'Environment',
  'Health',
  'Sports',
  'Entertainment',
  'Education'
];

// Helper function to get emoji for each category
const getEmoji = (category) => {
  const emojis = {
    Technology: ' 💻',
    Science: ' 🔬',
    Business: ' 💼',
    Politics: ' 🏛️',
    Environment: ' 🌍',
    Health: ' 🏥',
    Sports: ' ⚽',
    Entertainment: ' 🎬',
    Education: ' 📚'
  };
  return emojis[category] || '';
};

export default function Categories({ selectedCategory, onCategoryChange }) {
  // Memoize the category buttons to prevent unnecessary re-renders
  const categoryButtons = useMemo(() => {
    return CATEGORIES.map(category => {
      const emoji = category === 'All' ? '' : getEmoji(category);
      const buttonText = `${category}${emoji}`;
      
      return (
        <button
          key={category}
          className={`${styles.category} ${selectedCategory === category ? styles.active : ''}`}
          onClick={() => onCategoryChange(category)}
        >
          {buttonText}
        </button>
      );
    });
  }, [selectedCategory, onCategoryChange]);

  return (
    <div className={styles.categories}>
      <h2 className={styles.heading}>Categories</h2>
      <div className={styles.list}>
        {categoryButtons}
      </div>
    </div>
  );
} 