import Button from '@components/common/utils/Button';
import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '@services/AuthService.jsx';
import { LuEye, LuEyeClosed } from 'react-icons/lu';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '@/redux/authSlice.jsx';
import { createAxios } from '@utils/createInstance.jsx';
import { logOut } from '@services/AuthService.jsx';

const FormChangePassword = () => {
  const user = useSelector((state) => state.auth.login.currentUser);
  const hasPassword = user?.hasPassword;
  const id = user?._id;
  const accessToken = user?.accessToken;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const axiosJWT = createAxios(user, dispatch, loginSuccess);

  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const toggleCurrentPasswordVisibility = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!validatePassword(newPassword)) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp');
      return;
    }

    setIsLoading(true);
    try {
      if (hasPassword) {
        const formData = {
          currentPassword: currentPassword,
          newPassword: newPassword,
          confirmPassword: confirmPassword,
        };
        await changePassword(formData, accessToken, axiosJWT);
      } else {
        const formData = {
          newPassword: newPassword,
          confirmPassword: confirmPassword,
        };
        await changePassword(formData, accessToken, axiosJWT);
      }
      setTimeout(() => {
        logOut(dispatch, id, navigate, accessToken, axiosJWT);
      }, 500);
    } catch (error) {
      setError(error.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.');
      toast.error(error.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Fragment>
      {error && <div className="error-message">{error}</div>}

      <form className="block__form" onSubmit={handleChangePassword}>
        {hasPassword && (
          <div className="form__field">
            <label>Mật khẩu hiện tại*</label>
            <div className="form__field-input">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                name="currentPassword"
                placeholder="Mật khẩu hiện tại"
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <Button className="see-password" onClick={toggleCurrentPasswordVisibility}>
                {showCurrentPassword ? <LuEye className="icon-eye" /> : <LuEyeClosed className="icon-eye" />}
              </Button>
            </div>
          </div>
        )}
        <div className="form__field">
          <label>Mật khẩu mới *</label>
          <div className="form__field-input">
            <input
              type={showNewPassword ? 'text' : 'password'}
              name="newPassword"
              placeholder="Mật khẩu mới"
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Button className="see-password" onClick={toggleNewPasswordVisibility}>
              {showNewPassword ? <LuEye className="icon-eye" /> : <LuEyeClosed className="icon-eye" />}
            </Button>
          </div>
        </div>
        <div className="form__field">
          <label>Xác nhận mật khẩu mới *</label>
          <div className="form__field-input">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Xác nhận mật khẩu mới"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button className="see-password" onClick={toggleConfirmPasswordVisibility}>
              {showConfirmPassword ? <LuEye className="icon-eye" /> : <LuEyeClosed className="icon-eye" />}
            </Button>
          </div>
        </div>
        <Button type="submit" className="btn btn__submit-account" loading={isLoading}>
          Xác nhận
        </Button>
      </form>
    </Fragment>
  );
};

export default FormChangePassword;
