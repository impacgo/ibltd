import React from 'react';

const PrivacyPolicy = ({ 
  children = 'Privacy Policy', 
  className = '', 
  width = 1200, 
  height = 800,
  showIcon = true 
}) => {
  const openPrivacyPolicy = () => {
    // Open the standalone HTML file in a new tab
    window.open('/PrivacyPolicy.html', '_blank', `noopener,noreferrer,width=${width},height=${height}`);
  };

  return (
    <button
      onClick={openPrivacyPolicy}
      className={`privacy-link ${className}`}
      title="Opens Privacy Policy in new window"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'inherit',
        padding: 0,
        font: 'inherit',
        textDecoration: 'underline',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      {showIcon && (
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          style={{ flexShrink: 0 }}
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      )}
      {children}
    </button>
  );
};

export default PrivacyPolicy;