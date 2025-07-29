import { Fragment, useEffect } from 'react';

import FormLogin from '@components/common/forms/FormLogin.jsx';
import FormDescribe from '@components/common/forms/FormDescribe';
const Login = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Fragment>
      <section className="account-container">
        <FormDescribe />
        <div className="account-main">
          <h1 className="account-heading">Đăng nhập</h1>
          <p className="account-subtext">Vui lòng nhập thông tin đăng nhập của bạn</p>
          <FormLogin />
        </div>
      </section>
    </Fragment>
  );
};

export default Login;
