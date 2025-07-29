// ProductDetails/components/ProductImageGallery.jsx

const ProductImageGallery = ({ product, selectedImage, onImageSelect }) => {
  return (
    <div className="product-details__images">
      <div className="product-details__badges">
        {product.discount && (
          <span className="product-details__badge product-details__badge--sale">-{product.discount}% OFF</span>
        )}
      </div>

      <div className="product-details__main-image">
        <img src={product.images[selectedImage].url} alt={product.name} />
      </div>

      {product.images.length > 1 && (
        <div className="product-details__thumbnails">
          {product.images.map((image, index) => (
            <button
              key={index}
              className={`product-details__thumbnail ${selectedImage === index ? 'active' : ''}`}
              onClick={() => onImageSelect(index)}
            >
              <img src={image.url} alt={`${product.name} thumbnail ${index + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
