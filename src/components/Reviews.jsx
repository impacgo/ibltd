
import './Reviews.css';

const Reviews = () => {
  return (
    <section className="reviews-page">
      <div className="reviews-shell">
        <div className="reviews-header">
          <div className="reviews-badge">
            <i className="fas fa-star"></i>
            <span>Verified Reviews</span>
          </div>
          <h1 className="reviews-title">Customer Reviews</h1>
          <p className="reviews-subtitle">
            Read verified customer feedback from across the UK.
          </p>
        </div>

        <div className="reviews-widget-panel">
          <div class="trustpilot-widget" data-locale="en-GB" data-template-id="539adbd6dec7e10e686debee" data-businessunit-id="699c575141462e7a0920077a" data-style-height="500px" data-style-width="100%" data-token="4e341fae-41a0-4daf-8c92-d2e8dd58db13" data-stars="4,5" data-review-languages="en">
  <a href="https://uk.trustpilot.com/review/ironingboy.com" target="_blank" rel="noopener">Trustpilot</a>
</div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
