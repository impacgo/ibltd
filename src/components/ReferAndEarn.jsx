// src/components/ReferAndEarn.jsx
import React, { useState, useEffect } from "react";
import "./ReferAndEarn.css";

const API_BASE = "https://api.ironingboy.com";

const getToken = () => localStorage.getItem("jwtToken");

const getReferralCode = async () => {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/user/referral-code`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      return data.referral_code;
    }
  } catch (err) {
    console.error("Error fetching referral code:", err);
  }
  return null;
};

const getBonusAmount = async () => {
  try {
    const res = await fetch(`${API_BASE}/settings/referral-bonus`);
    if (res.ok) {
      const data = await res.json();
      return data.bonus_amount || 10;
    }
  } catch (err) {
    console.error("Error fetching bonus amount:", err);
  }
  return 10;
};

const getReferralHistory = async () => {
  const token = getToken();
  if (!token) return { total_earned: 0, referrals: [] };
  try {
    const res = await fetch(`${API_BASE}/user/referrals`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("Error fetching referral history:", err);
  }
  return { total_earned: 0, referrals: [] };
};

const applyReferralCode = async (code) => {
  const token = getToken();
  try {
    const res = await fetch(`${API_BASE}/auth/apply-referral`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ referral_code: code }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: "Network error" };
  }
};

const ReferAndEarn = () => {
  const [activeTab, setActiveTab] = useState("refer");
  const [referralCode, setReferralCode] = useState(null);
  const [bonusAmount, setBonusAmount] = useState(10);
  const [history, setHistory] = useState({ total_earned: 0, referrals: [] });
  const [loading, setLoading] = useState(true);
  const [applyCode, setApplyCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [codeApplied, setCodeApplied] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState("Copy");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [code, bonus, hist] = await Promise.all([
        getReferralCode(),
        getBonusAmount(),
        getReferralHistory(),
      ]);
      setReferralCode(code);
      setBonusAmount(bonus);
      setHistory(hist);
      setLoading(false);
    };
    loadData();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopyButtonText("Copied!");
    showToast("Referral code copied to clipboard!", "success");
    setTimeout(() => setCopyButtonText("Copy"), 2000);
  };

  const shareWhatsApp = () => {
    const message = `Hey 👋\n\nUse my referral code ${referralCode} to get a discount on your first order!\n\nDownload the app here:\nhttps://play.google.com/store/apps/details?id=com.impacgo.ironingboy`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const shareGeneral = () => {
    if (navigator.share) {
      navigator.share({
        title: "Referral Code",
        text: `Use my referral code ${referralCode} to get a discount!`,
      });
    } else {
      copyToClipboard(referralCode);
    }
  };

  const handleApplyReferral = async () => {
    if (!applyCode.trim()) {
      showToast("Please enter a referral code", "error");
      return;
    }
    setApplying(true);
    const result = await applyReferralCode(applyCode);
    setApplying(false);
    if (result.success) {
      setCodeApplied(true);
      showToast(result.message || "Referral code applied! 🎉", "success");
      const newHist = await getReferralHistory();
      setHistory(newHist);
    } else {
      showToast(result.message || "Failed to apply code", "error");
    }
  };

  if (loading) {
    return (
      <div className="refer-page">
        <div className="refer-loading-state">
          <div className="refer-spinner"></div>
          <p>Loading referral info...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="refer-page">
      {/* Toast Notification */}
      {toast && (
        <div className={`refer-toast refer-toast-${toast.type}`}>
          <div className="refer-toast-icon">
            {toast.type === "success" ? "✓" : "⚠️"}
          </div>
          <div className="refer-toast-message">{toast.message}</div>
        </div>
      )}

      {/* Page Header */}
      <div className="refer-page-header">
        <h1 className="refer-page-title">Refer & Earn</h1>
      </div>

      {/* Tabs */}
      <div className="refer-tabs-container">
        <button
          className={`refer-tab-btn ${activeTab === "refer" ? "active" : ""}`}
          onClick={() => setActiveTab("refer")}
        >
          Refer
        </button>
        <button
          className={`refer-tab-btn ${activeTab === "earn" ? "active" : ""}`}
          onClick={() => setActiveTab("earn")}
        >
          Earn
        </button>
      </div>

      {/* Refer Tab */}
      {activeTab === "refer" && (
        <div className="refer-card">
          <div className="refer-hero-section">
            <div className="refer-gift-emoji">🎁</div>
            <div className="refer-bonus-amount">Earn £{Math.floor(bonusAmount)}</div>
            <div className="refer-description-text">
              Get £{bonusAmount} for every friend who signs up and places their first order.
            </div>
            <div className="refer-code-wrapper">
              <span className="refer-code-value">{referralCode || "------"}</span>
              <button className="refer-copy-code-btn" onClick={() => copyToClipboard(referralCode)}>
                {copyButtonText}
              </button>
            </div>
            <div className="refer-share-label">Share your referral code</div>
            <div className="refer-share-buttons">
              <button className="refer-share-wa" onClick={shareWhatsApp}>
                WhatsApp
              </button>
              <button className="refer-share-more" onClick={shareGeneral}>
                More
              </button>
            </div>
          </div>

          <div className="refer-info-box">
            <div className="refer-info-icon">ℹ️</div>
            <div className="refer-info-text">
              <strong>How it works</strong>
              <p>Share your code. When a friend places their first order, you earn.</p>
            </div>
          </div>
        </div>
      )}

      {/* Earn Tab */}
      {activeTab === "earn" && (
        <div className="refer-card">
          <div className="refer-earned-summary">
            <div>Total Earned</div>
            <div className="refer-earned-amount">£{history.total_earned?.toFixed(2) || "0.00"}</div>
          </div>

          {!codeApplied && (
            <div className="refer-apply-card">
              <h4>Have a referral code?</h4>
              <input
                type="text"
                placeholder="Enter code"
                value={applyCode}
                onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
                disabled={applying}
              />
              <button onClick={handleApplyReferral} disabled={applying}>
                {applying ? "Applying..." : "Apply"}
              </button>
            </div>
          )}

          <div className="refer-history-header">Referral History</div>
          {history.referrals?.length === 0 ? (
            <div className="refer-empty-history">No referrals yet</div>
          ) : (
            history.referrals.map((ref, idx) => (
              <div key={idx} className="refer-history-item">
                <div>
                  <div className="refer-history-name">{ref.name}</div>
                  <div className="refer-history-date">{ref.date}</div>
                </div>
                <div className="refer-history-right">
                  <div className="refer-history-amount">£{ref.amount?.toFixed(2)}</div>
                  <div className={`refer-history-status ${ref.status === "successful" ? "success" : "pending"}`}>
                    {ref.status}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ReferAndEarn;