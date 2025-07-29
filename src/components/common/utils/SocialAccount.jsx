import iconGoogleLogin from '@assets/icons/icongooglelogin.svg';

const API_URL = import.meta.env.VITE_API_URL_V1;

const GOOGLE_LOGIN_URL = `${API_URL}/auth/google`;

function SocialAccount() {
  const googleAuth = () => {
    window.open(GOOGLE_LOGIN_URL, '_self');
  };
  return (
    <div className="social__login-other">
      <button className="social__login-btn" onClick={googleAuth}>
        <img src={iconGoogleLogin} alt="Login With Google" />
        Google
      </button>
    </div>
  );
}

export default SocialAccount;
