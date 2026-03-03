// src/components/ReviewBannerWidget.jsx
import React, { useEffect } from "react";

const ReviewBannerWidget = () => {
  useEffect(() => {
    // Load script only once
    if (!document.getElementById("review-banner-script")) {
      const script = document.createElement("script");
      script.id = "review-banner-script";
      script.src = "https://widget.reviewability.com/js/widgetAdv.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <section
      style={{
        padding: "70px 20px",
        background: "#ffffff",
      }}
    >
      <div
        style={{ maxWidth: "1200px", margin: "0 auto" }}
        data-bid="164019"
        data-url="https://app.revu.cloud"
        data-aid="27069"
      ></div>
    </section>
  );
};

export default ReviewBannerWidget;