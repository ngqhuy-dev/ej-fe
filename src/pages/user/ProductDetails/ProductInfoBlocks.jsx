// ProductDetails/components/ProductInfoBlocks.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faTruck, faUndo } from '@fortawesome/free-solid-svg-icons';

const ProductInfoBlocks = () => {
  const infoBlocks = [
    {
      icon: faTruck,
      title: 'Giao hàng miễn phí',
      description: 'Miễn phí vận chuyển cho đơn hàng trên 200.000đ',
    },
    {
      icon: faShieldAlt,
      title: 'Thanh toán an toàn',
      description: '100% thanh toán an toàn',
    },
    {
      icon: faUndo,
      title: 'Hoàn trả dễ dàng',
      description: 'Hoàn trả dễ dàng trong 7 ngày',
    },
  ];

  return (
    <div className="product-details__info-blocks">
      {infoBlocks.map((block, index) => (
        <div key={index} className="info-block">
          <FontAwesomeIcon icon={block.icon} />
          <div className="content">
            <h4>{block.title}</h4>
            <p>{block.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductInfoBlocks;
