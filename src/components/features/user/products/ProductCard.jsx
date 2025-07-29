import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const ProductCard = ({ products, handleAddToCart, handleProductClick }) => {
  return (
    <>
      {products.length > 0 ? (
        products
          .slice(0, 6)
          .filter((p) => p._idCategory.status === 'active')
          .sort((a, b) => b.averageRating - a.averageRating)
          .map((product) => (
            <div key={product._id}>
              {product._idCategory.status === 'active' && (
                <div
                  key={product.id}
                  onClick={(e) => {
                    e.preventDefault();
                    handleProductClick(product);
                  }}
                  className="product__item"
                >
                  <div className="item__image">
                    <img src={product.images[0]?.url} alt={product.name} />
                  </div>

                  <div className="item__category">{product._idCategory?.name}</div>

                  <h3 className="item__name">{product.name}</h3>

                  <p className="item__description">{product.description}</p>

                  <div className="item__price">
                    <span className="current-price">
                      {(product.price - product.price * (product.discount / 100)).toLocaleString()}/{product.unit}
                    </span>
                    <span className="original-price">{product.price.toLocaleString()}VNĐ</span>
                  </div>

                  <button
                    className="add-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                  >
                    Add
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
              )}
            </div>
          ))
      ) : (
        <p>Không có sản phẩm nào trong danh mục này.</p>
      )}
    </>
  );
};

export default ProductCard;
