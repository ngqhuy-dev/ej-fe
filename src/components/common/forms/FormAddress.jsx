function FormAddress({
  formData,
  handleSubmit,
  handleCloseModal,
  handleInputChange,
  handleSelectProvince,
  handleSelectCity,
  handleSelectWard,
  provinces,
  districts,
  wards,
  loading,
}) {
  return (
    <form className="block__form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="detailed">Địa chỉ chi tiết</label>
        <input
          type="text"
          id="detailed"
          name="detailed"
          value={formData.detailed}
          onChange={handleInputChange}
          placeholder="Số nhà, tòa nhà, tên đường..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="province">Tỉnh/Thành phố</label>
        <select
          id="province"
          name="province"
          value={formData.province}
          onChange={handleSelectProvince}
          disabled={loading}
        >
          <option value="">Chọn Tỉnh/Thành phố</option>
          {provinces.map((province) => (
            <option key={province.code} value={province.name} data-code={province.code}>
              {province.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="city">Quận/Huyện</label>
        <select
          id="city"
          name="city"
          value={formData.city}
          onChange={handleSelectCity}
          disabled={!formData.province || loading}
        >
          <option value="">Chọn Quận/Huyện</option>
          {districts.map((district) => (
            <option key={district.code} value={district.name} data-code={district.code}>
              {district.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="district">Phường/Xã</label>
        <select
          id="district"
          name="district"
          value={formData.district}
          onChange={handleSelectWard}
          disabled={!formData.city || loading}
        >
          <option value="">Chọn Phường/Xã</option>
          {wards.map((ward) => (
            <option key={ward.code} value={ward.name}>
              {ward.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group checkbox">
        <input
          type="checkbox"
          id="isDefault"
          name="isDefault"
          checked={formData.isDefault}
          onChange={handleInputChange}
        />
        <label htmlFor="isDefault">Đặt làm địa chỉ mặc định</label>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={handleCloseModal}>
          Hủy
        </button>
        <button type="submit" className="btn-save">
          Lưu
        </button>
      </div>
    </form>
  );
}

export default FormAddress;
