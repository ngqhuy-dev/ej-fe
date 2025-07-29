import { Fragment } from 'react';
import { Link } from 'react-router-dom';

import FormForgotPassword from '@components/common/forms/FormForgotPassword.jsx';
import FormDescribe from '@components/common/forms/FormDescribe';

function Register() {
  return (
    <Fragment>
      <section className="account-container">
        <FormDescribe>
          Hãy đăng nhập để khám phá thế giới của chúng tôi và cùng nhau xây dựng một tương lai bền vững.
        </FormDescribe>
        <div className="account-main">
          <h1 className="account-heading">Quên mật khẩu</h1>
          <p className="account-subtext"></p>
          <FormForgotPassword />
          <div className="item-other">
            <span className="line-left"></span>
            <span className="text-or">OR</span>
            <span className="line-right"></span>
          </div>
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </section>
    </Fragment>
  );
}

export default Register;
