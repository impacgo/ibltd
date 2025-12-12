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
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const API_BASE = "https://api.ironingboy.com";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(
  "pk_live_51SUiy73fSKIcHb6THsEQatj2g1tJOjUhzaym490HNFobNn6gOtdzpelQnV2knmKkXPiqxKqJjwEQ6dtSNRKuO4yx00HFqYnkEI"
);

/* -------------------------------------------------------------------------- */
/*                          Stripe Payment Form (UI)                          */
/* -------------------------------------------------------------------------- */

const StripePaymentForm = ({
  orderData,
  onPaymentSuccess,
  onPaymentError,
  onCancel,
  paymentProcessing,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setError(null);
    setSubmitting(true);

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required", // stay on page unless 3DS requires redirect
      });

      if (stripeError) {
        setError(stripeError.message);
        onPaymentError(stripeError.message);
        setSubmitting(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        onPaymentSuccess(paymentIntent);
      } else {
        const msg = `Payment was not successful: ${paymentIntent?.status}`;
        setError(msg);
        onPaymentError(msg);
      }
    } catch (err) {
      const msg = err.message || "Payment failed. Please try again.";
      setError(msg);
      onPaymentError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="stripe-payment-modal">
      <div className="payment-header">
        <h3>Complete Your Payment</h3>
        <p>Secure payment processed by Stripe</p>
      </div>

      <div className="payment-summary">
        <div className="summary-item">
          <span>Service</span>
          <span>Express Laundry Booking</span>
        </div>
        <div className="summary-item">
          <span>Minimum Order</span>
          <span>£{(orderData.total_amount / 100).toFixed(2)}</span>
        </div>
        <div className="summary-total">
          <span>Total Amount</span>
          <span>£{(orderData.total_amount / 100).toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-group">
          <label htmlFor="payment-element">Payment Details</label>
          <div className="card-element-wrapper">
            <PaymentElement id="payment-element" />
          </div>
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
            className="payment-cancel-btn"
            onClick={onCancel}
            disabled={paymentProcessing || submitting}
          >
            <i className="fas fa-times"></i> Cancel
          </button>
          <button
            type="submit"
            className="payment-submit-btn"
            disabled={!stripe || paymentProcessing || submitting}
          >
            {(paymentProcessing || submitting) ? (
              <>
                <div className="payment-spinner"></div>
                Processing...
              </>
            ) : (
              <>
                <i className="fas fa-lock"></i>
                Pay £{(orderData.total_amount / 100).toFixed(2)}
              </>
            )}
          </button>
        </div>
      </form>

      <div className="payment-security">
        <div className="security-badges">
          <i className="fas fa-shield-alt"></i>
          <span>Secure SSL Encryption</span>
        </div>
        <div className="security-badges">
          <i className="fab fa-cc-stripe"></i>
          <span>Powered by Stripe</span>
        </div>
      </div>
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
  const [showPayment, setShowPayment] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const [loadingSlots, setLoadingSlots] = useState({
    collect: false,
    deliver: false,
  });

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

  const [orderData, setOrderData] = useState(null);

  const [debugInfo, setDebugInfo] = useState({
    lastApiCall: null,
    lastError: null,
    timezoneOffset: null,
  });

  const [notes, setNotes] = useState("");

  const [discountData, setDiscountData] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [finalTotal, setFinalTotal] = useState(20.0); // default £20
  const [topUpAmount, setTopUpAmount] = useState(0);
  const [minimumOrderAmount, setMinimumOrderAmount] = useState(20.0);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [calculatingDiscount, setCalculatingDiscount] = useState(false);

  // Stripe client secret from backend
  const [paymentClientSecret, setPaymentClientSecret] = useState(null);

  /* ----------------------- Init / cleanup on mount ----------------------- */

  const clearBookingData = useCallback(() => {
    setCollectDate("");
    setDeliverDate("");
    setCollectSlots([]);
    setDeliverSlots([]);
    setSelectedCollectSlot(null);
    setSelectedDeliverSlot(null);
    setNotes("");
    setUseSameAddress(true);
    setOrderData(null);
    setPaymentClientSecret(null);
    localStorage.removeItem("quickBookingOrder");
  }, []);

  useEffect(() => {
    const tzOffset = -new Date().getTimezoneOffset();
    setDebugInfo((prev) => ({ ...prev, timezoneOffset: tzOffset }));

    clearBookingData();

    if (user) {
      fetchAddresses();
    }

    const handleBeforeUnload = () => {
      clearBookingData();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user, clearBookingData]);

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

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch addresses: ${res.status} - ${errorText}`);
      }

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
      setDebugInfo((prev) => ({ ...prev, lastError: e.message }));
      showToast("Unable to load addresses");
    } finally {
      setLoading(false);
    }
  }, []);

  const setDefaultAddress = useCallback(async (addressId) => {
    const token = localStorage.getItem("jwtToken");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/addresses/${addressId}/select`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to set default address: ${res.status} - ${errorText}`);
      }

      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          is_selected: String(addr.address_id) === String(addressId),
        }))
      );
    } catch (error) {
      showToast("Unable to update default address");
    }
  }, []);

  /* --------------------------- Utility functions -------------------------- */

  const normalizeTimeFormat = (timeString) => {
    if (!timeString) return "";
    if (timeString.includes(",") && timeString.includes("-")) return timeString;

    if (timeString.includes("T") && timeString.includes(".000")) {
      try {
        const cleanTimeString = timeString.replace(/(\.\d{3})\d+/, "$1");
        const date = new Date(cleanTimeString);
        if (isNaN(date.getTime())) return timeString;

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;

        return `${day}/${month}/${year}, ${displayHours}:${minutes} ${ampm}`;
      } catch {
        return timeString;
      }
    }

    try {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;

        return `${day}/${month}/${year}, ${displayHours}:${minutes} ${ampm}`;
      }
    } catch {
      return timeString;
    }

    return timeString;
  };

  const fetchTimeSlots = useCallback(
    async (dateIso, isDelivery = false) => {
      if (!dateIso || !user) return [];

      const tzOffset = -new Date().getTimezoneOffset();

      try {
        const params = new URLSearchParams({
          date: dateIso,
          tzOffset: tzOffset.toString(),
          isDelivery: isDelivery.toString(),
          format: "12",
        });

        if (isDelivery && selectedCollectSlot && collectDate) {
          const pickupTime = new Date(selectedCollectSlot.start);
          const pickupSlotStart = `${pickupTime
            .getUTCHours()
            .toString()
            .padStart(2, "0")}:${pickupTime
            .getUTCMinutes()
            .toString()
            .padStart(2, "0")}`;

          params.set("pickupDate", collectDate);
          params.set("pickupSlotStart", pickupSlotStart);
        }

        const url = `${API_BASE}/time-slots?${params.toString()}`;
        const res = await fetch(url);

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch slots: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        const normalizedSlots = (data.slots || []).map((slot) => ({
          ...slot,
          label: slot.label ? normalizeTimeFormat(slot.label) : slot.label,
        }));

        setDebugInfo((prev) => ({
          ...prev,
          lastApiCall: {
            url,
            date: dateIso,
            isDelivery,
            timestamp: new Date().toISOString(),
            slotsCount: normalizedSlots.length || 0,
          },
        }));

        return normalizedSlots;
      } catch (error) {
        setDebugInfo((prev) => ({ ...prev, lastError: error.message }));
        showToast("Unable to load available time slots");
        return [];
      }
    },
    [user, selectedCollectSlot, collectDate]
  );

  const fetchCollectSlots = useCallback(async () => {
    if (!collectDate || !user) return;
    setLoadingSlots((prev) => ({ ...prev, collect: true }));

    try {
      const slots = await fetchTimeSlots(collectDate, false);
      setCollectSlots(slots);

      if (selectedCollectSlot) {
        const normalizedSelectedStart = normalizeTimeFormat(selectedCollectSlot.start);
        const stillValid = slots.find(
          (s) => normalizeTimeFormat(s.start) === normalizedSelectedStart && s.enabled
        );
        if (!stillValid) setSelectedCollectSlot(null);
      }
    } catch {
      setCollectSlots([]);
      setSelectedCollectSlot(null);
    } finally {
      setLoadingSlots((prev) => ({ ...prev, collect: false }));
    }
  }, [collectDate, fetchTimeSlots, user, selectedCollectSlot]);

  const fetchDeliverySlots = useCallback(async () => {
    if (!deliverDate || !user) return;
    setLoadingSlots((prev) => ({ ...prev, deliver: true }));

    try {
      const slots = await fetchTimeSlots(deliverDate, true);
      setDeliverSlots(slots);

      if (selectedDeliverSlot) {
        const normalizedSelectedStart = normalizeTimeFormat(selectedDeliverSlot.start);
        const stillValid = slots.find(
          (s) => normalizeTimeFormat(s.start) === normalizedSelectedStart && s.enabled
        );
        if (!stillValid) setSelectedDeliverSlot(null);
      }
    } catch {
      setDeliverSlots([]);
      setSelectedDeliverSlot(null);
    } finally {
      setLoadingSlots((prev) => ({ ...prev, deliver: false }));
    }
  }, [deliverDate, fetchTimeSlots, user, selectedDeliverSlot]);

  const handleSelectAddress = useCallback(
    async (id, isDelivery = true) => {
      if (!user) {
        setShowLogin(true);
        return;
      }

      const addr = addresses.find((a) => String(a.address_id) === String(id));
      if (!addr) return;

      if (isDelivery) {
        setSelectedDeliveryId(id);
        await setDefaultAddress(id);
        if (useSameAddress) setSelectedPickupId(id);
      } else {
        setSelectedPickupId(id);
      }
    },
    [addresses, useSameAddress, setDefaultAddress, user]
  );

  const handleLoggedIn = () => {
    setShowLogin(false);
    fetchAddresses();
  };

  const handleAddressSaved = (newAddress) => {
    setAddresses((prev) => [...prev, newAddress]);
    const id = String(newAddress.address_id);
    setSelectedDeliveryId(id);
    setSelectedPickupId(id);
    setShowAddForm(false);
    showToast("Address added successfully!");
  };

  const calculateDiscountAndServiceCharge = useCallback(async () => {
    if (!user) return;

    const subtotal = 20.0;
    setCalculatingDiscount(true);

    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) return;

      const url = `${API_BASE}/calculate-discount?amount=${subtotal}`;
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 200) {
        const serviceChargeVal = parseFloat(data.serviceCharge || 0);
        const minimumOrderAmountVal = parseFloat(data.minimumOrderAmount || 20.0);
        const topUpAmountVal = parseFloat(data.topupAmount || 0);
        const finalTotalVal = parseFloat(data.finalTotal || subtotal);

        setServiceCharge(serviceChargeVal);
        setMinimumOrderAmount(minimumOrderAmountVal);
        setTopUpAmount(topUpAmountVal);
        setFinalTotal(finalTotalVal);

        if (data.success === true) {
          setDiscountData(data);
          setDiscountPercent(parseFloat(data.discountPercent || 0));
          setDiscountAmount(parseFloat(data.discountAmount || 0));
          setDiscountApplied(true);
        } else {
          setDiscountApplied(false);
        }
      }
    } catch {
      // ignore: fallback is no discount
    } finally {
      setCalculatingDiscount(false);
    }
  }, [user]);

  const prepareOrderData = useCallback(() => {
    if (!selectedCollectSlot || !selectedDeliverSlot) return null;

    const order = {
      address_id: selectedDeliveryId,
      pickup_address_id: useSameAddress ? selectedDeliveryId : selectedPickupId,
      use_same_address: useSameAddress,

      // ✅ FIX: Use backend slot label directly
      collect_slot: selectedCollectSlot.label,
      delivery_slot: selectedDeliverSlot.label,

      notes: notes.trim() || null,
      images: [],
      change_manager_requested: false,
      subtotal: 20.0,
      discount_percent: discountApplied ? discountPercent : 0,
      discount_amount: discountApplied ? discountAmount : 0,
      service_charge: serviceCharge,
      topup_amount: topUpAmount,
      total_amount: Math.round(finalTotal * 100),
      currency: "gbp",
    };

    return order;
  }, [
    selectedCollectSlot,
    selectedDeliverSlot,
    selectedDeliveryId,
    selectedPickupId,
    useSameAddress,
    notes,
    discountApplied,
    discountPercent,
    discountAmount,
    serviceCharge,
    topUpAmount,
    finalTotal,
  ]);

  const handlePaymentSuccess = async (paymentIntent) => {
    setPaymentProcessing(true);

    try {
      const order = prepareOrderData();
      if (!order) throw new Error("Order data is missing");

      order.payment_intent_id = paymentIntent.id;
      order.payment_status = paymentIntent.status;

      const token = localStorage.getItem("jwtToken");
      if (!token) throw new Error("No authentication token found");

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

      clearBookingData();
      setShowPayment(false);
      setShowSuccess(true);

      setTimeout(() => {
        navigate("/orders", { state: { orderId: data.order_id, isExpress: true } });
      }, 1500);
    } catch (error) {
      showToast(error.message || "Failed to create order");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handlePaymentError = (errorMessage) => {
    showToast(errorMessage || "Payment failed. Please try again.");
  };

  /* ------------------------- Confirm booking flow ------------------------- */

  const handleConfirmBooking = async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    // ✅ FIX: Check if addresses are loaded and selected
    if (addresses.length === 0) {
      showToast("Please add a delivery address first");
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

    if (!selectedCollectSlot) {
      showToast("Please select a collection time");
      return;
    }

    if (!selectedDeliverSlot) {
      showToast("Please select a delivery time");
      return;
    }

    // ✅ FIX: Don't await calculateDiscountAndServiceCharge before showing payment
    // Just set loading states and proceed with payment
    setPaymentProcessing(true);

    try {
      // Calculate discount in background
      await calculateDiscountAndServiceCharge();

      const preparedOrder = prepareOrderData();
      if (!preparedOrder) {
        showToast("Failed to prepare order data");
        setPaymentProcessing(false);
        return;
      }

      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`${API_BASE}/stripe/create-payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          amount: preparedOrder.total_amount, // already in pence
          currency: "gbp",
          metadata: {
            order_type: "express_order",
            order_data: JSON.stringify(preparedOrder),
          },
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.clientSecret) {
        throw new Error(data.error || "Failed to start payment. Please try again.");
      }

      setOrderData(preparedOrder);
      setPaymentClientSecret(data.clientSecret);
      setShowPayment(true);
    } catch (error) {
      showToast(error.message || "Unable to start payment");
    } finally {
      setPaymentProcessing(false);
      setCalculatingDiscount(false);
    }
  };

  /* ----------------------------- UI helpers ------------------------------ */

  const formatTimeDisplay = (timeString) => {
    try {
      const normalizedTime = normalizeTimeFormat(timeString);
      const timeMatch = normalizedTime.match(/(\d{1,2}:\d{2}\s*[AP]M)/i);
      if (timeMatch) return timeMatch[1];

      const time = new Date(timeString);
      return time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

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

    // ✅ FIX: Reset delivery date if pickup date changes to later date
    if (deliverDate && newDate > deliverDate) {
      const tomorrow = new Date(newDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowFormatted = tomorrow.toISOString().split("T")[0];
      setDeliverDate(tomorrowFormatted);
      setSelectedDeliverSlot(null);
    }

    if (newDate) {
      setTimeout(() => {
        fetchCollectSlots();
      }, 100);
    }
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

    setDeliverDate(newDate);
    setSelectedDeliverSlot(null);

    if (newDate) {
      setTimeout(() => {
        fetchDeliverySlots();
      }, 100);
    }
  };

  const handleCollectSlotSelect = (slot) => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    if (!slot.enabled) {
      showToast("This time slot is not available");
      return;
    }

    setSelectedCollectSlot(slot);

    // ✅ FIX: If same day, refetch delivery slots to ensure 8-hour gap
    if (collectDate === deliverDate) {
      setTimeout(() => {
        fetchDeliverySlots();
      }, 100);
    }
  };

  const handleDeliverSlotSelect = (slot) => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    if (!slot.enabled) {
      showToast("This time slot is not available");
      return;
    }

    setSelectedDeliverSlot(slot);
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

  useEffect(() => {
    if (user && collectDate) {
      fetchCollectSlots();
    }
  }, [user, collectDate, fetchCollectSlots]);

  useEffect(() => {
    if (user && deliverDate) {
      fetchDeliverySlots();
    }
  }, [user, deliverDate, fetchDeliverySlots]);

  // ✅ FIX: Calculate button disabled state properly
  const isConfirmButtonDisabled = () => {
    if (!user) return true;
    if (loading || paymentProcessing || calculatingDiscount) return true;
    if (addresses.length === 0) return true;
    if (!selectedDeliveryId) return true;
    if (!useSameAddress && !selectedPickupId) return true;
    if (!selectedCollectSlot || !selectedDeliverSlot) return true;
    return false;
  };

  const today = new Date().toISOString().split("T")[0];
  const minDeliveryDate = collectDate || today;

  const getAddressIcon = (type) => {
    switch ((type || "").toLowerCase()) {
      case "home":
        return "fas fa-home";
      case "office":
      case "work":
        return "fas fa-building";
      case "hotel":
        return "fas fa-hotel";
      default:
        return "fas fa-map-marker-alt";
    }
  };

  const formatAddressDisplay = (address) => {
    const parts = [];

    if (address.name) {
      parts.push(
        <div key="name" className="qb-address-line">
          <strong>{address.name}</strong>
        </div>
      );
    }

    if (address.phone) {
      parts.push(
        <div key="phone" className="qb-address-line">
          {address.phone}
        </div>
      );
    }

    if (address.house_number || address.street_name) {
      const streetLine = [address.house_number, address.street_name]
        .filter(Boolean)
        .join(" ");
      if (streetLine) {
        parts.push(
          <div key="street" className="qb-address-line">
            {streetLine}
          </div>
        );
      }
    }

    if (address.city || address.area) {
      const cityLine = [address.city, address.area].filter(Boolean).join(", ");
      if (cityLine) {
        parts.push(
          <div key="city" className="qb-address-line">
            {cityLine}
          </div>
        );
      }
    }

    if (address.state || address.country) {
      const stateLine = [address.state, address.country].filter(Boolean).join(", ");
      if (stateLine) {
        parts.push(
          <div key="state" className="qb-address-line">
            {stateLine}
          </div>
        );
      }
    }

    if (address.postcode) {
      parts.push(
        <div key="postcode" className="qb-address-line">
          Postcode: {address.postcode}
        </div>
      );
    }

    if (address.full_address && parts.length <= 2) {
      parts.push(
        <div key="full" className="qb-address-line qb-address-full">
          <small>{address.full_address}</small>
        </div>
      );
    }

    return parts;
  };

  /* ---------------------------------- JSX --------------------------------- */

  return (
    <div className="qb-page">
      <main className="qb-container">
        <div className="qb-title-section">
          <h1 className="qb-title">Quick Booking</h1>
          <p className="qb-subtitle">
            Skip the item selection and book your laundry service in just a few clicks.
            We'll handle everything from pickup to delivery.
          </p>
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
                          onClick={() => handleSelectAddress(addr.address_id)}
                        >
                          <div className="qb-address-header">
                            <h3 className="qb-address-name">
                              <i
                                className={`${getAddressIcon(
                                  addr.address_type
                                )} qb-address-type-icon`}
                              ></i>
                              {addr.name || addr.address_type || "Address"}
                            </h3>
                            {addr.is_selected && (
                              <span className="qb-default-badge">Default</span>
                            )}
                          </div>
                          <div className="qb-address-details">
                            {formatAddressDisplay(addr)}
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

                    {!useSameAddress && (
                      <div style={{ marginTop: "24px" }}>
                        <h3
                          className="qb-card-title"
                          style={{ fontSize: "18px", marginBottom: "16px" }}
                        >
                          <i
                            className="fas fa-truck-pickup"
                            style={{ marginRight: "8px" }}
                          ></i>
                          Pickup Address
                        </h3>
                        <div className="qb-address-grid">
                          {addresses.map((addr) => (
                            <div
                              key={`pickup-${addr.address_id}`}
                              className={`qb-address-card ${
                                selectedPickupId === String(addr.address_id)
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() => handleSelectAddress(addr.address_id, false)}
                            >
                              <div className="qb-address-header">
                                <h3 className="qb-address-name">
                                  <i
                                    className={`${getAddressIcon(
                                      addr.address_type
                                    )} qb-address-type-icon`}
                                  ></i>
                                  {addr.name || addr.address_type || "Pickup"}
                                </h3>
                              </div>
                              <div className="qb-address-details">
                                {formatAddressDisplay(addr)}
                              </div>
                              {selectedPickupId === String(addr.address_id) && (
                                <div className="qb-address-check">
                                  <i className="fas fa-check-circle"></i>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

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
                          {formatDateDisplay(collectDate)}
                        </p>
                      )}
                    </div>

                    {collectDate && (
                      <div className="qb-slot-wrapper">
                        <label className="qb-slot-label">
                          Available Pickup Times
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
                                        ? slot.label
                                        : "Not available"
                                    }
                                  >
                                    <span className="qb-slot-time">
                                      {slot.label || formatTimeDisplay(slot.start)}
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
                                  {selectedCollectSlot.label ||
                                    formatTimeDisplay(selectedCollectSlot.start)}
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
                          {formatDateDisplay(deliverDate)}
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
                          Available Delivery Times
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
                              {collectDate === deliverDate
                                ? "Delivery must be at least 4 hours after pickup"
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
                                        ? slot.label
                                        : "Not available"
                                    }
                                  >
                                    <span className="qb-slot-time">
                                      {slot.label || formatTimeDisplay(slot.start)}
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
                                  {selectedDeliverSlot.label ||
                                    formatTimeDisplay(selectedDeliverSlot.start)}
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

            <div className="qb-actions">
              <button
                type="button"
                className="qb-cancel-btn"
                onClick={() => navigate("/")}
              >
                <i className="fas fa-times"></i> Cancel
              </button>

              <button
                type="button"
                className="qb-submit-btn"
                onClick={handleConfirmBooking}
                disabled={isConfirmButtonDisabled()}
              >
                <i className="fas fa-check-circle"></i>
                {paymentProcessing
                  ? "Processing..."
                  : calculatingDiscount
                  ? "Calculating..."
                  : loading
                  ? "Processing..."
                  : `Confirm Booking (£${finalTotal.toFixed(2)})`}
              </button>
            </div>
          </>
        )}
      </main>

      {/* Payment Modal */}
      {showPayment && orderData && paymentClientSecret && (
        <div className="payment-modal-backdrop">
          <div className="payment-modal">
            <Elements
              stripe={stripePromise}
              options={{ clientSecret: paymentClientSecret }}
            >
              <StripePaymentForm
                orderData={orderData}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                onCancel={() => setShowPayment(false)}
                paymentProcessing={paymentProcessing}
              />
            </Elements>
          </div>
        </div>
      )}

      {showAddForm && user && (
        <AddAddressModal
          open={true}
          onClose={() => setShowAddForm(false)}
          onSaved={handleAddressSaved}
          apiBase={API_BASE}
        />
      )}

      {showLogin && (
        <LoginPopup close={() => setShowLogin(false)} onSuccess={handleLoggedIn} />
      )}

      {showSuccess && (
        <SuccessModal
          open={true}
          title="Booking Confirmed!"
          subtitle="Your quick laundry booking has been successfully placed. We'll contact you soon."
          onClose={() => setShowSuccess(false)}
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