import { Fragment, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '@services/AuthService.jsx';
import { LuEye, LuEyeClosed } from 'react-icons/lu';

import Button from '@components/common/utils/Button.jsx';
function FormRegister() {
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const user = {
    fullname: fullname,
    username: username,
    email: email,
    password: password,
    confirmPassword: confirmPassword,
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    try {
      await register(user, dispatch, navigate);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Fragment>
      <form className="block__form" onSubmit={handleSubmit}>
        <div className="form__field">
          <label>Tên đầy đủ *</label>
          <div className="form__field-input">
            <input
              type="text"
              name="fullname"
              placeholder="Fullname"
              onChange={(e) => setFullname(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form__field">
          <label>Username *</label>
          <div className="form__field-input">
            <input
              type="text"
              name="username"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form__field">
          <label>Email *</label>
          <div className="form__field-input">
            <input type="email" name="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>
        <div className="form__field">
          <label>Mật khẩu *</label>
          <div className="form__field-input">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Mật khẩu"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button className="see-password" onClick={togglePasswordVisibility}>
              {showPassword ? <LuEye className="icon-eye" /> : <LuEyeClosed className="icon-eye" />}
            </Button>
          </div>
        </div>
        <div className="form__field">
          <label>Xác nhận mật khẩu *</label>
          <div className="form__field-input">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="password"
              placeholder="Xác nhận mật khẩu"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button className="see-password" onClick={toggleConfirmPasswordVisibility}>
              {showConfirmPassword ? <LuEye className="icon-eye" /> : <LuEyeClosed className="icon-eye" />}
            </Button>
          </div>
        </div>

        <p className="privacy-text">
          Tôi đồng ý với
          <Link to="/privacy-policy"> chính sách bảo mật</Link>.
        </p>
        <Button type="submit" className="btn btn__submit-account" loading={isLoading}>
          Register
        </Button>
      </form>
    </Fragment>
  );
}

export default FormRegister;
