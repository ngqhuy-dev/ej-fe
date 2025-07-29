import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageLoad from '@pages/PageLoad';

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');

  useEffect(() => {
    if (status) {
      navigate(`/info-user?tab=orders&status=${status}`);
    }
  }, [navigate, status]);

  return <PageLoad />;
}

export default PaymentSuccess;
