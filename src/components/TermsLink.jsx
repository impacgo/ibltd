
import React from 'react';

const TermsLink = ({ children = 'Terms & Conditions', className = '' }) => {
  const openTermsInNewTab = () => {
    // Open the standalone HTML file in a new tab
    window.open('/terms.html', '_blank', 'noopener,noreferrer,width=1200,height=800');
  };

  return (
    <button
      onClick={openTermsInNewTab}
      className={`terms-link ${className}`}
      title="Opens in new window"
    >
      {children}
    </button>
  );
};

export default TermsLink;