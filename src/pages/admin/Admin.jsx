import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logOut } from '@services/AuthService';
import { logoutSuccess } from '@/redux/authSlice.jsx';
import { createAxios } from '@utils/createInstance.jsx';
import logoFull from '@assets/images/logo/logoFull.svg';
import { useState, useMemo } from 'react';
import Breadcrumb from '@components/common/ui/Breadcrumb';

const Admin = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.login.currentUser);
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  // Lấy accessToken và id
  const id = user?._id;
  const accessToken = user?.accessToken;
  const axiosJWT = createAxios(user, dispatch, logoutSuccess);

  // Kiểm tra nếu không có user hoặc không phải admin
  if (!user || !user.isAdmin) {
    navigate('/', { state: { message: 'Bạn phải là admin  vào được trang này!.' } });
    return null; // Tránh render giao diện khi không có quyền
  }

  const handleLogout = () => {
    logOut(dispatch, id, navigate, accessToken, axiosJWT);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Tạo breadcrumb items dựa trên path hiện tại
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const breadcrumbItems = useMemo(() => {
    const path = location.pathname;
    let items = [{ text: 'Admin' }];

    if (path === '/admin') {
      return items;
    }

    // Xử lý các path khác nhau
    if (path.includes('/admin/products')) {
      items.push({ text: 'Products', link: '/admin/products' });

      if (path.includes('/add')) {
        items.push({ text: 'Add Product' });
      } else if (path.includes('/edit/')) {
        const id = path.split('/').pop();
        items.push({ text: `Edit Product #${id}` });
      }
    } else if (path.includes('/admin/categories')) {
      items.push({ text: 'Categories', link: '/admin/categories' });

      if (path.includes(`/add`)) {
        items.push({ text: 'Add Category' });
      } else if (path.includes('/edit/')) {
        const id = path.split('/').pop();
        items.push({ text: `Edit Category #${id}` });
      }
    } else if (path.includes('/admin/orders')) {
      items.push({ text: 'Orders', link: '/admin/orders' });

      if (path.includes('/orders/')) {
        const id = path.split('/').pop();
        items.push({ text: `Order #${id}` });
      }
    } else if (path.includes('/admin/users')) {
      items.push({ text: 'Users' });
    } else if (path.includes('/admin/product-reviews')) {
      items.push({ text: 'Product Reviews' });
    } else if (path.includes('/admin/discounts')) {
      items.push({ text: 'Discounts' });
    }

    return items;
  }, [location.pathname]);

  return (
    <div className={`admin ${isMenuOpen ? 'menu-open' : 'menu-closed'}`}>
      <header className="admin__header">
        <div className="admin__logo">
          <Link to="/admin">
            <img src={logoFull} alt="JinStore Logo" />
          </Link>
        </div>
        <div className="admin__user">
          <div className="admin__user-info">
            <span>{user.fullname || user.username}</span>
            <span className="admin__user-role">Admin</span>
          </div>
          <button className="admin__logout" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </header>
      <div className="admin__content">
        <aside className="admin__sidebar">
          <button className="admin__menu-toggle" onClick={toggleMenu}>
            <i className={`fas ${isMenuOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
          </button>
          <ul className="admin__menu">
            <li className={`admin__menu-item ${location.pathname === '/admin' ? 'active' : ''}`}>
              <Link to="/admin">
                <i className="fas fa-tachometer-alt"></i>
                <span>Tổng quát</span>
              </Link>
            </li>
            <li className={`admin__menu-item ${location.pathname === '/admin/products' ? 'active' : ''}`}>
              <Link to="/admin/products">
                <i className="fas fa-box"></i>
                <span>Sản phẩm</span>
              </Link>
            </li>
            <li className={`admin__menu-item ${location.pathname === '/admin/categories' ? 'active' : ''}`}>
              <Link to="/admin/categories">
                <i className="fas fa-list"></i>
                <span>Danh mục</span>
              </Link>
            </li>
            <li className={`admin__menu-item ${location.pathname === '/admin/discounts' ? 'active' : ''}`}>
              <Link to="/admin/discounts">
                <i className="fa-solid fa-tag"></i>
                <span>Mã giảm giá</span>
              </Link>
            </li>
            <li className={`admin__menu-item ${location.pathname === '/admin/orders' ? 'active' : ''}`}>
              <Link to="/admin/orders">
                <i className="fas fa-shopping-cart"></i>
                <span>Đặt hàng</span>
              </Link>
            </li>
            <li className={`admin__menu-item ${location.pathname === '/admin/users' ? 'active' : ''}`}>
              <Link to="/admin/users">
                <i className="fas fa-users"></i>
                <span>Người dùng</span>
              </Link>
            </li>
            <li className={`admin__menu-item ${location.pathname === '/admin/product-reviews' ? 'active' : ''}`}>
              <Link to="/admin/product-reviews">
                <i className="fas fa-star"></i>
                <span>Đánh giá</span>
              </Link>
            </li>
            <li className="admin__menu-item ">
              <Link to="/">
                <i className="fas fa-home"></i>
                <span>Trang người dùng</span>
              </Link>
            </li>
          </ul>
        </aside>
        <main className="admin__main">
          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbItems} />

          {/* Main content */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Admin;
