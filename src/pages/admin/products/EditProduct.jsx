import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCategoriesAll } from '@services/CategoryService';
import { editProduct, getProduct } from '@services/ProductService';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '@/redux/authSlice.jsx';
import { createAxios } from '@utils/createInstance.jsx';
import PageLoad from '@pages/PageLoad';
import toast from 'react-hot-toast';
import Modal from '@components/common/ui/Modal';

const EditProduct = () => {
  //NOTE: navigate and dispatch
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //NOTE: authentication , token, and axios instance
  const { id } = useParams();
  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const axiosJWT = createAxios(user, dispatch, loginSuccess);

  //NOTE: product information
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('');
  const [discount, setDiscount] = useState('');
  const [quantity, setQuantity] = useState('');
  const [_idCategory, setIdCategory] = useState('');
  const [information, setInformation] = useState([]);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  //NOTE: loading, error, and modal states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customImg, setCustomImg] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('🔍 Starting to fetch categories...');
        setLoading(true);
        setError(null);

        const data = await getCategoriesAll();
        console.log(`✅ Fetched ${data.length} categories`);

        if (data && Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error('❌ Received invalid data format:', data);
          setError('Dữ liệu danh mục không hợp lệ');
        }
      } catch (err) {
        console.error('❌ Error in fetchCategories:', err);

        setError('Không thể tải danh mục. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProduct(id);
        setProduct(data);
        setName(data.name);
        setDescription(data.description);
        setPrice(data.price);
        setUnit(data.unit);
        setDiscount(data.discount);
        setQuantity(data.quantity);
        setIdCategory(data._idCategory._id);
        setInformation(data.information || []);
        setImages(data.images || []);
        setImageFiles([]);
        setImagesToDelete([]);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin sản phẩm:', error);
        toast.error('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  //NOTE: Dọn dẹp URL của hình ảnh mới
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.url && img.url.startsWith('blob:')) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [images]);

  //NOTE: Xử lý thay đổi hình ảnh
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      url: URL.createObjectURL(file),
      isNew: true,
    }));
    setImages((prev) => [...prev, ...newImages]);
    setImageFiles((prev) => [...prev, ...files]);
  };

  //NOTE: Xóa hình ảnh xem trước
  const removeImagePreview = (indexToRemove) => {
    const imageToRemove = images[indexToRemove];

    setImages((prev) => {
      if (imageToRemove.url && imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter((_, index) => index !== indexToRemove);
    });
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));

    // Nếu ảnh không phải mới, thêm publicId vào imagesToDelete
    if (!imageToRemove.isNew && imageToRemove.publicId) {
      setImagesToDelete((prev) => [...prev, imageToRemove.publicId]);
    }
  };

  //NOTE: Hàm thêm thuộc tính
  const handleAddAttribute = () => {
    const newInformation = [...information, { key: '', value: '' }];
    setInformation(newInformation);
  };

  //NOTE: Hàm xóa thuộc tính
  const handleRemoveAttribute = (index) => {
    const newInformation = information.filter((_, i) => i !== index);
    setInformation(newInformation);
  };

  //NOTE: Hàm cập nhật thuộc tính
  const handleAttributeChange = (index, field, value) => {
    const newInformation = [...information];
    newInformation[index][field] = value;
    setInformation(newInformation);
  };

  //NOTE: Hàm xử lý sự kiện khi nhấn nút "Cập nhật sản phẩm"
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setIsConfirmModalOpen(true);
      setLoading(false);
    }, 500);
  };

  //NOTE: Hàm xác nhận cập nhật sản phẩm
  const confirmUpdateProduct = async () => {
    try {
      setLoading(true);

      // Chuẩn bị formData cho cập nhật
      const formData = new FormData();
      if (name !== product.name) {
        formData.append('name', name);
      }
      if (description !== product.description) {
        formData.append('description', description);
      }
      if (price !== product.price) {
        formData.append('price', price);
      }
      if (unit !== product.unit) {
        formData.append('unit', unit);
      }
      if (discount !== product.discount) {
        formData.append('discount', discount);
      }
      if (quantity !== product.quantity) {
        formData.append('quantity', quantity);
      }
      if (_idCategory !== product._idCategory._id) {
        formData.append('_idCategory', _idCategory);
      }
      if (JSON.stringify(information) !== JSON.stringify(product.information)) {
        formData.append('information', JSON.stringify(information));
      }
      if (imagesToDelete.length > 0) {
        formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
      }
      imageFiles.forEach((file) => formData.append('images', file));

      if ([...formData.keys()].length === 0 && imagesToDelete.length === 0) {
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
        setIsConfirmModalOpen(false);
        return;
      }

      await editProduct(id, formData, accessToken, axiosJWT);
      setImagesToDelete([]);
      setIsConfirmModalOpen(false);
      navigate('/admin/products');
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      toast.error('Không thể cập nhật sản phẩm. Vui lòng thử lại sau.');
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
            <h2 className="admin-section__title">Cập nhật sản phẩm</h2>
          </div>
          <form className="admin__form" id="form-editProduct" onSubmit={handleSubmit}>
            <div className="admin__form-row">
              {/* COMMENT: Tên sản phẩm */}
              <div className="admin__form-field">
                <label htmlFor="product-name">Tên sản phẩm</label>
                <input
                  type="text"
                  name="name"
                  id="product-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              {/* COMMENT: Mô tả */}
              <div className="admin__form-field">
                <label htmlFor="product-description">Mô tả</label>
                <textarea
                  id="product-description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="admin__form-row">
              {/* COMMENT: Giá */}
              <div className="admin__form-field">
                <label htmlFor="product-price">Giá (/1 sản phẩm)</label>
                <input
                  type="number"
                  id="product-price"
                  value={price}
                  name="price"
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  step="100"
                  min="0"
                />
              </div>
              {/* COMMENT: Đơn vị */}
              <div className="admin__form-field admin__form-field--unit">
                <label htmlFor="product-unit">Đơn vị</label>
                <select
                  className="custom-select"
                  id="product-unit"
                  value={unit}
                  name="unit"
                  onChange={(e) => setUnit(e.target.value)}
                  required
                >
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
              </div>
              {/* COMMENT: Giảm giá */}
              <div className="admin__form-field">
                <label htmlFor="product-discount">Giảm giá (%)</label>
                <input
                  type="number"
                  id="product-discount"
                  value={discount}
                  name="discount"
                  onChange={(e) => setDiscount(e.target.value)}
                  step="1"
                  min={0}
                  max={100}
                />
              </div>
              {/* COMMENT: Số lượng */}
              <div className="admin__form-field">
                <label htmlFor="product-quantity">Số lượng</label>
                <input
                  type="number"
                  id="product-quantity"
                  name="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  min="0"
                />
              </div>
              {/* COMMENT: Danh mục */}
              <div className="admin__form-field">
                <label htmlFor="product-category">Thuộc danh mục</label>
                <select
                  className="custom-select select-category"
                  type="text"
                  id="product-category"
                  name="category"
                  value={_idCategory}
                  onChange={(e) => setIdCategory(e.target.value)}
                  required
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
                      {!_idCategory ? (
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
                      ) : (
                        ''
                      )}
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                          {product && product._idCategory._id !== category._id
                            ? _idCategory === category._id
                              ? ' (Đã chọn)'
                              : ''
                            : ''}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            </div>
            {/* COMMENT: Hình ảnh */}
            <div className="admin__form-row">
              <div className="admin__form-field">
                <label className="label__image" htmlFor="image">
                  {customImg ? 'Images' : 'Thay đổi ảnh'}
                  <input type="checkbox" checked={customImg} onChange={() => setCustomImg(!customImg)} />
                </label>
                {customImg ? (
                  <input
                    type="file"
                    id="product-images"
                    name="image"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    style={{
                      backgroundColor: 'white',
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    value={`${images.length} hình ảnh`}
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
                {images.length > 0 && (
                  <div className="image-preview-container">
                    {images.map((image, index) => (
                      <div key={index} className="image-preview-item">
                        <img src={image.url} alt={`Preview ${index + 1}`} className="admin__image-preview" />
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

            {/* COMMENT: Thuộc tính sản phẩm */}
            <div className="admin__form-row">
              <div className="admin__form-field">
                <label className="product-attributes" htmlFor="product-attributes">
                  Thuộc tính sản phẩm
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
            <button
              type="submit"
              className="admin__form-button"
              disabled={loading || !name || !price || !_idCategory || !unit}
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
            </button>
          </form>

          <Modal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={confirmUpdateProduct}
            title="Vui lòng xác nhận lại"
            message={`Bạn chắc chắn muốn cập nhật sản phẩm "${name}" này?`}
          />
        </>
      )}
    </section>
  );
};

export default EditProduct;
