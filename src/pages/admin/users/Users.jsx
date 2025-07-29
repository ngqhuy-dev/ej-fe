import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '@components/common/ui/Pagination';
import { getAllUsers } from '@services/UserService';
import { useDispatch, useSelector } from 'react-redux';
import { createAxios } from '@utils/createInstance.jsx';
import { loginSuccess } from '@/redux/authSlice.jsx';

const Users = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);
  const id = user?._id;
  const accessToken = user?.accessToken;
  const axiosJWT = createAxios(user, dispatch, loginSuccess);

  // Fetch users only once on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers(accessToken, axiosJWT);
      if (data && Array.isArray(data)) {
        setUsers(
          data.map((user) => ({
            ...user,
            fullname: user.fullname || 'Member...',
            phone: user.phone || '',
            email: user.email || '',
            address: user.address || '',
            dateBirth: user.dateBirth || 'yyyy/mm/dd',
            gender: user.gender || 'Giới tính...',
            createdAt: user.createdAt || '',
            updatedAt: user.updatedAt || '',
            isAdmin: user.isAdmin || '',
            isActive: user.isActive || '',
            avatar: user.avatar || 'https://sonnptnt.thaibinh.gov.vn/App/images/no-image-news.png',
          })),
        );
      } else {
        setError('Dữ liệu người dùng không hợp lệ');
      }
    } catch {
      setError('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const shorten = (text, maxLength = 20) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const handleViewUser = (id) => navigate(`/admin/users/view/${id}`);
  const handleEditUser = (id) => navigate(`/admin/users/edit/${id}`);

  // Tìm kiếm user theo fullname
  const filteredUsers = users.filter((user) => user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()));

  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Quản lý người dùng ({totalItems})</h2>
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

      <div className="admin-section__content">
        {loading ? (
          <p>Đang tải...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <div className="block__table">
              <table className="admin__table">
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Full name</th>
                    <th>Giới tính</th>
                    <th>Ngày sinh</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Option</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map(
                    (user) =>
                      user._id !== id && (
                        <tr key={user._id}>
                          <td>
                            <img
                              src={user.avatar.url}
                              alt={user.fullname}
                              className="admin__image-preview admin__image-preview--user"
                            />
                          </td>
                          <td>{user.fullname}</td>
                          <td>{user.gender === 'male' ? 'Nam' : 'Nữ'}</td>
                          <td>{formatDate(user.dateBirth)}</td>
                          <td>{user.phone || 'N/A'}</td>
                          <td title={user.email}>{shorten(user.email)}</td>
                          <td>{user.isAdmin ? 'Admin' : 'Member'}</td>
                          <td>{user.isActive ? 'Hoạt động' : 'Khóa'}</td>
                          <td>
                            <div className="table-actions">
                              <button onClick={() => handleViewUser(user._id)}>
                                <i className="fas fa-eye"></i>
                              </button>
                              <button onClick={() => handleEditUser(user._id)}>
                                <i className="fas fa-edit"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ),
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Users;
