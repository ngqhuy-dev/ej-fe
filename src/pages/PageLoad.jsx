const PageLoad = (zIndex) => {
  const loaderStyles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: `${zIndex}`,
      backgroundColor: 'rgba(248, 250, 252, 0.95)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      transition: 'opacity 0.3s ease-in-out',
    },
    spinner: {
      width: '48px',
      height: '48px',
      border: '5px solid #1f2937',
      borderTop: '5px solid transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
  };

  // Định nghĩa keyframes cho animation
  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={loaderStyles.container}>
        <div style={loaderStyles.spinner}></div>
      </div>
    </>
  );
};

export default PageLoad;
