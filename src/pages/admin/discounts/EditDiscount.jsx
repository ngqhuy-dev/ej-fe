import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from '@components/common/ui/Modal';
import { editDiscount, getDiscountById } from '@services/DiscountService';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '@/redux/authSlice.jsx';
import { createAxios } from '@utils/createInstance.jsx';
import PageLoad from '@pages/PageLoad';
import toast from 'react-hot-toast';
import moment from 'moment/moment';

const EditDiscount = () => {
  const [newDiscount, setNewDiscount] = useState({
    code: '',
    type: 'percentage', // fixed or percentage
    value: '', // for fixed discount
    maxPercent: '', // for percentage discount
    minOrderAmount: '',
    activation: '',
    expiration: '',
    quantityLimit: '',
    isActive: true,
  });
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const axiosJWT = createAxios(user, dispatch, loginSuccess);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Thêm state để theo dõi các trường đã được nhập
  const [touchedFields, setTouchedFields] = useState({
    code: false,
    type: false,
    value: false,
    maxPercent: false,
    minOrderAmount: false,
    activation: false,
    expiration: false,
    quantityLimit: false,
    isActive: true,
  });

  useEffect(() => {
    try {
      const fetchDiscount = async () => {
        const data = await getDiscountById(id);
        setNewDiscount({
          code: data.code,
          discount: data.discount,
          minOrderAmount: data.minOrderAmount,
          type: data.type,
          value: data.value,
          maxPercent: data.maxPercent,
          activation: moment(data.activation).format('YYYY-MM-DD'),
          expiration: moment(data.expiration).format('YYYY-MM-DD'),
          quantityLimit: data.quantityLimit,
          isActive: data.isActive,
        });
      };
      fetchDiscount();
      return () => {
        setNewDiscount({
          code: '',
          discount: '',
          activation: '',
          expiration: '',
          quantityLimit: '',
          isActive: '',
        });
      };
    } catch (error) {
      console.error('Lỗi khi lấy thông tin sản phẩm:', error);
      toast.error('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, []);

  //NOTE: Hàm xử lý sự kiện khi nhấn nút "Thêm sản phẩm"
  const handleEditDiscount = (e) => {
    e.preventDefault();

    setLoading(true);
    setTimeout(() => {
      setIsAddModalOpen(true);
      setLoading(false);
    }, 500);
  };

  //NOTE: Hàm xác nhận thêm sản phẩm
  const confirmEditDiscount = async () => {
    try {
      setLoading(true);

      // Tạo đối tượng dữ liệu theo format của controller
      const formData = {
        code: newDiscount.code.trim().toUpperCase(),
        type: newDiscount.type,
        minOrderAmount: Number(newDiscount.minOrderAmount),
        activation: new Date(newDiscount.activation).toISOString(),
        expiration: new Date(newDiscount.expiration).toISOString(),
        quantityLimit: Number(newDiscount.quantityLimit),
        isActive: Boolean(newDiscount.isActive),
      };

      // Add value or maxPercent based on type
      if (newDiscount.type === 'fixed') {
        formData.value = Number(newDiscount.value);
      } else {
        formData.maxPercent = Number(newDiscount.maxPercent);
      }

      // Gọi API
      await editDiscount(id, formData, accessToken, axiosJWT);

      // Reset form và chuyển hướng
      setNewDiscount({
        code: '',
        type: 'percentage',
        value: '',
        maxPercent: '',
        minOrderAmount: '',
        activation: '',
        expiration: '',
        quantityLimit: '',
        isActive: true,
      });
      setIsAddModalOpen(false);
      navigate('/admin/discounts');
    } catch (error) {
      console.error('Error adding discount:', error);
      setError(error.response?.data?.message || 'Không thể thêm sản phẩm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi người dùng rời khỏi trường nhập liệu
  const handleBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));

    // Hiển thị thông báo nếu trường bắt buộc chưa được nhập
    if (!newDiscount[field]) {
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
      case 'code':
        return 'mã giảm giá';
      case 'type':
        return 'loại giảm giá';
      case 'value':
        return 'giá trị giảm giá';
      case 'maxPercent':
        return 'phần trăm giảm giá';
      case 'minOrderAmount':
        return 'số tiền áp dụng';
      case 'activation':
        return 'ngày kích hoạt';
      case 'expiration':
        return 'ngày hết hạn';
      case 'quantityLimit':
        return 'số lượng giới hạn';
      default:
        return field;
    }
  };

  return (
    <section className="admin-section">
      {loading && <PageLoad zIndex="1" />}

      <div className="admin-section__header">
        <h2 className="admin-section__title">Sửa mã giảm giá</h2>
      </div>

      <form className="admin__form" id="form-addDiscount" onSubmit={handleEditDiscount}>
        <div className="admin__form-row">
          <div className="admin__form-field">
            <label htmlFor="discount-code">
              Mã giảm giá <span className="required">*</span>
            </label>
            <input
              type="text"
              id="discount-code"
              value={newDiscount.code}
              onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
              onBlur={() => handleBlur('code')}
              required
              placeholder="Nhập mã giảm giá"
            />
            {touchedFields.code && !newDiscount.code && (
              <div className="field-error" style={{ color: '#dc3545', marginTop: '5px', fontSize: '1.4rem' }}>
                Vui lòng nhập mã giảm giá
              </div>
            )}
          </div>
        </div>

        <div className="admin__form-row">
          <div className="admin__form-field">
            <label htmlFor="discount-type">
              Loại giảm giá <span className="required">*</span>
            </label>
            <select
              id="discount-type"
              value={newDiscount.type}
              onChange={(e) => {
                setNewDiscount({
                  ...newDiscount,
                  type: e.target.value,
                  value: '',
                  maxPercent: '',
                });
              }}
              onBlur={() => handleBlur('type')}
              required
            >
              <option value="percentage">Giảm theo phần trăm (%)</option>
              <option value="fixed">Giảm cố định (VND)</option>
            </select>
          </div>

          {newDiscount.type === 'percentage' ? (
            <div className="admin__form-field">
              <label htmlFor="discount-maxPercent">
                Phần trăm giảm giá (%) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="discount-maxPercent"
                value={newDiscount.maxPercent}
                onChange={(e) => setNewDiscount({ ...newDiscount, maxPercent: e.target.value })}
                step="1"
                min="0"
                max="100"
                onBlur={() => handleBlur('maxPercent')}
                placeholder="Nhập % giảm giá (0-100)"
                required
              />
              {touchedFields.maxPercent && !newDiscount.maxPercent && (
                <div className="field-error" style={{ color: '#dc3545', marginTop: '5px', fontSize: '1.4rem' }}>
                  Vui lòng nhập phần trăm giảm giá
                </div>
              )}
            </div>
          ) : (
            <div className="admin__form-field">
              <label htmlFor="discount-value">
                Giá trị giảm giá (VND) <span className="required">* </span>
              </label>
              <input
                type="number"
                id="discount-value"
                value={newDiscount.value}
                onChange={(e) => setNewDiscount({ ...newDiscount, value: e.target.value })}
                min="0"
                onBlur={() => handleBlur('value')}
                placeholder="Nhập số tiền giảm"
                required
              />
              {touchedFields.value && !newDiscount.value && (
                <div className="field-error" style={{ color: '#dc3545', marginTop: '5px', fontSize: '1.4rem' }}>
                  Vui lòng nhập giá trị giảm giá
                </div>
              )}
            </div>
          )}

          <div className="admin__form-field">
            <label htmlFor="discount-minOrderAmount">
              Đơn hàng tối thiểu (VND) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="discount-minOrderAmount"
              value={newDiscount.minOrderAmount}
              onChange={(e) => setNewDiscount({ ...newDiscount, minOrderAmount: e.target.value })}
              onBlur={() => handleBlur('minOrderAmount')}
              min="0"
              required
              placeholder="Nhập số tiền đơn hàng tối thiểu"
            />
            {touchedFields.minOrderAmount && !newDiscount.minOrderAmount && (
              <div className="field-error" style={{ color: '#dc3545', marginTop: '5px', fontSize: '1.4rem' }}>
                Vui lòng nhập số tiền đơn hàng tối thiểu
              </div>
            )}
          </div>
        </div>

        <div className="admin__form-row">
          <div className="admin__form-field">
            <label htmlFor="discount-activation">
              Ngày kích hoạt <span className="required">*</span>
            </label>
            <input
              type="date"
              id="discount-activation"
              value={newDiscount.activation}
              onChange={(e) => setNewDiscount({ ...newDiscount, activation: e.target.value })}
              onBlur={() => handleBlur('activation')}
              required
              min={moment().format('YYYY-MM-DD')}
            />
            {touchedFields.activation && !newDiscount.activation && (
              <div className="field-error" style={{ color: '#dc3545', marginTop: '5px', fontSize: '1.4rem' }}>
                Vui lòng chọn ngày kích hoạt
              </div>
            )}
          </div>

          <div className="admin__form-field">
            <label htmlFor="discount-expiration">
              Ngày hết hạn <span className="required">*</span>
            </label>
            <input
              type="date"
              id="discount-expiration"
              value={newDiscount.expiration}
              onChange={(e) => setNewDiscount({ ...newDiscount, expiration: e.target.value })}
              onBlur={() => handleBlur('expiration')}
              required
              min={newDiscount.activation || moment().format('YYYY-MM-DD')}
            />
            {touchedFields.expiration && !newDiscount.expiration && (
              <div className="field-error" style={{ color: '#dc3545', marginTop: '5px', fontSize: '1.4rem' }}>
                Vui lòng chọn ngày hết hạn
              </div>
            )}
            {/* Kiểm tra logic ngày hết hạn phải sau ngày kích hoạt */}
            {newDiscount.activation && newDiscount.expiration && newDiscount.expiration <= newDiscount.activation && (
              <div className="field-error" style={{ color: '#dc3545', marginTop: '5px', fontSize: '1.4rem' }}>
                Ngày hết hạn phải sau ngày kích hoạt
              </div>
            )}
          </div>

          <div className="admin__form-field">
            <label htmlFor="discount-quantityLimit">
              Số lượng giới hạn <span className="required">*</span>
            </label>
            <input
              type="number"
              id="discount-quantityLimit"
              value={newDiscount.quantityLimit}
              onChange={(e) => setNewDiscount({ ...newDiscount, quantityLimit: e.target.value })}
              onBlur={() => handleBlur('quantityLimit')}
              required
              min="1"
              placeholder="Nhập số lượng mã giảm giá có thể sử dụng"
            />
            {touchedFields.quantityLimit && !newDiscount.quantityLimit && (
              <div className="field-error" style={{ color: '#dc3545', marginTop: '5px', fontSize: '1.4rem' }}>
                Vui lòng nhập số lượng giới hạn
              </div>
            )}
          </div>
        </div>

        <div className="admin__form-row">
          <div className="admin__form-field checkbox">
            <input
              id="discount-isActive"
              type="checkbox"
              checked={newDiscount.isActive}
              onChange={(e) => setNewDiscount({ ...newDiscount, isActive: e.target.checked })}
            />
            <label htmlFor="discount-isActive" className="checkbox-label">
              Kích hoạt mã giảm giá ngay
            </label>
          </div>
        </div>

        {error && (
          <div className="error-message" style={{ color: '#dc3545', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <button type="submit" className="admin__form-button" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Xác nhận`'}
        </button>
      </form>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={confirmEditDiscount}
        title="Xác nhận thêm mã giảm giá"
        message={`Bạn có chắc chắn muốn thêm mã giảm giá "${newDiscount.code}"?`}
      />
    </section>
  );
};

export default EditDiscount;
