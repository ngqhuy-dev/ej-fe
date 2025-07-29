// src/json/bannerMini.jsx
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// Import ảnh thủ công từ thư mục src (bắt buộc khi không dùng public)
import img1 from '@assets/images/banner/mini/miniBanner1.jpg';
import img2 from '@assets/images/banner/mini/miniBanner2.png';
import img3 from '@assets/images/banner/mini/miniBanner3.jpg';
import img4 from '@assets/images/banner/mini/miniBanner4.png';

// Danh sách ảnh
const imageList = [img1, img2, img3, img4];

// Hàm chọn ngẫu nhiên ảnh không trùng
function getRandomImages(list, count) {
  const shuffled = [...list].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

const BannerMini = () => {
  const randomImages = getRandomImages(imageList, 5); // Nếu ít hơn 5 ảnh thì nó lấy tối đa có thể

  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      spaceBetween={10}
      slidesPerView={1}
      pagination={{
        clickable: false,
        dynamicBullets: true,
      }}
      loop
      speed={1000}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false, // Không dừng khi người dùng tương tác
      }}
    >
      {randomImages.map((img, index) => (
        <SwiperSlide key={index}>
          <img src={img} alt={`Banner ${index + 1}`} style={{ width: '100%', height: 'auto' }} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default BannerMini;
