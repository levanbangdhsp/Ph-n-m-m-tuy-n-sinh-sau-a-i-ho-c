
import React from 'react';

interface RadioGroupProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  selectedValue: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ label, name, options, selectedValue, onChange }) => {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-2 flex items-center space-x-4">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`${name}-${option.value}`}
              name={name}
              type="radio"
              value={option.value}
              checked={selectedValue === option.value}
              onChange={onChange}
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
            />
            <label htmlFor={`${name}-${option.value}`} className="ml-2 block text-sm text-gray-900">
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RadioGroup;
