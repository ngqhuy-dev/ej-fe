import { useEffect, useState, memo, useCallback, useMemo } from 'react';
import Button from '@components/common/utils/Button';
import {
  getAddresses,
  addAddress,
  setDefaultAddress,
  updateAddress,
  deleteAddress,
  getAddressesByUserId,
} from '../../../services/AddressService';
import { createAxios } from '../../../utils/createInstance';
import { loginSuccess } from '../../../redux/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import FormAddress from '@components/common/forms/FormAddress';
import AddressCard from './AddressTab/AddressCard';
import useAddressData from '@hooks/user/useAddressData';

// Constants
const INITIAL_FORM_DATA = {
  detailed: '',
  district: '',
  city: '',
  province: '',
  isDefault: false,
};

function AddressTab({ selectedDefault = null }) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);

  // States
  const [addresses, setAddresses] = useState([]);
  const [showFormAddress, setShowFormAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Custom hook for address data
  const {
    provinces,
    districts,
    wards,
    loading: addressDataLoading,
    error: addressDataError,
    fetchProvinces,
    fetchDistricts,
    fetchWards,
  } = useAddressData();

  const isViewOnly = useMemo(() => Boolean(id), [id]);
  const isEditing = useMemo(() => Boolean(editingAddressId), [editingAddressId]);

  // Memoized values
  const { accessToken, axiosJWT } = useMemo(() => {
    if (!user) return { accessToken: null, axiosJWT: null };

    return {
      accessToken: user.accessToken,
      axiosJWT: createAxios(user, dispatch, loginSuccess),
    };
  }, [user, dispatch]);

  // Fetch addresses
  const fetchAddresses = useCallback(async () => {
    if (!user || !accessToken) return;

    setLoading(true);
    setError(null);

    try {
      let response;
      if (id) {
        response = await getAddressesByUserId(id, accessToken, axiosJWT);
      } else {
        response = await getAddresses(accessToken, axiosJWT);
      }

      if (response) {
        setAddresses(response);
        if (!id && selectedDefault) {
          selectedDefault(response.filter((address) => address.isDefault === true));
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setError('Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  }, [user, accessToken, axiosJWT, id, selectedDefault]);

  // Initialize data
  useEffect(() => {
    fetchAddresses();
    fetchProvinces();
  }, [fetchAddresses, fetchProvinces]);

  // Modal handlers
  const handleOpenModal = useCallback(() => {
    setShowFormAddress(true);
    setEditingAddressId(null);
    setFormData(INITIAL_FORM_DATA);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowFormAddress(false);
    setEditingAddressId(null);
    setFormData(INITIAL_FORM_DATA);
  }, []);

  // Form handlers
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleSelectProvince = useCallback(
    (e) => {
      const selectedOption = e.target.options[e.target.selectedIndex];
      const provinceCode = selectedOption.getAttribute('data-code');
      const provinceName = e.target.value;

      setFormData((prev) => ({
        ...prev,
        province: provinceName,
        city: '',
        district: '',
      }));

      if (provinceCode) {
        fetchDistricts(provinceCode);
      }
    },
    [fetchDistricts],
  );

  const handleSelectCity = useCallback(
    (e) => {
      const selectedOption = e.target.options[e.target.selectedIndex];
      const districtCode = selectedOption.getAttribute('data-code');
      const districtName = e.target.value;

      setFormData((prev) => ({
        ...prev,
        city: districtName,
        district: '',
      }));

      if (districtCode) {
        fetchWards(districtCode);
      }
    },
    [fetchWards],
  );

  const handleSelectWard = useCallback((e) => {
    const wardName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      district: wardName,
    }));
  }, []);

  // CRUD operations
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Validate form
      if (!formData.detailed || !formData.district || !formData.city || !formData.province) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
      }

      setLoading(true);
      try {
        if (isEditing) {
          await updateAddress(editingAddressId, formData, accessToken, axiosJWT);
        } else {
          await addAddress(formData, accessToken, axiosJWT, dispatch);
        }

        await fetchAddresses();
        handleCloseModal();
      } catch (error) {
        console.error('Error saving address:', error);
        alert('Có lỗi xảy ra khi lưu địa chỉ');
      } finally {
        setLoading(false);
      }
    },
    [formData, isEditing, editingAddressId, accessToken, axiosJWT, dispatch, fetchAddresses, handleCloseModal],
  );

  const handleDelete = useCallback(
    async (addressId) => {
      if (!window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;

      setLoading(true);
      try {
        await deleteAddress(addressId, accessToken, axiosJWT);
        await fetchAddresses();
      } catch (error) {
        console.error('Error deleting address:', error);
        alert('Có lỗi xảy ra khi xóa địa chỉ');
      } finally {
        setLoading(false);
      }
    },
    [accessToken, axiosJWT, fetchAddresses],
  );

  const handleSetDefault = useCallback(
    async (addressId) => {
      setLoading(true);
      try {
        await setDefaultAddress(addressId, accessToken, axiosJWT);
        await fetchAddresses();
      } catch (error) {
        console.error('Error setting default address:', error);
        alert('Có lỗi xảy ra khi thiết lập địa chỉ mặc định');
      } finally {
        setLoading(false);
      }
    },
    [accessToken, axiosJWT, fetchAddresses],
  );

  const handleUpdate = useCallback(
    (addressId) => {
      const addressToUpdate = addresses.find((address) => address._id === addressId);
      if (!addressToUpdate) return;

      setEditingAddressId(addressId);
      setFormData({
        detailed: addressToUpdate.detailed || '',
        district: addressToUpdate.district || '',
        city: addressToUpdate.city || '',
        province: addressToUpdate.province || '',
        isDefault: addressToUpdate.isDefault || false,
      });

      // Fetch districts and wards for the selected province
      const selectedProvince = provinces.find((p) => p.name === addressToUpdate.province);
      if (selectedProvince) {
        fetchDistricts(selectedProvince.code);
      }

      setShowFormAddress(true);
    },
    [addresses, provinces, fetchDistricts],
  );

  // Render error state
  if (error) {
    return (
      <div className="profile__tab profile__tab-address">
        <div className="error-state">
          <p>Có lỗi xảy ra: {error}</p>
          <button onClick={fetchAddresses}>Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile__tab profile__tab-address">
      <div className="profile__tab-header">
        <h2 className="header__title">Địa chỉ người dùng</h2>
        {!isViewOnly && (
          <Button type="button" className="btn btn-add" onClick={handleOpenModal}>
            Thêm địa chỉ mới
          </Button>
        )}
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        addresses.length > 0 && (
          <div className="addresses-list">
            {addresses.map((address) => (
              <AddressCard
                key={address._id}
                address={address}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
                isViewOnly={isViewOnly}
              />
            ))}
          </div>
        )
      )}

      {showFormAddress && (
        <div className="modal-overlay">
          <div className="address-modal-content">
            <div className="modal-header">
              <h2>{isEditing ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                &times;
              </button>
            </div>
            {addressDataError && <div className="error-message">{addressDataError}</div>}
            <FormAddress
              formData={formData}
              handleSubmit={handleSubmit}
              handleCloseModal={handleCloseModal}
              handleInputChange={handleInputChange}
              handleSelectProvince={handleSelectProvince}
              handleSelectCity={handleSelectCity}
              handleSelectWard={handleSelectWard}
              provinces={provinces}
              districts={districts}
              wards={wards}
              loading={addressDataLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(AddressTab);
