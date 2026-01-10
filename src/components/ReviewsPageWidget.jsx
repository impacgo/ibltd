// src/components/ReviewsPageWidget.jsx
import { useEffect } from "react";

const ReviewsPageWidget = () => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://widget.reviewability.com/js/widgetAdv.min.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <>
            <div
                data-bid="164019"
                data-url="https://app.revu.cloud"
                id="reviewspage-widget"
            ></div>
            <script
                type="application/ld+json"
                className="json-ld-content"
            ></script>
        </>
    );
};

export default ReviewsPageWidget;