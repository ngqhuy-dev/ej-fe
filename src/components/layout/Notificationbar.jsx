import Timer from '@components/function/Timer/Timer.jsx';
const Notification__bar = () => {
  return (
    <section className="global-notification">
      <section className="notification__content">
        <h3 className="notification__text text--normal">
          FREE delivery & 40% Discount for next 3 orders! Place your 1st order in.
        </h3>
        <div className="notification__timer">
          <span className="notification__timer-text">Until the end of the sale:</span>
          <Timer countDownDate={1} />
        </div>
      </section>
    </section>
  );
};

export default Notification__bar;
