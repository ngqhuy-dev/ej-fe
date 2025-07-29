function ModalUpdateStatus({
  order,
  setShowStatusModal,
  handleStatusChange,
  updating,
  newStatus,
  setNewStatus,
  STATUS_MAP,
  STATUS_OPTIONS,
}) {
  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <div className="admin-modal__header">
          <h3>Cập nhật trạng thái đơn hàng</h3>
          <button className="admin-modal__close" onClick={() => setShowStatusModal(false)}>
            ×
          </button>
        </div>
        <div className="admin-modal__body">
          <div className="form-group">
            <label>Trạng thái hiện tại:</label>
            <span className="current-status">{STATUS_MAP[order.status]}</span>
          </div>
          <div className="form-group">
            <label htmlFor="newStatus">Trạng thái mới:</label>
            <select
              id="newStatus"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="form-control"
            >
              <option value="">Chọn trạng thái mới</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="admin-modal__footer">
          <button
            className="admin-btn admin-btn--secondary"
            onClick={() => setShowStatusModal(false)}
            disabled={updating}
          >
            Hủy
          </button>
          <button
            className="admin-btn admin-btn--primary"
            onClick={handleStatusChange}
            disabled={updating || !newStatus}
          >
            {updating ? 'Đang cập nhật...' : 'Cập nhật'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalUpdateStatus;
