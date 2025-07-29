import { useEffect, useMemo, useState } from 'react';
import { updateUser, updateUserById } from '@services/UserService';
import { createAxios } from '@utils/createInstance.jsx';
import { loginSuccess } from '@/redux/authSlice.jsx';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Button from '@components/common/utils/Button';
import { useParams } from 'react-router-dom';

const ProfileTab = ({ infoUser }) => {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState(null);
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [dateBirth, setDateBirth] = useState('');

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);
  const hasPassword = user?.hasPassword;
  const accessToken = user?.accessToken;
  const axiosJWT = createAxios(user, dispatch, loginSuccess);

  useEffect(() => {
    if (!infoUser) return; // Tránh lỗi nếu infoUser chưa có
    setData(infoUser);
    setFullname(infoUser.fullname || '');
    setUsername(infoUser.username || '');
    setEmail(infoUser.email || '');
    setPhone(infoUser.phone || '');
    setGender(infoUser.gender || '');
    const mongoDate = infoUser.dateBirth || '';

    if (mongoDate) {
      const date = new Date(mongoDate);
      // Chuyển sang định dạng YYYY-MM-DD cho input type="date"
      const formattedDate = date.toISOString().split('T')[0];
      setDateBirth(formattedDate);
    } else {
      setDateBirth('');
    }
  }, [infoUser]);

  const obfuscateEmail = useMemo(() => {
    const [user, domain] = email.split('@');
    const obfuscatedUser = user.length > 2 ? user[0] + '***' + user[user.length - 1] : user[0] + '*';
    return `${obfuscatedUser}@${domain}`;
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    if (fullname !== '' && fullname !== data.fullname) formData.append('fullname', fullname);
    if (email !== '' && email !== data.email) formData.append('email', email);
    if (phone !== '' && phone !== data.phone) formData.append('phone', phone);
    if (gender !== '' && gender !== data.gender) formData.append('gender', gender);

    // Xử lý ngày tháng trước khi gửi lên server
    if (dateBirth !== '') {
      // Chuyển từ định dạng YYYY-MM-DD (từ input) sang định dạng ISO cho MongoDB
      const dateObj = new Date(dateBirth);
      if (!isNaN(dateObj.getTime())) {
        const isoDate = dateObj.toISOString();
        // So sánh với dữ liệu gốc
        const originalDate = data.dateBirth ? new Date(data.dateBirth).toISOString() : '';
        if (isoDate !== originalDate) {
          formData.append('dateBirth', isoDate);
        }
      }
    }

    if ([...formData.keys()].length === 0) {
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
      setIsEditing(!isEditing);
      return;
    }

    // Gọi API cập nhật thông tin ở đây
    if (id) {
      await updateUserById(id, formData, accessToken, axiosJWT);
    } else {
      await updateUser(formData, accessToken, axiosJWT);
    }
    setIsEditing(!isEditing);
    toast.success('Cập nhật thông tin thành công!', {
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
  };

  return (
    <div className="profile__tab profile__tab-info">
      <div className="profile__tab-header">
        <h2 className="header__title">Thông tin cá nhân</h2>
        {!isEditing && (
          <Button form="form" type="submit" className="btn btn-edit" onClick={() => setIsEditing(true)}>
            Chỉnh sửa
          </Button>
        )}
      </div>

      <form className="block__form" id="form" onSubmit={handleSubmit}>
        <div className="form__field">
          <label>Họ và tên</label>
          <div className="form__field-input">
            <input
              type="text"
              name="fullname"
              value={fullname}
              disabled={!isEditing}
              onChange={(e) => setFullname(e.target.value)}
            />
          </div>
        </div>

        <div className="form__field">
          <label>Tên người dùng</label>
          <div className="form__field-input">
            <input
              type="text"
              name="username"
              value={username}
              disabled={!isEditing || hasPassword}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>

        <div className="form__field">
          <label>Email</label>
          <div className="form__field-input">
            <input
              type="email"
              name="email"
              value={obfuscateEmail}
              disabled
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="form__field">
          <label>Số điện thoại</label>
          <div className="form__field-input">
            <input
              type="tel"
              name="phone"
              value={phone}
              disabled={!!id || !isEditing}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="form__field">
          <label>Ngày sinh</label>
          <div className="form__field-input">
            <input
              type="date"
              name="dateBirth"
              value={dateBirth}
              disabled={!isEditing}
              onChange={(e) => setDateBirth(e.target.value)}
            />
          </div>
        </div>

        <div className="form__field">
          <label>Giới tính</label>
          <select
            className="form__field-input custom-select"
            name="gender"
            value={gender}
            disabled={!isEditing}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">-- Chọn giới tính --</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>
        {isEditing && (
          <>
            <Button form="form" type="button" className="btn btn-cancel" onClick={() => setIsEditing(false)}>
              Hủy
            </Button>
            <Button form="form" type="submit" className="btn btn-update" onClick={() => setIsEditing(true)}>
              Cập nhật
            </Button>
          </>
        )}
      </form>
    </div>
  );
};

export default ProfileTab;
