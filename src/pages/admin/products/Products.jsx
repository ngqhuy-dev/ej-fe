// File: src/pages/admin/Products.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Modal from '@components/common/ui/Modal';
import { loginSuccess } from '@/redux/authSlice.jsx';
import Pagination from '@components/common/ui/Pagination';
import { createAxios } from '@utils/createInstance.jsx';
import { getProductsAll, editProduct, deleteProduct } from '@services/ProductService';
import { getCategoriesAll } from '@services/CategoryService';

const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [originalProducts, setOriginalProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idProdDel, setIdProdDel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const axiosJWT = createAxios(user, dispatch, loginSuccess);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('🔍 Starting to fetch categories...');
        setLoading(true);
        setError(null);

        const data = await getCategoriesAll();
        setCategories(
          Array.isArray(data)
            ? data.map((cat) => ({
                ...cat,
                name: cat.name,
              }))
            : [],
        );
      } catch (err) {
        console.error('❌ Error in fetchCategories:', err);

        setError('Không thể tải danh mục. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getProductsAll();
      setOriginalProducts(res.data);

      if (res.data && Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        setError('Dữ liệu danh mục không hợp lệ');
      }
    } catch {
      setError('Không thể tải danh mục. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    const _idCategory = e.target.value;
    if (_idCategory === 'all') {
      setProducts(originalProducts); // Hiển thị tất cả danh mục
    } else {
      const filteredProducts = originalProducts.filter((category) => category._idCategory._id === _idCategory);
      setProducts(filteredProducts);
    }
    setCurrentPage(1); // Reset to first page
  };

  const handleViewProduct = async (id, isActive) => {
    try {
      const newIsActive = isActive ? false : true;
      await editProduct(id, { isActive: newIsActive }, accessToken, axiosJWT);
      setProducts((prev) => prev.map((prod) => (prod._id === id ? { ...prod, isActive: newIsActive } : prod)));
      setOriginalProducts((prev) => prev.map((prod) => (prod._id === id ? { ...prod, isActive: newIsActive } : prod)));

      const activeProducts = products.filter((prod) => prod.isActive);
      const newTotalPages = Math.ceil(activeProducts.length / itemsPerPage);
      if (currentPage > newTotalPages) {
        setCurrentPage(Math.max(1, newTotalPages));
      }
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật trạng thái:', error);
    }
  };

  const handleEditProduct = (id) => {
    navigate(`/admin/products/edit/${id}`);
  };

  const handleDeleteProduct = (id) => {
    console.log(`🗑️ Opening delete modal for product: ${id}`);
    setIdProdDel(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProduct = async () => {
    setLoading(true);
    try {
      await deleteProduct(idProdDel, accessToken, axiosJWT);
      fetchProducts();

      const activeProducts = products.filter((prod) => prod.isActive);
      const newTotalPages = Math.ceil(activeProducts.length / itemsPerPage);
      if (currentPage > newTotalPages) {
        setCurrentPage(Math.max(1, newTotalPages));
      }
    } catch (err) {
      console.error('❌ Lỗi khi xóa danh mục:', err);
    } finally {
      setIsDeleteModalOpen(false);
      setIdProdDel(null);
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    navigate('/admin/products/add');
  };

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Tính toán dữ liệu hiển thị trên trang hiện tại
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <section className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Quản lý sản phẩm</h2>
        <button className="admin-add__button" onClick={handleAddProduct}>
          + Add New
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
        </div>{' '}
        <select className="select-filter" onChange={handleFilter}>
          <option value="all">Tất cả danh mục</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          <div className="block__table">
            <table className="admin__table">
              <thead>
                <tr>
                  <th>Trạng thái</th>
                  <th>Ảnh</th>
                  <th>Tên</th>
                  <th>Mô tả</th>
                  <th>Danh mục</th>
                  <th>Trong kho</th>
                  <th>Đã bán</th>
                  <th>Đơn vị</th>
                  <th>Giá (1 Đơn vị)</th>
                  <th>Giảm giá</th>
                  <th>Tùy chỉnh</th>
                </tr>
              </thead>
              <tbody>
                {(error ?? currentProducts.length === 0) ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center' }}>
                      {error ? error : 'Không có sản phẩm nào'}
                    </td>
                  </tr>
                ) : (
                  currentProducts.map((product) => (
                    <tr
                      key={product.id}
                      style={{
                        backgroundColor: product.isActive
                          ? product.quantity > 0
                            ? product._idCategory?.status === 'active'
                              ? '#fff'
                              : '#f8d7da'
                            : '#f8d7da'
                          : '#f8d7da',
                      }}
                    >
                      <td>
                        <span
                          className={`td__isActive td__isActive--${
                            product.isActive
                              ? product.quantity > 0
                                ? product._idCategory?.status === 'active'
                                  ? 'false'
                                  : 'true'
                                : 'true'
                              : 'true'
                          }`}
                        >
                          {product.isActive
                            ? product.quantity > 0
                              ? product._idCategory?.status === 'active'
                                ? 'Đang bán'
                                : 'Ngừng bán'
                              : 'Ngừng bán'
                            : 'Ngừng bán'}
                        </span>
                      </td>
                      <td>
                        <img
                          src={
                            product.images[1]?.url || 'https://sonnptnt.thaibinh.gov.vn/App/images/no-image-news.png'
                          }
                          alt={product.name}
                          className="admin__image-preview admin__image-preview--product"
                        />
                      </td>
                      <td>{product.name}</td>
                      <td>{product.description}</td>
                      <td>{product._idCategory?.name}</td>
                      <td>{product.quantity}</td>
                      <td>{product.countBuy}</td>
                      <td>{product.unit}</td>
                      <td>{product.price.toLocaleString()} VND</td>
                      <td>{product.discount}%</td>
                      <td>
                        <div className="table-actions">
                          <button onClick={() => handleViewProduct(product._id, product.isActive)} disabled={loading}>
                            <i className="fas fa-eye"></i>
                          </button>
                          <button onClick={() => handleEditProduct(product._id)} disabled={loading}>
                            <i className="fas fa-edit"></i>
                          </button>
                          <button onClick={() => handleDeleteProduct(product._id)} disabled={loading}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => setCurrentPage(page)} />
        </>
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setIdProdDel(null);
        }}
        onConfirm={confirmDeleteProduct}
        title="Xóa sản phẩm"
        message={idProdDel ? `Bạn có chắc chắn muốn xóa sản phẩm này"${idProdDel.name}"?` : ''}
      />
    </section>
  );
};

export default Products;
