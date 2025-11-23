
import React from 'react';

const GeminiSpinnerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ animation: 'spinner-rotate 1s linear infinite' }}
    {...props}
  >
    {/* Background Track - Changed color to be visible on gray-200 background */}
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="#9CA3AF"
      strokeWidth="2"
    />
    {/* Rotating Indicator */}
    <circle
      cx="12"
      cy="12"
      r="10"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="15, 80"
      style={{ animation: 'spinner-color 3s ease-in-out infinite' }}
    />
  </svg>
);

export default GeminiSpinnerIcon;
