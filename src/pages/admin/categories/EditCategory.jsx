// File: src/pages/admin/AddCategory.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

import { getCategories } from '@services/CategoryService.jsx';
import { loginSuccess } from '@/redux/authSlice.jsx';
import { editCategory } from '@services/CategoryService.jsx';
import { createAxios } from '@utils/createInstance.jsx';

const EditCategory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const axiosJWT = createAxios(user, dispatch, loginSuccess);
  const [category, setCategory] = useState(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState('');
  const [isOutstanding, setIsOutstanding] = useState('');
  const [description, setDescription] = useState('');

  const [imagePreview, setImagePreview] = useState(null);
  const [customSlug, setCustomSlug] = useState(false);
  const [customImg, setCustomImg] = useState(false);

  const { id } = useParams();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories(id);
        setCategory(data);

        setName(data?.name || '');
        setSlug(data?.slug || '');
        setDescription(data?.description || '');
        setStatus(data?.status || 'inactive');
        setIsOutstanding(data?.isOutstanding || false);
        if (data?.image?.url) {
          setImagePreview(data.image.url);
        }
      } catch (err) {
        toast.dismiss();
        toast.error(err.response?.data.message, {
          autoClose: 500,
        });
      }
    };

    fetchCategories();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') setName(value);
    if (name === 'slug') setSlug(value);
    if (name === 'description') setDescription(value);
    if (name === 'status') setStatus(value);
    if (name === 'isOutstanding') setIsOutstanding(value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImage(file);

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

    // Only append fields that have changed
    if (name !== category.name) {
      formData.append('name', name.trim());
    }

    if (slug !== category.slug) {
      formData.append('slug', slug);
    }

    if (description !== category.description) {
      formData.append('description', description.trim());
    }

    if (status !== category.status) {
      formData.append('status', status);
    }

    if (isOutstanding !== category.isOutstanding) {
      formData.append('isOutstanding', isOutstanding);
    }

    if (image) {
      formData.append('image', image);
    }

    // Check if any fields have changed
    if (formData.keys().length === 0) {
      toast.dismiss();
      toast('Chưa có thông tin nào được thay đổi.', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffeeba',
          borderRadius: '8px',
          fontWeight: '500',
          fontSize: '1.6rem',
        },
        icon: '⚠️',
      });
      return;
    }

    try {
      await editCategory(id, formData, accessToken, axiosJWT);

      navigate('/admin/categories');
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
    }
  };

  if (!category) {
    return <div>Loading...</div>;
  }

  return (
    <section className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Cập nhật thông tin danh mục</h2>
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
              onChange={handleInputChange}
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
              onChange={handleInputChange}
              name="slug"
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
            <label className="label__image" htmlFor="image">
              Thay đổi ảnh
              <input type="checkbox" checked={customImg} onChange={() => setCustomImg(!customImg)} />
            </label>
            {customImg ? (
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                style={{
                  backgroundColor: 'white',
                }}
              />
            ) : (
              <input
                type="text"
                value={category.image?.url || ''}
                readOnly={!customImg}
                style={{
                  padding: '5.5px',
                  cursor: 'default',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontWeight: '500',
                  width: '100%',
                }}
              />
            )}

            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="admin__image-preview admin__image-preview--category" />
            )}
          </div>
          {/* NOTE: Description */}
          <div className="admin__form-field">
            <label htmlFor="description">Description *</label>
            <textarea value={description} name="description" onChange={handleInputChange} required></textarea>
          </div>
        </div>
        <div className="admin__form-row">
          <div className="admin__form-field">
            <label htmlFor="status">Trạng thái</label>
            <select id="status" name="status" value={status} onChange={handleInputChange}>
              <option value="active">Kích hoạt</option>
              <option value="inactive">Ngừng kích hoạt</option>
            </select>
          </div>
          <div className="admin__form-field">
            <label htmlFor="isOutstanding">Nổi bật</label>
            <select id="isOutstanding" name="isOutstanding" value={isOutstanding} onChange={handleInputChange}>
              <option value={true}>Có</option>
              <option value={false}>Không</option>
            </select>
          </div>
        </div>
        <button type="submit" className="admin__form-button">
          Update Category
        </button>
      </form>
    </section>
  );
};

export default EditCategory;
