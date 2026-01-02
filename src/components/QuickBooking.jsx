// // src/components/QuickBooking.jsx
// import React, { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import "./QuickBooking.css";

// // Stripe imports
// import { loadStripe } from "@stripe/stripe-js";
// import {
//   Elements,
//   useStripe,
//   useElements,
//   PaymentElement,
// } from "@stripe/react-stripe-js";

// const API_BASE = "http://13.60.56.137:3000";


// // Initialize Stripe
// const stripePromise = loadStripe("pk_live_51SUiy73fSKIcHb6THsEQatj2g1tJOjUhzaym490HNFobNn6gOtdzpelQnV2knmKkXPiqxKqJjwEQ6dtSNRKuO4yx00HFqYnkEI");

// /* -------------------------------------------------------------------------- */
// /*                       Stripe SetupIntent Form (UI)                         */
// /* -------------------------------------------------------------------------- */
// const StripeSetupForm = ({
//   onSetupSuccess,
//   onSetupError,
//   onCancel,
//   setupProcessing,
//   userToken,
//   onTokenUpdate
// }) => {
//   const [consent, setConsent] = useState(false);
//   const [error, setError] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const stripe = useStripe();
//   const elements = useElements();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!consent) {
//       setError("You must consent to save your card for future payments");
//       return;
//     }
    
//     if (!stripe || !elements) return;
    
//     setSubmitting(true);
//     setError(null);

//     try {
//       const result = await stripe.confirmSetup({
//         elements,
//         redirect: "if_required",
//       });

//       if (result.error) {
//         throw result.error;
//       }

//       const setupIntent = result.setupIntent;

//       if (!setupIntent || !setupIntent.payment_method) {
//         throw new Error("Payment method not saved");
//       }

//       await onSetupSuccess(setupIntent);
//     } catch (err) {
//       setError(err.message || "Card save failed");
//       onSetupError(err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="stripe-payment-modal">
//       <div className="payment-header">
//         <h3>Save Your Card for Future Payments</h3>
//         <p style={{color:"black"}}>
//           <i className="fas fa-credit-card" style={{ marginRight: "8px" , color:"black"}}></i>
//           Your card will be securely saved by Stripe for automatic invoice payments.
//           No charges will be made until your laundry manager sends the invoice.
//         </p>
//       </div>

//       <form onSubmit={handleSubmit} className="payment-form">
//         <div className="payment-element-wrapper">
//           <PaymentElement 
//             options={{
//               layout: {
//                 type: 'tabs',
//                 defaultCollapsed: false,
//               },
//               wallets: {
//                 applePay: 'never',
//                 googlePay: 'never',
//               }
//             }}
//           />
//           <div className="card-save-note">
//             <i className="fas fa-info-circle"></i>
//             <span>Stripe will automatically save your card details securely for future payments.</span>
//           </div>
//         </div>
        
//         <div className="consent-checkbox-container">
//           <label>
//             <input
//               type="checkbox"
//               checked={consent}
//               onChange={(e) => setConsent(e.target.checked)}
//               required
//             />
//             <span className="consent-text" style={{color:"black"}}>
//               <strong>Yes, save my card</strong>
//               <br />
//               I authorize IroningBoy to save this card and use it for automatic payment 
//               of laundry service invoices.
//             </span>
//           </label>
//         </div>
        
//         {error && (
//           <div className="payment-error">
//             <i className="fas fa-exclamation-circle"></i>
//             <span>{error}</span>
//           </div>
//         )}
        
//         <div className="payment-actions">
//           <button
//             type="button"
//             onClick={onCancel}
//             disabled={submitting || setupProcessing}
//             className="payment-cancel-btn"
//           >
//             Cancel
//           </button>
          
//           <button
//             type="submit"
//             disabled={!stripe || submitting || setupProcessing || !consent}
//             className="payment-confirm-btn"
//           >
//             {submitting ? (
//               <>
//                 <div className="payment-loading-spinner"></div>
//                 Saving Card...
//               </>
//             ) : (
//               <>
//                 <i className="fas fa-save"></i>
//                 Save Card & Confirm Booking
//               </>
//             )}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// /* -------------------------------------------------------------------------- */
// /*                           Main QuickBooking Component                      */
// /* -------------------------------------------------------------------------- */
// export default function QuickBooking() {
//   const navigate = useNavigate();
//   const { user, login } = useAuth();

//   // State management
//   const [loading, setLoading] = useState(false);
//   const [setupProcessing, setSetupProcessing] = useState(false);
//   const [showPaymentSetup, setShowPaymentSetup] = useState(false);
//   const [toast, setToast] = useState(null);
//   const [useNewCard, setUseNewCard] = useState(false);
//   const [savedCards, setSavedCards] = useState([]);
//   const [loadingCards, setLoadingCards] = useState(true);
//   const [setupClientSecret, setSetupClientSecret] = useState(null);
//   const [customerId, setCustomerId] = useState(null);
//   const [userToken, setUserToken] = useState(localStorage.getItem("jwtToken"));
//   const ensureTokenExists = async () => {

//   let token = userToken || localStorage.getItem("jwtToken");
 
//   // If token does not exist → create user + token

//   if (!token) {

//     const ensureTokenExists = async () => {

//   return userToken || localStorage.getItem("jwtToken");

// };

 
//     localStorage.setItem("jwtToken", token);

//     setUserToken(token);

//   }
 
//   return token;

// };
  
//   // NEW: Add payment option for non-logged-in users
//   const [saveCardOption, setSaveCardOption] = useState(false);
//   const [bookingWithoutAccount, setBookingWithoutAccount] = useState(false);

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
//     // Initialize with user data if logged in
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

//   // Address form for all users
//   const [addressForm, setAddressForm] = useState({
//     street_address: "",
//     postcode: "",
//     city: "",
//     additional_details: ""
//   });

//   // Form state
//   const [collectDate, setCollectDate] = useState("");
//   const [deliverDate, setDeliverDate] = useState("");
//   const [notes, setNotes] = useState("");

//   // Constants
//   const SERVICE_CHARGE = 2.0;
//   const MINIMUM_ORDER_AMOUNT = 20.0;
//   const today = new Date().toISOString().split("T")[0];

//   // Show toast notification
//   const showToast = useCallback((msg) => {
//     setToast(msg);
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

//   const formatDateTimeDisplay = (dateString, timeString) => {
//     const date = formatDateDDMMYYYY(dateString);
//     const time = formatTime24Hour(timeString);
//     if (date && time) return `${date} at ${time}`;
//     return date || time || "";
//   };

//   const getCardBrandClass = (brand) => {
//     if (!brand) return '';
//     const brandLower = brand.toLowerCase();
//     if (brandLower.includes('visa')) return 'card-brand-visa';
//     if (brandLower.includes('mastercard')) return 'card-brand-mastercard';
//     if (brandLower.includes('amex') || brandLower.includes('american express')) return 'card-brand-amex';
//     if (brandLower.includes('discover')) return 'card-brand-discover';
//     return '';
//   };

//   /* ---------------------------- Data Fetching ----------------------------- */
//   // Fetch user profile if logged in
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

//   // Fetch addresses if logged in
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
        
//         // Select first address or default address
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

//   // Fetch saved cards if logged in
//   const fetchSavedCards = useCallback(async () => {
//     if (!userToken) {
//       setLoadingCards(false);
//       return;
//     }
    
//     try {
//       const response = await fetch(`${API_BASE}/stripe/saved-cards`, {
//         headers: {
//           "Authorization": `Bearer ${userToken}`,
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setSavedCards(data.cards || []);
//       }
//     } catch (error) {
//       console.error("Error fetching saved cards:", error);
//       setSavedCards([]);
//     } finally {
//       setLoadingCards(false);
//     }
//   }, [userToken]);

//   // Create Stripe customer if logged in
//   const ensureStripeCustomer = useCallback(async () => {
//     if (!userToken) return;

//     try {
//       const response = await fetch(`${API_BASE}/stripe/create-customer`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${userToken}`,
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setCustomerId(data.customerId);
//       }
//     } catch (error) {
//       console.error("Error creating Stripe customer:", error);
//     }
//   }, [userToken]);

//   // Create setup intent for all users
//   const createSetupIntent = useCallback(async (token = userToken) => {
//     try {
//       const response = await fetch(`${API_BASE}/stripe/init-setup-intent`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token && { "Authorization": `Bearer ${token}` }),
//         },
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Failed to create setup intent");
//       }

//       const data = await response.json();
//       return data;
//     } catch (error) {
//       console.error("Error creating setup intent:", error);
//       return null;
//     }
//   }, [userToken]);

//   /* -------------------------- Time Slot Functions ------------------------- */
//   // Fetch time slots (available for all users)
//   const fetchTimeSlots = useCallback(async (dateIso, isDelivery = false) => {
//     if (!dateIso) return [];

//     const tzOffset = -new Date().getTimezoneOffset();

//     const params = new URLSearchParams({
//       date: dateIso,
//       format: "24",
//       tzOffset: tzOffset.toString(),
//     });

//     if (isDelivery) {
//       params.set("isDelivery", "true");

//       if (collectDate && selectedCollectSlotStart) {
//         const h = selectedCollectSlotStart.getHours().toString().padStart(2, "0");
//         const m = selectedCollectSlotStart.getMinutes().toString().padStart(2, "0");
//         params.set("pickupDate", collectDate);
//         params.set("pickupSlotStart", `${h}:${m}`);
//       }
//     }

//     try {
//       const response = await fetch(`${API_BASE}/time-slots?${params.toString()}`);
//       if (!response.ok) throw new Error("Failed to fetch slots");

//       const data = await response.json();
//       return data.slots || [];
//     } catch (error) {
//       console.error("Error fetching time slots:", error);
//       return [];
//     }
//   }, [collectDate, selectedCollectSlotStart]);

//   const fetchCollectSlots = useCallback(async () => {
//     if (!collectDate) return;
    
//     setLoadingSlots(prev => ({ ...prev, collect: true }));
    
//     try {
//       const slots = await fetchTimeSlots(collectDate, false);
//       setCollectSlots(slots);

//       // Reset if selected slot is no longer valid
//       if (selectedCollectSlot) {
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
//       console.error("Error fetching collect slots:", error);
//       setCollectSlots([]);
//     } finally {
//       setLoadingSlots(prev => ({ ...prev, collect: false }));
//     }
//   }, [collectDate, fetchTimeSlots, selectedCollectSlot]);

//   const fetchDeliverySlots = useCallback(async () => {
//     if (!deliverDate || !collectDate || !selectedCollectSlotStart) return;
    
//     setLoadingSlots(prev => ({ ...prev, deliver: true }));
    
//     try {
//       const slots = await fetchTimeSlots(deliverDate, true);
//       setDeliverSlots(slots);

//       // Reset if selected slot is no longer valid
//       if (selectedDeliverSlot) {
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
//       console.error("Error fetching delivery slots:", error);
//       setDeliverSlots([]);
//     } finally {
//       setLoadingSlots(prev => ({ ...prev, deliver: false }));
//     }
//   }, [deliverDate, collectDate, selectedCollectSlotStart, fetchTimeSlots, selectedDeliverSlot]);

//   /* ------------------------- Create/Update User Account ------------------- */
//   // Create or update user account and get JWT token
//   const createOrUpdateUserAccount = useCallback(async () => {
//     if (!userInfo.name.trim() || !userInfo.email.trim() || !userInfo.phone.trim()) {
//       throw new Error("Please fill in all personal information");
//     }

//     try {
//       const response = await fetch(`${API_BASE}/quick-booking`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: userInfo.name,
//           email: userInfo.email,
//           phone: userInfo.phone,
//         }),
//       });

//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.message || "Failed to create/update user account");
//       }

//       // Save the token
//       if (data.token) {
//         localStorage.setItem("jwtToken", data.token);
//         setUserToken(data.token);
        
//         // Update auth context
//         if (data.user) {
//           login({
//             id: data.user.id,
//             name: data.user.name,
//             email: data.user.email,
//             phone: data.user.phone,
//           });
//         }
//       }

//       return data.token;
//     } catch (error) {
//       console.error("Error creating/updating user account:", error);
//       throw error;
//     }
//   }, [userInfo, login]);

//   /* ------------------------- Order Preparation ---------------------------- */
//   const prepareOrderData = useCallback((paymentMethodId = null, includePaymentInfo = false) => {
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

//     // Get address details
//     let addressData = {};
//     if (userToken && addresses.length > 0 && selectedAddressId) {
//       // For users with saved addresses
//       const selectedAddress = addresses.find(addr => 
//         String(addr.address_id) === selectedAddressId
//       );
//       addressData = {
//         address_id: selectedAddressId,
//         pickup_address_id: useSameAddress ? selectedAddressId : selectedPickupAddressId,
//         use_same_address: useSameAddress,
//         street_address: selectedAddress?.full_address || "",
//         postcode: selectedAddress?.postcode || "",
//         city: selectedAddress?.city || "",
//         house_number: selectedAddress?.house_number || "",
//       };
//     } else {
//       // For users without saved addresses (new users)
//       addressData = {
//         street_address: addressForm.street_address,
//         postcode: addressForm.postcode,
//         city: addressForm.city || "",
//         full_address: addressForm.street_address,
//         additional_details: addressForm.additional_details || "",
//       };
//     }

//     const baseOrder = {
//       ...addressData,
//       name: userInfo.name,
//       email: userInfo.email,
//       phone: userInfo.phone,
//       collect_slot: pickupSlotText,
//       delivery_slot: deliverySlotText,
//       notes: notes.trim() || null,
//       images: [],
//       minimum_order_amount: MINIMUM_ORDER_AMOUNT,
//       service_charge: SERVICE_CHARGE,
//       estimated_total: 0,
//       currency: "gbp",
//     };

//     // Add payment info only if includePaymentInfo is true AND we have paymentMethodId
//     if (includePaymentInfo && paymentMethodId) {
//       baseOrder.payment_status = "card_saved";
//       baseOrder.payment_type = "invoice_based";
//       baseOrder.stripe_customer_id = customerId;
//       baseOrder.payment_method_id = paymentMethodId;
//     }

//     return baseOrder;
//   }, [
//     selectedCollectSlot,
//     selectedDeliverSlot,
//     collectDate,
//     deliverDate,
//     userToken,
//     addresses,
//     selectedAddressId,
//     selectedPickupAddressId,
//     useSameAddress,
//     addressForm,
//     notes,
//     customerId,
//     userInfo,
//   ]);

//   /* ------------------------- NEW: Booking Without Card -------------------- */
//   const handleBookingWithoutCard = async () => {
//     setLoading(true);
    
//     try {
//       const order = prepareOrderData();
//       if (!order) throw new Error("Order data missing");

//       console.log("Creating booking without card:", order);

//       const response = await fetch(`${API_BASE}/quick-booking`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(order),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to create booking");
//       }

//       // If user was created, store the token
//       if (data.token) {
//         localStorage.setItem("jwtToken", data.token);
//         setUserToken(data.token);
        
//         if (data.user) {
//           login({
//             id: data.user.id,
//             name: data.user.name,
//             email: data.user.email,
//             phone: data.user.phone,
//           });
//         }
//       }

//       // Show success and redirect
//       showToast("Booking created successfully!");
      
//       setTimeout(() => {
//         navigate("/thankyou", {
//           state: {
//             orderId: data.order?.id || data.order_id,
//             paymentStatus: "pending",
//             paymentMethod: "invoice",
//             pickupDate: formatDateDDMMYYYY(collectDate),
//             pickupTime: formatTimeRange24Hour(selectedCollectSlot.start, selectedCollectSlot.end),
//             deliveryDate: formatDateDDMMYYYY(deliverDate),
//             deliveryTime: formatTimeRange24Hour(selectedDeliverSlot.start, selectedDeliverSlot.end),
//             message: "Your quick booking has been confirmed! You'll receive an invoice after service.",
//           },
//         });
//       }, 1000);

//     } catch (error) {
//       console.error("Booking without card error:", error);
//       showToast(error.message || "Failed to create booking. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ------------------------- Booking Flow Handlers ------------------------ */
//   // Main booking handler for all users
// const handleConfirmBooking = async () => {

//   setSetupProcessing(true);
 
//   try {

//     // 1️⃣ ALWAYS create token first

//     let token = userToken || localStorage.getItem("jwtToken");
 
// // Create user ONLY when booking is confirmed

// if (!token) {

//   token = await createOrUpdateUserAccount();

// }


 
//     // 2️⃣ If card save / new card → Stripe flow

//     if (saveCardOption || useNewCard || savedCards.length === 0) {

//       await initiatePaymentFlow();

//       return;

//     }
 
//     // 3️⃣ Else use saved card

//     await handleSavedCardBooking(token);
 
//   } catch (err) {

//     console.error(err);

//     showToast(err.message || "Booking failed");

//   } finally {

//     setSetupProcessing(false);

//   }

// };

 

//   // Handle saved card booking for users with saved cards
//   const handleSavedCardBooking = async (token) => {
//     const defaultCard = savedCards.find(card => card.is_default);
//     if (!defaultCard) {
//       throw new Error("No saved card found");
//     }

//     const order = prepareOrderData(defaultCard.payment_method_id, true);
//     if (!order) throw new Error("Order data missing");

//     const response = await fetch(`${API_BASE}/express_order`, {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(order),
//     });

//     const data = await response.json();
//     if (!response.ok) {
//       throw new Error(data.error || "Order creation failed");
//     }

//     showToast("Booking confirmed with saved card!");
    
//     setTimeout(() => {
//       navigate("/thankyou", {
//         state: {
//           orderId: data.order_id,
//           paymentStatus: "card_saved",
//           paymentMethod: "saved_card",
//           pickupDate: formatDateDDMMYYYY(collectDate),
//           pickupTime: formatTimeRange24Hour(selectedCollectSlot.start, selectedCollectSlot.end),
//           deliveryDate: formatDateDDMMYYYY(deliverDate),
//           deliveryTime: formatTimeRange24Hour(selectedDeliverSlot.start, selectedDeliverSlot.end),
//         },
//       });
//     }, 1000);
//   };

//   // Initiate payment flow for new card
// const initiatePaymentFlow = async () => {

//   // 1️⃣ FIRST ensure token exists

//   const token = userToken || localStorage.getItem("jwtToken");
 
// if (!token) {

//   throw new Error("User token missing. Booking not initialised.");

// }

 
//   // 2️⃣ THEN call Stripe (SAFE)

//   const setupData = await createSetupIntent(token);
 
//   if (!setupData || !setupData.setupIntentClientSecret) {

//     throw new Error("Stripe setup failed");

//   }
 
//   setSetupClientSecret(setupData.setupIntentClientSecret);

//   setCustomerId(setupData.customerId || customerId);

//   setShowPaymentSetup(true);

// };
 

//   // Handle Stripe setup success
//   const handleSetupSuccess = async (setupIntent) => {
//     setSetupProcessing(true);

//     try {
//       const token = userToken || localStorage.getItem("jwtToken");
//       if (!token) throw new Error("Authentication required");

//       const paymentMethodId = setupIntent.payment_method || setupIntent.latest_attempt?.payment_method;
//       if (!paymentMethodId) {
//         throw new Error("Payment method not returned by Stripe");
//       }

//       // Set as default card if user is logged in
//       if (token) {
//         await fetch(`${API_BASE}/stripe/set-default-payment`, {
//           method: "POST",
//           headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             customerId,
//             paymentMethodId,
//           }),
//         });
//       }

//       // Create order with new card
//       const order = prepareOrderData(paymentMethodId, true);
//       if (!order) throw new Error("Order data missing");

//       // Use appropriate endpoint based on user status
//       const endpoint = token ? `${API_BASE}/express_order` : `${API_BASE}/quick-booking`;
//       const headers = {
//         "Content-Type": "application/json",
//         ...(token && { "Authorization": `Bearer ${token}` }),
//       };

//       const response = await fetch(endpoint, {
//         method: "POST",
//         headers,
//         body: JSON.stringify(order),
//       });

//       const data = await response.json();
//       if (!response.ok) {
//         throw new Error(data.message || data.error || "Order creation failed");
//       }

//       // Close payment modal
//       setShowPaymentSetup(false);
//       showToast("Booking confirmed successfully!");
      
//       // Navigate to thank you page
//       setTimeout(() => {
//         navigate("/thankyou", {
//           state: {
//             orderId: data.order_id || data.order?.id,
//             paymentStatus: "card_saved",
//             paymentMethod: "new_card",
//             pickupDate: formatDateDDMMYYYY(collectDate),
//             pickupTime: formatTimeRange24Hour(selectedCollectSlot.start, selectedCollectSlot.end),
//             deliveryDate: formatDateDDMMYYYY(deliverDate),
//             deliveryTime: formatTimeRange24Hour(selectedDeliverSlot.start, selectedDeliverSlot.end),
//           },
//         });
//       }, 1000);

//     } catch (error) {
//       console.error("Setup success error:", error);
//       showToast(error.message || "Failed to confirm booking");
//     } finally {
//       setSetupProcessing(false);
//     }
//   };

//   const handleSetupError = (errorMessage) => {
//     showToast(errorMessage || "Failed to save card. Please try again.");
//   };

// const handleUseAnotherCard = async () => {

//   try {

//     setSetupProcessing(true);
 
//     // 1️⃣ Ensure token first

//     await ensureTokenExists();
 
//     // 2️⃣ Then Stripe

//     await initiatePaymentFlow();
 
//   } catch (err) {

//     showToast(err.message || "Failed to setup card");

//   } finally {

//     setSetupProcessing(false);

//   }

// };

 

//   const handleBackToSavedCard = () => {
//     setUseNewCard(false);
//     setShowPaymentSetup(false);
//   };

//   const handlePaymentModalCancel = () => {
//     setShowPaymentSetup(false);
//     setSetupClientSecret(null);
//     setUseNewCard(false);
//   };

//   /* ---------------------------- UI Handlers ------------------------------- */
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
//       showToast("Delivery date cannot be before pickup date");
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
//     const end = new Date(slot.end);
    
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
//     const end = new Date(slot.end);
    
//     setSelectedDeliverSlot(slot);
//     setSelectedDeliverSlotStart(start);
//     setSelectedDeliverSlotEnd(end);
//   };

//   const handleToggleSameAddress = (e) => {
//     const checked = e.target.checked;
//     setUseSameAddress(checked);
//     if (checked && selectedAddressId) {
//       setSelectedPickupAddressId(selectedAddressId);
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

//   /* ---------------------------- Effects ----------------------------------- */
//   useEffect(() => {
//     if (userToken) {
//       fetchUserProfile();
//       fetchAddresses();
//       fetchSavedCards();
//       ensureStripeCustomer();
//     } else {
//       setLoadingCards(false);
//     }
//   }, [userToken, fetchUserProfile, fetchAddresses, fetchSavedCards, ensureStripeCustomer]);

//   useEffect(() => {
//     if (collectDate) {
//       fetchCollectSlots();
//     }
//   }, [collectDate, fetchCollectSlots]);

//   useEffect(() => {
//     if (deliverDate && selectedCollectSlotStart) {
//       fetchDeliverySlots();
//     }
//   }, [deliverDate, selectedCollectSlotStart, fetchDeliverySlots]);

//   useEffect(() => {
//     if (showPaymentSetup) {
//       document.body.classList.add('payment-modal-open');
//     } else {
//       document.body.classList.remove('payment-modal-open');
//     }
    
//     return () => {
//       document.body.classList.remove('payment-modal-open');
//     };
//   }, [showPaymentSetup]);

//   // Calculate min delivery date
//   const minDeliveryDate = collectDate || today;

//   // Check if form is valid for booking
//   const isBookingValid = () => {
//     // Basic validations for all users
//     if (!userInfo.name.trim()) return false;
//     if (!userInfo.email.trim()) return false;
//     if (!userInfo.phone.trim()) return false;
//     if (!selectedCollectSlot || !selectedDeliverSlot) return false;
    
//     if (userToken && addresses.length > 0) {
//       // Logged-in user with saved addresses
//       if (!selectedAddressId) return false;
//       if (!useSameAddress && !selectedPickupAddressId) return false;
//     } else {
//       // New user or user without saved addresses
//       if (!addressForm.street_address.trim()) return false;
//       if (!addressForm.postcode.trim()) return false;
//     }
    
//     return true;
//   };

//   /* ------------------------------ Render ---------------------------------- */
//   return (
//     <div className="qb-page">
//       <main className="qb-container">
//         {/* Title Section */}
//         <div className="qb-title-section">
//           <h1 className="qb-title">Quick Booking</h1>
//           <p className="qb-subtitle">
//             Fill in your details and we'll take care of the rest. No account needed!
//           </p>
          
//           {userToken && (
//             <div className="qb-user-info">
//               <i className="fas fa-user-circle"></i>
//               <span>Welcome back, {userInfo.name || user?.email}! Your information has been loaded.</span>
//             </div>
//           )}
//         </div>

//         {/* Personal Information Card */}
//         <div className="qb-card">
//           <div className="qb-card-header">
//             <div className="qb-card-icon">
//               <i className="fas fa-user"></i>
//             </div>
//             <h2 className="qb-card-title">Personal Information</h2>
//           </div>

//           <div className="qb-form-grid">
//             <div className="qb-form-group">
//               <label className="qb-form-label">
//                 Full Name *
//                 <input
//                   type="text"
//                   className="qb-form-input"
//                   value={userInfo.name}
//                   onChange={handleUserInfoChange("name")}
//                   placeholder="Enter your full name"
//                   required
//                 />
//               </label>
//             </div>

//             <div className="qb-form-group">
//               <label className="qb-form-label">
//                 Email Address *
//                 <input
//                   type="email"
//                   className="qb-form-input"
//                   value={userInfo.email}
//                   onChange={handleUserInfoChange("email")}
//                   placeholder="Enter your email"
//                   required
//                 />
//               </label>
//             </div>

//             <div className="qb-form-group">
//               <label className="qb-form-label">
//                 Phone Number *
//                 <input
//                   type="tel"
//                   className="qb-form-input"
//                   value={userInfo.phone}
//                   onChange={handleUserInfoChange("phone")}
//                   placeholder="Enter your phone number"
//                   required
//                 />
//               </label>
//             </div>
//           </div>
//         </div>

//         {/* Address Section */}
//         <div className="qb-card">
//           <div className="qb-card-header">
//             <div className="qb-card-icon">
//               <i className="fas fa-map-marker-alt"></i>
//             </div>
//             <h2 className="qb-card-title">Delivery Address</h2>
//           </div>

//           {userToken && addresses.length > 0 ? (
//             // User with saved addresses
//             <>
//               <div className="qb-address-grid">
//                 {addresses.map((addr) => (
//                   <div
//                     key={addr.address_id}
//                     className={`qb-address-card ${
//                       selectedAddressId === String(addr.address_id) ? "selected" : ""
//                     }`}
//                     onClick={() => {
//                       setSelectedAddressId(String(addr.address_id));
//                       if (useSameAddress) setSelectedPickupAddressId(String(addr.address_id));
//                     }}
//                   >
//                     <div className="qb-address-header">
//                       <h3 className="qb-address-name">
//                         <i className="fas fa-map-marker-alt qb-address-type-icon"></i>
//                         {addr.name || addr.address_type || "Address"}
//                       </h3>
//                       {addr.is_selected && (
//                         <span className="qb-default-badge">Default</span>
//                       )}
//                     </div>
//                     <div className="qb-address-details">
//                       <div className="qb-address-line">
//                         <strong>{addr.full_address}</strong>
//                       </div>
//                       {addr.city && (
//                         <div className="qb-address-line">{addr.city}</div>
//                       )}
//                       {addr.postcode && (
//                         <div className="qb-address-line">Postcode: {addr.postcode}</div>
//                       )}
//                     </div>
//                     {selectedAddressId === String(addr.address_id) && (
//                       <div className="qb-address-check">
//                         <i className="fas fa-check-circle"></i>
//                       </div>
//                     )}
//                   </div>
//                 ))}

//                 <div className="qb-add-address" onClick={() => navigate("/addresses")}>
//                   <i className="fas fa-plus qb-add-icon"></i>
//                   <span className="qb-add-text">Add New Address</span>
//                 </div>
//               </div>

//               <div className="qb-toggle">
//                 <label className="qb-toggle-label">
//                   <div className="qb-toggle-switch">
//                     <input
//                       type="checkbox"
//                       checked={useSameAddress}
//                       onChange={handleToggleSameAddress}
//                     />
//                     <span className="qb-toggle-slider"></span>
//                   </div>
//                   Use same address for pickup
//                 </label>
//               </div>
//             </>
//           ) : (
//             // New user or user without saved addresses
//             <div className="qb-address-form">
//               <div className="qb-form-grid">
//                 <div className="qb-form-group full-width">
//                   <label className="qb-form-label">
//                     Street Address *
//                     <input
//                       type="text"
//                       className="qb-form-input"
//                       value={addressForm.street_address}
//                       onChange={handleAddressFormChange("street_address")}
//                       placeholder="123 Main Street, Apt 4B"
//                       required
//                     />
//                   </label>
//                 </div>

//                 <div className="qb-form-group">
//                   <label className="qb-form-label">
//                     Postcode *
//                     <input
//                       type="text"
//                       className="qb-form-input"
//                       value={addressForm.postcode}
//                       onChange={handleAddressFormChange("postcode")}
//                       placeholder="SW1A 1AA"
//                       required
//                     />
//                   </label>
//                 </div>

//                 <div className="qb-form-group">
//                   <label className="qb-form-label">
//                     City
//                     <input
//                       type="text"
//                       className="qb-form-input"
//                       value={addressForm.city}
//                       onChange={handleAddressFormChange("city")}
//                       placeholder="London"
//                     />
//                   </label>
//                 </div>

//                 <div className="qb-form-group full-width">
//                   <label className="qb-form-label">
//                     Additional Details (Optional)
//                     <textarea
//                       className="qb-form-input"
//                       value={addressForm.additional_details}
//                       onChange={handleAddressFormChange("additional_details")}
//                       placeholder="Floor, building, landmarks..."
//                       rows="2"
//                     />
//                   </label>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Pickup & Delivery Schedule */}
//         <div className="qb-card">
//           <div className="qb-card-header">
//             <div className="qb-card-icon">
//               <i className="fas fa-calendar-alt"></i>
//             </div>
//             <h2 className="qb-card-title">Schedule Pickup & Delivery</h2>
//           </div>

//           <div className="qb-schedule-grid">
//             {/* Pickup Date */}
//             <div className="qb-schedule-section">
//               <div className="qb-schedule-header">
//                 <i className="fas fa-truck-loading qb-schedule-icon"></i>
//                 <h3 className="qb-schedule-title">Pickup Date & Time</h3>
//               </div>

//               <div className="qb-date-input">
//                 <label className="qb-date-label">Select Pickup Date</label>
//                 <input
//                   type="date"
//                   className="qb-date-field"
//                   value={collectDate}
//                   onChange={handleCollectDateChange}
//                   min={today}
//                 />
//                 {collectDate && (
//                   <p className="qb-date-display">{formatDateDDMMYYYY(collectDate)}</p>
//                 )}
//               </div>

//               {collectDate && (
//                 <div className="qb-slots-container">
//                   <label className="qb-slots-label">Available Pickup Times</label>
                  
//                   {loadingSlots.collect ? (
//                     <div className="qb-loading-slots">
//                       <div className="qb-loading-spinner-small"></div>
//                       <p>Loading available slots...</p>
//                     </div>
//                   ) : collectSlots.length === 0 ? (
//                     <div className="qb-no-slots">
//                       <i className="fas fa-calendar-times"></i>
//                       <p>No slots available for this date</p>
//                     </div>
//                   ) : (
//                     <div className="qb-slots-grid">
//                       {collectSlots.map((slot, index) => (
//                         <button
//                           key={`collect-${slot.start}-${index}`}
//                           type="button"
//                           className={`qb-slot-chip ${
//                             selectedCollectSlot?.start === slot.start ? "selected" : ""
//                           } ${!slot.enabled ? "disabled" : ""}`}
//                           onClick={() => handleCollectSlotSelect(slot)}
//                           disabled={!slot.enabled}
//                         >
//                           {formatTimeRange24Hour(slot.start, slot.end)}
//                         </button>
//                       ))}
//                     </div>
//                   )}

//                   {selectedCollectSlot && (
//                     <div className="qb-selected-slot">
//                       <div className="qb-selected-slot-header">
//                         <i className="fas fa-check-circle qb-selected-icon"></i>
//                         <span>Selected Pickup Time</span>
//                       </div>
//                       <div className="qb-selected-slot-details">
//                         {formatDateTimeDisplay(collectDate, selectedCollectSlot.start)}
//                         {selectedCollectSlot.end && ` to ${formatTime24Hour(selectedCollectSlot.end)}`}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* Delivery Date */}
//             <div className="qb-schedule-section">
//               <div className="qb-schedule-header">
//                 <i className="fas fa-truck qb-schedule-icon"></i>
//                 <h3 className="qb-schedule-title">Delivery Date & Time</h3>
//               </div>

//               <div className="qb-date-input">
//                 <label className="qb-date-label">Select Delivery Date</label>
//                 <input
//                   type="date"
//                   className="qb-date-field"
//                   value={deliverDate}
//                   onChange={handleDeliverDateChange}
//                   min={minDeliveryDate}
//                   disabled={!collectDate}
//                 />
//                 {deliverDate && (
//                   <p className="qb-date-display">{formatDateDDMMYYYY(deliverDate)}</p>
//                 )}
//                 {!collectDate && (
//                   <p className="qb-date-hint">Select pickup date first</p>
//                 )}
//               </div>

//               {deliverDate && (
//                 <div className="qb-slots-container">
//                   <label className="qb-slots-label">Available Delivery Times</label>
                  
//                   {loadingSlots.deliver ? (
//                     <div className="qb-loading-slots">
//                       <div className="qb-loading-spinner-small"></div>
//                       <p>Loading available slots...</p>
//                     </div>
//                   ) : deliverSlots.length === 0 ? (
//                     <div className="qb-no-slots">
//                       <i className="fas fa-calendar-times"></i>
//                       <p>No slots available for this date</p>
//                     </div>
//                   ) : (
//                     <div className="qb-slots-grid">
//                       {deliverSlots.map((slot, index) => (
//                         <button
//                           key={`deliver-${slot.start}-${index}`}
//                           type="button"
//                           className={`qb-slot-chip ${
//                             selectedDeliverSlot?.start === slot.start ? "selected" : ""
//                           } ${!slot.enabled ? "disabled" : ""}`}
//                           onClick={() => handleDeliverSlotSelect(slot)}
//                           disabled={!slot.enabled}
//                         >
//                           {formatTimeRange24Hour(slot.start, slot.end)}
//                         </button>
//                       ))}
//                     </div>
//                   )}

//                   {selectedDeliverSlot && (
//                     <div className="qb-selected-slot">
//                       <div className="qb-selected-slot-header">
//                         <i className="fas fa-check-circle qb-selected-icon"></i>
//                         <span>Selected Delivery Time</span>
//                       </div>
//                       <div className="qb-selected-slot-details">
//                         {formatDateTimeDisplay(deliverDate, selectedDeliverSlot.start)}
//                         {selectedDeliverSlot.end && ` to ${formatTime24Hour(selectedDeliverSlot.end)}`}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Special Instructions */}
//         <div className="qb-card">
//           <div className="qb-card-header">
//             <div className="qb-card-icon">
//               <i className="fas fa-sticky-note"></i>
//             </div>
//             <h2 className="qb-card-title">Special Instructions</h2>
//           </div>

//           <textarea
//             className="qb-notes-field"
//             placeholder="Any specific requirements or notes for our team..."
//             value={notes}
//             onChange={(e) => setNotes(e.target.value)}
//             maxLength={500}
//             rows={4}
//           />
//           <p className="qb-notes-hint">
//             Optional: Provide details to help us serve you better
//             {notes.length > 0 && (
//               <span className="qb-notes-counter"> ({notes.length}/500)</span>
//             )}
//           </p>
//         </div>

//         {/* Payment Section - Different for logged-in vs non-logged-in users */}
//         {!userToken ? (
//           /* Payment Option for Non-logged-in Users */
//           <div className="qb-card">
//             <div className="payment-method-header">
//               <div className="payment-method-title">
//                 <i className="fas fa-credit-card"></i>
//                 <h2 className="qb-card-title">Payment Option</h2>
//               </div>
//             </div>

//             <div className="save-card-option">
//               <div className="save-card-toggle">
//                 <label className="save-card-label">
//                   <input
//                     type="checkbox"
//                     checked={saveCardOption}
//                     onChange={(e) => setSaveCardOption(e.target.checked)}
//                   />
//                   <span className="save-card-text">
//                     <strong>Save my card for faster checkout next time</strong>
//                     <br />
//                     Your card will be securely saved by Stripe. No charges until your laundry manager sends the invoice.
//                   </span>
//                 </label>
//               </div>
              
//               <div className="payment-actions-container">
//                 <button 
//                   className="qb-submit-btn" 
//                   onClick={handleConfirmBooking}
//                   disabled={!isBookingValid() || loading || setupProcessing}
//                 >
//                   {loading || setupProcessing ? (
//                     <>
//                       <div className="payment-loading-spinner"></div>
//                       Processing...
//                     </>
//                   ) : saveCardOption ? (
//                     <>
//                       <i className="fas fa-credit-card"></i>
//                       Book Now & Save Card
//                     </>
//                   ) : (
//                     <>
//                       <i className="fas fa-check-circle"></i>
//                       Book Now (Pay Later)
//                     </>
//                   )}
//                 </button>
                
//                 {!saveCardOption && (
//                   <div className="payment-info-note">
//                     <i className="fas fa-info-circle"></i>
//                     <span>
//                       You'll receive an invoice after service completion. No upfront payment required.
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         ) : (
//           /* Payment Section for Logged-in Users */
//           !showPaymentSetup && (
//             <div className="qb-card">
//               <div className="payment-method-header">
//                 <div className="payment-method-title">
//                   <i className="fas fa-credit-card"></i>
//                   <h2 className="qb-card-title">Payment Method</h2>
//                 </div>
//                 {savedCards.length > 0 && !useNewCard && (
//                   <div className="payment-security-badge">
//                     <i className="fas fa-shield-alt"></i>
//                     <span>Secure Payment</span>
//                   </div>
//                 )}
//               </div>

//               {loadingCards ? (
//                 <div className="saved-cards-loading">
//                   <div className="saved-cards-loading-spinner"></div>
//                   <p>Loading saved cards...</p>
//                 </div>
//               ) : savedCards.length > 0 && !useNewCard ? (
//                 <>
//                   <div className="saved-card-info">
//                     <div className="saved-card-display">
//                       <div className="saved-card-icon">
//                         <i className={`fas fa-credit-card ${getCardBrandClass(savedCards.find(c => c.is_default)?.brand)}`}></i>
//                       </div>
//                       <div className="saved-card-details">
//                         <div className="saved-card-brand">
//                           {savedCards.find(c => c.is_default)?.brand?.toUpperCase() || 'CARD'}
//                         </div>
//                         <div className="saved-card-number">
//                           •••• {savedCards.find(c => c.is_default)?.last4}
//                         </div>
//                         <div className="saved-card-default-badge">
//                           <i className="fas fa-check-circle"></i>
//                           Default Card
//                         </div>
//                       </div>
//                     </div>
                    
//                     <div className="payment-info-note">
//                       <i className="fas fa-info-circle"></i>
//                       <span>
//                         Your saved card will be charged only after your laundry manager sends the invoice.
//                         No upfront charges.
//                       </span>
//                     </div>
//                   </div>

//                   <div className="payment-actions-container">
//                     <button 
//                       className="qb-submit-btn" 
//                       onClick={handleConfirmBooking}
//                       disabled={!isBookingValid() || setupProcessing}
//                     >
//                       {setupProcessing ? (
//                         <>
//                           <div className="payment-loading-spinner"></div>
//                           Processing...
//                         </>
//                       ) : (
//                         <>
//                           <i className="fas fa-check-circle"></i>
//                           Use Saved Card & Confirm Booking
//                         </>
//                       )}
//                     </button>

//                     <div className="or-divider">
//                       <span>OR</span>
//                     </div>

//                     <button 
//                       className="qb-link-btn use-another-card-btn" 
//                       onClick={handleUseAnotherCard}
//                       disabled={setupProcessing}
//                     >
//                       <i className="fas fa-credit-card"></i>
//                       Pay with a different card
//                     </button>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   {savedCards.length > 0 && (
//                     <div className="back-to-saved-card">
//                       <button 
//                         className="back-to-saved-btn"
//                         onClick={handleBackToSavedCard}
//                       >
//                         <i className="fas fa-arrow-left"></i>
//                         Back to saved card
//                       </button>
//                     </div>
//                   )}
                  
//                   <div className="add-new-card-prompt">
//                     <div className="add-card-icon">
//                       <i className="fas fa-credit-card"></i>
//                     </div>
//                     <div className="add-card-content">
//                       <h3 className="add-card-title">
//                         {savedCards.length > 0 ? "Add Another Payment Method" : "Add Payment Method"}
//                       </h3>
//                       <p className="add-card-description">
//                         Your card will be securely saved for future payments. 
//                         No charges until your laundry manager sends the invoice.
//                       </p>
//                     </div>
//                     <button 
//                       className="qb-submit-btn add-card-btn" 
//                       onClick={handleUseAnotherCard}
//                       disabled={!isBookingValid() || setupProcessing}
//                     >
//                       {setupProcessing ? (
//                         <>
//                           <div className="payment-loading-spinner"></div>
//                           Processing...
//                         </>
//                       ) : (
//                         <>
//                           <i className="fas fa-plus-circle"></i>
//                           Add Card & Confirm Booking
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </>
//               )}
//             </div>
//           )
//         )}

//         {/* Action Buttons */}
//         <div className="qb-actions">
//           <button
//             type="button"
//             className="qb-cancel-btn"
//             onClick={() => navigate("/")}
//             disabled={setupProcessing || loading}
//           >
//             <i className="fas fa-times"></i> Cancel
//           </button>
          
//           {!userToken && (
//             <button
//               type="button"
//               className="qb-submit-btn"
//               onClick={handleConfirmBooking}
//               disabled={!isBookingValid() || setupProcessing || loading}
//             >
//               {setupProcessing || loading ? (
//                 <>
//                   <div className="payment-loading-spinner"></div>
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   <i className="fas fa-check-circle"></i>
//                   {saveCardOption ? "Book Now & Save Card" : "Book Now"}
//                 </>
//               )}
//             </button>
//           )}
//         </div>
//       </main>

//       {/* Stripe Payment Modal */}
//       {showPaymentSetup && (
//         <div className="payment-modal-backdrop">
//           <div className="payment-modal">
//             {!setupClientSecret ? (
//               <div className="payment-loading-state">
//                 <div className="payment-loading-spinner"></div>
//                 <p>Initializing secure payment…</p>
//               </div>
//             ) : (
//               <Elements
//                 stripe={stripePromise}
//                 options={{
//                   clientSecret: setupClientSecret,
//                   appearance: { theme: "stripe" },
//                 }}
//               >
//                 <StripeSetupForm
//                   onSetupSuccess={handleSetupSuccess}
//                   onSetupError={handleSetupError}
//                   onCancel={handlePaymentModalCancel}
//                   setupProcessing={setupProcessing}
//                   userToken={userToken}
//                 />
//               </Elements>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Toast Notification */}
//       {toast && (
//         <div className="qb-toast">
//           <i className="fas fa-info-circle"></i>
//           {toast}
//         </div>
//       )}
//     </div>
//   );
// }

// src/components/QuickBooking.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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

// Initialize Stripe
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
/*                           Main QuickBooking Component                      */
/* -------------------------------------------------------------------------- */
export default function QuickBooking() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  // State management
  const [loading, setLoading] = useState(false);
  const [setupProcessing, setSetupProcessing] = useState(false);
  const [showPaymentSetup, setShowPaymentSetup] = useState(false);
  const [toast, setToast] = useState(null);
  const [savedCards, setSavedCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [setupClientSecret, setSetupClientSecret] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [userToken, setUserToken] = useState(localStorage.getItem("jwtToken"));
  const [bookingData, setBookingData] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState(null);

  // Unified payment option for ALL users
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

  // Address form for all users
  const [addressForm, setAddressForm] = useState({
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

  /* ---------------------------- Data Fetching ----------------------------- */
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

  /* -------------------------- FIXED TIME SLOT FUNCTIONS ------------------------- */
  // FIXED: This function now works properly with your API
  const fetchTimeSlots = useCallback(async (dateIso, isDelivery = false) => {
    if (!dateIso) return [];

    const tzOffset = -new Date().getTimezoneOffset();

    // Format date for API (YYYY-MM-DD)
    const formattedDate = dateIso;
    
    const params = new URLSearchParams({
      date: formattedDate,
      format: "24",
      tzOffset: tzOffset.toString(),
    });

    if (isDelivery) {
      params.set("isDelivery", "true");

      if (collectDate && selectedCollectSlotStart) {
        // Format the pickup date
        const pickupFormattedDate = collectDate;
        const h = selectedCollectSlotStart.getHours().toString().padStart(2, "0");
        const m = selectedCollectSlotStart.getMinutes().toString().padStart(2, "0");
        params.set("pickupDate", pickupFormattedDate);
        params.set("pickupSlotStart", `${h}:${m}`);
      }
    }

    try {
      console.log(`Fetching ${isDelivery ? 'delivery' : 'pickup'} slots for date:`, formattedDate);
      
      const response = await fetch(`${API_BASE}/time-slots?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error(`Failed to fetch slots: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched slots data:", data);
      
      // Handle response format - ensure we return an array
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
  }, [collectDate, selectedCollectSlotStart, showToast]);

  const fetchCollectSlots = useCallback(async () => {
    if (!collectDate) return;
    
    console.log("Fetching collect slots for date:", collectDate);
    setLoadingSlots(prev => ({ ...prev, collect: true }));
    
    try {
      const slots = await fetchTimeSlots(collectDate, false);
      console.log("Received collect slots:", slots);
      setCollectSlots(slots);

      // Reset selected slot if it's no longer valid
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
      console.log("Missing requirements for delivery slots:", { deliverDate, collectDate, selectedCollectSlotStart });
      return;
    }
    
    console.log("Fetching delivery slots for date:", deliverDate);
    setLoadingSlots(prev => ({ ...prev, deliver: true }));
    
    try {
      const slots = await fetchTimeSlots(deliverDate, true);
      console.log("Received delivery slots:", slots);
      setDeliverSlots(slots);

      // Reset selected slot if it's no longer valid
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
  const prepareOrderData = useCallback(() => {
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

    // Get address details
    let addressData = {};
    if (userToken && addresses.length > 0 && selectedAddressId) {
      const selectedAddress = addresses.find(addr => 
        String(addr.address_id) === selectedAddressId
      );
      addressData = {
        address_id: selectedAddressId,
        pickup_address_id: useSameAddress ? selectedAddressId : selectedPickupAddressId,
        use_same_address: useSameAddress,
        street_address: selectedAddress?.full_address || "",
        postcode: selectedAddress?.postcode || "",
        city: selectedAddress?.city || "",
        house_number: selectedAddress?.house_number || "",
        full_address: selectedAddress?.full_address || "",
        street_name: selectedAddress?.full_address || "",
      };
    } else {
      addressData = {
        street_address: addressForm.street_address,
        postcode: addressForm.postcode,
        city: addressForm.city || "",
        full_address: addressForm.street_address,
        additional_details: addressForm.additional_details || "",
        house_number: addressForm.house_number || "",
        street_name: addressForm.street_address || "",
      };
    }

    return {
      ...addressData,
      name: userInfo.name,
      email: userInfo.email,
      phone: userInfo.phone,
      collect_slot: pickupSlotText,
      delivery_slot: deliverySlotText,
      notes: notes.trim() || null,
      images: [],
    };
  }, [
    selectedCollectSlot,
    selectedDeliverSlot,
    collectDate,
    deliverDate,
    userToken,
    addresses,
    selectedAddressId,
    selectedPickupAddressId,
    useSameAddress,
    addressForm,
    notes,
    userInfo,
  ]);

  /* ------------------------- Main Booking Flow ---------------------------- */
  const handleConfirmBooking = async () => {
    setLoading(true);
    
    try {
      // 1️⃣ Prepare order data
      const order = prepareOrderData();
      if (!order) throw new Error("Please select pickup and delivery times");

      console.log("Creating quick booking:", order);

      // 2️⃣ Create quick booking (ALWAYS FIRST)
      const response = await fetch(`${API_BASE}/quick-booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });

      const bookingData = await response.json();

      if (!response.ok) {
        throw new Error(bookingData.message || "Failed to create booking");
      }

      // 3️⃣ Store booking data
      setBookingData(bookingData);
      setPendingBookingData(bookingData);

      // 4️⃣ Save token and update state
      if (bookingData.token) {
        localStorage.setItem("jwtToken", bookingData.token);
        setUserToken(bookingData.token);
        
        if (bookingData.user) {
          login({
            id: bookingData.user.id,
            name: bookingData.user.name,
            email: bookingData.user.email,
            phone: bookingData.user.phone,
          });
        }
      }

      // 5️⃣ Store user data for PersonalInfo component
      const userInfoData = {
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        bookingId: bookingData.order?.id
      };
      localStorage.setItem("quick_booking_user_info", JSON.stringify(userInfoData));

      // 6️⃣ For ALL users: If they want to save card, show Stripe setup
      if (saveCardOption) {
        showToast("Please complete card setup to confirm your booking", "info");
        await initiateStripeSetup(bookingData.token, bookingData.stripeCustomerId);
      } else {
        showToast("Booking created successfully!", "success");
        
        setTimeout(() => {
          navigate("/thankyou", {
            state: {
              orderId: bookingData.order?.id,
              paymentStatus: "pending",
              paymentMethod: "invoice",
              pickupDate: formatDateDDMMYYYY(collectDate),
              pickupTime: formatTimeRange24Hour(selectedCollectSlot?.start, selectedCollectSlot?.end),
              deliveryDate: formatDateDDMMYYYY(deliverDate),
              deliveryTime: formatTimeRange24Hour(selectedDeliverSlot?.start, selectedDeliverSlot?.end),
              message: "Your quick booking has been confirmed! You'll receive an invoice after service.",
            },
          });
        }, 1000);
      }

    } catch (error) {
      console.error("Booking error:", error);
      showToast(error.message || "Failed to create booking", "error");
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

    setLoading(true);
    
    try {
      const selectedCardData = savedCards.find(card => card.id === selectedCard);
      if (!selectedCardData) {
        throw new Error("Selected card not found");
      }

      const order = prepareOrderData();
      if (!order) throw new Error("Order data missing");

      const orderWithPayment = {
        ...order,
        payment_method_id: selectedCardData.payment_method_id,
        stripe_customer_id: customerId,
      };

      const response = await fetch(`${API_BASE}/express_order`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderWithPayment),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Order creation failed");
      }

      showToast("Booking confirmed with saved card!", "success");
      
      setTimeout(() => {
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
      }, 1000);

    } catch (error) {
      console.error("Saved card booking error:", error);
      showToast(error.message || "Failed to create booking", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle "Use Another Card" for logged-in users
  const handleUseAnotherCard = async () => {
    try {
      setSetupProcessing(true);
      
      const order = prepareOrderData();
      if (!order) throw new Error("Please select pickup and delivery times");

      const response = await fetch(`${API_BASE}/quick-booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });

      const bookingData = await response.json();

      if (!response.ok) {
        throw new Error(bookingData.message || "Failed to create booking");
      }

      setBookingData(bookingData);
      setPendingBookingData(bookingData);

      const token = userToken || localStorage.getItem("jwtToken");
      if (!token) throw new Error("Authentication required");
      
      await initiateStripeSetup(token, bookingData.stripeCustomerId);
      
    } catch (err) {
      showToast(err.message || "Failed to setup card", "error");
    } finally {
      setSetupProcessing(false);
    }
  };

  // Initiate Stripe setup AFTER booking
  const initiateStripeSetup = async (token, stripeCustomerId) => {
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
      setCustomerId(setupData.customerId || stripeCustomerId);
      setShowPaymentSetup(true);

    } catch (error) {
      console.error("Stripe setup error:", error);
      showToast(error.message || "Failed to setup card payment", "error");
      
      setTimeout(() => {
        showToast("Please try again to complete your booking", "error");
      }, 2000);
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
      showToast("Card saved successfully! Your booking is confirmed.", "success");
      
      setTimeout(() => {
        navigate("/thankyou", {
          state: {
            orderId: bookingData?.order?.id || pendingBookingData?.order?.id,
            paymentStatus: "card_saved",
            paymentMethod: "new_card",
            pickupDate: formatDateDDMMYYYY(collectDate),
            pickupTime: formatTimeRange24Hour(selectedCollectSlot?.start, selectedCollectSlot?.end),
            deliveryDate: formatDateDDMMYYYY(deliverDate),
            deliveryTime: formatTimeRange24Hour(selectedDeliverSlot?.start, selectedDeliverSlot?.end),
            message: "Your booking is confirmed and your card has been saved for future payments.",
          },
        });
      }, 1000);

    } catch (error) {
      console.error("Setup success error:", error);
      showToast(error.message || "Failed to save card", "error");
      
      if (bookingData || pendingBookingData) {
        setTimeout(() => {
          navigate("/thankyou", {
            state: {
              orderId: bookingData?.order?.id || pendingBookingData?.order?.id,
              paymentStatus: "card_saved",
              paymentMethod: "new_card",
              pickupDate: formatDateDDMMYYYY(collectDate),
              pickupTime: formatTimeRange24Hour(selectedCollectSlot?.start, selectedCollectSlot?.end),
              deliveryDate: formatDateDDMMYYYY(deliverDate),
              deliveryTime: formatTimeRange24Hour(selectedDeliverSlot?.start, selectedDeliverSlot?.end),
              message: "Your booking is confirmed! There was an issue setting your card as default, but you can update it later.",
            },
          });
        }, 1000);
      }
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
  const handleCollectDateChange = (e) => {
    const newDate = e.target.value;
    console.log("Collect date changed to:", newDate);
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
    console.log("Delivery date changed to:", newDate);
    
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

    console.log("Selected collect slot:", slot);
    
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
    
    console.log("Selected delivery slot:", slot);
    
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
    if (!userInfo.name.trim()) return false;
    if (!userInfo.email.trim()) return false;
    if (!userInfo.phone.trim()) return false;
    if (!selectedCollectSlot || !selectedDeliverSlot) return false;
    
    if (userToken && addresses.length > 0 && !showAddressForm) {
      if (!selectedAddressId) return false;
      if (!useSameAddress && !selectedPickupAddressId) return false;
    } else {
      if (!addressForm.street_address.trim()) return false;
      if (!addressForm.postcode.trim()) return false;
    }
    
    return true;
  };

  /* ------------------------------ Render ---------------------------------- */
  return (
    <div className="qb-page">
      <div className="qb-container">

        {/* Title Section */}
        <div className="qb-title-section">
          <h1 className="qb-title">
            <i className="fas fa-calendar-check qb-title-icon"></i>
            Book Laundry Service
          </h1>
          <p className="qb-subtitle">
            Fill in your details, choose pickup & delivery times, and we'll handle the rest
          </p>
          
          {userToken && (
            <div className="qb-user-info">
              <i className="fas fa-user-check"></i>
              <span>Welcome back, {userInfo.name || user?.email}! Your info is pre-filled.</span>
            </div>
          )}
        </div>

        {/* Personal Information Card */}
        <div className="qb-card">
          <div className="qb-card-header">
            <div className="qb-section-icon">
              <i className="fas fa-user"></i>
            </div>
            <div>
              <h2 className="qb-section-title">Your Information</h2>
              <p className="qb-section-subtitle">We'll use this to contact you about your order</p>
            </div>
          </div>

          <div className="qb-form-grid">
            <div className="qb-form-group">
              <label className="qb-form-label">
                <i className="fas fa-user-tag"></i>
                Full Name
                <input
                  type="text"
                  className="qb-form-input"
                  value={userInfo.name}
                  onChange={handleUserInfoChange("name")}
                  placeholder="John Smith"
                  required
                />
              </label>
            </div>

            <div className="qb-form-group">
              <label className="qb-form-label">
                <i className="fas fa-envelope"></i>
                Email Address
                <input
                  type="email"
                  className="qb-form-input"
                  value={userInfo.email}
                  onChange={handleUserInfoChange("email")}
                  placeholder="john@example.com"
                  required
                />
              </label>
            </div>

            <div className="qb-form-group">
              <label className="qb-form-label">
                <i className="fas fa-phone"></i>
                Phone Number
                <input
                  type="tel"
                  className="qb-form-input"
                  value={userInfo.phone}
                  onChange={handleUserInfoChange("phone")}
                  placeholder="+44 20 1234 5678"
                  required
                />
              </label>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="qb-card">
          <div className="qb-card-header">
            <div className="qb-section-icon">
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <div>
              <h2 className="qb-section-title">Delivery Address</h2>
              <p className="qb-section-subtitle">Where should we pick up and deliver your laundry?</p>
            </div>
          </div>

          {userToken && addresses.length > 0 && !showAddressForm ? (
            <>
              <div className="qb-address-selection">
                <h3 className="qb-address-selection-title">Select a Saved Address</h3>
                <div className="qb-address-grid">
                  {addresses.map((addr) => (
                    <div
                      key={addr.address_id}
                      className={`qb-address-option ${
                        selectedAddressId === String(addr.address_id) ? "selected" : ""
                      }`}
                      onClick={() => {
                        setSelectedAddressId(String(addr.address_id));
                        if (useSameAddress) setSelectedPickupAddressId(String(addr.address_id));
                      }}
                    >
                      <div className="qb-address-option-header">
                        <div className="qb-address-type">
                          <i className="fas fa-home"></i>
                          <span>{addr.name || "Home"}</span>
                        </div>
                        {addr.is_selected && (
                          <span className="qb-default-badge">
                            <i className="fas fa-star"></i>
                            Default
                          </span>
                        )}
                      </div>
                      <div className="qb-address-option-details">
                        <p className="qb-address-text">{addr.full_address}</p>
                        <p className="qb-address-postcode">
                          <i className="fas fa-map-pin"></i>
                          {addr.postcode}
                        </p>
                      </div>
                      {selectedAddressId === String(addr.address_id) && (
                        <div className="qb-address-selected">
                          <i className="fas fa-check-circle"></i>
                        </div>
                      )}
                    </div>
                  ))}

                  <div 
                    className="qb-add-address-option"
                    onClick={handleAddAddressClick}
                  >
                    <div className="qb-add-address-icon">
                      <i className="fas fa-plus-circle"></i>
                    </div>
                    <div className="qb-add-address-text">
                      <h4>Add New Address</h4>
                      <p>Enter a different delivery address</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="qb-address-toggle">
                <label className="qb-toggle-container">
                  <div className="qb-toggle-switch">
                    <input
                      type="checkbox"
                      checked={useSameAddress}
                      onChange={handleToggleSameAddress}
                    />
                    <span className="qb-toggle-slider"></span>
                  </div>
                  <div className="qb-toggle-label">
                    <span className="qb-toggle-title">Use same address for pickup</span>
                    <span className="qb-toggle-description">Pickup and delivery at the same location</span>
                  </div>
                </label>
              </div>
            </>
          ) : (
            <div className="qb-address-form-section">
              <div className="qb-form-grid">
                <div className="qb-form-group">
                  <label className="qb-form-label">
                    <i className="fas fa-home"></i>
                    House/Flat Number
                    <input
                      type="text"
                      className="qb-form-input"
                      value={addressForm.house_number}
                      onChange={handleAddressFormChange("house_number")}
                      placeholder="123"
                    />
                  </label>
                </div>

                <div className="qb-form-group full-width">
                  <label className="qb-form-label">
                    <i className="fas fa-road"></i>
                    Street Address *
                    <input
                      type="text"
                      className="qb-form-input"
                      value={addressForm.street_address}
                      onChange={handleAddressFormChange("street_address")}
                      placeholder="Main Street, Apt 4B"
                      required
                    />
                  </label>
                </div>

                <div className="qb-form-group">
                  <label className="qb-form-label">
                    <i className="fas fa-map-pin"></i>
                    Postcode *
                    <input
                      type="text"
                      className="qb-form-input"
                      value={addressForm.postcode}
                      onChange={handleAddressFormChange("postcode")}
                      placeholder="SW1A 1AA"
                      required
                    />
                  </label>
                </div>

                <div className="qb-form-group">
                  <label className="qb-form-label">
                    <i className="fas fa-city"></i>
                    City/Town
                    <input
                      type="text"
                      className="qb-form-input"
                      value={addressForm.city}
                      onChange={handleAddressFormChange("city")}
                      placeholder="London"
                    />
                  </label>
                </div>

                <div className="qb-form-group full-width">
                  <label className="qb-form-label">
                    <i className="fas fa-info-circle"></i>
                    Additional Details (Optional)
                    <textarea
                      className="qb-form-textarea"
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
                  className="qb-secondary-btn"
                  onClick={() => setShowAddressForm(false)}
                >
                  <i className="fas fa-arrow-left"></i>
                  Back to Saved Addresses
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pickup & Delivery Schedule */}
        <div className="qb-card">
          <div className="qb-card-header">
            <div className="qb-section-icon">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <div>
              <h2 className="qb-section-title">Schedule Pickup & Delivery</h2>
              <p className="qb-section-subtitle">Choose convenient times for collection and return</p>
            </div>
          </div>

          <div className="qb-schedule-container">
            {/* Pickup Section */}
            <div className="qb-schedule-section">
              <div className="qb-schedule-header">
                <div className="qb-schedule-icon pickup">
                  <i className="fas fa-truck-loading"></i>
                </div>
                <div>
                  <h3 className="qb-schedule-title">Pickup</h3>
                  <p className="qb-schedule-subtitle">When should we collect your laundry?</p>
                </div>
              </div>

              <div className="qb-date-section">
                <label className="qb-date-label">
                  <i className="fas fa-calendar-day"></i>
                  Pickup Date
                </label>
                <div className="qb-date-input-container">
                  <input
                    type="date"
                    className="qb-date-input"
                    value={collectDate}
                    onChange={handleCollectDateChange}
                    min={today}
                  />
                  <i className="fas fa-calendar-alt qb-date-icon"></i>
                </div>
                {collectDate && (
                  <p className="qb-date-display">
                    <i className="fas fa-check-circle"></i>
                    Selected: {formatDateDDMMYYYY(collectDate)}
                  </p>
                )}
              </div>

              {collectDate && (
                <div className="qb-time-slots-section">
                  <label className="qb-time-label">
                    <i className="fas fa-clock"></i>
                    Available Pickup Times
                  </label>
                  
                  {loadingSlots.collect ? (
                    <div className="qb-loading-state">
                      <div className="qb-loading-spinner"></div>
                      <p>Loading available slots...</p>
                    </div>
                  ) : collectSlots.length === 0 ? (
                    <div className="qb-empty-state">
                      <i className="fas fa-calendar-times"></i>
                      <p>No slots available for this date</p>
                    </div>
                  ) : (
                    <div className="qb-time-slots-grid">
                      {collectSlots.map((slot, index) => (
                        <button
                          key={`collect-${slot.start}-${index}`}
                          type="button"
                          className={`qb-time-slot ${
                            selectedCollectSlot?.start === slot.start ? "selected" : ""
                          } ${!slot.enabled ? "disabled" : ""}`}
                          onClick={() => handleCollectSlotSelect(slot)}
                          disabled={!slot.enabled}
                        >
                          <span className="qb-slot-time">{formatTimeRange24Hour(slot.start, slot.end)}</span>
                          {selectedCollectSlot?.start === slot.start && (
                            <i className="fas fa-check qb-slot-check"></i>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedCollectSlot && (
                    <div className="qb-selected-slot-info">
                      <div className="qb-selected-slot-header">
                        <i className="fas fa-check-circle"></i>
                        <span>Pickup Scheduled</span>
                      </div>
                      <div className="qb-selected-slot-details">
                        {formatDateDDMMYYYY(collectDate)} at {formatTimeRange24Hour(selectedCollectSlot.start, selectedCollectSlot.end)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Delivery Section */}
            <div className="qb-schedule-section">
              <div className="qb-schedule-header">
                <div className="qb-schedule-icon delivery">
                  <i className="fas fa-truck"></i>
                </div>
                <div>
                  <h3 className="qb-schedule-title">Delivery</h3>
                  <p className="qb-section-subtitle">When should we return your laundry?</p>
                </div>
              </div>

              <div className="qb-date-section">
                <label className="qb-date-label">
                  <i className="fas fa-calendar-day"></i>
                  Delivery Date
                </label>
                <div className="qb-date-input-container">
                  <input
                    type="date"
                    className="qb-date-input"
                    value={deliverDate}
                    onChange={handleDeliverDateChange}
                    min={minDeliveryDate}
                    disabled={!collectDate}
                  />
                  <i className="fas fa-calendar-alt qb-date-icon"></i>
                </div>
                {!collectDate && (
                  <p className="qb-date-hint">
                    <i className="fas fa-info-circle"></i>
                    Select pickup date first
                  </p>
                )}
                {deliverDate && (
                  <p className="qb-date-display">
                    <i className="fas fa-check-circle"></i>
                    Selected: {formatDateDDMMYYYY(deliverDate)}
                  </p>
                )}
              </div>

              {deliverDate && (
                <div className="qb-time-slots-section">
                  <label className="qb-time-label">
                    <i className="fas fa-clock"></i>
                    Available Delivery Times
                  </label>
                  
                  {loadingSlots.deliver ? (
                    <div className="qb-loading-state">
                      <div className="qb-loading-spinner"></div>
                      <p>Loading available slots...</p>
                    </div>
                  ) : deliverSlots.length === 0 ? (
                    <div className="qb-empty-state">
                      <i className="fas fa-calendar-times"></i>
                      <p>No slots available for this date</p>
                    </div>
                  ) : (
                    <div className="qb-time-slots-grid">
                      {deliverSlots.map((slot, index) => (
                        <button
                          key={`deliver-${slot.start}-${index}`}
                          type="button"
                          className={`qb-time-slot ${
                            selectedDeliverSlot?.start === slot.start ? "selected" : ""
                          } ${!slot.enabled ? "disabled" : ""}`}
                          onClick={() => handleDeliverSlotSelect(slot)}
                          disabled={!slot.enabled}
                        >
                          <span className="qb-slot-time">{formatTimeRange24Hour(slot.start, slot.end)}</span>
                          {selectedDeliverSlot?.start === slot.start && (
                            <i className="fas fa-check qb-slot-check"></i>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedDeliverSlot && (
                    <div className="qb-selected-slot-info">
                      <div className="qb-selected-slot-header">
                        <i className="fas fa-check-circle"></i>
                        <span>Delivery Scheduled</span>
                      </div>
                      <div className="qb-selected-slot-details">
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
        <div className="qb-card">
          <div className="qb-card-header">
            <div className="qb-section-icon">
              <i className="fas fa-sticky-note"></i>
            </div>
            <div>
              <h2 className="qb-section-title">Special Instructions</h2>
              <p className="qb-section-subtitle">Any specific requirements for our team?</p>
            </div>
          </div>

          <div className="qb-notes-container">
            <textarea
              className="qb-notes-input"
              placeholder="Example: Please ring bell twice, fragile items, specific handling instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={3}
            />
            <div className="qb-notes-footer">
              <div className="qb-notes-hint">
                <i className="fas fa-lightbulb"></i>
                Optional but helpful for better service
              </div>
              {notes.length > 0 && (
                <div className="qb-notes-counter">
                  {notes.length}/500 characters
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Section */}
        {!showPaymentSetup && (
          <div className="qb-card">
            <div className="qb-card-header">
              <div className="qb-section-icon">
                <i className="fas fa-credit-card"></i>
              </div>
              <div>
                <h2 className="qb-section-title">Payment Method</h2>
                <p className="qb-section-subtitle">Choose how you'd like to pay</p>
              </div>
              <div className="qb-security-badge">
                <i className="fas fa-shield-alt"></i>
                <span>Secure Payment</span>
              </div>
            </div>

            {userToken && loadingCards ? (
              <div className="qb-loading-cards">
                <div className="qb-loading-spinner"></div>
                <p>Loading your saved cards...</p>
              </div>
            ) : userToken && savedCards.length > 0 ? (
              <>
                <div className="qb-saved-cards-section">
                  <h3 className="qb-saved-cards-title">
                    <i className="fas fa-credit-card"></i>
                    Your Saved Cards
                  </h3>
                  <p className="qb-saved-cards-subtitle">Select a card or add a new one</p>
                  
                  <div className="qb-cards-list">
                    {savedCards.map((card) => (
                      <div
                        key={card.id}
                        className={`qb-card-option ${
                          selectedCard === card.id ? "selected" : ""
                        }`}
                        onClick={() => setSelectedCard(card.id)}
                      >
                        <div className="qb-card-option-icon">
                          <i className={`${getCardBrandIcon(card.brand)} ${getCardBrandClass(card.brand)}`}></i>
                        </div>
                        <div className="qb-card-option-details">
                          <div className="qb-card-brand">{card.brand?.toUpperCase() || 'CARD'}</div>
                          <div className="qb-card-number">•••• {card.last4}</div>
                          {card.is_default && (
                            <div className="qb-card-default">
                              <i className="fas fa-check-circle"></i>
                              Default Card
                            </div>
                          )}
                        </div>
                        {selectedCard === card.id && (
                          <div className="qb-card-selected">
                            <i className="fas fa-check-circle"></i>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="qb-add-card-option" onClick={handleUseAnotherCard}>
                    <div className="qb-add-card-icon">
                      <i className="fas fa-plus-circle"></i>
                    </div>
                    <div className="qb-add-card-text">
                      <h4>Use New Card</h4>
                      <p>Save a different card for future payments</p>
                    </div>
                    <div className="qb-add-card-arrow">
                      <i className="fas fa-chevron-right"></i>
                    </div>
                  </div>
                </div>

                <div className="qb-payment-actions">
                  <button 
                    className="qb-primary-btn qb-book-btn" 
                    onClick={handleSavedCardBooking}
                    disabled={!isBookingValid() || !selectedCard || loading}
                  >
                    {loading ? (
                      <>
                        <div className="qb-btn-spinner"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check-circle"></i>
                        Book with Selected Card
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="qb-payment-options">
                  <div className="qb-payment-option">
                    <div className="qb-payment-icon">
                      <i className="fas fa-credit-card"></i>
                    </div>
                    <div className="qb-payment-content">
                      <h3 className="qb-payment-title">Save Card for Faster Checkout</h3>
                      <p className="qb-payment-description">
                        Securely save your card with Stripe. No charges until your laundry manager sends the invoice.
                      </p>
                    </div>
                    <div className="qb-payment-toggle">
                      <label className="qb-switch">
                        <input
                          type="checkbox"
                          checked={saveCardOption}
                          onChange={(e) => setSaveCardOption(e.target.checked)}
                        />
                        <span className="qb-switch-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="qb-payment-info">
                  <div className="qb-payment-info-icon">
                    <i className="fas fa-info-circle"></i>
                  </div>
                  <div className="qb-payment-info-text">
                    {saveCardOption 
                      ? "Your card details are encrypted and stored securely by Stripe. Booking will be confirmed after card setup."
                      : "You'll receive an invoice after service completion. No card required for booking."}
                  </div>
                </div>

                <div className="qb-payment-actions">
                  <button 
                    className="qb-primary-btn qb-book-btn" 
                    onClick={handleConfirmBooking}
                    disabled={!isBookingValid() || loading || setupProcessing}
                  >
                    {loading || setupProcessing ? (
                      <>
                        <div className="qb-btn-spinner"></div>
                        Processing...
                      </>
                    ) : saveCardOption ? (
                      <>
                        <i className="fas fa-lock"></i>
                        Book Now & Save Card
                      </>
                    ) : (
                      <>
                        <i className="fas fa-calendar-check"></i>
                        Book Now (Pay Later)
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            <div className="qb-cancel-section">
              <button
                className="qb-secondary-btn"
                onClick={() => navigate("/")}
                disabled={loading || setupProcessing}
              >
                <i className="fas fa-times"></i>
                Cancel Booking
              </button>
            </div>
          </div>
        )}

        {/* Summary Section (Fixed at bottom on mobile) */}
        <div className="qb-summary-section">
          <div className="qb-summary-content">
            <div className="qb-summary-info">
              <div className="qb-summary-item">
                <i className="fas fa-calendar"></i>
                <span>Pickup: {selectedCollectSlot ? formatDateDDMMYYYY(collectDate) : "Not selected"}</span>
              </div>
              <div className="qb-summary-item">
                <i className="fas fa-truck"></i>
                <span>Delivery: {selectedDeliverSlot ? formatDateDDMMYYYY(deliverDate) : "Not selected"}</span>
              </div>
            </div>
            <div className="qb-summary-action">
              <button 
                className="qb-primary-btn qb-confirm-btn"
                onClick={userToken && savedCards.length > 0 ? handleSavedCardBooking : handleConfirmBooking}
                disabled={!isBookingValid() || loading || setupProcessing}
              >
                {loading ? (
                  <>
                    <div className="qb-btn-spinner"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle"></i>
                    Confirm Booking
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
        <div className={`qb-toast qb-toast-${toast.type}`}>
          <div className="qb-toast-icon">
            {toast.type === 'success' ? (
              <i className="fas fa-check-circle"></i>
            ) : toast.type === 'error' ? (
              <i className="fas fa-exclamation-circle"></i>
            ) : (
              <i className="fas fa-info-circle"></i>
            )}
          </div>
          <div className="qb-toast-message">{toast.msg}</div>
          <button className="qb-toast-close" onClick={() => setToast(null)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
    </div>
  );
}
