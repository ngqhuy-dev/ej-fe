// File: src/pages/admin/AddCategory.jsx
import slugify from 'slugify';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '@/redux/authSlice.jsx';
import { addCategories } from '@services/CategoryService.jsx';
import { createAxios } from '@utils/createInstance.jsx';
import PageLoad from '@pages/PageLoad';
import toast from 'react-hot-toast';

const AddCategory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const axiosJWT = createAxios(user, dispatch, loginSuccess);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [isOutstanding, setIsOutstanding] = useState('');
  const [loading, setLoading] = useState(false);

  const [imagePreview, setImagePreview] = useState(null);
  const [customSlug, setCustomSlug] = useState(false);

  useEffect(() => {
    if (!customSlug) {
      setSlug(slugify(name, { lower: true, strict: true }));
    }
  }, [name, customSlug]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      toast.success('Bạn đã thêm ảnh danh mục!', {
        position: 'top-center',
        autoClose: 3000, // Tự động đóng sau 3 giây
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create FormData object to send file
    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('slug', slug);
    formData.append('description', description.trim());

    if (image) {
      formData.append('image', image);
    }

    try {
      setLoading(true);
      await addCategories(formData, dispatch, accessToken, axiosJWT);
      navigate('/admin/categories');
    } catch (error) {
      console.error('Error adding category:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-section">
      {loading ? (
        <PageLoad zIndex="1" />
      ) : (
        <>
          <div className="admin-section__header">
            <h2 className="admin-section__title">Thêm mới danh mục</h2>
          </div>
          <form className="admin__form" onSubmit={handleSubmit}>
            <div className="admin__form-row">
              {/* NOTE: Name */}
              <div className="admin__form-field">
                <label htmlFor="name">Category Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter category name"
                  required
                />
              </div>
              {/* NOTE: Slug */}
              <div className="admin__form-field">
                <label className="label__slug" htmlFor="slug">
                  Tự chỉnh sửa slug
                  <input type="checkbox" checked={customSlug} onChange={() => setCustomSlug(!customSlug)} />
                </label>
                <input
                  type="text"
                  value={slug}
                  readOnly={!customSlug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder={!customSlug ? 'Slug tự động phát sinh' : 'Vui lòng nhập slug cho phù hợp'}
                  style={{
                    cursor: !customSlug ? 'default' : 'text',
                    backgroundColor: !customSlug ? '#f3f4f6' : 'white',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    width: '100%',
                  }}
                />
              </div>
            </div>
            <div className="admin__form-row">
              {/* NOTE: Image */}
              <div className="admin__form-field">
                <label htmlFor="image">Category Image</label>
                <input
                  type="file"
                  className="input__image"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="admin__image-preview admin__image-preview--category"
                  />
                )}
              </div>
              {/* NOTE: Description */}
              <div className="admin__form-field">
                <label htmlFor="description">Description *</label>
                <textarea
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>
            <div className="admin__form-row">
              <div className="admin__form-field">
                <label htmlFor="status">Tình trạng</label>
                <select id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">Chọn tình trạng</option>
                  <option value="active">Kích hoạt</option>
                  <option value="inactive">Ngừng kích hoạt</option>
                </select>
              </div>
              <div className="admin__form-field">
                <label htmlFor="isOutstanding">Nổi bật</label>
                <select
                  id="isOutstanding"
                  name="isOutstanding"
                  value={isOutstanding}
                  onChange={(e) => setIsOutstanding(e.target.value)}
                >
                  <option value="">Chọn trạng thái</option>
                  <option value="true">Có</option>
                  <option value="false">Không</option>
                </select>
              </div>
            </div>
            <button type="submit" className="admin__form-button">
              Add Category
            </button>
          </form>
        </>
      )}
    </section>
  );
};

export default AddCategory;
