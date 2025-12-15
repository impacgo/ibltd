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
  "pk_live_51SUiy73fSKIcHb6THsEQatj2g1tJOjUhzaym490HNFobNn6gOtdzpelQnV2knmKkXPiqxKqJjwEQ6dtSNRKuO4yx00HFqYnkEI"
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
  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
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

    // ✅ SUCCESS — card saved safely for off-session use
    await onSetupSuccess(setupIntent);

  } catch (err) {
    setError(err.message || "Card save failed");
    onSetupError(err.message);
  } finally {
    setSubmitting(false);
  }
};
const [selectedCollectSlotStart, setSelectedCollectSlotStart] = useState(null);
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const pickupIsToday = () => {
  if (!collectDate) return false;
  const today = new Date();
  const d = new Date(collectDate);
  return isSameDay(today, d);
};

const pickupBefore10 = () => {
  if (!selectedCollectSlotStart) return false;
  return selectedCollectSlotStart.getHours() < 10;
};
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

  const minDeliveryTime = new Date(pickupDateTime.getTime() + 8 * 60 * 60 * 1000);

  return slots.filter((slot) => {
    const start = new Date(slot.start);
    return start >= minDeliveryTime;
  });
};



  return (
    <div className="stripe-payment-modal">
      <div className="payment-header">
        <h3>Save Your Payment Method</h3>
        <p>Your card will be charged only after invoice is issued</p>
      </div>

      <form onSubmit={handleSubmit} className="payment-form">
        <PaymentElement />

        {error && (
          <div className="payment-error">
            <span>{error}</span>
          </div>
        )}

        <div className="payment-actions">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting || setupProcessing}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!stripe || submitting || setupProcessing}
          >
            {submitting ? "Saving Card..." : "Save Card & Confirm Booking"}
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

  const [debugInfo, setDebugInfo] = useState({
    lastApiCall: null,
    lastError: null,
    timezoneOffset: null,
  });

  const [notes, setNotes] = useState("");

  // Stripe setup intent
  const [setupClientSecret, setSetupClientSecret] = useState(null);
  const [customerId, setCustomerId] = useState(null);

  // State for address menu
  const [showMenuForAddress, setShowMenuForAddress] = useState(null);

  const SERVICE_CHARGE = 2.0; // Fixed £2 service charge
  const MINIMUM_ORDER_AMOUNT = 20.0; // Minimum order amount

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
    setSetupClientSecret(null);
    setCustomerId(null);
    setShowMenuForAddress(null);
    localStorage.removeItem("quickBookingOrder");
  }, []);

  useEffect(() => {
    const tzOffset = -new Date().getTimezoneOffset();
    setDebugInfo((prev) => ({ ...prev, timezoneOffset: tzOffset }));

    clearBookingData();

    if (user) {
      fetchAddresses();
      ensureStripeCustomer();
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

  /* ------------------------- Delete Address Function ------------------------- */

  const deleteAddress = async (addressId) => {
    if (!user) return;

    const token = localStorage.getItem("jwtToken");
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/addresses/${addressId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to delete address: ${res.status} - ${errorText}`);
      }

      // Remove address from state
      setAddresses((prev) => prev.filter(addr => String(addr.address_id) !== String(addressId)));
      
      // Update selection if deleted address was selected
      if (String(selectedDeliveryId) === String(addressId)) {
        const remainingAddresses = addresses.filter(addr => String(addr.address_id) !== String(addressId));
        if (remainingAddresses.length > 0) {
          const newDefault = remainingAddresses.find(a => a.is_selected) || remainingAddresses[0];
          setSelectedDeliveryId(String(newDefault.address_id));
          if (useSameAddress) {
            setSelectedPickupId(String(newDefault.address_id));
          }
        } else {
          setSelectedDeliveryId(null);
          setSelectedPickupId(null);
        }
      }
      
      if (String(selectedPickupId) === String(addressId)) {
        const remainingAddresses = addresses.filter(addr => String(addr.address_id) !== String(addressId));
        if (remainingAddresses.length > 0) {
          const newPickup = remainingAddresses.find(a => a.is_selected) || remainingAddresses[0];
          setSelectedPickupId(String(newPickup.address_id));
        } else {
          setSelectedPickupId(null);
        }
      }

      // Close menu
      setShowMenuForAddress(null);
      showToast("Address deleted successfully!");
    } catch (error) {
      showToast("Failed to delete address");
      console.error("Delete address error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------- Stripe Customer Setup ------------------------ */

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
      console.log("Stripe customer creation might be handled later");
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
      showToast(error.message || "Failed to setup payment");
      return null;
    }
  }, [user]);

  /* ---------------------- Set Card as Default ---------------------- */

  const setPaymentMethodAsDefault = async (customerId, paymentMethodId) => {
    try {
      const token = localStorage.getItem("jwtToken");
      
      // Update Stripe customer to set this payment method as default
      const response = await fetch(`${API_BASE}/stripe/set-default-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId,
          paymentMethodId,
        }),
      });

      if (!response.ok) {
        console.warn("Failed to set card as default, but card is still saved");
      }
      
      return response.ok;
    } catch (error) {
      console.error("Error setting default payment method:", error);
      return false;
    }
  };

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
    const params = new URLSearchParams({
      date: dateIso,
      tzOffset: tzOffset.toString(),
      isDelivery: String(isDelivery),
      format: "12",
    });

    // 👇 EXACTLY LIKE FLUTTER
    if (isDelivery && selectedCollectSlotStart && collectDate) {
      const h = selectedCollectSlotStart.getHours().toString().padStart(2, "0");
      const m = selectedCollectSlotStart.getMinutes().toString().padStart(2, "0");
      params.set("pickupDate", collectDate);
      params.set("pickupSlotStart", `${h}:${m}`);
    }

    const res = await fetch(`${API_BASE}/time-slots?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch slots");

    const data = await res.json();
    let slots = data.slots || [];

    // 🔥 APPLY SAME FLUTTER RULES
    if (isDelivery) {
      slots = apply8HourRule(slots);
    }

    return slots;
  },
  [user, selectedCollectSlotStart, collectDate]
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
    ensureStripeCustomer();
  };

  const handleAddressSaved = (newAddress) => {
    setAddresses((prev) => [...prev, newAddress]);
    const id = String(newAddress.address_id);
    setSelectedDeliveryId(id);
    setSelectedPickupId(id);
    setShowAddForm(false);
    showToast("Address added successfully!");
  };

  const prepareOrderData = useCallback((paymentMethodId = null) => {
    if (!selectedCollectSlot || !selectedDeliverSlot) return null;

    const order = {
      address_id: selectedDeliveryId,
      pickup_address_id: useSameAddress ? selectedDeliveryId : selectedPickupId,
      use_same_address: useSameAddress,

      collect_slot: selectedCollectSlot.label,
      delivery_slot: selectedDeliverSlot.label,

      notes: notes.trim() || null,
      images: [],
      change_manager_requested: false,
      
      // Payment information
      minimum_order_amount: MINIMUM_ORDER_AMOUNT,
      service_charge: SERVICE_CHARGE,
      
      // Payment status - card saved, invoice pending
      payment_status: "card_saved",
      payment_type: "invoice_based",
      stripe_customer_id: customerId,
      payment_method_id: paymentMethodId,
      
      // Initial estimated total (will be updated by laundry manager)
      estimated_total: 0,
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
    customerId,
  ]);

  const handleSetupSuccess = async (setupIntent) => {
  setSetupProcessing(true);

  try {
    const paymentMethodId =
  setupIntent.payment_method ||
  setupIntent.latest_attempt?.payment_method;

if (!paymentMethodId) {
  throw new Error("Payment method not returned by Stripe");
}

    
    if (!paymentMethodId) {
      throw new Error("No payment method ID returned from Stripe");
    }

    // CRITICAL STEP: Set this card as the default payment method
    if (customerId) {
      const defaultSet = await setPaymentMethodAsDefault(customerId, paymentMethodId);
      if (!defaultSet) {
        console.warn("Card saved but not set as default. Auto-payment might fail.");
      }
    }

    const order = prepareOrderData(paymentMethodId);
    if (!order) throw new Error("Order data is missing");

    // Add setup intent details to order
    order.setup_intent_id = setupIntent.id;
    order.payment_method_id = paymentMethodId;

    const token = localStorage.getItem("jwtToken");
    if (!token) throw new Error("No authentication token found");

    // Save order to backend
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

    // Save order to localStorage for ThankYou page
    localStorage.setItem('lastOrder', JSON.stringify({
      orderId: data.order_id || data.orderId,
      status: 'Confirmed',
      estimatedDelivery: order.delivery_slot || '24-48 hours',
      pickupTime: order.collect_slot || 'Today, 4-6 PM',
      paymentStatus: 'card_saved',
      paymentNote: 'Card saved as default. Payment will be automatically charged after invoice.',
      customerId: customerId,
      paymentMethodId: paymentMethodId,
      // Add these fields for ThankYou page
      totalAmount: '£0.00 (Will be charged after invoice)',
      serviceType: 'Express Laundry',
      paymentMethod: 'Card saved for auto-payment'
    }));

    clearBookingData();
    setShowPaymentSetup(false);
    
    // Navigate directly to ThankYou page (no delay)
    navigate("/thankyou", { 
      state: { 
        orderId: data.order_id,
        isExpress: true,
        paymentStatus: 'card_saved',
        paymentMethodId: paymentMethodId
      } 
    });
    
  } catch (error) {
    console.error("Setup success error:", error);
    showToast(error.message || "Failed to create order");
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

    setSetupProcessing(true);

    try {
      // Ensure stripe customer exists
      await ensureStripeCustomer();

      // Create setup intent for saving card
      const setupData = await createSetupIntent();
      if (!setupData || !setupData.setupIntentClientSecret) {
        throw new Error("Failed to setup payment");
      }

      setSetupClientSecret(setupData.setupIntentClientSecret);
      setCustomerId(setupData.customerId || customerId);
      
      setShowPaymentSetup(true);
    } catch (error) {
      showToast(error.message || "Unable to setup payment");
    } finally {
      setSetupProcessing(false);
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
  if (!slot.enabled) return;

  setSelectedCollectSlot(slot);
  setSelectedCollectSlotStart(new Date(slot.start));

  // ⛔ SAME-DAY DELIVERY BLOCK AFTER 10 AM
  if (pickupIsToday() && !pickupBefore10()) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const iso = tomorrow.toISOString().split("T")[0];

    setDeliverDate(iso);
    setSelectedDeliverSlot(null);
  }
};


  const handleDeliverSlotSelect = (slot) => {
  if (!slot.enabled) return;
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

  const isConfirmButtonDisabled = () => {
    if (!user) return true;
    if (loading || setupProcessing) return true;
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
                            <div className="qb-address-actions">
                              {addr.is_selected && (
                                <span className="qb-default-badge">Default</span>
                              )}
                              <div className="qb-address-menu">
                                <button
                                  className="qb-address-menu-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenuForAddress(
                                      showMenuForAddress === String(addr.address_id) 
                                        ? null 
                                        : String(addr.address_id)
                                    );
                                  }}
                                >
                                  <i className="fas fa-ellipsis-v"></i>
                                </button>
                                {showMenuForAddress === String(addr.address_id) && (
                                  <div className="qb-address-menu-dropdown">
                                    <button
                                      className="qb-address-menu-item delete"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm("Are you sure you want to delete this address?")) {
                                          deleteAddress(addr.address_id);
                                        }
                                      }}
                                    >
                                      <i className="fas fa-trash-alt"></i>
                                      Delete Address
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div 
                            className="qb-address-details"
                            onClick={() => handleSelectAddress(addr.address_id)}
                          >
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
                                <div className="qb-address-actions">
                                  <div className="qb-address-menu">
                                    <button
                                      className="qb-address-menu-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMenuForAddress(
                                          showMenuForAddress === `pickup-${addr.address_id}` 
                                            ? null 
                                            : `pickup-${addr.address_id}`
                                        );
                                      }}
                                    >
                                      <i className="fas fa-ellipsis-v"></i>
                                    </button>
                                    {showMenuForAddress === `pickup-${addr.address_id}` && (
                                      <div className="qb-address-menu-dropdown">
                                        <button
                                          className="qb-address-menu-item delete"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm("Are you sure you want to delete this address?")) {
                                              deleteAddress(addr.address_id);
                                            }
                                          }}
                                        >
                                          <i className="fas fa-trash-alt"></i>
                                          Delete Address
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div 
                                className="qb-address-details"
                                onClick={() => handleSelectAddress(addr.address_id, false)}
                              >
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
                <div className="qb-card-header">
                  <div className="qb-card-icon">
                    <i className="fas fa-credit-card"></i>
                  </div>
                  <h2 className="qb-card-title">Payment Information</h2>
                </div>
                <div className="qb-payment-summary">
                  <div className="qb-payment-notice">
                    <i className="fas fa-credit-card"></i>
                    <div className="qb-payment-notice-content">
                      <h4>Card Required for Booking</h4>
                      <p>
                        <strong>This card will be saved as your DEFAULT payment method.</strong><br/>
                        It will be automatically charged when we send you the invoice.
                        No upfront charge.
                      </p>
                    </div>
                  </div>
                  
                  <div className="qb-payment-details">
                    <h5>Auto-Payment Terms:</h5>
                    <ul>
                      <li><i className="fas fa-pound-sign"></i> Minimum charge: £{MINIMUM_ORDER_AMOUNT}.00 + £{SERVICE_CHARGE}.00 service fee</li>
                      <li><i className="fas fa-file-invoice"></i> Invoice sent after driver collects your items</li>
                      <li><i className="fas fa-bolt"></i> <strong>AUTO-CHARGE:</strong> Card charged automatically when invoice is sent</li>
                      <li><i className="fas fa-shield-alt"></i> Securely saved via Stripe</li>
                      <li><i className="fas fa-exclamation-circle"></i> Invoice amount &lt; £20 = Charge £{(MINIMUM_ORDER_AMOUNT + SERVICE_CHARGE).toFixed(2)}</li>
                      <li><i className="fas fa-exclamation-circle"></i> Invoice amount ≥ £20 = Charge invoice amount + £{SERVICE_CHARGE}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
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
                {setupProcessing
                  ? "Setting up payment..."
                  : loading
                  ? "Processing..."
                  : `Save Card & Confirm Booking`}
              </button>
            </div>
          </>
        )}
      </main>

      {/* Payment Setup Modal */}
      {showPaymentSetup && setupClientSecret && (
        <div className="payment-modal-backdrop">
          <div className="payment-modal">
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: setupClientSecret,
                appearance: {
                  theme: 'stripe',
                },
              }}
            >
              <StripeSetupForm
                onSetupSuccess={handleSetupSuccess}
                onSetupError={handleSetupError}
                onCancel={() => setShowPaymentSetup(false)}
                setupProcessing={setupProcessing}
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
          subtitle="Your card has been saved as default. It will be automatically charged when we send the invoice."
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