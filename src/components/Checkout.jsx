

// src/components/QuickBooking.jsx
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

// const API_BASE = "https://api.ironingboy.com";

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
//   userToken
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
//       <div className="stripe-modal-overlay" onClick={onCancel}></div>
//       <div className="stripe-modal-content">
//         <div className="stripe-modal-header">
//           <div className="stripe-modal-icon">
//             <i className="fas fa-shield-alt"></i>
//           </div>
//           <div>
//             <h3>Save Card to Complete Booking</h3>
//             <p>Your booking will be confirmed after you save your card securely.</p>
//           </div>
//           <button 
//             className="stripe-modal-close" 
//             onClick={onCancel}
//             disabled={submitting || setupProcessing}
//           >
//             <i className="fas fa-times"></i>
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="stripe-form">
//           <div className="stripe-form-content">
//             <div className="stripe-payment-info">
//               <div className="stripe-info-icon">
//                 <i className="fas fa-credit-card"></i>
//               </div>
//               <div className="stripe-info-text">
//                 <h4>No Charges Now</h4>
//                 <p>Your card will only be charged after your laundry manager sends the invoice.</p>
//               </div>
//             </div>

//             <div className="stripe-element-container">
//               <PaymentElement 
//                 options={{
//                   layout: {
//                     type: 'tabs',
//                     defaultCollapsed: false,
//                   },
//                   wallets: {
//                     applePay: 'never',
//                     googlePay: 'never',
//                   }
//                 }}
//               />
//             </div>
            
//             <div className="stripe-consent-section">
//               <div className="stripe-consent-checkbox">
//                 <input
//                   type="checkbox"
//                   id="consent-checkbox"
//                   checked={consent}
//                   onChange={(e) => setConsent(e.target.checked)}
//                   required
//                 />
//                 <label htmlFor="consent-checkbox" className="stripe-consent-label">
//                   <span className="stripe-consent-title">Yes, save my card for future payments</span>
//                   <span className="stripe-consent-description">
//                     I authorize IroningBoy to securely save this card and use it for automatic payment of laundry service invoices.
//                   </span>
//                 </label>
//               </div>
//             </div>
            
//             {error && (
//               <div className="stripe-error-message">
//                 <i className="fas fa-exclamation-triangle"></i>
//                 <span>{error}</span>
//               </div>
//             )}
//           </div>

//           <div className="stripe-modal-actions">
//             <button
//               type="submit"
//               disabled={!stripe || submitting || setupProcessing || !consent}
//               className="stripe-confirm-btn"
//             >
//               {submitting ? (
//                 <>
//                   <div className="stripe-loading-spinner"></div>
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   <i className="fas fa-lock"></i>
//                   Complete Booking & Save Card
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
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
//   const [savedCards, setSavedCards] = useState([]);
//   const [loadingCards, setLoadingCards] = useState(true);
//   const [setupClientSecret, setSetupClientSecret] = useState(null);
//   const [customerId, setCustomerId] = useState(null);
//   const [userToken, setUserToken] = useState(localStorage.getItem("jwtToken"));
//   const [bookingData, setBookingData] = useState(null);
//   const [showAddressForm, setShowAddressForm] = useState(false);
//   const [pendingBookingData, setPendingBookingData] = useState(null);

//   // Unified payment option for ALL users
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

//   // Address form for all users
//   const [addressForm, setAddressForm] = useState({
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

//   /* ---------------------------- Data Fetching ----------------------------- */
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
//         if (data.cards?.length > 0) {
//           const defaultCard = data.cards.find(card => card.is_default);
//           if (defaultCard) {
//             setSelectedCard(defaultCard.id);
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching saved cards:", error);
//       setSavedCards([]);
//     } finally {
//       setLoadingCards(false);
//     }
//   }, [userToken]);

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

//   const createSetupIntent = useCallback(async (token) => {
//     try {
//       const response = await fetch(`${API_BASE}/stripe/init-setup-intent`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`,
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
//   }, []);

//   /* -------------------------- FIXED TIME SLOT FUNCTIONS ------------------------- */
//   // FIXED: This function now works properly with your API
//   const fetchTimeSlots = useCallback(async (dateIso, isDelivery = false) => {
//     if (!dateIso) return [];

//     const tzOffset = -new Date().getTimezoneOffset();

//     // Format date for API (YYYY-MM-DD)
//     const formattedDate = dateIso;
    
//     const params = new URLSearchParams({
//       date: formattedDate,
//       format: "24",
//       tzOffset: tzOffset.toString(),
//     });

//     if (isDelivery) {
//       params.set("isDelivery", "true");

//       if (collectDate && selectedCollectSlotStart) {
//         // Format the pickup date
//         const pickupFormattedDate = collectDate;
//         const h = selectedCollectSlotStart.getHours().toString().padStart(2, "0");
//         const m = selectedCollectSlotStart.getMinutes().toString().padStart(2, "0");
//         params.set("pickupDate", pickupFormattedDate);
//         params.set("pickupSlotStart", `${h}:${m}`);
//       }
//     }

//     try {
//       console.log(`Fetching ${isDelivery ? 'delivery' : 'pickup'} slots for date:`, formattedDate);
      
//       const response = await fetch(`${API_BASE}/time-slots?${params.toString()}`, {
//         method: 'GET',
//         headers: {
//           'Accept': 'application/json',
//           'Content-Type': 'application/json',
//         },
//       });
      
//       console.log("Response status:", response.status);
      
//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error("Server error:", errorText);
//         throw new Error(`Failed to fetch slots: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log("Fetched slots data:", data);
      
//       // Handle response format - ensure we return an array
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
//   }, [collectDate, selectedCollectSlotStart, showToast]);

//   const fetchCollectSlots = useCallback(async () => {
//     if (!collectDate) return;
    
//     console.log("Fetching collect slots for date:", collectDate);
//     setLoadingSlots(prev => ({ ...prev, collect: true }));
    
//     try {
//       const slots = await fetchTimeSlots(collectDate, false);
//       console.log("Received collect slots:", slots);
//       setCollectSlots(slots);

//       // Reset selected slot if it's no longer valid
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
//       console.log("Missing requirements for delivery slots:", { deliverDate, collectDate, selectedCollectSlotStart });
//       return;
//     }
    
//     console.log("Fetching delivery slots for date:", deliverDate);
//     setLoadingSlots(prev => ({ ...prev, deliver: true }));
    
//     try {
//       const slots = await fetchTimeSlots(deliverDate, true);
//       console.log("Received delivery slots:", slots);
//       setDeliverSlots(slots);

//       // Reset selected slot if it's no longer valid
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
//   const prepareOrderData = useCallback(() => {
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
//         full_address: selectedAddress?.full_address || "",
//         street_name: selectedAddress?.full_address || "",
//       };
//     } else {
//       addressData = {
//         street_address: addressForm.street_address,
//         postcode: addressForm.postcode,
//         city: addressForm.city || "",
//         full_address: addressForm.street_address,
//         additional_details: addressForm.additional_details || "",
//         house_number: addressForm.house_number || "",
//         street_name: addressForm.street_address || "",
//       };
//     }

//     return {
//       ...addressData,
//       name: userInfo.name,
//       email: userInfo.email,
//       phone: userInfo.phone,
//       collect_slot: pickupSlotText,
//       delivery_slot: deliverySlotText,
//       notes: notes.trim() || null,
//       images: [],
//     };
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
//     userInfo,
//   ]);

//   /* ------------------------- Main Booking Flow ---------------------------- */
//   const handleConfirmBooking = async () => {
//     setLoading(true);
    
//     try {
//       // 1️⃣ Prepare order data
//       const order = prepareOrderData();
//       if (!order) throw new Error("Please select pickup and delivery times");

//       console.log("Creating quick booking:", order);

//       // 2️⃣ Create quick booking (ALWAYS FIRST)
//       const response = await fetch(`${API_BASE}/quick-booking`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(order),
//       });

//       const bookingData = await response.json();

//       if (!response.ok) {
//         throw new Error(bookingData.message || "Failed to create booking");
//       }

//       // 3️⃣ Store booking data
//       setBookingData(bookingData);
//       setPendingBookingData(bookingData);

//       // 4️⃣ Save token and update state
//       if (bookingData.token) {
//         localStorage.setItem("jwtToken", bookingData.token);
//         setUserToken(bookingData.token);
        
//         if (bookingData.user) {
//           login({
//             id: bookingData.user.id,
//             name: bookingData.user.name,
//             email: bookingData.user.email,
//             phone: bookingData.user.phone,
//           });
//         }
//       }

//       // 5️⃣ Store user data for PersonalInfo component
//       const userInfoData = {
//         name: userInfo.name,
//         email: userInfo.email,
//         phone: userInfo.phone,
//         bookingId: bookingData.order?.id
//       };
//       localStorage.setItem("quick_booking_user_info", JSON.stringify(userInfoData));

//       // 6️⃣ For ALL users: If they want to save card, show Stripe setup
//       if (saveCardOption) {
//         showToast("Please complete card setup to confirm your booking", "info");
//         await initiateStripeSetup(bookingData.token, bookingData.stripeCustomerId);
//       } else {
//         showToast("Booking created successfully!", "success");
        
//         setTimeout(() => {
//           navigate("/thankyou", {
//             state: {
//               orderId: bookingData.order?.id,
//               paymentStatus: "pending",
//               paymentMethod: "invoice",
//               pickupDate: formatDateDDMMYYYY(collectDate),
//               pickupTime: formatTimeRange24Hour(selectedCollectSlot?.start, selectedCollectSlot?.end),
//               deliveryDate: formatDateDDMMYYYY(deliverDate),
//               deliveryTime: formatTimeRange24Hour(selectedDeliverSlot?.start, selectedDeliverSlot?.end),
//               message: "Your quick booking has been confirmed! You'll receive an invoice after service.",
//             },
//           });
//         }, 1000);
//       }

//     } catch (error) {
//       console.error("Booking error:", error);
//       showToast(error.message || "Failed to create booking", "error");
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

//     setLoading(true);
    
//     try {
//       const selectedCardData = savedCards.find(card => card.id === selectedCard);
//       if (!selectedCardData) {
//         throw new Error("Selected card not found");
//       }

//       const order = prepareOrderData();
//       if (!order) throw new Error("Order data missing");

//       const orderWithPayment = {
//         ...order,
//         payment_method_id: selectedCardData.payment_method_id,
//         stripe_customer_id: customerId,
//       };

//       const response = await fetch(`${API_BASE}/express_order`, {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer ${userToken}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(orderWithPayment),
//       });

//       const data = await response.json();
//       if (!response.ok) {
//         throw new Error(data.error || "Order creation failed");
//       }

//       showToast("Booking confirmed with saved card!", "success");
      
//       setTimeout(() => {
//         navigate("/thankyou", {
//           state: {
//             orderId: data.order_id,
//             paymentStatus: "card_saved",
//             paymentMethod: "saved_card",
//             pickupDate: formatDateDDMMYYYY(collectDate),
//             pickupTime: formatTimeRange24Hour(selectedCollectSlot.start, selectedCollectSlot.end),
//             deliveryDate: formatDateDDMMYYYY(deliverDate),
//             deliveryTime: formatTimeRange24Hour(selectedDeliverSlot.start, selectedDeliverSlot.end),
//           },
//         });
//       }, 1000);

//     } catch (error) {
//       console.error("Saved card booking error:", error);
//       showToast(error.message || "Failed to create booking", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle "Use Another Card" for logged-in users
//   const handleUseAnotherCard = async () => {
//     try {
//       setSetupProcessing(true);
      
//       const order = prepareOrderData();
//       if (!order) throw new Error("Please select pickup and delivery times");

//       const response = await fetch(`${API_BASE}/quick-booking`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(order),
//       });

//       const bookingData = await response.json();

//       if (!response.ok) {
//         throw new Error(bookingData.message || "Failed to create booking");
//       }

//       setBookingData(bookingData);
//       setPendingBookingData(bookingData);

//       const token = userToken || localStorage.getItem("jwtToken");
//       if (!token) throw new Error("Authentication required");
      
//       await initiateStripeSetup(token, bookingData.stripeCustomerId);
      
//     } catch (err) {
//       showToast(err.message || "Failed to setup card", "error");
//     } finally {
//       setSetupProcessing(false);
//     }
//   };

//   // Initiate Stripe setup AFTER booking
//   const initiateStripeSetup = async (token, stripeCustomerId) => {
//     setSetupProcessing(true);

//     try {
//       if (!token) {
//         throw new Error("Authentication token missing");
//       }

//       const setupData = await createSetupIntent(token);
      
//       if (!setupData || !setupData.setupIntentClientSecret) {
//         throw new Error("Stripe setup failed");
//       }

//       setSetupClientSecret(setupData.setupIntentClientSecret);
//       setCustomerId(setupData.customerId || stripeCustomerId);
//       setShowPaymentSetup(true);

//     } catch (error) {
//       console.error("Stripe setup error:", error);
//       showToast(error.message || "Failed to setup card payment", "error");
      
//       setTimeout(() => {
//         showToast("Please try again to complete your booking", "error");
//       }, 2000);
//     } finally {
//       setSetupProcessing(false);
//     }
//   };

//   // Handle Stripe setup success (card saved)
//   const handleSetupSuccess = async (setupIntent) => {
//     setSetupProcessing(true);

//     try {
//       const token = userToken || localStorage.getItem("jwtToken");
//       if (!token) throw new Error("Authentication required");

//       const paymentMethodId = setupIntent.payment_method || setupIntent.latest_attempt?.payment_method;
//       if (!paymentMethodId) {
//         throw new Error("Payment method not returned by Stripe");
//       }

//       if (customerId) {
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

//       setShowPaymentSetup(false);
//       showToast("Card saved successfully! Your booking is confirmed.", "success");
      
//       setTimeout(() => {
//         navigate("/thankyou", {
//           state: {
//             orderId: bookingData?.order?.id || pendingBookingData?.order?.id,
//             paymentStatus: "card_saved",
//             paymentMethod: "new_card",
//             pickupDate: formatDateDDMMYYYY(collectDate),
//             pickupTime: formatTimeRange24Hour(selectedCollectSlot?.start, selectedCollectSlot?.end),
//             deliveryDate: formatDateDDMMYYYY(deliverDate),
//             deliveryTime: formatTimeRange24Hour(selectedDeliverSlot?.start, selectedDeliverSlot?.end),
//             message: "Your booking is confirmed and your card has been saved for future payments.",
//           },
//         });
//       }, 1000);

//     } catch (error) {
//       console.error("Setup success error:", error);
//       showToast(error.message || "Failed to save card", "error");
      
//       if (bookingData || pendingBookingData) {
//         setTimeout(() => {
//           navigate("/thankyou", {
//             state: {
//               orderId: bookingData?.order?.id || pendingBookingData?.order?.id,
//               paymentStatus: "card_saved",
//               paymentMethod: "new_card",
//               pickupDate: formatDateDDMMYYYY(collectDate),
//               pickupTime: formatTimeRange24Hour(selectedCollectSlot?.start, selectedCollectSlot?.end),
//               deliveryDate: formatDateDDMMYYYY(deliverDate),
//               deliveryTime: formatTimeRange24Hour(selectedDeliverSlot?.start, selectedDeliverSlot?.end),
//               message: "Your booking is confirmed! There was an issue setting your card as default, but you can update it later.",
//             },
//           });
//         }, 1000);
//       }
//     } finally {
//       setSetupProcessing(false);
//     }
//   };

//   const handleSetupError = (errorMessage) => {
//     showToast(errorMessage || "Failed to save card. Please try again.", "error");
//   };

//   const handlePaymentModalCancel = () => {
//     setShowPaymentSetup(false);
//     setSetupClientSecret(null);
    
//     showToast("Booking not confirmed. Please complete card setup to confirm your booking.", "warning");
//   };

//   /* ---------------------------- UI Handlers ------------------------------- */
//   const handleCollectDateChange = (e) => {
//     const newDate = e.target.value;
//     console.log("Collect date changed to:", newDate);
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
//     console.log("Delivery date changed to:", newDate);
    
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

//     console.log("Selected collect slot:", slot);
    
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
    
//     console.log("Selected delivery slot:", slot);
    
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
//     if (!userInfo.name.trim()) return false;
//     if (!userInfo.email.trim()) return false;
//     if (!userInfo.phone.trim()) return false;
//     if (!selectedCollectSlot || !selectedDeliverSlot) return false;
    
//     if (userToken && addresses.length > 0 && !showAddressForm) {
//       if (!selectedAddressId) return false;
//       if (!useSameAddress && !selectedPickupAddressId) return false;
//     } else {
//       if (!addressForm.street_address.trim()) return false;
//       if (!addressForm.postcode.trim()) return false;
//     }
    
//     return true;
//   };

//   /* ------------------------------ Render ---------------------------------- */
//   return (
//     <div className="qb-page">
//       <div className="qb-container">

//         {/* Title Section */}
//         <div className="qb-title-section">
//           <h1 className="qb-title">
//             <i className="fas fa-calendar-check qb-title-icon"></i>
//             Book Laundry Service
//           </h1>
//           <p className="qb-subtitle">
//             Fill in your details, choose pickup & delivery times, and we'll handle the rest
//           </p>
          
//           {userToken && (
//             <div className="qb-user-info">
//               <i className="fas fa-user-check"></i>
//               <span>Welcome back, {userInfo.name || user?.email}! Your info is pre-filled.</span>
//             </div>
//           )}
//         </div>

//         {/* Personal Information Card */}
//         <div className="qb-card">
//           <div className="qb-card-header">
//             <div className="qb-section-icon">
//               <i className="fas fa-user"></i>
//             </div>
//             <div>
//               <h2 className="qb-section-title">Your Information</h2>
//               <p className="qb-section-subtitle">We'll use this to contact you about your order</p>
//             </div>
//           </div>

//           <div className="qb-form-grid">
//             <div className="qb-form-group">
//               <label className="qb-form-label">
//                 <i className="fas fa-user-tag"></i>
//                 Full Name
//                 <input
//                   type="text"
//                   className="qb-form-input"
//                   value={userInfo.name}
//                   onChange={handleUserInfoChange("name")}
//                   placeholder="John Smith"
//                   required
//                 />
//               </label>
//             </div>

//             <div className="qb-form-group">
//               <label className="qb-form-label">
//                 <i className="fas fa-envelope"></i>
//                 Email Address
//                 <input
//                   type="email"
//                   className="qb-form-input"
//                   value={userInfo.email}
//                   onChange={handleUserInfoChange("email")}
//                   placeholder="john@example.com"
//                   required
//                 />
//               </label>
//             </div>

//             <div className="qb-form-group">
//               <label className="qb-form-label">
//                 <i className="fas fa-phone"></i>
//                 Phone Number
//                 <input
//                   type="tel"
//                   className="qb-form-input"
//                   value={userInfo.phone}
//                   onChange={handleUserInfoChange("phone")}
//                   placeholder="+44 20 1234 5678"
//                   required
//                 />
//               </label>
//             </div>
//           </div>
//         </div>

//         {/* Address Section */}
//         <div className="qb-card">
//           <div className="qb-card-header">
//             <div className="qb-section-icon">
//               <i className="fas fa-map-marker-alt"></i>
//             </div>
//             <div>
//               <h2 className="qb-section-title">Delivery Address</h2>
//               <p className="qb-section-subtitle">Where should we pick up and deliver your laundry?</p>
//             </div>
//           </div>

//           {userToken && addresses.length > 0 && !showAddressForm ? (
//             <>
//               <div className="qb-address-selection">
//                 <h3 className="qb-address-selection-title">Select a Saved Address</h3>
//                 <div className="qb-address-grid">
//                   {addresses.map((addr) => (
//                     <div
//                       key={addr.address_id}
//                       className={`qb-address-option ${
//                         selectedAddressId === String(addr.address_id) ? "selected" : ""
//                       }`}
//                       onClick={() => {
//                         setSelectedAddressId(String(addr.address_id));
//                         if (useSameAddress) setSelectedPickupAddressId(String(addr.address_id));
//                       }}
//                     >
//                       <div className="qb-address-option-header">
//                         <div className="qb-address-type">
//                           <i className="fas fa-home"></i>
//                           <span>{addr.name || "Home"}</span>
//                         </div>
//                         {addr.is_selected && (
//                           <span className="qb-default-badge">
//                             <i className="fas fa-star"></i>
//                             Default
//                           </span>
//                         )}
//                       </div>
//                       <div className="qb-address-option-details">
//                         <p className="qb-address-text">{addr.full_address}</p>
//                         <p className="qb-address-postcode">
//                           <i className="fas fa-map-pin"></i>
//                           {addr.postcode}
//                         </p>
//                       </div>
//                       {selectedAddressId === String(addr.address_id) && (
//                         <div className="qb-address-selected">
//                           <i className="fas fa-check-circle"></i>
//                         </div>
//                       )}
//                     </div>
//                   ))}

//                   <div 
//                     className="qb-add-address-option"
//                     onClick={handleAddAddressClick}
//                   >
//                     <div className="qb-add-address-icon">
//                       <i className="fas fa-plus-circle"></i>
//                     </div>
//                     <div className="qb-add-address-text">
//                       <h4>Add New Address</h4>
//                       <p>Enter a different delivery address</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="qb-address-toggle">
//                 <label className="qb-toggle-container">
//                   <div className="qb-toggle-switch">
//                     <input
//                       type="checkbox"
//                       checked={useSameAddress}
//                       onChange={handleToggleSameAddress}
//                     />
//                     <span className="qb-toggle-slider"></span>
//                   </div>
//                   <div className="qb-toggle-label">
//                     <span className="qb-toggle-title">Use same address for pickup</span>
//                     <span className="qb-toggle-description">Pickup and delivery at the same location</span>
//                   </div>
//                 </label>
//               </div>
//             </>
//           ) : (
//             <div className="qb-address-form-section">
//               <div className="qb-form-grid">
//                 <div className="qb-form-group">
//                   <label className="qb-form-label">
//                     <i className="fas fa-home"></i>
//                     House/Flat Number
//                     <input
//                       type="text"
//                       className="qb-form-input"
//                       value={addressForm.house_number}
//                       onChange={handleAddressFormChange("house_number")}
//                       placeholder="123"
//                     />
//                   </label>
//                 </div>

//                 <div className="qb-form-group full-width">
//                   <label className="qb-form-label">
//                     <i className="fas fa-road"></i>
//                     Street Address *
//                     <input
//                       type="text"
//                       className="qb-form-input"
//                       value={addressForm.street_address}
//                       onChange={handleAddressFormChange("street_address")}
//                       placeholder="Main Street, Apt 4B"
//                       required
//                     />
//                   </label>
//                 </div>

//                 <div className="qb-form-group">
//                   <label className="qb-form-label">
//                     <i className="fas fa-map-pin"></i>
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
//                     <i className="fas fa-city"></i>
//                     City/Town
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
//                     <i className="fas fa-info-circle"></i>
//                     Additional Details (Optional)
//                     <textarea
//                       className="qb-form-textarea"
//                       value={addressForm.additional_details}
//                       onChange={handleAddressFormChange("additional_details")}
//                       placeholder="Floor, building, landmarks, access instructions..."
//                       rows="2"
//                     />
//                   </label>
//                 </div>
//               </div>

//               {userToken && addresses.length > 0 && showAddressForm && (
//                 <button
//                   className="qb-secondary-btn"
//                   onClick={() => setShowAddressForm(false)}
//                 >
//                   <i className="fas fa-arrow-left"></i>
//                   Back to Saved Addresses
//                 </button>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Pickup & Delivery Schedule */}
//         <div className="qb-card">
//           <div className="qb-card-header">
//             <div className="qb-section-icon">
//               <i className="fas fa-calendar-alt"></i>
//             </div>
//             <div>
//               <h2 className="qb-section-title">Schedule Pickup & Delivery</h2>
//               <p className="qb-section-subtitle">Choose convenient times for collection and return</p>
//             </div>
//           </div>

//           <div className="qb-schedule-container">
//             {/* Pickup Section */}
//             <div className="qb-schedule-section">
//               <div className="qb-schedule-header">
//                 <div className="qb-schedule-icon pickup">
//                   <i className="fas fa-truck-loading"></i>
//                 </div>
//                 <div>
//                   <h3 className="qb-schedule-title">Pickup</h3>
//                   <p className="qb-schedule-subtitle">When should we collect your laundry?</p>
//                 </div>
//               </div>

//               <div className="qb-date-section">
//                 <label className="qb-date-label">
//                   <i className="fas fa-calendar-day"></i>
//                   Pickup Date
//                 </label>
//                 <div className="qb-date-input-container">
//                   <input
//                     type="date"
//                     className="qb-date-input"
//                     value={collectDate}
//                     onChange={handleCollectDateChange}
//                     min={today}
//                   />
//                   <i className="fas fa-calendar-alt qb-date-icon"></i>
//                 </div>
//                 {collectDate && (
//                   <p className="qb-date-display">
//                     <i className="fas fa-check-circle"></i>
//                     Selected: {formatDateDDMMYYYY(collectDate)}
//                   </p>
//                 )}
//               </div>

//               {collectDate && (
//                 <div className="qb-time-slots-section">
//                   <label className="qb-time-label">
//                     <i className="fas fa-clock"></i>
//                     Available Pickup Times
//                   </label>
                  
//                   {loadingSlots.collect ? (
//                     <div className="qb-loading-state">
//                       <div className="qb-loading-spinner"></div>
//                       <p>Loading available slots...</p>
//                     </div>
//                   ) : collectSlots.length === 0 ? (
//                     <div className="qb-empty-state">
//                       <i className="fas fa-calendar-times"></i>
//                       <p>No slots available for this date</p>
//                     </div>
//                   ) : (
//                     <div className="qb-time-slots-grid">
//                       {collectSlots.map((slot, index) => (
//                         <button
//                           key={`collect-${slot.start}-${index}`}
//                           type="button"
//                           className={`qb-time-slot ${
//                             selectedCollectSlot?.start === slot.start ? "selected" : ""
//                           } ${!slot.enabled ? "disabled" : ""}`}
//                           onClick={() => handleCollectSlotSelect(slot)}
//                           disabled={!slot.enabled}
//                         >
//                           <span className="qb-slot-time">{formatTimeRange24Hour(slot.start, slot.end)}</span>
//                           {selectedCollectSlot?.start === slot.start && (
//                             <i className="fas fa-check qb-slot-check"></i>
//                           )}
//                         </button>
//                       ))}
//                     </div>
//                   )}

//                   {selectedCollectSlot && (
//                     <div className="qb-selected-slot-info">
//                       <div className="qb-selected-slot-header">
//                         <i className="fas fa-check-circle"></i>
//                         <span>Pickup Scheduled</span>
//                       </div>
//                       <div className="qb-selected-slot-details">
//                         {formatDateDDMMYYYY(collectDate)} at {formatTimeRange24Hour(selectedCollectSlot.start, selectedCollectSlot.end)}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* Delivery Section */}
//             <div className="qb-schedule-section">
//               <div className="qb-schedule-header">
//                 <div className="qb-schedule-icon delivery">
//                   <i className="fas fa-truck"></i>
//                 </div>
//                 <div>
//                   <h3 className="qb-schedule-title">Delivery</h3>
//                   <p className="qb-section-subtitle">When should we return your laundry?</p>
//                 </div>
//               </div>

//               <div className="qb-date-section">
//                 <label className="qb-date-label">
//                   <i className="fas fa-calendar-day"></i>
//                   Delivery Date
//                 </label>
//                 <div className="qb-date-input-container">
//                   <input
//                     type="date"
//                     className="qb-date-input"
//                     value={deliverDate}
//                     onChange={handleDeliverDateChange}
//                     min={minDeliveryDate}
//                     disabled={!collectDate}
//                   />
//                   <i className="fas fa-calendar-alt qb-date-icon"></i>
//                 </div>
//                 {!collectDate && (
//                   <p className="qb-date-hint">
//                     <i className="fas fa-info-circle"></i>
//                     Select pickup date first
//                   </p>
//                 )}
//                 {deliverDate && (
//                   <p className="qb-date-display">
//                     <i className="fas fa-check-circle"></i>
//                     Selected: {formatDateDDMMYYYY(deliverDate)}
//                   </p>
//                 )}
//               </div>

//               {deliverDate && (
//                 <div className="qb-time-slots-section">
//                   <label className="qb-time-label">
//                     <i className="fas fa-clock"></i>
//                     Available Delivery Times
//                   </label>
                  
//                   {loadingSlots.deliver ? (
//                     <div className="qb-loading-state">
//                       <div className="qb-loading-spinner"></div>
//                       <p>Loading available slots...</p>
//                     </div>
//                   ) : deliverSlots.length === 0 ? (
//                     <div className="qb-empty-state">
//                       <i className="fas fa-calendar-times"></i>
//                       <p>No slots available for this date</p>
//                     </div>
//                   ) : (
//                     <div className="qb-time-slots-grid">
//                       {deliverSlots.map((slot, index) => (
//                         <button
//                           key={`deliver-${slot.start}-${index}`}
//                           type="button"
//                           className={`qb-time-slot ${
//                             selectedDeliverSlot?.start === slot.start ? "selected" : ""
//                           } ${!slot.enabled ? "disabled" : ""}`}
//                           onClick={() => handleDeliverSlotSelect(slot)}
//                           disabled={!slot.enabled}
//                         >
//                           <span className="qb-slot-time">{formatTimeRange24Hour(slot.start, slot.end)}</span>
//                           {selectedDeliverSlot?.start === slot.start && (
//                             <i className="fas fa-check qb-slot-check"></i>
//                           )}
//                         </button>
//                       ))}
//                     </div>
//                   )}

//                   {selectedDeliverSlot && (
//                     <div className="qb-selected-slot-info">
//                       <div className="qb-selected-slot-header">
//                         <i className="fas fa-check-circle"></i>
//                         <span>Delivery Scheduled</span>
//                       </div>
//                       <div className="qb-selected-slot-details">
//                         {formatDateDDMMYYYY(deliverDate)} at {formatTimeRange24Hour(selectedDeliverSlot.start, selectedDeliverSlot.end)}
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
//             <div className="qb-section-icon">
//               <i className="fas fa-sticky-note"></i>
//             </div>
//             <div>
//               <h2 className="qb-section-title">Special Instructions</h2>
//               <p className="qb-section-subtitle">Any specific requirements for our team?</p>
//             </div>
//           </div>

//           <div className="qb-notes-container">
//             <textarea
//               className="qb-notes-input"
//               placeholder="Example: Please ring bell twice, fragile items, specific handling instructions..."
//               value={notes}
//               onChange={(e) => setNotes(e.target.value)}
//               maxLength={500}
//               rows={3}
//             />
//             <div className="qb-notes-footer">
//               <div className="qb-notes-hint">
//                 <i className="fas fa-lightbulb"></i>
//                 Optional but helpful for better service
//               </div>
//               {notes.length > 0 && (
//                 <div className="qb-notes-counter">
//                   {notes.length}/500 characters
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Payment Section */}
//         {!showPaymentSetup && (
//           <div className="qb-card">
//             <div className="qb-card-header">
//               <div className="qb-section-icon">
//                 <i className="fas fa-credit-card"></i>
//               </div>
//               <div>
//                 <h2 className="qb-section-title">Payment Method</h2>
//                 <p className="qb-section-subtitle">Choose how you'd like to pay</p>
//               </div>
//               <div className="qb-security-badge">
//                 <i className="fas fa-shield-alt"></i>
//                 <span>Secure Payment</span>
//               </div>
//             </div>

//             {userToken && loadingCards ? (
//               <div className="qb-loading-cards">
//                 <div className="qb-loading-spinner"></div>
//                 <p>Loading your saved cards...</p>
//               </div>
//             ) : userToken && savedCards.length > 0 ? (
//               <>
//                 <div className="qb-saved-cards-section">
//                   <h3 className="qb-saved-cards-title">
//                     <i className="fas fa-credit-card"></i>
//                     Your Saved Cards
//                   </h3>
//                   <p className="qb-saved-cards-subtitle">Select a card or add a new one</p>
                  
//                   <div className="qb-cards-list">
//                     {savedCards.map((card) => (
//                       <div
//                         key={card.id}
//                         className={`qb-card-option ${
//                           selectedCard === card.id ? "selected" : ""
//                         }`}
//                         onClick={() => setSelectedCard(card.id)}
//                       >
//                         <div className="qb-card-option-icon">
//                           <i className={`${getCardBrandIcon(card.brand)} ${getCardBrandClass(card.brand)}`}></i>
//                         </div>
//                         <div className="qb-card-option-details">
//                           <div className="qb-card-brand">{card.brand?.toUpperCase() || 'CARD'}</div>
//                           <div className="qb-card-number">•••• {card.last4}</div>
//                           {card.is_default && (
//                             <div className="qb-card-default">
//                               <i className="fas fa-check-circle"></i>
//                               Default Card
//                             </div>
//                           )}
//                         </div>
//                         {selectedCard === card.id && (
//                           <div className="qb-card-selected">
//                             <i className="fas fa-check-circle"></i>
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>

//                   <div className="qb-add-card-option" onClick={handleUseAnotherCard}>
//                     <div className="qb-add-card-icon">
//                       <i className="fas fa-plus-circle"></i>
//                     </div>
//                     <div className="qb-add-card-text">
//                       <h4>Use New Card</h4>
//                       <p>Save a different card for future payments</p>
//                     </div>
//                     <div className="qb-add-card-arrow">
//                       <i className="fas fa-chevron-right"></i>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="qb-payment-actions">
//                   <button 
//                     className="qb-primary-btn qb-book-btn" 
//                     onClick={handleSavedCardBooking}
//                     disabled={!isBookingValid() || !selectedCard || loading}
//                   >
//                     {loading ? (
//                       <>
//                         <div className="qb-btn-spinner"></div>
//                         Processing...
//                       </>
//                     ) : (
//                       <>
//                         <i className="fas fa-check-circle"></i>
//                         Book with Selected Card
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </>
//             ) : (
//               <>
//                 <div className="qb-payment-options">
//                   <div className="qb-payment-option">
//                     <div className="qb-payment-icon">
//                       <i className="fas fa-credit-card"></i>
//                     </div>
//                     <div className="qb-payment-content">
//                       <h3 className="qb-payment-title">Save Card for Faster Checkout</h3>
//                       <p className="qb-payment-description">
//                         Securely save your card with Stripe. No charges until your laundry manager sends the invoice.
//                       </p>
//                     </div>
//                     <div className="qb-payment-toggle">
//                       <label className="qb-switch">
//                         <input
//                           type="checkbox"
//                           checked={saveCardOption}
//                           onChange={(e) => setSaveCardOption(e.target.checked)}
//                         />
//                         <span className="qb-switch-slider"></span>
//                       </label>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="qb-payment-info">
//                   <div className="qb-payment-info-icon">
//                     <i className="fas fa-info-circle"></i>
//                   </div>
//                   <div className="qb-payment-info-text">
//                     {saveCardOption 
//                       ? "Your card details are encrypted and stored securely by Stripe. Booking will be confirmed after card setup."
//                       : "You'll receive an invoice after service completion. No card required for booking."}
//                   </div>
//                 </div>

//                 <div className="qb-payment-actions">
//                   <button 
//                     className="qb-primary-btn qb-book-btn" 
//                     onClick={handleConfirmBooking}
//                     disabled={!isBookingValid() || loading || setupProcessing}
//                   >
//                     {loading || setupProcessing ? (
//                       <>
//                         <div className="qb-btn-spinner"></div>
//                         Processing...
//                       </>
//                     ) : saveCardOption ? (
//                       <>
//                         <i className="fas fa-lock"></i>
//                         Book Now & Save Card
//                       </>
//                     ) : (
//                       <>
//                         <i className="fas fa-calendar-check"></i>
//                         Book Now (Pay Later)
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </>
//             )}

//             <div className="qb-cancel-section">
//               <button
//                 className="qb-secondary-btn"
//                 onClick={() => navigate("/")}
//                 disabled={loading || setupProcessing}
//               >
//                 <i className="fas fa-times"></i>
//                 Cancel Booking
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Summary Section (Fixed at bottom on mobile) */}
//         <div className="qb-summary-section">
//           <div className="qb-summary-content">
//             <div className="qb-summary-info">
//               <div className="qb-summary-item">
//                 <i className="fas fa-calendar"></i>
//                 <span>Pickup: {selectedCollectSlot ? formatDateDDMMYYYY(collectDate) : "Not selected"}</span>
//               </div>
//               <div className="qb-summary-item">
//                 <i className="fas fa-truck"></i>
//                 <span>Delivery: {selectedDeliverSlot ? formatDateDDMMYYYY(deliverDate) : "Not selected"}</span>
//               </div>
//             </div>
//             <div className="qb-summary-action">
//               <button 
//                 className="qb-primary-btn qb-confirm-btn"
//                 onClick={userToken && savedCards.length > 0 ? handleSavedCardBooking : handleConfirmBooking}
//                 disabled={!isBookingValid() || loading || setupProcessing}
//               >
//                 {loading ? (
//                   <>
//                     <div className="qb-btn-spinner"></div>
//                     Processing...
//                   </>
//                 ) : (
//                   <>
//                     <i className="fas fa-check-circle"></i>
//                     Confirm Booking
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Stripe Payment Modal */}
//       {showPaymentSetup && (
//         <Elements
//           stripe={stripePromise}
//           options={{
//             clientSecret: setupClientSecret,
//             appearance: { theme: "stripe" },
//           }}
//         >
//           <StripeSetupForm
//             onSetupSuccess={handleSetupSuccess}
//             onSetupError={handleSetupError}
//             onCancel={handlePaymentModalCancel}
//             setupProcessing={setupProcessing}
//             userToken={userToken}
//           />
//         </Elements>
//       )}

//       {/* Toast Notification */}
//       {toast && (
//         <div className={`qb-toast qb-toast-${toast.type}`}>
//           <div className="qb-toast-icon">
//             {toast.type === 'success' ? (
//               <i className="fas fa-check-circle"></i>
//             ) : toast.type === 'error' ? (
//               <i className="fas fa-exclamation-circle"></i>
//             ) : (
//               <i className="fas fa-info-circle"></i>
//             )}
//           </div>
//           <div className="qb-toast-message">{toast.msg}</div>
//           <button className="qb-toast-close" onClick={() => setToast(null)}>
//             <i className="fas fa-times"></i>
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// src/components/Checkout.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./QuickBooking.css";  // uses QuickBooking styles
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

    // Prevent double submission
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const result = await stripe.confirmSetup({
        elements,
        redirect: "if_required",
      });

      if (result.error) {
        // Show Stripe's error message
        throw new Error(result.error.message);
      }

      const setupIntent = result.setupIntent;

      if (!setupIntent || !setupIntent.payment_method) {
        throw new Error("Payment method not saved");
      }

      await onSetupSuccess(setupIntent);
    } catch (err) {
      console.error("Stripe confirmSetup error:", err);
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

  // Get items from previous page – safely default to empty array
  const { items = [], subtotal: propSubtotal, tip: propTip, total: propTotal } = location.state || {
    items: [],
    subtotal: 0,
    tip: 0,
    total: 0,
  };

  // Compute totals from items if they weren't passed
  const computedSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const subtotal = propSubtotal !== undefined ? propSubtotal : computedSubtotal;
  const tip = propTip !== undefined ? propTip : 0;
  const total = propTotal !== undefined ? propTotal : subtotal + tip;

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
  const [showAddressForm, setShowAddressForm] = useState(false); // for delivery new address
  const [showPickupAddressForm, setShowPickupAddressForm] = useState(false); // for pickup new address
  const [pendingBookingData, setPendingBookingData] = useState(null);
  const phoneCheckTimeoutRef = useRef(null);

  // Geo data for addresses
  const [geoData, setGeoData] = useState({
    latitude: null,
    longitude: null,
    street_name: "",
    house_number: ""
  });

  const [deliveryGeoData, setDeliveryGeoData] = useState({
    latitude: null,
    longitude: null,
    street_name: "",
    house_number: ""
  });

  const [pickupGeoData, setPickupGeoData] = useState({
    latitude: null,
    longitude: null,
    street_name: "",
    house_number: ""
  });

  // Payment option
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
  const [countryCode, setCountryCode] = useState("+44");

  const countryCodes = [
    { code: "+44", label: "UK" },
    { code: "+91", label: "IN" },
    { code: "+1", label: "US" },
    { code: "+61", label: "AU" },
    { code: "+971", label: "UAE" },
  ];

  const [addresses, setAddresses] = useState([]); // saved delivery addresses
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useSameAddress, setUseSameAddress] = useState(true); // true = pickup same as delivery
  const [selectedPickupAddressId, setSelectedPickupAddressId] = useState(null);
  const [pickupAddresses, setPickupAddresses] = useState([]); // saved pickup addresses
  const [bookingInProgress, setBookingInProgress] = useState(false);

  // Manual address forms (for guests or new addresses)
  // Pickup address (main)
  const [pickupPostcode, setPickupPostcode] = useState("");
  const [pickupPostcodeAddresses, setPickupPostcodeAddresses] = useState([]);
  const [selectedPickupPostcodeAddress, setSelectedPickupPostcodeAddress] = useState("");
  const [pickupAddressDetails, setPickupAddressDetails] = useState("");
  const [pickupAddressForm, setPickupAddressForm] = useState({
    street_address: "",
    postcode: "",
    city: "",
    house_number: "",
    additional_details: ""
  });

  // Delivery address (when useSameAddress = false)
  const [deliveryPostcode, setDeliveryPostcode] = useState("");
  const [deliveryPostcodeAddresses, setDeliveryPostcodeAddresses] = useState([]);
  const [selectedDeliveryPostcodeAddress, setSelectedDeliveryPostcodeAddress] = useState("");
  const [deliveryAddressDetails, setDeliveryAddressDetails] = useState("");
  const [deliveryAddressForm, setDeliveryAddressForm] = useState({
    street_address: "",
    postcode: "",
    city: "",
    house_number: "",
    additional_details: ""
  });

  // Flags to control saving new addresses
  const [savePickupAddress, setSavePickupAddress] = useState(false);
  const [saveDeliveryAddress, setSaveDeliveryAddress] = useState(false);

  // Additional order fields (defaults)
  const [isStudent, setIsStudent] = useState(false);
  const [studentIdImage, setStudentIdImage] = useState(null);
  const [changeManagerRequested, setChangeManagerRequested] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [topupAmount, setTopupAmount] = useState(0);

  // Form state
  const [collectDate, setCollectDate] = useState("");
  const [deliverDate, setDeliverDate] = useState("");
  const [notes, setNotes] = useState("");

  const [googleReady, setGoogleReady] = useState(false);

  // Constants
  const today = new Date().toISOString().split("T")[0];

  // Show toast notification
  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Helper functions
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

  // Data fetching functions
  const fetchUserProfile = useCallback(async () => {
    if (!userToken) return;
    try {
      const response = await fetch(`${API_BASE}/profile`, {
        headers: { "Authorization": `Bearer ${userToken}` },
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
        headers: { "Authorization": `Bearer ${userToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
        setPickupAddresses(data);
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
        headers: { "Authorization": `Bearer ${userToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSavedCards(data.cards || []);
        if (data.cards?.length > 0) {
          const defaultCard = data.cards.find(card => card.is_default);
          if (defaultCard) {
            setSelectedCard(defaultCard.payment_method_id);
          } else if (data.cards.length > 0) {
            setSelectedCard(data.cards[0].payment_method_id);
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
    if (!userToken) return null;
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
        return data.customerId;
      }
    } catch (error) {
      console.error("Error creating Stripe customer:", error);
    }
    return null;
  }, [userToken]);

  const checkPhoneNumberExists = useCallback(async (phone) => {
    if (!phone || phone.trim().length < 5) return;

    try {
      const response = await fetch(`${API_BASE}/auth/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: `${countryCode}${phone.trim()}`,
          name: userInfo.name || "User",
          email: userInfo.email || null
        }),
      });

      if (!response.ok) return;

      const data = await response.json();

      if (data.success && data.user) {
        setUserInfo(prev => ({
          ...prev,
          name: data.user.name || prev.name,
          email: data.user.email || prev.email,
          phone: data.user.phone || prev.phone,
        }));

        if (data.token) {
          localStorage.setItem("jwtToken", data.token);
          setUserToken(data.token);
          login({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone,
          });
          fetchUserProfile();
          fetchAddresses();
          fetchSavedCards();
          ensureStripeCustomer();
        }

        showToast(
          data.isNewUser ? "Account created successfully!" : "Welcome back!",
          "success"
        );
      }
    } catch (error) {
      console.error("Auth access error:", error);
    }
  }, [
    countryCode,
    userInfo.name,
    userInfo.email,
    login,
    fetchUserProfile,
    fetchAddresses,
    fetchSavedCards,
    ensureStripeCustomer,
    showToast
  ]);

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

  // Save a new address (delivery or pickup)
  const saveNewAddress = useCallback(async (addressData, type = "pickup") => {
    if (!userToken) {
      showToast("Please log in to save address", "error");
      return null;
    }

    try {
      const normalize = (value) => value?.replace(/\s/g, "").toLowerCase();
      const existing = addresses.find(addr =>
        normalize(addr.postcode) === normalize(addressData.postcode)
      );
      if (existing) {
        return existing.address_id;
      }

      const payload = {
        address_type: type,
        full_address: addressData.street_address,
        additional_details: addressData.additional_details || "",
        pincode: addressData.postcode,
        postcode: addressData.postcode,
        latitude: addressData.latitude,
        longitude: addressData.longitude,
        house_number: addressData.house_number || "",
        street_name: addressData.street_name || "",
        city: addressData.city || "",
        name: type === "pickup" ? "Pickup Location" : "Delivery Address",
        is_selected: false,
      };

      const response = await fetch(`${API_BASE}/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save address");
      }

      const data = await response.json();
      showToast(
        `${type === "pickup" ? "Pickup" : "Delivery"} address saved`,
        "success"
      );

      await fetchAddresses();
      return data.address_id;
    } catch (error) {
      console.error("Error saving address:", error);
      showToast(error.message || "Failed to save address", "error");
      return null;
    }
  }, [userToken, addresses, showToast, fetchAddresses]);

  // Handle saving the main pickup address manually
  const handleSaveAddress = async () => {
    try {
      const token = userToken || localStorage.getItem("jwtToken");
      if (!token) {
        showToast("Please login to save address", "error");
        return;
      }

      if (!pickupAddressForm.street_address || !pickupPostcode) {
        showToast("Please enter a valid address", "error");
        return;
      }

      // Prevent duplicates
      const normalize = (v) => v?.replace(/\s/g, "").toLowerCase();
      const existing = pickupAddresses.find(
        (addr) => normalize(addr.postcode) === normalize(pickupPostcode)
      );

      if (existing) {
        showToast("Address already saved", "info");
        setSelectedPickupAddressId(String(existing.address_id));
        setShowPickupAddressForm(false);
        return;
      }

      const response = await fetch(`${API_BASE}/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address_type: "pickup",
          full_address: pickupAddressForm.street_address,
          additional_details: pickupAddressDetails || "",
          pincode: pickupPostcode || "",
          latitude: pickupGeoData.latitude,
          longitude: pickupGeoData.longitude,
          house_number: pickupGeoData.house_number || "",
          street_name: pickupGeoData.street_name || "",
          postcode: pickupPostcode || "",
          city: pickupAddressForm.city || "",
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to save address");
      }

      const data = await response.json();
      showToast("Address saved successfully", "success");
      await fetchAddresses();
      setSelectedPickupAddressId(String(data.address_id));
      setShowPickupAddressForm(false);
    } catch (error) {
      console.error(error);
      showToast(error.message || "Failed to save address", "error");
    }
  };

  // Handle saving the delivery address manually
  const handleSaveDeliveryAddress = async () => {
    if (!userToken) {
      showToast("Please login to save address", "error");
      return;
    }
    if (!deliveryAddressForm.street_address || !deliveryPostcode) {
      showToast("Please enter a valid address", "error");
      return;
    }
    const newId = await saveNewAddress({
      street_address: deliveryAddressForm.street_address,
      postcode: deliveryPostcode,
      city: deliveryAddressForm.city,
      house_number: deliveryGeoData.house_number,
      street_name: deliveryGeoData.street_name,
      additional_details: deliveryAddressDetails,
      latitude: deliveryGeoData.latitude,
      longitude: deliveryGeoData.longitude,
    }, 'delivery');
    if (newId) {
      setSelectedAddressId(String(newId));
      setShowAddressForm(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      const token = userToken || localStorage.getItem("jwtToken");
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE}/addresses/${addressId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      const contentType = response.headers.get("content-type");
      let responseBody;
      if (contentType && contentType.includes("application/json")) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
        console.error("Server responded with non-JSON:", responseBody);
      }

      if (!response.ok) {
        let errorMessage = responseBody?.message ||
          (typeof responseBody === 'string' ? responseBody : `Server error: ${response.status}`);
        if (errorMessage.includes("linked to existing orders") || errorMessage.includes("foreign key")) {
          errorMessage = "This address cannot be deleted because it has been used in past orders. You can keep it saved for future bookings.";
        }
        throw new Error(errorMessage);
      }

      const newAddresses = addresses.filter(addr => String(addr.address_id) !== String(addressId));
      setAddresses(newAddresses);
      setPickupAddresses(newAddresses);

      if (selectedAddressId === String(addressId)) {
        if (newAddresses.length > 0) {
          setSelectedAddressId(String(newAddresses[0].address_id));
          if (useSameAddress) {
            setSelectedPickupAddressId(String(newAddresses[0].address_id));
          }
        } else {
          setSelectedAddressId(null);
          setSelectedPickupAddressId(null);
        }
      }
      if (selectedPickupAddressId === String(addressId)) {
        if (newAddresses.length > 0) {
          setSelectedPickupAddressId(String(newAddresses[0].address_id));
        } else {
          setSelectedPickupAddressId(null);
        }
      }

      showToast("Address deleted successfully", "success");
    } catch (error) {
      console.error("Delete address error:", error);
      showToast(error.message, "warning");
    }
  };

  // Delete card
  const handleDeleteCard = async (paymentMethodId) => {
    if (!window.confirm("Are you sure you want to delete this card?")) return;
    try {
      const token = userToken || localStorage.getItem("jwtToken");
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE}/remove-card`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentMethodId }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete card");
      }

      const updatedCards = savedCards.filter(
        card => card.payment_method_id !== paymentMethodId
      );
      setSavedCards(updatedCards);
      if (selectedCard === paymentMethodId) {
        if (updatedCards.length > 0) {
          setSelectedCard(updatedCards[0].payment_method_id);
        } else {
          setSelectedCard(null);
        }
      }
      showToast("Card removed successfully", "success");
    } catch (error) {
      console.error("Delete card error:", error);
      showToast(error.message || "Failed to delete card", "error");
    }
  };

  // Time slot fetching
  const getPostcodeForTimeSlots = useCallback((type = 'pickup') => {
    if (type === 'pickup') {
      if (useSameAddress) {
        if (userToken && addresses.length > 0 && selectedAddressId) {
          const selectedAddress = addresses.find(addr => String(addr.address_id) === selectedAddressId);
          return selectedAddress?.postcode || null;
        } else {
          return deliveryPostcode || null;
        }
      } else {
        if (userToken && pickupAddresses.length > 0 && selectedPickupAddressId && selectedPickupAddressId !== "new") {
          const selectedPickupAddress = pickupAddresses.find(addr => String(addr.address_id) === selectedPickupAddressId);
          return selectedPickupAddress?.postcode || null;
        } else {
          return pickupPostcode || null;
        }
      }
    } else {
      if (userToken && addresses.length > 0 && selectedAddressId) {
        const selectedAddress = addresses.find(addr => String(addr.address_id) === selectedAddressId);
        return selectedAddress?.postcode || null;
      } else {
        return deliveryPostcode || null;
      }
    }
  }, [
    userToken, addresses, selectedAddressId, deliveryPostcode,
    useSameAddress, pickupAddresses, selectedPickupAddressId, pickupPostcode
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

    const postcode = getPostcodeForTimeSlots(isDelivery ? 'delivery' : 'pickup');
    if (postcode) {
      const cleanPostcode = postcode.replace(/\s/g, '').toUpperCase();
      params.set("postcode", cleanPostcode);
    }

    try {
      const response = await fetch(`${API_BASE}/time-slots?${params.toString()}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
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
    if (!deliverDate || !collectDate || !selectedCollectSlotStart) return;
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

  // Prepare order data (addresses are not yet saved)
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

    let deliveryAddressData = {
      street_address: deliveryAddressForm.street_address,
      postcode: deliveryPostcode,
      city: deliveryAddressForm.city,
      house_number: deliveryGeoData.house_number || "",
      street_name: deliveryGeoData.street_name || "",
      additional_details: deliveryAddressDetails,
      latitude: deliveryGeoData.latitude,
      longitude: deliveryGeoData.longitude,
    };

    let pickupAddressData = {
      street_address: pickupAddressForm.street_address,
      postcode: pickupPostcode,
      city: pickupAddressForm.city,
      house_number: pickupGeoData.house_number || "",
      street_name: pickupGeoData.street_name || "",
      additional_details: pickupAddressDetails,
      latitude: pickupGeoData.latitude,
      longitude: pickupGeoData.longitude,
    };

    if (useSameAddress) {
      pickupAddressData = { ...deliveryAddressData };
    }

    const orderItems = (items || []).map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      price_at_purchase: item.price,
    }));

    return {
      deliveryAddress: deliveryAddressData,
      pickupAddress: pickupAddressData,
      use_same_address: useSameAddress,
      name: userInfo.name,
      email: userInfo.email,
      phone: userInfo.phone.startsWith("+")
        ? userInfo.phone
        : `${countryCode}${userInfo.phone}`,
      collect_slot: pickupSlotText,
      delivery_slot: deliverySlotText,
      notes: notes.trim() || null,
      items: orderItems,
      subtotal: Number(subtotal),
      tip: Number(tip),
      total: Number(total),
      is_student: isStudent,
      student_id_image: studentIdImage,
      change_manager_requested: changeManagerRequested,
      discount_percent: Number(discountPercent),
      discount_amount: Number(discountAmount),
      topup_amount: Number(topupAmount),
    };
  }, [
    selectedCollectSlot,
    selectedDeliverSlot,
    collectDate,
    deliverDate,
    useSameAddress,
    deliveryAddressForm,
    deliveryPostcode,
    deliveryGeoData,
    deliveryAddressDetails,
    pickupAddressForm,
    pickupPostcode,
    pickupGeoData,
    pickupAddressDetails,
    userInfo,
    countryCode,
    notes,
    items,
    subtotal,
    tip,
    total,
    isStudent,
    studentIdImage,
    changeManagerRequested,
    discountPercent,
    discountAmount,
    topupAmount,
  ]);

  const validateAddresses = useCallback(() => {
    const isDeliverySavedSelected = userToken &&
      selectedAddressId &&
      selectedAddressId !== "new" &&
      addresses.some(addr => String(addr.address_id) === selectedAddressId);

    const isPickupSavedSelected = userToken &&
      selectedPickupAddressId &&
      selectedPickupAddressId !== "new" &&
      pickupAddresses.some(addr => String(addr.address_id) === selectedPickupAddressId);

    if (useSameAddress) {
      if (!isDeliverySavedSelected) {
        if (!deliveryGeoData.latitude || !deliveryGeoData.longitude) {
          throw new Error("Please select a valid delivery address from suggestions");
        }
      }
    } else {
      if (!isDeliverySavedSelected) {
        if (!deliveryGeoData.latitude || !deliveryGeoData.longitude) {
          throw new Error("Please select a valid delivery address from suggestions");
        }
      }
      if (!isPickupSavedSelected) {
        if (!pickupGeoData.latitude || !pickupGeoData.longitude) {
          throw new Error("Please select a valid pickup address from suggestions");
        }
      }
    }
  }, [
    useSameAddress,
    userToken,
    selectedAddressId,
    selectedPickupAddressId,
    addresses,
    pickupAddresses,
    deliveryGeoData,
    pickupGeoData
  ]);

  const ensureAddressIds = useCallback(async (orderData) => {
    let deliveryId = selectedAddressId;
    let pickupId = selectedPickupAddressId;

    if (!deliveryId || deliveryId === "new") {
      const newId = await saveNewAddress({
        ...orderData.deliveryAddress,
        street_address: orderData.deliveryAddress.street_address || deliveryAddressForm.street_address,
        postcode: orderData.deliveryAddress.postcode || deliveryPostcode,
        city: orderData.deliveryAddress.city || deliveryAddressForm.city,
        house_number: orderData.deliveryAddress.house_number || deliveryGeoData.house_number,
        street_name: orderData.deliveryAddress.street_name || deliveryGeoData.street_name,
        additional_details: orderData.deliveryAddress.additional_details || deliveryAddressDetails,
        latitude: orderData.deliveryAddress.latitude,
        longitude: orderData.deliveryAddress.longitude,
      }, 'delivery');
      if (!newId) throw new Error("Failed to save delivery address");
      deliveryId = String(newId);
    }

    if (!useSameAddress) {
      if (!pickupId || pickupId === "new") {
        const newId = await saveNewAddress({
          ...orderData.pickupAddress,
          street_address: orderData.pickupAddress.street_address || pickupAddressForm.street_address,
          postcode: orderData.pickupAddress.postcode || pickupPostcode,
          city: orderData.pickupAddress.city || pickupAddressForm.city,
          house_number: orderData.pickupAddress.house_number || pickupGeoData.house_number,
          street_name: orderData.pickupAddress.street_name || pickupGeoData.street_name,
          additional_details: orderData.pickupAddress.additional_details || pickupAddressDetails,
          latitude: orderData.pickupAddress.latitude,
          longitude: orderData.pickupAddress.longitude,
        }, 'pickup');
        if (!newId) throw new Error("Failed to save pickup address");
        pickupId = String(newId);
      }
    } else {
      pickupId = deliveryId;
    }

    return { deliveryId, pickupId };
  }, [
    selectedAddressId, selectedPickupAddressId, useSameAddress,
    saveNewAddress, deliveryAddressForm, deliveryPostcode, deliveryGeoData, deliveryAddressDetails,
    pickupAddressForm, pickupPostcode, pickupGeoData, pickupAddressDetails
  ]);

  const handleConfirmBooking = async () => {
    if (bookingInProgress) return;
    setBookingInProgress(true);
    setLoading(true);

    try {
      validateAddresses();
      const order = prepareOrderData();
      if (!order) throw new Error("Please select pickup and delivery times");
      setPendingBookingData(order);
      const token = userToken || localStorage.getItem("jwtToken");
      if (!token) throw new Error("Authentication required");
      await initiateStripeSetup(token, customerId);
    } catch (error) {
      showToast(error.message || "Booking failed", "error");
    } finally {
      setLoading(false);
      setBookingInProgress(false);
    }
  };

  const handleSavedCardBooking = async () => {
    if (!selectedCard) {
      showToast("Please select a saved card", "error");
      return;
    }

    // Validate delivery address ID
    if (!selectedAddressId) {
      showToast("Please select a delivery address", "error");
      return;
    }

    setLoading(true);

    try {
      validateAddresses();
      const order = prepareOrderData();
      if (!order) throw new Error("Please select pickup and delivery times");

      const { deliveryId, pickupId } = await ensureAddressIds(order);

      const token = userToken || localStorage.getItem("jwtToken");
      if (!token) throw new Error("Authentication required");

      let currentCustomerId = customerId;
      if (!currentCustomerId) {
        currentCustomerId = await ensureStripeCustomer();
        if (!currentCustomerId) throw new Error("Failed to set up payment customer");
      }

      const selectedCardData = savedCards.find(
        card => card.payment_method_id === selectedCard
      );
      if (!selectedCardData) throw new Error("Selected card not found");

      const payload = {
        address_id: deliveryId,
        pickup_address_id: pickupId,
        use_same_address: useSameAddress,
        items: order.items,
        subtotal: order.subtotal,
        tip: order.tip,
        total: order.total,
        collect_slot: order.collect_slot,
        delivery_slot: order.delivery_slot,
        notes: order.notes,
        images: [],
        is_student: order.is_student,
        student_id_image: order.student_id_image,
        change_manager_requested: order.change_manager_requested,
        discount_percent: order.discount_percent,
        discount_amount: order.discount_amount,
        topup_amount: order.topup_amount,
        payment_method_id: selectedCardData.payment_method_id,
        stripe_customer_id: currentCustomerId,
      };

      const response = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Booking failed");
      }

      // ✅ Clear the cart from localStorage after successful order
      localStorage.removeItem('laundryCart');

      showToast("Booking confirmed successfully!", "success");

      navigate("/thankyou", {
        state: {
          orderId: data.orderId,
          paymentStatus: "saved_card",
          paymentMethod: "saved_card",
          pickupDate: formatDateDDMMYYYY(collectDate),
          pickupTime: formatTimeRange24Hour(selectedCollectSlot.start, selectedCollectSlot.end),
          deliveryDate: formatDateDDMMYYYY(deliverDate),
          deliveryTime: formatTimeRange24Hour(selectedDeliverSlot.start, selectedDeliverSlot.end),
        }
      });
    } catch (error) {
      console.error(error);
      showToast(error.message || "Booking failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUseAnotherCard = async () => {
    try {
      validateAddresses();
      const order = prepareOrderData();
      if (!order) throw new Error("Please complete booking details");
      setPendingBookingData(order);
      const token = userToken || localStorage.getItem("jwtToken");
      if (!token) throw new Error("Authentication required");
      await initiateStripeSetup(token, customerId);
    } catch (err) {
      showToast(err.message || "Failed to setup card", "error");
    }
  };

  const initiateStripeSetup = async (token, stripeCustomerId) => {
    setSetupProcessing(true);
    try {
      if (!token) throw new Error("Authentication token missing");

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

  // 🔥 FIXED: Full handleSetupSuccess with order creation
  const handleSetupSuccess = async (setupIntent) => {
    setSetupProcessing(true);
    try {
      const token = userToken || localStorage.getItem("jwtToken");
      if (!token) throw new Error("Authentication required");
      if (!pendingBookingData) throw new Error("Booking data missing");

      // Validate delivery address ID
      if (!selectedAddressId) {
        throw new Error("Delivery address is missing. Please try again.");
      }

      const paymentMethodId =
        setupIntent.payment_method ||
        setupIntent.latest_attempt?.payment_method;
      if (!paymentMethodId) throw new Error("Payment method not returned by Stripe");

      // Set default payment method
      if (customerId) {
        await fetch(`${API_BASE}/stripe/set-default-payment`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ customerId, paymentMethodId }),
        });
      }

      // Ensure addresses are saved and get IDs
      const { deliveryId, pickupId } = await ensureAddressIds(pendingBookingData);

      // Create order
      const payload = {
        address_id: deliveryId,
        pickup_address_id: pickupId,
        use_same_address: useSameAddress,
        items: pendingBookingData.items,
        subtotal: pendingBookingData.subtotal,
        tip: pendingBookingData.tip,
        total: pendingBookingData.total,
        collect_slot: pendingBookingData.collect_slot,
        delivery_slot: pendingBookingData.delivery_slot,
        notes: pendingBookingData.notes,
        images: [],
        is_student: pendingBookingData.is_student,
        student_id_image: pendingBookingData.student_id_image,
        change_manager_requested: pendingBookingData.change_manager_requested,
        discount_percent: pendingBookingData.discount_percent,
        discount_amount: pendingBookingData.discount_amount,
        topup_amount: pendingBookingData.topup_amount,
        payment_method_id: paymentMethodId,
        stripe_customer_id: customerId,
      };

      const response = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create booking");
      }

      setShowPaymentSetup(false);
      setPendingBookingData(null);

      showToast("Booking confirmed successfully!", "success");

      setTimeout(() => {
        navigate("/thankyou", {
          state: {
            orderId: data.orderId,
            paymentStatus: "card_saved",
            paymentMethod: "new_card",
            pickupDate: formatDateDDMMYYYY(collectDate),
            pickupTime: formatTimeRange24Hour(
              selectedCollectSlot?.start,
              selectedCollectSlot?.end
            ),
            deliveryDate: formatDateDDMMYYYY(deliverDate),
            deliveryTime: formatTimeRange24Hour(
              selectedDeliverSlot?.start,
              selectedDeliverSlot?.end
            ),
          },
        });
      }, 1000);
    } catch (error) {
      showToast(error.message || "Failed to complete booking", "error");
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
    setPendingBookingData(null);
    setSetupProcessing(false);
    showToast("Booking not confirmed. Please complete card setup to confirm your booking.", "warning");
  };

  const handlePhoneChange = (e) => {
    const newPhone = e.target.value;
    setUserInfo(prev => ({ ...prev, phone: newPhone }));
    if (phoneCheckTimeoutRef.current) clearTimeout(phoneCheckTimeoutRef.current);
    if (newPhone && newPhone.trim().length >= 5) {
      phoneCheckTimeoutRef.current = setTimeout(() => {
        checkPhoneNumberExists(newPhone);
      }, 1000);
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
    if (checked) {
      setPickupAddressForm({ ...deliveryAddressForm });
      setPickupPostcode(deliveryPostcode);
      setPickupGeoData({ ...deliveryGeoData });
      setPickupAddressDetails(deliveryAddressDetails);
      setSelectedPickupAddressId(selectedAddressId);
    }
  };

  useEffect(() => {
    const checkGoogle = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setGoogleReady(true);
      } else {
        setTimeout(checkGoogle, 300);
      }
    };
    checkGoogle();
  }, []);

  useEffect(() => {
    if (!googleReady) return;
    const clean = pickupPostcode.trim();
    if (clean.length >= 3) {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        {
          input: clean,
          componentRestrictions: { country: "gb" }
        },
        (predictions, status) => {
          if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
            setPickupPostcodeAddresses([]);
            return;
          }
          setPickupPostcodeAddresses(
            predictions.map(p => ({ full: p.description, place_id: p.place_id }))
          );
        }
      );
    } else {
      setPickupPostcodeAddresses([]);
    }
  }, [pickupPostcode, googleReady]);

  useEffect(() => {
    if (!googleReady || !selectedPickupPostcodeAddress) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId: selectedPickupPostcodeAddress }, (results, status) => {
      if (status !== "OK" || !results[0]) return;
      const result = results[0];
      let street = "", house = "", postcode = "", city = "";
      result.address_components.forEach(c => {
        if (c.types.includes("route")) street = c.long_name;
        if (c.types.includes("street_number")) house = c.long_name;
        if (c.types.includes("postal_code")) postcode = c.long_name;
        if (c.types.includes("postal_town")) city = c.long_name;
      });
      setPickupGeoData({
        latitude: result.geometry.location.lat(),
        longitude: result.geometry.location.lng(),
        street_name: street,
        house_number: house
      });
      setPickupAddressForm({
        street_address: result.formatted_address,
        postcode,
        city,
        house_number: house,
        additional_details: pickupAddressDetails
      });
    });
  }, [selectedPickupPostcodeAddress, googleReady, pickupAddressDetails]);

  useEffect(() => {
    if (!googleReady) return;
    const clean = deliveryPostcode.trim();
    if (clean.length >= 3) {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        {
          input: clean,
          componentRestrictions: { country: "gb" }
        },
        (predictions, status) => {
          if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
            setDeliveryPostcodeAddresses([]);
            return;
          }
          setDeliveryPostcodeAddresses(
            predictions.map(p => ({ full: p.description, place_id: p.place_id }))
          );
        }
      );
    } else {
      setDeliveryPostcodeAddresses([]);
    }
  }, [deliveryPostcode, googleReady]);

  useEffect(() => {
    if (!googleReady || !selectedDeliveryPostcodeAddress) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId: selectedDeliveryPostcodeAddress }, (results, status) => {
      if (status !== "OK" || !results[0]) return;
      const result = results[0];
      let street = "", house = "", postcode = "", city = "";
      result.address_components.forEach(c => {
        if (c.types.includes("route")) street = c.long_name;
        if (c.types.includes("street_number")) house = c.long_name;
        if (c.types.includes("postal_code")) postcode = c.long_name;
        if (c.types.includes("postal_town")) city = c.long_name;
      });
      setDeliveryGeoData({
        latitude: result.geometry.location.lat(),
        longitude: result.geometry.location.lng(),
        street_name: street,
        house_number: house
      });
      setDeliveryAddressForm({
        street_address: result.formatted_address,
        postcode,
        city,
        house_number: house,
        additional_details: deliveryAddressDetails
      });
    });
  }, [selectedDeliveryPostcodeAddress, googleReady, deliveryAddressDetails]);

  useEffect(() => {
    if (collectDate) {
      const timer = setTimeout(fetchCollectSlots, 300);
      return () => clearTimeout(timer);
    }
  }, [collectDate, fetchCollectSlots]);

  useEffect(() => {
    if (deliverDate && selectedCollectSlotStart) {
      const timer = setTimeout(fetchDeliverySlots, 300);
      return () => clearTimeout(timer);
    }
  }, [deliverDate, selectedCollectSlotStart, fetchDeliverySlots]);

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

  useEffect(() => {
    return () => {
      if (phoneCheckTimeoutRef.current) clearTimeout(phoneCheckTimeoutRef.current);
    };
  }, []);

  const isBookingValid = () => {
    if (!userInfo.name.trim()) return false;
    if (!userInfo.email.trim()) return false;
    if (!userInfo.phone.trim()) return false;
    if (!selectedCollectSlot || !selectedDeliverSlot) return false;

    if (userToken && pickupAddresses.length > 0 && !showPickupAddressForm) {
      if (useSameAddress) {
        if (!selectedAddressId) return false;
      } else {
        if (!selectedPickupAddressId) return false;
      }
    } else {
      if (!pickupPostcode.trim() || !selectedPickupPostcodeAddress) return false;
      if (!pickupGeoData.latitude || !pickupGeoData.longitude) return false;
    }

    if (!useSameAddress) {
      if (userToken && addresses.length > 0 && !showAddressForm) {
        if (!selectedAddressId) return false;
      } else {
        if (!deliveryPostcode.trim() || !selectedDeliveryPostcodeAddress) return false;
        if (!deliveryGeoData.latitude || !deliveryGeoData.longitude) return false;
      }
    }

    return true;
  };

  return (
    <div className="qb-page">
      <div className="qb-container">
        {/* Title Section */}
        <div className="qb-title-section">
          <button
            className="qb-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1 className="qb-title">
            <i className="fas fa-calendar-check qb-title-icon"></i>
            Checkout
          </h1>
          <p className="qb-subtitle">
            Confirm your items, address, and payment
          </p>
          {userToken && (
            <div className="qb-user-info">
              <i className="fas fa-user-check"></i>
              <span>
                Welcome back, {userInfo.name || user?.email}! Your info is pre-filled.
              </span>
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
                  onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
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
                  onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                  required
                />
              </label>
            </div>

            <div className="qb-phone-group">
              <select
                className="qb-country-code"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              >
                {countryCodes.map(c => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
              <input
                type="tel"
                className="qb-form-input"
                value={userInfo.phone}
                onChange={handlePhoneChange}
                placeholder="Phone Number"
                required
              />
            </div>
          </div>
        </div>

        {/* Pickup Address Card */}
        <div className="qb-card">
          <div className="qb-card-header">
            <div className="qb-section-icon">
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <div>
              <h2 className="qb-section-title">Pickup Address</h2>
              <p className="qb-section-subtitle">Where should we collect your laundry?</p>
            </div>
          </div>

          {userToken && pickupAddresses.length > 0 && !showPickupAddressForm ? (
            <>
              <div className="qb-address-selection">
                <h3 className="qb-address-selection-title">Select a Saved Pickup Address</h3>
                <div className="qb-address-grid">
                  {pickupAddresses.map(addr => (
                    <div
                      key={addr.address_id}
                      className={`qb-address-option ${selectedPickupAddressId === String(addr.address_id) ? "selected" : ""}`}
                    >
                      <div className="qb-address-option-content" onClick={() => {
                        setSelectedPickupAddressId(String(addr.address_id));
                        if (useSameAddress) {
                          setSelectedAddressId(String(addr.address_id));
                        }
                      }}>
                        <div className="qb-address-option-header">
                          <div className="qb-address-type">
                            <i className="fas fa-home"></i>
                            <span>{addr.name || "Home"}</span>
                          </div>
                          {addr.is_selected && (
                            <span className="qb-default-badge">
                              <i className="fas fa-star"></i> Default
                            </span>
                          )}
                        </div>
                        <div className="qb-address-option-details">
                          <p className="qb-address-text">{addr.full_address}</p>
                          <p className="qb-address-postcode">
                            <i className="fas fa-map-pin"></i> {addr.postcode}
                          </p>
                        </div>
                      </div>
                      <button
                        className="qb-address-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAddress(addr.address_id);
                        }}
                        aria-label="Delete address"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}

                  <div className="qb-add-address-option" onClick={() => {
                    setShowPickupAddressForm(true);
                    setSelectedPickupAddressId("new");
                  }}>
                    <div className="qb-add-address-icon">
                      <i className="fas fa-plus-circle"></i>
                    </div>
                    <div className="qb-add-address-text">
                      <h4>Add New Pickup Address</h4>
                      <p>Enter a different pickup address</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="qb-address-toggle">
                <label className="qb-toggle-container">
                  <div className="qb-toggle-switch">
                    <input type="checkbox" checked={useSameAddress} onChange={handleToggleSameAddress} />
                    <span className="qb-toggle-slider"></span>
                  </div>
                  <div className="qb-toggle-label">
                    <span className="qb-toggle-title">Use same address for delivery</span>
                    <span className="qb-toggle-description">Deliver back to pickup location</span>
                  </div>
                </label>
              </div>
            </>
          ) : (
            <div className="qb-address-form-section">
              <div className="qb-form-grid">
                {/* Full Address input – commented out as requested */}
                {/* <div className="qb-form-group full-width">
                  <label className="qb-form-label">
                    <i className="fas fa-road"></i> Full Address *
                    <input
                      type="text"
                      className="qb-form-input"
                      value={pickupAddressForm.street_address}
                      onChange={(e) => {
                        setPickupAddressForm(prev => ({
                          ...prev,
                          street_address: e.target.value
                        }));
                        setPickupGeoData({
                          latitude: null,
                          longitude: null,
                          street_name: "",
                          house_number: ""
                        });
                      }}
                      placeholder="Start typing or select from dropdown"
                      required
                    />
                  </label>
                </div> */}

                <div className="qb-form-group">
                  <label className="qb-form-label">
                    Postcode *
                    <input
                      type="text"
                      className="qb-form-input"
                      value={pickupPostcode}
                      onChange={(e) => setPickupPostcode(e.target.value.toUpperCase())}
                      placeholder="SW1A2AA"
                    />
                  </label>
                </div>

                <div className="qb-form-group">
                  <label className="qb-form-label">
                    Select Address *
                    <select
                      className="qb-form-input"
                      value={selectedPickupPostcodeAddress}
                      onChange={(e) => setSelectedPickupPostcodeAddress(e.target.value)}
                    >
                      <option value="">Select address</option>
                      {pickupPostcodeAddresses.map((addr, idx) => (
                        <option key={idx} value={addr.place_id}>{addr.full}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="qb-form-group">
                  <label className="qb-form-label">
                    Address details
                    <input
                      type="text"
                      className="qb-address-details-input"
                      placeholder="Flat / Door / Floor"
                      value={pickupAddressDetails}
                      onChange={(e) => setPickupAddressDetails(e.target.value)}
                    />
                  </label>
                </div>
              </div>

              {userToken && (
                <>
                  <div className="qb-save-address-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={savePickupAddress}
                        onChange={(e) => setSavePickupAddress(e.target.checked)}
                      />
                      <span>Save this address to my account</span>
                    </label>
                  </div>

                  {savePickupAddress && (
                    <div style={{ marginTop: "12px" }}>
                      <button
                        type="button"
                        className="qb-primary-btn"
                        onClick={handleSaveAddress}
                      >
                        <i className="fas fa-save"></i> Save Address
                      </button>
                    </div>
                  )}
                </>
              )}

              {userToken && pickupAddresses.length > 0 && showPickupAddressForm && (
                <button className="qb-secondary-btn" onClick={() => setShowPickupAddressForm(false)}>
                  <i className="fas fa-arrow-left"></i> Back to Saved Addresses
                </button>
              )}

              {(!userToken || showPickupAddressForm) && (
                <div className="qb-address-toggle" style={{ marginTop: "20px" }}>
                  <label className="qb-toggle-container">
                    <div className="qb-toggle-switch">
                      <input type="checkbox" checked={useSameAddress} onChange={handleToggleSameAddress} />
                      <span className="qb-toggle-slider"></span>
                    </div>
                    <div className="qb-toggle-label">
                      <span className="qb-toggle-title">Use same address for delivery</span>
                      <span className="qb-toggle-description">Deliver back to pickup location</span>
                    </div>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Delivery Address Section (only if different) */}
          {!useSameAddress && (
            <div className="qb-address-section" style={{ marginTop: "24px" }}>
              <h3 className="qb-address-section-title">
                <i className="fas fa-truck"></i> Delivery Address
                <span className="qb-required-badge">Required</span>
              </h3>

              {userToken && addresses.length > 0 && !showAddressForm ? (
                <div className="qb-address-selection">
                  <h4>Select a Saved Delivery Address</h4>
                  <div className="qb-address-grid">
                    {addresses.map(addr => (
                      <div
                        key={addr.address_id}
                        className={`qb-address-option ${selectedAddressId === String(addr.address_id) ? "selected" : ""}`}
                        onClick={() => setSelectedAddressId(String(addr.address_id))}
                      >
                        <p className="qb-address-text">{addr.full_address}</p>
                        <p className="qb-address-postcode">{addr.postcode}</p>
                      </div>
                    ))}
                    <div className="qb-add-address-option" onClick={() => {
                      setShowAddressForm(true);
                      setSelectedAddressId("new");
                    }}>
                      <div className="qb-add-address-icon"><i className="fas fa-plus-circle"></i></div>
                      <div className="qb-add-address-text">
                        <h4>New Delivery Address</h4>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="qb-form-grid">
                  {/* Full Address input for delivery – commented out */}
                  {/* <div className="qb-form-group full-width">
                    <label className="qb-form-label">
                      <i className="fas fa-road"></i> Full Address *
                      <input
                        type="text"
                        className="qb-form-input"
                        value={deliveryAddressForm.street_address}
                        onChange={(e) => {
                          setDeliveryAddressForm(prev => ({
                            ...prev,
                            street_address: e.target.value
                          }));
                          setDeliveryGeoData({
                            latitude: null,
                            longitude: null,
                            street_name: "",
                            house_number: ""
                          });
                        }}
                        placeholder="Start typing or select from dropdown"
                        required
                      />
                    </label>
                  </div> */}

                  <div className="qb-form-group">
                    <label className="qb-form-label">
                      Postcode *
                      <input
                        type="text"
                        className="qb-form-input"
                        value={deliveryPostcode}
                        onChange={(e) => setDeliveryPostcode(e.target.value.toUpperCase())}
                        placeholder="SW1A2AA"
                      />
                    </label>
                  </div>

                  <div className="qb-form-group">
                    <label className="qb-form-label">
                      Select Address *
                      <select
                        className="qb-form-input"
                        value={selectedDeliveryPostcodeAddress}
                        onChange={(e) => setSelectedDeliveryPostcodeAddress(e.target.value)}
                      >
                        <option value="">Select address</option>
                        {deliveryPostcodeAddresses.map((addr, idx) => (
                          <option key={idx} value={addr.place_id}>{addr.full}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="qb-form-group">
                    <label className="qb-form-label">
                      Address details
                      <input
                        type="text"
                        className="qb-address-details-input"
                        placeholder="Flat / Door / Floor"
                        value={deliveryAddressDetails}
                        onChange={(e) => setDeliveryAddressDetails(e.target.value)}
                      />
                    </label>
                  </div>
                </div>
              )}

              {userToken && showAddressForm && (
                <>
                  <div className="qb-save-address-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={saveDeliveryAddress}
                        onChange={(e) => setSaveDeliveryAddress(e.target.checked)}
                      />
                      <span>Save this delivery address to my account</span>
                    </label>
                  </div>

                  {saveDeliveryAddress && (
                    <div style={{ marginTop: "12px" }}>
                      <button
                        type="button"
                        className="qb-primary-btn"
                        onClick={handleSaveDeliveryAddress}
                      >
                        <i className="fas fa-save"></i> Save Address
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Schedule Card */}
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
                  <i className="fas fa-calendar-day"></i> Pickup Date
                </label>
                <div className="qb-date-input-container">
                  <input
                    type="date"
                    className="qb-date-input"
                    value={collectDate}
                    onChange={handleCollectDateChange}
                    min={today}
                  />
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
                    <i className="fas fa-clock"></i> Available Pickup Times
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
                  <i className="fas fa-calendar-day"></i> Delivery Date
                </label>
                <div className="qb-date-input-container">
                  <input
                    type="date"
                    className="qb-date-input"
                    value={deliverDate}
                    onChange={handleDeliverDateChange}
                    min={collectDate || today}
                    disabled={!collectDate}
                  />
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
                    <i className="fas fa-clock"></i> Available Delivery Times
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
                <p className="qb-section-subtitle">Payment is required to confirm your booking</p>
              </div>
              <div className="qb-security-badge">
                <i className="fas fa-shield-alt"></i>
                <span>Secure Payment</span>
              </div>
            </div>

            <div className="qb-payment-notice">
              <div className="qb-notice-icon">
                <i className="fas fa-info-circle"></i>
              </div>
              <div className="qb-notice-content">
                <strong>No payment taken now</strong> – Save your payment method to confirm your booking. You won't be charged now. We'll send an invoice after the pickup and only take payment once you're happy to proceed.
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
                    <i className="fas fa-credit-card"></i> Your Saved Cards
                  </h3>
                  <p className="qb-saved-cards-subtitle">Select a card or add a new one</p>

                  <div className="qb-cards-list">
                    {savedCards.map((card) => (
                      <div
                        key={card.payment_method_id}
                        className={`qb-card-option ${
                          selectedCard === card.payment_method_id ? "selected" : ""
                        }`}
                        onClick={() => setSelectedCard(card.payment_method_id)}
                      >
                        <div className="qb-card-option-icon">
                          <i className={`${getCardBrandIcon(card.brand)} ${getCardBrandClass(card.brand)}`}></i>
                        </div>
                        <div className="qb-card-option-details">
                          <div className="qb-card-brand">{card.brand?.toUpperCase() || 'CARD'}</div>
                          <div className="qb-card-number">•••• {card.last4}</div>
                          {card.is_default && (
                            <div className="qb-card-default">
                              <i className="fas fa-check-circle"></i> Default Card
                            </div>
                          )}
                        </div>
                        {selectedCard === card.payment_method_id && (
                          <div className="qb-card-selected">
                            <i className="fas fa-check-circle"></i>
                          </div>
                        )}
                        <button
                          className="qb-card-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCard(card.payment_method_id);
                          }}
                          aria-label="Delete card"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
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

                <div className="qb-payment-info" style={{ marginTop: '12px' }}>
                  <div className="qb-payment-info-icon">
                    <i className="fas fa-info-circle"></i>
                  </div>
                  <div className="qb-payment-info-text">
                    <strong>No payment taken now:</strong> We'll send an invoice after inspection. You approve payment only after reviewing.
                  </div>
                </div>

                <div className="qb-payment-actions">
                  <button
                    className="qb-primary-btn qb-book-btn"
                    onClick={handleSavedCardBooking}
                    disabled={!isBookingValid() || loading || setupProcessing || bookingInProgress}
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
                        Securely save your card with Stripe. No charges now.
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
                    <strong>Payment Required:</strong> A valid card must be saved to confirm your booking.
                  </div>
                </div>

                <div className="qb-payment-actions">
                  <button
                    className="qb-primary-btn qb-book-btn"
                    onClick={handleConfirmBooking}
                    disabled={!isBookingValid() || loading || setupProcessing || bookingInProgress}
                  >
                    {loading || setupProcessing ? (
                      <>
                        <div className="qb-btn-spinner"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-lock"></i>
                        Book Now & Save Card
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
                disabled={!isBookingValid() || loading || setupProcessing || bookingInProgress}
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