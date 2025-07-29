import FormChangePassword from '@components/common/forms/FormChangePassword';
import { useSelector } from 'react-redux';
function ChangePasswordTab() {
  const user = useSelector((state) => state.auth.login.currentUser);
  const hasPassword = user?.hasPassword;
  return (
    <div className="profile__tab profile__tab-change-password">
      <div className="profile__tab-header">
        <h2 className="header__title">{hasPassword ? 'Thay đổi mật khẩu' : 'Thêm mật khẩu cho tài khoản'}</h2>
      </div>
      <div className="account-main">
        <FormChangePassword />
      </div>
    </div>
  );
}

export default ChangePasswordTab;
