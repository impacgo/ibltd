// src/components/QuickBooking.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AddAddressModal from "../components/AddAddressModal";
import SuccessModal from "../components/SuccessModal";
import LoginPopup from "../components/LoginPopup";
import { useAuth } from "../context/AuthContext";
import "./QuickBooking.css";

// Stripe imports
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";

const API_BASE = "https://api.ironingboy.com";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(
  "pk_live_51SUiy73fSKIcHb6THsEQatj2g1tJOjUhzaym490HNFobNn6gOtdzpelQnV2knmKkXPiqxKqJjwEQ6dtSNRKuO4yx00HFqYnkEI",
);

/* -------------------------------------------------------------------------- */
/*                       Stripe SetupIntent Form (UI)                         */
/* -------------------------------------------------------------------------- */

const StripeSetupForm = ({
  onSetupSuccess,
  onSetupError,
  onCancel,
  setupProcessing,
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
      <div className="payment-header">
        <h3>Save Your Card for Future Payments</h3>
        <p style={{color:"black"}}>
          <i className="fas fa-credit-card" style={{ marginRight: "8px" , color:"black"}}></i>
          Your card will be securely saved by Stripe for automatic invoice payments.
          No charges will be made until your laundry manager sends the invoice.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="payment-element-wrapper">
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
          <div className="card-save-note">
            <i className="fas fa-info-circle"></i>
            <span>Stripe will automatically save your card details securely for future payments.</span>
          </div>
        </div>
        
        <div className="consent-checkbox-container">
          <label>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
            />
            <span className="consent-text" style={{color:"black"}}>
              <strong>Yes, save my card</strong>
              <br />
              I authorize IroningBoy to save this card and use it for automatic payment 
              of laundry service invoices. I understand charges will only be made after 
              I receive and review the invoice.
            </span>
          </label>
        </div>
        
        {error && (
          <div className="payment-error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}
        
        <div className="payment-actions">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting || setupProcessing}
            className="payment-cancel-btn"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={!stripe || submitting || setupProcessing || !consent}
            className="payment-confirm-btn"
          >
            {submitting ? (
              <>
                <div className="payment-loading-spinner"></div>
                Saving Card...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Save Card & Confirm Booking
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                           Main QuickBooking Page                           */
/* -------------------------------------------------------------------------- */

export default function QuickBooking() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showLogin, setShowLogin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPaymentSetup, setShowPaymentSetup] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [setupProcessing, setSetupProcessing] = useState(false);

  const [loadingSlots, setLoadingSlots] = useState({
    collect: false,
    deliver: false,
  });

  const [selectedCollectSlotStart, setSelectedCollectSlotStart] = useState(null);
  const [selectedCollectSlotEnd, setSelectedCollectSlotEnd] = useState(null);
  const [selectedDeliverSlotStart, setSelectedDeliverSlotStart] = useState(null);
  const [selectedDeliverSlotEnd, setSelectedDeliverSlotEnd] = useState(null);

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  // Check if pickup is today
  const pickupIsToday = () => {
    if (!collectDate) return false;
    return isSameDay(new Date(), new Date(collectDate));
  };

  // Check if pickup is before 10 AM
  const pickupBefore10 = () => {
    if (!selectedCollectSlotStart) return false;
    return selectedCollectSlotStart.getHours() < 10;
  };

  const [savedCards, setSavedCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [useNewCard, setUseNewCard] = useState(false);

  // Apply 8-hour rule (same as mobile app)
  const apply8HourRule = (slots) => {
    if (!selectedCollectSlotStart || !collectDate) return slots;

    const pickupDate = new Date(collectDate);
    const pickupDateTime = new Date(
      pickupDate.getFullYear(),
      pickupDate.getMonth(),
      pickupDate.getDate(),
      selectedCollectSlotStart.getHours(),
      selectedCollectSlotStart.getMinutes()
    );

    const minDelivery = new Date(pickupDateTime.getTime() + 8 * 60 * 60 * 1000);

    return slots.filter(s => new Date(s.start) >= minDelivery);
  };

  const [addresses, setAddresses] = useState([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);
  const [selectedPickupId, setSelectedPickupId] = useState(null);
  const [useSameAddress, setUseSameAddress] = useState(true);

  const [collectDate, setCollectDate] = useState("");
  const [deliverDate, setDeliverDate] = useState("");
  const [collectSlots, setCollectSlots] = useState([]);
  const [deliverSlots, setDeliverSlots] = useState([]);
  const [selectedCollectSlot, setSelectedCollectSlot] = useState(null);
  const [selectedDeliverSlot, setSelectedDeliverSlot] = useState(null);

  const [notes, setNotes] = useState("");

  // Stripe setup intent
  const [setupClientSecret, setSetupClientSecret] = useState(null);
  const [customerId, setCustomerId] = useState(null);

  const SERVICE_CHARGE = 2.0;
  const MINIMUM_ORDER_AMOUNT = 20.0;

  /* ----------------------- Init / cleanup on mount ----------------------- */

  const clearBookingData = useCallback(() => {
    setCollectDate("");
    setDeliverDate("");
    setCollectSlots([]);
    setDeliverSlots([]);
    setSelectedCollectSlot(null);
    setSelectedCollectSlotStart(null);
    setSelectedCollectSlotEnd(null);
    setSelectedDeliverSlot(null);
    setSelectedDeliverSlotStart(null);
    setSelectedDeliverSlotEnd(null);
    setNotes("");
    setUseSameAddress(true);
    setSetupClientSecret(null);
    setCustomerId(null);
  }, []);

  // Add the missing function for canceling payment modal
  const handlePaymentModalCancel = () => {
    setShowPaymentSetup(false);
    setSetupClientSecret(null);
    setUseNewCard(false);
  };

  // Simplify the useEffect for body class handling
  useEffect(() => {
    if (showPaymentSetup) {
      document.body.classList.add('payment-modal-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('payment-modal-open');
      document.body.style.overflow = '';
    }
    
    // Cleanup on component unmount
    return () => {
      document.body.classList.remove('payment-modal-open');
      document.body.style.overflow = '';
    };
  }, [showPaymentSetup]);

  useEffect(() => {
    clearBookingData();

    if (user) {
      fetchAddresses();
      ensureStripeCustomer();
      fetchSavedCards();
    }
  }, [user]);

  /* ----------------------------- API helpers ----------------------------- */

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAddresses = useCallback(async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch addresses");

      const data = await res.json();

      if (data && data.length > 0) {
        setAddresses(data);
        const selected = data.find((a) => a.is_selected) || data[0];
        if (selected) {
          const id = String(selected.address_id);
          setSelectedDeliveryId(id);
          setSelectedPickupId(id);
        }
      } else {
        setSelectedDeliveryId(null);
        setSelectedPickupId(null);
      }
    } catch (e) {
      showToast("Unable to load addresses");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSavedCards = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        setLoadingCards(false);
        return;
      }

      const res = await fetch(`${API_BASE}/stripe/saved-cards`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch saved cards`);

      const data = await res.json();
      setSavedCards(data.cards || []);
    } catch (err) {
      setSavedCards([]);
    } finally {
      setLoadingCards(false);
    }
  };

  const ensureStripeCustomer = useCallback(async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${API_BASE}/stripe/create-customer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setCustomerId(data.customerId);
      }
    } catch (error) {
      console.log("Stripe customer creation error");
    }
  }, [user]);

  const createSetupIntent = useCallback(async () => {
    if (!user) {
      setShowLogin(true);
      return null;
    }

    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${API_BASE}/stripe/init-setup-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create setup intent");
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Create setup intent error:", error);
      return null;
    }
  }, [user]);

  /* --------------------------- Time Slot Functions -------------------------- */

  // Format time in 24-hour format (13:00, 14:00, etc.)
  const formatTime24Hour = (timeString) => {
    if (!timeString) return "";
    
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return timeString;
      
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString;
    }
  };

  // Format time range in 24-hour format (13:00-14:00)
  const formatTimeRange24Hour = (startTime, endTime) => {
    const start = formatTime24Hour(startTime);
    const end = formatTime24Hour(endTime);
    
    if (start && end) {
      return `${start}-${end}`;
    }
    return start || end || "";
  };

  // Format date in DD/MM/YYYY format
  const formatDateDDMMYYYY = (dateString) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Combine date and time for display
  const formatDateTimeDisplay = (dateString, timeString) => {
    const date = formatDateDDMMYYYY(dateString);
    const time = formatTime24Hour(timeString);
    
    if (date && time) {
      return `${date} at ${time}`;
    }
    return date || time || "";
  };

  const fetchTimeSlots = useCallback(
    async (dateIso, isDelivery = false) => {
      if (!dateIso || !user) return [];

      const tzOffset = -new Date().getTimezoneOffset();

      const params = new URLSearchParams({
        date: dateIso,
        format: "24", // Changed from "12" to "24" for 24-hour format
        tzOffset: tzOffset.toString(),
      });

      if (isDelivery) {
        params.set("isDelivery", "true");

        if (collectDate && selectedCollectSlotStart) {
          const h = selectedCollectSlotStart.getHours().toString().padStart(2, "0");
          const m = selectedCollectSlotStart.getMinutes().toString().padStart(2, "0");

          params.set("pickupDate", collectDate);
          params.set("pickupSlotStart", `${h}:${m}`);
        }
      }

      const res = await fetch(`${API_BASE}/time-slots?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch slots");

      const data = await res.json();
      let slots = data.slots || [];

      // ✅ Apply 8-hour rule for delivery slots (same as mobile app)
      if (isDelivery) {
        slots = apply8HourRule(slots);
      }

      // Format slot labels to 24-hour format
      slots = slots.map(slot => ({
        ...slot,
        // Create a 24-hour format label if not provided
        displayLabel: slot.label ? slot.label : `${formatTime24Hour(slot.start)}-${formatTime24Hour(slot.end)}`
      }));

      return slots;
    },
    [user, collectDate, selectedCollectSlotStart]
  );

  const fetchCollectSlots = useCallback(async () => {
    if (!collectDate || !user) return;
    setLoadingSlots((prev) => ({ ...prev, collect: true }));

    try {
      const slots = await fetchTimeSlots(collectDate, false);
      setCollectSlots(slots);

      if (selectedCollectSlot) {
        const stillValid = slots.find(
          (s) => s.start === selectedCollectSlot.start && s.enabled
        );
        if (!stillValid) {
          setSelectedCollectSlot(null);
          setSelectedCollectSlotStart(null);
          setSelectedCollectSlotEnd(null);
        }
      }
    } catch {
      setCollectSlots([]);
      setSelectedCollectSlot(null);
      setSelectedCollectSlotStart(null);
      setSelectedCollectSlotEnd(null);
    } finally {
      setLoadingSlots((prev) => ({ ...prev, collect: false }));
    }
  }, [collectDate, fetchTimeSlots, user, selectedCollectSlot]);

  const fetchDeliverySlots = useCallback(async () => {
    if (!deliverDate || !user || !collectDate || !selectedCollectSlotStart) return;

    setLoadingSlots((prev) => ({ ...prev, deliver: true }));

    try {
      const slots = await fetchTimeSlots(deliverDate, true);

      // ✅ IMPORTANT: Check if pickup is today and after 10 AM
      if (pickupIsToday() && !pickupBefore10() && isSameDay(new Date(deliverDate), new Date(collectDate))) {
        // If pickup is today after 10 AM and user selected same day for delivery,
        // show toast and adjust delivery to tomorrow
        showToast("Same-day delivery is disabled after 10:00. Moving to tomorrow.");
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        setDeliverDate(tomorrowStr);
        setSelectedDeliverSlot(null);
        setSelectedDeliverSlotStart(null);
        setSelectedDeliverSlotEnd(null);
        
        // Fetch slots for tomorrow instead
        const tomorrowSlots = await fetchTimeSlots(tomorrowStr, true);
        setDeliverSlots(tomorrowSlots);
      } else {
        setDeliverSlots(slots);

        if (selectedDeliverSlot) {
          const stillValid = slots.find(
            (s) => s.start === selectedDeliverSlot.start && s.enabled
          );
          if (!stillValid) {
            setSelectedDeliverSlot(null);
            setSelectedDeliverSlotStart(null);
            setSelectedDeliverSlotEnd(null);
          }
        }
      }
    } catch (err) {
      console.error("Delivery slot error:", err);
      setDeliverSlots([]);
      setSelectedDeliverSlot(null);
      setSelectedDeliverSlotStart(null);
      setSelectedDeliverSlotEnd(null);
    } finally {
      setLoadingSlots((prev) => ({ ...prev, deliver: false }));
    }
  }, [
    deliverDate,
    collectDate,
    selectedCollectSlotStart,
    fetchTimeSlots,
    user,
    selectedDeliverSlot,
  ]);

  /* --------------------------- Order Functions -------------------------- */

  // helper: combine date (YYYY-MM-DD) + slot time (e.g. "08:00", "08:00:00" or an ISO datetime)
  const combineDateAndTime = (dateIso, timeString) => {
    if (!dateIso || !timeString) return null;

    // If slot already contains a date/time (ISO-like with 'T') just normalize it
    if (String(timeString).includes("T")) {
      const dt = new Date(timeString);
      return isNaN(dt.getTime()) ? null : dt.toISOString();
    }

    // Normalize timeString to HH:MM:SS
    let t = String(timeString).trim();
    // sometimes slot start may be "08:00" or "8:00" or "08:00:00"
    // make sure seconds exist
    const parts = t.split(":");
    if (parts.length === 2) t = `${parts[0].padStart(2,"0")}:${parts[1].padStart(2,"0")}:00`;
    // if third part exists, keep it but ensure padding
    if (parts.length >= 3) {
      t = `${String(parts[0]).padStart(2,"0")}:${String(parts[1]).padStart(2,"0")}:${String(parts[2]).padStart(2,"0")}`;
    }

    // Combine as local time (assumes dateIso is YYYY-MM-DD)
    // e.g. "2025-12-10T08:00:00"
    const combined = `${dateIso}T${t}`;

    const dt = new Date(combined);
    // If invalid, return null
    return isNaN(dt.getTime()) ? null : dt.toISOString();
  };

  const prepareOrderData = useCallback((paymentMethodId = null) => {
    if (
      !selectedCollectSlot ||
      !selectedDeliverSlot ||
      !collectDate ||
      !deliverDate
    ) return null;

    const pickupSlotText = `${formatDateDDMMYYYY(collectDate)}, ${formatTimeRange24Hour(
      selectedCollectSlot.start,
      selectedCollectSlot.end
    )}`;

    const deliverySlotText = `${formatDateDDMMYYYY(deliverDate)}, ${formatTimeRange24Hour(
      selectedDeliverSlot.start,
      selectedDeliverSlot.end
    )}`;

    return {
      address_id: selectedDeliveryId,
      pickup_address_id: useSameAddress ? selectedDeliveryId : selectedPickupId,
      use_same_address: useSameAddress,

      // ✅ THIS IS THE FIX
      collect_slot: pickupSlotText,
      delivery_slot: deliverySlotText,

      notes: notes.trim() || null,
      images: [],
      change_manager_requested: false,

      minimum_order_amount: MINIMUM_ORDER_AMOUNT,
      service_charge: SERVICE_CHARGE,

      payment_status: "card_saved",
      payment_type: "invoice_based",

      stripe_customer_id: customerId,
      payment_method_id: paymentMethodId,

      estimated_total: 0,
      currency: "gbp",
    };
  }, [
    selectedCollectSlot,
    selectedDeliverSlot,
    collectDate,
    deliverDate,
    selectedDeliveryId,
    selectedPickupId,
    useSameAddress,
    notes,
    customerId,
  ]);

  const handleSetupSuccess = async (setupIntent) => {
    setSetupProcessing(true);

    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("Authentication required");

      const paymentMethodId =
        setupIntent.payment_method ||
        setupIntent.latest_attempt?.payment_method;

      if (!paymentMethodId) {
        throw new Error("Payment method not returned by Stripe");
      }

      // Set as default card
      await fetch(`${API_BASE}/stripe/set-default-payment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId,
          paymentMethodId,
        }),
      });

      // Create order
      const order = prepareOrderData(paymentMethodId);
      if (!order) throw new Error("Order data missing");

      const res = await fetch(`${API_BASE}/express_order`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order creation failed");

      // Close payment modal
      setShowPaymentSetup(false);
      
      // Navigate to thank you page
      navigate("/thankyou", {
        state: {
          orderId: data.order_id,
          paymentStatus: "card_saved",
          paymentMethod: "new_card",
          pickupDate: formatDateDDMMYYYY(collectDate),
          pickupTime: formatTimeRange24Hour(selectedCollectSlot.start, selectedCollectSlot.end),
          deliveryDate: formatDateDDMMYYYY(deliverDate),
          deliveryTime: formatTimeRange24Hour(selectedDeliverSlot.start, selectedDeliverSlot.end),
        },
      });

    } catch (err) {
      console.error(err);
      showToast(err.message);
    } finally {
      setSetupProcessing(false);
    }
  };

  const handleSetupError = (errorMessage) => {
    showToast(errorMessage || "Failed to save card. Please try again.");
  };

  /* ------------------------- Confirm booking flow ------------------------- */

  const handleConfirmBooking = async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    // BASIC VALIDATIONS
    if (!selectedCollectSlot || !selectedDeliverSlot) {
      showToast("Please select pickup and delivery slots");
      return;
    }

    if (!selectedDeliveryId) {
      showToast("Please select a delivery address");
      return;
    }

    if (!useSameAddress && !selectedPickupId) {
      showToast("Please select a pickup address");
      return;
    }

    setSetupProcessing(true);

    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("Authentication required");

      // CHECK DEFAULT SAVED CARD
      const defaultCard = savedCards.find(card => card.is_default);

      // CASE 1: USE SAVED DEFAULT CARD (NO STRIPE MODAL)
      if (defaultCard && !useNewCard) {
        const order = prepareOrderData(defaultCard.payment_method_id);
        if (!order) throw new Error("Order data missing");

        const res = await fetch(`${API_BASE}/express_order`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(order),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Order creation failed");
        }

        // SUCCESS — NO STRIPE UI
        navigate("/thankyou", {
          state: {
            orderId: data.order_id,
            paymentStatus: "card_saved",
            paymentMethod: "saved_card",
            pickupDate: formatDateDDMMYYYY(collectDate),
            pickupTime: formatTimeRange24Hour(selectedCollectSlot.start, selectedCollectSlot.end),
            deliveryDate: formatDateDDMMYYYY(deliverDate),
            deliveryTime: formatTimeRange24Hour(selectedDeliverSlot.start, selectedDeliverSlot.end),
          },
        });

        return;
      }

      // CASE 2: ADD NEW CARD (OPEN STRIPE MODAL)
      const setupData = await createSetupIntent();

      if (!setupData || !setupData.setupIntentClientSecret) {
        showToast("Failed to initialize card setup. Please try again.");
        return;
      }

      setSetupClientSecret(setupData.setupIntentClientSecret);
      setCustomerId(setupData.customerId || customerId);
      setShowPaymentSetup(true);

    } catch (error) {
      console.error("Confirm booking error:", error);
      showToast(error.message || "Booking failed. Please try again.");
    } finally {
      setSetupProcessing(false);
    }
  };

  // NEW FUNCTION: Handle "Use Another Card" directly
  const handleUseAnotherCard = async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    // BASIC VALIDATIONS
    if (!selectedCollectSlot || !selectedDeliverSlot) {
      showToast("Please select pickup and delivery slots");
      return;
    }

    if (!selectedDeliveryId) {
      showToast("Please select a delivery address");
      return;
    }

    if (!useSameAddress && !selectedPickupId) {
      showToast("Please select a pickup address");
      return;
    }

    setUseNewCard(true);
    setSetupProcessing(true);

    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("Authentication required");

      // Create setup intent for new card
      const setupData = await createSetupIntent();

      if (!setupData || !setupData.setupIntentClientSecret) {
        showToast("Failed to initialize card setup. Please try again.");
        return;
      }

      setSetupClientSecret(setupData.setupIntentClientSecret);
      setCustomerId(setupData.customerId || customerId);
      setShowPaymentSetup(true);

    } catch (error) {
      console.error("Use another card error:", error);
      showToast(error.message || "Failed to setup new card. Please try again.");
    } finally {
      setSetupProcessing(false);
    }
  };

  // NEW FUNCTION: Handle "Back to Saved Card"
  const handleBackToSavedCard = () => {
    setUseNewCard(false);
    setShowPaymentSetup(false);
  };

  // Helper function to get card brand class
  const getCardBrandClass = (brand) => {
    if (!brand) return '';
    const brandLower = brand.toLowerCase();
    if (brandLower.includes('visa')) return 'card-brand-visa';
    if (brandLower.includes('mastercard')) return 'card-brand-mastercard';
    if (brandLower.includes('amex') || brandLower.includes('american express')) return 'card-brand-amex';
    if (brandLower.includes('discover')) return 'card-brand-discover';
    if (brandLower.includes('jcb')) return 'card-brand-jcb';
    if (brandLower.includes('diners')) return 'card-brand-diners';
    if (brandLower.includes('unionpay')) return 'card-brand-unionpay';
    return '';
  };

  /* ----------------------------- UI Handlers ------------------------------ */

  const handleAddAddressClick = () => {
    if (!user) {
      setShowLogin(true);
    } else {
      setShowAddForm(true);
    }
  };

  const handleCollectDateChange = (e) => {
    if (!user) {
      setShowLogin(true);
      return;
    }

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
    if (!user) {
      setShowLogin(true);
      return;
    }

    const newDate = e.target.value;

    if (collectDate && newDate < collectDate) {
      showToast("Delivery date cannot be before pickup date");
      return;
    }

    // ✅ Check if pickup is today and after 10 AM, and user tries to select same day
    if (pickupIsToday() && !pickupBefore10() && newDate === collectDate) {
      showToast("Same-day delivery is disabled after 10:00. Please select tomorrow or later.");
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
    const end = new Date(slot.end);
    
    setSelectedCollectSlot(slot);
    setSelectedCollectSlotStart(start);
    setSelectedCollectSlotEnd(end);

    // Reset delivery when pickup changes
    setSelectedDeliverSlot(null);
    setSelectedDeliverSlotStart(null);
    setSelectedDeliverSlotEnd(null);
    setDeliverSlots([]);

    // ✅ Adjust delivery date if pickup is today and after 10:00 (same as mobile app)
    if (pickupIsToday() && start.getHours() >= 10) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      // Only adjust if delivery date is same as pickup date
      if (deliverDate && isSameDay(new Date(deliverDate), new Date(collectDate))) {
        setDeliverDate(tomorrowStr);
        showToast("Same-day delivery is disabled after 10:00. Delivery date moved to tomorrow.");
      }
    }
  };

  const handleDeliverSlotSelect = (slot) => {
    if (!slot.enabled) return;
    
    const start = new Date(slot.start);
    const end = new Date(slot.end);
    
    setSelectedDeliverSlot(slot);
    setSelectedDeliverSlotStart(start);
    setSelectedDeliverSlotEnd(end);
  };

  const handleToggleSameAddress = (e) => {
    if (!user) {
      setShowLogin(true);
      e.preventDefault();
      return;
    }

    const checked = e.target.checked;
    setUseSameAddress(checked);
    if (checked && selectedDeliveryId) {
      setSelectedPickupId(selectedDeliveryId);
    }
  };

  /* ----------------------------- Effects ------------------------------ */

  useEffect(() => {
    if (user && collectDate) {
      fetchCollectSlots();
    }
  }, [user, collectDate, fetchCollectSlots]);

  useEffect(() => {
    if (user && deliverDate && selectedCollectSlotStart) {
      fetchDeliverySlots();
    }
  }, [user, deliverDate, selectedCollectSlotStart, fetchDeliverySlots]);

  // Reset delivery when pickup date changes
  useEffect(() => {
    setSelectedDeliverSlot(null);
    setSelectedDeliverSlotStart(null);
    setSelectedDeliverSlotEnd(null);
    setDeliverSlots([]);
  }, [collectDate]);

  const today = new Date().toISOString().split("T")[0];
  
  // Calculate min delivery date based on mobile app logic
  const minDeliveryDate = (() => {
    if (!collectDate) return today;
    
    // If pickup is today and after 10:00, delivery must be tomorrow
    if (pickupIsToday() && selectedCollectSlotStart && selectedCollectSlotStart.getHours() >= 10) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    
    return collectDate;
  })();

  const isConfirmButtonDisabled = () => {
    if (!user) return true;
    if (loading || setupProcessing) return true;
    if (addresses.length === 0) return true;
    if (!selectedDeliveryId) return true;
    if (!useSameAddress && !selectedPickupId) return true;
    if (!selectedCollectSlot || !selectedDeliverSlot) return true;
    return false;
  };

  /* ---------------------------------- JSX --------------------------------- */

  return (
    <div className="qb-page">
      {/* Main content */}
      <main className="qb-container">
        <div className="qb-title-section">
          <h1 className="qb-title">Quick Booking</h1>
          <p className="qb-subtitle">
            Skip the item selection and book your laundry service in just a few clicks.
            We'll handle everything from pickup to delivery.
          </p>
          <div className="qb-payment-info">
            <i className="fas fa-info-circle"></i>
            <span>
              <strong>Card required for booking.</strong> No upfront charge. 
              Card saved as default for auto-payment after invoice (£{MINIMUM_ORDER_AMOUNT} min + £{SERVICE_CHARGE} service fee).
            </span>
          </div>
        </div>

        {!user && (
          <div className="qb-login-prompt">
            <div className="qb-login-icon">
              <i className="fas fa-user-circle"></i>
            </div>
            <div className="qb-login-content">
              <h3 className="qb-login-title">Login Required</h3>
              <p className="qb-login-text">
                Please login to save addresses and complete your booking. Don't have an
                account? Sign up in seconds.
              </p>
            </div>
            <button className="qb-login-btn" onClick={() => setShowLogin(true)}>
              <i className="fas fa-sign-in-alt"></i> Login / Sign Up
            </button>
          </div>
        )}

        {loading ? (
          <div className="qb-loading">
            <div className="qb-loading-spinner"></div>
            <p>Loading your information...</p>
          </div>
        ) : (
          <>
            {/* DELIVERY ADDRESS SECTION */}
            {user && (
              <div className="qb-card">
                <div className="qb-card-header">
                  <div className="qb-card-icon">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <h2 className="qb-card-title">Delivery Address</h2>
                </div>

                {addresses.length === 0 ? (
                  <div className="qb-add-address" onClick={handleAddAddressClick}>
                    <i className="fas fa-plus qb-add-icon"></i>
                    <span className="qb-add-text">Add Your First Address</span>
                    <p className="qb-notes-hint">
                      Click to add your delivery address
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="qb-address-grid">
                      {addresses.map((addr) => (
                        <div
                          key={addr.address_id}
                          className={`qb-address-card ${
                            selectedDeliveryId === String(addr.address_id)
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => {
                            setSelectedDeliveryId(String(addr.address_id));
                            if (useSameAddress) setSelectedPickupId(String(addr.address_id));
                          }}
                        >
                          <div className="qb-address-header">
                            <h3 className="qb-address-name">
                              <i className="fas fa-map-marker-alt qb-address-type-icon"></i>
                              {addr.name || addr.address_type || "Address"}
                            </h3>
                            <div className="qb-address-actions">
                              {addr.is_selected && (
                                <span className="qb-default-badge">Default</span>
                              )}
                            </div>
                          </div>
                          <div className="qb-address-details">
                            <div className="qb-address-line">
                              <strong>{addr.name}</strong>
                            </div>
                            {addr.phone && (
                              <div className="qb-address-line">{addr.phone}</div>
                            )}
                            {(addr.house_number || addr.street_name) && (
                              <div className="qb-address-line">
                                {addr.house_number} {addr.street_name}
                              </div>
                            )}
                            {(addr.city || addr.area) && (
                              <div className="qb-address-line">
                                {addr.city}, {addr.area}
                              </div>
                            )}
                            {addr.postcode && (
                              <div className="qb-address-line">
                                Postcode: {addr.postcode}
                              </div>
                            )}
                          </div>
                          {selectedDeliveryId === String(addr.address_id) && (
                            <div className="qb-address-check">
                              <i className="fas fa-check-circle"></i>
                            </div>
                          )}
                        </div>
                      ))}

                      <div className="qb-add-address" onClick={handleAddAddressClick}>
                        <i className="fas fa-plus qb-add-icon"></i>
                        <span className="qb-add-text">Add New Address</span>
                      </div>
                    </div>

                    <div className="qb-toggle">
                      <label className="qb-toggle-label">
                        <div className="qb-toggle-switch">
                          <input
                            type="checkbox"
                            checked={useSameAddress}
                            onChange={handleToggleSameAddress}
                          />
                          <span className="qb-toggle-slider"></span>
                        </div>
                        Use same address for pickup
                      </label>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* SCHEDULE PICKUP & DELIVERY SECTION */}
            {user && (
              <div className="qb-card">
                <div className="qb-card-header">
                  <div className="qb-card-icon">
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                  <h2 className="qb-card-title">Schedule Pickup & Delivery</h2>
                </div>

                <div className="qb-slot-container">
                  {/* Pickup Date */}
                  <div className="qb-date-slot-container">
                    <div className="qb-date-slot-header">
                      <i className="fas fa-truck-loading qb-date-slot-icon"></i>
                      <h3 className="qb-date-slot-title">Pickup Date & Time</h3>
                    </div>

                    <div className="qb-date-input">
                      <label className="qb-date-label">Select Pickup Date</label>
                      <input
                        type="date"
                        className="qb-date-field"
                        value={collectDate}
                        onChange={handleCollectDateChange}
                        min={today}
                      />
                      {collectDate && (
                        <p className="qb-date-display">
                          {formatDateDDMMYYYY(collectDate)}
                        </p>
                      )}
                    </div>

                    {collectDate && (
                      <div className="qb-slot-wrapper">
                        <label className="qb-slot-label">
                          Available Pickup Times (24-hour format)
                        </label>

                        {loadingSlots.collect ? (
                          <div className="qb-loading-slots">
                            <div className="qb-loading-spinner-small"></div>
                            <p>Loading available slots...</p>
                          </div>
                        ) : collectSlots.length === 0 ? (
                          <div className="qb-no-slots">
                            <i className="fas fa-calendar-times"></i>
                            <p>No slots available for this date</p>
                            <p className="qb-no-slots-hint">
                              Please select another date
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="qb-slot-scroll-container">
                              <div className="qb-slot-horizontal-scroll">
                                {collectSlots.map((slot, index) => (
                                  <button
                                    key={`collect-${slot.start}-${index}`}
                                    type="button"
                                    className={`qb-slot-chip ${
                                      selectedCollectSlot?.start === slot.start
                                        ? "selected"
                                        : ""
                                    } ${!slot.enabled ? "disabled" : ""}`}
                                    onClick={() => handleCollectSlotSelect(slot)}
                                    disabled={!slot.enabled}
                                    title={
                                      slot.enabled
                                        ? slot.displayLabel || formatTimeRange24Hour(slot.start, slot.end)
                                        : "Not available"
                                    }
                                  >
                                    <span className="qb-slot-time">
                                      {slot.displayLabel || formatTimeRange24Hour(slot.start, slot.end)}
                                    </span>
                                    {!slot.enabled && (
                                      <span className="qb-slot-disabled-overlay"></span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {selectedCollectSlot && (
                              <div className="qb-selected-slot-display">
                                <div className="qb-selected-slot-header">
                                  <i className="fas fa-check-circle qb-selected-icon"></i>
                                  <span>Selected Pickup Time</span>
                                </div>
                                <div className="qb-selected-slot-details">
                                  {formatDateTimeDisplay(collectDate, selectedCollectSlot.start)}
                                  {selectedCollectSlot.end && ` to ${formatTime24Hour(selectedCollectSlot.end)}`}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Delivery Date */}
                  <div className="qb-date-slot-container">
                    <div className="qb-date-slot-header">
                      <i className="fas fa-truck qb-date-slot-icon"></i>
                      <h3 className="qb-date-slot-title">Delivery Date & Time</h3>
                    </div>

                    <div className="qb-date-input">
                      <label className="qb-date-label">Select Delivery Date</label>
                      <input
                        type="date"
                        className="qb-date-field"
                        value={deliverDate}
                        onChange={handleDeliverDateChange}
                        min={minDeliveryDate}
                        disabled={!collectDate}
                      />
                      {deliverDate && (
                        <p className="qb-date-display">
                          {formatDateDDMMYYYY(deliverDate)}
                        </p>
                      )}
                      {!collectDate && (
                        <p className="qb-date-hint">
                          Select pickup date first
                        </p>
                      )}
                    </div>

                    {deliverDate && (
                      <div className="qb-slot-wrapper">
                        <label className="qb-slot-label">
                          Available Delivery Times (24-hour format)
                        </label>

                        {loadingSlots.deliver ? (
                          <div className="qb-loading-slots">
                            <div className="qb-loading-spinner-small"></div>
                            <p>Loading available slots...</p>
                          </div>
                        ) : deliverSlots.length === 0 ? (
                          <div className="qb-no-slots">
                            <i className="fas fa-calendar-times"></i>
                            <p>No slots available for this date</p>
                            <p className="qb-no-slots-hint">
                              {collectDate === deliverDate && pickupIsToday() && !pickupBefore10()
                                ? "Same-day delivery is disabled after 10:00"
                                : "Please select another date"}
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="qb-slot-scroll-container">
                              <div className="qb-slot-horizontal-scroll">
                                {deliverSlots.map((slot, index) => (
                                  <button
                                    key={`deliver-${slot.start}-${index}`}
                                    type="button"
                                    className={`qb-slot-chip ${
                                      selectedDeliverSlot?.start === slot.start
                                        ? "selected"
                                        : ""
                                    } ${!slot.enabled ? "disabled" : ""}`}
                                    onClick={() => handleDeliverSlotSelect(slot)}
                                    disabled={!slot.enabled}
                                    title={
                                      slot.enabled
                                        ? slot.displayLabel || formatTimeRange24Hour(slot.start, slot.end)
                                        : "Not available"
                                    }
                                  >
                                    <span className="qb-slot-time">
                                      {slot.displayLabel || formatTimeRange24Hour(slot.start, slot.end)}
                                    </span>
                                    {!slot.enabled && (
                                      <span className="qb-slot-disabled-overlay"></span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {selectedDeliverSlot && (
                              <div className="qb-selected-slot-display">
                                <div className="qb-selected-slot-header">
                                  <i className="fas fa-check-circle qb-selected-icon"></i>
                                  <span>Selected Delivery Time</span>
                                </div>
                                <div className="qb-selected-slot-details">
                                  {formatDateTimeDisplay(deliverDate, selectedDeliverSlot.start)}
                                  {selectedDeliverSlot.end && ` to ${formatTime24Hour(selectedDeliverSlot.end)}`}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SPECIAL INSTRUCTIONS SECTION */}
            {user && (
              <div className="qb-card">
                <div className="qb-card-header">
                  <div className="qb-card-icon">
                    <i className="fas fa-sticky-note"></i>
                  </div>
                  <h2 className="qb-card-title">Special Instructions</h2>
                </div>

                <textarea
                  className="qb-notes-field"
                  placeholder="Tell us about any special requirements, fabric types, stains, preferred detergent, or other instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                />
                <p className="qb-notes-hint">
                  Optional: Provide details to help us serve you better
                  {notes.length > 0 && (
                    <span className="qb-notes-counter"> ({notes.length}/500)</span>
                  )}
                </p>
              </div>
            )}

            {/* PAYMENT INFORMATION SECTION */}
            {user && (
              <div className="qb-card">
                <div className="payment-method-header">
                  <div className="payment-method-title">
                    <i className="fas fa-credit-card"></i>
                    <h2 className="qb-card-title">Payment Method</h2>
                  </div>
                  {savedCards.length > 0 && !showPaymentSetup && !useNewCard && (
                    <div className="payment-security-badge">
                      <i className="fas fa-shield-alt"></i>
                      <span>Secure Payment</span>
                    </div>
                  )}
                </div>

                {loadingCards ? (
                  <div className="saved-cards-loading">
                    <div className="saved-cards-loading-spinner"></div>
                    <p>Loading saved cards...</p>
                  </div>
                ) : savedCards.length > 0 && !useNewCard && !showPaymentSetup ? (
                  <>
                    <div className="saved-card-info">
                      <div className="saved-card-display">
                        <div className="saved-card-icon">
                          <i className={`fas fa-credit-card ${getCardBrandClass(savedCards.find(c => c.is_default)?.brand)}`}></i>
                        </div>
                        <div className="saved-card-details">
                          <div className="saved-card-brand">
                            {savedCards.find(c => c.is_default)?.brand?.toUpperCase() || 'CARD'}
                          </div>
                          <div className="saved-card-number">
                            •••• {savedCards.find(c => c.is_default)?.last4}
                          </div>
                          <div className="saved-card-default-badge">
                            <i className="fas fa-check-circle"></i>
                            Default Card
                          </div>
                        </div>
                      </div>
                      
                      <div className="payment-info-note">
                        <i className="fas fa-info-circle"></i>
                        <span>
                          Your saved card will be charged only after your laundry manager sends the invoice.
                          No upfront charges.
                        </span>
                      </div>
                    </div>

                    <div className="payment-actions-container">
                      <button 
                        className="qb-submit-btn" 
                        onClick={handleConfirmBooking}
                        disabled={isConfirmButtonDisabled() || setupProcessing}
                      >
                        {setupProcessing ? (
                          <>
                            <div className="payment-loading-spinner"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check-circle"></i>
                            Use Saved Card & Confirm Booking
                          </>
                        )}
                      </button>

                      <div className="or-divider">
                        <span>OR</span>
                      </div>

                      <button 
                        className="qb-link-btn use-another-card-btn" 
                        onClick={handleUseAnotherCard}
                        disabled={setupProcessing}
                      >
                        <i className="fas fa-credit-card"></i>
                        Pay with a different card
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {savedCards.length > 0 && (
                      <div className="back-to-saved-card">
                        <button 
                          className="back-to-saved-btn"
                          onClick={handleBackToSavedCard}
                        >
                          <i className="fas fa-arrow-left"></i>
                          Back to saved card
                        </button>
                      </div>
                    )}
                    
                    {!showPaymentSetup && (
                      <div className="add-new-card-prompt">
                        <div className="add-card-icon">
                          <i className="fas fa-credit-card"></i>
                        </div>
                        <div className="add-card-content">
                          <h3 className="add-card-title">
                            {savedCards.length > 0 ? "Add Another Payment Method" : "Add Payment Method"}
                          </h3>
                          <p className="add-card-description">
                            Your card will be securely saved for future payments. 
                            No charges until your laundry manager sends the invoice.
                          </p>
                        </div>
                        <button 
                          className="qb-submit-btn add-card-btn" 
                          onClick={handleUseAnotherCard}
                          disabled={isConfirmButtonDisabled() || setupProcessing}
                        >
                          {setupProcessing ? (
                            <>
                              <div className="payment-loading-spinner"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-plus-circle"></i>
                              Add Card & Confirm Booking
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="qb-actions">
              <button
                type="button"
                className="qb-cancel-btn"
                onClick={() => navigate("/")}
              >
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          </>
        )}
      </main>

      {/* Payment Setup Modal - This renders on top of everything */}
      {showPaymentSetup && (
        <div className="payment-modal-backdrop">
          <div className="payment-modal">
            {!setupClientSecret ? (
              <div className="payment-loading-state">
                <div className="payment-loading-spinner"></div>
                <p>Initializing secure payment…</p>
              </div>
            ) : (
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
                />
              </Elements>
            )}
          </div>
        </div>
      )}

      {/* Other modals */}
      {showAddForm && user && (
        <AddAddressModal
          open={true}
          onClose={() => setShowAddForm(false)}
          onSaved={fetchAddresses}
          apiBase={API_BASE}
        />
      )}

      {showLogin && (
        <LoginPopup 
          close={() => setShowLogin(false)} 
          onSuccess={() => {
            setShowLogin(false);
            fetchAddresses();
            ensureStripeCustomer();
            fetchSavedCards();
          }} 
        />
      )}

      {toast && (
        <div className="qb-toast">
          <i className="fas fa-info-circle"></i>
          {toast}
        </div>
      )}
    </div>
  );
}