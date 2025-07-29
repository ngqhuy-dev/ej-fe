import { Fragment, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// import Button from '@components/ui/Button';
import { getCategoriesAll } from '@/services/CategoryService';
import ReusableSection from '@components/common/ui/ReusableSection.jsx';
import CategoryList from '@components/features/user/category/CateList.jsx';
import ProductsCategoryList from '@/components/features/user/products/ProdCateList.jsx';
import BannerMini from '@json/bannerMini';

import fullBanner from '@assets/images/banner/fullBanner.png';
import moveRight from '@assets/icons/iconMoveRight.svg';

function Home() {
  const [category, setCategory] = useState([]);

  //COMMENT: sang trang mới sẻ tự cộng cuộn lên đầu
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategoriesAll(); //NOTE: gọi api category
      setCategory(data);
    } catch (error) {
      console.error('Loi khi lay danh muc:', error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <Fragment>
      <section className="home">
        <div className="home__banner">
          <img className="img-banner" src={fullBanner} alt="Banner" />
          <div className="banner__content">
            <h5 className="discount">Giảm giá trong tuần</h5>
            <h2 className="title">Nhận các sản phẩm chất lượng tốt nhất với giá thấp nhất</h2>
            <p className="describe">Chúng tôi đã chuẩn bị giảm giá đặc biệt cho bạn về các sản phẩm ăn sáng hữu cơ</p>

            <Link to={'/product'} className="btn btn-shop">
              <p>Xem ngay</p>
              <img src={moveRight} alt="Move Right" />
            </Link>
          </div>
        </div>

        {/* NOTE: danh mục nỗi bật */}
        <ReusableSection title="Browse by Categories" linkTo="product">
          <CategoryList />
        </ReusableSection>

        {/* NOTE: sản phẩm theo danh mục (nổi bật) */}
        {category.map(
          (category) =>
            category.isOutstanding === true &&
            category.status === 'active' && (
              <>
                <BannerMini />
                <ReusableSection title={category.name} key={category._id} linkTo={`product?category=${category.slug}`}>
                  <ProductsCategoryList idCategory={category._id} />
                </ReusableSection>
              </>
            ),
        )}
      </section>
    </Fragment>
  );
}

export default Home;
