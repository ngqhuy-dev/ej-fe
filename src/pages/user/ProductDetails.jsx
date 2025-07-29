import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Breadcrumb from '@components/common/ui/Breadcrumb';
import { getProduct } from '@services/ProductService';
import { useDispatch, useSelector } from 'react-redux';
import { createAxios } from '@utils/createInstance.jsx';
import { loginSuccess } from '@/redux/authSlice.jsx';
import ProductsCategoryList from '@/components/features/user/products/ProdCateList.jsx';
import ProductImageGallery from '@pages/user/ProductDetails/ProductImageGallery';
import ProductInfo from '@pages/user/ProductDetails/ProductInfo';
import ProductTabs from '@pages/user/ProductDetails/ProductTabs';
import { useRef } from 'react';

const ProductDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const reviewsRef = useRef(null);

  // States
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  // Redux
  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const axiosJWT = createAxios(user, dispatch, loginSuccess);

  const shouldScroll = location.state?.activeTab === 'reviews';

  useEffect(() => {
    if (shouldScroll) {
      setActiveTab('reviews');

      // Delay để DOM có thời gian render nội dung tab
      setTimeout(() => {
        window.scrollTo({
          top: reviewsRef.current.offsetTop - 100,
          behavior: 'smooth',
        });
      }, 300);
    }
  }, [shouldScroll]);

  // Effects
  useEffect(() => {
    fetchProduct();
  }, [id, location.state]);

  // Functions
  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const stateProduct = location.state?.product;
      if (stateProduct && stateProduct.id === parseInt(id)) {
        setProduct(stateProduct);
        setLoading(false);
        return;
      }

      const data = await getProduct(id);
      if (!data) {
        setError('Không tìm thấy sản phẩm này');
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      setProduct(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && shouldScroll) {
      reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loading, shouldScroll]);

  // Loading state
  if (loading) {
    return (
      <div className="product-details">
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="product-details">
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <p>{error || 'Product not found'}</p>
          <Link to="/product" className="back-button">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={[{ text: 'Products', link: '/product' }, { text: product.name }]} />

      <div className="product-details">
        <div className="product-details__container">
          <ProductImageGallery product={product} selectedImage={selectedImage} onImageSelect={setSelectedImage} />

          <ProductInfo
            product={product}
            user={user}
            accessToken={accessToken}
            axiosJWT={axiosJWT}
            dispatch={dispatch}
          />
        </div>
        <div ref={reviewsRef}>
          <ProductTabs product={product} activeTab={activeTab} onTabChange={setActiveTab} loading={loading} />
        </div>

        <div className="product-details__related">
          <h2 className="related__title">Sản phẩm liên quan</h2>
          <ProductsCategoryList idCategory={product._idCategory._id} />
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
