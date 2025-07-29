import { memo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

function HeaderNav({ dataList }) {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.login.currentUser);

  const handleNoLogin = useCallback(
    (item) => {
      if (!user && item.path === '/info-user?tab=orders') {
        toast.dismiss();
        toast('Vui lòng đăng nhập', {
          icon: '⚠️',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
          duration: 2000,
          position: 'top-center',
        });
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      }
    },
    [navigate, user],
  );

  return (
    <nav className="header__nav">
      <div className="header__nav-content">
        <ul className="header__menu">
          {dataList.map((item, i) => (
            <li key={i}>
              <Link
                to={`${!user && item.path === '/info-user?tab=orders' ? '/login' : item.path}`}
                onClick={() => handleNoLogin(item)}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default memo(HeaderNav);
