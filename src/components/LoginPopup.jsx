import React, { useState } from "react";
import "./LoginPopup.css";

import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext"; 
import Google from "../images/google-logo.png";
import apple from "../images/icons8-apple-logo-50.png";
import { Eye, EyeOff, ArrowLeft, Mail, Phone, Lock, User } from "lucide-react";

const API_BASE = "https://api.ironingboy.com";

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
  const [step, setStep] = useState(1); // 1: Email/Phone, 2: Password, 3: Signup, 4: Forgot Password, 5: Reset Password
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Get login function from AuthContext
  const { login } = useAuth();

  // Login states
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  // Signup states
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  // Forgot password states
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");

  // Persist session helper - minimal safe object
  const saveSession = ({ token, user_id, identifier: id }) => {
    // Clear any stale session to avoid mismatch
    try {
      localStorage.removeItem("ironboy_user");
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_type");
    } catch (e) {
      /* ignore */
    }

    // store the token and user id (for API calls) and a light ironboy_user object
    if (token) localStorage.setItem("jwtToken", token);
    if (user_id) localStorage.setItem("user_id", user_id);
    localStorage.setItem("user_type", "customer");

    const safeObj = {
      user_id: user_id || null,
      identifier: id || identifier || null,
      token: token || null,
    };
    localStorage.setItem("ironboy_user", JSON.stringify(safeObj));
    
    // Update the auth context
    login(safeObj);
  };

  // -------------------------------------------------------
  // CHECK USER EXISTS
  // -------------------------------------------------------
  const checkUserExists = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    if (!identifier.trim()) {
      setErrorMsg("Please enter Email or Phone");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/checkUserExists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      if (!res.ok) {
        // non-2xx
        const payload = await safeJson(res);
        setErrorMsg(payload.message || "Server error while checking user");
        setLoading(false);
        return;
      }
      const data = await safeJson(res);

      if (data.exists === true) {
        // fetch display name (optional)
        try {
          const nameRes = await fetch(`${API_BASE}/getUserByIdentifier`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier }),
          });
          if (nameRes.ok) {
            const nameData = await safeJson(nameRes);
            setUsername(nameData.name || "User");
          } else {
            setUsername("User");
          }
        } catch (e) {
          setUsername("User");
        }
        setStep(2);
      } else {
        // pre-fill signup phone/email
        if (/^\d+$/.test(identifier)) {
          setSignupPhone(identifier);
          setSignupEmail("");
        } else {
          setSignupEmail(identifier);
          setSignupPhone("");
        }
        setStep(3);
      }
    } catch (err) {
      setErrorMsg(friendlyNetworkError(err));
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // LOGIN USER
  // -------------------------------------------------------
  const handleLogin = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    if (!password.trim()) {
      setErrorMsg("Please enter password");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      if (!res.ok) {
        const payload = await safeJson(res);
        setErrorMsg(payload.message || "Login failed");
        setLoading(false);
        return;
      }

      const data = await safeJson(res);

      if (data.success === true) {
        // Save the minimal session and notify parent
        saveSession({ token: data.token, user_id: data.user_id, identifier });
        onSuccess && onSuccess();
        close && close();
      } else {
        setErrorMsg(data.message || "Invalid login details");
      }
    } catch (err) {
      setErrorMsg(friendlyNetworkError(err));
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // FORGOT PASSWORD - STEP 1: Enter Email/Phone
  // -------------------------------------------------------
  const handleForgotPassword = () => {
    setErrorMsg("");
    setSuccessMsg("");
    setForgotIdentifier(identifier); // Pre-fill with the identifier from step 1
    setStep(4);
  };

  // -------------------------------------------------------
  // FORGOT PASSWORD - STEP 2: Reset Password
  // -------------------------------------------------------
  const handleForgotPasswordSubmit = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    
    if (!forgotIdentifier.trim()) {
      setErrorMsg("Please enter your email or phone");
      return;
    }

    setLoading(true);
    try {
      // Check if user exists first
      const checkRes = await fetch(`${API_BASE}/checkUserExists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: forgotIdentifier }),
      });
      
      if (!checkRes.ok) {
        const payload = await safeJson(checkRes);
        setErrorMsg(payload.message || "User not found");
        setLoading(false);
        return;
      }
      
      const checkData = await safeJson(checkRes);
      if (!checkData.exists) {
        setErrorMsg("No account found with this email or phone");
        setLoading(false);
        return;
      }

      // If user exists, proceed to reset password step
      setStep(5);
    } catch (err) {
      setErrorMsg(friendlyNetworkError(err));
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // RESET PASSWORD - Final Step
  // -------------------------------------------------------
  const handleResetPassword = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    
    if (!resetPassword.trim() || !resetConfirmPassword.trim()) {
      setErrorMsg("Please enter and confirm your new password");
      return;
    }
    
    if (resetPassword !== resetConfirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }
    
    if (resetPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customer/forgotpassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: forgotIdentifier,
          newPassword: resetPassword,
        }),
      });

      const data = await safeJson(res);

      if (data.success === true) {
        setSuccessMsg("Password reset successfully! You can now login.");
        // Reset states and go back to login
        setTimeout(() => {
          setStep(1);
          setForgotIdentifier("");
          setResetPassword("");
          setResetConfirmPassword("");
          setErrorMsg("");
          setSuccessMsg("");
        }, 2000);
      } else {
        setErrorMsg(data.message || "Failed to reset password");
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
    if (!fullName.trim()) return setErrorMsg("Full name required");
    if (!signupEmail.trim() && !signupPhone.trim()) return setErrorMsg("Email or Phone required");
    if (!signupPassword.trim() || !signupConfirmPassword.trim()) return setErrorMsg("Enter password");
    if (signupPassword !== signupConfirmPassword) return setErrorMsg("Passwords do not match");

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email: signupEmail,
          phone: signupPhone,
          password: signupPassword,
        }),
      });

      if (!res.ok) {
        const payload = await safeJson(res);
        setErrorMsg(payload.message || "Signup failed");
        setLoading(false);
        return;
      }

      const data = await safeJson(res);
      if (data.success === true) {
        saveSession({ token: data.token, user_id: data.user_id, identifier: signupEmail || signupPhone });
        onSuccess && onSuccess();
        close && close();
      } else {
        setErrorMsg(data.message || "Signup failed");
      }
    } catch (err) {
      setErrorMsg(friendlyNetworkError(err));
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // GOOGLE LOGIN (ENHANCED FOR PRODUCTION)
  // -------------------------------------------------------
  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      
      // Add these scopes for better compatibility
      provider.addScope('profile');
      provider.addScope('email');
      
      // Configure OAuth settings
      provider.setCustomParameters({
        prompt: 'select_account' // Force account selection
      });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Enhanced error handling for production
      if (!user || !user.email) {
        throw new Error("Google authentication failed - no user data received");
      }

      // Send googleSignIn to backend with better error handling
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          identifier: user.email,
          name: user.displayName || user.email.split('@')[0],
          googleSignIn: true,
          photoURL: user.photoURL || null,
          uid: user.uid // Send Firebase UID for better tracking
        }),
      });

      if (!res.ok) {
        const payload = await safeJson(res);
        // Check if it's a user creation error (user doesn't exist)
        if (payload.message && payload.message.includes("not exist") || res.status === 404) {
          // Try to create user via signup endpoint for Google users
          return await handleGoogleSignup(user);
        }
        setErrorMsg(payload.message || `Google login failed (${res.status})`);
        setLoading(false);
        return;
      }

      const data = await safeJson(res);
      if (data.success === true) {
        saveSession({ 
          token: data.token, 
          user_id: data.user_id, 
          identifier: user.email 
        });
        onSuccess && onSuccess();
        close && close();
      } else {
        setErrorMsg(data.message || "Google login failed");
      }
    } catch (err) {
      console.error("Google auth error:", err);
      
      // More specific error messages for production
      if (err.code === 'auth/popup-blocked') {
        setErrorMsg("Popup blocked. Please allow popups for Google login.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg("Login cancelled");
      } else if (err.code === 'auth/network-request-failed') {
        setErrorMsg("Network error. Please check your internet connection.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMsg("Unauthorized domain. Please contact support.");
      } else {
        setErrorMsg("Google login failed. Please try again or use email/password.");
      }
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // GOOGLE SIGNUP (Fallback when user doesn't exist)
  // -------------------------------------------------------
  const handleGoogleSignup = async (user) => {
    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: user.displayName || user.email.split('@')[0],
          email: user.email,
          phone: "", // Google doesn't provide phone
          password: "", // No password for Google auth
          googleSignIn: true,
          photoURL: user.photoURL || null,
          uid: user.uid
        }),
      });

      if (!res.ok) {
        const payload = await safeJson(res);
        setErrorMsg(payload.message || "Failed to create account with Google");
        return;
      }

      const data = await safeJson(res);
      if (data.success === true) {
        saveSession({ 
          token: data.token, 
          user_id: data.user_id, 
          identifier: user.email 
        });
        onSuccess && onSuccess();
        close && close();
      } else {
        setErrorMsg(data.message || "Google signup failed");
      }
    } catch (err) {
      console.error("Google signup error:", err);
      setErrorMsg("Failed to create account with Google. Please try email signup.");
    }
  };

  // -------------------------------------------------------
  // APPLE LOGIN (Placeholder - needs proper setup)
  // -------------------------------------------------------
  const handleAppleLogin = () => {
    setErrorMsg("Apple login is currently unavailable. Please use Google or email.");
  };

  // -------------------------------------------------------
  // BACK BUTTON HANDLER
  // -------------------------------------------------------
  const handleBack = () => {
    setErrorMsg("");
    setSuccessMsg("");
    if (step === 2 || step === 3) {
      setStep(1);
    } else if (step === 4) {
      setStep(1);
    } else if (step === 5) {
      setStep(4);
    }
  };

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------
  return (
    <div className="login-popup-overlay" role="dialog" aria-modal="true">
      <div className="login-popup" aria-live="polite">
        {/* Header with back button for steps 2+ */}
        <div className="login-header">
          {(step === 2 || step === 3 || step === 4 || step === 5) && (
            <button className="login-back-btn" onClick={handleBack}>
              <ArrowLeft size={20} />
            </button>
          )}
          <h3>
            {step === 1 && "Welcome Back"}
            {step === 2 && "Enter Password"}
            {step === 3 && "Create Account"}
            {step === 4 && "Forgot Password"}
            {step === 5 && "Reset Password"}
          </h3>
        </div>

        {successMsg && <p className="login-success">{successMsg}</p>}
        {errorMsg && <p className="login-error">{errorMsg}</p>}

        {/* STEP 1: Email/Phone */}
        {step === 1 && (
          <>
            <p className="login-subtitle">Enter your email or phone number to continue</p>
            <div className="input-with-icon">
              <Mail size={20} className="input-icon" />
              <input
                type="text"
                placeholder="Email or Phone Number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkUserExists()}
              />
            </div>
            <button className="login-btn" onClick={checkUserExists} disabled={loading}>
              {loading ? "Checking..." : "Continue"}
            </button>
            
            <div className="login-divider"><span>Or continue with</span></div>

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

        {/* STEP 2: Password */}
        {step === 2 && (
          <>
            <p className="hello-text">Welcome back, <strong>{username}</strong></p>
            <div className="input-with-icon">
              <Lock size={20} className="input-icon" />
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button 
                className="password-toggle-btn"
                onClick={() => setShowPwd(!showPwd)}
                type="button"
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <button className="login-btn" onClick={handleLogin} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            
            <button 
              className="forgot-password-btn" 
              onClick={handleForgotPassword}
              disabled={loading}
            >
              Forgot Password?
            </button>
          </>
        )}

        {/* STEP 3: Signup */}
        {step === 3 && (
          <>
            <p className="login-subtitle">Create your account to get started</p>
            <div className="input-with-icon">
              <User size={20} className="input-icon" />
              <input 
                type="text" 
                placeholder="Full Name" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
              />
            </div>
            
            <div className="input-with-icon">
              <Mail size={20} className="input-icon" />
              <input 
                type="email" 
                placeholder="Email" 
                value={signupEmail} 
                onChange={(e) => setSignupEmail(e.target.value)} 
              />
            </div>
            
            <div className="input-with-icon">
              <Phone size={20} className="input-icon" />
              <input 
                type="tel" 
                placeholder="Phone Number" 
                value={signupPhone} 
                onChange={(e) => setSignupPhone(e.target.value)} 
              />
            </div>
            
            <div className="input-with-icon">
              <Lock size={20} className="input-icon" />
              <input 
                type={showPwd ? "text" : "password"} 
                placeholder="Create Password" 
                value={signupPassword} 
                onChange={(e) => setSignupPassword(e.target.value)} 
              />
              <button 
                className="password-toggle-btn"
                onClick={() => setShowPwd(!showPwd)}
                type="button"
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="input-with-icon">
              <Lock size={20} className="input-icon" />
              <input 
                type="password" 
                placeholder="Confirm Password" 
                value={signupConfirmPassword} 
                onChange={(e) => setSignupConfirmPassword(e.target.value)} 
              />
            </div>
            
            <button className="login-btn" onClick={handleSignup} disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </>
        )}

        {/* STEP 4: Forgot Password - Enter Email/Phone */}
        {step === 4 && (
          <>
            <p className="login-subtitle">Enter your email or phone to reset your password</p>
            <div className="input-with-icon">
              <Mail size={20} className="input-icon" />
              <input
                type="text"
                placeholder="Email or Phone Number"
                value={forgotIdentifier}
                onChange={(e) => setForgotIdentifier(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleForgotPasswordSubmit()}
              />
            </div>
            <button className="login-btn" onClick={handleForgotPasswordSubmit} disabled={loading}>
              {loading ? "Checking..." : "Continue"}
            </button>
          </>
        )}

        {/* STEP 5: Forgot Password - Reset Password */}
        {step === 5 && (
          <>
            <p className="login-subtitle">Create a new password for your account</p>
            <div className="input-with-icon">
              <Lock size={20} className="input-icon" />
              <input
                type={showPwd ? "text" : "password"}
                placeholder="New Password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
              />
              <button 
                className="password-toggle-btn"
                onClick={() => setShowPwd(!showPwd)}
                type="button"
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="input-with-icon">
              <Lock size={20} className="input-icon" />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={resetConfirmPassword}
                onChange={(e) => setResetConfirmPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleResetPassword()}
              />
            </div>
            
            <button className="login-btn" onClick={handleResetPassword} disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            
            <p className="password-hint">Password must be at least 6 characters long</p>
          </>
        )}

        {/* Footer Links for Step 1 */}
        {step === 1 && (
          <div className="login-footer">
            <p className="login-footer-text">
              Don't have an account?{" "}
              <button 
                className="login-footer-link" 
                onClick={() => {
                  setStep(3);
                  setSignupEmail(identifier);
                }}
                disabled={loading}
              >
                Sign up
              </button>
            </p>
          </div>
        )}

        {/* Close Button */}
        <button className="login-close" onClick={close} disabled={loading}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LoginPopup;