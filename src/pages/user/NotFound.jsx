import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import img_404 from '@assets/images/ui/notfound.svg';

function NotFound() {
  return (
    <Fragment>
      <section>
        <div className="notfound">
          <div className="notfound__content">
            <img className="img-notfound" src={img_404} alt="Images Not Found" />
            <span className="notfound__title">Trang này không tồn tại</span>
            <p className="notfound__subtext">
              Có vẻ như không có gì được tìm thấy tại vị trí này. Có thể cố gắng tìm kiếm những gì bạn đang tìm kiếm?
            </p>
            <Link to="/" className="btn btn-back-home">
              Trang chủ
            </Link>
          </div>
        </div>
      </section>
    </Fragment>
  );
}

export default NotFound;
