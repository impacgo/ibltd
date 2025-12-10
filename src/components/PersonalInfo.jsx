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

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [editName, setEditName] = useState(false);
  const [editPhone, setEditPhone] = useState(false);
  const [editEmail, setEditEmail] = useState(false);

  const [originalName, setOriginalName] = useState("");
  const [originalPhone, setOriginalPhone] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");

  const loadProfile = async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/profile`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUserData(data);
        setName(data.name || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");
        setOriginalName(data.name || "");
        setOriginalPhone(data.phone || "");
        setOriginalEmail(data.email || "");
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const updateField = async (field, value) => {
    const token = localStorage.getItem("jwtToken");
    if (!token) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (res.ok) {
        // Update local state
        setUserData({ ...userData, [field]: value });
        
        // Update original values
        if (field === "name") {
          setOriginalName(value);
          setEditName(false);
        }
        if (field === "phone") {
          setOriginalPhone(value);
          setEditPhone(false);
        }
        if (field === "email") {
          setOriginalEmail(value);
          setEditEmail(false);
        }

        // Show success feedback
        showToast(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
      } else {
        showToast(`Failed to update ${field}. Please try again.`, "error");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      showToast("Connection error. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = (field) => {
    if (field === "name") {
      setName(originalName);
      setEditName(false);
    }
    if (field === "phone") {
      setPhone(originalPhone);
      setEditPhone(false);
    }
    if (field === "email") {
      setEmail(originalEmail);
      setEditEmail(false);
    }
  };

  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      navigate("/");
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
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
        showToast("Account deleted successfully", "success");
        setTimeout(() => {
          localStorage.clear();
          navigate("/");
        }, 1500);
      } else {
        showToast("Failed to delete account", "error");
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      showToast("Server error. Please try again.", "error");
    }
  };

  const showToast = (message, type = "success") => {
    // Remove existing toast if any
    const existingToast = document.querySelector('.profile-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `profile-toast ${type}`;
    toast.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  const getInitials = () => {
    if (!name) return "?";
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return "";
    // Format: (XXX) XXX-XXXX
    const cleaned = phoneNumber.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phoneNumber;
  };

  if (loading) {
    return (
      <div className="profile-loader">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-empty">
        <div className="empty-container">
          <i className="fas fa-user-slash"></i>
          <h3>Not Logged In</h3>
          <p>Please login to view your profile</p>
          <button 
            className="login-btn"
            onClick={() => navigate("/")}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="personal-info-page">
        <div className="profile-background">
          <div className="profile-container">
            
            {/* Header with back button */}
            <div className="profile-header">
              <button 
                className="back-button"
                onClick={() => navigate(-1)}
                aria-label="Go back"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <h1 className="page-title">Personal Information</h1>
              <div className="header-placeholder"></div>
            </div>

            {/* User Profile Card */}
            <div className="profile-card">
              {/* Avatar Section */}
              <div className="avatar-section">
                <div className="avatar-container">
                  <div className="avatar-circle">
                    {getInitials()}
                  </div>
                  <div className="avatar-status">
                    <div className="status-dot"></div>
                    <span>Active</span>
                  </div>
                </div>
                <div className="user-info">
                  <h2 className="user-name">{name || "User"}</h2>
                  <p className="user-email">{email || "No email provided"}</p>
                  <div className="member-since">
                    <i className="fas fa-crown"></i>
                    <span>Member since {new Date().getFullYear()}</span>
                  </div>
                </div>
              </div>

              {/* Information Sections */}
              <div className="info-sections">
                <div className="section-header">
                  <i className="fas fa-user-circle"></i>
                  <h3>Personal Details</h3>
                </div>

                {/* Name Field */}
                <div className={`info-field ${editName ? 'editing' : ''}`}>
                  <div className="field-label">
                    <i className="fas fa-user"></i>
                    <span>Full Name</span>
                  </div>
                  <div className="field-content">
                    {editName ? (
                      <div className="edit-mode">
                        <input
                          type="text"
                          className="edit-input"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          autoFocus
                          placeholder="Enter your full name"
                        />
                        <div className="edit-actions">
                          <button
                            className="action-btn save-btn"
                            onClick={() => updateField("name", name)}
                            disabled={saving || !name.trim()}
                          >
                            {saving ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fas fa-check"></i>
                            )}
                          </button>
                          <button
                            className="action-btn cancel-btn"
                            onClick={() => cancelEdit("name")}
                            disabled={saving}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="display-mode">
                        <span className="field-value">{name || "Not set"}</span>
                        <button
                          className="edit-trigger"
                          onClick={() => setEditName(true)}
                          aria-label="Edit name"
                        >
                          <i className="fas fa-pen"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Phone Field */}
                <div className={`info-field ${editPhone ? 'editing' : ''}`}>
                  <div className="field-label">
                    <i className="fas fa-phone"></i>
                    <span>Phone Number</span>
                  </div>
                  <div className="field-content">
                    {editPhone ? (
                      <div className="edit-mode">
                        <input
                          type="tel"
                          className="edit-input"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          autoFocus
                          placeholder="Enter your phone number"
                        />
                        <div className="edit-actions">
                          <button
                            className="action-btn save-btn"
                            onClick={() => updateField("phone", phone)}
                            disabled={saving || !phone.trim()}
                          >
                            {saving ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fas fa-check"></i>
                            )}
                          </button>
                          <button
                            className="action-btn cancel-btn"
                            onClick={() => cancelEdit("phone")}
                            disabled={saving}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="display-mode">
                        <span className="field-value">{formatPhoneNumber(phone) || "Not set"}</span>
                        <button
                          className="edit-trigger"
                          onClick={() => setEditPhone(true)}
                          aria-label="Edit phone"
                        >
                          <i className="fas fa-pen"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div className={`info-field ${editEmail ? 'editing' : ''}`}>
                  <div className="field-label">
                    <i className="fas fa-envelope"></i>
                    <span>Email Address</span>
                  </div>
                  <div className="field-content">
                    {editEmail ? (
                      <div className="edit-mode">
                        <input
                          type="email"
                          className="edit-input"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoFocus
                          placeholder="Enter your email address"
                        />
                        <div className="edit-actions">
                          <button
                            className="action-btn save-btn"
                            onClick={() => updateField("email", email)}
                            disabled={saving || !email.trim()}
                          >
                            {saving ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fas fa-check"></i>
                            )}
                          </button>
                          <button
                            className="action-btn cancel-btn"
                            onClick={() => cancelEdit("email")}
                            disabled={saving}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="display-mode">
                        <span className="field-value">{email || "Not set"}</span>
                        <button
                          className="edit-trigger"
                          onClick={() => setEditEmail(true)}
                          aria-label="Edit email"
                        >
                          <i className="fas fa-pen"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Security Section */}
                <div className="section-header">
                  <i className="fas fa-shield-alt"></i>
                  <h3>Account Security</h3>
                </div>

                {/* Logout Button */}
                <div className="action-field logout-field" onClick={logout}>
                  <div className="field-label">
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                  </div>
                  <div className="field-arrow">
                    <i className="fas fa-chevron-right"></i>
                  </div>
                </div>

                {/* Delete Account Button */}
                <div className="action-field delete-field" onClick={deleteAccount}>
                  <div className="field-label">
                    <i className="fas fa-trash-alt"></i>
                    <span>Delete Account</span>
                  </div>
                  <div className="field-warning">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="stats-section">
                  <div className="stat-item">
                    <i className="fas fa-shopping-bag"></i>
                    <div className="stat-details">
                      <div className="stat-label">Total Orders</div>
                      <div className="stat-value">0</div>
                    </div>
                  </div>
                  <div className="stat-item">
                    <i className="fas fa-star"></i>
                    <div className="stat-details">
                      <div className="stat-label">Member Since</div>
                      <div className="stat-value">{new Date().getFullYear()}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="profile-footer">
                <i className="fas fa-info-circle"></i>
                <p>Your information is securely stored and protected.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PersonalInfo;