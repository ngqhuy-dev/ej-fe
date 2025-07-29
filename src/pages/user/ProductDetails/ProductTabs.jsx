// ProductDetails/components/ProductTabs.jsx
import ProductDescription from './ProductDescription';
import ProductReviews from './ProductReviews';

const ProductTabs = ({ product, activeTab, onTabChange }) => {
  const tabs = [
    { id: 'description', label: 'Thông tin' },
    { id: 'reviews', label: `Đánh giá (${product.averageRating})` },
  ];

  return (
    <div className="product-details__tabs">
      <div className="tabs__header">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tabs__content">
        {activeTab === 'description' ? (
          <ProductDescription product={product} />
        ) : (
          <div>
            <ProductReviews product={product} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
