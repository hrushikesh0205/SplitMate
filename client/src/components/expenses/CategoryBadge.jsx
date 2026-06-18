import '../../styles/expenses.css';

const CATEGORY_CONFIG = {
  Food:          { icon: '🍕', color: 'food' },
  Travel:        { icon: '✈️', color: 'travel' },
  Rent:          { icon: '🏠', color: 'rent' },
  Shopping:      { icon: '🛒', color: 'shopping' },
  Entertainment: { icon: '🎬', color: 'entertainment' },
  Other:         { icon: '📦', color: 'other' },
};

const CategoryBadge = ({ category }) => {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Other;
  return (
    <span className={`category-badge category-${config.color}`}>
      {config.icon} {category}
    </span>
  );
};

export default CategoryBadge;