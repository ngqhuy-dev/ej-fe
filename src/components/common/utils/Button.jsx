function Button({ onClick, children, type = 'button', className = 'btn', to, loading = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${className} ${loading ? 'btn-loading' : ''}`}
      disabled={loading}
      {...(to && { to })}
    >
      {loading && <span className="spinner"></span>}
      {children}
    </button>
  );
}

export default Button;
