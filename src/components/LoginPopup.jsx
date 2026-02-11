import React, { useState } from "react";
import "./LoginPopup.css";

import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext"; 
import Google from "../images/google-logo.png";
import apple from "../images/icons8-apple-logo-50.png";
import { ArrowLeft, Mail, Phone, User } from "lucide-react";

const API_BASE = "https://api.ironingboy.com";

// Initialize Firebase auth
const auth = getAuth(app);

/**
 * Helper: safely parse JSON responses
 */
async function safeJson(res) {
  const text = await res.text().catch(() => "");
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || "Unexpected response" };
  }
}

/**
 * Helper: show connection error for network failures
 */
function friendlyNetworkError(err) {
  console.error("Network error:", err);
  return "Connection error — please check your internet or try again later.";
}

const LoginPopup = ({ close, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Login (Email & Phone), 2: Signup (Name, Email, Phone)
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");


  // Get login function from AuthContext
  const { login } = useAuth();

  // Login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPhone, setLoginPhone] = useState("");

  // Signup states
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+44");

const countryCodes = [
  { code: "+44", label: "UK" },
  { code: "+91", label: "IN" },
  { code: "+1", label: "US" },
  { code: "+61", label: "AU" },
  { code: "+971", label: "UAE" },
];


  // Persist session helper - minimal safe object
  const saveSession = ({ token, user_id, user }) => {
    // Clear any stale session to avoid mismatch
    try {
      localStorage.removeItem("ironboy_user");
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_type");
    } catch (e) {
      /* ignore */
    }

    // Store the token and user data
    if (token) localStorage.setItem("jwtToken", token);
    if (user_id) localStorage.setItem("user_id", user_id);
    localStorage.setItem("user_type", "customer");

    const safeObj = {
      user_id: user_id || null,
      token: token || null,
      user: user || null,
    };
    localStorage.setItem("ironboy_user", JSON.stringify(safeObj));
    
    // Update the auth context
    login(safeObj);
  };

  // -------------------------------------------------------
  // VALIDATE PHONE NUMBER
  // -------------------------------------------------------
  const validatePhone = (phone) => {
    // Basic phone validation - adjust based on your requirements
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phone);
  };

  // -------------------------------------------------------
  // VALIDATE EMAIL
  // -------------------------------------------------------
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // -------------------------------------------------------
  // CHECK USER EXISTS AND LOGIN
  // -------------------------------------------------------
  const handleLogin = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    
    // Validate inputs
    if (!loginEmail.trim() && !loginPhone.trim()) {
      setErrorMsg("Please enter email or phone number");
      return;
    }
    
    if (loginEmail.trim() && !validateEmail(loginEmail)) {
      setErrorMsg("Please enter a valid email address");
      return;
    }
    
    if (loginPhone.trim() && !validatePhone(loginPhone)) {
      setErrorMsg("Please enter a valid 10-15 digit phone number");
      return;
    }

    setLoading(true);

    try {
      // For login, we need to check if user exists first
      // Try email first if provided
      let existingUser = null;
      let userIdentifier = "";
      
      if (loginEmail.trim()) {
        const emailCheckRes = await fetch(`${API_BASE}/checkUserExists`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: loginEmail }),
        });
        
        if (emailCheckRes.ok) {
          const emailData = await safeJson(emailCheckRes);
          if (emailData.exists) {
            existingUser = emailData;
            userIdentifier = loginEmail;
          }
        }
      }
      
      // If not found by email, try phone
      if (!existingUser && loginPhone.trim()) {
        const phoneCheckRes = await fetch(`${API_BASE}/checkUserExists`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: loginPhone }),
        });
        
        if (phoneCheckRes.ok) {
          const phoneData = await safeJson(phoneCheckRes);
          if (phoneData.exists) {
            existingUser = phoneData;
            userIdentifier = loginPhone;
          }
        }
      }
      
      if (!existingUser) {
        setErrorMsg("No account found with these details. Please sign up.");
        setLoading(false);
        return;
      }
      
      // Get user name for login
      let userName = "User";
      try {
        const nameRes = await fetch(`${API_BASE}/getUserByIdentifier`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: userIdentifier }),
        });
        
        if (nameRes.ok) {
          const nameData = await safeJson(nameRes);
          userName = nameData.name || "User";
        }
      } catch (e) {
        // Continue with default name if fetch fails
      }
      
      // Call auth/access for login
      const requestBody = {
        name: userName,
        email: loginEmail.trim(),
        phone: loginPhone.trim()
  ? `${countryCode}${loginPhone.trim()}`
  : "",
        googleSignIn: false,
        appleSignIn: false,
      };

      const res = await fetch(`${API_BASE}/auth/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await safeJson(res);

      if (res.ok && data.success === true) {
        // Save the session and notify parent
        saveSession({ 
          token: data.token, 
          user_id: data.user?.id || data.user_id, 
          user: data.user 
        });
        onSuccess && onSuccess();
        close && close();
      } else {
        setErrorMsg(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setErrorMsg(friendlyNetworkError(err));
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // SIGNUP USER
  // -------------------------------------------------------
  const handleSignup = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    
    // Validate inputs
    if (!fullName.trim()) {
      setErrorMsg("Full name is required");
      return;
    }
    
    if (!signupEmail.trim()) {
      setErrorMsg("Email is required");
      return;
    }
    
    if (!signupPhone.trim()) {
      setErrorMsg("Phone number is required");
      return;
    }
    
    if (!validateEmail(signupEmail)) {
      setErrorMsg("Please enter a valid email address");
      return;
    }
    
    if (!validatePhone(signupPhone)) {
      setErrorMsg("Please enter a valid 10-15 digit phone number");
      return;
    }

    setLoading(true);

    try {
      // Check if user already exists with email or phone
      const checkPromises = [];
      
      if (signupEmail.trim()) {
        checkPromises.push(
          fetch(`${API_BASE}/checkUserExists`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier: signupEmail }),
          })
        );
      }
      
      if (signupPhone.trim()) {
        checkPromises.push(
          fetch(`${API_BASE}/checkUserExists`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier: signupPhone }),
          })
        );
      }
      
      const responses = await Promise.all(checkPromises);
      const results = await Promise.all(responses.map(res => safeJson(res)));
      
      let userExists = false;
      let existingIdentifier = "";
      
      results.forEach((result, index) => {
        if (result.exists) {
          userExists = true;
          existingIdentifier = index === 0 ? signupEmail : signupPhone;
        }
      });
      
      if (userExists) {
        setErrorMsg(`An account already exists with ${existingIdentifier.includes('@') ? 'email' : 'phone'} ${existingIdentifier}. Please login.`);
        setLoading(false);
        return;
      }
      
      // Call auth/access for signup
      const requestBody = {
        name: fullName.trim(),
        email: signupEmail.trim(),
        phone: `${countryCode}${signupPhone.trim()}`,
        googleSignIn: false,
        appleSignIn: false,
      };

      const res = await fetch(`${API_BASE}/auth/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await safeJson(res);

      if (res.ok && data.success === true) {
        // Save the session and notify parent
        saveSession({ 
          token: data.token, 
          user_id: data.user?.id || data.user_id, 
          user: data.user 
        });
        onSuccess && onSuccess();
        close && close();
      } else {
        setErrorMsg(data.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      setErrorMsg(friendlyNetworkError(err));
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // GOOGLE LOGIN/SIGNUP
  // -------------------------------------------------------
  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user) throw new Error("No user returned from Google");

      // Use Google user info for access
      const requestBody = {
        name: user.displayName || user.email.split('@')[0],
        email: user.email || '',
        phone: user.phoneNumber || '',
        googleSignIn: true,
        appleSignIn: false,
      };

      const res = await fetch(`${API_BASE}/auth/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await safeJson(res);

      if (res.ok && data.success === true) {
        // Save the session and notify parent
        saveSession({ 
          token: data.token, 
          user_id: data.user?.id || data.user_id, 
          user: data.user 
        });
        onSuccess && onSuccess();
        close && close();
      } else {
        setErrorMsg(data.message || "Google login failed. Please try again.");
      }

    } catch (err) {
      console.error("Google Login Error:", err);

      if (err.code === "auth/unauthorized-domain") {
        setErrorMsg("Domain not authorized. Contact support.");
      } else if (err.code === "auth/popup-blocked") {
        setErrorMsg("Popup blocked. Allow popups and try again.");
      } else if (err.code === "auth/cancelled-popup-request") {
        setErrorMsg("Login cancelled by user.");
      } else {
        setErrorMsg("Google login failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // APPLE LOGIN (Placeholder)
  // -------------------------------------------------------
  const handleAppleLogin = () => {
    setErrorMsg("Apple login is currently unavailable. Please use Google or email/phone.");
  };

  // -------------------------------------------------------
  // BACK BUTTON HANDLER
  // -------------------------------------------------------
  const handleBack = () => {
    setErrorMsg("");
    setSuccessMsg("");
    if (step === 2) {
      setStep(1);
    }
  };

  // -------------------------------------------------------
  // SWITCH TO SIGNUP
  // -------------------------------------------------------
  const switchToSignup = () => {
    // Pre-fill signup form with login values if available
    if (loginEmail.trim()) {
      setSignupEmail(loginEmail);
    }
    if (loginPhone.trim()) {
      setSignupPhone(loginPhone);
    }
    setStep(2);
  };

  // -------------------------------------------------------
  // HANDLE ENTER KEY PRESS
  // -------------------------------------------------------
  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      action();
    }
  };

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------
  return (
    <div className="login-popup-overlay" role="dialog" aria-modal="true">
      <div className="login-popup" aria-live="polite">
        {/* Header with back button for step 2 */}
        <div className="login-header">
          {step === 2 && (
            <button className="login-back-btn" onClick={handleBack} disabled={loading}>
              <ArrowLeft size={20} />
            </button>
          )}
          <h3>
            {step === 1 && "Welcome Back"}
            {step === 2 && "Create Account"}
          </h3>
        </div>

        {successMsg && <p className="login-success">{successMsg}</p>}
        {errorMsg && <p className="login-error">{errorMsg}</p>}

        {/* STEP 1: Login with Email & Phone */}
        {step === 1 && (
          <>
            <p className="login-subtitle">Enter your email and phone number to login</p>
            
            <div className="input-with-icon">
              <Mail size={20} className="input-icon" />
              <input
                type="email"
                placeholder="Email Address"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleLogin)}
                disabled={loading}
              />
            </div>
            
            <div className="input-with-icon phone-group">
  <Phone size={20} className="input-icon" />

  <select
    className="country-code-select"
    value={countryCode}
    onChange={(e) => setCountryCode(e.target.value)}
    disabled={loading}
  >
    {countryCodes.map((c) => (
      <option key={c.code} value={c.code}>
        {c.code}
      </option>
    ))}
  </select>

  <input
    type="tel"
    placeholder="Phone Number"
    value={loginPhone}
    onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ""))}
    onKeyPress={(e) => handleKeyPress(e, handleLogin)}
    disabled={loading}
    maxLength={15}
  />
</div>

            
            <button 
              className="login-btn" 
              onClick={handleLogin} 
              disabled={loading || (!loginEmail.trim() && !loginPhone.trim())}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            
            <div className="login-divider">
              <span>Or continue with</span>
            </div>

            <div className="login-social-row">
              <button 
                className="social-btn" 
                onClick={handleGoogleLogin}
                disabled={loading}
                aria-label="Sign in with Google"
              >
                <img src={Google} alt="Google" />
              </button>
              <button 
                className="social-btn"
                onClick={handleAppleLogin}
                disabled={loading}
                aria-label="Sign in with Apple"
              >
                <img src={apple} alt="Apple" />
              </button>
            </div>
          </>
        )}

        {/* STEP 2: Signup */}
        {step === 2 && (
          <>
            <p className="login-subtitle">Enter your details to create an account</p>
            
            <div className="input-with-icon">
              <User size={20} className="input-icon" />
              <input 
                type="text" 
                placeholder="Full Name *" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                disabled={loading}
                onKeyPress={(e) => handleKeyPress(e, handleSignup)}
              />
            </div>
            
            <div className="input-with-icon">
              <Mail size={20} className="input-icon" />
              <input 
                type="email" 
                placeholder="Email Address *" 
                value={signupEmail} 
                onChange={(e) => setSignupEmail(e.target.value)} 
                disabled={loading}
                onKeyPress={(e) => handleKeyPress(e, handleSignup)}
              />
            </div>
            
            <div className="input-with-icon phone-group">
  <Phone size={20} className="input-icon" />

  <select
    className="country-code-select"
    value={countryCode}
    onChange={(e) => setCountryCode(e.target.value)}
    disabled={loading}
  >
    {countryCodes.map((c) => (
      <option key={c.code} value={c.code}>
        {c.code}
      </option>
    ))}
  </select>

  <input
    type="tel"
    placeholder="Phone Number *"
    value={signupPhone}
    onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ""))}
    disabled={loading}
    maxLength={15}
    onKeyPress={(e) => handleKeyPress(e, handleSignup)}
  />
</div>

            
            <button 
              className="login-btn" 
              onClick={handleSignup} 
              disabled={loading || !fullName.trim() || !signupEmail.trim() || !signupPhone.trim()}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
            
            <p className="password-hint">* All fields are required</p>
          </>
        )}

        {/* Footer Links */}
        <div className="login-footer">
          <p className="login-footer-text">
            {step === 1 ? "Don't have an account? " : "Already have an account? "}
            <button 
              className="login-footer-link" 
              onClick={step === 1 ? switchToSignup : handleBack}
              disabled={loading}
            >
              {step === 1 ? "Sign up" : "Login"}
            </button>
          </p>
        </div>

        {/* Close Button */}
        <button className="login-close" onClick={close} disabled={loading}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LoginPopup;