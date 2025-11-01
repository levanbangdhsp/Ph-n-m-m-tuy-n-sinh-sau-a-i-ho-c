
import React from 'react';

const EyeSlashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 10.73C12.45 9.42 15.36 9.22 17.5 11c1.8 1.5 3.12 3.56 3.5 5.5" />
    <path d="M2 12s3-7 10-7a9.74 9.74 0 0 1 5 1.6" />
    <path d="m2 2 20 20" />
  </svg>
);

export default EyeSlashIcon;
