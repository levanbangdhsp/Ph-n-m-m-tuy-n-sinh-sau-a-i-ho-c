
import React, { useState } from 'react';
import EyeIcon from './icons/EyeIcon';
import EyeSlashIcon from './icons/EyeSlashIcon';

interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = type === 'password';

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPasswordField ? (isPasswordVisible ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
          >
            {isPasswordVisible ? <EyeSlashIcon className="h-5 w-5 text-gray-500" /> : <EyeIcon className="h-5 w-5 text-gray-500" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputField;
