import React from 'react';

const StepperArrowIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 100 50"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Redesigned path with a thinner body and a clear arrowhead */}
    <path d="M 0 24 H 80 L 80 19 L 100 25 L 80 31 L 80 26 H 0 Z" fill="currentColor" />
  </svg>
);

export default StepperArrowIcon;