// BackgroundWrapper.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import vido from "../images/ironingvid.mp4";
import './BackgroundWrapper.css';

const BackgroundWrapper = ({ children }) => {
  const location = useLocation();
  const showBackground = ['/', '/login', '/services', '/pricing', '/testimonials', '/faq', '/how-it-works'].includes(location.pathname);

  if (!showBackground) return children;

  return (
    <div className="background-wrapper">
      <video
        className="background-video"
        src={vido}
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="background-overlay" />
      <div className="content-wrapper">
        {children}
      </div>
    </div>
  );
};

export default BackgroundWrapper;