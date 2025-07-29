import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faChevronRight } from '@fortawesome/free-solid-svg-icons';

// Thêm inline styles
const customStyles = {
  item: {
    fontSize: '1.5rem',
    fontWeight: '700',
  },
  separator: {
    fontSize: '1.2rem',
    margin: '0 0.5rem',
  },
  icon: {
    fontSize: '1.32rem',
    marginRight: '0.5rem',
  },
};

const Breadcrumb = ({ items }) => {
  return (
    <div className="block__breadcrumb">
      <nav className="breadcrumb" aria-label="breadcrumb">
        <div className="breadcrumb__container" style={{ marginLeft: 0, paddingLeft: 0 }}>
          <div
            className="breadcrumb__item breadcrumb__item--home"
            style={{ ...customStyles.item, marginLeft: 0, paddingLeft: 0 }}
          >
            <Link to="/" style={customStyles.item}>
              <FontAwesomeIcon icon={faHome} className="breadcrumb__icon" style={customStyles.icon} />
              <span>HOME</span>
            </Link>
          </div>

          {items.map((item, index) => (
            <div
              key={index}
              className={`breadcrumb__item ${!item.link ? 'breadcrumb__item--active' : ''}`}
              style={customStyles.item}
            >
              <FontAwesomeIcon icon={faChevronRight} className="breadcrumb__separator" style={customStyles.separator} />
              {item.link ? (
                <Link to={item.link} style={customStyles.item}>
                  {item.text.toUpperCase()}
                </Link>
              ) : (
                <span>{item.text.toUpperCase()}</span>
              )}
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      link: PropTypes.string,
    }),
  ).isRequired,
};

export default Breadcrumb;
