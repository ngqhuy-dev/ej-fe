import { faStar, faStarHalfAlt } from '@fortawesome/free-regular-svg-icons';
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useEffect, useMemo } from 'react';

import WriteReviewForm from '@components/common/forms/FormReview';
import { getReviewByProduct } from '@services/ReviewService';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

// ProductDetails/components/ProductReviews.jsx
const ProductReviews = ({ product }) => {
  const user = useSelector((state) => state.auth.login.currentUser);

  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const [idReview, setIdReview] = useState('');
  const [loading, setLoading] = useState(true);

  const [showReviewForm, setShowReviewForm] = useState(false);

  // Tính toán averageRating và totalReviews từ reviews hiện tại
  const { averageRating, totalReviews } = useMemo(() => {
    if (reviews.length === 0) {
      return { averageRating: 0, totalReviews: 0 };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = totalRating / reviews.length;

    return {
      averageRating: avgRating,
      totalReviews: reviews.length,
    };
  }, [reviews]);

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const res = await getReviewByProduct(id);
      setReviews(res.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

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

  // Hàm format thời gian
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Hàm tính thời gian relative được cải thiện
  const getRelativeTime = (dateString) => {
    // Kiểm tra tính hợp lệ của input
    if (!dateString) return 'Không xác định';

    const inputDate = new Date(dateString);
    const now = new Date();

    // Kiểm tra ngày hợp lệ
    if (isNaN(inputDate.getTime())) return 'Ngày không hợp lệ';

    // Chuẩn hóa về đầu ngày để so sánh chính xác
    const normalizedInput = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
    const normalizedNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffInMs = normalizedNow.getTime() - normalizedInput.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // Xử lý trường hợp ngày trong tương lai
    if (diffInDays < 0) {
      const futureDays = Math.abs(diffInDays);
      if (futureDays === 1) return 'Ngày mai';
      if (futureDays < 7) return `${futureDays} ngày nữa`;
      return `Trong tương lai`;
    }

    // Hôm nay và hôm qua
    if (diffInDays === 0) return 'Hôm nay';
    if (diffInDays === 1) return 'Hôm qua';

    // Trong vòng 1 tuần
    if (diffInDays < 7) return `${diffInDays} ngày trước`;

    // Tính chênh lệch tháng chính xác
    const yearDiff = now.getFullYear() - inputDate.getFullYear();
    const monthDiff = now.getMonth() - inputDate.getMonth();
    const totalMonthDiff = yearDiff * 12 + monthDiff;

    // Điều chỉnh nếu ngày trong tháng chưa đến
    const adjustedMonthDiff = now.getDate() < inputDate.getDate() ? totalMonthDiff - 1 : totalMonthDiff;

    // Trong vòng 1 tháng (4-5 tuần)
    if (adjustedMonthDiff === 0) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} tuần trước`;
    }

    // Trong vòng 1 năm
    if (adjustedMonthDiff < 12) {
      return adjustedMonthDiff === 1 ? '1 tháng trước' : `${adjustedMonthDiff} tháng trước`;
    }

    // Từ 1 năm trở lên
    const years = Math.floor(adjustedMonthDiff / 12);
    return years === 1 ? '1 năm trước' : `${years} năm trước`;
  };

  // Hàm sửa đánh giá
  const handleEditReview = (reviewId) => {
    setIdReview(reviewId);
    setShowReviewForm(true);
  };

  // Hàm hủy edit hoặc đóng form
  const handleCloseReviewForm = () => {
    setShowReviewForm(false);
    setIdReview('');
  };

  // Hàm viết review mới
  const handleWriteNewReview = () => {
    setIdReview('');
    setShowReviewForm(true);
  };

  if (loading) {
    return (
      <div className="reviews-content">
        <div className="loading">Đang tải đánh giá...</div>
      </div>
    );
  }

  return (
    <div className="reviews-content">
      <div className="reviews-summary">
        <div className="rating-overview">
          <h3>Đánh giá khách hàng</h3>
          <div className="average-rating">
            <span className="rating-number">{averageRating > 0 ? averageRating.toFixed(1) : '0.0'}</span>
            <div className="stars">{renderStars(averageRating)}</div>
            <span className="total-reviews">Dựa trên {totalReviews} đánh giá</span>
          </div>
        </div>

        <div className="write-review">
          <button
            className="write-review-button"
            onClick={showReviewForm ? handleCloseReviewForm : handleWriteNewReview}
          >
            <FontAwesomeIcon icon={faStar} />
            {showReviewForm ? 'Đóng' : 'Viết đánh giá'}
          </button>
        </div>
      </div>

      {showReviewForm && (
        <WriteReviewForm
          idReview={idReview}
          product={product}
          fetchReviews={fetchReviews}
          setShowReviewForm={setShowReviewForm}
          onClose={handleCloseReviewForm}
        />
      )}

      <div className="reviews-list">
        {reviews.length > 0 ? (
          reviews.map(
            (review) =>
              !review.isReport &&
              review._id !== idReview && (
                <div key={review._id} className="review-item">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <h4>{review.user.fullname}</h4>
                      <div className="review-rating">{renderStars(review.rating, '1.6rem')}</div>
                      <span className="review-date">
                        {getRelativeTime(review.createdAt)} - {formatDate(review.createdAt)}
                      </span>
                    </div>
                    {user && user._id === review.user._id && (
                      <div className="review-actions">
                        <button
                          className="btn btn-edit btn__edit-review"
                          onClick={() => handleEditReview(review._id)}
                          title="Sửa đánh giá"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      </div>
                    )}
                  </div>
                  {review.comment && <p className="review-text">{review.comment}</p>}
                  {review.updatedAt !== review.createdAt && (
                    <span className="review-edited">(Đã chỉnh sửa vào {formatDate(review.updatedAt)})</span>
                  )}
                </div>
              ),
          )
        ) : (
          <div className="no-reviews">
            <p>Chưa có đánh giá nào cho sản phẩm này.</p>
            <p>Hãy là người đầu tiên đánh giá!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
