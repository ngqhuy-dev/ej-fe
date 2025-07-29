import { useCallback, useMemo } from 'react';

const STATUS_MAP = {
  all: 'Tất cả',
  pending: 'Chờ xác nhận',
  paid: 'Đã thanh toán',
  processing: 'Đang chuẩn bị hàng',
  shipping: 'Đang giao hàng',
  delivered: 'Đã giao hàng',
  received: 'Đã nhận',
  cancelled: 'Đã hủy',
};

function useOrderItem({ item, onNavigate }) {
  //FIXME: Tinh năng cần phát triển
  /*   const handleBuyAgain = useCallback(() => {
    const selectedProducts =
      item?.products?.map((product) => {
        // Tính discountPrice từ price và discount
        const originalPrice = product._idProduct?.price || product.price;
        const discount = product._idProduct?.discount || 0;
        const discountPrice = originalPrice * (1 - discount / 100);

        return {
          _id: product._idProduct?._id || product._id,
          name: product._idProduct?.name || product.name,
          price: originalPrice,
          discount: discount,
          discountPrice: discountPrice,
          unit: product._idProduct?.unit || product.unit,
          images: product._idProduct?.images || product.images || [],
          quantity: product.quantity,
          totalDiscountPrice: discountPrice * product.quantity,
        };
      }) || [];

    // Tính summary
    const subtotal = selectedProducts.reduce((sum, product) => sum + product.totalDiscountPrice, 0);
    const shipping = 30000; // Phí ship cố định, có thể điều chỉnh theo logic của bạn
    const couponDiscount = 0; // Mặc định không có coupon
    const total = subtotal + shipping - couponDiscount;

    const stateData = {
      selectedProducts,
      summary: {
        subtotal,
        couponDiscount,
        total,
        shipping,
      },
    };

    onNavigate('/checkout', {
      state: stateData,
    });
  }, [item, onNavigate]); */

  //FIXME: Tinh năng cần phát triển
  /*   const handleRefundClick = useCallback(() => {
    onNavigate(`/info-user?tab=orders&id=${item._id || item.id}`);
  }, [item._id, item.id, onNavigate]); */

  const handleDetailClick = useCallback(() => {
    onNavigate(`/order/details/${item._id || item.id}`);
  }, [item._id, item.id, onNavigate]);

  // Memoize computed values
  const orderDate = useMemo(() => {
    return item.createdAt.split('T')[0];
  }, [item.createdAt]);

  const statusText = useMemo(() => {
    return STATUS_MAP[item.status] || item.status;
  }, [item.status]);

  const paymentText = useMemo(() => {
    if (item.paymentMethod === 'cod') {
      return item.isPaid ? 'Đã thanh toán' : 'Thanh toán khi nhận hàng';
    }
    return item.isPaid === false ? 'Chưa thanh toán' : 'Đã thanh toán';
  }, [item.paymentMethod, item.isPaid]);

  const receivedButtonText = useMemo(() => {
    return 'Đã nhận hàng';
  }, []);

  /*   const refundButtonText = useMemo(() => {
    return item.isPaid && item.status === 'paid' ? 'Yêu cầu hoàn tiền' : 'Yêu cầu hoàn tiền/ trả hàng';
  }, [item.isPaid, item.status]); */

  /*   const showRefundButton = useMemo(() => {
    return (item.isPaid && item.status === 'paid') || item.status === 'received';
  }, [item.isPaid, item.status]); */

  return {
    orderDate,
    statusText,
    paymentText,
    receivedButtonText,
    /*     refundButtonText,
    showRefundButton,
    handleBuyAgain,
    handleRefundClick, */
    handleDetailClick,
  };
}

export default useOrderItem;
