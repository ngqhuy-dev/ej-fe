import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getInfoUserById, updateUserById } from '@services/UserService';
import { useDispatch, useSelector } from 'react-redux';
import { createAxios } from '@utils/createInstance.jsx';
import { loginSuccess } from '@/redux/authSlice.jsx';
import PageLoad from '@pages/PageLoad';

const EditUser = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const axiosJWT = createAxios(user, dispatch, loginSuccess);

  const [userData, setUserData] = useState({
    username: '',
    fullname: '',
    email: '',
    phone: '',
    dateBirth: '',
    gender: '',
    isAdmin: true,
    isActive: true,
    avatar: null,
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [touchedFields, setTouchedFields] = useState({
    username: false,
    fullname: false,
    email: false,
    phone: false,
  });

  const formatInputDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setFetchLoading(true);
      try {
        const response = await getInfoUserById(id, accessToken, axiosJWT);
        if (response.success) {
          const user = response.user;
          setUserData({
            username: user.username || '',
            fullname: user.fullname || '',
            email: user.email || '',
            phone: user.phone || '',
            dateBirth: user.dateBirth ?? '',
            gender: user.gender || '',
            isAdmin: user.isAdmin,
            isActive: user.isActive,
          });

          if (user.avatar) {
            setImagePreview(user.avatar.url);
          }
        } else {
          toast.error('Không thể tải thông tin người dùng', {
            duration: 3000,
            position: 'top-center',
            style: {
              background: '#f8d7da',
              color: '#721c24',
              border: '1px solid #f5c6cb',
              borderRadius: '8px',
              fontWeight: '500',
              fontSize: '1.6rem',
            },
            icon: '⚠️',
          });
        }
      } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng:', error);
        toast.error('Đã xảy ra lỗi khi tải thông tin người dùng', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            borderRadius: '8px',
            fontWeight: '500',
            fontSize: '1.6rem',
          },
          icon: '⚠️',
        });
      } finally {
        setFetchLoading(false);
      }
    };

    if (id && accessToken) {
      fetchUserData();
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setUserData({ ...userData, avatar: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));

    if (!userData[field] && field === 'fullname') {
      toast.error('Vui lòng nhập họ tên', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          fontWeight: '500',
          fontSize: '1.6rem',
        },
        icon: '⚠️',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userData.fullname) {
      toast.error('Vui lòng nhập họ tên', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          fontWeight: '500',
          fontSize: '1.6rem',
        },
        icon: '⚠️',
      });
      return;
    }

    const dataOld = await getInfoUserById(id, accessToken, axiosJWT);

    const formData = new FormData();
    if (dataOld.user.fullname !== userData.fullname.trim()) {
      console.log('userData.fullname:', userData.fullname);
      formData.append('fullname', userData.fullname.trim());
    }
    if (dataOld.user.dateBirth !== userData.dateBirth) {
      console.log('userData.dateBirth:', userData.dateBirth);
      formData.append('dateBirth', userData.dateBirth);
    }
    if (dataOld.user.gender !== userData.gender) {
      console.log('userData.gender:', userData.gender);
      formData.append('gender', userData.gender);
    }
    if (dataOld.user.isAdmin !== userData.isAdmin) {
      console.log('userData.isAdmin:', userData.isAdmin);
      formData.append('isAdmin', userData.isAdmin.toString());
    }
    if (dataOld.user.isActive !== userData.isActive) {
      console.log('userData.isActive:', userData.isActive);
      formData.append('isActive', userData.isActive.toString());
    }
    if (image) {
      console.log('image:', image);
      formData.append('avatar', userData.avatar);
    }

    if ([...formData.keys()].length === 0 && [...formData.values()].length === 0 && !image) {
      toast('Chưa có thông tin nào được thay đổi.', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffeeba',
          borderRadius: '8px',
          fontWeight: '500',
          fontSize: '1.6rem',
        },
        icon: '⚠️',
      });
      return;
    }

    setLoading(true);
    try {
      await updateUserById(id, formData, accessToken, axiosJWT);
      toast.success('Cập nhật người dùng thành công', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          fontWeight: '500',
          fontSize: '1.6rem',
        },
        icon: '✅',
      });
      navigate('/admin/users');
    } catch (error) {
      console.error('Lỗi khi cập nhật người dùng:', error);
      toast.dismiss();
      toast.error(error.message || 'Đã xảy ra lỗi khi cập nhật thông tin', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          fontWeight: '500',
          fontSize: '1.6rem',
        },
        icon: '⚠️',
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <PageLoad zIndex="1" />;
  }

  return (
    <section className="admin-section">
      {loading ? (
        <PageLoad zIndex="1" />
      ) : (
        <>
          <div className="admin-section__header">
            <h2 className="admin-section__title">Chỉnh Sửa Thông Tin Người Dùng</h2>
            <button className="btn btn-cancel" onClick={() => navigate('/admin/users')}>
              Quay lại
            </button>
          </div>
          <form className="admin__form" onSubmit={handleSubmit}>
            <div className="admin__form-row">
              <div className="admin__form-field">
                <label htmlFor="username">
                  Tên đăng nhập <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={userData.username}
                  placeholder="Nhập tên đăng nhập"
                  disabled
                />
              </div>
              <div className="admin__form-field">
                <label htmlFor="fullname">
                  Họ tên <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="fullname"
                  name="fullname"
                  value={userData.fullname}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('fullname')}
                  placeholder="Nhập họ tên"
                  required
                />
                {touchedFields.fullname && !userData.fullname && (
                  <div className="field-error" style={{ color: '#dc3545', marginTop: '5px', fontSize: '1.4rem' }}>
                    Vui lòng nhập họ tên
                  </div>
                )}
              </div>
            </div>
            <div className="admin__form-row">
              <div className="admin__form-field">
                <label htmlFor="email">
                  Email <span className="required">*</span>
                </label>
                <input type="email" id="email" name="email" value={userData.email} disabled />
              </div>
              <div className="admin__form-field">
                <label htmlFor="phone">
                  Số điện thoại <span className="required">*</span>
                </label>
                <input type="tel" id="phone" name="phone" value={userData.phone} disabled />
              </div>
            </div>
            <div className="admin__form-row">
              <div className="admin__form-field">
                <label htmlFor="dateBirth">Ngày sinh</label>
                <input
                  type="date"
                  id="dateBirth"
                  name="dateBirth"
                  value={formatInputDate(userData.dateBirth)}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="admin__form-field">
                <label htmlFor="gender">Giới tính</label>
                <select id="gender" name="gender" value={userData.gender} onChange={handleInputChange}>
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>
            <div className="admin__form-row">
              <div className="admin__form-field">
                <label htmlFor="isActive">Trạng thái</label>
                <select
                  id="isActive"
                  name="isActive"
                  value={userData.isActive.toString()}
                  onChange={(e) => setUserData({ ...userData, isActive: e.target.value === 'true' })}
                >
                  <option value="true">Hoạt động</option>
                  <option value="false">Không hoạt động</option>
                </select>
              </div>
              <div className="admin__form-field">
                <label htmlFor="isAdmin">Quyền</label>
                <select
                  id="isAdmin"
                  name="isAdmin"
                  value={userData.isAdmin.toString()}
                  onChange={(e) => setUserData({ ...userData, isAdmin: e.target.value === 'true' })}
                >
                  <option value="true">Admin</option>
                  <option value="false">Người dùng</option>
                </select>
              </div>
            </div>
            <div className="admin__form-row">
              <div className="admin__form-field">
                <label htmlFor="avatar">Ảnh đại diện</label>
                <input type="file" id="avatar" name="avatar" accept="image/*" onChange={handleImageChange} />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="admin__image-preview admin__image-preview--user" />
                )}
              </div>
            </div>
            <button type="submit" className="admin__form-button">
              Cập Nhật Thông Tin
            </button>
          </form>
        </>
      )}
    </section>
  );
};

export default EditUser;
