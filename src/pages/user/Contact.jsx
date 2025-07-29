import { Fragment, useEffect } from 'react';
import img_contact from '@assets/images/ui/contact-us.png';

function Contact() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <Fragment>
      <section className="container contact">
        <div className="contact__header">
          <h3 className="content__title-suptext">Liên hệ với chúng tôi</h3>
          <h1 className="content__title">Chúng tôi cần câu hỏi từ các bạn.</h1>
          <p className="content__subtext">
            Liên hệ với chúng tôi nếu quý vị có bất kỳ câu hỏi hoặc ý kiến nào. <br /> Hoặc quý vị có thể giải quyết vấn
            đề nhanh chóng hơn thông qua các văn phòng liên hệ của chúng tôi.
          </p>
        </div>
        <div className="contact__content">
          <div className="content__details ">
            <img className="img-details" src={img_contact} alt="Contact with us" />
            <div className="details__office">
              <div className="office__card">
                <p className="card-location">Phú Xuân</p>
                <h3 className="card-name">Văn phòng Quận Phú Xuân</h3>
                <p className="card-address">123 Hương Giang, Tầng 2, Thành phố Huế</p>
                <p className="card-phone">+84 234 567 890</p>
                <a href="mailto:phuxuan@example.com" className="card-email">
                  phuxuan@example.com
                </a>
              </div>

              <div className="office__card">
                <p className="card-location">Thuận Hóa</p>
                <h3 className="card-name">Văn phòng Quận Thuận Hóa</h3>
                <p className="card-address">456 Tố Hữu, Tầng 2, Thành phố Huế</p>
                <p className="card-phone">+84 234 123 456</p>
                <a href="mailto:thuanhoa@example.com" className="card-email">
                  thuanhoa@example.com
                </a>
              </div>
            </div>
          </div>
          <form className="contact__form">
            <div className="form__row">
              <div>
                <label className="form__label">Tên đầy đủ của bạn *</label>
                <input type="text" className="form__input" placeholder="Enter your name" required />
              </div>
              <div>
                <label className="form__label">Địa chỉ email của bạn *</label>
                <input type="email" className="form__input" placeholder="Enter your email" required />
              </div>
            </div>

            <div className="form__field">
              <label className="form__label">Lời góp ý</label>
              <textarea className="form__textarea" placeholder="Enter your message"></textarea>
            </div>

            <button type="submit" className="btn form__button">
              Send Message
            </button>
          </form>
        </div>
      </section>
    </Fragment>
  );
}

export default Contact;
