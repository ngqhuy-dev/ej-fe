import Breadcrumb from '@components/common/ui/Breadcrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTag, faCalendarAlt, faPercent } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAxios } from '@utils/createInstance.jsx';
import { loginSuccess } from '@/redux/authSlice.jsx';
import { getAllDiscount, getAllDiscountUser } from '@services/DiscountService';
import { toast } from 'react-hot-toast';

function DiscountList() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const axiosJWT = createAxios(user, dispatch, loginSuccess);
  const [searchTerm, setSearchTerm] = useState('');
  const [discounts, setDiscounts] = useState([]);
  const [filteredDiscounts, setFilteredDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Load discounts on component mount
  useEffect(() => {
    fetchDiscounts();
  }, []);

  // Filter discounts based on search term and category
  useEffect(() => {
    let filtered = discounts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (discount) =>
          discount.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          discount.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          discount.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((discount) => {
        switch (selectedCategory) {
          case 'active':
            return discount.isActive;
          case 'inactive':
            return !discount.isActive;
          case 'expired':
            return new Date(discount.endDate) < new Date();
          case 'upcoming':
            return new Date(discount.startDate) > new Date();
          default:
            return true;
        }
      });
    }

    // Sort discounts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name':
          return a.name?.localeCompare(b.name);
        case 'discount':
          return b.discountValue - a.discountValue;
        default:
          return 0;
      }
    });

    setFilteredDiscounts(filtered);
  }, [discounts, searchTerm, selectedCategory, sortBy]);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      let data;
      if (user) {
        data = await getAllDiscountUser(user._id, accessToken, axiosJWT);
      } else {
        data = await getAllDiscount();
      }
      setDiscounts(data);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast.error('Không thể tải danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDiscount = (type, value) => {
    return type === 'percentage' ? `${value}%` : `${parseInt(value).toLocaleString('vi-VN')}đ`;
  };

  const getDiscountStatus = (discount) => {
    const now = new Date();
    const startDate = new Date(discount.startDate);
    const endDate = new Date(discount.endDate);

    if (!discount.isActive) return { text: 'Không hoạt động', class: 'inactive' };
    if (now < startDate) return { text: 'Sắp diễn ra', class: 'upcoming' };
    if (now > endDate) return { text: 'Đã hết hạn', class: 'expired' };
    return { text: 'Đang hoạt động', class: 'active' };
  };

  const categories = [
    { key: 'all', label: 'Tất cả', count: discounts.length },
    {
      key: 'active',
      label: 'Đang hoạt động',
      count: discounts.filter(
        (d) => d.isActive && new Date(d.startDate) <= new Date() && new Date(d.endDate) >= new Date(),
      ).length,
    },
    { key: 'inactive', label: 'Không hoạt động', count: discounts.filter((d) => !d.isActive).length },
    { key: 'expired', label: 'Đã hết hạn', count: discounts.filter((d) => new Date(d.endDate) < new Date()).length },
    {
      key: 'upcoming',
      label: 'Sắp diễn ra',
      count: discounts.filter((d) => new Date(d.startDate) > new Date()).length,
    },
  ];

  if (loading) {
    return (
      <section>
        <Breadcrumb items={[{ text: 'Discounts' }]} />
        <div className="discount-list">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <Breadcrumb items={[{ text: 'Discounts' }]} />
      <div className="discount-list">
        <div className="discount-list__header">
          <div className="discount-list__header-content">
            <h2 className="title">Mã giảm giá của chúng tôi</h2>
            <p className="subtitle">Khám phá lựa chọn các mã giảm giá với các ưu đãi của chúng tôi</p>
          </div>
          <div className="discount-list__actions">
            <div className="discount-list__search">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm mã giảm giá..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="discount-list__content">
          {/* Sidebar Filters */}
          <div className="discount-list__sidebar">
            <div className="filter-section">
              <h3>Danh mục</h3>
              <ul className="filter-list">
                {categories.map((category) => (
                  <li key={category.key}>
                    <button
                      className={`filter-item ${selectedCategory === category.key ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(category.key)}
                    >
                      <span>{category.label}</span>
                      <span className="count">{category.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="filter-section">
              <h3>Sắp xếp theo</h3>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="name">Tên A-Z</option>
                <option value="discount">Giảm giá cao nhất</option>
              </select>
            </div>
          </div>

          {/* Main Content */}
          <div className="discount-list__main">
            {filteredDiscounts.length > 0 ? (
              <div className="discount-grid">
                {filteredDiscounts.map((discount) => {
                  const status = getDiscountStatus(discount);
                  return (
                    <div key={discount._id} className="discount-card">
                      <div className="discount-card__header">
                        <div className="discount-info">
                          <h3 className="discount-name">{discount.code}</h3>
                          <div className="discount-code">
                            <FontAwesomeIcon icon={faTag} />
                            <span>{discount.code}</span>
                          </div>
                        </div>
                        <div className={`discount-status ${status.class}`}>{status.text}</div>
                      </div>

                      <div className="discount-card__body">
                        <div className="discount-value">
                          <FontAwesomeIcon icon={faPercent} />
                          <span>Giảm {formatDiscount(discount.type, discount.value)}</span>
                        </div>

                        {discount.description && <p className="discount-description">{discount.description}</p>}

                        <div className="discount-details">
                          <div className="detail-item">
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            <span>
                              Từ {formatDate(discount.activation)} đến {formatDate(discount.expiration)}
                            </span>
                          </div>

                          {discount.minOrderAmount && (
                            <div className="detail-item">
                              <span>Đơn tối thiểu: {discount.minOrderAmount.toLocaleString('vi-VN')}đ</span>
                            </div>
                          )}

                          {discount.quantityLimit && (
                            <div className="detail-item">
                              <span>Giảm tối đa: {discount.quantityLimit.toLocaleString('vi-VN')}đ</span>
                            </div>
                          )}

                          <div className="detail-item">
                            <span>
                              Đã sử dụng: {discount.quantityUsed || 0}/{discount.quantityLimit || '∞'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <FontAwesomeIcon icon={faTag} className="empty-icon" />
                <h3>Không tìm thấy mã giảm giá</h3>
                <p>
                  {searchTerm
                    ? `Không có mã giảm giá nào phù hợp với "${searchTerm}"`
                    : 'Chưa có mã giảm giá nào được tạo'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default DiscountList;
