import React, { useEffect } from 'react';

const Snackbar = ({ message, show, onClose, type = "success" }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const backgroundClass = type === "error" ? "text-bg-danger" :
                          type === "warning" ? "text-bg-warning" :
                          "text-bg-success";

  return (
    <div
      className={`toast align-items-center ${backgroundClass} border-0 position-fixed bottom-0 end-0 m-3 ${show ? 'show' : 'hide'}`}
      role="alert"
    >
      <div className="d-flex">
        <div className="toast-body">{message}</div>
        <button
          type="button"
          className="btn-close btn-close-white me-2 m-auto"
          aria-label="Close"
          onClick={onClose}
        ></button>
      </div>
    </div>
  );
};


export default Snackbar;
