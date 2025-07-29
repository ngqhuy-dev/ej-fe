import { Fragment, useEffect } from 'react';
import { Link } from 'react-router-dom';

import FormLogin from '@components/common/forms/FormLogin.jsx';
import SocialAccount from '@components/common/utils/SocialAccount.jsx';
import FormDescribe from '@components/common/forms/FormDescribe';

const Login = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Fragment>
      <section className="account-container">
        <FormDescribe>
          Hãy đăng nhập để khám phá thế giới của chúng tôi và cùng nhau xây dựng một tương lai bền vững.
        </FormDescribe>
        <div className="account-main">
          <h1 className="account-heading">Đăng nhập</h1>
          <p className="account-subtext">Vui lòng nhập thông tin đăng nhập của bạn</p>
          <FormLogin />
          <div className="item-other">
            <span className="line-left"></span>
            <span className="text-or">OR</span>
            <span className="line-right"></span>
          </div>
          <SocialAccount />
          <p>
            Bạn chưa có tài khoản? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </section>
    </Fragment>
  );
};

export default Login;
