import { Fragment } from 'react';
import { Link } from 'react-router-dom';

import SocialAccount from '@components/common/utils/SocialAccount.jsx';
import FormRegister from '@components/common/forms/FormRegister.jsx';
import FormDescribe from '@components/common/forms/FormDescribe';

function Register() {
  return (
    <Fragment>
      <section className="account-container">
        <FormDescribe />
        <div className="account-main">
          <h1 className="account-heading">Đăng ký</h1>
          <p className="account-subtext">Vui lòng nhập thông tin đăng ký của bạn</p>
          <FormRegister />
          <div className="item-other">
            <span className="line-left"></span>
            <span className="text-or">OR</span>
            <span className="line-right"></span>
          </div>
          <SocialAccount />
          <p>
            Bạn đã có tài khoảng? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </section>
    </Fragment>
  );
}

export default Register;
