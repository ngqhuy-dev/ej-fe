// File: src/pages/admin/ProductReviews.jsx
import { useState, useEffect } from 'react';
import Pagination from '@components/common/ui/Pagination';
import { getAllReviews, deleteReview, togglePublish } from '@services/ReviewService';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '@/redux/authSlice.jsx';
import { createAxios } from '@utils/createInstance.jsx';
import { toast } from 'react-toastify';
import { faStar, faStarHalfAlt } from '@fortawesome/free-regular-svg-icons';
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ProductReviews = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const axiosJWT = createAxios(user, dispatch, loginSuccess);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await getAllReviews(accessToken, axiosJWT);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  console.log(reviews);

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleTogglePublish = async (reviewId) => {
    try {
      setLoading(true);
      await togglePublish(reviewId, accessToken, axiosJWT);
      toast.success('Cập nhật thành công!');
      fetchReviews();
    } catch (error) {
      console.error('Error updating review status:', error);
      toast.error('Cập nhật thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    await deleteReview(reviewId, accessToken, axiosJWT);
    fetchReviews();
  };

  // Hàm render sao với hỗ trợ nửa sao
  const renderStars = (rating, starSize = '2rem') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Sao đầy
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FontAwesomeIcon key={`full-${i}`} icon={faStarSolid} className="filled" style={{ fontSize: starSize }} />,
      );
    }

    // Nửa sao
    if (hasHalfStar && fullStars < 5) {
      stars.push(<FontAwesomeIcon key="half" icon={faStarHalfAlt} className="filled" style={{ fontSize: starSize }} />);
    }

    // Sao rỗng
    const totalFilledStars = fullStars + (hasHalfStar ? 1 : 0);
    const emptyStars = 5 - totalFilledStars;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={faStar} className="empty" style={{ fontSize: starSize }} />);
    }

    return stars;
  };

  const filteredReviews = reviews.filter(
    (review) =>
      review.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const statusText = {
    true: 'black',
    false: 'white',
  };

  const statusBackgroundColors = {
    true: 'yellow',
    false: 'green',
  };

  // Tính toán dữ liệu hiển thị trên trang hiện tại
  const totalItems = filteredReviews.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReviews = filteredReviews.slice(startIndex, endIndex);

  return (
    <section className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Quản lý đánh giá</h2>
      </div>
      <div className="admin-section__search">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn, khách hàng, sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          <div className="block__table">
            <table className="admin__table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Người dùng</th>
                  <th>Tên sản phẩm</th>
                  <th>Đánh giá</th>
                  <th>Nội dùng</th>
                  <th>Trạng thái</th>
                  <th>option</th>
                </tr>
              </thead>
              <tbody>
                {currentReviews.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center' }}>
                      Không có đánh giá nào
                    </td>
                  </tr>
                ) : (
                  currentReviews.map((review, index) => (
                    <tr key={review._id}>
                      <td>{String(startIndex + index + 1).padStart(2, '0')}</td>
                      <td>{review.user?.fullname || 'Anonymous'}</td>
                      <td>{review.product?.name || 'Unknown Product'}</td>
                      <td>
                        <div className="admin__rating">{renderStars(review.rating)}</div>
                      </td>
                      <td>{review.comment}</td>
                      <td>
                        <span
                          style={{
                            backgroundColor: statusBackgroundColors[review.isReport],
                            color: statusText[review.isReport],
                            padding: '5px 10px',
                            borderRadius: '5px',
                          }}
                        >
                          {review.isReport === false ? 'Hợp lệ' : 'Cảnh báo'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button onClick={() => handleTogglePublish(review._id)} title="View Details">
                            <i className="fas fa-eye"></i>
                          </button>
                          <button onClick={() => handleDeleteReview(review._id)} title="Xóa đánh giá">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {currentReviews.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </>
      )}
    </section>
  );
};

export default ProductReviews;
