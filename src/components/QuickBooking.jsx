import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./QuickBooking.css";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";

const API_BASE = "https://api.ironingboy.com";

const stripePromise = loadStripe(
  "pk_live_51SUiy73fSKIcHb6THsEQatj2g1tJOjUhzaym490HNFobNn6gOtdzpelQnV2knmKkXPiqxKqJjwEQ6dtSNRKuO4yx00HFqYnkEI"
);

const countryCodes = [
  { code: "+44", label: "🇬🇧 +44", minDigits: 10, maxDigits: 11 },
  { code: "+91", label: "🇮🇳 +91", minDigits: 10, maxDigits: 10 },
  { code: "+1",  label: "🇺🇸 +1",  minDigits: 10, maxDigits: 11 },
  { code: "+61", label: "🇦🇺 +61", minDigits: 9,  maxDigits: 11 },
  { code: "+971",label: "🇦🇪 +971",minDigits: 9,  maxDigits: 9  },
];

const parsePhone = (fullPhone) => {
  if (!fullPhone) return { code: "+44", local: "" };
  for (const { code } of countryCodes) {
    if (fullPhone.startsWith(code)) return { code, local: fullPhone.slice(code.length) };
  }
  return { code: "+44", local: fullPhone.replace(/^\+/, "") };
};

const stripLeadingZeros = (num) => num.replace(/^0+/, '');

// Email regex for validation
const isValidEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

/* ─────────────────────────────────────────────────
   Stripe Setup Form Modal (unchanged)
───────────────────────────────────────────────── */
const StripeSetupForm = ({
  onSetupSuccess, onSetupError, onCancel, setupProcessing, isSetup = true,
}) => {
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    try {
      let result;
      if (isSetup) {
        result = await stripe.confirmSetup({ elements, redirect: "if_required" });
      } else {
        result = await stripe.confirmPayment({ elements, redirect: "if_required" });
      }
      if (result.error) throw result.error;
      const intent = result.setupIntent || result.paymentIntent;
      if (!intent) throw new Error("Payment method not saved");
      await onSetupSuccess(intent, consent);
    } catch (err) {
      setError(err.message || "Card processing failed");
      onSetupError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="stripe-payment-modal">
      <div className="stripe-modal-overlay" onClick={onCancel} />
      <div className="stripe-modal-content">
        <div className="stripe-modal-header">
          <div className="stripe-modal-icon"><i className="fas fa-shield-alt" /></div>
          <div>
            <h3>{isSetup ? "Save Card to Complete Booking" : "Confirm Card to Complete Booking"}</h3>
            <p>Your booking will be confirmed after you provide card details.</p>
          </div>
          <button className="stripe-modal-close" onClick={onCancel} disabled={submitting || setupProcessing}>
            <i className="fas fa-times" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="stripe-form">
          <div className="stripe-form-content">
            <div className="stripe-payment-info">
              <div className="stripe-info-icon"><i className="fas fa-info-circle" /></div>
              <div className="stripe-info-text">
                <h4>No Charges Now</h4>
                <p>Your card will only be charged after your laundry manager sends the invoice.</p>
              </div>
            </div>
            <div className="stripe-element-container">
              <PaymentElement
                options={{
                  layout: { type: "tabs", defaultCollapsed: false },
                  wallets: { applePay: "never", googlePay: "never" },
                }}
              />
            </div>
            {isSetup && (
              <div className="stripe-consent-section">
                {/* <div className="stripe-consent-checkbox">
                  <input type="checkbox" id="consent-cb" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                  <label htmlFor="consent-cb" className="stripe-consent-label">
                    <span className="stripe-consent-title">Save card for future payments</span>
                    <span className="stripe-consent-description">
                      I authorise IroningBoy to securely save this card and use it for invoice payments.
                    </span>
                  </label>
                </div> */}
              </div>
            )}
            {error && (
              <div className="stripe-error-message">
                <i className="fas fa-exclamation-triangle" />
                <span>{error}</span>
              </div>
            )}
          </div>
          <div className="stripe-modal-actions">
            <button type="submit" className="stripe-confirm-btn" disabled={!stripe || submitting || setupProcessing}>
              {submitting ? (
                <><div className="stripe-loading-spinner" /> Processing…</>
              ) : (
                <><i className="fas fa-lock" /> {isSetup ? "Complete Booking " : "Complete Booking"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────
   Main QuickBooking Component
───────────────────────────────────────────────── */
export default function QuickBooking() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  /* ── step state ── */
  const [step, setStep] = useState(1);

  /* ── core state ── */
  const [loading, setLoading] = useState(false);
  const [setupProcessing, setSetupProcessing] = useState(false);
  const [showPaymentSetup, setShowPaymentSetup] = useState(false);
  const [toast, setToast] = useState(null);
  const [savedCards, setSavedCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [setupClientSecret, setSetupClientSecret] = useState(null);
  const [paymentClientSecret, setPaymentClientSecret] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [userToken, setUserToken] = useState(localStorage.getItem("jwtToken"));
  const [pendingBookingData, setPendingBookingData] = useState(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const phoneCheckTimeoutRef = useRef(null);

  /* ── address refs ── */
  const addressInputRef = useRef(null);
  const pickupAddressInputRef = useRef(null);
  const deliveryAddressInputRef = useRef(null);

  /* ── geo state ── */
  const [geoData, setGeoData] = useState({ latitude: null, longitude: null, street_name: "", house_number: "" });
  const [deliveryGeoData, setDeliveryGeoData] = useState({ latitude: null, longitude: null, street_name: "", house_number: "" });
  const [pickupGeoData, setPickupGeoData] = useState({ latitude: null, longitude: null, street_name: "", house_number: "" });

  /* ── payment state ── */
  const [saveCardOption, setSaveCardOption] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);

  /* ── time slots ── */
  const [loadingSlots, setLoadingSlots] = useState({ collect: false, deliver: false });
  const [collectSlots, setCollectSlots] = useState([]);
  const [deliverSlots, setDeliverSlots] = useState([]);
  const [selectedCollectSlot, setSelectedCollectSlot] = useState(null);
  const [selectedDeliverSlot, setSelectedDeliverSlot] = useState(null);
  const [selectedCollectSlotStart, setSelectedCollectSlotStart] = useState(null);
  const [selectedDeliverSlotEnd, setSelectedDeliverSlotEnd] = useState(null);

  /* ── user info ── */
  const [userInfo, setUserInfo] = useState(() =>
    user ? { name: user.name || "", email: user.email || "", phone: user.phone || "" } : { name: "", email: "", phone: "" }
  );
  const [localPhone, setLocalPhone] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+44");
  const [phoneError, setPhoneError] = useState("");
  const [phoneValid, setPhoneValid] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailValid, setEmailValid] = useState(false);

  /* ── address state ── */
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [selectedPickupAddressId, setSelectedPickupAddressId] = useState(null);
  const [pickupAddresses, setPickupAddresses] = useState([]);

  const [addressForm, setAddressForm] = useState({ street_address: "", postcode: "", city: "", additional_details: "", house_number: "" });
  const [pickupAddressForm, setPickupAddressForm] = useState({ street_address: "", postcode: "", city: "", additional_details: "", house_number: "" });
  const [deliveryAddressForm, setDeliveryAddressForm] = useState({ street_address: "", postcode: "", city: "", additional_details: "", house_number: "" });

  const [addressDetails, setAddressDetails] = useState("");
  const [pickupAddressDetails, setPickupAddressDetails] = useState("");
  const [deliveryAddressDetails, setDeliveryAddressDetails] = useState("");

  const [isDeliveryAddressSaved, setIsDeliveryAddressSaved] = useState(false);
  const [isPickupAddressSaved, setIsPickupAddressSaved] = useState(false);
  const [hasEnteredPickupDetails, setHasEnteredPickupDetails] = useState(false);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showPickupAddressForm, setShowPickupAddressForm] = useState(false);

  /* ── postcode lookup ── */
  const [postcode, setPostcode] = useState("");
  const [postcodeAddresses, setPostcodeAddresses] = useState([]);
  const [selectedPostcodeAddress, setSelectedPostcodeAddress] = useState("");
  const [deliveryPostcode, setDeliveryPostcode] = useState("");
  const [deliveryPostcodeAddresses, setDeliveryPostcodeAddresses] = useState([]);
  const [selectedDeliveryPostcodeAddress, setSelectedDeliveryPostcodeAddress] = useState("");
  const [googleReady, setGoogleReady] = useState(false);

  /* ── schedule ── */
  const [collectDate, setCollectDate] = useState("");
  const [deliverDate, setDeliverDate] = useState("");
  const [notes, setNotes] = useState("");
  // 🔥 Referral State
const [referralCode, setReferralCode] = useState("");
const [referralLoading, setReferralLoading] = useState(false);
const [referralApplied, setReferralApplied] = useState(false);
const [referralMessage, setReferralMessage] = useState("");
const [myReferralCode, setMyReferralCode] = useState("");
const [copied, setCopied] = useState(false);
const [walletBalance, setWalletBalance] = useState(0);
const [walletMaxUsage, setWalletMaxUsage] = useState(0);
const [walletThreshold, setWalletThreshold] = useState(0);
const [walletUsed, setWalletUsed] = useState(0);
const [walletApplied, setWalletApplied] = useState(false);
const [loadingWallet, setLoadingWallet] = useState(false);

  /* ── auto-save timers ── */
  const AUTO_SAVE_DELAY_MS = 1000;
  const mainAddressSaveTimerRef = useRef(null);
  const deliveryAddressSaveTimerRef = useRef(null);
  const pickupAddressSaveTimerRef = useRef(null);
  const debouncedProfileUpdate = useRef({});

  const today = new Date().toISOString().split("T")[0];

  /* ══════════════ HELPERS ══════════════ */
  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fmt24 = (t) => {
    if (!t) return "";
    try {
      const d = new Date(t);
      if (isNaN(d)) return t;
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    } catch { return t; }
  };
  const fmtRange = (s, e) => { const a = fmt24(s), b = fmt24(e); return a && b ? `${a}–${b}` : a || b || ""; };
  const fmtDMY = (ds) => {
    if (!ds) return "";
    try { const d = new Date(ds); return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`; } catch { return ds; }
  };
  const fmtHuman = (ds) => {
    if (!ds) return "";
    try { return new Date(ds).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); } catch { return ds; }
  };

  const getCardIcon = (brand) => {
    const b = brand?.toLowerCase() || "";
    if (b.includes("visa")) return "fab fa-cc-visa";
    if (b.includes("mastercard")) return "fab fa-cc-mastercard";
    if (b.includes("amex")) return "fab fa-cc-amex";
    if (b.includes("discover")) return "fab fa-cc-discover";
    return "fas fa-credit-card";
  };

  /* ══════════════ TOKEN VALIDATION ══════════════ */
  const validateToken = useCallback(async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) { setUserToken(null); return false; }
    try {
      const res = await fetch(`${API_BASE}/profile`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { localStorage.removeItem("jwtToken"); setUserToken(null); return false; }
      return true;
    } catch { return false; }
  }, []);

  useEffect(() => {
    validateToken().then((ok) => { if (!ok) login(null); });
  }, [validateToken, login]);

  /* ══════════════ GOOGLE MAPS READY ══════════════ */
  useEffect(() => {
    const check = () => {
      if (window.google?.maps?.places) setGoogleReady(true);
      else setTimeout(check, 300);
    };
    check();
  }, []);

  /* ══════════════ PHONE PARSE ══════════════ */
  useEffect(() => {
    if (userInfo.phone) {
      const { code, local } = parsePhone(userInfo.phone);
      setSelectedCountryCode(code);
      setLocalPhone(local);
    }
  }, [userInfo.phone]);

  /* ══════════════ POSTCODE LOOKUPS ══════════════ */
  useEffect(() => {
    if (!googleReady) return;
    if (postcode.trim().length >= 3) fetchPCAddresses(postcode.trim(), setPostcodeAddresses);
    else setPostcodeAddresses([]);
  }, [postcode, googleReady]);

  useEffect(() => {
    if (!googleReady) return;
    if (deliveryPostcode.trim().length >= 3) fetchPCAddresses(deliveryPostcode.trim(), setDeliveryPostcodeAddresses);
    else setDeliveryPostcodeAddresses([]);
  }, [deliveryPostcode, googleReady]);

  useEffect(() => { if (selectedPostcodeAddress) geocodePlaceId(selectedPostcodeAddress, "main"); }, [selectedPostcodeAddress]);
  useEffect(() => { if (selectedDeliveryPostcodeAddress) geocodePlaceId(selectedDeliveryPostcodeAddress, "delivery"); }, [selectedDeliveryPostcodeAddress]);

  const fetchPCAddresses = (pc, setter) => {
    if (!window.google?.maps?.places) return;
    new window.google.maps.places.AutocompleteService().getPlacePredictions(
      { input: pc, componentRestrictions: { country: "gb" } },
      (preds, status) => {
        if (status !== window.google.maps.places.PlacesServiceStatus.OK || !preds) { setter([]); return; }
        setter(preds.map((p) => ({ full: p.description, place_id: p.place_id })));
      }
    );
  };

  const geocodePlaceId = (placeId, target) => {
    if (!window.google || !placeId) return;
    new window.google.maps.Geocoder().geocode({ placeId }, (results, status) => {
      if (status !== "OK" || !results[0]) return;
      const r = results[0];
      let pc = "", house = "", street = "", city = "";
      r.address_components.forEach((c) => {
        if (c.types.includes("postal_code")) pc = c.long_name;
        if (c.types.includes("street_number")) house = c.long_name;
        if (c.types.includes("route")) street = c.long_name;
        if (c.types.includes("postal_town")) city = c.long_name;
      });
      const lat = r.geometry.location.lat(), lng = r.geometry.location.lng();
      if (target === "delivery") {
        setDeliveryGeoData({ latitude: lat, longitude: lng, street_name: street, house_number: house });
        setDeliveryAddressForm({ street_address: r.formatted_address, postcode: pc, city, house_number: house, additional_details: "" });
      } else {
        if (useSameAddress) setGeoData({ latitude: lat, longitude: lng, street_name: street, house_number: house });
        else setDeliveryGeoData({ latitude: lat, longitude: lng, street_name: street, house_number: house });
        setAddressForm((prev) => ({ ...prev, street_address: r.formatted_address, postcode: pc, house_number: house, city }));
      }
    });
  };

  /* ══════════════ DATA FETCHING ══════════════ */
  const fetchUserProfile = useCallback(async () => {
    if (!userToken) return;
    try {
      const res = await fetch(`${API_BASE}/profile`, { headers: { Authorization: `Bearer ${userToken}` } });
      if (res.ok) {
        const d = await res.json();
        setUserInfo({ name: d.name || "", email: d.email || "", phone: d.phone || "" });
      } else if (res.status === 401) { localStorage.removeItem("jwtToken"); setUserToken(null); }
    } catch {}
  }, [userToken]);

  const fetchAddresses = useCallback(async () => {
    if (!userToken) return;
    try {
      const res = await fetch(`${API_BASE}/addresses`, { headers: { Authorization: `Bearer ${userToken}` } });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data); setPickupAddresses(data);
        if (data.length > 0) {
          const def = data.find((a) => a.is_selected) || data[0];
          const id = String(def.address_id);
          setSelectedAddressId(id); setSelectedPickupAddressId(id);
        }
      } else if (res.status === 401) { localStorage.removeItem("jwtToken"); setUserToken(null); }
    } catch {}
  }, [userToken]);

  const fetchSavedCards = useCallback(async () => {
    if (!userToken) { setLoadingCards(false); return; }
    try {
      const res = await fetch(`${API_BASE}/stripe/saved-cards`, { headers: { Authorization: `Bearer ${userToken}` } });
      if (res.ok) {
        const d = await res.json();
        setSavedCards(d.cards || []);
        if (d.cards?.length > 0) {
          const def = d.cards.find((c) => c.is_default) || d.cards[0];
          if (def) setSelectedCard(def.payment_method_id);
        }
      } else if (res.status === 401) { localStorage.removeItem("jwtToken"); setUserToken(null); setSavedCards([]); }
    } catch { setSavedCards([]); } finally { setLoadingCards(false); }
  }, [userToken]);

  const ensureStripeCustomer = useCallback(async () => {
    if (!userToken) return;
    try {
      const res = await fetch(`${API_BASE}/stripe/create-customer`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
      });
      if (res.ok) { const d = await res.json(); setCustomerId(d.customerId); }
    } catch {}
  }, [userToken]);

  useEffect(() => {
    if (userToken) { fetchUserProfile(); fetchAddresses(); fetchSavedCards(); ensureStripeCustomer(); }
    else setLoadingCards(false);
  }, [userToken, fetchUserProfile, fetchAddresses, fetchSavedCards, ensureStripeCustomer]);

  useEffect(() => {
    if (userToken && addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a) => a.is_selected) || addresses[0];
      if (def) {
        const id = String(def.address_id);
        setSelectedAddressId(id);
        if (useSameAddress) setSelectedPickupAddressId(id);
      }
    }
  }, [userToken, addresses, selectedAddressId, useSameAddress]);

  /* ══════════════ GOOGLE AUTOCOMPLETE REFS ══════════════ */
  const setupAutocomplete = (ref, onSelect) => {
    if (!window.google || !ref.current) return () => {};
    const ac = new window.google.maps.places.Autocomplete(ref.current, {
      types: ["address"], componentRestrictions: { country: "gb" },
    });
    const l = ac.addListener("place_changed", () => {
      const p = ac.getPlace();
      if (!p.geometry) return;
      let street = "", house = "", pc = "", city = "";
      p.address_components.forEach((c) => {
        if (c.types.includes("route")) street = c.long_name;
        if (c.types.includes("street_number")) house = c.long_name;
        if (c.types.includes("postal_code")) pc = c.long_name;
        if (c.types.includes("postal_town")) city = c.long_name;
      });
      onSelect({ lat: p.geometry.location.lat(), lng: p.geometry.location.lng(), street, house, pc, city, formatted: p.formatted_address });
    });
    return () => window.google.maps.event.removeListener(l);
  };

  useEffect(() => setupAutocomplete(addressInputRef, ({ lat, lng, street, house, pc, city, formatted }) => {
    setGeoData({ latitude: lat, longitude: lng, street_name: street, house_number: house });
    setAddressForm((prev) => ({ ...prev, street_address: formatted, postcode: pc, city, house_number: house }));
  }), []);

  useEffect(() => setupAutocomplete(deliveryAddressInputRef, ({ lat, lng, street, house, pc, formatted }) => {
    setDeliveryGeoData({ latitude: lat, longitude: lng, street_name: street, house_number: house });
    setDeliveryAddressForm((prev) => ({ ...prev, street_address: formatted, postcode: pc }));
  }), []);

  useEffect(() => setupAutocomplete(pickupAddressInputRef, ({ lat, lng, street, house, pc, formatted }) => {
    setPickupGeoData({ latitude: lat, longitude: lng, street_name: street, house_number: house });
    setPickupAddressForm((prev) => ({ ...prev, street_address: formatted, postcode: pc }));
  }), []);

  /* ══════════════ ADDRESS SAVE HELPERS ══════════════ */
  const resetMainForm = useCallback(() => {
    setPostcode(""); setSelectedPostcodeAddress(""); setAddressDetails("");
    setGeoData({ latitude: null, longitude: null, street_name: "", house_number: "" });
    setAddressForm({ street_address: "", postcode: "", city: "", additional_details: "", house_number: "" });
    setIsDeliveryAddressSaved(false);
  }, []);

  const resetPickupForm = useCallback(() => {
    setPickupAddressForm({ street_address: "", postcode: "", city: "", additional_details: "", house_number: "" });
    setPickupGeoData({ latitude: null, longitude: null, street_name: "", house_number: "" });
    setPickupAddressDetails(""); setHasEnteredPickupDetails(false); setIsPickupAddressSaved(false);
  }, []);

  const saveNewAddress = useCallback(async (addressData, type = "delivery") => {
    if (!userToken) { showToast("Please log in to save address", "error"); return null; }
    try {
      const normalize = (v) => v?.replace(/\s/g, "").toLowerCase();
      const existing = addresses.find((a) => normalize(a.postcode) === normalize(addressData.postcode));
      if (existing) return existing.address_id;

      const res = await fetch(`${API_BASE}/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({
          address_type: type === "pickup" ? "pickup" : "delivery",
          full_address: addressData.street_address,
          additional_details: addressData.additional_details || "",
          pincode: addressData.postcode,
          latitude: addressData.latitude,
          longitude: addressData.longitude,
          house_number: addressData.house_number || "",
          street_name: addressData.street_name || "",
          postcode: addressData.postcode,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 400 && err.message?.toLowerCase().includes("already exists")) {
          await fetchAddresses();
          const normalize2 = (v) => v?.replace(/\s/g, "").toLowerCase();
          return addresses.find((a) => normalize2(a.postcode) === normalize2(addressData.postcode))?.address_id || null;
        }
        throw new Error(err.message || "Failed to save address");
      }

      const d = await res.json();
      if (!bookingInProgress) showToast(`${type === "pickup" ? "Pickup" : "Delivery"} address saved`, "success");
      await fetchAddresses();
      return d.address_id;
    } catch (err) {
      if (!err.message?.toLowerCase().includes("already exists")) showToast(err.message || "Failed to save address", "error");
      return null;
    }
  }, [userToken, addresses, showToast, fetchAddresses, bookingInProgress]);

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      const token = userToken || localStorage.getItem("jwtToken");
      if (!token) throw new Error("Authentication required");
      const res = await fetch(`${API_BASE}/addresses/${addressId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const ct = res.headers.get("content-type");
      const body = ct?.includes("application/json") ? await res.json() : await res.text();
      if (!res.ok) {
        let msg = body?.message || (typeof body === "string" ? body : `Error: ${res.status}`);
        if (msg.includes("linked to existing orders") || msg.includes("foreign key"))
          msg = "This address can't be deleted as it's linked to a past order.";
        throw new Error(msg);
      }
      const updated = addresses.filter((a) => String(a.address_id) !== String(addressId));
      setAddresses(updated); setPickupAddresses(updated);
      if (selectedAddressId === String(addressId)) {
        const next = updated.length > 0 ? String(updated[0].address_id) : null;
        setSelectedAddressId(next);
        if (useSameAddress) setSelectedPickupAddressId(next);
      }
      showToast("Address deleted", "success");
    } catch (err) { showToast(err.message, "warning"); }
  };

  /* ══════════════ AUTO-SAVE ADDRESS EFFECTS ══════════════ */
  useEffect(() => {
    if (!userToken || !useSameAddress || !showAddressForm) return;
    const has = addressForm.street_address.trim() && addressForm.postcode.trim() && geoData.latitude && geoData.longitude && addressDetails.trim();
    if (mainAddressSaveTimerRef.current) clearTimeout(mainAddressSaveTimerRef.current);
    if (has && !isDeliveryAddressSaved) {
      mainAddressSaveTimerRef.current = setTimeout(async () => {
        const id = await saveNewAddress({ street_address: addressForm.street_address, postcode: addressForm.postcode, additional_details: addressDetails, house_number: geoData.house_number, latitude: geoData.latitude, longitude: geoData.longitude, street_name: geoData.street_name }, "delivery");
        if (id) setSelectedAddressId(String(id));
      }, AUTO_SAVE_DELAY_MS);
    }
    return () => { if (mainAddressSaveTimerRef.current) clearTimeout(mainAddressSaveTimerRef.current); };
  }, [userToken, useSameAddress, showAddressForm, addressForm, geoData, addressDetails, isDeliveryAddressSaved, saveNewAddress]);
// when there are no saved addresses, force manual form mode
useEffect(() => {
  if (userToken && addresses.length === 0) {
    setShowAddressForm(true);
  }
}, [userToken, addresses.length]);
 useEffect(() => {
  if (!userToken || !useSameAddress) return;

  // allow auto-save for first-time users OR when the user explicitly opened the new address form
  const canAutoSave = addresses.length === 0 || showAddressForm;
  if (!canAutoSave) return;

  const has =
    addressForm.street_address.trim() &&
    addressForm.postcode.trim() &&
    geoData.latitude &&
    geoData.longitude &&
    addressDetails.trim();

  if (mainAddressSaveTimerRef.current) {
    clearTimeout(mainAddressSaveTimerRef.current);
  }

  if (has && !isDeliveryAddressSaved) {
    mainAddressSaveTimerRef.current = setTimeout(async () => {
      const id = await saveNewAddress(
        {
          street_address: addressForm.street_address,
          postcode: addressForm.postcode,
          additional_details: addressDetails,
          house_number: geoData.house_number,
          latitude: geoData.latitude,
          longitude: geoData.longitude,
          street_name: geoData.street_name,
        },
        "delivery"
      );

      if (id) setSelectedAddressId(String(id));
    }, AUTO_SAVE_DELAY_MS);
  }

  return () => {
    if (mainAddressSaveTimerRef.current) {
      clearTimeout(mainAddressSaveTimerRef.current);
    }
  };
}, [
  userToken,
  useSameAddress,
  showAddressForm,
  addresses.length,
  addressForm,
  geoData,
  addressDetails,
  isDeliveryAddressSaved,
  saveNewAddress,
]);

  useEffect(() => {
    if (!userToken || useSameAddress || !showPickupAddressForm || selectedPickupAddressId !== "new") return;
    const has = pickupAddressForm.street_address.trim() && pickupAddressForm.postcode.trim() && pickupGeoData.latitude && pickupGeoData.longitude && hasEnteredPickupDetails && pickupAddressDetails.trim();
    if (pickupAddressSaveTimerRef.current) clearTimeout(pickupAddressSaveTimerRef.current);
    if (has && !isPickupAddressSaved) {
      pickupAddressSaveTimerRef.current = setTimeout(async () => {
        const id = await saveNewAddress({ street_address: pickupAddressForm.street_address, postcode: pickupAddressForm.postcode, additional_details: pickupAddressDetails, house_number: pickupGeoData.house_number, latitude: pickupGeoData.latitude, longitude: pickupGeoData.longitude, street_name: pickupGeoData.street_name }, "pickup");
        if (id) { setSelectedPickupAddressId(String(id)); setIsPickupAddressSaved(true); resetPickupForm(); setShowPickupAddressForm(false); }
      }, AUTO_SAVE_DELAY_MS);
    }
    return () => { if (pickupAddressSaveTimerRef.current) clearTimeout(pickupAddressSaveTimerRef.current); };
  }, [userToken, useSameAddress, showPickupAddressForm, selectedPickupAddressId, pickupAddressForm, pickupGeoData, pickupAddressDetails, hasEnteredPickupDetails, isPickupAddressSaved, saveNewAddress, resetPickupForm]);

  useEffect(() => {
    if (!useSameAddress && showPickupAddressForm) { setHasEnteredPickupDetails(false); setIsPickupAddressSaved(false); }
  }, [pickupAddressForm.street_address, useSameAddress, showPickupAddressForm]);
  useEffect(() => {
  if (userInfo.email) {
    validateEmail(userInfo.email);
  }

  if (userInfo.phone) {
    const { code, local } = parsePhone(userInfo.phone);

    setSelectedCountryCode(code);
    setLocalPhone(local);

    // Trigger validation again
    if (local.length >= getExpectedPhoneLength()) {
      validatePhone(code + stripLeadingZeros(local), local);
    }
  }
}, [userInfo]);

  /* ══════════════ PROFILE UPDATE ══════════════ */
  const updateProfileField = useCallback(async (field, value) => {
    if (!userToken) return;
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.status === 401) { localStorage.removeItem("jwtToken"); setUserToken(null); }
    } catch {}
  }, [userToken]);

  const triggerProfileUpdate = (field, value) => {
    clearTimeout(debouncedProfileUpdate.current[field]);
    debouncedProfileUpdate.current[field] = setTimeout(() => updateProfileField(field, value), 1000);
  };

  /* ══════════════ EMAIL VALIDATION ══════════════ */
  const validateEmail = useCallback((email) => {
    if (!email.trim()) {
      setEmailError("Email is required");
      setEmailValid(false);
      return false;
    }
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      setEmailValid(false);
      return false;
    }
    setEmailError("");
    setEmailValid(true);
    return true;
  }, []);

  const handleEmailChange = (e) => {
    const v = e.target.value;
    setUserInfo((p) => ({ ...p, email: v }));
    validateEmail(v);
    if (userToken) triggerProfileUpdate("email", v);
  };

  /* ══════════════ PHONE VALIDATION & AUTH ══════════════ */
  const getExpectedPhoneLength = () => {
    const country = countryCodes.find(c => c.code === selectedCountryCode);
    return country ? country.minDigits : 10;
  };

//  const validatePhone = useCallback(async (fullPhone, localRaw) => {
//   const cleanedLocal = stripLeadingZeros(localRaw.replace(/\D/g, ''));
//   const expectedLen = getExpectedPhoneLength();

//   if (cleanedLocal.length !== expectedLen) {
//     setPhoneError("Enter a valid mobile number");
//     setPhoneValid(false);
//     return false;
//   }

//   try {
//     const res = await fetch(`${API_BASE}/validate-phone`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ phone: fullPhone }),
//     });

//     const data = await res.json();

//     if (!data.valid) {
//       setPhoneError(data.message || "Enter a valid mobile number");
//       setPhoneValid(false);
//       return false;
//     }

//     setPhoneError("");
//     setPhoneValid(true);
//     return true;
//   } catch {
//     setPhoneError("Validation failed");
//     setPhoneValid(false);
//     return false;
//   }
// }, [selectedCountryCode]);
const validatePhone = useCallback((fullPhone, localRaw) => {
  const cleanedLocal = stripLeadingZeros(localRaw.replace(/\D/g, ""));
  const expectedLen = getExpectedPhoneLength();

  if (cleanedLocal.length !== expectedLen) {
    setPhoneError("Enter a valid mobile number");
    setPhoneValid(false);
    return false;
  }

  // ✅ No API call — just basic validation
  setPhoneError("");
  setPhoneValid(true);
  return true;
}, [selectedCountryCode]);

  // const handlePhoneChange = (e) => {
  //   let raw = e.target.value;
  //   raw = raw.replace(/\D/g, '');
  //   setLocalPhone(raw);

  //   const cleanedLocal = stripLeadingZeros(raw);
  //   const full = selectedCountryCode + cleanedLocal;
  //   setUserInfo((p) => ({ ...p, phone: full }));

  //   clearTimeout(phoneCheckTimeoutRef.current);

  //   const expectedLen = getExpectedPhoneLength();
  //   if (raw.length >= expectedLen) {
  //     phoneCheckTimeoutRef.current = setTimeout(() => {
  //       validatePhone(full, raw);
  //     }, 800);
  //   } else {
  //     setPhoneError(`Please enter a valid mobile number`);
  //     setPhoneValid(false);
  //   }
  // };
const handlePhoneChange = (e) => {
  let raw = e.target.value.replace(/\D/g, '');
  setLocalPhone(raw);

  const cleanedLocal = stripLeadingZeros(raw);
  const full = selectedCountryCode + cleanedLocal;

  setUserInfo((p) => ({ ...p, phone: full }));

  const expectedLen = getExpectedPhoneLength();

  if (cleanedLocal.length === expectedLen) {
    validatePhone(full, raw);
  } else {
    setPhoneError("Enter a valid mobile number");
    setPhoneValid(false);
  }
};

  // const handleCountryCodeChange = (e) => {
  //   const code = e.target.value;
  //   setSelectedCountryCode(code);
  //   if (localPhone.trim().length >= getExpectedPhoneLength()) {
  //     const cleanedLocal = stripLeadingZeros(localPhone);
  //     const full = code + cleanedLocal;
  //     setUserInfo((p) => ({ ...p, phone: full }));
  //     clearTimeout(phoneCheckTimeoutRef.current);
  //     phoneCheckTimeoutRef.current = setTimeout(() => {
  //       validatePhone(full, localPhone);
  //     }, 800);
  //   } else {
  //     setPhoneError(`Please enter a valid ${getExpectedPhoneLength()}-digit number`);
  //     setPhoneValid(false);
  //   }
  // };
const handleCountryCodeChange = (e) => {
  const code = e.target.value;
  setSelectedCountryCode(code);

  const cleanedLocal = stripLeadingZeros(localPhone);

  if (cleanedLocal.length === getExpectedPhoneLength()) {
    const full = code + cleanedLocal;
    setUserInfo((p) => ({ ...p, phone: full }));
    validatePhone(full, localPhone);
  } else {
    setPhoneError("Enter a valid mobile number");
    setPhoneValid(false);
  }
};
  const ensureUserExists = useCallback(async () => {
    const fullPhone = `${selectedCountryCode}${stripLeadingZeros(localPhone)}`;
    if (!fullPhone || fullPhone.trim().length < 5) throw new Error("Please enter a valid phone number");
    console.log(`[ensureUserExists] Calling /auth/access with phone: ${fullPhone}`);
    const res = await fetch(`${API_BASE}/auth/access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: fullPhone, name: userInfo.name || "User", email: userInfo.email || null }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Failed to authenticate"); }
    const d = await res.json();
    console.log(`[ensureUserExists] Response:`, d);
    if (d.success && d.user) {
      setUserInfo((p) => ({ name: d.user.name || p.name, email: d.user.email || p.email, phone: d.user.phone || p.phone }));
      if (d.token) {
        localStorage.setItem("jwtToken", d.token);
        setUserToken(d.token);
        login({ id: d.user.id, name: d.user.name, email: d.user.email, phone: d.user.phone });
        fetchUserProfile();
        fetchAddresses();
        fetchSavedCards();
        ensureStripeCustomer();
      }
      // 🔥 store referral code
if (d.referral_code) {
  setMyReferralCode(d.referral_code);
}
      showToast(d.isNewUser ? "Account created!" : "Welcome back!", "success");
      return d.token;
    }
    throw new Error("Authentication failed");
  }, [selectedCountryCode, localPhone, userInfo.name, userInfo.email, login, fetchUserProfile, fetchAddresses, fetchSavedCards, ensureStripeCustomer, showToast]);

  /* ══════════════ FIELD HANDLERS ══════════════ */
  const handleNameChange = (e) => { const v = e.target.value; setUserInfo((p) => ({ ...p, name: v })); if (userToken) triggerProfileUpdate("name", v); };

  const handleToggleSameAddress = (e) => {
    setUseSameAddress(e.target.checked);
    if (e.target.checked) { setPickupAddressForm({ ...addressForm }); setPickupGeoData({ ...geoData }); }
  };

  /* ══════════════ SLOT POSTCODE ══════════════ */
  const getPostcodeForSlots = useCallback((type = "pickup") => {
    if (type === "pickup") {
      if (useSameAddress) {
        if (userToken && addresses.length > 0 && selectedAddressId)
          return addresses.find((a) => String(a.address_id) === selectedAddressId)?.postcode || null;
        return addressForm.postcode || null;
      } else {
        if (userToken && pickupAddresses.length > 0 && selectedPickupAddressId && selectedPickupAddressId !== "new")
          return pickupAddresses.find((a) => String(a.address_id) === selectedPickupAddressId)?.postcode || null;
        return pickupAddressForm.postcode || null;
      }
    } else {
      if (userToken && addresses.length > 0 && selectedAddressId)
        return addresses.find((a) => String(a.address_id) === selectedAddressId)?.postcode || null;
      return addressForm.postcode || null;
    }
  }, [userToken, addresses, selectedAddressId, addressForm, useSameAddress, pickupAddresses, selectedPickupAddressId, pickupAddressForm]);

  /* ══════════════ TIME SLOTS ══════════════ */
  const fetchTimeSlots = useCallback(async (dateIso, isDelivery = false) => {
    if (!dateIso) return [];
    const tzOffset = -new Date().getTimezoneOffset();
    const params = new URLSearchParams({ date: dateIso, format: "24", tzOffset: String(tzOffset) });
    if (isDelivery) {
      params.set("isDelivery", "true");
      if (collectDate && selectedCollectSlotStart) {
        const h = String(selectedCollectSlotStart.getHours()).padStart(2, "0");
        const m = String(selectedCollectSlotStart.getMinutes()).padStart(2, "0");
        params.set("pickupDate", collectDate); params.set("pickupSlotStart", `${h}:${m}`);
      }
    }
    const pc = getPostcodeForSlots(isDelivery ? "delivery" : "pickup");
    if (pc) params.set("postcode", pc.replace(/\s/g, "").toUpperCase());
    try {
      const res = await fetch(`${API_BASE}/time-slots?${params}`);
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      return Array.isArray(data.slots) ? data.slots : Array.isArray(data) ? data : [];
    } catch (err) { showToast(`Error loading slots: ${err.message}`, "error"); return []; }
  }, [collectDate, selectedCollectSlotStart, showToast, getPostcodeForSlots]);

  const fetchCollectSlots = useCallback(async () => {
    if (!collectDate) return;
    setLoadingSlots((p) => ({ ...p, collect: true }));
    try {
      const slots = await fetchTimeSlots(collectDate, false);
      setCollectSlots(slots);
      if (selectedCollectSlot && !slots.find((s) => s.start === selectedCollectSlot.start && s.enabled)) {
        setSelectedCollectSlot(null); setSelectedCollectSlotStart(null);
      }
    } catch { setCollectSlots([]); } finally { setLoadingSlots((p) => ({ ...p, collect: false })); }
  }, [collectDate, fetchTimeSlots, selectedCollectSlot]);

  const fetchDeliverySlots = useCallback(async () => {
    if (!deliverDate || !collectDate || !selectedCollectSlotStart) return;
    setLoadingSlots((p) => ({ ...p, deliver: true }));
    try {
      const slots = await fetchTimeSlots(deliverDate, true);
      setDeliverSlots(slots);
      if (selectedDeliverSlot && !slots.find((s) => s.start === selectedDeliverSlot.start && s.enabled)) {
        setSelectedDeliverSlot(null); setSelectedDeliverSlotEnd(null);
      }
    } catch { setDeliverSlots([]); } finally { setLoadingSlots((p) => ({ ...p, deliver: false })); }
  }, [deliverDate, collectDate, selectedCollectSlotStart, fetchTimeSlots, selectedDeliverSlot]);

  useEffect(() => {
    if (collectDate) { const t = setTimeout(fetchCollectSlots, 300); return () => clearTimeout(t); }
  }, [collectDate, fetchCollectSlots]);

  useEffect(() => {
    if (deliverDate && selectedCollectSlotStart) { const t = setTimeout(fetchDeliverySlots, 300); return () => clearTimeout(t); }
  }, [deliverDate, selectedCollectSlotStart, fetchDeliverySlots]);
useEffect(() => {
  if (userInfo.email) {
    validateEmail(userInfo.email);
  }

  if (userInfo.phone) {
    const { code, local } = parsePhone(userInfo.phone);

    setSelectedCountryCode(code);
    setLocalPhone(local);

    const cleanedLocal = stripLeadingZeros(local.replace(/\D/g, ""));
    const expectedLen = countryCodes.find(c => c.code === code)?.minDigits || 10;

    // ✅ instant validation (no API delay)
    if (cleanedLocal.length === expectedLen) {
      setPhoneError("");
      setPhoneValid(true);
    } else {
      setPhoneError("Enter a valid mobile number");
      setPhoneValid(true);
    }
  }
}, [userInfo]);
  const handleCollectDateChange = (e) => {
    setCollectDate(e.target.value);
    setSelectedCollectSlot(null); setSelectedCollectSlotStart(null);
    setSelectedDeliverSlot(null); setSelectedDeliverSlotEnd(null); setDeliverSlots([]);
  };
  const handleDeliverDateChange = (e) => {
    if (collectDate && e.target.value < collectDate) { showToast("Delivery date can't be before collection", "error"); return; }
    setDeliverDate(e.target.value);
    setSelectedDeliverSlot(null); setSelectedDeliverSlotEnd(null); setDeliverSlots([]);
  };
  const handleCollectSlotSelect = (slot) => {
    if (!slot.enabled) return;
    setSelectedCollectSlot(slot); setSelectedCollectSlotStart(new Date(slot.start));
    setSelectedDeliverSlot(null); setSelectedDeliverSlotEnd(null); setDeliverSlots([]);
  };
  const handleDeliverSlotSelect = (slot) => {
    if (!slot.enabled) return;
    setSelectedDeliverSlot(slot);
    if (slot.end) setSelectedDeliverSlotEnd(new Date(slot.end));
  };

  /* ══════════════ ORDER DATA ══════════════ */
  const prepareOrderData = useCallback(() => {
    if (!selectedCollectSlot || !selectedDeliverSlot || !collectDate || !deliverDate) return null;
    const pickupSlotText = `${fmtDMY(collectDate)}, ${fmtRange(selectedCollectSlot.start, selectedCollectSlot.end)}`;
    const deliverySlotText = `${fmtDMY(deliverDate)}, ${fmtRange(selectedDeliverSlot.start, selectedDeliverSlot.end)}`;

    let pickupAddressData = {};
    if (!useSameAddress) {
      if (userToken && pickupAddresses.length > 0 && selectedPickupAddressId && selectedPickupAddressId !== "new") {
        const a = pickupAddresses.find((x) => String(x.address_id) === selectedPickupAddressId);
        if (!a) return null;
        pickupAddressData = {
          pickup_street_address: a.full_address,
          pickup_postcode: a.postcode,
          pickup_city: a.city || "",
          pickup_house_number: a.house_number || "",
          pickup_street_name: a.street_name || "",
          pickup_latitude: a.latitude || null,
          pickup_longitude: a.longitude || null,
          pickup_address_id: a.address_id,
        };
      } else {
        pickupAddressData = {
          pickup_street_address: pickupAddressForm.street_address,
          pickup_postcode: pickupAddressForm.postcode,
          pickup_city: pickupAddressForm.city || "",
          pickup_house_number: pickupGeoData.house_number || "",
          pickup_street_name: pickupGeoData.street_name || "",
          pickup_latitude: pickupGeoData.latitude || null,
          pickup_longitude: pickupGeoData.longitude || null,
        };
      }
    } else {
      if (userToken && selectedAddressId && selectedAddressId !== "new") {
        const a = addresses.find((x) => String(x.address_id) === selectedAddressId);
        if (a) {
          pickupAddressData = {
            pickup_street_address: a.full_address,
            pickup_postcode: a.postcode,
            pickup_city: a.city || "",
            pickup_house_number: a.house_number || "",
            pickup_street_name: a.street_name || "",
            pickup_latitude: a.latitude || null,
            pickup_longitude: a.longitude || null,
            pickup_address_id: a.address_id,
          };
        }
      } else {
        pickupAddressData = {
          pickup_street_address: addressForm.street_address,
          pickup_postcode: addressForm.postcode,
          pickup_city: addressForm.city || "",
          pickup_house_number: geoData.house_number || "",
          pickup_street_name: geoData.street_name || "",
          pickup_latitude: geoData.latitude || null,
          pickup_longitude: geoData.longitude || null,
        };
      }
    }

    let deliveryAddressData = {};
    if (useSameAddress) {
      deliveryAddressData = {
        delivery_street_address: pickupAddressData.pickup_street_address,
        delivery_postcode: pickupAddressData.pickup_postcode,
        delivery_city: pickupAddressData.pickup_city,
        delivery_house_number: pickupAddressData.pickup_house_number,
        delivery_street_name: pickupAddressData.pickup_street_name,
        delivery_latitude: pickupAddressData.pickup_latitude,
        delivery_longitude: pickupAddressData.pickup_longitude,
        delivery_address_id: pickupAddressData.pickup_address_id,
      };
    } else {
      if (userToken && selectedAddressId && selectedAddressId !== "new") {
        const a = addresses.find((x) => String(x.address_id) === selectedAddressId);
        if (a) {
          deliveryAddressData = {
            delivery_street_address: a.full_address,
            delivery_postcode: a.postcode,
            delivery_city: a.city || "",
            delivery_house_number: a.house_number || "",
            delivery_street_name: a.street_name || "",
            delivery_latitude: a.latitude || null,
            delivery_longitude: a.longitude || null,
            delivery_address_id: a.address_id,
          };
        }
      } else {
        deliveryAddressData = {
          delivery_street_address: deliveryAddressForm.street_address,
          delivery_postcode: deliveryAddressForm.postcode,
          delivery_city: deliveryAddressForm.city || "",
          delivery_house_number: deliveryGeoData.house_number || "",
          delivery_street_name: deliveryGeoData.street_name || "",
          delivery_latitude: deliveryGeoData.latitude || null,
          delivery_longitude: deliveryGeoData.longitude || null,
        };
      }
    }

    return {
      ...deliveryAddressData,
      ...pickupAddressData,
      use_same_address: useSameAddress,
      name: userInfo.name,
      email: userInfo.email,
      phone: `${selectedCountryCode}${stripLeadingZeros(localPhone)}`,
      collect_slot: pickupSlotText,
      delivery_slot: deliverySlotText,
      notes: notes.trim() || null,
      images: [],
      delivery_address_id: deliveryAddressData.delivery_address_id,
      pickup_address_id: pickupAddressData.pickup_address_id,
    };
  }, [
    selectedCollectSlot, selectedDeliverSlot, collectDate, deliverDate,
    userToken, pickupAddresses, selectedPickupAddressId, useSameAddress,
    addressForm, pickupAddressForm, geoData, pickupGeoData, deliveryAddressForm,
    deliveryGeoData, notes, userInfo, selectedCountryCode, localPhone, addresses,
    selectedAddressId
  ]);

  /* ══════════════ STRIPE ══════════════ */
  const createSetupIntent = useCallback(async (token) => {
    const res = await fetch(`${API_BASE}/stripe/init-setup-intent`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed to create setup intent"); }
    return await res.json();
  }, []);

  const createPaymentIntent = useCallback(async (token) => {
    const res = await fetch(`${API_BASE}/stripe/create-payment-intent-manual`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ amount: 100,currency: "gbp" }) });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed to create payment intent"); }
    return await res.json();
  }, []);

  const initiateStripeSetup = useCallback(async (token, cid, shouldSave) => {
    setSetupProcessing(true);
    try {
      if (!token) throw new Error("Authentication token missing");
      if (shouldSave) {
        const d = await createSetupIntent(token);
        if (!d?.setupIntentClientSecret) throw new Error("Stripe setup failed");
        setSetupClientSecret(d.setupIntentClientSecret); setCustomerId(d.customerId || cid); setShowPaymentSetup(true);
      } else {
        const d = await createPaymentIntent(token);
        if (!d?.clientSecret) throw new Error("Payment intent failed");
        setPaymentClientSecret(d.clientSecret); setShowPaymentSetup(true);
      }
    } catch (err) { showToast(err.message || "Failed to setup payment", "error"); }
    finally { setSetupProcessing(false); }
  }, [createSetupIntent, createPaymentIntent, showToast]);

  /* ══════════════ BOOKING VALIDATION ══════════════ */
  const isBookingValid = () => {
    if (!userInfo.name.trim() || !userInfo.email.trim() || !userInfo.phone.trim()) return false;
    if (!selectedCollectSlot || !selectedDeliverSlot) return false;
    if (userToken && addresses.length > 0 && !showAddressForm) {
      if (!selectedAddressId) return false;
      if (!useSameAddress && !selectedPickupAddressId) return false;
    } else {
      if (!addressForm.street_address.trim() || !addressForm.postcode.trim()) return false;
      if (useSameAddress && (!geoData.latitude || !geoData.longitude)) return false;
      if (!useSameAddress && (!deliveryGeoData.latitude || !deliveryGeoData.longitude)) return false;
      if (!addressDetails.trim()) return false;
    }
    if (!useSameAddress) {
      if (userToken && addresses.length > 0 && !showPickupAddressForm) { if (!selectedPickupAddressId) return false; }
      else {
        if (!pickupAddressForm.street_address.trim() || !pickupAddressForm.postcode.trim()) return false;
        if (!pickupGeoData.latitude || !pickupGeoData.longitude) return false;
        if (!pickupAddressDetails.trim()) return false;
      }
    }
    return true;
  };

  /* ══════════════ CONFIRM BOOKING ══════════════ */
  const handleConfirmBooking = useCallback(async (shouldSave = saveCardOption) => {
    if (bookingInProgress) return;
    setBookingInProgress(true); setLoading(true);
    try {
      if (useSameAddress && !userToken && (!geoData.latitude || !geoData.longitude)) throw new Error("Please select address from suggestions");
      if (!useSameAddress && (!deliveryGeoData.latitude || !deliveryGeoData.longitude)) throw new Error("Please select delivery address from suggestions");
      const order = prepareOrderData();
      if (!order) throw new Error("Please select pickup and delivery times");
      setPendingBookingData(order);
      let token = userToken || localStorage.getItem("jwtToken");
      if (!token) { token = await ensureUserExists(); if (!token) throw new Error("Authentication failed"); }
      await initiateStripeSetup(token, customerId, shouldSave);
    } catch (err) {
      if (!err.message?.toLowerCase().includes("address")) showToast(err.message || "Booking failed", "error");
    } finally { setLoading(false); setBookingInProgress(false); }
  }, [bookingInProgress, useSameAddress, userToken, geoData, deliveryGeoData, prepareOrderData, ensureUserExists, initiateStripeSetup, customerId, saveCardOption, showToast]);
  const fetchMyReferralCode = useCallback(async () => {
  try {
    const token = localStorage.getItem("jwtToken");
    if (!token) return;

    const res = await fetch(`${API_BASE}/user/referral-code`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (res.ok && data.referral_code) {
      setMyReferralCode(data.referral_code);
    }
  } catch (err) {
    console.error("Failed to fetch referral code");
  }
}, []);
const fetchWalletSettings = useCallback(async () => {
  try {
    const token = userToken || localStorage.getItem("jwtToken");
    if (!token) return;

    const response = await fetch(`${API_BASE}/wallet/settings`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) return;

    const data = await response.json();

    const balance = Number(data.walletBalance || 0);
    const maxUsage = Number(data.walletMaxUsagePerOrder || 0);
    const threshold = Number(data.walletThreshold || 0);

    setWalletBalance(balance);
    setWalletMaxUsage(maxUsage);
    setWalletThreshold(threshold);

    if (balance > 0 && balance >= threshold) {
      const usable = Math.min(balance, maxUsage);
      setWalletUsed(usable);
    }
  } catch (e) {
    console.error("Wallet fetch error:", e);
  }
}, [userToken]);

  const handleSavedCardBooking = async () => {
    if (!selectedCard) { showToast("Please select a saved card", "error"); return; }
    setLoading(true);
    try {
      let token = userToken || localStorage.getItem("jwtToken");
      if (!token) { token = await ensureUserExists(); if (!token) throw new Error("Authentication required"); }
      const order = prepareOrderData();
      if (!order) throw new Error("Please select pickup and delivery times");
      const res = await fetch(`${API_BASE}/quick-booking`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
       body: JSON.stringify({
  ...order,
  payment_method_id: selectedCard,
  stripe_customer_id: customerId,
  wallet_applied: walletApplied === true,
  wallet_used_amount: walletApplied ? walletUsed : 0,
}),
      });
      let data; try { data = await res.json(); } catch { throw new Error("Server error"); }
      if (!res.ok) throw new Error(data.message || "Booking failed");
      showToast("Booking confirmed!", "success");
      navigate("/thankyou", { state: { orderId: data.order?.id, paymentStatus: "saved_card", paymentMethod: "saved_card", pickupDate: fmtDMY(collectDate), pickupTime: fmtRange(selectedCollectSlot.start, selectedCollectSlot.end), deliveryDate: fmtDMY(deliverDate), deliveryTime: fmtRange(selectedDeliverSlot.start, selectedDeliverSlot.end) } });
    } catch (err) {
      if (!err.message?.toLowerCase().includes("address")) showToast(err.message || "Booking failed", "error");
    } finally { setLoading(false); }
  };

  const handleUseAnotherCard = async () => {
    try {
      const token = userToken || localStorage.getItem("jwtToken");
      if (!token) throw new Error("Authentication required");
      const order = prepareOrderData();
      if (!order) throw new Error("Please complete booking details");
      setPendingBookingData(order);
      await initiateStripeSetup(token, customerId, true);
    } catch (err) { showToast(err.message || "Failed to setup card", "error"); }
  };

  const handleSetupSuccess = async (intent, shouldSave) => {
    setSetupProcessing(true);
    try {
      const token = userToken || localStorage.getItem("jwtToken");
      if (!token) throw new Error("Authentication required");
      if (!pendingBookingData) throw new Error("Booking data missing");
      let paymentMethodId, stripeCustomerId = customerId, paymentIntentId;
      if (shouldSave) {
        paymentMethodId = intent.payment_method || intent.latest_attempt?.payment_method;
        if (!paymentMethodId) throw new Error("Payment method not returned");
        if (customerId)
          await fetch(`${API_BASE}/stripe/set-default-payment`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ customerId, paymentMethodId }) });
      } else {
        paymentIntentId = intent.id;
        if (!paymentIntentId) throw new Error("Payment intent not returned");
      }
      const res = await fetch(`${API_BASE}/quick-booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
  ...pendingBookingData,
  payment_method_id: paymentMethodId,
  stripe_customer_id: stripeCustomerId,
  payment_intent_id: paymentIntentId,
  save_card: shouldSave,
  wallet_applied: walletApplied === true,
  wallet_used_amount: walletApplied ? walletUsed : 0,
}),
      });
      let data; try { data = await res.json(); } catch { throw new Error("Server crashed"); }
      if (!res.ok) throw new Error(data.message || "Failed to create booking");
      setShowPaymentSetup(false); setPendingBookingData(null); setSetupClientSecret(null); setPaymentClientSecret(null);
      showToast("Booking confirmed!", "success");
      setTimeout(() => {
        navigate("/thankyou", { state: { orderId: data.order?.id, paymentStatus: shouldSave ? "card_saved" : "card_authorized", paymentMethod: shouldSave ? "new_card_saved" : "new_card_one_time", pickupDate: fmtDMY(collectDate), pickupTime: fmtRange(selectedCollectSlot?.start, selectedCollectSlot?.end), deliveryDate: fmtDMY(deliverDate), deliveryTime: fmtRange(selectedDeliverSlot?.start, selectedDeliverSlot?.end) } });
      }, 1000);
    } catch (err) { showToast(err.message || "Failed to complete booking", "error"); }
    finally { setSetupProcessing(false); }
  };

  const handleSetupError = (msg) => showToast(msg || "Failed to save card", "error");

  const handlePaymentModalCancel = () => {
    setShowPaymentSetup(false); setSetupClientSecret(null); setPaymentClientSecret(null); setPendingBookingData(null); setSetupProcessing(false);
    showToast("Booking not confirmed — please complete card setup.", "warning");
  };

  const handleDeleteCard = async (pmId) => {
    if (!window.confirm("Delete this card?")) return;
    try {
      const token = userToken || localStorage.getItem("jwtToken");
      if (!token) throw new Error("Authentication required");
      const res = await fetch(`${API_BASE}/remove-card`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ paymentMethodId: pmId }) });
      const d = await res.json();
      if (!res.ok || !d.success) throw new Error(d.message || "Failed to delete card");
      const updated = savedCards.filter((c) => c.payment_method_id !== pmId);
      setSavedCards(updated);
      if (selectedCard === pmId) setSelectedCard(updated.length > 0 ? updated[0].payment_method_id : null);
      showToast("Card removed", "success");
    } catch (err) { showToast(err.message || "Failed to delete card", "error"); }
  };

  useEffect(() => {
    if (showPaymentSetup) document.body.classList.add("payment-modal-open");
    else document.body.classList.remove("payment-modal-open");
    return () => document.body.classList.remove("payment-modal-open");
  }, [showPaymentSetup]);

  useEffect(() => () => { clearTimeout(phoneCheckTimeoutRef.current); }, []);
  useEffect(() => {
  if (userToken) {
    fetchMyReferralCode();
    fetchWalletSettings();
  }
}, [userToken, fetchMyReferralCode, fetchWalletSettings]);

  /* ══════════════ STEP VALIDATION ══════════════ */
  const stepDone = (s) => {
   if (s === 1) {
  const phoneLen = stripLeadingZeros(localPhone).length;
  const expectedLen = getExpectedPhoneLength();

  return !!(
    userInfo.name.trim() &&
    emailValid &&
    phoneLen === expectedLen
  );
}
    if (s === 2) {
      if (userToken && addresses.length > 0 && !showAddressForm) return !!selectedAddressId;
      return !!(addressForm.street_address.trim() && addressForm.postcode.trim() && geoData.latitude && addressDetails.trim());
    }
    if (s === 3) return !!(selectedCollectSlot && selectedDeliverSlot);
    return false;
  };

  const valid = isBookingValid();
  const minDeliveryDate = collectDate || today;

  const STEPS = [
    { id: 1, label: "Your Info", icon: <i className="fas fa-user" /> },
    { id: 2, label: "Address",   icon: <i className="fas fa-map-marker-alt" /> },
    { id: 3, label: "Schedule",  icon: <i className="fas fa-calendar-alt" /> },
    { id: 4, label: "Payment",   icon: <i className="fas fa-credit-card" /> },
  ];

  // Handle continue to address – ensures phone is saved before proceeding
  const handleContinueToAddress = async () => {
    if (!stepDone(1)) return;
    setLoading(true);
    try {
      // If user is logged in, ensure phone number is updated on backend immediately
      if (userToken) {
        // Cancel any pending debounced update and update now
        clearTimeout(debouncedProfileUpdate.current.phone);
        await updateProfileField("phone", `${selectedCountryCode}${stripLeadingZeros(localPhone)}`);
        await updateProfileField("email", userInfo.email);
      } else {
        // For new users, create account via auth/access
        const token = await ensureUserExists();
        if (!token) throw new Error("Failed to authenticate");
      }
      // Fetch addresses and cards after login (or refresh for existing user)
      await Promise.all([fetchAddresses(), fetchSavedCards(), fetchWalletSettings()]);
setShowAddressForm(false);
setStep(2);
    } catch (err) {
      showToast(err.message || "Failed to continue", "error");
    } finally {
      setLoading(false);
    }
  };

  const applyReferralCode = async () => {

  // ✅ ADD HERE
  if (referralApplied) return;

  if (!referralCode.trim()) {
    showToast("Enter referral code", "error");
    return;
  }

  setReferralLoading(true);

  try {
    let token = userToken || localStorage.getItem("jwtToken");

    if (!token) {
      token = await ensureUserExists();
      if (!token) throw new Error("Login required");
    }

    const res = await fetch(`${API_BASE}/referrals/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ referral_code: referralCode }),
    });

    const data = await res.json();

    if (!res.ok) {
      let msg = data.message || "Invalid referral code";

      if (msg.toLowerCase().includes("already")) {
        msg = "⚠️ You have already used a referral code";
      } else if (msg.toLowerCase().includes("invalid")) {
        msg = "❌ Invalid referral code";
      }

      throw new Error(msg);
    }

    setReferralApplied(true);
    setReferralMessage("Referral applied successfully 🎉");
    showToast("Referral applied!", "success");

  } catch (err) {
    setReferralApplied(false);
    setReferralMessage(err.message);
    showToast(err.message, "error");
  } finally {
    setReferralLoading(false);
  }
};

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */
  return (
    <div className="qb-page">

      <header className="qb-header">
        <button className="qb-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <i className="fas fa-arrow-left" />
        </button>
        <div className="qb-header-brand">
          <span className="qb-logo">Ironing<span>Boy</span></span>
          <span className="qb-header-tag">Quick Booking</span>
        </div>
        {userToken && (
          <div className="qb-welcome-chip">
            <i className="fas fa-user-check" />
            {userInfo.name?.split(" ")[0] || "Welcome back"}
          </div>
        )}
      </header>

      <nav className="qb-steps-nav">
        {STEPS.map((s) => (
          <button
            key={s.id}
            className={`qb-step-btn${step === s.id ? " active" : ""}${stepDone(s.id) ? " done" : ""}`}
            onClick={() => setStep(s.id)}
          >
            <div className="qb-step-bubble">
              {stepDone(s.id) ? <i className="fas fa-check" /> : s.icon}
            </div>
            <span className="qb-step-btn-label">{s.label}</span>
          </button>
        ))}
      </nav>

      <main className="qb-main">

        {/* ════════ STEP 1 — Personal Info ════════ */}
        {step === 1 && (
          <div className="qb-section-card">
            <h2 className="qb-section-title">Your Information</h2>
            <p className="qb-section-desc">We'll use this to contact you about your order.</p>

            <div className="qb-form-row">
              <div className="qb-field">
                <label className="qb-label">Full Name</label>
                <input className="qb-input" type="text" value={userInfo.name} onChange={handleNameChange} placeholder="Jane Smith" />
              </div>
              <div className="qb-field">
                <label className="qb-label">Email Address</label>
                <input
                  className="qb-input"
                  type="email"
                  value={userInfo.email}
                  onChange={handleEmailChange}
                  placeholder="jane@email.com"
                />
                {emailError && <div className="qb-error-message"><i className="fas fa-exclamation-circle" /> {emailError}</div>}
              </div>
            </div>

            <div className="qb-field">
              <label className="qb-label">Phone Number</label>
              <div className="qb-phone-row">
                <select className="qb-country-code" value={selectedCountryCode} onChange={handleCountryCodeChange}>
                  {countryCodes.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
                <input
                  className="qb-phone-input"
                  type="tel"
                  value={localPhone}
                  onChange={handlePhoneChange}
                  placeholder="Enter mobile number"
                />
              </div>
              {phoneError && <div className="qb-error-message"><i className="fas fa-exclamation-circle" /> {phoneError}</div>}
            </div>

            <button
              className="qb-btn-primary"
              onClick={handleContinueToAddress}
              disabled={!stepDone(1) || loading}
            >
              {loading ? (
                <><div className="qb-btn-spinner" /> Processing…</>
              ) : (
                <>Continue to Address <i className="fas fa-arrow-right" /></>
              )}
            </button>
          </div>
        )}

        {/* ════════ STEP 2 — Address ════════ */}
        {step === 2 && (
          <div className="qb-section-card">
            <h2 className="qb-section-title">Collection Address</h2>
            <p className="qb-section-desc">Where should we pick up your laundry?</p>

            {/* Saved addresses */}
            {userToken && addresses.length > 0 && !showAddressForm ? (
              <>
                <div className="qb-address-list">
                  {addresses.map((addr) => (
                    <div
                      key={addr.address_id}
                      className={`qb-address-card${selectedAddressId === String(addr.address_id) ? " selected" : ""}`}
                      onClick={() => {
                        const id = String(addr.address_id);
                        setSelectedAddressId(id);
                        if (useSameAddress) setSelectedPickupAddressId(id);
                      }}
                    >
                      <div className="qb-address-card-body">
                        <div className="qb-address-card-icon"><i className="fas fa-home" /></div>
                        <div>
                          <div className="qb-address-name">
                            {addr.name || "Home"}
                            {addr.is_selected && <span className="qb-badge"><i className="fas fa-star" /> Default</span>}
                          </div>
                          <div className="qb-address-line">{addr.full_address}</div>
                          <div className="qb-address-pc"><i className="fas fa-map-pin" /> {addr.postcode}</div>
                        </div>
                      </div>
                      {selectedAddressId === String(addr.address_id) && (
                        <div className="qb-check-circle"><i className="fas fa-check" /></div>
                      )}
                      <button className="qb-addr-del" onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr.address_id); }}>
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  ))}
                  <div className="qb-add-new-card" onClick={() => {
  resetMainForm();
  setIsDeliveryAddressSaved(false);   // 🔥 IMPORTANT
  setSelectedAddressId(null);         // optional but cleaner
  setShowAddressForm(true);
}}>
                    <div className="qb-add-icon"><i className="fas fa-plus" /></div>
                    <div><strong>Add New Address</strong><small>Enter a different address</small></div>
                  </div>
                </div>

                <label className="qb-toggle-row">
                  <input type="checkbox" checked={useSameAddress} onChange={handleToggleSameAddress} />
                  <span className="qb-toggle-pill" />
                  <div>
                    <div className="qb-toggle-text">Collect &amp; deliver to the same address</div>
                    <div className="qb-toggle-sub">Deliver your laundry back to the pickup location</div>
                  </div>
                </label>
              </>
            ) : (
              /* Manual form */
              <div>
                <div className="qb-form-row">
                  <div className="qb-field">
                    <label className="qb-label">Postcode</label>
                    <input className="qb-input" type="text" value={postcode} onChange={(e) => setPostcode(e.target.value.toUpperCase())} placeholder="SW1A 2AA" />
                  </div>
                  <div className="qb-field">
                    <label className="qb-label">Select Address</label>
                    <select className="qb-select" value={selectedPostcodeAddress} onChange={(e) => setSelectedPostcodeAddress(e.target.value)}>
                      <option value="">Choose address…</option>
                      {postcodeAddresses.map((a, i) => <option key={i} value={a.place_id}>{a.full}</option>)}
                    </select>
                  </div>
                </div>
                <div className="qb-field">
                  <label className="qb-label">Flat / Door / Floor</label>
                  <input className="qb-input" type="text" value={addressDetails} onChange={(e) => { setAddressDetails(e.target.value); setIsDeliveryAddressSaved(false); }} placeholder="e.g. Flat 3, Floor 2" />
                </div>
                {userToken && addresses.length > 0 && showAddressForm && (
                  <button className="qb-btn-ghost" onClick={() => { resetMainForm(); setShowAddressForm(false); }}>
                    <i className="fas fa-arrow-left" /> Back to saved addresses
                  </button>
                )}
                {(!userToken || showAddressForm) && (
                  <label className="qb-toggle-row">
                    <input type="checkbox" checked={useSameAddress} onChange={handleToggleSameAddress} />
                    <span className="qb-toggle-pill" />
                    <div>
                      <div className="qb-toggle-text">Collect &amp; deliver to the same address</div>
                      <div className="qb-toggle-sub">Deliver your laundry back to the pickup location</div>
                    </div>
                  </label>
                )}
              </div>
            )}

            {/* Different delivery address */}
            {!useSameAddress && (
              <div className="qb-sub-section">
                <h3 className="qb-sub-title"><i className="fas fa-truck" /> Delivery Address</h3>
                <div className="qb-form-row">
                  <div className="qb-field">
                    <label className="qb-label">Postcode</label>
                    <input className="qb-input" type="text" value={deliveryPostcode} onChange={(e) => setDeliveryPostcode(e.target.value.toUpperCase())} placeholder="SW1A 2AA" />
                  </div>
                  <div className="qb-field">
                    <label className="qb-label">Select Address</label>
                    <select className="qb-select" value={selectedDeliveryPostcodeAddress} onChange={(e) => setSelectedDeliveryPostcodeAddress(e.target.value)}>
                      <option value="">Choose address…</option>
                      {deliveryPostcodeAddresses.map((a, i) => <option key={i} value={a.place_id}>{a.full}</option>)}
                    </select>
                  </div>
                </div>
                <div className="qb-field">
                  <label className="qb-label">Flat / Door / Floor</label>
                  <input className="qb-input" type="text" value={deliveryAddressDetails} onChange={(e) => { setDeliveryAddressDetails(e.target.value); setIsDeliveryAddressSaved(false); }} placeholder="e.g. Flat 3, Floor 2" />
                </div>
              </div>
            )}

            {/* Different pickup address (when different addresses selected) */}
            {!useSameAddress && (
              <div className="qb-sub-section">
                <h3 className="qb-sub-title"><i className="fas fa-map-marker-alt" /> Pickup Address</h3>
                {userToken && pickupAddresses.length > 0 && !showPickupAddressForm ? (
                  <div className="qb-address-list">
                    {pickupAddresses.map((addr) => (
                      <div
                        key={addr.address_id}
                        className={`qb-address-card${selectedPickupAddressId === String(addr.address_id) ? " selected" : ""}`}
                        onClick={() => { setSelectedPickupAddressId(String(addr.address_id)); setShowPickupAddressForm(false); }}
                      >
                        <div className="qb-address-card-body">
                          <div className="qb-address-card-icon"><i className="fas fa-home" /></div>
                          <div>
                            <div className="qb-address-line">{addr.full_address}</div>
                            <div className="qb-address-pc"><i className="fas fa-map-pin" /> {addr.postcode}</div>
                          </div>
                        </div>
                        {selectedPickupAddressId === String(addr.address_id) && (
                          <div className="qb-check-circle"><i className="fas fa-check" /></div>
                        )}
                      </div>
                    ))}
                    <div className="qb-add-new-card" onClick={() => { setShowPickupAddressForm(true); setSelectedPickupAddressId("new"); }}>
                      <div className="qb-add-icon"><i className="fas fa-plus" /></div>
                      <div><strong>Add New Pickup Address</strong></div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="qb-field">
                      <label className="qb-label">Full Address</label>
                      <input ref={pickupAddressInputRef} className="qb-input" type="text" value={pickupAddressForm.street_address}
                        onChange={(e) => { setPickupAddressForm((p) => ({ ...p, street_address: e.target.value })); setPickupGeoData({ latitude: null, longitude: null, street_name: "", house_number: "" }); }}
                        placeholder="Start typing address…" />
                    </div>
                    <div className="qb-field">
                      <label className="qb-label">Flat / Door / Floor</label>
                      <input className="qb-input" type="text" value={pickupAddressDetails}
                        onChange={(e) => { setPickupAddressDetails(e.target.value); setHasEnteredPickupDetails(e.target.value.trim().length > 0); setIsPickupAddressSaved(false); }}
                        placeholder="e.g. Flat 3" />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="qb-btn-row">
              <button className="qb-btn-ghost" onClick={() => setStep(1)}>
                <i className="fas fa-arrow-left" /> Back
              </button>
              <button className="qb-btn-primary" onClick={() => setStep(3)} disabled={!stepDone(2)}>
                Continue to Schedule <i className="fas fa-arrow-right" />
              </button>
            </div>
          </div>
        )}

        {/* ════════ STEP 3 — Schedule ════════ */}
        {step === 3 && (
          <div className="qb-section-card">
            <h2 className="qb-section-title">Pick a Time</h2>
            <p className="qb-section-desc">Choose when we collect and when we return your laundry.</p>

            <div className="qb-schedule-grid">
              {/* Collection */}
              <div className="qb-schedule-panel">
                <div className="qb-schedule-panel-label">
                  <span className="qb-panel-dot pickup" />
                  <i className="fas fa-truck-loading" /> Collection
                </div>
                <div className="qb-field">
                  <label className="qb-label">Date</label>
                  <input className="qb-input" type="date" value={collectDate} onChange={handleCollectDateChange} min={today} />
                </div>
                {collectDate && <div className="qb-date-selected-chip"><i className="fas fa-calendar-check" /> {fmtHuman(collectDate)}</div>}
                {collectDate && (
                  <>
                    <div className="qb-slots-label">Available Times</div>
                    {loadingSlots.collect ? (
                      <div className="qb-loading-row"><span className="qb-spin" /> Loading slots…</div>
                    ) : collectSlots.length === 0 ? (
                      <p className="qb-no-slots">This date is fully booked. Please select another day — slots fill up quickly!</p>
                    ) : (
                      <div className="qb-slots-grid">
                        {collectSlots.map((slot, i) => (
                          <button
                            key={i}
                            className={`qb-slot-btn${selectedCollectSlot?.start === slot.start ? " selected" : ""}${!slot.enabled ? " disabled" : ""}`}
                            onClick={() => handleCollectSlotSelect(slot)}
                            disabled={!slot.enabled}
                          >
                            {fmtRange(slot.start, slot.end)}
                          </button>
                        ))}
                      </div>
                    )}
                    {selectedCollectSlot && (
                      <div className="qb-slot-confirm">
                        <i className="fas fa-check-circle" /> {fmtRange(selectedCollectSlot.start, selectedCollectSlot.end)}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Delivery */}
              <div className="qb-schedule-panel">
                <div className="qb-schedule-panel-label">
                  <span className="qb-panel-dot delivery" />
                  <i className="fas fa-truck" /> Delivery
                </div>
                <div className="qb-field">
                  <label className="qb-label">Date</label>
                  <input className="qb-input" type="date" value={deliverDate} onChange={handleDeliverDateChange} min={minDeliveryDate} disabled={!collectDate} />
                  {!collectDate && <p className="qb-hint-text">Select collection date first</p>}
                </div>
                {deliverDate && <div className="qb-date-selected-chip"><i className="fas fa-calendar-check" /> {fmtHuman(deliverDate)}</div>}
                {deliverDate && (
                  <>
                    <div className="qb-slots-label">Available Times</div>
                    {loadingSlots.deliver ? (
                      <div className="qb-loading-row"><span className="qb-spin" /> Loading slots…</div>
                    ) : deliverSlots.length === 0 ? (
                      <p className="qb-no-slots">This date is fully booked.Please select another day — slots fill up quickly!</p>
                    ) : (
                      <div className="qb-slots-grid">
                        {deliverSlots.map((slot, i) => (
                          <button
                            key={i}
                            className={`qb-slot-btn${selectedDeliverSlot?.start === slot.start ? " selected" : ""}${!slot.enabled ? " disabled" : ""}`}
                            onClick={() => handleDeliverSlotSelect(slot)}
                            disabled={!slot.enabled}
                          >
                            {fmtRange(slot.start, slot.end)}
                          </button>
                        ))}
                      </div>
                    )}
                    {selectedDeliverSlot && (
                      <div className="qb-slot-confirm">
                        <i className="fas fa-check-circle" /> {fmtRange(selectedDeliverSlot.start, selectedDeliverSlot.end)}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="qb-field" style={{ marginTop: 18 }}>
              <label className="qb-label">
                Special Instructions <span className="qb-label-opt">(optional)</span>
              </label>
              <div className="qb-notes-wrap">
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                  placeholder="e.g. ring bell twice, fragile items, leave with neighbour…"
                />
                <div className="qb-notes-footer">
                  <span><i className="fas fa-lightbulb" style={{ color: "var(--qb-accent)", marginRight: 4 }} />Optional but helpful</span>
                  {notes.length > 0 && <span className="qb-char-count">{notes.length}/500</span>}
                </div>
              </div>
            </div>

            <div className="qb-btn-row">
              <button className="qb-btn-ghost" onClick={() => setStep(2)}>
                <i className="fas fa-arrow-left" /> Back
              </button>
              <button className="qb-btn-primary" onClick={() => setStep(4)} disabled={!stepDone(3)}>
                Continue booking <i className="fas fa-arrow-right" />
              </button>
            </div>
          </div>
        )}

        {/* ════════ STEP 4 — Payment ════════ */}
        {step === 4 && !showPaymentSetup && (
          <div className="qb-section-card">
            <h2 className="qb-section-title">Payment Method</h2>
            <p className="qb-section-desc">No charge now — you'll only pay after approving your invoice.</p>

            <div className="qb-no-charge-notice">
              <div className="qb-notice-icon"><i className="fas fa-info-circle" /></div>
              <div>
                <strong>No payment taken now.</strong> Enter your card Details to confirm your booking. We'll send an invoice after pickup — you only pay when you're happy.
              </div>
            </div>

            <div className="qb-summary-box">
              <div className="qb-summary-row">
                <span>Collection</span>
                <span>{selectedCollectSlot ? `${fmtHuman(collectDate)} · ${fmtRange(selectedCollectSlot.start, selectedCollectSlot.end)}` : "—"}</span>
              </div>
              <div className="qb-summary-row">
                <span>Delivery</span>
                <span>{selectedDeliverSlot ? `${fmtHuman(deliverDate)} · ${fmtRange(selectedDeliverSlot.start, selectedDeliverSlot.end)}` : "—"}</span>
              </div>
              <div className="qb-summary-row">
                <span>Collection &amp; Delivery fee</span>
                <span><span className="qb-free-badge">FREE</span></span>
              </div>
            </div>
            {/* 🔥 USER REFERRAL CODE DISPLAY */}
{/* {myReferralCode && (
  <div
    style={{
      background: "#f1f5f9",
      padding: "12px",
      borderRadius: "10px",
      marginBottom: "12px",
      border: "1px dashed #FF6B00",
    }}
  >
    <div style={{ fontSize: "12px", color: "#64748b" }}>
      Your Referral Code
    </div>

    <div
      style={{
        fontSize: "18px",
        fontWeight: "700",
        color: "#FF6B00",
        letterSpacing: "1px",
      }}
    >
      {myReferralCode}
    </div>

    <div style={{ fontSize: "12px", color: "#64748b" }}>
      Share with friends & earn rewards 🎁
    </div>
  </div>
)} */}
{/* <button
  className="qb-copy-btn"
  onClick={() => {
    navigator.clipboard.writeText(myReferralCode);
    setCopied(true);
    showToast("Copied!", "success");

    setTimeout(() => setCopied(false), 2000);
  }}
>
  <i className="fas fa-copy" />
  {copied ? "Copied!" : "Copy Code"}
</button> */}

            {/* 🔥 REFERRAL SECTION (STEP 4) */}
{/* 🔥 WALLET OR REFERRAL SECTION */}
{walletBalance > 0 ? (
  <div
    style={{
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: "14px",
      padding: "16px",
      marginTop: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    }}
  >
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a1a1a", marginBottom: 4 }}>
        Use Wallet Balance
      </div>
      <div style={{ fontSize: "0.8rem", color: "#4a5568" }}>
        Available: £{walletBalance.toFixed(2)}
      </div>
      {walletThreshold > 0 ? (
        <div style={{ fontSize: "0.78rem", color: "#dc2626", marginTop: 2 }}>
          Wallet usable above £{walletThreshold.toFixed(2)}
        </div>
      ) : (
        <div style={{ fontSize: "0.78rem", color: "#4a5568", marginTop: 2 }}>
          Only part of your wallet balance can be used for this order.
        </div>
      )}
    </div>

    <label className="qb-switch">
      <input
        type="checkbox"
        checked={walletApplied}
        onChange={(e) => {
          const isChecked = e.target.checked;
          setWalletApplied(isChecked);
          if (isChecked) {
            const usable = Math.min(walletBalance, walletMaxUsage);
            setWalletUsed(usable);
          } else {
            setWalletUsed(0);
          }
        }}
      />
      <span className="qb-slider"></span>
    </label>
  </div>
) : (
  <div className="qb-field" style={{ marginTop: "16px" }}>
    <label className="qb-label">
      Have a referral code? <span className="qb-label-opt">(optional)</span>
    </label>

    <div style={{ display: "flex", gap: "8px" }}>
      <input
        className="qb-input"
        type="text"
        value={referralCode}
        onChange={(e) => {
          setReferralCode(e.target.value.toUpperCase());
          setReferralApplied(false);
          setReferralMessage("");
        }}
        placeholder="Enter referral code"
        disabled={referralApplied}
      />

      <button
        className="qb-btn-ghost"
        style={{ maxWidth: "120px" }}
        onClick={applyReferralCode}
        disabled={referralLoading || referralApplied}
      >
        {referralLoading ? "Applying..." : referralApplied ? "Applied" : "Apply"}
      </button>
    </div>

    {referralMessage && (
      <div className={referralApplied ? "qb-success-message" : "qb-error-message"}>
        {referralMessage}
      </div>
    )}
  </div>
)}

            {userToken && loadingCards ? (
              <div className="qb-loading-cards">
                <span className="qb-spin" /> Loading your saved cards…
              </div>
            ) : userToken && savedCards.length > 0 ? (
              <>
                <p className="qb-cards-heading"><i className="fas fa-credit-card" style={{ marginRight: 6 }} />Your Saved Cards</p>
                <div className="qb-saved-cards-list">
                  {savedCards.map((card) => (
                    <div
                      key={card.payment_method_id}
                      className={`qb-card-item${selectedCard === card.payment_method_id ? " selected" : ""}`}
                      onClick={() => setSelectedCard(card.payment_method_id)}
                    >
                      <i className={getCardIcon(card.brand)} style={{ fontSize: "1.4rem", color: "var(--qb-text-secondary)" }} />
                      <span className="qb-card-brand-text">{card.brand?.toUpperCase() || "CARD"}</span>
                      <span className="qb-card-num">•••• {card.last4}</span>
                      {card.is_default && <span className="qb-card-default-badge"><i className="fas fa-check-circle" /> Default</span>}
                      {selectedCard === card.payment_method_id && <div className="qb-check-circle"><i className="fas fa-check" /></div>}
                      <button className="qb-card-del" onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.payment_method_id); }}>
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  ))}
                  <div className="qb-add-card-btn" onClick={handleUseAnotherCard}>
                    <div className="qb-add-icon"><i className="fas fa-plus" /></div>
                    <span>Use a different card</span>
                  </div>
                </div>
                <button
                  className="qb-btn-primary lg"
                  onClick={handleSavedCardBooking}
                  disabled={!valid || loading || setupProcessing || bookingInProgress}
                >
                  {loading ? <><div className="qb-btn-spinner" /> Processing…</> : <><i className="fas fa-check-circle" /> Confirm Booking</>}
                </button>
              </>
            ) : (
              <>
                {/* <label className="qb-save-toggle-row">
  <div className="qb-save-toggle-icon">
    <i className="fas fa-lock" />
  </div>

  <div className="qb-save-toggle-text">
    <strong>Reserve My Slot</strong>
    <span>
      Enter your card details to secure your booking.
      No charges will be made until after inspection.
    </span>
  </div>

  <label className="qb-switch">
    <input
      type="checkbox"
      checked={saveCardOption}
      onChange={(e) => setSaveCardOption(e.target.checked)}
    />
    <span className="qb-switch-slider" />
  </label>
</label> */}
                <button
                  className="qb-btn-primary lg"
                  onClick={() => handleConfirmBooking(saveCardOption)}
                  disabled={!valid || loading || setupProcessing || bookingInProgress}
                >
                  {loading || setupProcessing
                    ? <><div className="qb-btn-spinner" /> Processing…</>
                    : <><i className="fas fa-lock" /> Book Now </>}
                </button>
              </>
            )}

            <button className="qb-btn-ghost" onClick={() => navigate("/")} disabled={loading || setupProcessing}>
              <i className="fas fa-times" /> Cancel Booking
            </button>

            <div className="qb-trust-row">
              <span><i className="fas fa-check" />Free collection</span>
              <span><i className="fas fa-check" />24hr turnaround</span>
              <span><i className="fas fa-check" />Pay after inspection</span>
            </div>

            <div className="qb-btn-row" style={{ marginTop: 10 }}>
              <button className="qb-btn-ghost" onClick={() => setStep(3)}>
                <i className="fas fa-arrow-left" /> Back
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Stripe Modal */}
      {showPaymentSetup && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret: setupClientSecret || paymentClientSecret,
            appearance: { theme: "stripe" },
          }}
        >
          <StripeSetupForm
            onSetupSuccess={handleSetupSuccess}
            onSetupError={handleSetupError}
            onCancel={handlePaymentModalCancel}
            setupProcessing={setupProcessing}
            userToken={userToken}
            isSetup={!!setupClientSecret}
          />
        </Elements>
      )}

      {/* Toast */}
      {toast && (
        <div className={`qb-toast qb-toast-${toast.type}`}>
          <div className="qb-toast-icon">
            {toast.type === "success" ? <i className="fas fa-check-circle" />
              : toast.type === "error" ? <i className="fas fa-exclamation-circle" />
              : toast.type === "warning" ? <i className="fas fa-exclamation-triangle" />
              : <i className="fas fa-info-circle" />}
          </div>
          <div className="qb-toast-message">{toast.msg}</div>
          <button className="qb-toast-close" onClick={() => setToast(null)}>
            <i className="fas fa-times" />
          </button>
        </div>
      )}
    </div>
  );
} 
