import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategoriesAll } from '@/services/CategoryService.jsx';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
// Import required modules
import { Pagination } from 'swiper/modules'; // ❌ Đã bỏ Navigation

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategoriesAll();
        setCategories(data);
      } catch (error) {
        setError('Không thể tải danh mục. Vui lòng thử lại sau.');
        console.error('Lỗi khi lấy danh mục:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="section__content section__home-cate">
      <Swiper
        slidesPerView={2}
        spaceBetween={20}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        loop
        modules={[Pagination]}
        breakpoints={{
          640: {
            slidesPerView: 3,
            spaceBetween: 10,
          },
          768: {
            slidesPerView: 4,
            spaceBetween: 10,
          },
          1024: {
            slidesPerView: 6,
            spaceBetween: 10,
          },
          1280: {
            slidesPerView: 8,
            spaceBetween: 10,
          },
        }}
        className="category-swiper"
      >
        {categories.map(
          ({ _id, name, description, image, slug, status }) =>
            status === 'active' && (
              <SwiperSlide key={_id} className="item-categories-wrapper">
                <div className="item-categories">
                  <Link className="link-categories" to={`/Product?category=${encodeURIComponent(slug)}`}>
                    <img
                      src={image?.url || '/placeholder-image.jpg'}
                      alt={`${name} : ${description}`}
                      className="category-image"
                    />
                    <span>{name}</span>
                  </Link>
                </div>
              </SwiperSlide>
            ),
        )}
      </Swiper>
    </div>
  );
};

export default CategoryList;
