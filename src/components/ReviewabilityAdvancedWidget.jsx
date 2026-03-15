import React, { useEffect, useRef } from 'react';

const REVIEWABILITY_ADVANCED_WIDGET_SRC = 'https://widget.reviewability.com/js/widgetAdv.min.js';

const ReviewabilityAdvancedWidget = ({ bid, url, aid, className = '' }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mountNode = mountRef.current;

    if (!mountNode) {
      return undefined;
    }

    mountNode.innerHTML = '';

    const widgetContainer = document.createElement('div');
    widgetContainer.setAttribute('data-bid', bid);
    widgetContainer.setAttribute('data-url', url);

    if (aid) {
      widgetContainer.setAttribute('data-aid', aid);
    }

    const vendorScript = document.createElement('script');
    vendorScript.src = REVIEWABILITY_ADVANCED_WIDGET_SRC;
    vendorScript.async = true;
    widgetContainer.appendChild(vendorScript);

    const jsonLdScript = document.createElement('script');
    jsonLdScript.className = 'json-ld-content';
    jsonLdScript.type = 'application/ld+json';

    mountNode.appendChild(widgetContainer);
    mountNode.appendChild(jsonLdScript);

    return () => {
      mountNode.innerHTML = '';
    };
  }, [aid, bid, url]);

  return <div className={className} ref={mountRef} />;
};

export default ReviewabilityAdvancedWidget;
