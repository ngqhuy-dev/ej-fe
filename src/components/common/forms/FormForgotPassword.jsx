import Button from '@components/common/utils/Button';
import { Fragment, useState, useEffect } from 'react';
import OtpInput from 'react-otp-input';
import { useNavigate } from 'react-router-dom';
import { sendOtp, verifyOtp, resetPassword } from '@services/AuthService.jsx';
import { LuEye, LuEyeClosed } from 'react-icons/lu';
import toast from 'react-hot-toast';

const FormForgotPassword = () => {
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Vui lòng nhập email hợp lệ');
      toast.error('Vui lòng nhập email hợp lệ');
      return;
    }

    setIsLoading(true);
    try {
      await sendOtp(email);
      setSuccess('Mã OTP đã được gửi đến email của bạn');
      toast.success('Mã OTP đã được gửi đến email của bạn');
      setStep(2);
      setCountdown(60); // 60 seconds countdown for OTP resend
    } catch (error) {
      setError(error.message || 'Không thể gửi OTP. Vui lòng thử lại sau.');
      toast.error(error.message || 'Không thể gửi OTP. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số OTP');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp(email, otp);
      setSuccess('Xác thực OTP thành công');
      toast.success('Xác thực OTP thành công');
      setStep(3);
    } catch (error) {
      setError(error.message || 'Mã OTP không đúng hoặc đã hết hạn');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!validatePassword(password)) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email, password, confirmPassword);
      setSuccess('Đặt lại mật khẩu thành công');
      toast.success(success);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      toast.error(error);
      setError(error.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Fragment>
      {error && <div className="error-message">{error}</div>}
      {step === 1 && (
        <form className="block__form" onSubmit={handleSendOtp}>
          <div className="form__field">
            <label>Email address *</label>
            <div className="form__field-input">
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" className="btn btn__submit-account" loading={isLoading}>
            Gửi mã OTP
          </Button>
        </form>
      )}

      {step === 2 && (
        <form className="block-form" onSubmit={handleVerifyOtp}>
          <div className="account-field">
            <label>Nhập mã OTP được gửi đến email của bạn *</label>
            <div>
              <OtpInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                isInputNum
                inputStyle={{
                  width: '4.4rem',
                  height: '4.4rem',
                  margin: '0 0.2rem',
                  fontSize: '1.5rem',
                  borderRadius: '4px',
                  border: '1px solid #ced4da',
                }}
                renderSeparator={<span className="otp-separator"></span>}
                renderInput={(props) => <input {...props} className="otp-input" />}
                containerStyle={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  margin: '15px 0',
                }}
              />
            </div>
          </div>
          <div className="form-footer">
            {countdown > 0 ? (
              <span>Gửi lại mã sau {countdown} giây</span>
            ) : (
              <a
                href="#"
                className="form-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleSendOtp();
                }}
              >
                Gửi lại mã OTP
              </a>
            )}
          </div>
          <Button type="submit" className="btn btn__submit-account" loading={isLoading}>
            Xác nhận OTP
          </Button>
        </form>
      )}

      {step === 3 && (
        <form className="block__form" onSubmit={handleResetPassword}>
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
          <Button type="submit" className="btn btn__submit-account" loading={isLoading}>
            Xác nhận
          </Button>
        </form>
      )}
    </Fragment>
  );
};

export default FormForgotPassword;
