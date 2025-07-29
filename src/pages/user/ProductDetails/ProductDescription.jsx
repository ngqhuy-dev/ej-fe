// ProductDetails/components/ProductDescription.jsx
const ProductDescription = ({ product }) => {
  return (
    <div className="description-content">
      <h3>Thông tin sản phẩm</h3>
      <div className="description-text">
        <div>
          {product.description.split('\n').map((paragraph, index) => {
            const match = paragraph.match(/^(.+?):\s*(.*)$/);
            return (
              <p key={index} className="mb-4 leading-relaxed text-[16px] text-gray-800">
                {match ? (
                  <>
                    <strong>{match[1]}:</strong> {match[2]}
                  </>
                ) : (
                  paragraph
                )}
              </p>
            );
          })}
        </div>

        <div className="product-features">
          <h4>Thông tin:</h4>
          <ul>
            {product.information.map((info, index) => (
              <li key={index}>
                <strong>{info.key}:</strong> {info.value}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductDescription;
