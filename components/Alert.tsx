
import React from 'react';

interface AlertProps {
  message: string;
  type: 'success' | 'error';
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, type, onClose }) => {
  if (!message) return null;

  const baseClasses = 'p-4 rounded-md mb-4 text-sm flex justify-between items-center';
  const typeClasses = {
    success: 'bg-green-100 border border-green-400 text-green-700',
    error: 'bg-red-100 border border-red-400 text-red-700',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
      <span>{message}</span>
      {onClose && (
         <button onClick={onClose} className="ml-4 font-bold text-lg">&times;</button>
      )}
    </div>
  );
};

export default Alert;
