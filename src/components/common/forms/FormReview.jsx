// ProductDetails/components/WriteReviewForm.jsx
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as faStarSolid, faStar } from '@fortawesome/free-solid-svg-icons';
import { addReview, getReviewById, updateReview } from '../../../services/ReviewService';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '@/redux/authSlice.jsx';
import { createAxios } from '@utils/createInstance.jsx';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const WriteReviewForm = ({ idReview = null, product, setShowReviewForm, fetchReviews, onClose }) => {
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const axiosJWT = createAxios(user, dispatch, loginSuccess);

  useEffect(() => {
    if (idReview) {
      setIsEditing(true);
      const fetchReview = async () => {
        try {
          setLoading(true);
          const res = await getReviewById(idReview, accessToken, axiosJWT);
          if (res.success) {
            setNewRating(res.data.rating || res.rating);
            setNewComment(res.data.comment || res.comment);
          }
        } catch (error) {
          console.error('Error fetching review:', error);
          toast.error('Không thể tải thông tin đánh giá', {
            position: 'top-center',
            duration: 2000,
          });
        } finally {
          setLoading(false);
        }
      };
      fetchReview();
    } else {
      setIsEditing(false);
      setNewRating(0);
      setNewComment('');
    }
  }, [idReview]);

  const resetForm = () => {
    setNewRating(0);
    setNewComment('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (newRating === 0) {
      setError('Vui lòng chọn số sao đánh giá.');
      return;
    }

    if (newComment.trim() === '') {
      setError('Vui lòng nhập nhận xét của bạn.');
      return;
    }

    setError('');

    // Check if user is logged in
    if (!user) {
      toast.error('Vui lòng đăng nhập để viết đánh giá!', {
        position: 'top-center',
        duration: 2000,
      });
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      if (!isEditing) {
        // Create new review
        const review = {
          productId: product._id,
          rating: newRating,
          comment: newComment.trim(),
        };

        const res = await addReview(review, dispatch, accessToken, axiosJWT);

        if (res.success) {
          toast.success('Viết đánh giá thành công!', {
            position: 'top-center',
            duration: 2000,
          });
          resetForm();
          setShowReviewForm(false);
        }
      } else {
        // Update existing review
        const review = {
          rating: newRating,
          comment: newComment.trim(),
        };

        const res = await updateReview(idReview, review, accessToken, axiosJWT);

        if (res.success) {
          toast.success('Cập nhật đánh giá thành công!', {
            position: 'top-center',
            duration: 2000,
          });
          resetForm();
          setShowReviewForm(false);
          if (onClose) onClose();
        }
      }
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowReviewForm(false);
    if (onClose) onClose();
  };

  if (loading && isEditing) {
    return (
      <div className="review-form loading-form">
        <p>Đang tải thông tin đánh giá...</p>
      </div>
    );
  }

  return (
    <div className="review-form-wrapper">
      <form className="review-form" onSubmit={handleSubmit}>
        <h4>{isEditing ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá mới'}</h4>

        <div className="rating-input">
          <label>Chọn số sao:</label>
          <div className="stars-select">
            {[1, 2, 3, 4, 5].map((star) => (
              <FontAwesomeIcon
                key={star}
                icon={star <= newRating ? faStarSolid : faStar}
                style={{
                  color: star <= newRating ? '#f5a623' : '#ccc',
                  cursor: 'pointer',
                  marginRight: '4px',
                  fontSize: '1.5rem',
                }}
                onClick={() => setNewRating(star)}
                aria-label={`Đánh giá ${star} sao`}
              />
            ))}
            <span className="rating-text">{newRating > 0 && `(${newRating} sao)`}</span>
          </div>
        </div>

        <div className="comment-input">
          <label htmlFor="review-comment">Nhận xét của bạn:</label>
          <textarea
            id="review-comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
          ></textarea>
          <small className="char-count">{newComment.length}/500 ký tự</small>
        </div>

        {error && (
          <p className="error-message" style={{ color: 'red', fontSize: '14px', marginTop: '8px' }}>
            {error}
          </p>
        )}

        <div className="form-actions__review">
          <button type="button" className="btn btn-cancel btn-cancel__review" onClick={handleCancel} disabled={loading}>
            Hủy
          </button>
          <button type="submit" className="btn btn-submit__review" disabled={loading}>
            {loading ? 'Đang xử lý...' : isEditing ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WriteReviewForm;
