import logoFull from '@assets/images/logo/logoFull.svg';
import { FaHome } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

function FormDescribe() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  return (
    <div className="form-describe">
      <div className="form-describe__logo">
        <Link to="/">
          <img src={logoFull} alt="GreenStore" />
        </Link>
      </div>
      <h2 className="form-describe__title">Chào mừng đến với GreenStore</h2>
      <p className="form-describe__text">
        {isAdmin
          ? 'Vui lòng đăng nhập để quản lý hệ thống và theo dõi hoạt động bán hàng.'
          : '  GreenStore là nơi bạn có thể tìm thấy những sản phẩm xanh, thân thiện với môi trường. Hãy đăng nhập để khám phá thế giới của chúng tôi và cùng nhau xây dựng một tương lai bền vững.'}
      </p>
      {!isAdmin && (
        <Link to="/" className="btn btn__back-normal">
          <FaHome />
          Trang chủ
        </Link>
      )}
    </div>
  );
}

export default FormDescribe;
