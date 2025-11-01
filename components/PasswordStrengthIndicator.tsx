import React from 'react';
import { PasswordValidationResult } from '../utils/validation';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';

interface PasswordStrengthIndicatorProps {
  validationResult: PasswordValidationResult;
}

interface Requirement {
  key: keyof PasswordValidationResult['criteria'];
  label: string;
}

const requirements: Requirement[] = [
  { key: 'minLength', label: 'Ít nhất 8 ký tự' },
  { key: 'uppercase', label: 'Ít nhất 1 chữ hoa (A-Z)' },
  { key: 'lowercase', label: 'Ít nhất 1 chữ thường (a-z)' },
  { key: 'number', label: 'Ít nhất 1 chữ số (0-9)' },
  { key: 'specialChar', label: 'Ít nhất 1 ký tự đặc biệt (!@#...)' },
];

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ validationResult }) => {
  return (
    <div className="my-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
      <ul className="space-y-1">
        {requirements.map((req) => {
          const isMet = validationResult.criteria[req.key];
          return (
            <li key={req.key} className={`flex items-center text-sm ${isMet ? 'text-green-600' : 'text-gray-500'}`}>
              {isMet ? (
                <CheckCircleIcon className="w-4 h-4 mr-2" />
              ) : (
                <XCircleIcon className="w-4 h-4 mr-2" />
              )}
              {req.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PasswordStrengthIndicator;
