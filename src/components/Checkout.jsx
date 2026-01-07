

// src/components/Checkout.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Checkout.css";

// Stripe imports
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";

const API_BASE = "https://api.ironingboy.com";
const stripePromise = loadStripe("pk_live_51SUiy73fSKIcHb6THsEQatj2g1tJOjUhzaym490HNFobNn6gOtdzpelQnV2knmKkXPiqxKqJjwEQ6dtSNRKuO4yx00HFqYnkEI");

/* -------------------------------------------------------------------------- */
/*                       Stripe SetupIntent Form (UI)                         */
/* -------------------------------------------------------------------------- */
const StripeSetupForm = ({
  onSetupSuccess,
  onSetupError,
  onCancel,
  setupProcessing,
  userToken
}) => {
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!consent) {
      setError("You must consent to save your card for future payments");
      return;
    }
    
    if (!stripe || !elements) return;
    
    setSubmitting(true);
    setError(null);

    try {
      const result = await stripe.confirmSetup({
        elements,
        redirect: "if_required",
      });

      if (result.error) {
        throw result.error;
      }

      const setupIntent = result.setupIntent;

      if (!setupIntent || !setupIntent.payment_method) {
        throw new Error("Payment method not saved");
      }

      await onSetupSuccess(setupIntent);
    } catch (err) {
      setError(err.message || "Card save failed");
      onSetupError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="stripe-payment-modal">
      <div className="stripe-modal-overlay" onClick={onCancel}></div>
      <div className="stripe-modal-content">
        <div className="stripe-modal-header">
          <div className="stripe-modal-icon">
            <i className="fas fa-shield-alt"></i>
          </div>
          <div>
            <h3>Save Card to Complete Booking</h3>
            <p>Your booking will be confirmed after you save your card securely.</p>
          </div>
          <button 
            className="stripe-modal-close" 
            onClick={onCancel}
            disabled={submitting || setupProcessing}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="stripe-form">
          <div className="stripe-form-content">
            <div className="stripe-payment-info">
              <div className="stripe-info-icon">
                <i className="fas fa-credit-card"></i>
              </div>
              <div className="stripe-info-text">
                <h4>No Charges Now</h4>
                <p>Your card will only be charged after your laundry manager sends the invoice.</p>
              </div>
            </div>

            <div className="stripe-element-container">
              <PaymentElement 
                options={{
                  layout: {
                    type: 'tabs',
                    defaultCollapsed: false,
                  },
                  wallets: {
                    applePay: 'never',
                    googlePay: 'never',
                  }
                }}
              />
            </div>
            
            <div className="stripe-consent-section">
              <div className="stripe-consent-checkbox">
                <input
                  type="checkbox"
                  id="consent-checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                />
                <label htmlFor="consent-checkbox" className="stripe-consent-label">
                  <span className="stripe-consent-title">Yes, save my card for future payments</span>
                  <span className="stripe-consent-description">
                    I authorize IroningBoy to securely save this card and use it for automatic payment of laundry service invoices.
                  </span>
                </label>
              </div>
            </div>
            
            {error && (
              <div className="stripe-error-message">
                <i className="fas fa-exclamation-triangle"></i>
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="stripe-modal-actions">
            <button
              type="submit"
              disabled={!stripe || submitting || setupProcessing || !consent}
              className="stripe-confirm-btn"
            >
              {submitting ? (
                <>
                  <div className="stripe-loading-spinner"></div>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-lock"></i>
                  Complete Booking & Save Card
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                           Main Checkout Component                          */
/* -------------------------------------------------------------------------- */
export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();

  // Cart data from ServicePricing
  const { cart: initialCart = [] } = location.state || {};

  // State management
  const [cartItems, setCartItems] = useState(initialCart);
  const [loading, setLoading] = useState(false);
  const [setupProcessing, setSetupProcessing] = useState(false);
  const [showPaymentSetup, setShowPaymentSetup] = useState(false);
  const [toast, setToast] = useState(null);
  const [savedCards, setSavedCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [setupClientSecret, setSetupClientSecret] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [userToken, setUserToken] = useState(localStorage.getItem("jwtToken"));
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showPickupAddressForm, setShowPickupAddressForm] = useState(false);

  // Payment option - ALWAYS require card for ALL users
  const [saveCardOption, setSaveCardOption] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);

  // Time slots state
  const [loadingSlots, setLoadingSlots] = useState({
    collect: false,
    deliver: false,
  });
  const [collectSlots, setCollectSlots] = useState([]);
  const [deliverSlots, setDeliverSlots] = useState([]);
  const [selectedCollectSlot, setSelectedCollectSlot] = useState(null);
  const [selectedDeliverSlot, setSelectedDeliverSlot] = useState(null);
  const [selectedCollectSlotStart, setSelectedCollectSlotStart] = useState(null);
  const [selectedCollectSlotEnd, setSelectedCollectSlotEnd] = useState(null);
  const [selectedDeliverSlotStart, setSelectedDeliverSlotStart] = useState(null);
  const [selectedDeliverSlotEnd, setSelectedDeliverSlotEnd] = useState(null);

  // User info and addresses
  const [userInfo, setUserInfo] = useState(() => {
    if (user) {
      return {
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      };
    }
    return {
      name: "",
      email: "",
      phone: "",
    };
  });
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [selectedPickupAddressId, setSelectedPickupAddressId] = useState(null);
  const [pickupAddresses, setPickupAddresses] = useState([]);

  // Address form for all users
  const [addressForm, setAddressForm] = useState({
    street_address: "",
    postcode: "",
    city: "",
    additional_details: "",
    house_number: ""
  });

  // Pickup address form (when useSameAddress is false)
  const [pickupAddressForm, setPickupAddressForm] = useState({
    street_address: "",
    postcode: "",
    city: "",
    additional_details: "",
    house_number: ""
  });

  // Form state
  const [collectDate, setCollectDate] = useState("");
  const [deliverDate, setDeliverDate] = useState("");
  const [notes, setNotes] = useState("");

  // Discount and charges state (from Flutter app)
  const [discountData, setDiscountData] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [topupAmount, setTopupAmount] = useState(0);
  const [minimumOrderAmount, setMinimumOrderAmount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [calculatingDiscount, setCalculatingDiscount] = useState(false);

  // Constants
  const today = new Date().toISOString().split("T")[0];

  // Show toast notification
  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  /* --------------------------- Helper Functions --------------------------- */
  const formatTime24Hour = (timeString) => {
    if (!timeString) return "";
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return timeString;
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return timeString;
    }
  };

  const formatTimeRange24Hour = (startTime, endTime) => {
    const start = formatTime24Hour(startTime);
    const end = formatTime24Hour(endTime);
    if (start && end) return `${start}-${end}`;
    return start || end || "";
  };

  const formatDateDDMMYYYY = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  const getCardBrandClass = (brand) => {
    if (!brand) return 'card-brand-unknown';
    const brandLower = brand.toLowerCase();
    if (brandLower.includes('visa')) return 'card-brand-visa';
    if (brandLower.includes('mastercard')) return 'card-brand-mastercard';
    if (brandLower.includes('amex') || brandLower.includes('american express')) return 'card-brand-amex';
    if (brandLower.includes('discover')) return 'card-brand-discover';
    return 'card-brand-unknown';
  };

  const getCardBrandIcon = (brand) => {
    const brandLower = brand?.toLowerCase() || '';
    if (brandLower.includes('visa')) return 'fab fa-cc-visa';
    if (brandLower.includes('mastercard')) return 'fab fa-cc-mastercard';
    if (brandLower.includes('amex') || brandLower.includes('american express')) return 'fab fa-cc-amex';
    if (brandLower.includes('discover')) return 'fab fa-cc-discover';
    return 'fas fa-credit-card';
  };

  const formatPrice = (price) => {
    return `£${Number(price).toFixed(2)}`;
  };

  // Calculate cart totals
  const calculateCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  const calculateItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  /* ---------------------------- Data Fetching ----------------------------- */
  
  // Check if phone number exists and auto-fill user info
  const checkPhoneNumberExists = useCallback(async (phone) => {
    if (!phone || phone.trim().length < 5) return;
    
    try {
      const response = await fetch(`${API_BASE}/check-phone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.exists && data.user) {
          // Auto-fill user info
          setUserInfo(prev => ({
            ...prev,
            name: data.user.name || prev.name,
            email: data.user.email || prev.email,
            phone: data.user.phone || prev.phone,
          }));
          
          showToast("Welcome back! Your details have been auto-filled.", "success");
          
          // If user is found but not logged in, log them in
          if (data.token && !userToken) {
            localStorage.setItem("jwtToken", data.token);
            setUserToken(data.token);
            login({
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              phone: data.user.phone,
            });
            
            // Fetch their saved data
            fetchUserProfile();
            fetchAddresses();
            fetchSavedCards();
            ensureStripeCustomer();
          }
        }
      }
    } catch (error) {
      console.error("Error checking phone number:", error);
    }
  }, [showToast, userToken, login]);

  const fetchUserProfile = useCallback(async () => {
    if (!userToken) return;
    
    try {
      const response = await fetch(`${API_BASE}/profile`, {
        headers: {
          "Authorization": `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, [userToken]);

  const fetchAddresses = useCallback(async () => {
    if (!userToken) return;
    
    try {
      const response = await fetch(`${API_BASE}/addresses`, {
        headers: {
          "Authorization": `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
        setPickupAddresses(data); // Also set pickup addresses
        
        if (data.length > 0) {
          const defaultAddress = data.find(addr => addr.is_selected) || data[0];
          if (defaultAddress) {
            const id = String(defaultAddress.address_id);
            setSelectedAddressId(id);
            setSelectedPickupAddressId(id);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  }, [userToken]);

  const fetchSavedCards = useCallback(async () => {
    if (!userToken) {
      setLoadingCards(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/stripe/saved-cards`, {
        headers: {
          "Authorization": `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSavedCards(data.cards || []);
        if (data.cards?.length > 0) {
          const defaultCard = data.cards.find(card => card.is_default);
          if (defaultCard) {
            setSelectedCard(defaultCard.id);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching saved cards:", error);
      setSavedCards([]);
    } finally {
      setLoadingCards(false);
    }
  }, [userToken]);

  const ensureStripeCustomer = useCallback(async () => {
    if (!userToken) return;

    try {
      const response = await fetch(`${API_BASE}/stripe/create-customer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomerId(data.customerId);
      }
    } catch (error) {
      console.error("Error creating Stripe customer:", error);
    }
  }, [userToken]);

  const createSetupIntent = useCallback(async (token) => {
    try {
      const response = await fetch(`${API_BASE}/stripe/init-setup-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create setup intent");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating setup intent:", error);
      return null;
    }
  }, []);

  // Add pickup address
  const addPickupAddress = useCallback(async () => {
    if (!userToken) {
      showToast("Please log in to save pickup address", "error");
      return null;
    }

    try {
      const response = await fetch(`${API_BASE}/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          street_address: pickupAddressForm.street_address,
          postcode: pickupAddressForm.postcode,
          city: pickupAddressForm.city,
          additional_details: pickupAddressForm.additional_details,
          house_number: pickupAddressForm.house_number,
          name: "Pickup Location",
          is_selected: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        showToast("Pickup address saved successfully", "success");
        
        // Refresh addresses list
        fetchAddresses();
        
        // Select the new address
        setSelectedPickupAddressId(String(data.address_id));
        setShowPickupAddressForm(false);
        
        return data.address_id;
      } else {
        throw new Error("Failed to save pickup address");
      }
    } catch (error) {
      console.error("Error adding pickup address:", error);
      showToast(error.message || "Failed to save pickup address", "error");
      return null;
    }
  }, [userToken, pickupAddressForm, showToast, fetchAddresses]);

  /* -------------------------- Discount Calculation ------------------------- */
  const calculateDiscount = useCallback(async (subtotal) => {
    if (!userToken) {
      // For non-logged-in users, just calculate basic total
      setDiscountApplied(false);
      setDiscountPercent(0);
      setDiscountAmount(0);
      setServiceCharge(0);
      setTopupAmount(0);
      setMinimumOrderAmount(0);
      setFinalTotal(subtotal);
      return;
    }

    setCalculatingDiscount(true);

    try {
      const response = await fetch(`${API_BASE}/calculate-discount?amount=${subtotal}`, {
        headers: {
          "Authorization": `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDiscountData(data);
        
        if (data.success === true) {
          setDiscountPercent(data.discountPercent || 0);
          setDiscountAmount(data.discountAmount || 0);
          setServiceCharge(data.serviceCharge || 0);
          setMinimumOrderAmount(data.minimumOrderAmount || 0);
          setTopupAmount(data.topupAmount || 0);
          setFinalTotal(data.finalTotal || subtotal);
          setDiscountApplied(true);
        } else {
          setDiscountApplied(false);
          setDiscountPercent(0);
          setDiscountAmount(0);
          setServiceCharge(data.serviceCharge || 0);
          setMinimumOrderAmount(data.minimumOrderAmount || 0);
          setTopupAmount(data.topupAmount || 0);
          setFinalTotal(data.finalTotal || subtotal);
        }
      } else {
        // Fallback values if API fails
        setDiscountApplied(false);
        setDiscountPercent(0);
        setDiscountAmount(0);
        setServiceCharge(0);
        setTopupAmount(0);
        setMinimumOrderAmount(0);
        setFinalTotal(subtotal);
      }
    } catch (error) {
      console.error("Error calculating discount:", error);
      // Fallback values
      setDiscountApplied(false);
      setDiscountPercent(0);
      setDiscountAmount(0);
      setServiceCharge(0);
      setTopupAmount(0);
      setMinimumOrderAmount(0);
      setFinalTotal(subtotal);
    } finally {
      setCalculatingDiscount(false);
    }
  }, [userToken]);

  /* -------------------------- TIME SLOT FUNCTIONS ------------------------- */
  const getPostcodeForTimeSlots = useCallback((type = 'pickup') => {
    if (type === 'pickup') {
      if (useSameAddress) {
        // Use delivery address for pickup when same address
        if (userToken && addresses.length > 0 && selectedAddressId) {
          const selectedAddress = addresses.find(addr => String(addr.address_id) === selectedAddressId);
          return selectedAddress?.postcode || null;
        } else {
          return addressForm.postcode || null;
        }
      } else {
        // Use pickup address
        if (userToken && pickupAddresses.length > 0 && selectedPickupAddressId && selectedPickupAddressId !== "new") {
          const selectedPickupAddress = pickupAddresses.find(addr => String(addr.address_id) === selectedPickupAddressId);
          return selectedPickupAddress?.postcode || null;
        } else if (userToken && selectedPickupAddressId === "new") {
          return pickupAddressForm.postcode || null;
        } else if (!userToken) {
          return pickupAddressForm.postcode || null;
        }
      }
    } else if (type === 'delivery') {
      // Always use delivery address for delivery slots
      if (userToken && addresses.length > 0 && selectedAddressId) {
        const selectedAddress = addresses.find(addr => String(addr.address_id) === selectedAddressId);
        return selectedAddress?.postcode || null;
      } else {
        return addressForm.postcode || null;
      }
    }
    return null;
  }, [
    userToken, 
    addresses, 
    selectedAddressId, 
    addressForm, 
    useSameAddress, 
    pickupAddresses, 
    selectedPickupAddressId, 
    pickupAddressForm
  ]);

  const fetchTimeSlots = useCallback(async (dateIso, isDelivery = false) => {
    if (!dateIso) return [];

    const tzOffset = -new Date().getTimezoneOffset();
    const formattedDate = dateIso;
    
    const params = new URLSearchParams({
      date: formattedDate,
      format: "24",
      tzOffset: tzOffset.toString(),
    });

    if (isDelivery) {
      params.set("isDelivery", "true");

      if (collectDate && selectedCollectSlotStart) {
        const pickupFormattedDate = collectDate;
        const h = selectedCollectSlotStart.getHours().toString().padStart(2, "0");
        const m = selectedCollectSlotStart.getMinutes().toString().padStart(2, "0");
        params.set("pickupDate", pickupFormattedDate);
        params.set("pickupSlotStart", `${h}:${m}`);
      }
    }

    // Get postcode based on pickup/delivery type
    const postcode = getPostcodeForTimeSlots(isDelivery ? 'delivery' : 'pickup');
    
    // Add postcode to params if available (remove spaces and uppercase as per Flutter code)
    if (postcode) {
      const cleanPostcode = postcode.replace(/\s/g, '').toUpperCase();
      params.set("postcode", cleanPostcode);
    }

    try {
      const response = await fetch(`${API_BASE}/time-slots?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error(`Failed to fetch slots: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.slots && Array.isArray(data.slots)) {
        return data.slots;
      } else if (Array.isArray(data)) {
        return data;
      } else {
        console.warn("Unexpected response format, returning empty array");
        return [];
      }
    } catch (error) {
      console.error("Error fetching time slots:", error);
      showToast(`Error loading time slots: ${error.message}`, "error");
      return [];
    }
  }, [collectDate, selectedCollectSlotStart, showToast, getPostcodeForTimeSlots]);

  const fetchCollectSlots = useCallback(async () => {
    if (!collectDate) return;
    
    setLoadingSlots(prev => ({ ...prev, collect: true }));
    
    try {
      const slots = await fetchTimeSlots(collectDate, false);
      setCollectSlots(slots);

      if (selectedCollectSlot && slots.length > 0) {
        const stillValid = slots.find(
          (s) => s.start === selectedCollectSlot.start && s.enabled
        );
        if (!stillValid) {
          setSelectedCollectSlot(null);
          setSelectedCollectSlotStart(null);
          setSelectedCollectSlotEnd(null);
        }
      }
    } catch (error) {
      console.error("Error in fetchCollectSlots:", error);
      showToast("Failed to load pickup time slots. Please try again.", "error");
      setCollectSlots([]);
    } finally {
      setLoadingSlots(prev => ({ ...prev, collect: false }));
    }
  }, [collectDate, fetchTimeSlots, selectedCollectSlot, showToast]);

  const fetchDeliverySlots = useCallback(async () => {
    if (!deliverDate || !collectDate || !selectedCollectSlotStart) {
      return;
    }
    
    setLoadingSlots(prev => ({ ...prev, deliver: true }));
    
    try {
      const slots = await fetchTimeSlots(deliverDate, true);
      setDeliverSlots(slots);

      if (selectedDeliverSlot && slots.length > 0) {
        const stillValid = slots.find(
          (s) => s.start === selectedDeliverSlot.start && s.enabled
        );
        if (!stillValid) {
          setSelectedDeliverSlot(null);
          setSelectedDeliverSlotStart(null);
          setSelectedDeliverSlotEnd(null);
        }
      }
    } catch (error) {
      console.error("Error in fetchDeliverySlots:", error);
      showToast("Failed to load delivery time slots. Please try again.", "error");
      setDeliverSlots([]);
    } finally {
      setLoadingSlots(prev => ({ ...prev, deliver: false }));
    }
  }, [deliverDate, collectDate, selectedCollectSlotStart, fetchTimeSlots, selectedDeliverSlot, showToast]);

  /* ------------------------- Order Preparation ---------------------------- */
  const prepareOrderData = useCallback(async () => {
    if (!selectedCollectSlot || !selectedDeliverSlot || !collectDate || !deliverDate) {
      return null;
    }

    const pickupSlotText = `${formatDateDDMMYYYY(collectDate)}, ${formatTimeRange24Hour(
      selectedCollectSlot.start,
      selectedCollectSlot.end
    )}`;

    const deliverySlotText = `${formatDateDDMMYYYY(deliverDate)}, ${formatTimeRange24Hour(
      selectedDeliverSlot.start,
      selectedDeliverSlot.end
    )}`;

    // Get delivery address details
    let deliveryAddressData = {};
    if (userToken && addresses.length > 0 && selectedAddressId) {
      const selectedAddress = addresses.find(addr => 
        String(addr.address_id) === selectedAddressId
      );
      deliveryAddressData = {
        address_id: selectedAddressId,
        street_address: selectedAddress?.full_address || "",
        postcode: selectedAddress?.postcode || "",
        city: selectedAddress?.city || "",
        house_number: selectedAddress?.house_number || "",
        full_address: selectedAddress?.full_address || "",
      };
    } else {
      deliveryAddressData = {
        street_address: addressForm.street_address,
        postcode: addressForm.postcode,
        city: addressForm.city || "",
        full_address: addressForm.street_address,
        additional_details: addressForm.additional_details || "",
        house_number: addressForm.house_number || "",
      };
    }

    // Get pickup address details
    let pickupAddressData = {};
    if (useSameAddress) {
      pickupAddressData = { ...deliveryAddressData };
    } else if (userToken && pickupAddresses.length > 0 && selectedPickupAddressId) {
      const selectedPickupAddress = pickupAddresses.find(addr => 
        String(addr.address_id) === selectedPickupAddressId
      );
      if (selectedPickupAddress) {
        pickupAddressData = {
          pickup_address_id: selectedPickupAddressId,
          pickup_street_address: selectedPickupAddress.full_address || "",
          pickup_postcode: selectedPickupAddress.postcode || "",
          pickup_city: selectedPickupAddress.city || "",
          pickup_full_address: selectedPickupAddress.full_address || "",
        };
      }
    } else if (!userToken || showPickupAddressForm) {
      pickupAddressData = {
        pickup_street_address: pickupAddressForm.street_address,
        pickup_postcode: pickupAddressForm.postcode,
        pickup_city: pickupAddressForm.city || "",
        pickup_full_address: pickupAddressForm.street_address,
        pickup_additional_details: pickupAddressForm.additional_details || "",
        pickup_house_number: pickupAddressForm.house_number || "",
      };
    }

    // Prepare cart items for API - match Flutter's payload structure
    const orderItems = cartItems.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      price_at_purchase: item.price,
    }));

    // Calculate subtotal
    const subtotal = calculateCartTotal();

    return {
      address_id: deliveryAddressData.address_id || null,
      pickup_address_id: useSameAddress ? (deliveryAddressData.address_id || null) : (pickupAddressData.pickup_address_id || null),
      use_same_address: useSameAddress,
      items: orderItems,
      subtotal: subtotal,
      discount_percent: discountPercent,
      discount_amount: discountAmount,
      service_charge: serviceCharge,
      tip: 0, // No tip in this flow
      topup_amount: topupAmount,
      total: finalTotal,
      collect_slot: pickupSlotText,
      delivery_slot: deliverySlotText,
      notes: notes.trim() || null,
      images: [], // No images in this flow
      change_manager_requested: false,
      name: userInfo.name,
      email: userInfo.email,
      phone: userInfo.phone,
    };
  }, [
    selectedCollectSlot,
    selectedDeliverSlot,
    collectDate,
    deliverDate,
    userToken,
    addresses,
    selectedAddressId,
    pickupAddresses,
    selectedPickupAddressId,
    useSameAddress,
    addressForm,
    pickupAddressForm,
    showPickupAddressForm,
    notes,
    userInfo,
    cartItems,
    calculateCartTotal,
    discountPercent,
    discountAmount,
    serviceCharge,
    topupAmount,
    finalTotal,
  ]);

  /* ------------------------- Main Booking Flow ---------------------------- */
  const placeOrder = async () => {
    setLoading(true);
    
    try {
      // 1️⃣ Prepare order data
      const order = await prepareOrderData();
      if (!order) throw new Error("Please select pickup and delivery times");

      // Validate pickup address when useSameAddress is false
      if (!useSameAddress) {
        if (userToken && (!selectedPickupAddressId || selectedPickupAddressId === "new")) {
          if (selectedPickupAddressId === "new" && !showPickupAddressForm) {
            setShowPickupAddressForm(true);
            showToast("Please add pickup address details", "info");
            setLoading(false);
            return;
          }
          
          if (showPickupAddressForm) {
            if (!pickupAddressForm.street_address.trim() || !pickupAddressForm.postcode.trim()) {
              throw new Error("Please complete pickup address details");
            }
            
            // Add the new pickup address
            const newAddressId = await addPickupAddress();
            if (!newAddressId) {
              throw new Error("Failed to save pickup address");
            }
          } else if (!selectedPickupAddressId) {
            throw new Error("Please select a pickup address");
          }
        } else if (!userToken) {
          if (!pickupAddressForm.street_address.trim() || !pickupAddressForm.postcode.trim()) {
            throw new Error("Please complete pickup address details");
          }
        }
      }

      console.log("Creating order:", order);

      // 2️⃣ Create order - Use the /api/orders endpoint like Flutter app
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`,
        },
        body: JSON.stringify(order),
      });

      // Handle response
      const contentType = response.headers.get("content-type");
      let orderData;
      
      if (contentType && contentType.includes("application/json")) {
        orderData = await response.json();
      } else {
        const textResponse = await response.text();
        console.error("Non-JSON response received:", textResponse);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(orderData.message || orderData.error || "Failed to create order");
      }

      showToast("Order placed successfully!", "success");
      
      // Clear cart from localStorage
      localStorage.removeItem('laundryCart');
      
      // Show top-up message if applicable
      if (topupAmount > 0) {
        showToast(
          `A top-up of £${topupAmount.toFixed(2)} has been added to meet the £${minimumOrderAmount.toFixed(2)} minimum order value.`,
          "info"
        );
      }

      setTimeout(() => {
        navigate("/thankyou", {
          state: {
            orderId: orderData.order_id || orderData.id,
            paymentStatus: "card_saved",
            paymentMethod: "saved_card",
            pickupDate: formatDateDDMMYYYY(collectDate),
            pickupTime: formatTimeRange24Hour(selectedCollectSlot.start, selectedCollectSlot.end),
            deliveryDate: formatDateDDMMYYYY(deliverDate),
            deliveryTime: formatTimeRange24Hour(selectedDeliverSlot.start, selectedDeliverSlot.end),
            cartItems: cartItems,
            subtotal: calculateCartTotal(),
            discountAmount: discountAmount,
            serviceCharge: serviceCharge,
            topupAmount: topupAmount,
            total: finalTotal,
            message: "Your order has been placed successfully!",
          },
        });
      }, 1000);

    } catch (error) {
      console.error("Order error:", error);
      
      // Show more specific error messages
      let errorMessage = error.message;
      if (error.message.includes("404")) {
        errorMessage = "Order service is temporarily unavailable. Please try again later.";
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.message.includes("Server error")) {
        errorMessage = "Server error. Please try again in a few moments.";
      }
      
      showToast(errorMessage || "Failed to place order", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle saved card booking for logged-in users with saved cards
  const handleSavedCardBooking = async () => {
    if (!selectedCard) {
      showToast("Please select a card to use", "error");
      return;
    }

    // First save the card (if it's not already the default)
    const selectedCardData = savedCards.find(card => card.id === selectedCard);
    if (!selectedCardData) {
      throw new Error("Selected card not found");
    }

    if (!selectedCardData.is_default && userToken && customerId) {
      try {
        await fetch(`${API_BASE}/stripe/set-default-payment`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerId,
            paymentMethodId: selectedCardData.payment_method_id,
          }),
        });
      } catch (error) {
        console.error("Error setting default card:", error);
        // Continue anyway
      }
    }

    // Then place the order
    await placeOrder();
  };

  // Handle "Use Another Card" for logged-in users
  const handleUseAnotherCard = async () => {
    try {
      setSetupProcessing(true);
      
      const token = userToken || localStorage.getItem("jwtToken");
      if (!token) throw new Error("Authentication required");
      
      await initiateStripeSetup(token);
      
    } catch (err) {
      let errorMessage = err.message;
      if (err.message.includes("404")) {
        errorMessage = "Service unavailable. Please try again.";
      }
      showToast(errorMessage || "Failed to setup card", "error");
    } finally {
      setSetupProcessing(false);
    }
  };

  // Initiate Stripe setup
  const initiateStripeSetup = async (token) => {
    setSetupProcessing(true);

    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const setupData = await createSetupIntent(token);
      
      if (!setupData || !setupData.setupIntentClientSecret) {
        throw new Error("Stripe setup failed");
      }

      setSetupClientSecret(setupData.setupIntentClientSecret);
      setCustomerId(setupData.customerId);
      setShowPaymentSetup(true);

    } catch (error) {
      console.error("Stripe setup error:", error);
      showToast(error.message || "Failed to setup card payment", "error");
    } finally {
      setSetupProcessing(false);
    }
  };

  // Handle Stripe setup success (card saved)
  const handleSetupSuccess = async (setupIntent) => {
    setSetupProcessing(true);

    try {
      const token = userToken || localStorage.getItem("jwtToken");
      if (!token) throw new Error("Authentication required");

      const paymentMethodId = setupIntent.payment_method || setupIntent.latest_attempt?.payment_method;
      if (!paymentMethodId) {
        throw new Error("Payment method not returned by Stripe");
      }

      if (customerId) {
        await fetch(`${API_BASE}/stripe/set-default-payment`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerId,
            paymentMethodId,
          }),
        });
      }

      setShowPaymentSetup(false);
      showToast("Card saved successfully!", "success");
      
      // Now place the order
      await placeOrder();

    } catch (error) {
      console.error("Setup success error:", error);
      showToast(error.message || "Failed to save card", "error");
    } finally {
      setSetupProcessing(false);
    }
  };

  const handleSetupError = (errorMessage) => {
    showToast(errorMessage || "Failed to save card. Please try again.", "error");
  };

  const handlePaymentModalCancel = () => {
    setShowPaymentSetup(false);
    setSetupClientSecret(null);
    
    showToast("Booking not confirmed. Please complete card setup to confirm your booking.", "warning");
  };

  /* ---------------------------- UI Handlers ------------------------------- */
  
  // Handle phone number change with auto-fill
  const handlePhoneChange = (e) => {
    const newPhone = e.target.value;
    setUserInfo(prev => ({
      ...prev,
      phone: newPhone
    }));
    
    // Check if phone exists after user stops typing
    if (newPhone && newPhone.trim().length >= 5) {
      const timer = setTimeout(() => {
        checkPhoneNumberExists(newPhone);
      }, 1000);
      return () => clearTimeout(timer);
    }
  };

  const handleCollectDateChange = (e) => {
    const newDate = e.target.value;
    setCollectDate(newDate);
    setSelectedCollectSlot(null);
    setSelectedCollectSlotStart(null);
    setSelectedCollectSlotEnd(null);
    setSelectedDeliverSlot(null);
    setSelectedDeliverSlotStart(null);
    setSelectedDeliverSlotEnd(null);
    setDeliverSlots([]);
  };

  const handleDeliverDateChange = (e) => {
    const newDate = e.target.value;
    
    if (collectDate && newDate < collectDate) {
      showToast("Delivery date cannot be before pickup date", "error");
      return;
    }

    setDeliverDate(newDate);
    setSelectedDeliverSlot(null);
    setSelectedDeliverSlotStart(null);
    setSelectedDeliverSlotEnd(null);
    setDeliverSlots([]);
  };

  const handleCollectSlotSelect = (slot) => {
    if (!slot.enabled) return;
    
    const start = new Date(slot.start);
    const end = slot.end ? new Date(slot.end) : null;
    
    setSelectedCollectSlot(slot);
    setSelectedCollectSlotStart(start);
    setSelectedCollectSlotEnd(end);

    // Reset delivery when pickup changes
    setSelectedDeliverSlot(null);
    setSelectedDeliverSlotStart(null);
    setSelectedDeliverSlotEnd(null);
    setDeliverSlots([]);
  };

  const handleDeliverSlotSelect = (slot) => {
    if (!slot.enabled) return;
    
    const start = new Date(slot.start);
    const end = slot.end ? new Date(slot.end) : null;
    
    setSelectedDeliverSlot(slot);
    setSelectedDeliverSlotStart(start);
    setSelectedDeliverSlotEnd(end);
  };

  const handleToggleSameAddress = (e) => {
    const checked = e.target.checked;
    setUseSameAddress(checked);
    if (checked && selectedAddressId) {
      setSelectedPickupAddressId(selectedAddressId);
      setShowPickupAddressForm(false);
    }
  };

  // Handle pickup address selection
  const handlePickupAddressSelect = (addressId) => {
    if (addressId === "new") {
      setShowPickupAddressForm(true);
      setSelectedPickupAddressId("new");
    } else {
      setSelectedPickupAddressId(addressId);
      setShowPickupAddressForm(false);
    }
  };

  const handleUserInfoChange = (field) => (e) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleAddressFormChange = (field) => (e) => {
    setAddressForm(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // Handle pickup address form changes
  const handlePickupAddressFormChange = (field) => (e) => {
    setPickupAddressForm(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleAddAddressClick = () => {
    setShowAddressForm(true);
    setAddressForm({
      street_address: "",
      postcode: "",
      city: "",
      additional_details: "",
      house_number: ""
    });
  };

  // Edit cart item quantity
  const updateCartQuantity = (itemId, newQuantity) => {
    setCartItems(prev => {
      const updatedCart = prev.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.max(0, newQuantity) }
          : item
      ).filter(item => item.quantity > 0);
      
      return updatedCart;
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  /* ---------------------------- Effects ----------------------------------- */
  useEffect(() => {
    if (userToken) {
      fetchUserProfile();
      fetchAddresses();
      fetchSavedCards();
      ensureStripeCustomer();
    } else {
      setLoadingCards(false);
    }
  }, [userToken, fetchUserProfile, fetchAddresses, fetchSavedCards, ensureStripeCustomer]);

  // Effect to fetch collect slots when collectDate changes
  useEffect(() => {
    if (collectDate) {
      const timer = setTimeout(() => {
        fetchCollectSlots();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [collectDate, fetchCollectSlots]);

  // Effect to fetch delivery slots when deliverDate or pickup details change
  useEffect(() => {
    if (deliverDate && selectedCollectSlotStart) {
      const timer = setTimeout(() => {
        fetchDeliverySlots();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [deliverDate, selectedCollectSlotStart, fetchDeliverySlots]);

  // Effect to calculate discount when cart changes
  useEffect(() => {
    const subtotal = calculateCartTotal();
    const timer = setTimeout(() => {
      calculateDiscount(subtotal);
    }, 300); // Debounce to avoid too many API calls
    
    return () => clearTimeout(timer);
  }, [calculateCartTotal, userToken, calculateDiscount]);

  useEffect(() => {
    if (showPaymentSetup) {
      document.body.classList.add('payment-modal-open');
    } else {
      document.body.classList.remove('payment-modal-open');
    }
    
    return () => {
      document.body.classList.remove('payment-modal-open');
    };
  }, [showPaymentSetup]);

  // Calculate min delivery date
  const minDeliveryDate = collectDate || today;

  // Check if form is valid for booking
  const isBookingValid = () => {
    // Check cart has items
    if (cartItems.length === 0) return false;
    
    // Check user info
    if (!userInfo.name.trim()) return false;
    if (!userInfo.email.trim()) return false;
    if (!userInfo.phone.trim()) return false;
    
    // Check time slots
    if (!selectedCollectSlot || !selectedDeliverSlot) return false;
    
    // Delivery address validation
    if (userToken && addresses.length > 0 && !showAddressForm) {
      if (!selectedAddressId) return false;
    } else {
      if (!addressForm.street_address.trim()) return false;
      if (!addressForm.postcode.trim()) return false;
    }
    
    // Pickup address validation (when useSameAddress is false)
    if (!useSameAddress) {
      if (userToken) {
        if (!selectedPickupAddressId) return false;
        if (selectedPickupAddressId === "new" && showPickupAddressForm) {
          if (!pickupAddressForm.street_address.trim() || !pickupAddressForm.postcode.trim()) return false;
        }
      } else {
        if (!pickupAddressForm.street_address.trim() || !pickupAddressForm.postcode.trim()) return false;
      }
    }
    
    return true;
  };

  // Render cart summary with pricing breakdown
  const renderCartSummary = () => {
    const subtotal = calculateCartTotal();
    
    return (
      <div className="checkout-cart-summary">
        <h3 className="checkout-cart-title">
          <i className="fas fa-shopping-bag"></i>
          Your Order ({calculateItemCount()} items)
        </h3>
        
        <div className="checkout-cart-items">
          {cartItems.map(item => (
            <div key={item.id} className="checkout-cart-item">
              <div className="checkout-item-info">
                <span className="checkout-item-emoji">{item.emoji}</span>
                <div className="checkout-item-details">
                  <h5>{item.name}</h5>
                  <div className="checkout-item-meta">
                    <span className="checkout-item-price">{formatPrice(item.price)} each</span>
                    {item.hasOffer && (
                      <span className="checkout-item-offer">
                        <s>{formatPrice(item.standard_price)}</s>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="checkout-item-controls">
                <div className="checkout-item-quantity">
                  <button 
                    className="checkout-qty-btn"
                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <span className="checkout-qty-display">{item.quantity}</span>
                  <button 
                    className="checkout-qty-btn"
                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
                <button 
                  className="checkout-remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
              <div className="checkout-item-total">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="checkout-cart-total">
          <div className="checkout-total-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          
          {calculatingDiscount ? (
            <div className="checkout-total-row">
              <span>Calculating discount...</span>
              <div className="checkout-loading-spinner-small"></div>
            </div>
          ) : (
            <>
              {discountApplied && discountAmount > 0 && (
                <div className="checkout-total-row discount">
                  <span>Discount ({discountPercent}%)</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              
              {topupAmount > 0 && (
                <div className="checkout-total-row topup">
                  <span>Top-up Fee</span>
                  <span>+{formatPrice(topupAmount)}</span>
                </div>
              )}
              
              {serviceCharge > 0 && (
                <div className="checkout-total-row service-charge">
                  <span>Service Charge</span>
                  <span>+{formatPrice(serviceCharge)}</span>
                </div>
              )}
            </>
          )}
          
          <div className="checkout-total-row checkout-grand-total">
            <span>Total</span>
            <span>{formatPrice(finalTotal || subtotal)}</span>
          </div>
        </div>
        
        {topupAmount > 0 && (
          <div className="checkout-topup-notice">
            <i className="fas fa-info-circle"></i>
            <span>
              A top-up of {formatPrice(topupAmount)} has been added to meet the minimum order value of {formatPrice(minimumOrderAmount)}.
            </span>
          </div>
        )}
      </div>
    );
  };

  // Render pickup address section
  const renderPickupAddressSection = () => {
    if (useSameAddress) return null;

    return (
      <div className="checkout-address-section" style={{ marginTop: '24px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <h3 className="checkout-address-section-title">
          <i className="fas fa-truck-pickup"></i>
          Pickup Address
          <span className="checkout-required-badge">Required</span>
        </h3>
        <p className="checkout-address-section-subtitle">
          Where should we collect your laundry from?
        </p>

        {userToken && pickupAddresses.length > 0 && !showPickupAddressForm ? (
          <>
            <div className="checkout-address-grid">
              {pickupAddresses.map((addr) => (
                <div
                  key={`pickup-${addr.address_id}`}
                  className={`checkout-address-option ${
                    selectedPickupAddressId === String(addr.address_id) ? "selected" : ""
                  }`}
                  onClick={() => handlePickupAddressSelect(String(addr.address_id))}
                >
                  <div className="checkout-address-option-header">
                    <div className="checkout-address-type">
                      <i className="fas fa-home"></i>
                      <span>{addr.name || "Home"}</span>
                    </div>
                    {addr.is_selected && (
                      <span className="checkout-default-badge">
                        <i className="fas fa-star"></i>
                        Default
                      </span>
                    )}
                  </div>
                  <div className="checkout-address-option-details">
                    <p className="checkout-address-text">{addr.full_address}</p>
                    <p className="checkout-address-postcode">
                      <i className="fas fa-map-pin"></i>
                      {addr.postcode}
                    </p>
                  </div>
                  {selectedPickupAddressId === String(addr.address_id) && (
                    <div className="checkout-address-selected">
                      <i className="fas fa-check-circle"></i>
                    </div>
                  )}
                </div>
              ))}

              <div 
                className="checkout-add-address-option"
                onClick={() => handlePickupAddressSelect("new")}
              >
                <div className="checkout-add-address-icon">
                  <i className="fas fa-plus-circle"></i>
                </div>
                <div className="checkout-add-address-text">
                  <h4>Add New Pickup Address</h4>
                  <p>Enter a different pickup location</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="checkout-address-form-section">
            <div className="checkout-form-grid">
              <div className="checkout-form-group">
                <label className="checkout-form-label">
                  <i className="fas fa-home"></i>
                  House/Flat Number
                  <input
                    type="text"
                    className="checkout-form-input"
                    value={pickupAddressForm.house_number}
                    onChange={handlePickupAddressFormChange("house_number")}
                    placeholder="123"
                  />
                </label>
              </div>

              <div className="checkout-form-group full-width">
                <label className="checkout-form-label">
                  <i className="fas fa-road"></i>
                  Street Address *
                  <input
                    type="text"
                    className="checkout-form-input"
                    value={pickupAddressForm.street_address}
                    onChange={handlePickupAddressFormChange("street_address")}
                    placeholder="Main Street, Apt 4B"
                    required
                  />
                </label>
              </div>

              <div className="checkout-form-group">
                <label className="checkout-form-label">
                  <i className="fas fa-map-pin"></i>
                  Postcode *
                  <input
                    type="text"
                    className="checkout-form-input"
                    value={pickupAddressForm.postcode}
                    onChange={handlePickupAddressFormChange("postcode")}
                    placeholder="SW1A 1AA"
                    required
                  />
                </label>
              </div>

              <div className="checkout-form-group">
                <label className="checkout-form-label">
                  <i className="fas fa-city"></i>
                  City/Town
                  <input
                    type="text"
                    className="checkout-form-input"
                    value={pickupAddressForm.city}
                    onChange={handlePickupAddressFormChange("city")}
                    placeholder="London"
                  />
                </label>
              </div>

              <div className="checkout-form-group full-width">
                <label className="checkout-form-label">
                  <i className="fas fa-info-circle"></i>
                  Additional Details (Optional)
                  <textarea
                    className="checkout-form-textarea"
                    value={pickupAddressForm.additional_details}
                    onChange={handlePickupAddressFormChange("additional_details")}
                    placeholder="Floor, building, landmarks, access instructions..."
                    rows="2"
                  />
                </label>
              </div>
            </div>

            {userToken && pickupAddresses.length > 0 && showPickupAddressForm && (
              <button
                className="checkout-secondary-btn"
                onClick={() => {
                  setShowPickupAddressForm(false);
                  setSelectedPickupAddressId(null);
                }}
                style={{ marginTop: '10px' }}
              >
                <i className="fas fa-arrow-left"></i>
                Back to Saved Pickup Addresses
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">

        {/* Title Section */}
        <div className="checkout-title-section">
          <button 
            className="checkout-back-btn"
            onClick={() => navigate("/services")}
          >
            <i className="fas fa-arrow-left"></i> Back to Services
          </button>
          <h1 className="checkout-title">
            <i className="fas fa-shopping-cart checkout-title-icon"></i>
            Complete Your Booking
          </h1>
          <p className="checkout-subtitle">
            Review your order and fill in your details to complete booking
          </p>
          
          {userToken && (
            <div className="checkout-user-info">
              <i className="fas fa-user-check"></i>
              <span>Welcome back, {userInfo.name || user?.email}! Your info is pre-filled.</span>
            </div>
          )}
        </div>

        <div className="checkout-content">
          {/* Left Column - Cart Summary */}
          <div className="checkout-left-column">
            {/* Cart Summary Card */}
            <div className="checkout-card">
              {renderCartSummary()}
            </div>
            
            {/* Personal Information Card */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <div className="checkout-section-icon">
                  <i className="fas fa-user"></i>
                </div>
                <div>
                  <h2 className="checkout-section-title">Your Information</h2>
                  <p className="checkout-section-subtitle">We'll use this to contact you about your order</p>
                </div>
              </div>

              <div className="checkout-form-grid">
                <div className="checkout-form-group">
                  <label className="checkout-form-label">
                    <i className="fas fa-user-tag"></i>
                    Full Name
                    <input
                      type="text"
                      className="checkout-form-input"
                      value={userInfo.name}
                      onChange={handleUserInfoChange("name")}
                      placeholder="John Smith"
                      required
                    />
                  </label>
                </div>

                <div className="checkout-form-group">
                  <label className="checkout-form-label">
                    <i className="fas fa-envelope"></i>
                    Email Address
                    <input
                      type="email"
                      className="checkout-form-input"
                      value={userInfo.email}
                      onChange={handleUserInfoChange("email")}
                      placeholder="john@example.com"
                      required
                    />
                  </label>
                </div>

                <div className="checkout-form-group">
                  <label className="checkout-form-label">
                    <i className="fas fa-phone"></i>
                    Phone Number
                    <input
                      type="tel"
                      className="checkout-form-input"
                      value={userInfo.phone}
                      onChange={handlePhoneChange}
                      placeholder="+44 20 1234 5678"
                      required
                    />
                    <div className="checkout-phone-hint">
                      <i className="fas fa-info-circle"></i>
                      Enter phone number to check for existing account
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Details */}
          <div className="checkout-right-column">
            {/* Address Section */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <div className="checkout-section-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div>
                  <h2 className="checkout-section-title">Delivery Address</h2>
                  <p className="checkout-section-subtitle">Where should we deliver your laundry?</p>
                </div>
              </div>

              {userToken && addresses.length > 0 && !showAddressForm ? (
                <>
                  <div className="checkout-address-selection">
                    <h3 className="checkout-address-selection-title">Select a Saved Address</h3>
                    <div className="checkout-address-grid">
                      {addresses.map((addr) => (
                        <div
                          key={addr.address_id}
                          className={`checkout-address-option ${
                            selectedAddressId === String(addr.address_id) ? "selected" : ""
                          }`}
                          onClick={() => setSelectedAddressId(String(addr.address_id))}
                        >
                          <div className="checkout-address-option-header">
                            <div className="checkout-address-type">
                              <i className="fas fa-home"></i>
                              <span>{addr.name || "Home"}</span>
                            </div>
                            {addr.is_selected && (
                              <span className="checkout-default-badge">
                                <i className="fas fa-star"></i>
                                Default
                              </span>
                            )}
                          </div>
                          <div className="checkout-address-option-details">
                            <p className="checkout-address-text">{addr.full_address}</p>
                            <p className="checkout-address-postcode">
                              <i className="fas fa-map-pin"></i>
                              {addr.postcode}
                            </p>
                          </div>
                          {selectedAddressId === String(addr.address_id) && (
                            <div className="checkout-address-selected">
                              <i className="fas fa-check-circle"></i>
                            </div>
                          )}
                        </div>
                      ))}

                      <div 
                        className="checkout-add-address-option"
                        onClick={handleAddAddressClick}
                      >
                        <div className="checkout-add-address-icon">
                          <i className="fas fa-plus-circle"></i>
                        </div>
                        <div className="checkout-add-address-text">
                          <h4>Add New Address</h4>
                          <p>Enter a different delivery address</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="checkout-address-toggle">
                    <label className="checkout-toggle-container">
                      <div className="checkout-toggle-switch">
                        <input
                          type="checkbox"
                          checked={useSameAddress}
                          onChange={handleToggleSameAddress}
                        />
                        <span className="checkout-toggle-slider"></span>
                      </div>
                      <div className="checkout-toggle-label">
                        <span className="checkout-toggle-title">Use same address for pickup</span>
                        <span className="checkout-toggle-description">Pickup and delivery at the same location</span>
                      </div>
                    </label>
                  </div>
                </>
              ) : (
                <div className="checkout-address-form-section">
                  <div className="checkout-form-grid">
                    <div className="checkout-form-group">
                      <label className="checkout-form-label">
                        <i className="fas fa-home"></i>
                        House/Flat Number
                        <input
                          type="text"
                          className="checkout-form-input"
                          value={addressForm.house_number}
                          onChange={handleAddressFormChange("house_number")}
                          placeholder="123"
                        />
                      </label>
                    </div>

                    <div className="checkout-form-group full-width">
                      <label className="checkout-form-label">
                        <i className="fas fa-road"></i>
                        Street Address *
                        <input
                          type="text"
                          className="checkout-form-input"
                          value={addressForm.street_address}
                          onChange={handleAddressFormChange("street_address")}
                          placeholder="Main Street, Apt 4B"
                          required
                        />
                      </label>
                    </div>

                    <div className="checkout-form-group">
                      <label className="checkout-form-label">
                        <i className="fas fa-map-pin"></i>
                        Postcode *
                        <input
                          type="text"
                          className="checkout-form-input"
                          value={addressForm.postcode}
                          onChange={handleAddressFormChange("postcode")}
                          placeholder="SW1A 1AA"
                          required
                        />
                      </label>
                    </div>

                    <div className="checkout-form-group">
                      <label className="checkout-form-label">
                        <i className="fas fa-city"></i>
                        City/Town
                        <input
                          type="text"
                          className="checkout-form-input"
                          value={addressForm.city}
                          onChange={handleAddressFormChange("city")}
                          placeholder="London"
                        />
                      </label>
                    </div>

                    <div className="checkout-form-group full-width">
                      <label className="checkout-form-label">
                        <i className="fas fa-info-circle"></i>
                        Additional Details (Optional)
                        <textarea
                          className="checkout-form-textarea"
                          value={addressForm.additional_details}
                          onChange={handleAddressFormChange("additional_details")}
                          placeholder="Floor, building, landmarks, access instructions..."
                          rows="2"
                        />
                      </label>
                    </div>
                  </div>

                  {userToken && addresses.length > 0 && showAddressForm && (
                    <button
                      className="checkout-secondary-btn"
                      onClick={() => setShowAddressForm(false)}
                    >
                      <i className="fas fa-arrow-left"></i>
                      Back to Saved Addresses
                    </button>
                  )}

                  {/* Same Address Toggle for non-logged in users or when adding new address */}
                  {(!userToken || showAddressForm) && (
                    <div className="checkout-address-toggle" style={{ marginTop: '20px' }}>
                      <label className="checkout-toggle-container">
                        <div className="checkout-toggle-switch">
                          <input
                            type="checkbox"
                            checked={useSameAddress}
                            onChange={handleToggleSameAddress}
                          />
                          <span className="checkout-toggle-slider"></span>
                        </div>
                        <div className="checkout-toggle-label">
                          <span className="checkout-toggle-title">Use same address for pickup</span>
                          <span className="checkout-toggle-description">Pickup and delivery at the same location</span>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Render separate pickup address section when useSameAddress is false */}
              {renderPickupAddressSection()}
            </div>

            {/* Pickup & Delivery Schedule */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <div className="checkout-section-icon">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <div>
                  <h2 className="checkout-section-title">Schedule Pickup & Delivery</h2>
                  <p className="checkout-section-subtitle">Choose convenient times for collection and return</p>
                </div>
              </div>

              <div className="checkout-schedule-container">
                {/* Pickup Section */}
                <div className="checkout-schedule-section">
                  <div className="checkout-schedule-header">
                    <div className="checkout-schedule-icon pickup">
                      <i className="fas fa-truck-loading"></i>
                    </div>
                    <div>
                      <h3 className="checkout-schedule-title">Pickup</h3>
                      <p className="checkout-schedule-subtitle">When should we collect your laundry?</p>
                    </div>
                  </div>

                  <div className="checkout-date-section">
                    <label className="checkout-date-label">
                      <i className="fas fa-calendar-day"></i>
                      Pickup Date
                    </label>
                    <div className="checkout-date-input-container">
                      <input
                        type="date"
                        className="checkout-date-input"
                        value={collectDate}
                        onChange={handleCollectDateChange}
                        min={today}
                      />
                      <i className="fas fa-calendar-alt checkout-date-icon"></i>
                    </div>
                    {collectDate && (
                      <p className="checkout-date-display">
                        <i className="fas fa-check-circle"></i>
                        Selected: {formatDateDDMMYYYY(collectDate)}
                      </p>
                    )}
                  </div>

                  {collectDate && (
                    <div className="checkout-time-slots-section">
                      <label className="checkout-time-label">
                        <i className="fas fa-clock"></i>
                        Available Pickup Times
                      </label>
                      
                      {loadingSlots.collect ? (
                        <div className="checkout-loading-state">
                          <div className="checkout-loading-spinner"></div>
                          <p>Loading available slots...</p>
                        </div>
                      ) : collectSlots.length === 0 ? (
                        <div className="checkout-empty-state">
                          <i className="fas fa-calendar-times"></i>
                          <p>No slots available for this date</p>
                        </div>
                      ) : (
                        <div className="checkout-time-slots-grid">
                          {collectSlots.map((slot, index) => (
                            <button
                              key={`collect-${slot.start}-${index}`}
                              type="button"
                              className={`checkout-time-slot ${
                                selectedCollectSlot?.start === slot.start ? "selected" : ""
                              } ${!slot.enabled ? "disabled" : ""}`}
                              onClick={() => handleCollectSlotSelect(slot)}
                              disabled={!slot.enabled}
                            >
                              <span className="checkout-slot-time">{formatTimeRange24Hour(slot.start, slot.end)}</span>
                              {selectedCollectSlot?.start === slot.start && (
                                <i className="fas fa-check checkout-slot-check"></i>
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      {selectedCollectSlot && (
                        <div className="checkout-selected-slot-info">
                          <div className="checkout-selected-slot-header">
                            <i className="fas fa-check-circle"></i>
                            <span>Pickup Scheduled</span>
                          </div>
                          <div className="checkout-selected-slot-details">
                            {formatDateDDMMYYYY(collectDate)} at {formatTimeRange24Hour(selectedCollectSlot.start, selectedCollectSlot.end)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Delivery Section */}
                <div className="checkout-schedule-section">
                  <div className="checkout-schedule-header">
                    <div className="checkout-schedule-icon delivery">
                      <i className="fas fa-truck"></i>
                    </div>
                    <div>
                      <h3 className="checkout-schedule-title">Delivery</h3>
                      <p className="checkout-section-subtitle">When should we return your laundry?</p>
                    </div>
                  </div>

                  <div className="checkout-date-section">
                    <label className="checkout-date-label">
                      <i className="fas fa-calendar-day"></i>
                      Delivery Date
                    </label>
                    <div className="checkout-date-input-container">
                      <input
                        type="date"
                        className="checkout-date-input"
                        value={deliverDate}
                        onChange={handleDeliverDateChange}
                        min={minDeliveryDate}
                        disabled={!collectDate}
                      />
                      <i className="fas fa-calendar-alt checkout-date-icon"></i>
                    </div>
                    {!collectDate && (
                      <p className="checkout-date-hint">
                        <i className="fas fa-info-circle"></i>
                        Select pickup date first
                      </p>
                    )}
                    {deliverDate && (
                      <p className="checkout-date-display">
                        <i className="fas fa-check-circle"></i>
                        Selected: {formatDateDDMMYYYY(deliverDate)}
                      </p>
                    )}
                  </div>

                  {deliverDate && (
                    <div className="checkout-time-slots-section">
                      <label className="checkout-time-label">
                        <i className="fas fa-clock"></i>
                        Available Delivery Times
                      </label>
                      
                      {loadingSlots.deliver ? (
                        <div className="checkout-loading-state">
                          <div className="checkout-loading-spinner"></div>
                          <p>Loading available slots...</p>
                        </div>
                      ) : deliverSlots.length === 0 ? (
                        <div className="checkout-empty-state">
                          <i className="fas fa-calendar-times"></i>
                          <p>No slots available for this date</p>
                        </div>
                      ) : (
                        <div className="checkout-time-slots-grid">
                          {deliverSlots.map((slot, index) => (
                            <button
                              key={`deliver-${slot.start}-${index}`}
                              type="button"
                              className={`checkout-time-slot ${
                                selectedDeliverSlot?.start === slot.start ? "selected" : ""
                              } ${!slot.enabled ? "disabled" : ""}`}
                              onClick={() => handleDeliverSlotSelect(slot)}
                              disabled={!slot.enabled}
                            >
                              <span className="checkout-slot-time">{formatTimeRange24Hour(slot.start, slot.end)}</span>
                              {selectedDeliverSlot?.start === slot.start && (
                                <i className="fas fa-check checkout-slot-check"></i>
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      {selectedDeliverSlot && (
                        <div className="checkout-selected-slot-info">
                          <div className="checkout-selected-slot-header">
                            <i className="fas fa-check-circle"></i>
                            <span>Delivery Scheduled</span>
                          </div>
                          <div className="checkout-selected-slot-details">
                            {formatDateDDMMYYYY(deliverDate)} at {formatTimeRange24Hour(selectedDeliverSlot.start, selectedDeliverSlot.end)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <div className="checkout-section-icon">
                  <i className="fas fa-sticky-note"></i>
                </div>
                <div>
                  <h2 className="checkout-section-title">Special Instructions</h2>
                  <p className="checkout-section-subtitle">Any specific requirements for our team?</p>
                </div>
              </div>

              <div className="checkout-notes-container">
                <textarea
                  className="checkout-notes-input"
                  placeholder="Example: Please ring bell twice, fragile items, specific handling instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                  rows={3}
                />
                <div className="checkout-notes-footer">
                  <div className="checkout-notes-hint">
                    <i className="fas fa-lightbulb"></i>
                    Optional but helpful for better service
                  </div>
                  {notes.length > 0 && (
                    <div className="checkout-notes-counter">
                      {notes.length}/500 characters
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Section - ALWAYS SHOW PAYMENT */}
            {!showPaymentSetup && (
              <div className="checkout-card">
                <div className="checkout-card-header">
                  <div className="checkout-section-icon">
                    <i className="fas fa-credit-card"></i>
                  </div>
                  <div>
                    <h2 className="checkout-section-title">Payment Method</h2>
                    <p className="checkout-section-subtitle">Payment is required to confirm your booking</p>
                  </div>
                  <div className="checkout-security-badge">
                    <i className="fas fa-shield-alt"></i>
                    <span>Secure Payment</span>
                  </div>
                </div>

                {userToken && loadingCards ? (
                  <div className="checkout-loading-cards">
                    <div className="checkout-loading-spinner"></div>
                    <p>Loading your saved cards...</p>
                  </div>
                ) : userToken && savedCards.length > 0 ? (
                  <>
                    <div className="checkout-saved-cards-section">
                      <h3 className="checkout-saved-cards-title">
                        <i className="fas fa-credit-card"></i>
                        Your Saved Cards
                      </h3>
                      <p className="checkout-saved-cards-subtitle">Select a card or add a new one</p>
                      
                      <div className="checkout-cards-list">
                        {savedCards.map((card) => (
                          <div
                            key={card.id}
                            className={`checkout-card-option ${
                              selectedCard === card.id ? "selected" : ""
                            }`}
                            onClick={() => setSelectedCard(card.id)}
                          >
                            <div className="checkout-card-option-icon">
                              <i className={`${getCardBrandIcon(card.brand)} ${getCardBrandClass(card.brand)}`}></i>
                            </div>
                            <div className="checkout-card-option-details">
                              <div className="checkout-card-brand">{card.brand?.toUpperCase() || 'CARD'}</div>
                              <div className="checkout-card-number">•••• {card.last4}</div>
                              {card.is_default && (
                                <div className="checkout-card-default">
                                  <i className="fas fa-check-circle"></i>
                                  Default Card
                                </div>
                              )}
                            </div>
                            {selectedCard === card.id && (
                              <div className="checkout-card-selected">
                                <i className="fas fa-check-circle"></i>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="checkout-add-card-option" onClick={handleUseAnotherCard}>
                        <div className="checkout-add-card-icon">
                          <i className="fas fa-plus-circle"></i>
                        </div>
                        <div className="checkout-add-card-text">
                          <h4>Use New Card</h4>
                          <p>Save a different card for future payments</p>
                        </div>
                        <div className="checkout-add-card-arrow">
                          <i className="fas fa-chevron-right"></i>
                        </div>
                      </div>
                    </div>

                    <div className="checkout-payment-info">
                      <div className="checkout-payment-info-icon">
                        <i className="fas fa-info-circle"></i>
                      </div>
                      <div className="checkout-payment-info-text">
                        Your card will only be charged after your laundry manager sends the invoice. 
                        No charges will be made now.
                      </div>
                    </div>

                    <div className="checkout-payment-actions">
                      <button 
                        className="checkout-primary-btn checkout-book-btn" 
                        onClick={handleSavedCardBooking}
                        disabled={!isBookingValid() || !selectedCard || loading}
                      >
                        {loading ? (
                          <>
                            <div className="checkout-btn-spinner"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check-circle"></i>
                            Confirm Order with Selected Card
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="checkout-payment-options">
                      <div className="checkout-payment-option">
                        <div className="checkout-payment-icon">
                          <i className="fas fa-credit-card"></i>
                        </div>
                        <div className="checkout-payment-content">
                          <h3 className="checkout-payment-title">Save Card for Faster Checkout</h3>
                          <p className="checkout-payment-description">
                            Securely save your card with Stripe. No charges until your laundry manager sends the invoice.
                          </p>
                        </div>
                        <div className="checkout-payment-toggle">
                          <label className="checkout-switch">
                            <input
                              type="checkbox"
                              checked={saveCardOption}
                              onChange={(e) => setSaveCardOption(e.target.checked)}
                            />
                            <span className="checkout-switch-slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="checkout-payment-info">
                      <div className="checkout-payment-info-icon">
                        <i className="fas fa-info-circle"></i>
                      </div>
                      <div className="checkout-payment-info-text">
                        <strong>Payment Required:</strong> A valid card must be saved to confirm your booking. 
                        No charges will be made now - your card will only be charged after service completion when the invoice is sent.
                      </div>
                    </div>

                    <div className="checkout-payment-actions">
                      <button 
                        className="checkout-primary-btn checkout-book-btn" 
                        onClick={handleUseAnotherCard}
                        disabled={!isBookingValid() || loading || setupProcessing}
                      >
                        {loading || setupProcessing ? (
                          <>
                            <div className="checkout-btn-spinner"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-lock"></i>
                            Save Card & Confirm Order
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}

                <div className="checkout-cancel-section">
                  <button
                    className="checkout-secondary-btn"
                    onClick={() => navigate("/services")}
                    disabled={loading || setupProcessing}
                  >
                    <i className="fas fa-times"></i>
                    Cancel Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Section (Fixed at bottom on mobile) */}
        <div className="checkout-summary-section">
          <div className="checkout-summary-content">
            <div className="checkout-summary-info">
              <div className="checkout-summary-item">
                <i className="fas fa-shopping-bag"></i>
                <span>{calculateItemCount()} items: {formatPrice(finalTotal || calculateCartTotal())}</span>
              </div>
              <div className="checkout-summary-item">
                <i className="fas fa-calendar"></i>
                <span>Pickup: {selectedCollectSlot ? formatDateDDMMYYYY(collectDate) : "Not selected"}</span>
              </div>
              <div className="checkout-summary-item">
                <i className="fas fa-truck"></i>
                <span>Delivery: {selectedDeliverSlot ? formatDateDDMMYYYY(deliverDate) : "Not selected"}</span>
              </div>
            </div>
            <div className="checkout-summary-action">
              <button 
                className="checkout-primary-btn checkout-confirm-btn"
                onClick={userToken && savedCards.length > 0 && selectedCard ? handleSavedCardBooking : handleUseAnotherCard}
                disabled={!isBookingValid() || loading || setupProcessing}
              >
                {loading ? (
                  <>
                    <div className="checkout-btn-spinner"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle"></i>
                    Confirm Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stripe Payment Modal */}
      {showPaymentSetup && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret: setupClientSecret,
            appearance: { theme: "stripe" },
          }}
        >
          <StripeSetupForm
            onSetupSuccess={handleSetupSuccess}
            onSetupError={handleSetupError}
            onCancel={handlePaymentModalCancel}
            setupProcessing={setupProcessing}
            userToken={userToken}
          />
        </Elements>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`checkout-toast checkout-toast-${toast.type}`}>
          <div className="checkout-toast-icon">
            {toast.type === 'success' ? (
              <i className="fas fa-check-circle"></i>
            ) : toast.type === 'error' ? (
              <i className="fas fa-exclamation-circle"></i>
            ) : (
              <i className="fas fa-info-circle"></i>
            )}
          </div>
          <div className="checkout-toast-message">{toast.msg}</div>
          <button className="checkout-toast-close" onClick={() => setToast(null)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
    </div>
  );
}

src/components/Checkout.jsx





// import React, { useEffect, useState, useCallback } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import "./Checkout.css";

// const API_BASE = "https://api.ironingboy.com";

// /* -------------------------------------------------------------------------- */
// /*                           Main Checkout Component                          */
// /* -------------------------------------------------------------------------- */
// export default function Checkout() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user, login } = useAuth();

//   // Cart data from ServicePricing
//   const { cart: initialCart = [] } = location.state || {};

//   // State management
//   const [cartItems, setCartItems] = useState(initialCart);
//   const [loading, setLoading] = useState(false);
//   const [toast, setToast] = useState(null);
//   const [savedCards, setSavedCards] = useState([]);
//   const [loadingCards, setLoadingCards] = useState(true);
//   const [userToken, setUserToken] = useState(localStorage.getItem("jwtToken"));
//   const [showAddressForm, setShowAddressForm] = useState(false);
//   const [showPickupAddressForm, setShowPickupAddressForm] = useState(false);

//   // Payment option
//   const [saveCardOption, setSaveCardOption] = useState(true);
//   const [selectedCard, setSelectedCard] = useState(null);

//   // Time slots state
//   const [loadingSlots, setLoadingSlots] = useState({
//     collect: false,
//     deliver: false,
//   });
//   const [collectSlots, setCollectSlots] = useState([]);
//   const [deliverSlots, setDeliverSlots] = useState([]);
//   const [selectedCollectSlot, setSelectedCollectSlot] = useState(null);
//   const [selectedDeliverSlot, setSelectedDeliverSlot] = useState(null);
//   const [selectedCollectSlotStart, setSelectedCollectSlotStart] = useState(null);
//   const [selectedCollectSlotEnd, setSelectedCollectSlotEnd] = useState(null);
//   const [selectedDeliverSlotStart, setSelectedDeliverSlotStart] = useState(null);
//   const [selectedDeliverSlotEnd, setSelectedDeliverSlotEnd] = useState(null);

//   // User info and addresses
//   const [userInfo, setUserInfo] = useState(() => {
//     if (user) {
//       return {
//         name: user.name || "",
//         email: user.email || "",
//         phone: user.phone || "",
//       };
//     }
//     return {
//       name: "",
//       email: "",
//       phone: "",
//     };
//   });
  
//   const [addresses, setAddresses] = useState([]);
//   const [selectedAddressId, setSelectedAddressId] = useState(null);
//   const [useSameAddress, setUseSameAddress] = useState(true);
//   const [selectedPickupAddressId, setSelectedPickupAddressId] = useState(null);
//   const [pickupAddresses, setPickupAddresses] = useState([]);

//   // Address form for all users
//   const [addressForm, setAddressForm] = useState({
//     street_address: "",
//     postcode: "",
//     city: "",
//     additional_details: "",
//     house_number: ""
//   });

//   // Pickup address form (when useSameAddress is false)
//   const [pickupAddressForm, setPickupAddressForm] = useState({
//     street_address: "",
//     postcode: "",
//     city: "",
//     additional_details: "",
//     house_number: ""
//   });

//   // Form state
//   const [collectDate, setCollectDate] = useState("");
//   const [deliverDate, setDeliverDate] = useState("");
//   const [notes, setNotes] = useState("");

//   // Discount and charges state (from Flutter app)
//   const [discountData, setDiscountData] = useState(null);
//   const [discountPercent, setDiscountPercent] = useState(0);
//   const [discountAmount, setDiscountAmount] = useState(0);
//   const [serviceCharge, setServiceCharge] = useState(0);
//   const [topupAmount, setTopupAmount] = useState(0);
//   const [minimumOrderAmount, setMinimumOrderAmount] = useState(0);
//   const [finalTotal, setFinalTotal] = useState(0);
//   const [discountApplied, setDiscountApplied] = useState(false);
//   const [calculatingDiscount, setCalculatingDiscount] = useState(false);

//   // Constants
//   const today = new Date().toISOString().split("T")[0];

//   // Show toast notification
//   const showToast = useCallback((msg, type = "info") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3000);
//   }, []);

//   /* --------------------------- Helper Functions --------------------------- */
//   const formatTime24Hour = (timeString) => {
//     if (!timeString) return "";
//     try {
//       const date = new Date(timeString);
//       if (isNaN(date.getTime())) return timeString;
//       const hours = String(date.getHours()).padStart(2, '0');
//       const minutes = String(date.getMinutes()).padStart(2, '0');
//       return `${hours}:${minutes}`;
//     } catch {
//       return timeString;
//     }
//   };

//   const formatTimeRange24Hour = (startTime, endTime) => {
//     const start = formatTime24Hour(startTime);
//     const end = formatTime24Hour(endTime);
//     if (start && end) return `${start}-${end}`;
//     return start || end || "";
//   };

//   const formatDateDDMMYYYY = (dateString) => {
//     if (!dateString) return "";
//     try {
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) return dateString;
//       const day = String(date.getDate()).padStart(2, '0');
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const year = date.getFullYear();
//       return `${day}/${month}/${year}`;
//     } catch {
//       return dateString;
//     }
//   };

//   const getCardBrandClass = (brand) => {
//     if (!brand) return 'card-brand-unknown';
//     const brandLower = brand.toLowerCase();
//     if (brandLower.includes('visa')) return 'card-brand-visa';
//     if (brandLower.includes('mastercard')) return 'card-brand-mastercard';
//     if (brandLower.includes('amex') || brandLower.includes('american express')) return 'card-brand-amex';
//     if (brandLower.includes('discover')) return 'card-brand-discover';
//     return 'card-brand-unknown';
//   };

//   const getCardBrandIcon = (brand) => {
//     const brandLower = brand?.toLowerCase() || '';
//     if (brandLower.includes('visa')) return 'fab fa-cc-visa';
//     if (brandLower.includes('mastercard')) return 'fab fa-cc-mastercard';
//     if (brandLower.includes('amex') || brandLower.includes('american express')) return 'fab fa-cc-amex';
//     if (brandLower.includes('discover')) return 'fab fa-cc-discover';
//     return 'fas fa-credit-card';
//   };

//   const formatPrice = (price) => {
//     return `£${Number(price).toFixed(2)}`;
//   };

//   // Calculate cart totals
//   const calculateCartTotal = useCallback(() => {
//     return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
//   }, [cartItems]);

//   const calculateItemCount = useCallback(() => {
//     return cartItems.reduce((count, item) => count + item.quantity, 0);
//   }, [cartItems]);

//   /* ---------------------------- Data Fetching ----------------------------- */
  
//   // Check if phone number exists and auto-fill user info
//   const checkPhoneNumberExists = useCallback(async (phone) => {
//     if (!phone || phone.trim().length < 5) return;
    
//     try {
//       const response = await fetch(`${API_BASE}/check-phone`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ phone: phone.trim() }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         if (data.exists && data.user) {
//           // Auto-fill user info
//           setUserInfo(prev => ({
//             ...prev,
//             name: data.user.name || prev.name,
//             email: data.user.email || prev.email,
//             phone: data.user.phone || prev.phone,
//           }));
          
//           showToast("Welcome back! Your details have been auto-filled.", "success");
          
//           // If user is found but not logged in, log them in
//           if (data.token && !userToken) {
//             localStorage.setItem("jwtToken", data.token);
//             setUserToken(data.token);
//             login({
//               id: data.user.id,
//               name: data.user.name,
//               email: data.user.email,
//               phone: data.user.phone,
//             });
            
//             // Fetch their saved data
//             fetchUserProfile();
//             fetchAddresses();
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error checking phone number:", error);
//     }
//   }, [showToast, userToken, login]);

//   const fetchUserProfile = useCallback(async () => {
//     if (!userToken) return;
    
//     try {
//       const response = await fetch(`${API_BASE}/profile`, {
//         headers: {
//           "Authorization": `Bearer ${userToken}`,
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setUserInfo({
//           name: data.name || "",
//           email: data.email || "",
//           phone: data.phone || "",
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching user profile:", error);
//     }
//   }, [userToken]);

//   const fetchAddresses = useCallback(async () => {
//     if (!userToken) return;
    
//     try {
//       const response = await fetch(`${API_BASE}/addresses`, {
//         headers: {
//           "Authorization": `Bearer ${userToken}`,
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setAddresses(data);
//         setPickupAddresses(data); // Also set pickup addresses
        
//         if (data.length > 0) {
//           const defaultAddress = data.find(addr => addr.is_selected) || data[0];
//           if (defaultAddress) {
//             const id = String(defaultAddress.address_id);
//             setSelectedAddressId(id);
//             setSelectedPickupAddressId(id);
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching addresses:", error);
//     }
//   }, [userToken]);

//   // Add pickup address
//   const addPickupAddress = useCallback(async () => {
//     if (!userToken) {
//       showToast("Please log in to save pickup address", "error");
//       return null;
//     }

//     try {
//       const response = await fetch(`${API_BASE}/addresses`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${userToken}`,
//         },
//         body: JSON.stringify({
//           street_address: pickupAddressForm.street_address,
//           postcode: pickupAddressForm.postcode,
//           city: pickupAddressForm.city,
//           additional_details: pickupAddressForm.additional_details,
//           house_number: pickupAddressForm.house_number,
//           name: "Pickup Location",
//           is_selected: false,
//         }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         showToast("Pickup address saved successfully", "success");
        
//         // Refresh addresses list
//         fetchAddresses();
        
//         // Select the new address
//         setSelectedPickupAddressId(String(data.address_id));
//         setShowPickupAddressForm(false);
        
//         return data.address_id;
//       } else {
//         throw new Error("Failed to save pickup address");
//       }
//     } catch (error) {
//       console.error("Error adding pickup address:", error);
//       showToast(error.message || "Failed to save pickup address", "error");
//       return null;
//     }
//   }, [userToken, pickupAddressForm, showToast, fetchAddresses]);

//   /* -------------------------- Discount Calculation ------------------------- */
//   const calculateDiscount = useCallback(async (subtotal) => {
//     if (!userToken) {
//       // For non-logged-in users, just calculate basic total
//       setDiscountApplied(false);
//       setDiscountPercent(0);
//       setDiscountAmount(0);
//       setServiceCharge(0);
//       setTopupAmount(0);
//       setMinimumOrderAmount(0);
//       setFinalTotal(subtotal);
//       return;
//     }

//     setCalculatingDiscount(true);

//     try {
//       const response = await fetch(`${API_BASE}/calculate-discount?amount=${subtotal}`, {
//         headers: {
//           "Authorization": `Bearer ${userToken}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setDiscountData(data);
        
//         if (data.success === true) {
//           setDiscountPercent(data.discountPercent || 0);
//           setDiscountAmount(data.discountAmount || 0);
//           setServiceCharge(data.serviceCharge || 0);
//           setMinimumOrderAmount(data.minimumOrderAmount || 0);
//           setTopupAmount(data.topupAmount || 0);
//           setFinalTotal(data.finalTotal || subtotal);
//           setDiscountApplied(true);
//         } else {
//           setDiscountApplied(false);
//           setDiscountPercent(0);
//           setDiscountAmount(0);
//           setServiceCharge(data.serviceCharge || 0);
//           setMinimumOrderAmount(data.minimumOrderAmount || 0);
//           setTopupAmount(data.topupAmount || 0);
//           setFinalTotal(data.finalTotal || subtotal);
//         }
//       } else {
//         // Fallback values if API fails
//         setDiscountApplied(false);
//         setDiscountPercent(0);
//         setDiscountAmount(0);
//         setServiceCharge(0);
//         setTopupAmount(0);
//         setMinimumOrderAmount(0);
//         setFinalTotal(subtotal);
//       }
//     } catch (error) {
//       console.error("Error calculating discount:", error);
//       // Fallback values
//       setDiscountApplied(false);
//       setDiscountPercent(0);
//       setDiscountAmount(0);
//       setServiceCharge(0);
//       setTopupAmount(0);
//       setMinimumOrderAmount(0);
//       setFinalTotal(subtotal);
//     } finally {
//       setCalculatingDiscount(false);
//     }
//   }, [userToken]);

//   /* -------------------------- TIME SLOT FUNCTIONS ------------------------- */
//   const getPostcodeForTimeSlots = useCallback((type = 'pickup') => {
//     if (type === 'pickup') {
//       if (useSameAddress) {
//         // Use delivery address for pickup when same address
//         if (userToken && addresses.length > 0 && selectedAddressId) {
//           const selectedAddress = addresses.find(addr => String(addr.address_id) === selectedAddressId);
//           return selectedAddress?.postcode || null;
//         } else {
//           return addressForm.postcode || null;
//         }
//       } else {
//         // Use pickup address
//         if (userToken && pickupAddresses.length > 0 && selectedPickupAddressId && selectedPickupAddressId !== "new") {
//           const selectedPickupAddress = pickupAddresses.find(addr => String(addr.address_id) === selectedPickupAddressId);
//           return selectedPickupAddress?.postcode || null;
//         } else if (userToken && selectedPickupAddressId === "new") {
//           return pickupAddressForm.postcode || null;
//         } else if (!userToken) {
//           return pickupAddressForm.postcode || null;
//         }
//       }
//     } else if (type === 'delivery') {
//       // Always use delivery address for delivery slots
//       if (userToken && addresses.length > 0 && selectedAddressId) {
//         const selectedAddress = addresses.find(addr => String(addr.address_id) === selectedAddressId);
//         return selectedAddress?.postcode || null;
//       } else {
//         return addressForm.postcode || null;
//       }
//     }
//     return null;
//   }, [
//     userToken, 
//     addresses, 
//     selectedAddressId, 
//     addressForm, 
//     useSameAddress, 
//     pickupAddresses, 
//     selectedPickupAddressId, 
//     pickupAddressForm
//   ]);

//   const fetchTimeSlots = useCallback(async (dateIso, isDelivery = false) => {
//     if (!dateIso) return [];

//     const tzOffset = -new Date().getTimezoneOffset();
//     const formattedDate = dateIso;
    
//     const params = new URLSearchParams({
//       date: formattedDate,
//       format: "24",
//       tzOffset: tzOffset.toString(),
//     });

//     if (isDelivery) {
//       params.set("isDelivery", "true");

//       if (collectDate && selectedCollectSlotStart) {
//         const pickupFormattedDate = collectDate;
//         const h = selectedCollectSlotStart.getHours().toString().padStart(2, "0");
//         const m = selectedCollectSlotStart.getMinutes().toString().padStart(2, "0");
//         params.set("pickupDate", pickupFormattedDate);
//         params.set("pickupSlotStart", `${h}:${m}`);
//       }
//     }

//     // Get postcode based on pickup/delivery type
//     const postcode = getPostcodeForTimeSlots(isDelivery ? 'delivery' : 'pickup');
    
//     // Add postcode to params if available (remove spaces and uppercase as per Flutter code)
//     if (postcode) {
//       const cleanPostcode = postcode.replace(/\s/g, '').toUpperCase();
//       params.set("postcode", cleanPostcode);
//     }

//     try {
//       const response = await fetch(`${API_BASE}/time-slots?${params.toString()}`, {
//         method: 'GET',
//         headers: {
//           'Accept': 'application/json',
//           'Content-Type': 'application/json',
//         },
//       });
      
//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error("Server error:", errorText);
//         throw new Error(`Failed to fetch slots: ${response.status}`);
//       }

//       const data = await response.json();
      
//       if (data.slots && Array.isArray(data.slots)) {
//         return data.slots;
//       } else if (Array.isArray(data)) {
//         return data;
//       } else {
//         console.warn("Unexpected response format, returning empty array");
//         return [];
//       }
//     } catch (error) {
//       console.error("Error fetching time slots:", error);
//       showToast(`Error loading time slots: ${error.message}`, "error");
//       return [];
//     }
//   }, [collectDate, selectedCollectSlotStart, showToast, getPostcodeForTimeSlots]);

//   const fetchCollectSlots = useCallback(async () => {
//     if (!collectDate) return;
    
//     setLoadingSlots(prev => ({ ...prev, collect: true }));
    
//     try {
//       const slots = await fetchTimeSlots(collectDate, false);
//       setCollectSlots(slots);

//       if (selectedCollectSlot && slots.length > 0) {
//         const stillValid = slots.find(
//           (s) => s.start === selectedCollectSlot.start && s.enabled
//         );
//         if (!stillValid) {
//           setSelectedCollectSlot(null);
//           setSelectedCollectSlotStart(null);
//           setSelectedCollectSlotEnd(null);
//         }
//       }
//     } catch (error) {
//       console.error("Error in fetchCollectSlots:", error);
//       showToast("Failed to load pickup time slots. Please try again.", "error");
//       setCollectSlots([]);
//     } finally {
//       setLoadingSlots(prev => ({ ...prev, collect: false }));
//     }
//   }, [collectDate, fetchTimeSlots, selectedCollectSlot, showToast]);

//   const fetchDeliverySlots = useCallback(async () => {
//     if (!deliverDate || !collectDate || !selectedCollectSlotStart) {
//       return;
//     }
    
//     setLoadingSlots(prev => ({ ...prev, deliver: true }));
    
//     try {
//       const slots = await fetchTimeSlots(deliverDate, true);
//       setDeliverSlots(slots);

//       if (selectedDeliverSlot && slots.length > 0) {
//         const stillValid = slots.find(
//           (s) => s.start === selectedDeliverSlot.start && s.enabled
//         );
//         if (!stillValid) {
//           setSelectedDeliverSlot(null);
//           setSelectedDeliverSlotStart(null);
//           setSelectedDeliverSlotEnd(null);
//         }
//       }
//     } catch (error) {
//       console.error("Error in fetchDeliverySlots:", error);
//       showToast("Failed to load delivery time slots. Please try again.", "error");
//       setDeliverSlots([]);
//     } finally {
//       setLoadingSlots(prev => ({ ...prev, deliver: false }));
//     }
//   }, [deliverDate, collectDate, selectedCollectSlotStart, fetchTimeSlots, selectedDeliverSlot, showToast]);

//   /* ------------------------- Order Preparation ---------------------------- */
//   const prepareOrderData = useCallback(async () => {
//     if (!selectedCollectSlot || !selectedDeliverSlot || !collectDate || !deliverDate) {
//       return null;
//     }

//     const pickupSlotText = `${formatDateDDMMYYYY(collectDate)}, ${formatTimeRange24Hour(
//       selectedCollectSlot.start,
//       selectedCollectSlot.end
//     )}`;

//     const deliverySlotText = `${formatDateDDMMYYYY(deliverDate)}, ${formatTimeRange24Hour(
//       selectedDeliverSlot.start,
//       selectedDeliverSlot.end
//     )}`;

//     // Get delivery address details
//     let deliveryAddressData = {};
//     if (userToken && addresses.length > 0 && selectedAddressId) {
//       const selectedAddress = addresses.find(addr => 
//         String(addr.address_id) === selectedAddressId
//       );
//       deliveryAddressData = {
//         address_id: selectedAddressId,
//         street_address: selectedAddress?.full_address || "",
//         postcode: selectedAddress?.postcode || "",
//         city: selectedAddress?.city || "",
//         house_number: selectedAddress?.house_number || "",
//         full_address: selectedAddress?.full_address || "",
//       };
//     } else {
//       deliveryAddressData = {
//         street_address: addressForm.street_address,
//         postcode: addressForm.postcode,
//         city: addressForm.city || "",
//         full_address: addressForm.street_address,
//         additional_details: addressForm.additional_details || "",
//         house_number: addressForm.house_number || "",
//       };
//     }

//     // Get pickup address details
//     let pickupAddressData = {};
//     if (useSameAddress) {
//       pickupAddressData = { ...deliveryAddressData };
//     } else if (userToken && pickupAddresses.length > 0 && selectedPickupAddressId) {
//       const selectedPickupAddress = pickupAddresses.find(addr => 
//         String(addr.address_id) === selectedPickupAddressId
//       );
//       if (selectedPickupAddress) {
//         pickupAddressData = {
//           pickup_address_id: selectedPickupAddressId,
//           pickup_street_address: selectedPickupAddress.full_address || "",
//           pickup_postcode: selectedPickupAddress.postcode || "",
//           pickup_city: selectedPickupAddress.city || "",
//           pickup_full_address: selectedPickupAddress.full_address || "",
//         };
//       }
//     } else if (!userToken || showPickupAddressForm) {
//       pickupAddressData = {
//         pickup_street_address: pickupAddressForm.street_address,
//         pickup_postcode: pickupAddressForm.postcode,
//         pickup_city: pickupAddressForm.city || "",
//         pickup_full_address: pickupAddressForm.street_address,
//         pickup_additional_details: pickupAddressForm.additional_details || "",
//         pickup_house_number: pickupAddressForm.house_number || "",
//       };
//     }

//     // Prepare cart items for API - match Flutter's payload structure
//     const orderItems = cartItems.map(item => ({
//       product_id: item.id,
//       quantity: item.quantity,
//       price_at_purchase: item.price,
//     }));

//     // Calculate subtotal
//     const subtotal = calculateCartTotal();

//     return {
//       address_id: deliveryAddressData.address_id || null,
//       pickup_address_id: useSameAddress ? (deliveryAddressData.address_id || null) : (pickupAddressData.pickup_address_id || null),
//       use_same_address: useSameAddress,
//       items: orderItems,
//       subtotal: subtotal,
//       discount_percent: discountPercent,
//       discount_amount: discountAmount,
//       service_charge: serviceCharge,
//       tip: 0, // No tip in this flow
//       topup_amount: topupAmount,
//       total: finalTotal,
//       collect_slot: pickupSlotText,
//       delivery_slot: deliverySlotText,
//       notes: notes.trim() || null,
//       images: [], // No images in this flow
//       change_manager_requested: false,
//       name: userInfo.name,
//       email: userInfo.email,
//       phone: userInfo.phone,
//       payment_method: "cash_on_delivery", // For testing - will be changed to "card" when Stripe is added back
//       payment_status: "pending",
//     };
//   }, [
//     selectedCollectSlot,
//     selectedDeliverSlot,
//     collectDate,
//     deliverDate,
//     userToken,
//     addresses,
//     selectedAddressId,
//     pickupAddresses,
//     selectedPickupAddressId,
//     useSameAddress,
//     addressForm,
//     pickupAddressForm,
//     showPickupAddressForm,
//     notes,
//     userInfo,
//     cartItems,
//     calculateCartTotal,
//     discountPercent,
//     discountAmount,
//     serviceCharge,
//     topupAmount,
//     finalTotal,
//   ]);

//   /* ------------------------- Main Booking Flow ---------------------------- */
//   const placeOrder = async () => {
//     setLoading(true);
    
//     try {
//       // 1️⃣ Prepare order data
//       const order = await prepareOrderData();
//       if (!order) throw new Error("Please select pickup and delivery times");

//       // Validate pickup address when useSameAddress is false
//       if (!useSameAddress) {
//         if (userToken && (!selectedPickupAddressId || selectedPickupAddressId === "new")) {
//           if (selectedPickupAddressId === "new" && !showPickupAddressForm) {
//             setShowPickupAddressForm(true);
//             showToast("Please add pickup address details", "info");
//             setLoading(false);
//             return;
//           }
          
//           if (showPickupAddressForm) {
//             if (!pickupAddressForm.street_address.trim() || !pickupAddressForm.postcode.trim()) {
//               throw new Error("Please complete pickup address details");
//             }
            
//             // Add the new pickup address
//             const newAddressId = await addPickupAddress();
//             if (!newAddressId) {
//               throw new Error("Failed to save pickup address");
//             }
//           } else if (!selectedPickupAddressId) {
//             throw new Error("Please select a pickup address");
//           }
//         } else if (!userToken) {
//           if (!pickupAddressForm.street_address.trim() || !pickupAddressForm.postcode.trim()) {
//             throw new Error("Please complete pickup address details");
//           }
//         }
//       }

//       console.log("Creating order:", order);

//       // 2️⃣ Create order - Use the /api/orders endpoint like Flutter app
//       const response = await fetch(`${API_BASE}/api/orders`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${userToken}`,
//         },
//         body: JSON.stringify(order),
//       });

//       // Handle response
//       const contentType = response.headers.get("content-type");
//       let orderData;
      
//       if (contentType && contentType.includes("application/json")) {
//         orderData = await response.json();
//       } else {
//         const textResponse = await response.text();
//         console.error("Non-JSON response received:", textResponse);
//         throw new Error(`Server error: ${response.status} ${response.statusText}`);
//       }

//       if (!response.ok) {
//         throw new Error(orderData.message || orderData.error || "Failed to create order");
//       }

//       showToast("Order placed successfully!", "success");
      
//       // Clear cart from localStorage
//       localStorage.removeItem('laundryCart');
      
//       // Show top-up message if applicable
//       if (topupAmount > 0) {
//         showToast(
//           `A top-up of £${topupAmount.toFixed(2)} has been added to meet the £${minimumOrderAmount.toFixed(2)} minimum order value.`,
//           "info"
//         );
//       }

//       setTimeout(() => {
//         navigate("/thankyou", {
//           state: {
//             orderId: orderData.order_id || orderData.id,
//             paymentStatus: "pending",
//             paymentMethod: "cash_on_delivery",
//             pickupDate: formatDateDDMMYYYY(collectDate),
//             pickupTime: formatTimeRange24Hour(selectedCollectSlot.start, selectedCollectSlot.end),
//             deliveryDate: formatDateDDMMYYYY(deliverDate),
//             deliveryTime: formatTimeRange24Hour(selectedDeliverSlot.start, selectedDeliverSlot.end),
//             cartItems: cartItems,
//             subtotal: calculateCartTotal(),
//             discountAmount: discountAmount,
//             serviceCharge: serviceCharge,
//             topupAmount: topupAmount,
//             total: finalTotal,
//             message: "Your order has been placed successfully! Payment can be made on delivery.",
//           },
//         });
//       }, 1000);

//     } catch (error) {
//       console.error("Order error:", error);
      
//       // Show more specific error messages
//       let errorMessage = error.message;
//       if (error.message.includes("404")) {
//         errorMessage = "Order service is temporarily unavailable. Please try again later.";
//       } else if (error.message.includes("Failed to fetch")) {
//         errorMessage = "Network error. Please check your internet connection.";
//       } else if (error.message.includes("Server error")) {
//         errorMessage = "Server error. Please try again in a few moments.";
//       }
      
//       showToast(errorMessage || "Failed to place order", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle saved card booking for logged-in users with saved cards
//   const handleSavedCardBooking = async () => {
//     if (!selectedCard) {
//       showToast("Please select a card to use", "error");
//       return;
//     }

//     // Then place the order
//     await placeOrder();
//   };

//   // Handle "Use Another Card" for logged-in users
//   const handleUseAnotherCard = async () => {
//     try {
//       await placeOrder();
//     } catch (err) {
//       let errorMessage = err.message;
//       if (err.message.includes("404")) {
//         errorMessage = "Service unavailable. Please try again.";
//       }
//       showToast(errorMessage || "Failed to setup card", "error");
//     }
//   };

//   /* ---------------------------- UI Handlers ------------------------------- */
  
//   // Handle phone number change with auto-fill
//   const handlePhoneChange = (e) => {
//     const newPhone = e.target.value;
//     setUserInfo(prev => ({
//       ...prev,
//       phone: newPhone
//     }));
    
//     // Check if phone exists after user stops typing
//     if (newPhone && newPhone.trim().length >= 5) {
//       const timer = setTimeout(() => {
//         checkPhoneNumberExists(newPhone);
//       }, 1000);
//       return () => clearTimeout(timer);
//     }
//   };

//   const handleCollectDateChange = (e) => {
//     const newDate = e.target.value;
//     setCollectDate(newDate);
//     setSelectedCollectSlot(null);
//     setSelectedCollectSlotStart(null);
//     setSelectedCollectSlotEnd(null);
//     setSelectedDeliverSlot(null);
//     setSelectedDeliverSlotStart(null);
//     setSelectedDeliverSlotEnd(null);
//     setDeliverSlots([]);
//   };

//   const handleDeliverDateChange = (e) => {
//     const newDate = e.target.value;
    
//     if (collectDate && newDate < collectDate) {
//       showToast("Delivery date cannot be before pickup date", "error");
//       return;
//     }

//     setDeliverDate(newDate);
//     setSelectedDeliverSlot(null);
//     setSelectedDeliverSlotStart(null);
//     setSelectedDeliverSlotEnd(null);
//     setDeliverSlots([]);
//   };

//   const handleCollectSlotSelect = (slot) => {
//     if (!slot.enabled) return;
    
//     const start = new Date(slot.start);
//     const end = slot.end ? new Date(slot.end) : null;
    
//     setSelectedCollectSlot(slot);
//     setSelectedCollectSlotStart(start);
//     setSelectedCollectSlotEnd(end);

//     // Reset delivery when pickup changes
//     setSelectedDeliverSlot(null);
//     setSelectedDeliverSlotStart(null);
//     setSelectedDeliverSlotEnd(null);
//     setDeliverSlots([]);
//   };

//   const handleDeliverSlotSelect = (slot) => {
//     if (!slot.enabled) return;
    
//     const start = new Date(slot.start);
//     const end = slot.end ? new Date(slot.end) : null;
    
//     setSelectedDeliverSlot(slot);
//     setSelectedDeliverSlotStart(start);
//     setSelectedDeliverSlotEnd(end);
//   };

//   const handleToggleSameAddress = (e) => {
//     const checked = e.target.checked;
//     setUseSameAddress(checked);
//     if (checked && selectedAddressId) {
//       setSelectedPickupAddressId(selectedAddressId);
//       setShowPickupAddressForm(false);
//     }
//   };

//   // Handle pickup address selection
//   const handlePickupAddressSelect = (addressId) => {
//     if (addressId === "new") {
//       setShowPickupAddressForm(true);
//       setSelectedPickupAddressId("new");
//     } else {
//       setSelectedPickupAddressId(addressId);
//       setShowPickupAddressForm(false);
//     }
//   };

//   const handleUserInfoChange = (field) => (e) => {
//     setUserInfo(prev => ({
//       ...prev,
//       [field]: e.target.value
//     }));
//   };

//   const handleAddressFormChange = (field) => (e) => {
//     setAddressForm(prev => ({
//       ...prev,
//       [field]: e.target.value
//     }));
//   };

//   // Handle pickup address form changes
//   const handlePickupAddressFormChange = (field) => (e) => {
//     setPickupAddressForm(prev => ({
//       ...prev,
//       [field]: e.target.value
//     }));
//   };

//   const handleAddAddressClick = () => {
//     setShowAddressForm(true);
//     setAddressForm({
//       street_address: "",
//       postcode: "",
//       city: "",
//       additional_details: "",
//       house_number: ""
//     });
//   };

//   // Edit cart item quantity
//   const updateCartQuantity = (itemId, newQuantity) => {
//     setCartItems(prev => {
//       const updatedCart = prev.map(item =>
//         item.id === itemId
//           ? { ...item, quantity: Math.max(0, newQuantity) }
//           : item
//       ).filter(item => item.quantity > 0);
      
//       return updatedCart;
//     });
//   };

//   // Remove item from cart
//   const removeFromCart = (itemId) => {
//     setCartItems(prev => prev.filter(item => item.id !== itemId));
//   };

//   /* ---------------------------- Effects ----------------------------------- */
//   useEffect(() => {
//     if (userToken) {
//       fetchUserProfile();
//       fetchAddresses();
//       setLoadingCards(false);
//     } else {
//       setLoadingCards(false);
//     }
//   }, [userToken, fetchUserProfile, fetchAddresses]);

//   // Effect to fetch collect slots when collectDate changes
//   useEffect(() => {
//     if (collectDate) {
//       const timer = setTimeout(() => {
//         fetchCollectSlots();
//       }, 300);
//       return () => clearTimeout(timer);
//     }
//   }, [collectDate, fetchCollectSlots]);

//   // Effect to fetch delivery slots when deliverDate or pickup details change
//   useEffect(() => {
//     if (deliverDate && selectedCollectSlotStart) {
//       const timer = setTimeout(() => {
//         fetchDeliverySlots();
//       }, 300);
//       return () => clearTimeout(timer);
//     }
//   }, [deliverDate, selectedCollectSlotStart, fetchDeliverySlots]);

//   // Effect to calculate discount when cart changes
//   useEffect(() => {
//     const subtotal = calculateCartTotal();
//     const timer = setTimeout(() => {
//       calculateDiscount(subtotal);
//     }, 300); // Debounce to avoid too many API calls
    
//     return () => clearTimeout(timer);
//   }, [calculateCartTotal, userToken, calculateDiscount]);

//   // Calculate min delivery date
//   const minDeliveryDate = collectDate || today;

//   // Check if form is valid for booking
//   const isBookingValid = () => {
//     // Check cart has items
//     if (cartItems.length === 0) return false;
    
//     // Check user info
//     if (!userInfo.name.trim()) return false;
//     if (!userInfo.email.trim()) return false;
//     if (!userInfo.phone.trim()) return false;
    
//     // Check time slots
//     if (!selectedCollectSlot || !selectedDeliverSlot) return false;
    
//     // Delivery address validation
//     if (userToken && addresses.length > 0 && !showAddressForm) {
//       if (!selectedAddressId) return false;
//     } else {
//       if (!addressForm.street_address.trim()) return false;
//       if (!addressForm.postcode.trim()) return false;
//     }
    
//     // Pickup address validation (when useSameAddress is false)
//     if (!useSameAddress) {
//       if (userToken) {
//         if (!selectedPickupAddressId) return false;
//         if (selectedPickupAddressId === "new" && showPickupAddressForm) {
//           if (!pickupAddressForm.street_address.trim() || !pickupAddressForm.postcode.trim()) return false;
//         }
//       } else {
//         if (!pickupAddressForm.street_address.trim() || !pickupAddressForm.postcode.trim()) return false;
//       }
//     }
    
//     return true;
//   };

//   // Render cart summary with pricing breakdown
//   const renderCartSummary = () => {
//     const subtotal = calculateCartTotal();
    
//     return (
//       <div className="checkout-cart-summary">
//         <h3 className="checkout-cart-title">
//           <i className="fas fa-shopping-bag"></i>
//           Your Order ({calculateItemCount()} items)
//         </h3>
        
//         <div className="checkout-cart-items">
//           {cartItems.map(item => (
//             <div key={item.id} className="checkout-cart-item">
//               <div className="checkout-item-info">
//                 <span className="checkout-item-emoji">{item.emoji}</span>
//                 <div className="checkout-item-details">
//                   <h5>{item.name}</h5>
//                   <div className="checkout-item-meta">
//                     <span className="checkout-item-price">{formatPrice(item.price)} each</span>
//                     {item.hasOffer && (
//                       <span className="checkout-item-offer">
//                         <s>{formatPrice(item.standard_price)}</s>
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//               <div className="checkout-item-controls">
//                 <div className="checkout-item-quantity">
//                   <button 
//                     className="checkout-qty-btn"
//                     onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
//                   >
//                     <i className="fas fa-minus"></i>
//                   </button>
//                   <span className="checkout-qty-display">{item.quantity}</span>
//                   <button 
//                     className="checkout-qty-btn"
//                     onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
//                   >
//                     <i className="fas fa-plus"></i>
//                   </button>
//                 </div>
//                 <button 
//                   className="checkout-remove-btn"
//                   onClick={() => removeFromCart(item.id)}
//                 >
//                   <i className="fas fa-trash"></i>
//                 </button>
//               </div>
//               <div className="checkout-item-total">
//                 {formatPrice(item.price * item.quantity)}
//               </div>
//             </div>
//           ))}
//         </div>
        
//         <div className="checkout-cart-total">
//           <div className="checkout-total-row">
//             <span>Subtotal</span>
//             <span>{formatPrice(subtotal)}</span>
//           </div>
          
//           {calculatingDiscount ? (
//             <div className="checkout-total-row">
//               <span>Calculating discount...</span>
//               <div className="checkout-loading-spinner-small"></div>
//             </div>
//           ) : (
//             <>
//               {discountApplied && discountAmount > 0 && (
//                 <div className="checkout-total-row discount">
//                   <span>Discount ({discountPercent}%)</span>
//                   <span>-{formatPrice(discountAmount)}</span>
//                 </div>
//               )}
              
//               {topupAmount > 0 && (
//                 <div className="checkout-total-row topup">
//                   <span>Top-up Fee</span>
//                   <span>+{formatPrice(topupAmount)}</span>
//                 </div>
//               )}
              
//               {serviceCharge > 0 && (
//                 <div className="checkout-total-row service-charge">
//                   <span>Service Charge</span>
//                   <span>+{formatPrice(serviceCharge)}</span>
//                 </div>
//               )}
//             </>
//           )}
          
//           <div className="checkout-total-row checkout-grand-total">
//             <span>Total</span>
//             <span>{formatPrice(finalTotal || subtotal)}</span>
//           </div>
//         </div>
        
//         {topupAmount > 0 && (
//           <div className="checkout-topup-notice">
//             <i className="fas fa-info-circle"></i>
//             <span>
//               A top-up of {formatPrice(topupAmount)} has been added to meet the minimum order value of {formatPrice(minimumOrderAmount)}.
//             </span>
//           </div>
//         )}
//       </div>
//     );
//   };

//   // Render pickup address section
//   const renderPickupAddressSection = () => {
//     if (useSameAddress) return null;

//     return (
//       <div className="checkout-address-section" style={{ marginTop: '24px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
//         <h3 className="checkout-address-section-title">
//           <i className="fas fa-truck-pickup"></i>
//           Pickup Address
//           <span className="checkout-required-badge">Required</span>
//         </h3>
//         <p className="checkout-address-section-subtitle">
//           Where should we collect your laundry from?
//         </p>

//         {userToken && pickupAddresses.length > 0 && !showPickupAddressForm ? (
//           <>
//             <div className="checkout-address-grid">
//               {pickupAddresses.map((addr) => (
//                 <div
//                   key={`pickup-${addr.address_id}`}
//                   className={`checkout-address-option ${
//                     selectedPickupAddressId === String(addr.address_id) ? "selected" : ""
//                   }`}
//                   onClick={() => handlePickupAddressSelect(String(addr.address_id))}
//                 >
//                   <div className="checkout-address-option-header">
//                     <div className="checkout-address-type">
//                       <i className="fas fa-home"></i>
//                       <span>{addr.name || "Home"}</span>
//                     </div>
//                     {addr.is_selected && (
//                       <span className="checkout-default-badge">
//                         <i className="fas fa-star"></i>
//                         Default
//                       </span>
//                     )}
//                   </div>
//                   <div className="checkout-address-option-details">
//                     <p className="checkout-address-text">{addr.full_address}</p>
//                     <p className="checkout-address-postcode">
//                       <i className="fas fa-map-pin"></i>
//                       {addr.postcode}
//                     </p>
//                   </div>
//                   {selectedPickupAddressId === String(addr.address_id) && (
//                     <div className="checkout-address-selected">
//                       <i className="fas fa-check-circle"></i>
//                     </div>
//                   )}
//                 </div>
//               ))}

//               <div 
//                 className="checkout-add-address-option"
//                 onClick={() => handlePickupAddressSelect("new")}
//               >
//                 <div className="checkout-add-address-icon">
//                   <i className="fas fa-plus-circle"></i>
//                 </div>
//                 <div className="checkout-add-address-text">
//                   <h4>Add New Pickup Address</h4>
//                   <p>Enter a different pickup location</p>
//                 </div>
//               </div>
//             </div>
//           </>
//         ) : (
//           <div className="checkout-address-form-section">
//             <div className="checkout-form-grid">
//               <div className="checkout-form-group">
//                 <label className="checkout-form-label">
//                   <i className="fas fa-home"></i>
//                   House/Flat Number
//                   <input
//                     type="text"
//                     className="checkout-form-input"
//                     value={pickupAddressForm.house_number}
//                     onChange={handlePickupAddressFormChange("house_number")}
//                     placeholder="123"
//                   />
//                 </label>
//               </div>

//               <div className="checkout-form-group full-width">
//                 <label className="checkout-form-label">
//                   <i className="fas fa-road"></i>
//                   Street Address *
//                   <input
//                     type="text"
//                     className="checkout-form-input"
//                     value={pickupAddressForm.street_address}
//                     onChange={handlePickupAddressFormChange("street_address")}
//                     placeholder="Main Street, Apt 4B"
//                     required
//                   />
//                 </label>
//               </div>

//               <div className="checkout-form-group">
//                 <label className="checkout-form-label">
//                   <i className="fas fa-map-pin"></i>
//                   Postcode *
//                   <input
//                     type="text"
//                     className="checkout-form-input"
//                     value={pickupAddressForm.postcode}
//                     onChange={handlePickupAddressFormChange("postcode")}
//                     placeholder="SW1A 1AA"
//                     required
//                   />
//                 </label>
//               </div>

//               <div className="checkout-form-group">
//                 <label className="checkout-form-label">
//                   <i className="fas fa-city"></i>
//                   City/Town
//                   <input
//                     type="text"
//                     className="checkout-form-input"
//                     value={pickupAddressForm.city}
//                     onChange={handlePickupAddressFormChange("city")}
//                     placeholder="London"
//                   />
//                 </label>
//               </div>

//               <div className="checkout-form-group full-width">
//                 <label className="checkout-form-label">
//                   <i className="fas fa-info-circle"></i>
//                   Additional Details (Optional)
//                   <textarea
//                     className="checkout-form-textarea"
//                     value={pickupAddressForm.additional_details}
//                     onChange={handlePickupAddressFormChange("additional_details")}
//                     placeholder="Floor, building, landmarks, access instructions..."
//                     rows="2"
//                   />
//                 </label>
//               </div>
//             </div>

//             {userToken && pickupAddresses.length > 0 && showPickupAddressForm && (
//               <button
//                 className="checkout-secondary-btn"
//                 onClick={() => {
//                   setShowPickupAddressForm(false);
//                   setSelectedPickupAddressId(null);
//                 }}
//                 style={{ marginTop: '10px' }}
//               >
//                 <i className="fas fa-arrow-left"></i>
//                 Back to Saved Pickup Addresses
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="checkout-page">
//       <div className="checkout-container">

//         {/* Title Section */}
//         <div className="checkout-title-section">
//           <button 
//             className="checkout-back-btn"
//             onClick={() => navigate("/services")}
//           >
//             <i className="fas fa-arrow-left"></i> Back to Services
//           </button>
//           <h1 className="checkout-title">
//             <i className="fas fa-shopping-cart checkout-title-icon"></i>
//             Complete Your Booking
//           </h1>
//           <p className="checkout-subtitle">
//             Review your order and fill in your details to complete booking
//           </p>
          
//           {userToken && (
//             <div className="checkout-user-info">
//               <i className="fas fa-user-check"></i>
//               <span>Welcome back, {userInfo.name || user?.email}! Your info is pre-filled.</span>
//             </div>
//           )}
//         </div>

//         <div className="checkout-content">
//           {/* Left Column - Cart Summary */}
//           <div className="checkout-left-column">
//             {/* Cart Summary Card */}
//             <div className="checkout-card">
//               {renderCartSummary()}
//             </div>
            
//             {/* Personal Information Card */}
//             <div className="checkout-card">
//               <div className="checkout-card-header">
//                 <div className="checkout-section-icon">
//                   <i className="fas fa-user"></i>
//                 </div>
//                 <div>
//                   <h2 className="checkout-section-title">Your Information</h2>
//                   <p className="checkout-section-subtitle">We'll use this to contact you about your order</p>
//                 </div>
//               </div>

//               <div className="checkout-form-grid">
//                 <div className="checkout-form-group">
//                   <label className="checkout-form-label">
//                     <i className="fas fa-user-tag"></i>
//                     Full Name
//                     <input
//                       type="text"
//                       className="checkout-form-input"
//                       value={userInfo.name}
//                       onChange={handleUserInfoChange("name")}
//                       placeholder="John Smith"
//                       required
//                     />
//                   </label>
//                 </div>

//                 <div className="checkout-form-group">
//                   <label className="checkout-form-label">
//                     <i className="fas fa-envelope"></i>
//                     Email Address
//                     <input
//                       type="email"
//                       className="checkout-form-input"
//                       value={userInfo.email}
//                       onChange={handleUserInfoChange("email")}
//                       placeholder="john@example.com"
//                       required
//                     />
//                   </label>
//                 </div>

//                 <div className="checkout-form-group">
//                   <label className="checkout-form-label">
//                     <i className="fas fa-phone"></i>
//                     Phone Number
//                     <input
//                       type="tel"
//                       className="checkout-form-input"
//                       value={userInfo.phone}
//                       onChange={handlePhoneChange}
//                       placeholder="+44 20 1234 5678"
//                       required
//                     />
//                     <div className="checkout-phone-hint">
//                       <i className="fas fa-info-circle"></i>
//                       Enter phone number to check for existing account
//                     </div>
//                   </label>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Booking Details */}
//           <div className="checkout-right-column">
//             {/* Address Section */}
//             <div className="checkout-card">
//               <div className="checkout-card-header">
//                 <div className="checkout-section-icon">
//                   <i className="fas fa-map-marker-alt"></i>
//                 </div>
//                 <div>
//                   <h2 className="checkout-section-title">Delivery Address</h2>
//                   <p className="checkout-section-subtitle">Where should we deliver your laundry?</p>
//                 </div>
//               </div>

//               {userToken && addresses.length > 0 && !showAddressForm ? (
//                 <>
//                   <div className="checkout-address-selection">
//                     <h3 className="checkout-address-selection-title">Select a Saved Address</h3>
//                     <div className="checkout-address-grid">
//                       {addresses.map((addr) => (
//                         <div
//                           key={addr.address_id}
//                           className={`checkout-address-option ${
//                             selectedAddressId === String(addr.address_id) ? "selected" : ""
//                           }`}
//                           onClick={() => setSelectedAddressId(String(addr.address_id))}
//                         >
//                           <div className="checkout-address-option-header">
//                             <div className="checkout-address-type">
//                               <i className="fas fa-home"></i>
//                               <span>{addr.name || "Home"}</span>
//                             </div>
//                             {addr.is_selected && (
//                               <span className="checkout-default-badge">
//                                 <i className="fas fa-star"></i>
//                                 Default
//                               </span>
//                             )}
//                           </div>
//                           <div className="checkout-address-option-details">
//                             <p className="checkout-address-text">{addr.full_address}</p>
//                             <p className="checkout-address-postcode">
//                               <i className="fas fa-map-pin"></i>
//                               {addr.postcode}
//                             </p>
//                           </div>
//                           {selectedAddressId === String(addr.address_id) && (
//                             <div className="checkout-address-selected">
//                               <i className="fas fa-check-circle"></i>
//                             </div>
//                           )}
//                         </div>
//                       ))}

//                       <div 
//                         className="checkout-add-address-option"
//                         onClick={handleAddAddressClick}
//                       >
//                         <div className="checkout-add-address-icon">
//                           <i className="fas fa-plus-circle"></i>
//                         </div>
//                         <div className="checkout-add-address-text">
//                           <h4>Add New Address</h4>
//                           <p>Enter a different delivery address</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="checkout-address-toggle">
//                     <label className="checkout-toggle-container">
//                       <div className="checkout-toggle-switch">
//                         <input
//                           type="checkbox"
//                           checked={useSameAddress}
//                           onChange={handleToggleSameAddress}
//                         />
//                         <span className="checkout-toggle-slider"></span>
//                       </div>
//                       <div className="checkout-toggle-label">
//                         <span className="checkout-toggle-title">Use same address for pickup</span>
//                         <span className="checkout-toggle-description">Pickup and delivery at the same location</span>
//                       </div>
//                     </label>
//                   </div>
//                 </>
//               ) : (
//                 <div className="checkout-address-form-section">
//                   <div className="checkout-form-grid">
//                     <div className="checkout-form-group">
//                       <label className="checkout-form-label">
//                         <i className="fas fa-home"></i>
//                         House/Flat Number
//                         <input
//                           type="text"
//                           className="checkout-form-input"
//                           value={addressForm.house_number}
//                           onChange={handleAddressFormChange("house_number")}
//                           placeholder="123"
//                         />
//                       </label>
//                     </div>

//                     <div className="checkout-form-group full-width">
//                       <label className="checkout-form-label">
//                         <i className="fas fa-road"></i>
//                         Street Address *
//                         <input
//                           type="text"
//                           className="checkout-form-input"
//                           value={addressForm.street_address}
//                           onChange={handleAddressFormChange("street_address")}
//                           placeholder="Main Street, Apt 4B"
//                           required
//                         />
//                       </label>
//                     </div>

//                     <div className="checkout-form-group">
//                       <label className="checkout-form-label">
//                         <i className="fas fa-map-pin"></i>
//                         Postcode *
//                         <input
//                           type="text"
//                           className="checkout-form-input"
//                           value={addressForm.postcode}
//                           onChange={handleAddressFormChange("postcode")}
//                           placeholder="SW1A 1AA"
//                           required
//                         />
//                       </label>
//                     </div>

//                     <div className="checkout-form-group">
//                       <label className="checkout-form-label">
//                         <i className="fas fa-city"></i>
//                         City/Town
//                         <input
//                           type="text"
//                           className="checkout-form-input"
//                           value={addressForm.city}
//                           onChange={handleAddressFormChange("city")}
//                           placeholder="London"
//                         />
//                       </label>
//                     </div>

//                     <div className="checkout-form-group full-width">
//                       <label className="checkout-form-label">
//                         <i className="fas fa-info-circle"></i>
//                         Additional Details (Optional)
//                         <textarea
//                           className="checkout-form-textarea"
//                           value={addressForm.additional_details}
//                           onChange={handleAddressFormChange("additional_details")}
//                           placeholder="Floor, building, landmarks, access instructions..."
//                           rows="2"
//                         />
//                       </label>
//                     </div>
//                   </div>

//                   {userToken && addresses.length > 0 && showAddressForm && (
//                     <button
//                       className="checkout-secondary-btn"
//                       onClick={() => setShowAddressForm(false)}
//                     >
//                       <i className="fas fa-arrow-left"></i>
//                       Back to Saved Addresses
//                     </button>
//                   )}

//                   {/* Same Address Toggle for non-logged in users or when adding new address */}
//                   {(!userToken || showAddressForm) && (
//                     <div className="checkout-address-toggle" style={{ marginTop: '20px' }}>
//                       <label className="checkout-toggle-container">
//                         <div className="checkout-toggle-switch">
//                           <input
//                             type="checkbox"
//                             checked={useSameAddress}
//                             onChange={handleToggleSameAddress}
//                           />
//                           <span className="checkout-toggle-slider"></span>
//                         </div>
//                         <div className="checkout-toggle-label">
//                           <span className="checkout-toggle-title">Use same address for pickup</span>
//                           <span className="checkout-toggle-description">Pickup and delivery at the same location</span>
//                         </div>
//                       </label>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Render separate pickup address section when useSameAddress is false */}
//               {renderPickupAddressSection()}
//             </div>

//             {/* Pickup & Delivery Schedule */}
//             <div className="checkout-card">
//               <div className="checkout-card-header">
//                 <div className="checkout-section-icon">
//                   <i className="fas fa-calendar-alt"></i>
//                 </div>
//                 <div>
//                   <h2 className="checkout-section-title">Schedule Pickup & Delivery</h2>
//                   <p className="checkout-section-subtitle">Choose convenient times for collection and return</p>
//                 </div>
//               </div>

//               <div className="checkout-schedule-container">
//                 {/* Pickup Section */}
//                 <div className="checkout-schedule-section">
//                   <div className="checkout-schedule-header">
//                     <div className="checkout-schedule-icon pickup">
//                       <i className="fas fa-truck-loading"></i>
//                     </div>
//                     <div>
//                       <h3 className="checkout-schedule-title">Pickup</h3>
//                       <p className="checkout-schedule-subtitle">When should we collect your laundry?</p>
//                     </div>
//                   </div>

//                   <div className="checkout-date-section">
//                     <label className="checkout-date-label">
//                       <i className="fas fa-calendar-day"></i>
//                       Pickup Date
//                     </label>
//                     <div className="checkout-date-input-container">
//                       <input
//                         type="date"
//                         className="checkout-date-input"
//                         value={collectDate}
//                         onChange={handleCollectDateChange}
//                         min={today}
//                       />
//                       <i className="fas fa-calendar-alt checkout-date-icon"></i>
//                     </div>
//                     {collectDate && (
//                       <p className="checkout-date-display">
//                         <i className="fas fa-check-circle"></i>
//                         Selected: {formatDateDDMMYYYY(collectDate)}
//                       </p>
//                     )}
//                   </div>

//                   {collectDate && (
//                     <div className="checkout-time-slots-section">
//                       <label className="checkout-time-label">
//                         <i className="fas fa-clock"></i>
//                         Available Pickup Times
//                       </label>
                      
//                       {loadingSlots.collect ? (
//                         <div className="checkout-loading-state">
//                           <div className="checkout-loading-spinner"></div>
//                           <p>Loading available slots...</p>
//                         </div>
//                       ) : collectSlots.length === 0 ? (
//                         <div className="checkout-empty-state">
//                           <i className="fas fa-calendar-times"></i>
//                           <p>No slots available for this date</p>
//                         </div>
//                       ) : (
//                         <div className="checkout-time-slots-grid">
//                           {collectSlots.map((slot, index) => (
//                             <button
//                               key={`collect-${slot.start}-${index}`}
//                               type="button"
//                               className={`checkout-time-slot ${
//                                 selectedCollectSlot?.start === slot.start ? "selected" : ""
//                               } ${!slot.enabled ? "disabled" : ""}`}
//                               onClick={() => handleCollectSlotSelect(slot)}
//                               disabled={!slot.enabled}
//                             >
//                               <span className="checkout-slot-time">{formatTimeRange24Hour(slot.start, slot.end)}</span>
//                               {selectedCollectSlot?.start === slot.start && (
//                                 <i className="fas fa-check checkout-slot-check"></i>
//                               )}
//                             </button>
//                           ))}
//                         </div>
//                       )}

//                       {selectedCollectSlot && (
//                         <div className="checkout-selected-slot-info">
//                           <div className="checkout-selected-slot-header">
//                             <i className="fas fa-check-circle"></i>
//                             <span>Pickup Scheduled</span>
//                           </div>
//                           <div className="checkout-selected-slot-details">
//                             {formatDateDDMMYYYY(collectDate)} at {formatTimeRange24Hour(selectedCollectSlot.start, selectedCollectSlot.end)}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 {/* Delivery Section */}
//                 <div className="checkout-schedule-section">
//                   <div className="checkout-schedule-header">
//                     <div className="checkout-schedule-icon delivery">
//                       <i className="fas fa-truck"></i>
//                     </div>
//                     <div>
//                       <h3 className="checkout-schedule-title">Delivery</h3>
//                       <p className="checkout-section-subtitle">When should we return your laundry?</p>
//                     </div>
//                   </div>

//                   <div className="checkout-date-section">
//                     <label className="checkout-date-label">
//                       <i className="fas fa-calendar-day"></i>
//                       Delivery Date
//                     </label>
//                     <div className="checkout-date-input-container">
//                       <input
//                         type="date"
//                         className="checkout-date-input"
//                         value={deliverDate}
//                         onChange={handleDeliverDateChange}
//                         min={minDeliveryDate}
//                         disabled={!collectDate}
//                       />
//                       <i className="fas fa-calendar-alt checkout-date-icon"></i>
//                     </div>
//                     {!collectDate && (
//                       <p className="checkout-date-hint">
//                         <i className="fas fa-info-circle"></i>
//                         Select pickup date first
//                       </p>
//                     )}
//                     {deliverDate && (
//                       <p className="checkout-date-display">
//                         <i className="fas fa-check-circle"></i>
//                         Selected: {formatDateDDMMYYYY(deliverDate)}
//                       </p>
//                     )}
//                   </div>

//                   {deliverDate && (
//                     <div className="checkout-time-slots-section">
//                       <label className="checkout-time-label">
//                         <i className="fas fa-clock"></i>
//                         Available Delivery Times
//                       </label>
                      
//                       {loadingSlots.deliver ? (
//                         <div className="checkout-loading-state">
//                           <div className="checkout-loading-spinner"></div>
//                           <p>Loading available slots...</p>
//                         </div>
//                       ) : deliverSlots.length === 0 ? (
//                         <div className="checkout-empty-state">
//                           <i className="fas fa-calendar-times"></i>
//                           <p>No slots available for this date</p>
//                         </div>
//                       ) : (
//                         <div className="checkout-time-slots-grid">
//                           {deliverSlots.map((slot, index) => (
//                             <button
//                               key={`deliver-${slot.start}-${index}`}
//                               type="button"
//                               className={`checkout-time-slot ${
//                                 selectedDeliverSlot?.start === slot.start ? "selected" : ""
//                               } ${!slot.enabled ? "disabled" : ""}`}
//                               onClick={() => handleDeliverSlotSelect(slot)}
//                               disabled={!slot.enabled}
//                             >
//                               <span className="checkout-slot-time">{formatTimeRange24Hour(slot.start, slot.end)}</span>
//                               {selectedDeliverSlot?.start === slot.start && (
//                                 <i className="fas fa-check checkout-slot-check"></i>
//                               )}
//                             </button>
//                           ))}
//                         </div>
//                       )}

//                       {selectedDeliverSlot && (
//                         <div className="checkout-selected-slot-info">
//                           <div className="checkout-selected-slot-header">
//                             <i className="fas fa-check-circle"></i>
//                             <span>Delivery Scheduled</span>
//                           </div>
//                           <div className="checkout-selected-slot-details">
//                             {formatDateDDMMYYYY(deliverDate)} at {formatTimeRange24Hour(selectedDeliverSlot.start, selectedDeliverSlot.end)}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Special Instructions */}
//             <div className="checkout-card">
//               <div className="checkout-card-header">
//                 <div className="checkout-section-icon">
//                   <i className="fas fa-sticky-note"></i>
//                 </div>
//                 <div>
//                   <h2 className="checkout-section-title">Special Instructions</h2>
//                   <p className="checkout-section-subtitle">Any specific requirements for our team?</p>
//                 </div>
//               </div>

//               <div className="checkout-notes-container">
//                 <textarea
//                   className="checkout-notes-input"
//                   placeholder="Example: Please ring bell twice, fragile items, specific handling instructions..."
//                   value={notes}
//                   onChange={(e) => setNotes(e.target.value)}
//                   maxLength={500}
//                   rows={3}
//                 />
//                 <div className="checkout-notes-footer">
//                   <div className="checkout-notes-hint">
//                     <i className="fas fa-lightbulb"></i>
//                     Optional but helpful for better service
//                   </div>
//                   {notes.length > 0 && (
//                     <div className="checkout-notes-counter">
//                       {notes.length}/500 characters
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Payment Section - For Testing (Cash on Delivery) */}
//             <div className="checkout-card">
//               <div className="checkout-card-header">
//                 <div className="checkout-section-icon">
//                   <i className="fas fa-money-bill-wave"></i>
//                 </div>
//                 <div>
//                   <h2 className="checkout-section-title">Payment Method</h2>
//                   <p className="checkout-section-subtitle">TEST MODE - Payment will be collected on delivery</p>
//                 </div>
//                 <div className="checkout-testing-badge">
//                   <i className="fas fa-flask"></i>
//                   <span>Testing Mode</span>
//                 </div>
//               </div>

//               <div className="checkout-payment-options">
//                 <div className="checkout-payment-option">
//                   <div className="checkout-payment-icon">
//                     <i className="fas fa-money-bill-wave"></i>
//                   </div>
//                   <div className="checkout-payment-content">
//                     <h3 className="checkout-payment-title">Cash on Delivery</h3>
//                     <p className="checkout-payment-description">
//                       For testing purposes only. No payment required now. Payment will be collected when your laundry is delivered.
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="checkout-payment-info">
//                 <div className="checkout-payment-info-icon">
//                   <i className="fas fa-info-circle"></i>
//                 </div>
//                 <div className="checkout-payment-info-text">
//                   <strong>Testing Mode:</strong> This is a test environment. No actual payment will be processed. 
//                   All payment calculations (discounts, top-ups, service charges) are for testing backend integration.
//                 </div>
//               </div>

//               <div className="checkout-payment-actions">
//                 <button 
//                   className="checkout-primary-btn checkout-book-btn" 
//                   onClick={placeOrder}
//                   disabled={!isBookingValid() || loading}
//                 >
//                   {loading ? (
//                     <>
//                       <div className="checkout-btn-spinner"></div>
//                       Processing...
//                     </>
//                   ) : (
//                     <>
//                       <i className="fas fa-check-circle"></i>
//                       Confirm Order (Testing)
//                     </>
//                   )}
//                 </button>
//               </div>

//               <div className="checkout-cancel-section">
//                 <button
//                   className="checkout-secondary-btn"
//                   onClick={() => navigate("/services")}
//                   disabled={loading}
//                 >
//                   <i className="fas fa-times"></i>
//                   Cancel Order
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Summary Section (Fixed at bottom on mobile) */}
//         <div className="checkout-summary-section">
//           <div className="checkout-summary-content">
//             <div className="checkout-summary-info">
//               <div className="checkout-summary-item">
//                 <i className="fas fa-shopping-bag"></i>
//                 <span>{calculateItemCount()} items: {formatPrice(finalTotal || calculateCartTotal())}</span>
//               </div>
//               <div className="checkout-summary-item">
//                 <i className="fas fa-calendar"></i>
//                 <span>Pickup: {selectedCollectSlot ? formatDateDDMMYYYY(collectDate) : "Not selected"}</span>
//               </div>
//               <div className="checkout-summary-item">
//                 <i className="fas fa-truck"></i>
//                 <span>Delivery: {selectedDeliverSlot ? formatDateDDMMYYYY(deliverDate) : "Not selected"}</span>
//               </div>
//             </div>
//             <div className="checkout-summary-action">
//               <button 
//                 className="checkout-primary-btn checkout-confirm-btn"
//                 onClick={placeOrder}
//                 disabled={!isBookingValid() || loading}
//               >
//                 {loading ? (
//                   <>
//                     <div className="checkout-btn-spinner"></div>
//                     Processing...
//                   </>
//                 ) : (
//                   <>
//                     <i className="fas fa-check-circle"></i>
//                     Confirm Order
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Toast Notification */}
//       {toast && (
//         <div className={`checkout-toast checkout-toast-${toast.type}`}>
//           <div className="checkout-toast-icon">
//             {toast.type === 'success' ? (
//               <i className="fas fa-check-circle"></i>
//             ) : toast.type === 'error' ? (
//               <i className="fas fa-exclamation-circle"></i>
//             ) : (
//               <i className="fas fa-info-circle"></i>
//             )}
//           </div>
//           <div className="checkout-toast-message">{toast.msg}</div>
//           <button className="checkout-toast-close" onClick={() => setToast(null)}>
//             <i className="fas fa-times"></i>
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
