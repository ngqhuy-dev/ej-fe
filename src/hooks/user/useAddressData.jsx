import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';

const PROVINCES_API = 'https://provinces.open-api.vn/api/p/';

const useAddressData = () => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cache for API responses
  const cacheRef = useRef({
    provinces: null,
    districts: {},
    wards: {},
  });

  const abortControllerRef = useRef(null);

  // Fetch provinces with caching
  const fetchProvinces = useCallback(async () => {
    // Return cached data if available
    if (cacheRef.current.provinces) {
      setProvinces(cacheRef.current.provinces);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(PROVINCES_API);
      const data = response.data;

      // Cache the data
      cacheRef.current.provinces = data;
      setProvinces(data);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      setError('Không thể tải danh sách tỉnh/thành phố');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch districts with caching
  const fetchDistricts = useCallback(async (provinceCode) => {
    if (!provinceCode) {
      setDistricts([]);
      setWards([]);
      return;
    }

    // Return cached data if available
    if (cacheRef.current.districts[provinceCode]) {
      setDistricts(cacheRef.current.districts[provinceCode]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${PROVINCES_API}${provinceCode}?depth=2`, {
        signal: abortControllerRef.current.signal,
      });
      const data = response.data.districts;

      // Cache the data
      cacheRef.current.districts[provinceCode] = data;
      setDistricts(data);
      setWards([]); // Reset wards when districts change
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching districts:', error);
        setError('Không thể tải danh sách quận/huyện');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch wards with caching
  const fetchWards = useCallback(async (districtCode) => {
    if (!districtCode) {
      setWards([]);
      return;
    }

    // Return cached data if available
    if (cacheRef.current.wards[districtCode]) {
      setWards(cacheRef.current.wards[districtCode]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`, {
        signal: abortControllerRef.current.signal,
      });
      const data = response.data.wards;

      // Cache the data
      cacheRef.current.wards[districtCode] = data;
      setWards(data);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching wards:', error);
        setError('Không thể tải danh sách phường/xã');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    provinces,
    districts,
    wards,
    loading,
    error,
    fetchProvinces,
    fetchDistricts,
    fetchWards,
  };
};

export default useAddressData;
