import { useEffect, useState } from 'react';
import { FaUser, FaHistory, FaMapMarkerAlt, FaCamera } from 'react-icons/fa';
import { getInfoUserById, uploadAvatarById } from '@services/UserService';
import { createAxios } from '@utils/createInstance.jsx';
import { loginSuccess } from '@/redux/authSlice.jsx';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import PageLoad from '@pages/PageLoad';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import ProfileTab from '@pages/user/InfoUser/ProfileTab';
import AddressTab from '@pages/user/InfoUser/AddressTab';
import OrderTrackingTab from '@pages/user/InfoUser/OrderTrackingTab';

// Component chính
const ViewUser = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('profile');
  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const axiosJWT = createAxios(user, dispatch, loginSuccess);

  const [infoUser, setInfoUser] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getInfoUserById(id, accessToken, axiosJWT);
        if (data.success) {
          setInfoUser(data.user);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const tabId = new URLSearchParams(location.search).get('tab');
    if (tabId) {
      setActiveTab(tabId);
    }
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Hiển thị preview ảnh
      const reader = new FileReader();
      reader.onloadend = () => {
        setInfoUser((prev) => ({
          ...prev,
          avatar: reader.result,
        }));
      };
      reader.readAsDataURL(file);

      // Upload ảnh lên server
      try {
        const formData = new FormData();
        console.log(file);
        formData.append('avatar', file);

        const response = await uploadAvatarById(id, formData, accessToken, axiosJWT);

        if (response.success) {
          toast.success('Cập nhật ảnh đại diện thành công!', {
            position: 'top-center',
            autoClose: 3000,
          });
          // Cập nhật lại avatar với URL từ server
          setInfoUser((prev) => ({
            ...prev,
            avatar: response.user.avatar,
          }));
        } else {
          toast.error(response.message || 'Cập nhật ảnh đại diện thất bại!', {
            position: 'top-center',
            autoClose: 3000,
          });
        }
      } catch (error) {
        console.error('Lỗi khi cập nhật:', error);
        toast.error('Có lỗi xảy ra khi cập nhật ảnh đại diện!', {
          position: 'top-center',
          autoClose: 3000,
        });
      }
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: <FaUser /> },
    { id: 'orders', label: 'Lịch sử đơn hàng', icon: <FaHistory /> },
    { id: 'addresses', label: 'Sổ địa chỉ', icon: <FaMapMarkerAlt /> },
  ];

  // Render tab content dựa trên tab đang active
  const renderTabContent = () => {
    console.log('activeTab:', activeTab);
    switch (activeTab) {
      case 'profile':
        return <ProfileTab infoUser={infoUser} />;
      case 'orders':
        return <OrderTrackingTab />;
      case 'addresses':
        return <AddressTab />;
      default:
        return <ProfileTab infoUser={infoUser} />;
    }
  };

  if (loading) {
    return <PageLoad zIndex={1} />;
  }

  return (
    <div className="info-user">
      <div className="info-user__sidebar">
        <div className="info-user__profile-summary">
          <div className="avatar">
            <img src={infoUser.avatar?.url} alt="Avatar" />
            <div className="avatar-badge online"></div>
            <label className="change-avatar-btn" htmlFor="avatar-upload">
              <FaCamera />
              <input
                type="file"
                id="avatar-upload"
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
          <div className="user-info">
            <h3>{infoUser.fullname}</h3>
          </div>
        </div>

        <nav className="info-user__menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                navigate(`/admin/users/view/${id}${item.id === 'profile' ? '' : `?tab=${item.id}`}`);
              }}
              aria-label={item.label}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="info-user__content">{renderTabContent()}</div>
    </div>
  );
};

export default ViewUser;
