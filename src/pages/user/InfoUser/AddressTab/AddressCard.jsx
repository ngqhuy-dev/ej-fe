import { memo, useCallback } from 'react';

const AddressCard = ({ address, onUpdate, onDelete, onSetDefault, isViewOnly = false }) => {
  const handleUpdate = useCallback(() => {
    onUpdate(address._id);
  }, [address._id, onUpdate]);

  const handleDelete = useCallback(() => {
    onDelete(address._id);
  }, [address._id, onDelete]);

  const handleSetDefault = useCallback(() => {
    onSetDefault(address._id);
  }, [address._id, onSetDefault]);

  return (
    <div className={`contact-card ${address.isDefault ? 'default' : ''}`}>
      <div className="contact-header">
        <h2 className="contact-name">
          {address._idUser?.fullname} | {address._idUser?.phone}
        </h2>
        {!isViewOnly && (
          <div className="contact-actions">
            <button className="btn-update" onClick={handleUpdate}>
              Cập nhật
            </button>
            <button className="btn-delete" onClick={handleDelete}>
              Xóa
            </button>
          </div>
        )}
      </div>

      <div className="contact-address">
        <p>{address.detailed}</p>
        <p>
          {address.district}, {address.city}, {address.province}
        </p>
      </div>

      {!isViewOnly && (
        <div className="contact-footer">
          {address.isDefault ? (
            <button className="btn-default" disabled>
              Mặc định
            </button>
          ) : (
            <button className="btn-set-default" onClick={handleSetDefault}>
              Thiết lập mặc định
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(AddressCard);
