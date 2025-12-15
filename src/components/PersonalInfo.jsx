// src/pages/PersonalInfo.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PersonalInfo.css";

const API_BASE = "https://api.ironingboy.com";

const PersonalInfo = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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
    if (!token) {
      setLoading(false);
      setError("Please login to view profile");
      return;
    }

    try {
      setError(null);
      const res = await fetch(`${API_BASE}/profile`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUserData(data);
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || ""
        });
        setOriginalData({
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || ""
        });
      } else if (res.status === 401) {
        localStorage.removeItem("jwtToken");
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
  }, []);

  // Update user profile
  const updateProfile = async (field, value) => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setError("Please login to update profile");
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
        
        // Show success message
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
      localStorage.removeItem("userData");
      showMessage("Logged out successfully", "success");
      setTimeout(() => navigate("/"), 1000);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ WARNING: This will permanently delete your account and all your data. This action cannot be undone. Are you sure?")) {
      return;
    }

    const token = localStorage.getItem("jwtToken");
    if (!token) return;

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
        setTimeout(() => navigate("/"), 1500);
      } else {
        const errorData = await res.json();
        showMessage(errorData.message || "Failed to delete account", "error");
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      showMessage("Network error. Please try again.", "error");
    }
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
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loader"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="error-screen">
        <div className="error-content">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Unable to Load Profile</h3>
          <p>{error}</p>
          <button 
            className="primary-btn"
            onClick={() => navigate("/login")}
          >
            <i className="fas fa-sign-in-alt"></i> Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="personal-info-container">
      {/* Header */}
      <div className="profile-header">
        <button 
          className="back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1 className="page-title" style={{color:"black"}}>Personal Information</h1>
        <div className="header-actions">
          <button 
            className="refresh-btn"
            onClick={loadProfile}
            aria-label="Refresh"
            disabled={loading}
          >
            <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && userData && (
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
              Active Account
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="info-section">
          <h3 className="section-title" style={{color:"black"}}>Personal Details</h3>
          
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
          <h3 className="section-title" style={{color:"black"}}>Account Actions</h3>
          <div className="action-buttons">
            <button 
              className="btn logout-btn"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
            <button 
              className="btn delete-btn"
              onClick={handleDeleteAccount}
            >
              <i className="fas fa-trash-alt"></i>
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;