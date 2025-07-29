// File: src/pages/user/ProductList.jsx
import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { createAxios } from '@utils/createInstance.jsx';
import { loginSuccess } from '@/redux/authSlice.jsx';
import Pagination from '@components/common/ui/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faTags, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import Breadcrumb from '@components/common/ui/Breadcrumb';
import { getProductsAll } from '@services/ProductService';
import { getCategoriesAll } from '@services/CategoryService';
import { addItemToCart } from '@services/CartService';
import toast from 'react-hot-toast';

const ProductList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const slugCategory = queryParams.get('category');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const axiosJWT = createAxios(user, dispatch, loginSuccess);

  const [priceStart, setPriceStart] = useState(null);
  const [priceEnd, setPriceEnd] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [originalProducts, setOriginalProducts] = useState([]);
  const [sortOption, setSortOption] = useState('popularity');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 20;

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  // Lấy dữ liệu sản phẩm và danh mục khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesData, productsData] = await Promise.all([getCategoriesAll(), getProductsAll()]);
        setCategories(categoriesData || []);
        setProducts(productsData.data || []);
        setOriginalProducts(productsData.data || []);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!slugCategory || !categories.length) return;

    const listCate = categories.find((cat) => cat.slug === slugCategory);

    if (listCate) {
      const filtered = originalProducts.filter((product) => product._idCategory._id === listCate._id);
      setProducts(filtered);
      setSelectedCategory(listCate._id);
    } else {
      setProducts([]); // không tìm thấy thì gán mảng rỗng
    }
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [slugCategory, categories, originalProducts]);

  // Lọc sản phẩm theo danh mục
  const handleFilter = (e) => {
    const _idCategory = e.target.value;
    const categoryObj = categories.find((cat) => cat._id === _idCategory);

    if (_idCategory === 'all') {
      setSelectedCategory('all');
      setProducts(originalProducts);
      navigate('/product'); // reset URL
    } else {
      setSelectedCategory(_idCategory);
      if (categoryObj) {
        const filteredProducts = originalProducts.filter((product) => product._idCategory._id === _idCategory);
        setProducts(filteredProducts);
        navigate(`/product?category=${categoryObj.slug}`); // 🔥 cập nhật URL
      }
    }

    setCurrentPage(1);
  };

  const handleSort = (e) => {
    const _idSort = e.target.value;
    setSortOption(_idSort);
    setCurrentPage(1);

    if (!Array.isArray(products) || products.length === 0) {
      return;
    }

    // Clone sâu mảng để đảm bảo tạo mới hoàn toàn
    const sortedProducts = [...products];

    console.log(
      'Before sort:',
      sortedProducts.map((p) => p.name + ' - ' + p.price),
    );

    switch (_idSort) {
      case 'price-low':
        sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'newest':
        sortedProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'popularity':
        sortedProducts.sort((a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0));
        break;
      default:
        break;
    }

    console.log(
      'After sort:',
      sortedProducts.map((p) => p.name + ' - ' + p.price),
    );

    // Force React để nhận biết thay đổi
    setProducts([...sortedProducts]);
  };

  const handleApplyFilter = () => {
    setCurrentPage(1);
    setError('');
    setPriceStart(priceStart || 0);
    if (priceEnd === 0 || priceEnd === null) {
      setPriceEnd(0);
      setError('Vui lòng nhập khoảng cho phù hợp');
      setProducts(originalProducts);
    }
    if (priceStart > priceEnd) {
      setError('Vui lòng nhập khoảng cho phù hợp');
      setProducts(originalProducts);
    }

    const filteredProducts = [...originalProducts].filter((product) => {
      const price = product.price * (1 - product.discount / 100) || 0;
      return price >= priceStart && price <= priceEnd;
    });
    setProducts(filteredProducts);
  };

  const hasActiveFilters = () => {
    if (
      searchTerm !== '' ||
      (selectedCategory !== '' && selectedCategory !== 'all') ||
      priceStart !== null ||
      priceEnd !== null ||
      sortOption !== 'popularity'
    ) {
      return true;
    }
  };

  const handleClearFilter = () => {
    setSelectedCategory('all');
    setPriceStart(null);
    setPriceEnd(null);
    setSortOption('popularity');
    setCurrentPage(1);
    setProducts(originalProducts);
    setSearchTerm('');
    setError('');
  };

  // Xử lý thêm vào giỏ hàng
  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = async (product) => {
    if (!product || !product._id) return;

    const formData = {
      productId: product._id,
      quantity: 1,
    };
    if (!accessToken || user === null) {
      toast.dismiss();
      toast('Vui lòng đăng nhập', {
        icon: '⚠️',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        duration: 1000,
        position: 'top-center',
      });
      navigate('/login');
    } else {
      await addItemToCart(formData, dispatch, accessToken, axiosJWT);
    }
  };

  // Xử lý click sản phẩm
  const handleProductClick = (product) => {
    if (!product || !product._id) return;
    navigate(`/product/${product._id}`);
  };

  // Hiển thị skeleton khi loading
  const renderSkeleton = () => {
    return Array(8)
      .fill(null)
      .map((_, index) => (
        <div key={index} className="user__product-card skeleton">
          <div className="user__product-image-container skeleton-image"></div>
          <div className="user__product-info">
            <div className="skeleton-text"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text"></div>
          </div>
        </div>
      ));
  };

  // Tính toán sản phẩm được lọc
  const filteredProducts = useMemo(() => {
    if (!products && !searchTerm) return [];
    return products.filter(
      (product) =>
        product.name &&
        typeof product.name === 'string' &&
        product.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [products, searchTerm]);

  // Tính toán phân trang
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <section>
      <Breadcrumb items={[{ text: 'Products' }]} />
      <div className="product-list">
        <div className="product-list__header">
          <div className="product-list__header-content">
            <h2 className="title">Sản phẩm của chúng tôi</h2>
            <p className="subtitle">Khám phá lựa chọn các sản phẩm cao cấp của chúng tôi</p>
          </div>
          <div className="product-list__search">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="product-list__content">
          <aside className="product-list__filters">
            <div className="filters__header">
              <h3>
                <FontAwesomeIcon icon={faFilter} /> Filters
              </h3>
              {hasActiveFilters() && (
                <button className="clear-filters" onClick={handleClearFilter}>
                  <FontAwesomeIcon icon={faTimes} /> Clear All
                </button>
              )}
            </div>

            <div className="filters__section">
              <h3 className="filters__title">
                <FontAwesomeIcon icon={faTags} /> Categories
              </h3>
              <div className="filters__options">
                <>
                  <label key="all" className="filters__option">
                    <input
                      type="checkbox"
                      value="all"
                      checked={selectedCategory === 'all' || selectedCategory === ''}
                      onChange={handleFilter}
                    />
                    All
                  </label>
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <label key={category._id} className="filters__option">
                        <input
                          type="checkbox"
                          value={category._id}
                          checked={selectedCategory === category._id}
                          onChange={handleFilter}
                        />
                        {category.name}
                      </label>
                    ))
                  ) : (
                    <p>No categories available</p>
                  )}
                </>
              </div>
            </div>
            <div className="filters__section">
              <h3 className="filters__title">Price Range</h3>

              <div className="price-range">
                <div className="price-inputs">
                  <div className="price-input-group">
                    <span className="currency">₫</span>

                    <input type="number" value={priceStart} onChange={(e) => setPriceStart(e.target.value)} min="0" />
                  </div>

                  <span className="separator">-</span>

                  <div className="price-input-group">
                    <span className="currency">₫</span>

                    <input
                      type="number"
                      value={priceEnd}
                      onChange={(e) => setPriceEnd(e.target.value)}
                      min={priceStart}
                    />
                  </div>
                </div>
                {error && <div className="error-message">{error}</div>}
                <button className="btn apply-filter" onClick={handleApplyFilter}>
                  Áp dụng
                </button>
              </div>
            </div>
          </aside>

          <div className="product-list__main">
            <div className="product-list__toolbar">
              <p className="products-count">
                Hiển thị{' '}
                {totalItems > 0 ? `${startIndex + 1}-${Math.min(endIndex, totalItems)} của ${totalItems}` : '0'} sản
                phẩm
              </p>
              <div className="products-sort">
                <label htmlFor="sort-select">Sắp xếp theo:</label>
                <select id="sort-select" className="sort-select" onChange={handleSort} value={sortOption}>
                  <option value="popularity">Phổ biến nhất</option>
                  <option value="price-low">Giá: Thấp đến cao</option>
                  <option value="price-high">Giá: Cao đến thấp</option>
                  <option value="newest">Mới nhất</option>
                </select>
              </div>
            </div>

            <div className="product-list__grid">
              {loading ? (
                renderSkeleton()
              ) : currentProducts && currentProducts.length > 0 ? (
                <>
                  {currentProducts.map((product) => (
                    <div key={product._id} className="list__item">
                      {product._idCategory.status === 'active' && (
                        <div
                          key={product._id}
                          onClick={(e) => {
                            e.preventDefault();
                            handleProductClick(product);
                          }}
                          className="product__item"
                        >
                          <div className="item__image">
                            <img src={product.images[0]?.url} alt={product.name} />
                          </div>

                          <div className="item__category">{product._idCategory?.name}</div>

                          <h3 className="item__name">{product.name}</h3>

                          <p className="item__description">{product.description}</p>

                          <div className="item__price">
                            <span className="current-price">
                              {(product.price - product.price * (product.discount / 100)).toLocaleString()}/
                              {product.unit}
                            </span>
                            <span className="original-price">{product.price.toLocaleString()}VNĐ</span>
                          </div>

                          <button
                            className="add-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                          >
                            Add
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <div className="no-products">
                  <h3>No products found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {!loading && totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => setCurrentPage(page)} />
        )}
      </div>
    </section>
  );
};

export default ProductList;
