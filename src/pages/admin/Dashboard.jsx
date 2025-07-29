// File: src/pages/admin/Dashboard.jsx
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { getDashboard } from '../../services/DashboardService';
import { loginSuccess } from '@/redux/authSlice.jsx';
import { createAxios } from '@utils/createInstance.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const [stats, setStats] = useState({
    userCount: 0,
    orderCount: 0,
    productCount: 0,
    totalRevenue: 0,
    monthlyRevenue: Array(12).fill(0),
    isLoading: true,
    error: null,
  });

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const axiosJWT = createAxios(user, dispatch, loginSuccess);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setStats((prev) => ({ ...prev, isLoading: true, error: null }));

        if (!accessToken) {
          throw new Error('Access token not found');
        }

        const data = await getDashboard(accessToken, axiosJWT);

        setStats((prev) => ({
          ...prev,
          userCount: data.userCount || 0,
          orderCount: data.orderCount || 0,
          productCount: data.productCount || 0,
          totalRevenue: data.totalRevenue || 0,
          monthlyRevenue: data.monthlyRevenue || Array(12).fill(0),
          isLoading: false,
        }));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setStats((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message,
        }));
      }
    };

    fetchDashboardData();
  }, [accessToken]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const chartData = {
    labels: [
      'Tháng 1',
      'Tháng 2',
      'Tháng 3',
      'Tháng 4',
      'Tháng 5',
      'Tháng 6',
      'Tháng 7',
      'Tháng 8',
      'Tháng 9',
      'Tháng 10',
      'Tháng 11',
      'Tháng 12',
    ],
    datasets: [
      {
        label: `Doanh thu ${new Date().getFullYear()}`, // ✅ đã sửa
        data: stats.monthlyRevenue,
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#3498db',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: `Doanh thu hàng tháng - ${new Date().getFullYear()}`,
        font: { size: 18 },
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Revenue: ${formatCurrency(context.raw)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(value),
        },
      },
    },
  };

  if (stats.isLoading) {
    return (
      <section className="admin-section">
        <h2 className="admin-section__title">Tổng quát</h2>
        <div className="loading-spinner">Loading dashboard data...</div>
      </section>
    );
  }

  if (stats.error) {
    return (
      <section className="admin-section">
        <div className="admin-section__header">
          <h2 className="admin-section__title">Tổng quát</h2>
        </div>
        <div className="error-message">
          Error loading dashboard: {stats.error}
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Tổng quát</h2>
      </div>

      <div className="admin__stats">
        <div className="admin__stat-card">
          <h3>Tổng số sản phẩm</h3>
          <p>{stats.productCount.toLocaleString()}</p>
        </div>
        <div className="admin__stat-card">
          <h3>Tổng số đơn hàng</h3>
          <p>{stats.orderCount.toLocaleString()}</p>
        </div>
        <div className="admin__stat-card">
          <h3>Tổng số người dùng</h3>
          <p>{stats.userCount.toLocaleString()}</p>
        </div>
        <div className="admin__stat-card">
          <h3>Tổng doanh thu</h3>
          <p>{formatCurrency(stats.totalRevenue)}</p>
        </div>
      </div>

      <div className="admin__chart-section" style={{ height: '400px' }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </section>
  );
};

export default Dashboard;
