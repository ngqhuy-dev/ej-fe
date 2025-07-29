import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '@components/common/ui/Modal';
import { getCategoriesAll } from '@services/CategoryService';
import { addProducts } from '@services/ProductService';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '@/redux/authSlice.jsx';
import { createAxios } from '@utils/createInstance.jsx';
import PageLoad from '@pages/PageLoad';
import toast from 'react-hot-toast';

const AddProduct = () => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    unit: '',
    discount: '',
    quantity: '',
    _idCategory: '',
    information: [],
    images: [],
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const axiosJWT = createAxios(user, dispatch, loginSuccess);

  const [imageFiles, setImageFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const information = newProduct.information || [];

  // Thêm state để theo dõi các trường đã được nhập
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    description: false,
    price: false,
    unit: false,
    quantity: false,
    _idCategory: false,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('🔍 Starting to fetch categories...');
        setLoading(true);
        setError(null);

        const data = await getCategoriesAll();

        if (data && Array.isArray(data)) {
          setCategories(data);
        } else {
          setError('Dữ liệu danh mục không hợp lệ');
        }
      } catch {
        setError('Không thể tải danh mục. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  //NOTE: Xử lý thay đổi hình ảnh
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const currentImageCount = newProduct.images.length;
    const maxImages = 5;

    if (currentImageCount + files.length > maxImages) {
      const remainingSlots = maxImages - currentImageCount;

      const filesToAdd = files.slice(0, remainingSlots);
      const imageURLs = filesToAdd.map((file) => URL.createObjectURL(file));

      setNewProduct((prev) => ({ ...prev, images: [...prev.images, ...imageURLs] }));
      setImageFiles((prev) => [...prev, ...filesToAdd]);
    } else {
      const imageURLs = files.map((file) => URL.createObjectURL(file));
      setNewProduct((prev) => ({ ...prev, images: [...prev.images, ...imageURLs] }));
      setImageFiles((prev) => [...prev, ...files]);
    }
    e.target.value = '';
  };

  // NOTE: Xóa hình ảnh xem trước
  const removeImagePreview = (indexToRemove) => {
    URL.revokeObjectURL(newProduct.images[indexToRemove]);

    setNewProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));

    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  //NOTE: Hàm thêm thuộc tính
  const handleAddAttribute = () => {
    const newInformation = [...information, { key: '', value: '' }];
    setNewProduct({ ...newProduct, information: newInformation });
  };

  //NOTE: Hàm xóa thuộc tính
  const handleRemoveAttribute = (index) => {
    const newInformation = information.filter((_, i) => i !== index);
    setNewProduct({ ...newProduct, information: newInformation });
  };

  //NOTE: Hàm cập nhật thuộc tính
  const handleAttributeChange = (index, field, value) => {
    const newInformation = [...information];
    newInformation[index][field] = value;
    setNewProduct({ ...newProduct, information: newInformation });
  };

  //NOTE: Hàm xử lý sự kiện khi nhấn nút "Thêm sản phẩm"
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct) {
      toast.error('Vui lòng nhập thống tin sản phẩm', {
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

    // Kiểm tra các trường bắt buộc
    if (!newProduct.name) {
      toast.error('Vui lòng nhập tên sản phẩm', {
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

    if (!newProduct.description) {
      toast.error('Vui lòng nhập mô tả sản phẩm', {
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

    if (!newProduct.price) {
      toast.error('Vui lòng nhập giá sản phẩm', {
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

    if (!newProduct.unit) {
      toast.error('Vui lòng chọn đơn vị sản phẩm', {
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

    if (!newProduct.quantity) {
      toast.error('Vui lòng nhập số lượng sản phẩm', {
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

    if (!newProduct._idCategory) {
      toast.error('Vui lòng chọn danh mục sản phẩm', {
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
    setTimeout(() => {
      setIsAddModalOpen(true);
      setLoading(false);
    }, 500);
  };

  //NOTE: Hàm xác nhận thêm sản phẩm
  const confirmAddProduct = async () => {
    try {
      setLoading(true);

      // Tạo FormData để gửi dữ liệu multipart/form-data
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('description', newProduct.description);
      formData.append('price', newProduct.price);
      formData.append('discount', newProduct.discount || 0);
      formData.append('quantity', newProduct.quantity || 0);
      formData.append('_idCategory', newProduct._idCategory);
      formData.append('unit', newProduct.unit || ''); // Thêm trường unit

      // Thêm các ảnh vào formData với cùng tên field
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      // Thêm thông tin sản phẩm (nếu có)
      if (newProduct.information && newProduct.information.length > 0) {
        formData.append('information', JSON.stringify(newProduct.information));
      }
      // Gọi API
      await addProducts(formData, dispatch, accessToken, axiosJWT);

      // Reset form và chuyển hướng
      setNewProduct({
        name: '',
        description: '',
        price: '',
        discount: '',
        quantity: '',
        _idCategory: '',
        unit: '',
        images: [],
        information: [],
      });
      setImageFiles([]);
      setIsAddModalOpen(false);
      navigate('/admin/products');
    } catch (error) {
      console.error('Error adding product:', error);
      setError(error.response?.data?.message || 'Không thể thêm sản phẩm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi người dùng rời khỏi trường nhập liệu
  const handleBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));

    // Hiển thị thông báo nếu trường bắt buộc chưa được nhập
    if (!newProduct[field] && field !== 'discount') {
      toast.error(`Vui lòng nhập ${getFieldLabel(field)}`, {
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

  // Hàm lấy nhãn cho trường
  const getFieldLabel = (field) => {
    switch (field) {
      case 'name':
        return 'tên sản phẩm';
      case 'description':
        return 'mô tả sản phẩm';
      case 'price':
        return 'giá sản phẩm';
      case 'unit':
        return 'đơn vị sản phẩm';
      case 'quantity':
        return 'số lượng sản phẩm';
      case '_idCategory':
        return 'danh mục sản phẩm';
      default:
        return field;
    }
  };

  return (
    <section className="admin-section">
      {loading ? (
        <PageLoad zIndex="1" />
      ) : (
        <>
          <div className="admin-section__header">
            <h2 className="admin-section__title">Thêm sản phẩm</h2>
          </div>
          <form className="admin__form" id="form-addProduct" onSubmit={handleAddProduct}>
            <div className="admin__form-row">
              <div className="admin__form-field">
                <label htmlFor="product-name">
                  Tên sản phẩm <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="product-name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  onBlur={() => handleBlur('name')}
                  placeholder="Nhập tên sản phẩm"
                />
                {touchedFields.name && !newProduct.name && (
                  <div className="field-error" style={{ color: '#dc3545', marginTop: '5px', fontSize: '1.4rem' }}>
                    Vui lòng nhập tên sản phẩm
                  </div>
                )}
              </div>
              <div className="admin__form-field">
                <label htmlFor="product-description">
                  Mô tả <span className="required">*</span>
                </label>
                <textarea
                  id="product-description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  onBlur={() => handleBlur('description')}
                  placeholder="Nhập mô tả sản phẩm"
                />
                {touchedFields.description && !newProduct.description && (
                  <div className="field-error" style={{ color: '#dc3545', marginTop: '5px', fontSize: '1.4rem' }}>
                    Vui lòng nhập mô tả sản phẩm
                  </div>
                )}
              </div>
            </div>
            <div className="admin__form-row">
              <div className="admin__form-field">
                <label htmlFor="product-price">
                  Giá (/1 sản phẩm) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="product-price"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  onBlur={() => handleBlur('price')}
                  step="100"
                  min="0"
                  placeholder="Nhập giá sản phẩm"
                />
                {touchedFields.price && !newProduct.price && (
                  <div className="field-error" style={{ color: '#dc3545', marginTop: '5px', fontSize: '1.4rem' }}>
                    Vui lòng nhập giá sản phẩm
                  </div>
                )}
              </div>
              <div className="admin__form-field admin__form-field--unit">
                <label htmlFor="product-unit">
                  Đơn vị <span className="required">*</span>
                </label>
                <select
                  className="custom-select"
                  id="product-unit"
                  value={newProduct.unit}
                  onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                  onBlur={() => handleBlur('unit')}
                >
                  <option value="">Chọn đơn vị</option>
                  <optgroup label="🔢 Đơn vị khối lượng">
                    <option value="g">Gram (g)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="hg">Hectogram (lạng – 100g)</option>
                    <option value="tạ">Tạ (100kg)</option>
                    <option value="yến">Yến (10kg)</option>
                  </optgroup>

                  <optgroup label="💧 Đơn vị thể tích">
                    <option value="ml">Millilít (ml)</option>
                    <option value="l">Lít (L)</option>
                    <option value="chai">Chai</option>
                    <option value="thùng">Thùng</option>
                    <option value="lon">Lon</option>
                  </optgroup>

                  <optgroup label="📦 Đơn vị đóng gói / đếm">
                    <option value="gói">Gói</option>
                    <option value="túi">Túi</option>
                    <option value="hộp">Hộp</option>
                    <option value="vỉ">Vỉ</option>
                    <option value="cái">Cái</option>
                    <option value="miếng">Miếng</option>
                    <option value="bó">Bó</option>
                    <option value="quả">Quả</option>
                    <option value="trái">Trái</option>
                    <option value="bịch">Bịch</option>
                    <option value="bình">Bình</option>
                  </optgroup>

                  <optgroup label="📦 Combo / gói sản phẩm">
                    <option value="combo">Combo</option>
                    <option value="set">Set</option>
                    <option value="thùng-lẻ">Thùng (chia lẻ)</option>
                  </optgroup>
                </select>
                {touchedFields.unit && !newProduct.unit && (
                  <div className="field-error" style={{ color: '#dc3545', marginTop: '5px', fontSize: '1.4rem' }}>
                    Vui lòng chọn đơn vị sản phẩm
                  </div>
                )}
              </div>

              <div className="admin__form-field">
                <label htmlFor="product-discount">Giảm giá (%)</label>
                <input
                  type="number"
                  id="product-discount"
                  value={newProduct.discount}
                  onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                  step="1"
                  min={0}
                  max={100}
                  placeholder="Nhập % giảm giá (nếu có)"
                />
              </div>
              <div className="admin__form-field">
                <label htmlFor="product-quantity">
                  Số lượng <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="product-quantity"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                  onBlur={() => handleBlur('quantity')}
                  min="0"
                  placeholder="Nhập số lượng sản phẩm"
                />
                {touchedFields.quantity && !newProduct.quantity && (
                  <div className="field-error" style={{ color: '#dc3545', marginTop: '5px', fontSize: '1.4rem' }}>
                    Vui lòng nhập số lượng sản phẩm
                  </div>
                )}
              </div>
              <div className="admin__form-field">
                <label htmlFor="product-category">
                  Thuộc danh mục <span className="required">*</span>
                </label>
                <select
                  className="custom-select select-category"
                  type="text"
                  id="product-category"
                  value={newProduct._idCategory}
                  onChange={(e) => setNewProduct({ ...newProduct, _idCategory: e.target.value })}
                  onBlur={() => handleBlur('_idCategory')}
                  disabled={loading || error}
                >
                  {loading ? (
                    <option value="" disabled>
                      Đang tải danh mục...
                    </option>
                  ) : error ? (
                    <option value="" disabled>
                      {error}
                    </option>
                  ) : (
                    <>
                      <option
                        style={{
                          color: '#999', // Màu xám nhạt để trông như placeholder
                          fontStyle: 'italic', // Chữ nghiêng để phân biệt
                          backgroundColor: '#f5f5f5', // Nền nhạt
                        }}
                        value=""
                      >
                        Chọn danh mục
                      </option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                          {newProduct._idCategory === category._id ? ' (Đã chọn)' : ''}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                {touchedFields._idCategory && !newProduct._idCategory && (
                  <div className="field-error" style={{ color: '#dc3545', marginTop: '5px', fontSize: '1.4rem' }}>
                    Vui lòng chọn danh mục sản phẩm
                  </div>
                )}
              </div>
            </div>
            <div className="admin__form-row">
              <div className="admin__form-field">
                <label htmlFor="product-images">Hình ảnh sản phẩm (Tối đa 5)</label>
                <input type="file" id="product-images" accept="image/*" multiple onChange={handleImageChange} />
                {newProduct.images.length > 5 && (
                  <div className="field-error" style={{ color: '#dc3545', marginTop: '5px', fontSize: '1.4rem' }}>
                    Vui lòng chọn tối đa 5 hình ảnh
                  </div>
                )}
                {newProduct.images.length > 0 && (
                  <div className="image-preview-container">
                    {newProduct.images.map((image, index) => (
                      <div key={index} className="image-preview-item">
                        <img src={image} alt={`Preview ${index + 1}`} className="admin__image-preview" />
                        <button
                          type="button"
                          className="image-preview-remove"
                          onClick={() => removeImagePreview(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="admin__form-row">
              <div className="admin__form-field">
                <label className="product-attributes" htmlFor="product-attributes">
                  Thuộc tính sản phẩm (tùy chọn)
                </label>
                <div className="form-table-container">
                  <table className="form-table">
                    <thead>
                      <tr>
                        <th className="attr-name-col">Tên thuộc tính</th>
                        <th className="attr-value-col">Giá trị</th>
                        <th className="attr-action-col">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {information.map((attribute, index) => (
                        <tr key={index}>
                          <td className="attr-name-col">
                            <input
                              type="text"
                              value={attribute.key}
                              onChange={(e) => handleAttributeChange(index, 'key', e.target.value)}
                              placeholder="Nhập tên thuộc tính"
                              disabled={loading}
                              className="attribute-input"
                            />
                          </td>
                          <td className="attr-value-col">
                            <textarea
                              value={attribute.value}
                              onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                              placeholder="Nhập giá trị thuộc tính"
                              disabled={loading}
                              className="attribute-textarea"
                            />
                          </td>
                          <td className="attr-action-col">
                            <button
                              type="button"
                              onClick={() => handleRemoveAttribute(index)}
                              disabled={loading}
                              className="remove-btn"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                      {information.length === 0 && (
                        <tr>
                          <td colSpan="3" className="no-attributes">
                            Chưa có thuộc tính nào. Hãy thêm thuộc tính cho sản phẩm.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div className="table-actions">
                    <button type="button" onClick={handleAddAttribute} className="add-btn">
                      Thêm thuộc tính
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="admin__form-button" disabled={loading}>
              {loading ? 'Đang thêm...' : 'Thêm sản phẩm'}
            </button>
          </form>

          <Modal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onConfirm={confirmAddProduct}
            title="Vui lòng xác nhận lại"
            message={`Bạn chắc chắn muốn thêm sản phẩm "${newProduct.name}" này?`}
          />
        </>
      )}
    </section>
  );
};

export default AddProduct;
