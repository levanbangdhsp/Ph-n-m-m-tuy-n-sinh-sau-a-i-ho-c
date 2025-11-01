import React from 'react';

interface TextAreaFieldProps {
  id: string;
  name?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        id={id}
        name={name || id}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    </div>
  );
};

export default TextAreaField;
