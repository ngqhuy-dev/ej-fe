import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function Timer({ countDownDate }) {
  // Xác định thời điểm kết thúc
  const endDate = new Date(Date.now() + countDownDate * 24 * 60 * 60 * 1000).getTime();

  // Cập nhật remainingTime liên tục
  const [remainingTime, setRemainingTime] = useState(endDate - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(() => {
        const newTime = endDate - Date.now();
        return newTime > 0 ? newTime : 0; // Không để giá trị âm
      });
    }, 1000); // Chạy mỗi giây

    return () => clearInterval(interval);
  }, []);

  // Format số 2 chữ số
  const formatNumber = (num) => String(num).padStart(2, '0');

  const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

  return (
    <div className="timer">
      <div className="timer__item">
        <span className="item__number">{formatNumber(days)}</span>
        <span className="item__unit"> days</span>
      </div>
      <div className="timer__item">
        <span className="item__number">{formatNumber(hours)}</span>
        <span className="item__unit"> hours</span>
      </div>
      <div className="timer__item">
        <span className="item__number">{formatNumber(minutes)}</span>
        <span className="item__unit"> minutes</span>
      </div>
      <div className="timer__item">
        <span className="item__number">{formatNumber(seconds)}</span>
        <span className="item__unit"> seconds</span>
      </div>
    </div>
  );
}

Timer.propTypes = {
  countDownDate: PropTypes.number.isRequired, // Số ngày còn lại
};

export default Timer;