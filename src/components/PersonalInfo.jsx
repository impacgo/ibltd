// src/components/PersonalInfo.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./PersonalInfo.css";

const API_BASE = "https://api.ironingboy.com";

const PersonalInfo = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [quickBookingData, setQuickBookingData] = useState(null);
  const [showBookingInfo, setShowBookingInfo] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: ""
  });

  const [editingField, setEditingField] = useState(null);
  const [originalData, setOriginalData] = useState({});

  // Fetch user profile
  const loadProfile = async () => {
    const token = localStorage.getItem("jwtToken");
    
    try {
      setError(null);
      
      // First, check if there's quick booking data stored
      const storedBookingData = localStorage.getItem("quick_booking_user_info");
      if (storedBookingData) {
        try {
          const bookingData = JSON.parse(storedBookingData);
          setQuickBookingData(bookingData);
          setShowBookingInfo(true);
          
          // Set form data from booking if user is not logged in yet
          if (!token) {
            setFormData({
              name: bookingData.name || "",
              phone: bookingData.phone || "",
              email: bookingData.email || ""
            });
            setOriginalData({
              name: bookingData.name || "",
              phone: bookingData.phone || "",
              email: bookingData.email || ""
            });
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("Error parsing booking data:", err);
          localStorage.removeItem("quick_booking_user_info");
        }
      }

      // If no token and no booking data, show error
      if (!token) {
        setLoading(false);
        setError("Please login to view profile");
        return;
      }

      // Fetch profile from API
      const res = await fetch(`${API_BASE}/profile`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUserData(data);
        
        // Merge booking data with profile data (booking data takes precedence for empty fields)
        const mergedData = {
          name: data.name || (quickBookingData?.name || ""),
          phone: data.phone || (quickBookingData?.phone || ""),
          email: data.email || (quickBookingData?.email || "")
        };
        
        setFormData(mergedData);
        setOriginalData(mergedData);
      } else if (res.status === 401) {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("ironboy_user");
        setError("Session expired. Please login again.");
      } else {
        setError("Failed to load profile data");
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    
    // Check for booking data in URL params (if redirected from thank you page)
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('booking_id');
    const bookingName = params.get('booking_name');
    const bookingEmail = params.get('booking_email');
    const bookingPhone = params.get('booking_phone');
    
    if (bookingName || bookingEmail || bookingPhone) {
      const bookingData = {
        name: bookingName || "",
        email: bookingEmail || "",
        phone: bookingPhone || "",
        bookingId: bookingId || ""
      };
      
      setQuickBookingData(bookingData);
      setShowBookingInfo(true);
      
      // Store in localStorage for persistence
      localStorage.setItem("quick_booking_user_info", JSON.stringify(bookingData));
    }
  }, []);

  // Update user profile
  const updateProfile = async (field, value) => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      // If user is not logged in, store in local storage and show success
      const updatedData = { ...formData, [field]: value };
      setFormData(updatedData);
      setOriginalData(updatedData);
      
      // Update booking data
      if (quickBookingData) {
        const updatedBookingData = { ...quickBookingData, [field]: value };
        setQuickBookingData(updatedBookingData);
        localStorage.setItem("quick_booking_user_info", JSON.stringify(updatedBookingData));
      }
      
      showMessage(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`, "success");
      setEditingField(null);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: value }),
      });

      const responseData = await res.json();

      if (res.ok) {
        // Update local state
        setUserData(prev => ({ ...prev, [field]: value }));
        setOriginalData(prev => ({ ...prev, [field]: value }));
        setEditingField(null);
        
        // Update localStorage if needed
        const userStr = localStorage.getItem("ironboy_user");
        if (userStr) {
          const user = JSON.parse(userStr);
          user[field] = value;
          localStorage.setItem("ironboy_user", JSON.stringify(user));
        }
        
        // Clear booking data if it exists (user has now saved to profile)
        if (quickBookingData) {
          localStorage.removeItem("quick_booking_user_info");
          setQuickBookingData(null);
          setShowBookingInfo(false);
        }
        
        showMessage(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`, "success");
      } else {
        // Revert form data on error
        setFormData(prev => ({ ...prev, [field]: originalData[field] }));
        setError(responseData.message || `Failed to update ${field}`);
        showMessage(`Failed to update ${field}`, "error");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Network error. Please try again.");
      showMessage("Network error. Please try again.", "error");
      // Revert form data on error
      setFormData(prev => ({ ...prev, [field]: originalData[field] }));
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const startEditing = (field) => {
    setEditingField(field);
  };

  const cancelEditing = (field) => {
    setEditingField(null);
    setFormData(prev => ({ ...prev, [field]: originalData[field] }));
  };

  const saveField = async (field) => {
    const value = formData[field];
    
    // Validation
    if (!value.trim()) {
      showMessage(`${field} cannot be empty`, "error");
      return;
    }

    if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        showMessage("Please enter a valid email address", "error");
        return;
      }
    }

    if (field === "phone") {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const cleanedPhone = value.replace(/\D/g, '');
      if (!phoneRegex.test(cleanedPhone)) {
        showMessage("Please enter a valid phone number", "error");
        return;
      }
    }

    // Check if value actually changed
    if (value === originalData[field]) {
      setEditingField(null);
      return;
    }

    await updateProfile(field, value);
  };

  // Logout
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("ironboy_user");
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_type");
      localStorage.removeItem("quick_booking_user_info"); // Clear booking data on logout
      sessionStorage.clear();
      setQuickBookingData(null);
      setShowBookingInfo(false);
      showMessage("Logged out successfully", "success");
      setTimeout(() => window.location.href = "/", 1000);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ WARNING: This will permanently delete your account and all your data. This action cannot be undone. Are you sure?")) {
      return;
    }

    const token = localStorage.getItem("jwtToken");
    if (!token) {
      // If user is not logged in, just clear local data
      localStorage.clear();
      sessionStorage.clear();
      showMessage("Guest data cleared successfully", "success");
      setTimeout(() => window.location.href = "/", 1500);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        showMessage("Account deleted successfully", "success");
        localStorage.clear();
        sessionStorage.clear();
        setTimeout(() => window.location.href = "/", 1500);
      } else {
        const errorData = await res.json();
        showMessage(errorData.message || "Failed to delete account", "error");
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      showMessage("Network error. Please try again.", "error");
    }
  };

  // Create account from booking data
  const handleCreateAccount = async () => {
    if (!quickBookingData) return;
    
    // Navigate to signup page with pre-filled data
    navigate("/signup", {
      state: {
        prefillData: {
          name: quickBookingData.name,
          email: quickBookingData.email,
          phone: quickBookingData.phone
        }
      }
    });
  };

  // Dismiss booking info
  const handleDismissBookingInfo = () => {
    setShowBookingInfo(false);
    localStorage.removeItem("quick_booking_user_info");
    setQuickBookingData(null);
  };

  const showMessage = (message, type = "info") => {
    const existingMsg = document.querySelector('.message-toast');
    if (existingMsg) existingMsg.remove();

    const msgElement = document.createElement('div');
    msgElement.className = `message-toast ${type}`;
    msgElement.innerHTML = `
      <div class="message-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(msgElement);

    setTimeout(() => msgElement.classList.add('show'), 10);
    setTimeout(() => {
      msgElement.classList.remove('show');
      setTimeout(() => msgElement.remove(), 300);
    }, 3000);
  };

  const getInitials = () => {
    const name = formData.name || "User";
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const formatPhone = (phone) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    return match ? `(${match[1]}) ${match[2]}-${match[3]}` : phone;
  };

  if (loading) {
    return (
      <div className="personal-info-container">
        <div className="loading-screen">
          <div className="loading-content">
            <div className="loader"></div>
            <p>Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !userData && !quickBookingData) {
    return (
      <div className="personal-info-container">
        <div className="error-screen">
          <div className="error-content">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Unable to Load Profile</h3>
            <p>{error}</p>
            <button 
              className="primary-btn"
              onClick={() => navigate("/")}
            >
              <i className="fas fa-home"></i> Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="personal-info-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Personal Information</h1>
      </div>

      {/* Quick Booking Info Banner */}
      {showBookingInfo && quickBookingData && (
        <div className="booking-info-banner">
          <div className="booking-info-content">
            <div className="booking-info-icon">
              <i className="fas fa-shopping-bag"></i>
            </div>
            <div className="booking-info-details">
              <h4>Booking Information Found</h4>
              <p>Your details from your recent booking have been pre-filled below. You can edit them or create an account to save them.</p>
              {quickBookingData.bookingId && (
                <div className="booking-id">
                  <i className="fas fa-receipt"></i>
                  <span>Booking ID: {quickBookingData.bookingId}</span>
                </div>
              )}
            </div>
            <div className="booking-info-actions">
              {!userData && (
                <button 
                  className="btn create-account-btn"
                  onClick={handleCreateAccount}
                >
                  <i className="fas fa-user-plus"></i>
                  Create Account
                </button>
              )}
              <button 
                className="btn dismiss-btn"
                onClick={handleDismissBookingInfo}
              >
                <i className="fas fa-times"></i>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (userData || quickBookingData) && (
        <div className="error-banner">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Profile Card */}
      <div className="profile-card">
        {/* Avatar Section */}
        <div className="avatar-section">
          <div className="avatar-circle">
            <div className="avatar-initials">{getInitials()}</div>
          </div>
          <div className="user-info">
            <h2 className="user-name">{formData.name || "User"}</h2>
            <p className="user-email">{formData.email || "No email set"}</p>
            <div className="account-status">
              <span className="status-dot"></span>
              {userData ? "Active Account" : "Guest User"}
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="info-section">
          <h3 className="section-title">Personal Details</h3>
          
          {/* Name Field */}
          <div className={`field-group ${editingField === 'name' ? 'editing' : ''}`}>
            <label>
              <i className="fas fa-user"></i>
              Full Name
            </label>
            <div className="field-content">
              {editingField === 'name' ? (
                <div className="edit-mode">
                  <input
                    type="text"
                    className="edit-input"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your name"
                    autoFocus
                  />
                  <div className="edit-buttons">
                    <button
                      className="btn save-btn"
                      onClick={() => saveField('name')}
                      disabled={saving}
                      aria-label="Save name"
                    >
                      {saving ? <i className="fas fa-spinner fa-spin"></i> : 'Save'}
                    </button>
                    <button
                      className="btn cancel-btn"
                      onClick={() => cancelEditing('name')}
                      disabled={saving}
                      aria-label="Cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="view-mode">
                  <span className="field-value">{formData.name || "Not set"}</span>
                  <button
                    className="edit-btn"
                    onClick={() => startEditing('name')}
                    aria-label="Edit name"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Phone Field */}
          <div className={`field-group ${editingField === 'phone' ? 'editing' : ''}`}>
            <label>
              <i className="fas fa-phone"></i>
              Phone Number
            </label>
            <div className="field-content">
              {editingField === 'phone' ? (
                <div className="edit-mode">
                  <input
                    type="tel"
                    className="edit-input"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                    autoFocus
                  />
                  <div className="edit-buttons">
                    <button
                      className="btn save-btn"
                      onClick={() => saveField('phone')}
                      disabled={saving}
                      aria-label="Save phone"
                    >
                      {saving ? <i className="fas fa-spinner fa-spin"></i> : 'Save'}
                    </button>
                    <button
                      className="btn cancel-btn"
                      onClick={() => cancelEditing('phone')}
                      disabled={saving}
                      aria-label="Cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="view-mode">
                  <span className="field-value">{formatPhone(formData.phone) || "Not set"}</span>
                  <button
                    className="edit-btn"
                    onClick={() => startEditing('phone')}
                    aria-label="Edit phone"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div className={`field-group ${editingField === 'email' ? 'editing' : ''}`}>
            <label>
              <i className="fas fa-envelope"></i>
              Email Address
            </label>
            <div className="field-content">
              {editingField === 'email' ? (
                <div className="edit-mode">
                  <input
                    type="email"
                    className="edit-input"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                    autoFocus
                  />
                  <div className="edit-buttons">
                    <button
                      className="btn save-btn"
                      onClick={() => saveField('email')}
                      disabled={saving}
                      aria-label="Save email"
                    >
                      {saving ? <i className="fas fa-spinner fa-spin"></i> : 'Save'}
                    </button>
                    <button
                      className="btn cancel-btn"
                      onClick={() => cancelEditing('email')}
                      disabled={saving}
                      aria-label="Cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="view-mode">
                  <span className="field-value">{formData.email || "Not set"}</span>
                  <button
                    className="edit-btn"
                    onClick={() => startEditing('email')}
                    aria-label="Edit email"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="actions-section">
          <h3 className="section-title">Account Actions</h3>
          <div className="action-buttons">
            <button 
              className="btn logout-btn"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt"></i>
              {userData ? "Logout" : "Clear Guest Data"}
            </button>
            <button 
              className="btn delete-btn"
              onClick={handleDeleteAccount}
            >
              <i className="fas fa-trash-alt"></i>
              {userData ? "Delete Account" : "Clear All Data"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;