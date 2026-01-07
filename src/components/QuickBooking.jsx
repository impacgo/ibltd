

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
  const [showPickupAddressForm, setShowPickupAddressForm] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState(null);

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
  
  // NEW: Check if phone number exists and auto-fill user info
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

  // NEW: Add pickup address
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

  /* -------------------------- UPDATED TIME SLOT FUNCTIONS ------------------------- */
  // Helper function to get postcode for time slot fetching
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
        street_name: selectedAddress?.full_address || "",
      };
    } else {
      deliveryAddressData = {
        street_address: addressForm.street_address,
        postcode: addressForm.postcode,
        city: addressForm.city || "",
        full_address: addressForm.street_address,
        additional_details: addressForm.additional_details || "",
        house_number: addressForm.house_number || "",
        street_name: addressForm.street_address || "",
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

    return {
      ...deliveryAddressData,
      ...pickupAddressData,
      use_same_address: useSameAddress,
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
    pickupAddresses,
    selectedPickupAddressId,
    useSameAddress,
    addressForm,
    pickupAddressForm,
    showPickupAddressForm,
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

      // NEW: Validate pickup address when useSameAddress is false
      if (!useSameAddress) {
        if (userToken && (!selectedPickupAddressId || selectedPickupAddressId === "new")) {
          // User needs to select or add a pickup address
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

      // 6️⃣ ALWAYS show Stripe setup - payment is required
      showToast("Please complete card setup to confirm your booking", "info");
      await initiateStripeSetup(bookingData.token, bookingData.stripeCustomerId);

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
      // Validate pickup address when useSameAddress is false
      if (!useSameAddress) {
        if (!selectedPickupAddressId) {
          throw new Error("Please select a pickup address");
        }
      }

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
  
  // NEW: Handle phone number change with auto-fill
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

  // NEW: Handle pickup address selection
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

  // NEW: Handle pickup address form changes
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

  /* ------------------------------ Render ---------------------------------- */
  
  // NEW: Render pickup address section
  const renderPickupAddressSection = () => {
    if (useSameAddress) return null;

    return (
      <div className="qb-address-section" style={{ marginTop: '24px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <h3 className="qb-address-section-title">
          <i className="fas fa-truck-pickup"></i>
          Pickup Address
          <span className="qb-required-badge">Required</span>
        </h3>
        <p className="qb-address-section-subtitle">
          Where should we collect your laundry from?
        </p>

        {userToken && pickupAddresses.length > 0 && !showPickupAddressForm ? (
          <>
            <div className="qb-address-grid">
              {pickupAddresses.map((addr) => (
                <div
                  key={`pickup-${addr.address_id}`}
                  className={`qb-address-option ${
                    selectedPickupAddressId === String(addr.address_id) ? "selected" : ""
                  }`}
                  onClick={() => handlePickupAddressSelect(String(addr.address_id))}
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
                  {selectedPickupAddressId === String(addr.address_id) && (
                    <div className="qb-address-selected">
                      <i className="fas fa-check-circle"></i>
                    </div>
                  )}
                </div>
              ))}

              <div 
                className="qb-add-address-option"
                onClick={() => handlePickupAddressSelect("new")}
              >
                <div className="qb-add-address-icon">
                  <i className="fas fa-plus-circle"></i>
                </div>
                <div className="qb-add-address-text">
                  <h4>Add New Pickup Address</h4>
                  <p>Enter a different pickup location</p>
                </div>
              </div>
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
                    value={pickupAddressForm.house_number}
                    onChange={handlePickupAddressFormChange("house_number")}
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
                    value={pickupAddressForm.street_address}
                    onChange={handlePickupAddressFormChange("street_address")}
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
                    value={pickupAddressForm.postcode}
                    onChange={handlePickupAddressFormChange("postcode")}
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
                    value={pickupAddressForm.city}
                    onChange={handlePickupAddressFormChange("city")}
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
                className="qb-secondary-btn"
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
                  onChange={handlePhoneChange}
                  placeholder="+44 20 1234 5678"
                  required
                />
                <div className="qb-phone-hint">
                  <i className="fas fa-info-circle"></i>
                  Enter phone number to check for existing account
                </div>
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
              <p className="qb-section-subtitle">Where should we deliver your laundry?</p>
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
                      onClick={() => setSelectedAddressId(String(addr.address_id))}
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

              {/* Same Address Toggle for non-logged in users or when adding new address */}
              {(!userToken || showAddressForm) && (
                <div className="qb-address-toggle" style={{ marginTop: '20px' }}>
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
              )}
            </div>
          )}

          {/* Render separate pickup address section when useSameAddress is false */}
          {renderPickupAddressSection()}
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

        {/* Payment Section - ALWAYS SHOW PAYMENT */}
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

                <div className="qb-payment-info">
                  <div className="qb-payment-info-icon">
                    <i className="fas fa-info-circle"></i>
                  </div>
                  <div className="qb-payment-info-text">
                    Your card will only be charged after your laundry manager sends the invoice. 
                    No charges will be made now.
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
                    <strong>Payment Required:</strong> A valid card must be saved to confirm your booking. 
                    No charges will be made now - your card will only be charged after service completion when the invoice is sent.
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