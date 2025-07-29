import { useCallback, useState } from 'react';
import AddressTab from '@pages/user/InfoUser/AddressTab';

function ModalAddress({ onClose, onSelect }) {
  const [selectedId, setSelectedId] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const handleCloseModal = () => {
    setShowAddressModal(false);
  };

  const handleConfirm = () => {
    onSelect(...selectedId);
  };

  const handleSelectDefault = useCallback((id) => {
    setSelectedId(id);
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal__content-address">
        <div className="modal-header">
          <button className="close-btn" onClick={showAddressModal ? handleCloseModal : onClose}>
            &times;
          </button>
        </div>
        <AddressTab selectedDefault={handleSelectDefault} />
        <div className="modal-footer">
          <div className="modal-action_buttons">
            <button className="btn btn-cancel modal-btn" onClick={showAddressModal ? handleCloseModal : onClose}>
              Hủy
            </button>
            <button className="btn btn-add modal-btn" onClick={handleConfirm}>
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalAddress;
