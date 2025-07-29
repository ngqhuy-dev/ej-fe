import moment from 'moment';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Modal from '@components/common/ui/Modal';
import Pagination from '@components/common/ui/Pagination';
import { getAllDiscount, toggleDiscountStatus, deleteDiscount } from '@services/DiscountService';
import { loginSuccess } from '@/redux/authSlice.jsx';
import { createAxios } from '@utils/createInstance.jsx';

const Discount = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [originalDiscount, setOriginalDiscount] = useState([]);
  const [discount, setDiscount] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idDiscountDel, setIdDiscountDel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const axiosJWT = createAxios(user, dispatch, loginSuccess);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        console.log('🔍 Starting to fetch discounts...');
        setLoading(true);
        setError(null);

        const data = await getAllDiscount();
        console.log(`✅ Fetched ${data.length} discounts`);

        if (data && Array.isArray(data)) {
          setOriginalDiscount(data);
          setDiscount(data);
        } else {
          console.error('❌ Received invalid data format:', data);
          setError('Dữ liệu mã giảm giá không hợp lệ');
          setOriginalDiscount([]);
          setDiscount([]);
        }
      } catch (err) {
        console.error('❌ Error in fetchDiscount:', err);
        setError('Không thể tải mã giảm giá. Vui lòng thử lại sau.');
        setOriginalDiscount([]);
        setDiscount([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscount();
  }, []);

  // NOTE: Handle filter
  const handleFilter = (e) => {
    const status = e.target.value;
    if (status === 'all') {
      setDiscount(originalDiscount);
    } else {
      const isActive = status === 'active';
      const filteredDiscount = originalDiscount.filter((discount) => discount.isActive === isActive);
      setDiscount(filteredDiscount);
    }
    setCurrentPage(1); // Reset to first page
  };

  // NOTE: Handle Search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setDiscount(originalDiscount);
    } else {
      const filtered = originalDiscount.filter((item) => item.code.toLowerCase().includes(searchTerm.toLowerCase()));
      setDiscount(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, originalDiscount]);

  // NOTE: Handle View/Toggle Active Status
  const handleToggleActive = async (id, isActive) => {
    try {
      console.log(`👁️ Toggling discount status: ${id} from ${isActive ? 'active' : 'inactive'}`);

      await toggleDiscountStatus(id, accessToken, axiosJWT);
      const newStatus = !isActive;

      setDiscount((prev) => prev.map((item) => (item._id === id ? { ...item, isActive: newStatus } : item)));

      setOriginalDiscount((prev) => prev.map((item) => (item._id === id ? { ...item, isActive: newStatus } : item)));
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật trạng thái:', error);
    }
  };

  // NOTE: Handle Delete
  const handleDeleteDiscount = (id) => {
    console.log(`🗑️ Opening delete modal for discount: ${id}`);
    setIdDiscountDel(id);
    setIsDeleteModalOpen(true);
  };

  // NOTE: Confirm Delete
  const confirmDeleteDiscount = async () => {
    setLoading(true);
    console.log(`🗑️ Deleting discount: ${idDiscountDel}`);

    try {
      await deleteDiscount(idDiscountDel, accessToken, axiosJWT);
      setDiscount((prev) => prev.filter((item) => item._id !== idDiscountDel));
      setOriginalDiscount((prev) => prev.filter((item) => item._id !== idDiscountDel));
    } catch (err) {
      console.error('❌ Lỗi khi xóa mã giảm giá:', err);
    } finally {
      setIsDeleteModalOpen(false);
      setIdDiscountDel(null);
      setLoading(false);
    }
  };

  // NOTE: Handle Edit
  const handleEditDiscount = (id) => {
    navigate(`/admin/discounts/edit/${id}`);
  };

  // NOTE: Handle Add
  const handleAddDiscount = () => {
    navigate('/admin/discounts/add');
  };

  const totalPages = Math.ceil(discount.length / itemsPerPage);
  const currentDiscounts = discount.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatDate = (isoDate) => moment(isoDate).format('DD/MM/YYYY');

  // Check if discount is expired
  const isExpired = (expirationDate) => {
    return moment().isAfter(moment(expirationDate));
  };

  if (error) return <div className="error-message">{error}</div>;

  return (
    <section className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Quản lý mã giảm giá ({discount.length})</h2>
        <button className="admin-add__button" onClick={handleAddDiscount}>
          + Thêm Mới
        </button>
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
        <select className="select-filter" onChange={handleFilter}>
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang kích hoạt</option>
          <option value="inactive">Không kích hoạt</option>
        </select>
      </div>
      <div className="admin-section__content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <div className="block__table">
              <table className="admin__table ">
                <thead>
                  <tr>
                    <th>Trạng thái</th>
                    <th>Mã giảm giá</th>
                    <th>Loại</th>
                    <th>Giá trị giảm</th>
                    <th>Đơn hàng từ</th>
                    <th>Bắt đầu</th>
                    <th>Hết hạn</th>
                    <th>Đã dùng</th>
                    <th>Giới hạn</th>
                    <th>Tùy chỉnh</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDiscounts.length === 0 ? (
                    <tr>
                      <td colSpan="100%" className="no-data">
                        Không có đơn hàng nào
                      </td>
                    </tr>
                  ) : (
                    currentDiscounts.map((item) => {
                      const expired = isExpired(item.expiration);
                      const bgColor = !item.isActive
                        ? '#f8d7da'
                        : expired
                          ? '#ffeeba'
                          : item.quantityUsed >= item.quantityLimit
                            ? '#d1ecf1'
                            : '#fff';

                      return (
                        <tr key={item._id} style={{ backgroundColor: bgColor }}>
                          <td>
                            <span className={`td__status td__status--${item.isActive ? 'true' : 'false'}`}>
                              {item.isActive ? 'Kích hoạt' : 'Không kích hoạt'}
                            </span>
                            {expired && item.isActive && (
                              <span className="td__status td__status--expired"> (Hết hạn)</span>
                            )}
                            {item.quantityUsed >= item.quantityLimit && item.isActive && (
                              <span className="td__status td__status--depleted"> (Hết lượt)</span>
                            )}
                          </td>
                          <td>{item.code}</td>
                          <td>{item.type === 'fixed' ? 'Cố định' : 'Phần trăm'}</td>
                          <td>{item.type === 'fixed' ? item.value.toLocaleString() : item.maxValue}</td>
                          <td>{item.minOrderAmount.toLocaleString()}đ</td>
                          <td>{formatDate(item.activation)}</td>
                          <td>{formatDate(item.expiration)}</td>
                          <td>{item.quantityUsed}</td>
                          <td>{item.quantityLimit}</td>
                          <td>
                            <div className="table-actions">
                              <button
                                onClick={() => handleToggleActive(item._id, item.isActive)}
                                disabled={loading}
                                title={item.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                              >
                                <i className={`fas fa-${item.isActive ? 'eye-slash' : 'eye'}`}></i>
                              </button>
                              <button onClick={() => handleEditDiscount(item._id)} disabled={loading} title="Chỉnh sửa">
                                <i className="fas fa-edit"></i>
                              </button>
                              <button onClick={() => handleDeleteDiscount(item._id)} disabled={loading} title="Xóa">
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {discount.length > 0 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setIdDiscountDel(null);
        }}
        onConfirm={confirmDeleteDiscount}
        title="Xóa mã giảm giá"
        message={idDiscountDel ? 'Bạn có chắc chắn muốn xóa mã giảm giá này?' : ''}
      />
    </section>
  );
};

export default Discount;
