import { Link } from 'react-router-dom';

import { useEffect, useState } from 'react';
import { getCategoriesAll } from '@/services/CategoryService';
import jsonNavbar from '@json/navbar.jsx';

import appStore from '@assets/images/logo/buttonAppstore.svg';
import appGoogle from '@assets/images/logo/buttonGoogle.svg';

import iconEmail from '@assets/icons/iconemail.svg';
import iconTelephone from '@assets/icons/icontelephone.svg';
import iconFacebook from '@assets/icons/iconfacebook.svg';
import iconInstagram from '@assets/icons/iconinstagram.svg';
import iconLinkedIn from '@assets/icons/iconLinkedIn.svg';
import iconX from '@assets/icons/iconX.svg';
import logoFull from '@assets/images/logo/logoFull.svg';

import moneyKlarna from '@assets/images/payment/moneyKlarna.svg';
import moneyPaypal from '@assets/images/payment/moneyPayPal.svg';
import moneyVISA from '@assets/images/payment/moneyVISA.svg';
import moneyMaster from '@assets/images/payment/moneyMaster.svg';
import moneySkrill from '@assets/images/payment/moneySkrill.svg';
// import { useState } from 'react';

const Footer = () => {
  const [category, setCategory] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategoriesAll(); // Goi API lay danh sach categories
        setCategory(data);
      } catch (error) {
        console.error('Loi khi lay danh muc:', error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__main">
          <div className="footer__contact">
            <div className="header__logo">
              <Link to="/">
                <img src={logoFull} alt="JinStore" />
              </Link>
            </div>
            <div className="footer__contact-phone">
              <img src={iconTelephone} alt="Icon Telephone" />
              <p className="footer__contact-details">
                <h5>Thứ 2 - Chủ nhật: 08am-9pm</h5>
                <h1>0 832 766 413</h1>
              </p>
            </div>
            <div className="footer__contact-email">
              <img src={iconEmail} alt="Icon Email" />
              <p className="footer__contact-details">
                <h5>Need help with your order?</h5>
                <a href="mailto:info@example.com">Jinstore@gmail.com</a>
              </p>
            </div>
          </div>

          <div className="footer__categories">
            <h4>Thể loại</h4>
            <ul>
              {category.slice(0, 6).map((item, i) => (
                <Link key={i} to={`/shop?category=${item.name}`}>
                  {item.name}
                </Link>
              ))}
            </ul>
          </div>

          <div className="footer__useful-links">
            <h4>Liên kết hữu ích</h4>
            <ul>
              {jsonNavbar.slice(1, 7).map((item, i) => (
                <Link key={i} to={`${item.path}`}>
                  {item.name}
                </Link>
              ))}
            </ul>
          </div>

          <div className="footer__help-center">
            <h4>Help Center</h4>
            <ul>
              <Link to="/">FAQ</Link>
            </ul>
          </div>

          <div className="footer__app-links">
            <h4>Download our app</h4>
            <div className="download-app">
              <a
                href="https://play.google.com/store/games"
                className="btn google-play"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={appGoogle} alt="Google Play" />
                <p>
                  Download App Get <br /> -10% Discount
                </p>
              </a>
              <a
                href="https://www.apple.com/app-store/"
                className="btn app-store"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={appStore} alt="App store" />
                <p>
                  Download App Get <br /> -20% Discount
                </p>
              </a>
            </div>
            <div className="social-media">
              <h4>Follow us on social media:</h4>
              <div className="social-icons">
                <a target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/">
                  <img src={iconFacebook} alt="Facebook" />
                </a>
                <a target="_blank" rel="noopener noreferrer" href="https://www.instagram.com/">
                  <img src={iconInstagram} alt="Instagram" />
                </a>
                <a target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/">
                  <img src={iconLinkedIn} alt="LinkedIn" />
                </a>
                <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/">
                  <img src={iconX} alt="X" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <p>
            Copyright 2024 © Jinstore WooCommerce WordPress Theme. All right reserved. Powered by
            <strong> BlackRise Themes</strong>.
          </p>
          <div className="content__right-pay">
            <img src={moneyKlarna} alt="Money Klarna"></img>
            <img src={moneyPaypal} alt="Money Paypal"></img>
            <img src={moneyVISA} alt="Money VISA"></img>
            <img src={moneyMaster} alt="Money Master"></img>
            <img src={moneySkrill} alt="Money Skrill"></img>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
