import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-8 right-8 z-[2000] flex flex-col gap-3">
        {toasts.map((toast) => {
          let iconClass = "fa-solid fa-circle-info text-blue-500 dark:text-blue-400";
          let borderClass = "border-l-blue-500";
          if (toast.type === "success") {
            iconClass = "fa-solid fa-circle-check text-green-500 dark:text-green-400";
            borderClass = "border-l-green-500";
          } else if (toast.type === "error") {
            iconClass = "fa-solid fa-triangle-exclamation text-red-500 dark:text-red-400";
            borderClass = "border-l-red-500";
          }
          
          return (
            <div
              key={toast.id}
              onClick={() => removeToast(toast.id)}
              className={`bg-white dark:bg-[#121d33] border-l-4 ${borderClass} text-[#0f172a] dark:text-[#f8fafc] shadow-2xl p-4 rounded-lg flex items-center gap-3 min-w-[300px] max-w-[400px] cursor-pointer transition-all duration-300 hover:scale-[1.02] border border-slate-100 dark:border-slate-800`}
            >
              <i className={iconClass}></i>
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
