import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import slugify from 'slugify';

import { getCategories, addCategories, editCategory } from '@services/CategoryService.jsx';
import { loginSuccess } from '@/redux/authSlice.jsx';
import { createAxios } from '@utils/createInstance.jsx';
import PageLoad from '@pages/PageLoad';

const CategoryForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const axiosJWT = createAxios(user, dispatch, loginSuccess);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get('mode') || 'add';

  const [category, setCategory] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [isOutstanding, setIsOutstanding] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [customSlug, setCustomSlug] = useState(false);
  const [customImg, setCustomImg] = useState(false);
  const [loading, setLoading] = useState(false);

  // Thêm state để theo dõi các trường đã được nhập
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    description: false,
    status: false,
    isOutstanding: false,
  });

  // Load category data for edit mode
  useEffect(() => {
    if (mode === 'edit' && id) {
      const fetchCategory = async () => {
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
      fetchCategory();
    }
  }, [id, mode]);

  // Auto-generate slug when name changes (if not custom)
  useEffect(() => {
    if (!customSlug && name) {
      setSlug(slugify(name, { lower: true, strict: true }));
    }
  }, [name, customSlug]);

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
      toast.success('Bạn đã thêm ảnh danh mục!', {
        position: 'top-center',
        autoClose: 3000,
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

  // Hàm xử lý khi người dùng rời khỏi trường nhập liệu
  const handleBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));

    // Hiển thị thông báo nếu trường bắt buộc chưa được nhập
    if (!name && field === 'name') {
      toast.error('Vui lòng nhập tên danh mục', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          fontWeight: '500',
          fontSize: '1.6rem',
        },
        icon: '⚠️',
      });
    }

    if (!description && field === 'description') {
      toast.error('Vui lòng nhập mô tả danh mục', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          fontWeight: '500',
          fontSize: '1.6rem',
        },
        icon: '⚠️',
      });
    }

    if (!status && field === 'status') {
      toast.error('Vui lòng chọn trạng thái danh mục', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          fontWeight: '500',
          fontSize: '1.6rem',
        },
        icon: '⚠️',
      });
    }

    if (!isOutstanding && field === 'isOutstanding') {
      toast.error('Vui lòng chọn trạng thái nổi bật', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          fontWeight: '500',
          fontSize: '1.6rem',
        },
        icon: '⚠️',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra các trường bắt buộc
    if (!name) {
      toast.error('Vui lòng nhập tên danh mục', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          fontWeight: '500',
          fontSize: '1.6rem',
        },
        icon: '⚠️',
      });
      return;
    }

    if (!description) {
      toast.error('Vui lòng nhập mô tả danh mục', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          fontWeight: '500',
          fontSize: '1.6rem',
        },
        icon: '⚠️',
      });
      return;
    }

    if (!status) {
      toast.error('Vui lòng chọn trạng thái danh mục', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          fontWeight: '500',
          fontSize: '1.6rem',
        },
        icon: '⚠️',
      });
      return;
    }

    if (!isOutstanding) {
      toast.error('Vui lòng chọn trạng thái nổi bật', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          fontWeight: '500',
          fontSize: '1.6rem',
        },
        icon: '⚠️',
      });
      return;
    }

    const formData = new FormData();

    // Append data to FormData
    formData.append('name', name.trim());
    formData.append('slug', slug);
    formData.append('description', description.trim());
    formData.append('status', status);
    formData.append('isOutstanding', isOutstanding);

    if (image) {
      formData.append('image', image);
    }

    // For edit mode, only append changed fields
    if (mode === 'edit') {
      const newFormData = new FormData();
      if (name !== category?.name) newFormData.append('name', name.trim());
      if (slug !== category?.slug) newFormData.append('slug', slug);
      if (description !== category?.description) newFormData.append('description', description.trim());
      if (status !== category?.status) newFormData.append('status', status);
      if (isOutstanding !== category?.isOutstanding) newFormData.append('isOutstanding', isOutstanding);
      if (image) newFormData.append('image', image);

      if ([...newFormData.keys()].length === 0) {
        toast('Chưa có thông tin nào được thay đổi.', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            borderRadius: '8px',
            fontWeight: '500',
            fontSize: '1.6rem',
          },
          icon: '⚠️',
        });
        return;
      }
      setLoading(true);
      try {
        await editCategory(id, newFormData, accessToken, axiosJWT);
        navigate('/admin/categories');
      } catch (error) {
        console.error('Lỗi khi cập nhật:', error);
        toast.error('Cập nhật danh mục thất bại!');
      } finally {
        setLoading(false);
      }
    } else {
      // Add mode
      setLoading(true);
      try {
        await addCategories(formData, dispatch, accessToken, axiosJWT);
        navigate('/admin/categories');
      } catch (error) {
        console.error('Lỗi khi thêm danh mục:', error);
        toast.error('Thêm danh mục thất bại!');
      } finally {
        setLoading(false);
      }
    }
  };

  if (mode === 'edit' && !category) {
    return <div>Loading...</div>;
  }

  return (
    <section className="admin__section">
      {loading ? (
        <PageLoad zIndex="1" />
      ) : (
        <>
          <h2 className="admin__section-title">{mode === 'add' ? 'Thêm Danh Mục Mới' : 'Cập Nhật Danh Mục'}</h2>
          <form className="admin__form" onSubmit={handleSubmit}>
            <div className="admin__form-row">
              <div className="admin__form-field">
                <label htmlFor="name">
                  Tên Danh Mục <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('name')}
                  placeholder="Nhập tên danh mục"
                  required
                />
                {touchedFields.name && !name && (
                  <div className="field-error" style={{ color: '#dc3545', marginTop: '5px', fontSize: '1.4rem' }}>
                    Vui lòng nhập tên danh mục
                  </div>
                )}
              </div>
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
                <div className="field-hint" style={{ color: '#6c757d', fontSize: '1.2rem', marginTop: '5px' }}>
                  {!customSlug ? 'Slug sẽ tự động tạo từ tên danh mục' : 'Nhập slug tùy chỉnh cho danh mục'}
                </div>
              </div>
            </div>
            <div className="admin__form-row">
              <div className="admin__form-field">
                <label className="label__image" htmlFor="image">
                  {mode === 'edit' ? (
                    <>
                      Thay đổi ảnh
                      <input type="checkbox" checked={customImg} onChange={() => setCustomImg(!customImg)} />
                    </>
                  ) : (
                    'Ảnh Danh Mục'
                  )}
                </label>
                {mode === 'edit' && !customImg ? (
                  <input
                    type="text"
                    value={category?.image?.url || ''}
                    readOnly
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
                ) : (
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
                )}
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="admin__image-preview admin__image-preview--category"
                  />
                )}
                <div className="field-hint" style={{ color: '#6c757d', fontSize: '1.2rem', marginTop: '5px' }}>
                  {mode === 'edit' ? 'Chọn ảnh mới để thay thế ảnh hiện tại' : 'Tải lên ảnh đại diện cho danh mục'}
                </div>
              </div>
              <div className="admin__form-field">
                <label htmlFor="description">
                  Mô Tả <span className="required">*</span>
                </label>
                <textarea
                  name="description"
                  value={description}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('description')}
                  placeholder="Nhập mô tả danh mục"
                  required
                />
                {touchedFields.description && !description && (
                  <div className="field-error" style={{ color: '#dc3545', marginTop: '5px', fontSize: '1.4rem' }}>
                    Vui lòng nhập mô tả danh mục
                  </div>
                )}
              </div>
            </div>
            <div className="admin__form-row">
              <div className="admin__form-field">
                <label htmlFor="status">
                  Trạng Thái <span className="required">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={status}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('status')}
                  required
                >
                  <option value="">Chọn trạng thái</option>
                  <option value="active">Kích hoạt</option>
                  <option value="inactive">Ngừng kích hoạt</option>
                </select>
                {touchedFields.status && !status && (
                  <div className="field-error" style={{ color: '#dc3545', marginTop: '5px', fontSize: '1.4rem' }}>
                    Vui lòng chọn trạng thái danh mục
                  </div>
                )}
              </div>
              <div className="admin__form-field">
                <label htmlFor="isOutstanding">
                  Nổi Bật <span className="required">*</span>
                </label>
                <select
                  id="isOutstanding"
                  name="isOutstanding"
                  value={isOutstanding}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('isOutstanding')}
                  required
                >
                  <option value="">Chọn trạng thái</option>
                  <option value="true">Có</option>
                  <option value="false">Không</option>
                </select>
                {touchedFields.isOutstanding && !isOutstanding && (
                  <div className="field-error" style={{ color: '#dc3545', marginTop: '5px', fontSize: '1.4rem' }}>
                    Vui lòng chọn trạng thái nổi bật
                  </div>
                )}
              </div>
            </div>
            <button type="submit" className="admin__form-button">
              {mode === 'add' ? 'Thêm Danh Mục' : 'Cập Nhật Danh Mục'}
            </button>
          </form>
        </>
      )}
    </section>
  );
};

export default CategoryForm;
