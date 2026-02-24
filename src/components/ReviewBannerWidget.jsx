
// src/components/ReviewBannerWidget.jsx
import React, { useEffect, useRef } from "react";

const ReviewBannerWidget = () => {
  const widgetRef = useRef(null);

  useEffect(() => {
    // Prevent multiple script loads
    if (!document.getElementById("review-widget-script")) {
      const script = document.createElement("script");
      script.id = "review-widget-script";
      script.src = "https://widget.reviewability.com/js/widgetAdv.min.js";
      script.async = true;
      document.body.appendChild(script);
    } else {
      // If script already exists, re-trigger widget
      if (window && window.dispatchEvent) {
        window.dispatchEvent(new Event("load"));
      }
    }
  }, []);

  return (
    <section
      style={{
        padding: "80px 20px",
        background: "#f9fafb",
        textAlign: "center",
      }}
    >
      <div
        ref={widgetRef}
        data-bid="164019"
        data-url="https://app.revu.cloud"
        data-aid="27069"
      ></div>
    </section>
  );
};

export default ReviewBannerWidget;