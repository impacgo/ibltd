
// // src/components/Checkout.jsx
// import React, { useEffect, useState, useCallback, useRef } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import "./QuickBooking.css";  // uses QuickBooking styles
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

//     // Prevent double submission
//     if (submitting) return;
//     setSubmitting(true);
//     setError(null);

//     try {
//       const result = await stripe.confirmSetup({
//         elements,
//         redirect: "if_required",
//       });

//       if (result.error) {
//         // Show Stripe's error message
//         throw new Error(result.error.message);
//       }

//       const setupIntent = result.setupIntent;

//       if (!setupIntent || !setupIntent.payment_method) {
//         throw new Error("Payment method not saved");
//       }

//       await onSetupSuccess(setupIntent);
//     } catch (err) {
//       console.error("Stripe confirmSetup error:", err);
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
// /*                           Main Checkout Component                          */
// /* -------------------------------------------------------------------------- */
// export default function Checkout() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user, login } = useAuth();

//   // Get items from previous page – safely default to empty array
//   const { items = [], subtotal: propSubtotal, tip: propTip, total: propTotal } = location.state || {
//     items: [],
//     subtotal: 0,
//     tip: 0,
//     total: 0,
//   };

//   // Compute totals from items if they weren't passed
//   const computedSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//   const subtotal = propSubtotal !== undefined ? propSubtotal : computedSubtotal;
//   const tip = propTip !== undefined ? propTip : 0;
//   const total = propTotal !== undefined ? propTotal : subtotal + tip;

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
//   const [showAddressForm, setShowAddressForm] = useState(false); // for delivery new address
//   const [showPickupAddressForm, setShowPickupAddressForm] = useState(false); // for pickup new address
//   const [pendingBookingData, setPendingBookingData] = useState(null);
//   const phoneCheckTimeoutRef = useRef(null);

//   // Geo data for addresses
//   const [geoData, setGeoData] = useState({
//     latitude: null,
//     longitude: null,
//     street_name: "",
//     house_number: ""
//   });

//   const [deliveryGeoData, setDeliveryGeoData] = useState({
//     latitude: null,
//     longitude: null,
//     street_name: "",
//     house_number: ""
//   });

//   const [pickupGeoData, setPickupGeoData] = useState({
//     latitude: null,
//     longitude: null,
//     street_name: "",
//     house_number: ""
//   });

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
//   const [countryCode, setCountryCode] = useState("+44");

//   const countryCodes = [
//     { code: "+44", label: "UK" },
//     { code: "+91", label: "IN" },
//     { code: "+1", label: "US" },
//     { code: "+61", label: "AU" },
//     { code: "+971", label: "UAE" },
//   ];

//   const [addresses, setAddresses] = useState([]); // saved delivery addresses
//   const [selectedAddressId, setSelectedAddressId] = useState(null);
//   const [useSameAddress, setUseSameAddress] = useState(true); // true = pickup same as delivery
//   const [selectedPickupAddressId, setSelectedPickupAddressId] = useState(null);
//   const [pickupAddresses, setPickupAddresses] = useState([]); // saved pickup addresses
//   const [bookingInProgress, setBookingInProgress] = useState(false);

//   // Manual address forms (for guests or new addresses)
//   // Pickup address (main)
//   const [pickupPostcode, setPickupPostcode] = useState("");
//   const [pickupPostcodeAddresses, setPickupPostcodeAddresses] = useState([]);
//   const [selectedPickupPostcodeAddress, setSelectedPickupPostcodeAddress] = useState("");
//   const [pickupAddressDetails, setPickupAddressDetails] = useState("");
//   const [pickupAddressForm, setPickupAddressForm] = useState({
//     street_address: "",
//     postcode: "",
//     city: "",
//     house_number: "",
//     additional_details: ""
//   });

//   // Delivery address (when useSameAddress = false)
//   const [deliveryPostcode, setDeliveryPostcode] = useState("");
//   const [deliveryPostcodeAddresses, setDeliveryPostcodeAddresses] = useState([]);
//   const [selectedDeliveryPostcodeAddress, setSelectedDeliveryPostcodeAddress] = useState("");
//   const [deliveryAddressDetails, setDeliveryAddressDetails] = useState("");
//   const [deliveryAddressForm, setDeliveryAddressForm] = useState({
//     street_address: "",
//     postcode: "",
//     city: "",
//     house_number: "",
//     additional_details: ""
//   });

//   // Flags to control saving new addresses
//   const [savePickupAddress, setSavePickupAddress] = useState(false);
//   const [saveDeliveryAddress, setSaveDeliveryAddress] = useState(false);

//   // Additional order fields (defaults)
//   const [isStudent, setIsStudent] = useState(false);
//   const [studentIdImage, setStudentIdImage] = useState(null);
//   const [changeManagerRequested, setChangeManagerRequested] = useState(false);
//   const [discountPercent, setDiscountPercent] = useState(0);
//   const [discountAmount, setDiscountAmount] = useState(0);
//   const [topupAmount, setTopupAmount] = useState(0);

//   // Form state
//   const [collectDate, setCollectDate] = useState("");
//   const [deliverDate, setDeliverDate] = useState("");
//   const [notes, setNotes] = useState("");

//   const [googleReady, setGoogleReady] = useState(false);

//   // Constants
//   const today = new Date().toISOString().split("T")[0];

//   // Show toast notification
//   const showToast = useCallback((msg, type = "info") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3000);
//   }, []);

//   // Helper functions
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

//   // Data fetching functions
//   const fetchUserProfile = useCallback(async () => {
//     if (!userToken) return;
//     try {
//       const response = await fetch(`${API_BASE}/profile`, {
//         headers: { "Authorization": `Bearer ${userToken}` },
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
//         headers: { "Authorization": `Bearer ${userToken}` },
//       });
//       if (response.ok) {
//         const data = await response.json();
//         setAddresses(data);
//         setPickupAddresses(data);
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
//         headers: { "Authorization": `Bearer ${userToken}` },
//       });
//       if (response.ok) {
//         const data = await response.json();
//         setSavedCards(data.cards || []);
//         if (data.cards?.length > 0) {
//           const defaultCard = data.cards.find(card => card.is_default);
//           if (defaultCard) {
//             setSelectedCard(defaultCard.payment_method_id);
//           } else if (data.cards.length > 0) {
//             setSelectedCard(data.cards[0].payment_method_id);
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
//     if (!userToken) return null;
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
//         return data.customerId;
//       }
//     } catch (error) {
//       console.error("Error creating Stripe customer:", error);
//     }
//     return null;
//   }, [userToken]);

//   const checkPhoneNumberExists = useCallback(async (phone) => {
//     if (!phone || phone.trim().length < 5) return;

//     try {
//       const response = await fetch(`${API_BASE}/auth/access`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           phone: `${countryCode}${phone.trim()}`,
//           name: userInfo.name || "User",
//           email: userInfo.email || null
//         }),
//       });

//       if (!response.ok) return;

//       const data = await response.json();

//       if (data.success && data.user) {
//         setUserInfo(prev => ({
//           ...prev,
//           name: data.user.name || prev.name,
//           email: data.user.email || prev.email,
//           phone: data.user.phone || prev.phone,
//         }));

//         if (data.token) {
//           localStorage.setItem("jwtToken", data.token);
//           setUserToken(data.token);
//           login({
//             id: data.user.id,
//             name: data.user.name,
//             email: data.user.email,
//             phone: data.user.phone,
//           });
//           fetchUserProfile();
//           fetchAddresses();
//           fetchSavedCards();
//           ensureStripeCustomer();
//         }

//         showToast(
//           data.isNewUser ? "Account created successfully!" : "Welcome back!",
//           "success"
//         );
//       }
//     } catch (error) {
//       console.error("Auth access error:", error);
//     }
//   }, [
//     countryCode,
//     userInfo.name,
//     userInfo.email,
//     login,
//     fetchUserProfile,
//     fetchAddresses,
//     fetchSavedCards,
//     ensureStripeCustomer,
//     showToast
//   ]);

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

//   // Save a new address (delivery or pickup)
//   const saveNewAddress = useCallback(async (addressData, type = "pickup") => {
//     if (!userToken) {
//       showToast("Please log in to save address", "error");
//       return null;
//     }

//     try {
//       const normalize = (value) => value?.replace(/\s/g, "").toLowerCase();
//       const existing = addresses.find(addr =>
//         normalize(addr.postcode) === normalize(addressData.postcode)
//       );
//       if (existing) {
//         return existing.address_id;
//       }

//       const payload = {
//         address_type: type,
//         full_address: addressData.street_address,
//         additional_details: addressData.additional_details || "",
//         pincode: addressData.postcode,
//         postcode: addressData.postcode,
//         latitude: addressData.latitude,
//         longitude: addressData.longitude,
//         house_number: addressData.house_number || "",
//         street_name: addressData.street_name || "",
//         city: addressData.city || "",
//         name: type === "pickup" ? "Pickup Location" : "Delivery Address",
//         is_selected: false,
//       };

//       const response = await fetch(`${API_BASE}/addresses`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${userToken}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to save address");
//       }

//       const data = await response.json();
//       showToast(
//         `${type === "pickup" ? "Pickup" : "Delivery"} address saved`,
//         "success"
//       );

//       await fetchAddresses();
//       return data.address_id;
//     } catch (error) {
//       console.error("Error saving address:", error);
//       showToast(error.message || "Failed to save address", "error");
//       return null;
//     }
//   }, [userToken, addresses, showToast, fetchAddresses]);

//   // Handle saving the main pickup address manually
//   const handleSaveAddress = async () => {
//     try {
//       const token = userToken || localStorage.getItem("jwtToken");
//       if (!token) {
//         showToast("Please login to save address", "error");
//         return;
//       }

//       if (!pickupAddressForm.street_address || !pickupPostcode) {
//         showToast("Please enter a valid address", "error");
//         return;
//       }

//       // Prevent duplicates
//       const normalize = (v) => v?.replace(/\s/g, "").toLowerCase();
//       const existing = pickupAddresses.find(
//         (addr) => normalize(addr.postcode) === normalize(pickupPostcode)
//       );

//       if (existing) {
//         showToast("Address already saved", "info");
//         setSelectedPickupAddressId(String(existing.address_id));
//         setShowPickupAddressForm(false);
//         return;
//       }

//       const response = await fetch(`${API_BASE}/addresses`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           address_type: "pickup",
//           full_address: pickupAddressForm.street_address,
//           additional_details: pickupAddressDetails || "",
//           pincode: pickupPostcode || "",
//           latitude: pickupGeoData.latitude,
//           longitude: pickupGeoData.longitude,
//           house_number: pickupGeoData.house_number || "",
//           street_name: pickupGeoData.street_name || "",
//           postcode: pickupPostcode || "",
//           city: pickupAddressForm.city || "",
//         }),
//       });

//       if (!response.ok) {
//         const err = await response.json();
//         throw new Error(err.message || "Failed to save address");
//       }

//       const data = await response.json();
//       showToast("Address saved successfully", "success");
//       await fetchAddresses();
//       setSelectedPickupAddressId(String(data.address_id));
//       setShowPickupAddressForm(false);
//     } catch (error) {
//       console.error(error);
//       showToast(error.message || "Failed to save address", "error");
//     }
//   };

//   // Handle saving the delivery address manually
//   const handleSaveDeliveryAddress = async () => {
//     if (!userToken) {
//       showToast("Please login to save address", "error");
//       return;
//     }
//     if (!deliveryAddressForm.street_address || !deliveryPostcode) {
//       showToast("Please enter a valid address", "error");
//       return;
//     }
//     const newId = await saveNewAddress({
//       street_address: deliveryAddressForm.street_address,
//       postcode: deliveryPostcode,
//       city: deliveryAddressForm.city,
//       house_number: deliveryGeoData.house_number,
//       street_name: deliveryGeoData.street_name,
//       additional_details: deliveryAddressDetails,
//       latitude: deliveryGeoData.latitude,
//       longitude: deliveryGeoData.longitude,
//     }, 'delivery');
//     if (newId) {
//       setSelectedAddressId(String(newId));
//       setShowAddressForm(false);
//     }
//   };

//   // Delete address
//   const handleDeleteAddress = async (addressId) => {
//     if (!window.confirm("Are you sure you want to delete this address?")) return;
//     try {
//       const token = userToken || localStorage.getItem("jwtToken");
//       if (!token) throw new Error("Authentication required");

//       const response = await fetch(`${API_BASE}/addresses/${addressId}`, {
//         method: "DELETE",
//         headers: { "Authorization": `Bearer ${token}` },
//       });

//       const contentType = response.headers.get("content-type");
//       let responseBody;
//       if (contentType && contentType.includes("application/json")) {
//         responseBody = await response.json();
//       } else {
//         responseBody = await response.text();
//         console.error("Server responded with non-JSON:", responseBody);
//       }

//       if (!response.ok) {
//         let errorMessage = responseBody?.message ||
//           (typeof responseBody === 'string' ? responseBody : `Server error: ${response.status}`);
//         if (errorMessage.includes("linked to existing orders") || errorMessage.includes("foreign key")) {
//           errorMessage = "This address cannot be deleted because it has been used in past orders. You can keep it saved for future bookings.";
//         }
//         throw new Error(errorMessage);
//       }

//       const newAddresses = addresses.filter(addr => String(addr.address_id) !== String(addressId));
//       setAddresses(newAddresses);
//       setPickupAddresses(newAddresses);

//       if (selectedAddressId === String(addressId)) {
//         if (newAddresses.length > 0) {
//           setSelectedAddressId(String(newAddresses[0].address_id));
//           if (useSameAddress) {
//             setSelectedPickupAddressId(String(newAddresses[0].address_id));
//           }
//         } else {
//           setSelectedAddressId(null);
//           setSelectedPickupAddressId(null);
//         }
//       }
//       if (selectedPickupAddressId === String(addressId)) {
//         if (newAddresses.length > 0) {
//           setSelectedPickupAddressId(String(newAddresses[0].address_id));
//         } else {
//           setSelectedPickupAddressId(null);
//         }
//       }

//       showToast("Address deleted successfully", "success");
//     } catch (error) {
//       console.error("Delete address error:", error);
//       showToast(error.message, "warning");
//     }
//   };

//   // Delete card
//   const handleDeleteCard = async (paymentMethodId) => {
//     if (!window.confirm("Are you sure you want to delete this card?")) return;
//     try {
//       const token = userToken || localStorage.getItem("jwtToken");
//       if (!token) throw new Error("Authentication required");

//       const response = await fetch(`${API_BASE}/remove-card`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ paymentMethodId }),
//       });

//       const data = await response.json();
//       if (!response.ok || !data.success) {
//         throw new Error(data.message || "Failed to delete card");
//       }

//       const updatedCards = savedCards.filter(
//         card => card.payment_method_id !== paymentMethodId
//       );
//       setSavedCards(updatedCards);
//       if (selectedCard === paymentMethodId) {
//         if (updatedCards.length > 0) {
//           setSelectedCard(updatedCards[0].payment_method_id);
//         } else {
//           setSelectedCard(null);
//         }
//       }
//       showToast("Card removed successfully", "success");
//     } catch (error) {
//       console.error("Delete card error:", error);
//       showToast(error.message || "Failed to delete card", "error");
//     }
//   };

//   // Time slot fetching
//   const getPostcodeForTimeSlots = useCallback((type = 'pickup') => {
//     if (type === 'pickup') {
//       if (useSameAddress) {
//         if (userToken && addresses.length > 0 && selectedAddressId) {
//           const selectedAddress = addresses.find(addr => String(addr.address_id) === selectedAddressId);
//           return selectedAddress?.postcode || null;
//         } else {
//           return deliveryPostcode || null;
//         }
//       } else {
//         if (userToken && pickupAddresses.length > 0 && selectedPickupAddressId && selectedPickupAddressId !== "new") {
//           const selectedPickupAddress = pickupAddresses.find(addr => String(addr.address_id) === selectedPickupAddressId);
//           return selectedPickupAddress?.postcode || null;
//         } else {
//           return pickupPostcode || null;
//         }
//       }
//     } else {
//       if (userToken && addresses.length > 0 && selectedAddressId) {
//         const selectedAddress = addresses.find(addr => String(addr.address_id) === selectedAddressId);
//         return selectedAddress?.postcode || null;
//       } else {
//         return deliveryPostcode || null;
//       }
//     }
//   }, [
//     userToken, addresses, selectedAddressId, deliveryPostcode,
//     useSameAddress, pickupAddresses, selectedPickupAddressId, pickupPostcode
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

//     const postcode = getPostcodeForTimeSlots(isDelivery ? 'delivery' : 'pickup');
//     if (postcode) {
//       const cleanPostcode = postcode.replace(/\s/g, '').toUpperCase();
//       params.set("postcode", cleanPostcode);
//     }

//     try {
//       const response = await fetch(`${API_BASE}/time-slots?${params.toString()}`, {
//         method: 'GET',
//         headers: { 'Accept': 'application/json' },
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
//     if (!deliverDate || !collectDate || !selectedCollectSlotStart) return;
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

//   // Prepare order data (addresses are not yet saved)
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

//     let deliveryAddressData = {
//       street_address: deliveryAddressForm.street_address,
//       postcode: deliveryPostcode,
//       city: deliveryAddressForm.city,
//       house_number: deliveryGeoData.house_number || "",
//       street_name: deliveryGeoData.street_name || "",
//       additional_details: deliveryAddressDetails,
//       latitude: deliveryGeoData.latitude,
//       longitude: deliveryGeoData.longitude,
//     };

//     let pickupAddressData = {
//       street_address: pickupAddressForm.street_address,
//       postcode: pickupPostcode,
//       city: pickupAddressForm.city,
//       house_number: pickupGeoData.house_number || "",
//       street_name: pickupGeoData.street_name || "",
//       additional_details: pickupAddressDetails,
//       latitude: pickupGeoData.latitude,
//       longitude: pickupGeoData.longitude,
//     };

//     if (useSameAddress) {
//       pickupAddressData = { ...deliveryAddressData };
//     }

//     const orderItems = (items || []).map(item => ({
//       product_id: item.id,
//       quantity: item.quantity,
//       price_at_purchase: item.price,
//     }));

//     return {
//       deliveryAddress: deliveryAddressData,
//       pickupAddress: pickupAddressData,
//       use_same_address: useSameAddress,
//       name: userInfo.name,
//       email: userInfo.email,
//       phone: userInfo.phone.startsWith("+")
//         ? userInfo.phone
//         : `${countryCode}${userInfo.phone}`,
//       collect_slot: pickupSlotText,
//       delivery_slot: deliverySlotText,
//       notes: notes.trim() || null,
//       items: orderItems,
//       subtotal: Number(subtotal),
//       tip: Number(tip),
//       total: Number(total),
//       is_student: isStudent,
//       student_id_image: studentIdImage,
//       change_manager_requested: changeManagerRequested,
//       discount_percent: Number(discountPercent),
//       discount_amount: Number(discountAmount),
//       topup_amount: Number(topupAmount),
//     };
//   }, [
//     selectedCollectSlot,
//     selectedDeliverSlot,
//     collectDate,
//     deliverDate,
//     useSameAddress,
//     deliveryAddressForm,
//     deliveryPostcode,
//     deliveryGeoData,
//     deliveryAddressDetails,
//     pickupAddressForm,
//     pickupPostcode,
//     pickupGeoData,
//     pickupAddressDetails,
//     userInfo,
//     countryCode,
//     notes,
//     items,
//     subtotal,
//     tip,
//     total,
//     isStudent,
//     studentIdImage,
//     changeManagerRequested,
//     discountPercent,
//     discountAmount,
//     topupAmount,
//   ]);

//   const validateAddresses = useCallback(() => {
//     const isDeliverySavedSelected = userToken &&
//       selectedAddressId &&
//       selectedAddressId !== "new" &&
//       addresses.some(addr => String(addr.address_id) === selectedAddressId);

//     const isPickupSavedSelected = userToken &&
//       selectedPickupAddressId &&
//       selectedPickupAddressId !== "new" &&
//       pickupAddresses.some(addr => String(addr.address_id) === selectedPickupAddressId);

//     if (useSameAddress) {
//       if (!isDeliverySavedSelected) {
//         if (!deliveryGeoData.latitude || !deliveryGeoData.longitude) {
//           throw new Error("Please select a valid delivery address from suggestions");
//         }
//       }
//     } else {
//       if (!isDeliverySavedSelected) {
//         if (!deliveryGeoData.latitude || !deliveryGeoData.longitude) {
//           throw new Error("Please select a valid delivery address from suggestions");
//         }
//       }
//       if (!isPickupSavedSelected) {
//         if (!pickupGeoData.latitude || !pickupGeoData.longitude) {
//           throw new Error("Please select a valid pickup address from suggestions");
//         }
//       }
//     }
//   }, [
//     useSameAddress,
//     userToken,
//     selectedAddressId,
//     selectedPickupAddressId,
//     addresses,
//     pickupAddresses,
//     deliveryGeoData,
//     pickupGeoData
//   ]);

//   const ensureAddressIds = useCallback(async (orderData) => {
//     let deliveryId = selectedAddressId;
//     let pickupId = selectedPickupAddressId;

//     if (!deliveryId || deliveryId === "new") {
//       const newId = await saveNewAddress({
//         ...orderData.deliveryAddress,
//         street_address: orderData.deliveryAddress.street_address || deliveryAddressForm.street_address,
//         postcode: orderData.deliveryAddress.postcode || deliveryPostcode,
//         city: orderData.deliveryAddress.city || deliveryAddressForm.city,
//         house_number: orderData.deliveryAddress.house_number || deliveryGeoData.house_number,
//         street_name: orderData.deliveryAddress.street_name || deliveryGeoData.street_name,
//         additional_details: orderData.deliveryAddress.additional_details || deliveryAddressDetails,
//         latitude: orderData.deliveryAddress.latitude,
//         longitude: orderData.deliveryAddress.longitude,
//       }, 'delivery');
//       if (!newId) throw new Error("Failed to save delivery address");
//       deliveryId = String(newId);
//     }

//     if (!useSameAddress) {
//       if (!pickupId || pickupId === "new") {
//         const newId = await saveNewAddress({
//           ...orderData.pickupAddress,
//           street_address: orderData.pickupAddress.street_address || pickupAddressForm.street_address,
//           postcode: orderData.pickupAddress.postcode || pickupPostcode,
//           city: orderData.pickupAddress.city || pickupAddressForm.city,
//           house_number: orderData.pickupAddress.house_number || pickupGeoData.house_number,
//           street_name: orderData.pickupAddress.street_name || pickupGeoData.street_name,
//           additional_details: orderData.pickupAddress.additional_details || pickupAddressDetails,
//           latitude: orderData.pickupAddress.latitude,
//           longitude: orderData.pickupAddress.longitude,
//         }, 'pickup');
//         if (!newId) throw new Error("Failed to save pickup address");
//         pickupId = String(newId);
//       }
//     } else {
//       pickupId = deliveryId;
//     }

//     return { deliveryId, pickupId };
//   }, [
//     selectedAddressId, selectedPickupAddressId, useSameAddress,
//     saveNewAddress, deliveryAddressForm, deliveryPostcode, deliveryGeoData, deliveryAddressDetails,
//     pickupAddressForm, pickupPostcode, pickupGeoData, pickupAddressDetails
//   ]);

//   const handleConfirmBooking = async () => {
//     if (bookingInProgress) return;
//     setBookingInProgress(true);
//     setLoading(true);

//     try {
//       validateAddresses();
//       const order = prepareOrderData();
//       if (!order) throw new Error("Please select pickup and delivery times");
//       setPendingBookingData(order);
//       const token = userToken || localStorage.getItem("jwtToken");
//       if (!token) throw new Error("Authentication required");
//       await initiateStripeSetup(token, customerId);
//     } catch (error) {
//       showToast(error.message || "Booking failed", "error");
//     } finally {
//       setLoading(false);
//       setBookingInProgress(false);
//     }
//   };

//   const handleSavedCardBooking = async () => {
//     if (!selectedCard) {
//       showToast("Please select a saved card", "error");
//       return;
//     }

//     // Validate delivery address ID
//     if (!selectedAddressId) {
//       showToast("Please select a delivery address", "error");
//       return;
//     }

//     setLoading(true);

//     try {
//       validateAddresses();
//       const order = prepareOrderData();
//       if (!order) throw new Error("Please select pickup and delivery times");

//       const { deliveryId, pickupId } = await ensureAddressIds(order);

//       const token = userToken || localStorage.getItem("jwtToken");
//       if (!token) throw new Error("Authentication required");

//       let currentCustomerId = customerId;
//       if (!currentCustomerId) {
//         currentCustomerId = await ensureStripeCustomer();
//         if (!currentCustomerId) throw new Error("Failed to set up payment customer");
//       }

//       const selectedCardData = savedCards.find(
//         card => card.payment_method_id === selectedCard
//       );
//       if (!selectedCardData) throw new Error("Selected card not found");

//       const payload = {
//         address_id: deliveryId,
//         pickup_address_id: pickupId,
//         use_same_address: useSameAddress,
//         items: order.items,
//         subtotal: order.subtotal,
//         tip: order.tip,
//         total: order.total,
//         collect_slot: order.collect_slot,
//         delivery_slot: order.delivery_slot,
//         notes: order.notes,
//         images: [],
//         is_student: order.is_student,
//         student_id_image: order.student_id_image,
//         change_manager_requested: order.change_manager_requested,
//         discount_percent: order.discount_percent,
//         discount_amount: order.discount_amount,
//         topup_amount: order.topup_amount,
//         payment_method_id: selectedCardData.payment_method_id,
//         stripe_customer_id: currentCustomerId,
//       };

//       const response = await fetch(`${API_BASE}/api/orders`, {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(payload)
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Booking failed");
//       }

//       // ✅ Clear the cart from localStorage after successful order
//       localStorage.removeItem('laundryCart');

//       showToast("Booking confirmed successfully!", "success");

//       navigate("/thankyou", {
//         state: {
//           orderId: data.orderId,
//           paymentStatus: "saved_card",
//           paymentMethod: "saved_card",
//           pickupDate: formatDateDDMMYYYY(collectDate),
//           pickupTime: formatTimeRange24Hour(selectedCollectSlot.start, selectedCollectSlot.end),
//           deliveryDate: formatDateDDMMYYYY(deliverDate),
//           deliveryTime: formatTimeRange24Hour(selectedDeliverSlot.start, selectedDeliverSlot.end),
//         }
//       });
//     } catch (error) {
//       console.error(error);
//       showToast(error.message || "Booking failed", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUseAnotherCard = async () => {
//     try {
//       validateAddresses();
//       const order = prepareOrderData();
//       if (!order) throw new Error("Please complete booking details");
//       setPendingBookingData(order);
//       const token = userToken || localStorage.getItem("jwtToken");
//       if (!token) throw new Error("Authentication required");
//       await initiateStripeSetup(token, customerId);
//     } catch (err) {
//       showToast(err.message || "Failed to setup card", "error");
//     }
//   };

//   const initiateStripeSetup = async (token, stripeCustomerId) => {
//     setSetupProcessing(true);
//     try {
//       if (!token) throw new Error("Authentication token missing");

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

//   // 🔥 FIXED: Full handleSetupSuccess with order creation
//   const handleSetupSuccess = async (setupIntent) => {
//     setSetupProcessing(true);
//     try {
//       const token = userToken || localStorage.getItem("jwtToken");
//       if (!token) throw new Error("Authentication required");
//       if (!pendingBookingData) throw new Error("Booking data missing");

//       // Validate delivery address ID
//       if (!selectedAddressId) {
//         throw new Error("Delivery address is missing. Please try again.");
//       }

//       const paymentMethodId =
//         setupIntent.payment_method ||
//         setupIntent.latest_attempt?.payment_method;
//       if (!paymentMethodId) throw new Error("Payment method not returned by Stripe");

//       // Set default payment method
//       if (customerId) {
//         await fetch(`${API_BASE}/stripe/set-default-payment`, {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ customerId, paymentMethodId }),
//         });
//       }

//       // Ensure addresses are saved and get IDs
//       const { deliveryId, pickupId } = await ensureAddressIds(pendingBookingData);

//       // Create order
//       const payload = {
//         address_id: deliveryId,
//         pickup_address_id: pickupId,
//         use_same_address: useSameAddress,
//         items: pendingBookingData.items,
//         subtotal: pendingBookingData.subtotal,
//         tip: pendingBookingData.tip,
//         total: pendingBookingData.total,
//         collect_slot: pendingBookingData.collect_slot,
//         delivery_slot: pendingBookingData.delivery_slot,
//         notes: pendingBookingData.notes,
//         images: [],
//         is_student: pendingBookingData.is_student,
//         student_id_image: pendingBookingData.student_id_image,
//         change_manager_requested: pendingBookingData.change_manager_requested,
//         discount_percent: pendingBookingData.discount_percent,
//         discount_amount: pendingBookingData.discount_amount,
//         topup_amount: pendingBookingData.topup_amount,
//         payment_method_id: paymentMethodId,
//         stripe_customer_id: customerId,
//       };

//       const response = await fetch(`${API_BASE}/api/orders`, {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to create booking");
//       }

//       setShowPaymentSetup(false);
//       setPendingBookingData(null);

//       showToast("Booking confirmed successfully!", "success");

//       setTimeout(() => {
//         navigate("/thankyou", {
//           state: {
//             orderId: data.orderId,
//             paymentStatus: "card_saved",
//             paymentMethod: "new_card",
//             pickupDate: formatDateDDMMYYYY(collectDate),
//             pickupTime: formatTimeRange24Hour(
//               selectedCollectSlot?.start,
//               selectedCollectSlot?.end
//             ),
//             deliveryDate: formatDateDDMMYYYY(deliverDate),
//             deliveryTime: formatTimeRange24Hour(
//               selectedDeliverSlot?.start,
//               selectedDeliverSlot?.end
//             ),
//           },
//         });
//       }, 1000);
//     } catch (error) {
//       showToast(error.message || "Failed to complete booking", "error");
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
//     setPendingBookingData(null);
//     setSetupProcessing(false);
//     showToast("Booking not confirmed. Please complete card setup to confirm your booking.", "warning");
//   };

//   const handlePhoneChange = (e) => {
//     const newPhone = e.target.value;
//     setUserInfo(prev => ({ ...prev, phone: newPhone }));
//     if (phoneCheckTimeoutRef.current) clearTimeout(phoneCheckTimeoutRef.current);
//     if (newPhone && newPhone.trim().length >= 5) {
//       phoneCheckTimeoutRef.current = setTimeout(() => {
//         checkPhoneNumberExists(newPhone);
//       }, 1000);
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
//     if (checked) {
//       setPickupAddressForm({ ...deliveryAddressForm });
//       setPickupPostcode(deliveryPostcode);
//       setPickupGeoData({ ...deliveryGeoData });
//       setPickupAddressDetails(deliveryAddressDetails);
//       setSelectedPickupAddressId(selectedAddressId);
//     }
//   };

//   useEffect(() => {
//     const checkGoogle = () => {
//       if (window.google && window.google.maps && window.google.maps.places) {
//         setGoogleReady(true);
//       } else {
//         setTimeout(checkGoogle, 300);
//       }
//     };
//     checkGoogle();
//   }, []);

//   useEffect(() => {
//     if (!googleReady) return;
//     const clean = pickupPostcode.trim();
//     if (clean.length >= 3) {
//       const service = new window.google.maps.places.AutocompleteService();
//       service.getPlacePredictions(
//         {
//           input: clean,
//           componentRestrictions: { country: "gb" }
//         },
//         (predictions, status) => {
//           if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
//             setPickupPostcodeAddresses([]);
//             return;
//           }
//           setPickupPostcodeAddresses(
//             predictions.map(p => ({ full: p.description, place_id: p.place_id }))
//           );
//         }
//       );
//     } else {
//       setPickupPostcodeAddresses([]);
//     }
//   }, [pickupPostcode, googleReady]);

//   useEffect(() => {
//     if (!googleReady || !selectedPickupPostcodeAddress) return;
//     const geocoder = new window.google.maps.Geocoder();
//     geocoder.geocode({ placeId: selectedPickupPostcodeAddress }, (results, status) => {
//       if (status !== "OK" || !results[0]) return;
//       const result = results[0];
//       let street = "", house = "", postcode = "", city = "";
//       result.address_components.forEach(c => {
//         if (c.types.includes("route")) street = c.long_name;
//         if (c.types.includes("street_number")) house = c.long_name;
//         if (c.types.includes("postal_code")) postcode = c.long_name;
//         if (c.types.includes("postal_town")) city = c.long_name;
//       });
//       setPickupGeoData({
//         latitude: result.geometry.location.lat(),
//         longitude: result.geometry.location.lng(),
//         street_name: street,
//         house_number: house
//       });
//       setPickupAddressForm({
//         street_address: result.formatted_address,
//         postcode,
//         city,
//         house_number: house,
//         additional_details: pickupAddressDetails
//       });
//     });
//   }, [selectedPickupPostcodeAddress, googleReady, pickupAddressDetails]);

//   useEffect(() => {
//     if (!googleReady) return;
//     const clean = deliveryPostcode.trim();
//     if (clean.length >= 3) {
//       const service = new window.google.maps.places.AutocompleteService();
//       service.getPlacePredictions(
//         {
//           input: clean,
//           componentRestrictions: { country: "gb" }
//         },
//         (predictions, status) => {
//           if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
//             setDeliveryPostcodeAddresses([]);
//             return;
//           }
//           setDeliveryPostcodeAddresses(
//             predictions.map(p => ({ full: p.description, place_id: p.place_id }))
//           );
//         }
//       );
//     } else {
//       setDeliveryPostcodeAddresses([]);
//     }
//   }, [deliveryPostcode, googleReady]);

//   useEffect(() => {
//     if (!googleReady || !selectedDeliveryPostcodeAddress) return;
//     const geocoder = new window.google.maps.Geocoder();
//     geocoder.geocode({ placeId: selectedDeliveryPostcodeAddress }, (results, status) => {
//       if (status !== "OK" || !results[0]) return;
//       const result = results[0];
//       let street = "", house = "", postcode = "", city = "";
//       result.address_components.forEach(c => {
//         if (c.types.includes("route")) street = c.long_name;
//         if (c.types.includes("street_number")) house = c.long_name;
//         if (c.types.includes("postal_code")) postcode = c.long_name;
//         if (c.types.includes("postal_town")) city = c.long_name;
//       });
//       setDeliveryGeoData({
//         latitude: result.geometry.location.lat(),
//         longitude: result.geometry.location.lng(),
//         street_name: street,
//         house_number: house
//       });
//       setDeliveryAddressForm({
//         street_address: result.formatted_address,
//         postcode,
//         city,
//         house_number: house,
//         additional_details: deliveryAddressDetails
//       });
//     });
//   }, [selectedDeliveryPostcodeAddress, googleReady, deliveryAddressDetails]);

//   useEffect(() => {
//     if (collectDate) {
//       const timer = setTimeout(fetchCollectSlots, 300);
//       return () => clearTimeout(timer);
//     }
//   }, [collectDate, fetchCollectSlots]);

//   useEffect(() => {
//     if (deliverDate && selectedCollectSlotStart) {
//       const timer = setTimeout(fetchDeliverySlots, 300);
//       return () => clearTimeout(timer);
//     }
//   }, [deliverDate, selectedCollectSlotStart, fetchDeliverySlots]);

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
//     return () => {
//       if (phoneCheckTimeoutRef.current) clearTimeout(phoneCheckTimeoutRef.current);
//     };
//   }, []);

//   const isBookingValid = () => {
//     if (!userInfo.name.trim()) return false;
//     if (!userInfo.email.trim()) return false;
//     if (!userInfo.phone.trim()) return false;
//     if (!selectedCollectSlot || !selectedDeliverSlot) return false;

//     if (userToken && pickupAddresses.length > 0 && !showPickupAddressForm) {
//       if (useSameAddress) {
//         if (!selectedAddressId) return false;
//       } else {
//         if (!selectedPickupAddressId) return false;
//       }
//     } else {
//       if (!pickupPostcode.trim() || !selectedPickupPostcodeAddress) return false;
//       if (!pickupGeoData.latitude || !pickupGeoData.longitude) return false;
//     }

//     if (!useSameAddress) {
//       if (userToken && addresses.length > 0 && !showAddressForm) {
//         if (!selectedAddressId) return false;
//       } else {
//         if (!deliveryPostcode.trim() || !selectedDeliveryPostcodeAddress) return false;
//         if (!deliveryGeoData.latitude || !deliveryGeoData.longitude) return false;
//       }
//     }

//     return true;
//   };

//   return (
//     <div className="qb-page">
//       <div className="qb-container">
//         {/* Title Section */}
//         <div className="qb-title-section">
//           <button
//             className="qb-back-btn"
//             onClick={() => navigate(-1)}
//             aria-label="Go back"
//           >
//             <i className="fas fa-arrow-left"></i>
//           </button>
//           <h1 className="qb-title">
//             <i className="fas fa-calendar-check qb-title-icon"></i>
//             Checkout
//           </h1>
//           <p className="qb-subtitle">
//             Confirm your items, address, and payment
//           </p>
//           {userToken && (
//             <div className="qb-user-info">
//               <i className="fas fa-user-check"></i>
//               <span>
//                 Welcome back, {userInfo.name || user?.email}! Your info is pre-filled.
//               </span>
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
//                   onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
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
//                   onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
//                   placeholder="john@example.com"
//                   required
//                 />
//               </label>
//             </div>

//             <div className="qb-phone-group">
//               <select
//                 className="qb-country-code"
//                 value={countryCode}
//                 onChange={(e) => setCountryCode(e.target.value)}
//               >
//                 {countryCodes.map(c => (
//                   <option key={c.code} value={c.code}>{c.code}</option>
//                 ))}
//               </select>
//               <input
//                 type="tel"
//                 className="qb-form-input"
//                 value={userInfo.phone}
//                 onChange={handlePhoneChange}
//                 placeholder="Phone Number"
//                 required
//               />
//             </div>
//           </div>
//         </div>

//         {/* Pickup Address Card */}
//         <div className="qb-card">
//           <div className="qb-card-header">
//             <div className="qb-section-icon">
//               <i className="fas fa-map-marker-alt"></i>
//             </div>
//             <div>
//               <h2 className="qb-section-title">Pickup Address</h2>
//               <p className="qb-section-subtitle">Where should we collect your laundry?</p>
//             </div>
//           </div>

//           {userToken && pickupAddresses.length > 0 && !showPickupAddressForm ? (
//             <>
//               <div className="qb-address-selection">
//                 <h3 className="qb-address-selection-title">Select a Saved Pickup Address</h3>
//                 <div className="qb-address-grid">
//                   {pickupAddresses.map(addr => (
//                     <div
//                       key={addr.address_id}
//                       className={`qb-address-option ${selectedPickupAddressId === String(addr.address_id) ? "selected" : ""}`}
//                     >
//                       <div className="qb-address-option-content" onClick={() => {
//                         setSelectedPickupAddressId(String(addr.address_id));
//                         if (useSameAddress) {
//                           setSelectedAddressId(String(addr.address_id));
//                         }
//                       }}>
//                         <div className="qb-address-option-header">
//                           <div className="qb-address-type">
//                             <i className="fas fa-home"></i>
//                             <span>{addr.name || "Home"}</span>
//                           </div>
//                           {addr.is_selected && (
//                             <span className="qb-default-badge">
//                               <i className="fas fa-star"></i> Default
//                             </span>
//                           )}
//                         </div>
//                         <div className="qb-address-option-details">
//                           <p className="qb-address-text">{addr.full_address}</p>
//                           <p className="qb-address-postcode">
//                             <i className="fas fa-map-pin"></i> {addr.postcode}
//                           </p>
//                         </div>
//                       </div>
//                       <button
//                         className="qb-address-delete"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleDeleteAddress(addr.address_id);
//                         }}
//                         aria-label="Delete address"
//                       >
//                         <i className="fas fa-trash"></i>
//                       </button>
//                     </div>
//                   ))}

//                   <div className="qb-add-address-option" onClick={() => {
//                     setShowPickupAddressForm(true);
//                     setSelectedPickupAddressId("new");
//                   }}>
//                     <div className="qb-add-address-icon">
//                       <i className="fas fa-plus-circle"></i>
//                     </div>
//                     <div className="qb-add-address-text">
//                       <h4>Add New Pickup Address</h4>
//                       <p>Enter a different pickup address</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="qb-address-toggle">
//                 <label className="qb-toggle-container">
//                   <div className="qb-toggle-switch">
//                     <input type="checkbox" checked={useSameAddress} onChange={handleToggleSameAddress} />
//                     <span className="qb-toggle-slider"></span>
//                   </div>
//                   <div className="qb-toggle-label">
//                     <span className="qb-toggle-title">Use same address for delivery</span>
//                     <span className="qb-toggle-description">Deliver back to pickup location</span>
//                   </div>
//                 </label>
//               </div>
//             </>
//           ) : (
//             <div className="qb-address-form-section">
//               <div className="qb-form-grid">
//                 {/* Full Address input – commented out as requested */}
//                 {/* <div className="qb-form-group full-width">
//                   <label className="qb-form-label">
//                     <i className="fas fa-road"></i> Full Address *
//                     <input
//                       type="text"
//                       className="qb-form-input"
//                       value={pickupAddressForm.street_address}
//                       onChange={(e) => {
//                         setPickupAddressForm(prev => ({
//                           ...prev,
//                           street_address: e.target.value
//                         }));
//                         setPickupGeoData({
//                           latitude: null,
//                           longitude: null,
//                           street_name: "",
//                           house_number: ""
//                         });
//                       }}
//                       placeholder="Start typing or select from dropdown"
//                       required
//                     />
//                   </label>
//                 </div> */}

//                 <div className="qb-form-group">
//                   <label className="qb-form-label">
//                     Postcode *
//                     <input
//                       type="text"
//                       className="qb-form-input"
//                       value={pickupPostcode}
//                       onChange={(e) => setPickupPostcode(e.target.value.toUpperCase())}
//                       placeholder="SW1A2AA"
//                     />
//                   </label>
//                 </div>

//                 <div className="qb-form-group">
//                   <label className="qb-form-label">
//                     Select Address *
//                     <select
//                       className="qb-form-input"
//                       value={selectedPickupPostcodeAddress}
//                       onChange={(e) => setSelectedPickupPostcodeAddress(e.target.value)}
//                     >
//                       <option value="">Select address</option>
//                       {pickupPostcodeAddresses.map((addr, idx) => (
//                         <option key={idx} value={addr.place_id}>{addr.full}</option>
//                       ))}
//                     </select>
//                   </label>
//                 </div>

//                 <div className="qb-form-group">
//                   <label className="qb-form-label">
//                     Address details
//                     <input
//                       type="text"
//                       className="qb-address-details-input"
//                       placeholder="Flat / Door / Floor"
//                       value={pickupAddressDetails}
//                       onChange={(e) => setPickupAddressDetails(e.target.value)}
//                     />
//                   </label>
//                 </div>
//               </div>

//               {userToken && (
//                 <>
//                   <div className="qb-save-address-checkbox">
//                     <label>
//                       <input
//                         type="checkbox"
//                         checked={savePickupAddress}
//                         onChange={(e) => setSavePickupAddress(e.target.checked)}
//                       />
//                       <span>Save this address to my account</span>
//                     </label>
//                   </div>

//                   {savePickupAddress && (
//                     <div style={{ marginTop: "12px" }}>
//                       <button
//                         type="button"
//                         className="qb-primary-btn"
//                         onClick={handleSaveAddress}
//                       >
//                         <i className="fas fa-save"></i> Save Address
//                       </button>
//                     </div>
//                   )}
//                 </>
//               )}

//               {userToken && pickupAddresses.length > 0 && showPickupAddressForm && (
//                 <button className="qb-secondary-btn" onClick={() => setShowPickupAddressForm(false)}>
//                   <i className="fas fa-arrow-left"></i> Back to Saved Addresses
//                 </button>
//               )}

//               {(!userToken || showPickupAddressForm) && (
//                 <div className="qb-address-toggle" style={{ marginTop: "20px" }}>
//                   <label className="qb-toggle-container">
//                     <div className="qb-toggle-switch">
//                       <input type="checkbox" checked={useSameAddress} onChange={handleToggleSameAddress} />
//                       <span className="qb-toggle-slider"></span>
//                     </div>
//                     <div className="qb-toggle-label">
//                       <span className="qb-toggle-title">Use same address for delivery</span>
//                       <span className="qb-toggle-description">Deliver back to pickup location</span>
//                     </div>
//                   </label>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Delivery Address Section (only if different) */}
//           {!useSameAddress && (
//             <div className="qb-address-section" style={{ marginTop: "24px" }}>
//               <h3 className="qb-address-section-title">
//                 <i className="fas fa-truck"></i> Delivery Address
//                 <span className="qb-required-badge">Required</span>
//               </h3>

//               {userToken && addresses.length > 0 && !showAddressForm ? (
//                 <div className="qb-address-selection">
//                   <h4>Select a Saved Delivery Address</h4>
//                   <div className="qb-address-grid">
//                     {addresses.map(addr => (
//                       <div
//                         key={addr.address_id}
//                         className={`qb-address-option ${selectedAddressId === String(addr.address_id) ? "selected" : ""}`}
//                         onClick={() => setSelectedAddressId(String(addr.address_id))}
//                       >
//                         <p className="qb-address-text">{addr.full_address}</p>
//                         <p className="qb-address-postcode">{addr.postcode}</p>
//                       </div>
//                     ))}
//                     <div className="qb-add-address-option" onClick={() => {
//                       setShowAddressForm(true);
//                       setSelectedAddressId("new");
//                     }}>
//                       <div className="qb-add-address-icon"><i className="fas fa-plus-circle"></i></div>
//                       <div className="qb-add-address-text">
//                         <h4>New Delivery Address</h4>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="qb-form-grid">
//                   {/* Full Address input for delivery – commented out */}
//                   {/* <div className="qb-form-group full-width">
//                     <label className="qb-form-label">
//                       <i className="fas fa-road"></i> Full Address *
//                       <input
//                         type="text"
//                         className="qb-form-input"
//                         value={deliveryAddressForm.street_address}
//                         onChange={(e) => {
//                           setDeliveryAddressForm(prev => ({
//                             ...prev,
//                             street_address: e.target.value
//                           }));
//                           setDeliveryGeoData({
//                             latitude: null,
//                             longitude: null,
//                             street_name: "",
//                             house_number: ""
//                           });
//                         }}
//                         placeholder="Start typing or select from dropdown"
//                         required
//                       />
//                     </label>
//                   </div> */}

//                   <div className="qb-form-group">
//                     <label className="qb-form-label">
//                       Postcode *
//                       <input
//                         type="text"
//                         className="qb-form-input"
//                         value={deliveryPostcode}
//                         onChange={(e) => setDeliveryPostcode(e.target.value.toUpperCase())}
//                         placeholder="SW1A2AA"
//                       />
//                     </label>
//                   </div>

//                   <div className="qb-form-group">
//                     <label className="qb-form-label">
//                       Select Address *
//                       <select
//                         className="qb-form-input"
//                         value={selectedDeliveryPostcodeAddress}
//                         onChange={(e) => setSelectedDeliveryPostcodeAddress(e.target.value)}
//                       >
//                         <option value="">Select address</option>
//                         {deliveryPostcodeAddresses.map((addr, idx) => (
//                           <option key={idx} value={addr.place_id}>{addr.full}</option>
//                         ))}
//                       </select>
//                     </label>
//                   </div>

//                   <div className="qb-form-group">
//                     <label className="qb-form-label">
//                       Address details
//                       <input
//                         type="text"
//                         className="qb-address-details-input"
//                         placeholder="Flat / Door / Floor"
//                         value={deliveryAddressDetails}
//                         onChange={(e) => setDeliveryAddressDetails(e.target.value)}
//                       />
//                     </label>
//                   </div>
//                 </div>
//               )}

//               {userToken && showAddressForm && (
//                 <>
//                   <div className="qb-save-address-checkbox">
//                     <label>
//                       <input
//                         type="checkbox"
//                         checked={saveDeliveryAddress}
//                         onChange={(e) => setSaveDeliveryAddress(e.target.checked)}
//                       />
//                       <span>Save this delivery address to my account</span>
//                     </label>
//                   </div>

//                   {saveDeliveryAddress && (
//                     <div style={{ marginTop: "12px" }}>
//                       <button
//                         type="button"
//                         className="qb-primary-btn"
//                         onClick={handleSaveDeliveryAddress}
//                       >
//                         <i className="fas fa-save"></i> Save Address
//                       </button>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Schedule Card */}
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
//                   <i className="fas fa-calendar-day"></i> Pickup Date
//                 </label>
//                 <div className="qb-date-input-container">
//                   <input
//                     type="date"
//                     className="qb-date-input"
//                     value={collectDate}
//                     onChange={handleCollectDateChange}
//                     min={today}
//                   />
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
//                     <i className="fas fa-clock"></i> Available Pickup Times
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
//                   <i className="fas fa-calendar-day"></i> Delivery Date
//                 </label>
//                 <div className="qb-date-input-container">
//                   <input
//                     type="date"
//                     className="qb-date-input"
//                     value={deliverDate}
//                     onChange={handleDeliverDateChange}
//                     min={collectDate || today}
//                     disabled={!collectDate}
//                   />
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
//                     <i className="fas fa-clock"></i> Available Delivery Times
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
//                 <p className="qb-section-subtitle">Payment is required to confirm your booking</p>
//               </div>
//               <div className="qb-security-badge">
//                 <i className="fas fa-shield-alt"></i>
//                 <span>Secure Payment</span>
//               </div>
//             </div>

//             <div className="qb-payment-notice">
//               <div className="qb-notice-icon">
//                 <i className="fas fa-info-circle"></i>
//               </div>
//               <div className="qb-notice-content">
//                 <strong>No payment taken now</strong> – Save your payment method to confirm your booking. You won't be charged now. We'll send an invoice after the pickup and only take payment once you're happy to proceed.
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
//                     <i className="fas fa-credit-card"></i> Your Saved Cards
//                   </h3>
//                   <p className="qb-saved-cards-subtitle">Select a card or add a new one</p>

//                   <div className="qb-cards-list">
//                     {savedCards.map((card) => (
//                       <div
//                         key={card.payment_method_id}
//                         className={`qb-card-option ${
//                           selectedCard === card.payment_method_id ? "selected" : ""
//                         }`}
//                         onClick={() => setSelectedCard(card.payment_method_id)}
//                       >
//                         <div className="qb-card-option-icon">
//                           <i className={`${getCardBrandIcon(card.brand)} ${getCardBrandClass(card.brand)}`}></i>
//                         </div>
//                         <div className="qb-card-option-details">
//                           <div className="qb-card-brand">{card.brand?.toUpperCase() || 'CARD'}</div>
//                           <div className="qb-card-number">•••• {card.last4}</div>
//                           {card.is_default && (
//                             <div className="qb-card-default">
//                               <i className="fas fa-check-circle"></i> Default Card
//                             </div>
//                           )}
//                         </div>
//                         {selectedCard === card.payment_method_id && (
//                           <div className="qb-card-selected">
//                             <i className="fas fa-check-circle"></i>
//                           </div>
//                         )}
//                         <button
//                           className="qb-card-delete"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleDeleteCard(card.payment_method_id);
//                           }}
//                           aria-label="Delete card"
//                         >
//                           <i className="fas fa-trash"></i>
//                         </button>
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

//                 <div className="qb-payment-info" style={{ marginTop: '12px' }}>
//                   <div className="qb-payment-info-icon">
//                     <i className="fas fa-info-circle"></i>
//                   </div>
//                   <div className="qb-payment-info-text">
//                     <strong>No payment taken now:</strong> We'll send an invoice after inspection. You approve payment only after reviewing.
//                   </div>
//                 </div>

//                 <div className="qb-payment-actions">
//                   <button
//                     className="qb-primary-btn qb-book-btn"
//                     onClick={handleSavedCardBooking}
//                     disabled={!isBookingValid() || loading || setupProcessing || bookingInProgress}
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
//                         Securely save your card with Stripe. No charges now.
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
//                     <strong>Payment Required:</strong> A valid card must be saved to confirm your booking.
//                   </div>
//                 </div>

//                 <div className="qb-payment-actions">
//                   <button
//                     className="qb-primary-btn qb-book-btn"
//                     onClick={handleConfirmBooking}
//                     disabled={!isBookingValid() || loading || setupProcessing || bookingInProgress}
//                   >
//                     {loading || setupProcessing ? (
//                       <>
//                         <div className="qb-btn-spinner"></div>
//                         Processing...
//                       </>
//                     ) : (
//                       <>
//                         <i className="fas fa-lock"></i>
//                         Book Now & Save Card
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
//                 disabled={!isBookingValid() || loading || setupProcessing || bookingInProgress}
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
import React, { useEffect, useState, useCallback, useRef } from "react";
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

// Known country codes
const countryCodes = [
  { code: "+44", label: "UK" },
  { code: "+91", label: "IN" },
  { code: "+1", label: "US" },
  { code: "+61", label: "AU" },
  { code: "+971", label: "UAE" },
];

// Helper to extract country code and local number from full phone
const parsePhone = (fullPhone) => {
  if (!fullPhone) return { code: "+44", local: "" };
  for (const { code } of countryCodes) {
    if (fullPhone.startsWith(code)) {
      return { code, local: fullPhone.slice(code.length) };
    }
  }
  // If no match, assume +44 and treat whole as local
  const withoutPlus = fullPhone.replace(/^\+/, "");
  return { code: "+44", local: withoutPlus };
};

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
  const phoneCheckTimeoutRef = useRef(null);

  // ---------- NEW: Referral Code State ----------
  const [referralCode, setReferralCode] = useState("");

  const addressInputRef = useRef(null);
  const pickupAddressInputRef = useRef(null);
  const deliveryAddressInputRef = useRef(null);
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

  // New state for phone input split
  const [localPhone, setLocalPhone] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+44");

  // Parse userInfo.phone into localPhone and selectedCountryCode
  useEffect(() => {
    if (userInfo.phone) {
      const { code, local } = parsePhone(userInfo.phone);
      setSelectedCountryCode(code);
      setLocalPhone(local);
    } else {
      setLocalPhone("");
    }
  }, [userInfo.phone]);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [selectedPickupAddressId, setSelectedPickupAddressId] = useState(null);
  const [pickupAddresses, setPickupAddresses] = useState([]);
  const [bookingInProgress, setBookingInProgress] = useState(false);

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
  const [deliveryAddressForm, setDeliveryAddressForm] = useState({
    street_address: "",
    postcode: "",
    city: "",
    additional_details: "",
    house_number: ""
  });

  // Flags to control saving new addresses
  const [saveDeliveryAddress, setSaveDeliveryAddress] = useState(false);
  const [savePickupAddress, setSavePickupAddress] = useState(false);

  // Form state
  const [collectDate, setCollectDate] = useState("");
  const [deliverDate, setDeliverDate] = useState("");
  const [notes, setNotes] = useState("");
  const [postcode, setPostcode] = useState("");
  const [postcodeAddresses, setPostcodeAddresses] = useState([]);
  const [selectedPostcodeAddress, setSelectedPostcodeAddress] = useState("");
  const [addressDetails, setAddressDetails] = useState("");
  const [loadingPostcode, setLoadingPostcode] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [deliveryPostcode, setDeliveryPostcode] = useState("");
  const [deliveryPostcodeAddresses, setDeliveryPostcodeAddresses] = useState([]);
  const [selectedDeliveryPostcodeAddress, setSelectedDeliveryPostcodeAddress] = useState("");
  const [deliveryAddressDetails, setDeliveryAddressDetails] = useState("");
  const [guideStep, setGuideStep] = useState(1);

  // Token validation function
  const validateToken = useCallback(async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setUserToken(null);
      return false;
    }
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        // Token invalid or expired
        localStorage.removeItem("jwtToken");
        setUserToken(null);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  }, []);

  // Validate token on mount
  useEffect(() => {
    validateToken().then((isValid) => {
      if (!isValid) {
        // Token cleared, ensure user is logged out
        login(null); // if your login accepts null to clear
      }
    });
  }, [validateToken, login]);

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
    if (guideStep === 1 && userInfo.name.trim().length > 1) {
      setGuideStep(2);
    }
    if (guideStep === 2 && userInfo.email.trim().length > 3) {
      setGuideStep(3);
    }
    if (guideStep === 3 && userInfo.phone.trim().length > 5) {
      setGuideStep(4);
    }
    if (guideStep === 4 && addressForm.street_address) {
      setGuideStep(5);
    }
    if (guideStep === 5 && collectDate) {
      setGuideStep(6);
    }
    if (guideStep === 6 && selectedCollectSlot) {
      setGuideStep(7);
    }
    if (guideStep === 7 && deliverDate) {
      setGuideStep(8);
    }
    if (guideStep === 8 && selectedDeliverSlot) {
      setGuideStep(9);
    }
  }, [
    userInfo,
    addressForm,
    collectDate,
    selectedCollectSlot,
    deliverDate,
    selectedDeliverSlot,
    guideStep
  ]);

  useEffect(() => {
    if (!googleReady) return;
    const clean = deliveryPostcode.trim();
    if (clean.length >= 3) {
      fetchDeliveryAddressesByPostcode(clean);
    } else {
      setDeliveryPostcodeAddresses([]);
    }
  }, [deliveryPostcode, googleReady]);

  useEffect(() => {
    if (selectedDeliveryPostcodeAddress) {
      geocodeDeliveryAddress(selectedDeliveryPostcodeAddress);
    }
  }, [selectedDeliveryPostcodeAddress]);

  // Constants
  const today = new Date().toISOString().split("T")[0];

  // Show toast notification
  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    if (!googleReady) return;
    const clean = postcode.trim();
    if (clean.length >= 3) {
      fetchAddressesByPostcode(clean);
    } else {
      setPostcodeAddresses([]);
    }
  }, [postcode, googleReady]);

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

  const fetchAddressesByPostcode = (postcode) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      setPostcodeAddresses([]);
      return;
    }
    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions(
      {
        input: postcode,
        componentRestrictions: { country: "gb" }
      },
      (predictions, status) => {
        if (
          status !== window.google.maps.places.PlacesServiceStatus.OK ||
          !predictions
        ) {
          setPostcodeAddresses([]);
          return;
        }
        const results = predictions.map((p) => ({
          full: p.description,
          place_id: p.place_id
        }));
        setPostcodeAddresses(results);
      }
    );
  };

  const fetchDeliveryAddressesByPostcode = (postcode) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      setDeliveryPostcodeAddresses([]);
      return;
    }
    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions(
      {
        input: postcode,
        componentRestrictions: { country: "gb" }
      },
      (predictions, status) => {
        if (
          status !== window.google.maps.places.PlacesServiceStatus.OK ||
          !predictions
        ) {
          setDeliveryPostcodeAddresses([]);
          return;
        }
        const results = predictions.map((p) => ({
          full: p.description,
          place_id: p.place_id
        }));
        setDeliveryPostcodeAddresses(results);
      }
    );
  };

  const geocodeDeliveryAddress = (placeId) => {
    if (!window.google || !placeId) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId: placeId }, (results, status) => {
      if (status !== "OK" || !results[0]) return;
      const result = results[0];
      const lat = result.geometry.location.lat();
      const lng = result.geometry.location.lng();
      let postcode = "";
      let house = "";
      let street = "";
      let city = "";
      result.address_components.forEach((c) => {
        if (c.types.includes("postal_code")) postcode = c.long_name;
        if (c.types.includes("street_number")) house = c.long_name;
        if (c.types.includes("route")) street = c.long_name;
        if (c.types.includes("postal_town")) city = c.long_name;
      });
      setDeliveryGeoData({
        latitude: lat,
        longitude: lng,
        street_name: street,
        house_number: house
      });
      setDeliveryAddressForm({
        street_address: result.formatted_address,
        postcode: postcode,
        city: city,
        house_number: house,
        additional_details: ""
      });
    });
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
      } else if (response.status === 401) {
        // Token invalid – clear it
        localStorage.removeItem("jwtToken");
        setUserToken(null);
        showToast("Session expired. Please log in again.", "warning");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, [userToken, showToast]);

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
      } else if (response.status === 401) {
        localStorage.removeItem("jwtToken");
        setUserToken(null);
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
            setSelectedCard(defaultCard.payment_method_id);
          } else if (data.cards.length > 0) {
            setSelectedCard(data.cards[0].payment_method_id);
          }
        }
      } else if (response.status === 401) {
        localStorage.removeItem("jwtToken");
        setUserToken(null);
        setSavedCards([]);
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
      } else if (response.status === 401) {
        localStorage.removeItem("jwtToken");
        setUserToken(null);
      }
    } catch (error) {
      console.error("Error creating Stripe customer:", error);
    }
  }, [userToken]);

  // Ensure user exists (create or retrieve) and return token
  const ensureUserExists = useCallback(async () => {
    const fullPhone = `${selectedCountryCode}${localPhone}`;
    if (!fullPhone || fullPhone.trim().length < 5) {
      throw new Error("Please enter a valid phone number");
    }

    const response = await fetch(`${API_BASE}/auth/access`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: fullPhone,
        name: userInfo.name || "User",
        email: userInfo.email || null
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to authenticate");
    }

    const data = await response.json();

    if (data.success && data.user) {
      // Update userInfo with any server-provided data
      setUserInfo(prev => ({
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

        // Fetch additional data after login (don't await – let them run in background)
        fetchUserProfile();
        fetchAddresses();
        fetchSavedCards();
        ensureStripeCustomer();
      }

      showToast(
        data.isNewUser
          ? "Account created successfully!"
          : "Welcome back!",
        "success"
      );

      return data.token;
    } else {
      throw new Error("Authentication failed");
    }
  }, [
    selectedCountryCode,
    localPhone,
    userInfo.name,
    userInfo.email,
    login,
    fetchUserProfile,
    fetchAddresses,
    fetchSavedCards,
    ensureStripeCustomer,
    showToast
  ]);

  // Phone existence check (triggered on typing)
  const checkPhoneNumberExists = useCallback(async (fullPhone) => {
    if (!fullPhone || fullPhone.trim().length < 5) return;

    try {
      const response = await fetch(`${API_BASE}/auth/access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: fullPhone,
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
          data.isNewUser
            ? "Account created successfully!"
            : "Welcome back!",
          "success"
        );
      }
    } catch (error) {
      console.error("Auth access error:", error);
    }
  }, [
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
  const saveNewAddress = useCallback(async (addressData, type = "delivery") => {
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
        // Address already exists → don't create duplicate
        return existing.address_id;
      }

      // 🚀 Save new address
      const response = await fetch(`${API_BASE}/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          street_address: addressData.street_address,
          postcode: addressData.postcode,
          city: addressData.city || "",
          additional_details: addressData.additional_details || "",
          house_number: addressData.house_number || "",
          name: type === "pickup" ? "Pickup Location" : "Delivery Address",
          is_selected: false,
        }),
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

  // Delete an address
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;

    try {
      const token = userToken || localStorage.getItem("jwtToken");
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE}/addresses/${addressId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
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
        
        // Make the foreign‑key violation message more friendly
        if (errorMessage.includes("linked to existing orders") || errorMessage.includes("foreign key")) {
          errorMessage = "This address cannot be deleted because it has been used in past orders. You can keep it saved for future bookings.";
        }
        
        throw new Error(errorMessage);
      }

      // Success – update state
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

      showToast("Address deleted successfully", "success");
    } catch (error) {
      console.error("Delete address error:", error);
      showToast(error.message, "warning");
    }
  };

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

    /* ---------------- PICKUP ADDRESS ---------------- */

    let pickupAddressData = {};

    if (!useSameAddress) {
      if (userToken && pickupAddresses.length > 0 && selectedPickupAddressId && selectedPickupAddressId !== "new") {
        const selectedPickupAddress = pickupAddresses.find(
          addr => String(addr.address_id) === selectedPickupAddressId
        );

        if (!selectedPickupAddress) return null;

        pickupAddressData = {
          pickup_street_address: selectedPickupAddress.street_address,
          pickup_postcode: selectedPickupAddress.postcode,
          pickup_city: selectedPickupAddress.city || "",
          pickup_full_address: selectedPickupAddress.full_address,
          pickup_house_number: selectedPickupAddress.house_number || "",
          pickup_latitude: selectedPickupAddress.latitude || null,
          pickup_longitude: selectedPickupAddress.longitude || null
        };
      } else {
        pickupAddressData = {
          pickup_street_address: pickupAddressForm.street_address,
          pickup_postcode: pickupAddressForm.postcode,
          pickup_city: pickupAddressForm.city || "",
          pickup_full_address: pickupAddressForm.street_address,
          pickup_house_number: pickupGeoData.house_number || "",
          pickup_latitude: pickupGeoData.latitude || null,
          pickup_longitude: pickupGeoData.longitude || null
        };
      }
    } else {
      pickupAddressData = {
        pickup_street_address: addressForm.street_address,
        pickup_postcode: addressForm.postcode,
        pickup_city: addressForm.city || "",
        pickup_full_address: addressForm.street_address,
        pickup_house_number: geoData.house_number || "",
        pickup_latitude: geoData.latitude || null,
        pickup_longitude: geoData.longitude || null
      };
    }

    /* ---------------- DELIVERY ADDRESS ---------------- */

    let deliveryAddressData = {};

    if (useSameAddress) {
      deliveryAddressData = {
        street_address: addressForm.street_address,
        postcode: addressForm.postcode,
        city: addressForm.city || "",
        full_address: addressForm.street_address,
        house_number: geoData.house_number || "",
        latitude: geoData.latitude || null,
        longitude: geoData.longitude || null,
        additional_details: addressDetails || ""
      };
    } else {
      deliveryAddressData = {
        street_address: deliveryAddressForm.street_address,
        postcode: deliveryAddressForm.postcode,
        city: deliveryAddressForm.city || "",
        full_address: deliveryAddressForm.street_address,
        house_number: deliveryGeoData.house_number || "",
        latitude: deliveryGeoData.latitude || null,
        longitude: deliveryGeoData.longitude || null,
        additional_details: deliveryAddressDetails || ""
      };
    }

    /* ---------------- FINAL ORDER ---------------- */

    return {
      ...deliveryAddressData,
      ...pickupAddressData,

      additional_details: addressDetails,

      use_same_address: useSameAddress,
      name: userInfo.name,
      email: userInfo.email,
      phone: `${selectedCountryCode}${localPhone}`, // Full phone with code

      collect_slot: pickupSlotText,
      delivery_slot: deliverySlotText,

      notes: notes.trim() || null,
      images: []
    };
  }, [
    selectedCollectSlot,
    selectedDeliverSlot,
    collectDate,
    deliverDate,
    userToken,
    pickupAddresses,
    selectedPickupAddressId,
    useSameAddress,
    addressForm,
    pickupAddressForm,
    geoData,
    pickupGeoData,
    deliveryGeoData,
    addressDetails,
    deliveryAddressForm,
    deliveryAddressDetails,
    notes,
    userInfo,
    selectedCountryCode,
    localPhone
  ]);

  /* ------------------------- Profile Update (for logged-in users) ------------------------- */
  // Update this function inside QuickBooking.jsx (around line 1250)

const updateProfileField = useCallback(async (field, value) => {
  if (!userToken) return;

  try {
    const response = await fetch(`${API_BASE}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ [field]: value }),
    });

    if (!response.ok) {
      // Try to parse error as JSON, fallback to text
      let errorMessage;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const err = await response.json();
        errorMessage = err.message || `Failed to update ${field}`;
      } else {
        // For 500 errors, provide a generic message
        errorMessage = `Could not update ${field}. Please try again later.`;
      }

      if (response.status === 401) {
        // Token invalid – clear it
        localStorage.removeItem("jwtToken");
        setUserToken(null);
        showToast("Session expired. Please log in again.", "warning");
        return;
      }

      throw new Error(errorMessage);
    }

    showToast(`${field} updated successfully`, "success");
  } catch (error) {
    console.error(`Error updating ${field}:`, error);
    showToast(error.message, "error");
  }
}, [userToken, showToast]);

  // Debounced profile update for name/email
  const debouncedProfileUpdate = useRef({});
  const triggerProfileUpdate = (field, value) => {
    if (debouncedProfileUpdate.current[field]) {
      clearTimeout(debouncedProfileUpdate.current[field]);
    }
    debouncedProfileUpdate.current[field] = setTimeout(() => {
      updateProfileField(field, value);
    }, 1000);
  };

  // Handlers for name/email (update local state + debounced backend)
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setUserInfo((prev) => ({ ...prev, name: newName }));
    if (userToken) {
      triggerProfileUpdate("name", newName);
    }
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setUserInfo((prev) => ({ ...prev, email: newEmail }));
    if (userToken) {
      triggerProfileUpdate("email", newEmail);
    }
  };

  // Phone change handler
  const handlePhoneChange = (e) => {
    const newLocal = e.target.value;
    setLocalPhone(newLocal);
    const fullPhone = `${selectedCountryCode}${newLocal}`;
    setUserInfo((prev) => ({ ...prev, phone: fullPhone }));

    if (phoneCheckTimeoutRef.current) {
      clearTimeout(phoneCheckTimeoutRef.current);
    }

    if (newLocal.trim().length >= 5) {
      phoneCheckTimeoutRef.current = setTimeout(() => {
        if (userToken) {
          // Logged in: update profile
          updateProfileField("phone", fullPhone);
        } else {
          // Not logged in: check if phone exists
          checkPhoneNumberExists(fullPhone);
        }
      }, 1000);
    }
  };

  // Country code change
  const handleCountryCodeChange = (e) => {
    const newCode = e.target.value;
    setSelectedCountryCode(newCode);
    const fullPhone = `${newCode}${localPhone}`;
    setUserInfo((prev) => ({ ...prev, phone: fullPhone }));

    if (userToken && localPhone.trim().length >= 5) {
      if (phoneCheckTimeoutRef.current) clearTimeout(phoneCheckTimeoutRef.current);
      phoneCheckTimeoutRef.current = setTimeout(() => {
        updateProfileField("phone", fullPhone);
      }, 1000);
    } else if (!userToken && localPhone.trim().length >= 5) {
      if (phoneCheckTimeoutRef.current) clearTimeout(phoneCheckTimeoutRef.current);
      phoneCheckTimeoutRef.current = setTimeout(() => {
        checkPhoneNumberExists(fullPhone);
      }, 1000);
    }
  };

  /* ------------------------- NEW: Referral Booking Flow ---------------------------- */
  const handleReferralBooking = async () => {
  if (bookingInProgress) return;
  setBookingInProgress(true);
  setLoading(true);

  try {
    // Validate addresses (same as in handleConfirmBooking)
    if (useSameAddress) {
      if (userToken && selectedAddressId) {
        // using saved address → skip geo check
      } else {
        if (!geoData.latitude || !geoData.longitude) {
          throw new Error("Please select address from suggestions");
        }
      }
    } else {
      if (!deliveryGeoData.latitude || !deliveryGeoData.longitude) {
        throw new Error("Please select delivery address from suggestions");
      }
      if (!pickupGeoData.latitude || !pickupGeoData.longitude) {
        throw new Error("Please select pickup address from suggestions");
      }
    }

    // Ensure user exists (get token)
    let token = userToken || localStorage.getItem("jwtToken");
    if (!token) {
      token = await ensureUserExists();
      if (!token) throw new Error("Failed to authenticate. Please try again.");
    }

    // Save addresses if user is logged in and opted to save them
    if (userToken && !useSameAddress && saveDeliveryAddress) {
      const newAddressId = await saveNewAddress({
        street_address: addressForm.street_address,
        postcode: addressForm.postcode,
        city: addressForm.city,
        additional_details: addressDetails,
        house_number: deliveryGeoData.house_number,
      }, 'delivery');
      if (!newAddressId) {
        throw new Error("Failed to save delivery address. Please try again.");
      }
      setSelectedAddressId(String(newAddressId));
    }

    if (userToken && !useSameAddress && savePickupAddress && showPickupAddressForm) {
      const newPickupId = await saveNewAddress({
        street_address: pickupAddressForm.street_address,
        postcode: pickupAddressForm.postcode,
        city: pickupAddressForm.city,
        additional_details: "",
        house_number: pickupGeoData.house_number,
      }, 'pickup');
      if (!newPickupId) {
        throw new Error("Failed to save pickup address. Please try again.");
      }
      setSelectedPickupAddressId(String(newPickupId));
    }

    const order = prepareOrderData();
    if (!order) throw new Error("Please select pickup and delivery times");

    // Build payload with referral code – only include address_id if it exists
    const payload = {
      ...order,
      referral_code: "IB100",
    };
    if (selectedAddressId) {
      payload.address_id = selectedAddressId;
    }

    const response = await fetch(`${API_BASE}/quick-booking`, {
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

    showToast("Booking confirmed successfully with referral!", "success");

    navigate("/thankyou", {
      state: {
        orderId: data.order?.id,
        paymentStatus: "referral",
        paymentMethod: "referral_code",
        pickupDate: formatDateDDMMYYYY(collectDate),
        pickupTime: formatTimeRange24Hour(selectedCollectSlot.start, selectedCollectSlot.end),
        deliveryDate: formatDateDDMMYYYY(deliverDate),
        deliveryTime: formatTimeRange24Hour(selectedDeliverSlot.start, selectedDeliverSlot.end),
      }
    });
  } catch (error) {
    console.error(error);
    showToast(error.message || "Referral booking failed", "error");
  } finally {
    setLoading(false);
    setBookingInProgress(false);
  }
};

  /* ------------------------- Main Booking Flow ---------------------------- */
  const handleConfirmBooking = async () => {
    if (bookingInProgress) return;

    setBookingInProgress(true);
    setLoading(true);

    try {
      // Validate pickup address
      if (useSameAddress) {
        if (userToken && selectedAddressId) {
          // using saved address → skip geo check
        } else {
          if (!geoData.latitude || !geoData.longitude) {
            throw new Error("Please select address from suggestions");
          }
        }
      } else {
        if (!deliveryGeoData.latitude || !deliveryGeoData.longitude) {
          throw new Error("Please select delivery address from suggestions");
        }
        if (!pickupGeoData.latitude || !pickupGeoData.longitude) {
          throw new Error("Please select pickup address from suggestions");
        }
      }

      const order = prepareOrderData();
      if (!order) throw new Error("Please select pickup and delivery times");

      setPendingBookingData(order);

      // Ensure we have a valid token (create/retrieve if guest)
      let token = userToken || localStorage.getItem("jwtToken");
      if (!token) {
        token = await ensureUserExists();
        if (!token) throw new Error("Failed to authenticate. Please try again.");
      }

      await initiateStripeSetup(token, customerId);
    } catch (error) {
      showToast(error.message || "Booking failed", "error");
    } finally {
      setLoading(false);
      setBookingInProgress(false);
    }
  };

  // Handle saved card booking for logged-in users with saved cards
  const handleSavedCardBooking = async () => {
    if (!selectedCard) {
      showToast("Please select a saved card", "error");
      return;
    }

    setLoading(true);

    try {
      // Ensure we have a valid token (should already exist for logged-in)
      let token = userToken || localStorage.getItem("jwtToken");
      if (!token) {
        token = await ensureUserExists();
        if (!token) throw new Error("Authentication required");
      }

      // Same address saving logic as above
      if (userToken && !useSameAddress && saveDeliveryAddress) {
        const newAddressId = await saveNewAddress({
          street_address: addressForm.street_address,
          postcode: addressForm.postcode,
          city: addressForm.city,
          additional_details: addressDetails,
          house_number: deliveryGeoData.house_number,
        }, 'delivery');
        if (!newAddressId) {
          throw new Error("Failed to save delivery address. Please try again.");
        }
        setSelectedAddressId(String(newAddressId));
      }

      if (userToken && !useSameAddress && savePickupAddress && showPickupAddressForm) {
        const newPickupId = await saveNewAddress({
          street_address: pickupAddressForm.street_address,
          postcode: pickupAddressForm.postcode,
          city: pickupAddressForm.city,
          additional_details: "",
          house_number: pickupGeoData.house_number,
        }, 'pickup');
        if (!newPickupId) {
          throw new Error("Failed to save pickup address. Please try again.");
        }
        setSelectedPickupAddressId(String(newPickupId));
      }

      const selectedCardData = savedCards.find(
        card => card.payment_method_id === selectedCard
      );
      if (!selectedCardData) {
        throw new Error("Selected card not found");
      }

      const order = prepareOrderData();
      if (!order) throw new Error("Please select pickup and delivery times");

      const payload = {
        ...order,
        address_id: selectedAddressId,
        payment_method_id: selectedCardData.payment_method_id,
        stripe_customer_id: customerId
      };

      const response = await fetch(`${API_BASE}/quick-booking`, {
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

      showToast("Booking confirmed successfully!", "success");

      navigate("/thankyou", {
        state: {
          orderId: data.order?.id,
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

  // Handle "Use Another Card" for logged-in users
  const handleUseAnotherCard = async () => {
    try {
      const token = userToken || localStorage.getItem("jwtToken");
      if (!token) throw new Error("Authentication required");

      const order = prepareOrderData();
      if (!order) throw new Error("Please complete booking details");

      setPendingBookingData(order);

      await initiateStripeSetup(token, customerId);
    } catch (err) {
      showToast(err.message || "Failed to setup card", "error");
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
    if (!pendingBookingData) throw new Error("Booking data missing");

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
        body: JSON.stringify({
          customerId,
          paymentMethodId,
        }),
      });
    }

    // Build order payload – only include address_id if it exists
    const orderPayload = {
      ...pendingBookingData,
      payment_method_id: paymentMethodId,
      stripe_customer_id: customerId
    };
    if (selectedAddressId) {
      orderPayload.address_id = selectedAddressId;
    }

    const response = await fetch(`${API_BASE}/quick-booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(orderPayload),
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
          orderId: data.order?.id,
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

    showToast(
      "Booking not confirmed. Please complete card setup to confirm your booking.",
      "warning"
    );
  };

  /* ---------------------------- DELETE CARD FUNCTIONALITY ---------------------------- */
  const handleDeleteCard = async (paymentMethodId) => {
    if (!window.confirm("Are you sure you want to delete this card?")) return;

    try {
      const token = userToken || localStorage.getItem("jwtToken");
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE}/remove-card`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethodId
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete card");
      }

      // ✅ Remove card from UI
      const updatedCards = savedCards.filter(
        card => card.payment_method_id !== paymentMethodId
      );

      setSavedCards(updatedCards);

      // ✅ Reset selected card if deleted
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

  const handleSaveAddress = async () => {
    try {
      const token = userToken || localStorage.getItem("jwtToken");
      if (!token) {
        showToast("Please login to save address", "error");
        return;
      }
 
      if (!addressForm.street_address || !addressForm.postcode) {
        showToast("Please enter a valid address", "error");
        return;
      }
 
      // Prevent duplicates
      const normalize = (v) => v?.replace(/\s/g, "").toLowerCase();
      const existing = addresses.find(
        (addr) =>
          normalize(addr.postcode) === normalize(addressForm.postcode)
      );
 
      if (existing) {
        showToast("Address already saved", "info");
        setSelectedAddressId(String(existing.address_id));
        setShowAddressForm(false);
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
          full_address: addressForm.street_address,
          additional_details: addressDetails || "",
          pincode: addressForm.postcode || "",
          latitude: geoData.latitude,
          longitude: geoData.longitude,
          house_number: geoData.house_number || "",
          street_name: geoData.street_name || "",
          postcode: addressForm.postcode || ""
        }),
      });
 
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to save address");
      }
 
      const data = await response.json();
 
      showToast("Address saved successfully", "success");
 
      await fetchAddresses();
 
      setSelectedAddressId(String(data.address_id));
      setShowAddressForm(false);
    } catch (error) {
      console.error(error);
      showToast(error.message || "Failed to save address", "error");
    }
  };

  /* ---------------------------- UI Handlers ------------------------------- */
  
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
      setPickupAddressForm({
        street_address: addressForm.street_address,
        postcode: addressForm.postcode,
        city: addressForm.city,
        additional_details: addressForm.additional_details,
        house_number: addressForm.house_number
      });

      setPickupGeoData({ ...geoData });
    }
  };

  const handlePickupAddressSelect = (addressId) => {
    if (addressId === "new") {
      setShowPickupAddressForm(true);
      setSelectedPickupAddressId("new");
    } else {
      setSelectedPickupAddressId(addressId);
      setShowPickupAddressForm(false);
    }
  };

  const handleAddAddressClick = () => {
    setShowAddressForm(true);
    setSaveDeliveryAddress(false); // reset save flag

    if (useSameAddress) {
      setSelectedPickupAddressId(null);
    }

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

  useEffect(() => {
  if (!window.google || !addressInputRef.current) return;

  const autocomplete = new window.google.maps.places.Autocomplete(
    addressInputRef.current,
    {
      types: ["address"],
      componentRestrictions: { country: "gb" }
    }
  );

  const listener = autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) return;

    let street = "";
    let houseNumber = "";
    let postcode = "";
    let city = "";

    place.address_components.forEach(component => {
      if (component.types.includes("route")) {
        street = component.long_name;
      }
      if (component.types.includes("street_number")) {
        houseNumber = component.long_name;
      }
      if (component.types.includes("postal_code")) {
        postcode = component.long_name;
      }
      if (component.types.includes("postal_town")) {
        city = component.long_name;
      }
    });

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setGeoData({
      latitude: lat,
      longitude: lng,
      street_name: street,
      house_number: houseNumber
    });

    setAddressForm(prev => ({
      ...prev,
      street_address: place.formatted_address,
      postcode: postcode,
      city: city,
      house_number: houseNumber
    }));
  });

  return () => {
    if (window.google && window.google.maps && window.google.maps.event) {
      window.google.maps.event.removeListener(listener);
    }
  };
}, []);

useEffect(() => {
  // Only run if delivery address input exists AND we are not using same address
  if (!window.google || !deliveryAddressInputRef.current || useSameAddress) return;

  const autocomplete = new window.google.maps.places.Autocomplete(
    deliveryAddressInputRef.current,
    {
      types: ["address"],
      componentRestrictions: { country: "gb" }
    }
  );

  const listener = autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    let street = "";
    let house = "";

    place.address_components.forEach(component => {
      if (component.types.includes("route")) street = component.long_name;
      if (component.types.includes("street_number")) house = component.long_name;
    });

    setDeliveryGeoData({
      latitude: lat,
      longitude: lng,
      street_name: street,
      house_number: house
    });

    setAddressForm(prev => ({
      ...prev,
      street_address: place.formatted_address,
      postcode:
        place.address_components.find(c =>
          c.types.includes("postal_code")
        )?.long_name || ""
    }));
  });

  return () => {
    if (window.google && window.google.maps && window.google.maps.event) {
      window.google.maps.event.removeListener(listener);
    }
  };
}, [useSameAddress]); // Re-run when toggle changes
  useEffect(() => {
  // Only run if pickup input exists, not using same address, and pickup form is shown
  if (!window.google || !pickupAddressInputRef.current || useSameAddress || !showPickupAddressForm) return;

  const autocomplete = new window.google.maps.places.Autocomplete(
    pickupAddressInputRef.current,
    {
      types: ["address"],
      componentRestrictions: { country: "gb" }
    }
  );

  const listener = autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    let street = "";
    let house = "";

    place.address_components.forEach(component => {
      if (component.types.includes("route")) street = component.long_name;
      if (component.types.includes("street_number")) house = component.long_name;
    });

    setPickupGeoData({
      latitude: lat,
      longitude: lng,
      street_name: street,
      house_number: house
    });

    setPickupAddressForm(prev => ({
      ...prev,
      street_address: place.formatted_address,
      postcode:
        place.address_components.find(c =>
          c.types.includes("postal_code")
        )?.long_name || ""
    }));
  });

  return () => {
    if (window.google && window.google.maps && window.google.maps.event) {
      window.google.maps.event.removeListener(listener);
    }
  };
}, [useSameAddress, showPickupAddressForm]); // Re-run when these change

  useEffect(() => {
    if (collectDate) {
      const timer = setTimeout(() => {
        fetchCollectSlots();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [collectDate, fetchCollectSlots]);

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

  const minDeliveryDate = collectDate || today;

  const isBookingValid = () => {
    if (!userInfo.name.trim()) return false;
    if (!userInfo.email.trim()) return false;
    if (!userInfo.phone.trim()) return false;
    if (!selectedCollectSlot || !selectedDeliverSlot) return false;
    
    if (userToken && addresses.length > 0 && !showAddressForm) {
      if (!selectedAddressId) return false;
    } else {
      if (!addressForm.street_address.trim()) return false;
      if (!addressForm.postcode.trim()) return false;
      if (useSameAddress) {
        if (!geoData.latitude || !geoData.longitude) return false;
      } else {
        if (!deliveryGeoData.latitude || !deliveryGeoData.longitude) return false;
      }
    }
    
    if (!useSameAddress) {
      if (userToken) {
        if (!selectedPickupAddressId) return false;
        if (selectedPickupAddressId === "new" && showPickupAddressForm) {
          if (!pickupAddressForm.street_address.trim() || !pickupAddressForm.postcode.trim()) return false;
          if (!pickupGeoData.latitude || !pickupGeoData.longitude) return false;
        }
      } else {
        if (!pickupAddressForm.street_address.trim() || !pickupAddressForm.postcode.trim()) return false;
        if (!pickupGeoData.latitude || !pickupGeoData.longitude) return false;
      }
    }

    return true;
  };

  const geocodeAddress = (placeId) => {
    if (!window.google || !placeId) return;

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ placeId: placeId }, (results, status) => {
      if (status !== "OK" || !results[0]) return;

      const result = results[0];

      const lat = result.geometry.location.lat();
      const lng = result.geometry.location.lng();

      let postcode = "";
      let house = "";
      let street = "";
      let city = "";

      result.address_components.forEach((c) => {
        if (c.types.includes("postal_code")) {
          postcode = c.long_name;
        }
        if (c.types.includes("street_number")) {
          house = c.long_name;
        }
        if (c.types.includes("route")) {
          street = c.long_name;
        }
        if (c.types.includes("postal_town")) {
          city = c.long_name;
        }
      });

      if (useSameAddress) {
        setGeoData({
          latitude: lat,
          longitude: lng,
          street_name: street,
          house_number: house
        });
      } else {
        setDeliveryGeoData({
          latitude: lat,
          longitude: lng,
          street_name: street,
          house_number: house
        });
      }

      setAddressForm(prev => ({
        ...prev,
        street_address: result.formatted_address,
        postcode: postcode,
        house_number: house,
        city: city
      }));
    });
  };

  useEffect(() => {
    if (selectedPostcodeAddress) {
      geocodeAddress(selectedPostcodeAddress);
    }
  }, [selectedPostcodeAddress]);

  useEffect(() => {
  return () => {
    if (phoneCheckTimeoutRef.current) {
      clearTimeout(phoneCheckTimeoutRef.current);
    }
  };
}, []);

  /* ------------------------- Unified Booking Action ---------------------- */
  const handleBookingAction = () => {
    if (referralCode === "IB100") {
      handleReferralBooking();
    } else {
      if (userToken && savedCards.length > 0) {
        handleSavedCardBooking();
      } else {
        handleConfirmBooking();
      }
    }
  };

  /* ------------------------------ Render ---------------------------------- */
  
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
            Book Laundry Service
          </h1>
          <p className="qb-subtitle">
            Fill in your details, choose pickup & delivery times, and we'll handle the rest
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
            {/* Name */}
            <div className="qb-form-group" style={{ position: "relative" }}>
              {guideStep === 1 && (
                <div className="qb-guide">Enter your full name</div>
              )}
              <label className="qb-form-label">
                <i className="fas fa-user-tag"></i>
                Full Name
                <input
                  type="text"
                  className="qb-form-input"
                  value={userInfo.name}
                  onChange={handleNameChange}
                  placeholder="John Smith"
                  required
                />
              </label>
            </div>

            {/* Email */}
            <div className="qb-form-group" style={{ position: "relative" }}>
              {guideStep === 2 && (
                <div className="qb-guide-tooltip">Enter your email address</div>
              )}
              <label className="qb-form-label">
                <i className="fas fa-envelope"></i>
                Email Address
                <input
                  type="email"
                  className="qb-form-input"
                  value={userInfo.email}
                  onChange={handleEmailChange}
                  placeholder="john@example.com"
                  required
                />
              </label>
            </div>

            {/* Phone with country code */}
            <div className="qb-phone-group" style={{ position: "relative" }}>
              {guideStep === 3 && (
                <div className="qb-guide-tooltip">Enter your phone number</div>
              )}
              <select
                className="qb-country-code"
                value={selectedCountryCode}
                onChange={handleCountryCodeChange}
              >
                {countryCodes.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                className="qb-form-input"
                value={localPhone}
                onChange={handlePhoneChange}
                placeholder="Phone Number"
                required
              />
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
              <h2 className="qb-section-title">Pickup Address</h2>
              <p className="qb-section-subtitle">Where should we collect your laundry?</p>
            </div>
          </div>

          {/* ---------- Logged-in user with saved addresses ---------- */}
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
                    >
                      <div className="qb-address-option-content" onClick={() => {
                        const id = String(addr.address_id);
                        setSelectedAddressId(id);
                        if (useSameAddress) {
                          setSelectedPickupAddressId(id);
                        }
                      }}>
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
                      </div>
                      {/* Delete button */}
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

                  {/* ADD NEW ADDRESS */}
                  <div className="qb-add-address-option" onClick={handleAddAddressClick}>
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

              {/* Toggle: Same Address or Different */}
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
            /* ---------- Manual Address Form (Guest or Adding New) ---------- */
            <div className="qb-address-form-section">
              <div className="qb-form-grid">
                <div className="qb-form-group">
                  <label className="qb-form-label">
                    Postcode *
                    <input
                      type="text"
                      className="qb-form-input"
                      value={postcode}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        setPostcode(value);
                      }}
                      placeholder="SW1A2AA"
                    />
                  </label>
                </div>

                <div className="qb-form-group">
                  <label className="qb-form-label">
                    Select Address *
                    <select
                      className="qb-form-input"
                      value={selectedPostcodeAddress}
                      onChange={(e) => setSelectedPostcodeAddress(e.target.value)}
                    >
                      <option value="">Select address</option>
                      {postcodeAddresses.map((addr, index) => (
                        <option key={index} value={addr.place_id}>
                          {addr.full}
                        </option>
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
                      value={addressDetails}
                      onChange={(e) => setAddressDetails(e.target.value)}
                    />
                  </label>
                </div>
              </div>

              {/* Save address checkbox for logged-in users */}
              {userToken && (
                <div className="qb-save-address-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={saveDeliveryAddress}
                      onChange={(e) => setSaveDeliveryAddress(e.target.checked)}
                    />
                    <span>Save this address to my account for future bookings</span>
                  </label>
                </div>
              )}
              {/* Save Address Button */}
              {userToken && saveDeliveryAddress && (
                <div style={{ marginTop: "12px" }}>
                  <button
                    type="button"
                    className="qb-primary-btn"
                    onClick={handleSaveAddress}
                  >
                    <i className="fas fa-save"></i>
                    Save Address
                  </button>
                </div>
              )}

              {userToken && addresses.length > 0 && showAddressForm && (
                <button className="qb-secondary-btn" onClick={() => setShowAddressForm(false)}>
                  <i className="fas fa-arrow-left"></i>
                  Back to Saved Addresses
                </button>
              )}

              {/* Toggle shown for Guest users or when manually adding new address */}
              {(!userToken || showAddressForm) && (
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

          {/* ------------ DELIVERY ADDRESS (ONLY IF DIFFERENT) ------------ */}
          {!useSameAddress && (
            <div className="qb-address-section" style={{ marginTop: "24px" }}>
              <h3 className="qb-address-section-title">
                <i className="fas fa-truck"></i>
                Delivery Address
                <span className="qb-required-badge">Required</span>
              </h3>

              <div className="qb-form-grid">
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
                      onChange={(e) =>
                        setSelectedDeliveryPostcodeAddress(e.target.value)
                      }
                    >
                      <option value="">Select address</option>
                      {deliveryPostcodeAddresses.map((addr, index) => (
                        <option key={index} value={addr.place_id}>
                          {addr.full}
                        </option>
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
                      onChange={(e) =>
                        setDeliveryAddressDetails(e.target.value)
                      }
                    />
                  </label>
                </div>
              </div>

              {userToken && (
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
              )}
            </div>
          )}

          {/* ------------ PICKUP ADDRESS FORM (WHEN DIFFERENT) ------------ */}
          {!useSameAddress && showPickupAddressForm && (
            <div className="qb-address-section" style={{ marginTop: "24px" }}>
              <h3 className="qb-address-section-title">
                <i className="fas fa-map-marker-alt"></i>
                New Pickup Address
                <span className="qb-required-badge">Required</span>
              </h3>

              <div className="qb-form-grid">
                <div className="qb-form-group full-width">
                  <label className="qb-form-label">
                    <i className="fas fa-road"></i>
                    Full Address *
                    <input
                      type="text"
                      ref={pickupAddressInputRef}
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
                      placeholder="Start typing pickup address..."
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
                      onChange={(e) =>
                        setPickupAddressForm(prev => ({
                          ...prev,
                          postcode: e.target.value
                        }))
                      }
                      required
                    />
                  </label>
                </div>
              </div>

              {/* Save pickup address checkbox */}
              {userToken && (
                <div className="qb-save-address-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={savePickupAddress}
                      onChange={(e) => setSavePickupAddress(e.target.checked)}
                    />
                    <span>Save this pickup address to my account</span>
                  </label>
                </div>
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

            {/* ---------- NEW: Referral Code Input ---------- */}
            <div className="qb-referral-section" style={{ marginBottom: "20px", padding: "15px", background: "#f9f9f9", borderRadius: "8px" }}>
              <label className="qb-form-label" style={{ fontWeight: "bold" }}>
                <i className="fas fa-gift"></i> Referral Code (Optional)
              </label>
              <input
                type="text"
                className="qb-form-input"
                placeholder="Enter code "
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase().trim())}
                style={{ marginTop: "5px" }}
              />
              {referralCode === "IB100" && (
                <div style={{ marginTop: "8px", color: "#28a745", fontSize: "0.9rem" }}>
                  <i className="fas fa-check-circle"></i> Referral code applied – payment will be skipped.
                </div>
              )}
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
                    <i className="fas fa-credit-card"></i>
                    Your Saved Cards
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
                              <i className="fas fa-check-circle"></i>
                              Default Card
                            </div>
                          )}
                        </div>
                        {selectedCard === card.payment_method_id && (
                          <div className="qb-card-selected">
                            <i className="fas fa-check-circle"></i>
                          </div>
                        )}
                        {/* Delete button */}
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
                    disabled={!isBookingValid() || loading || setupProcessing || bookingInProgress || referralCode === "IB100"}
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
                    disabled={!isBookingValid() || loading || setupProcessing || bookingInProgress || referralCode === "IB100"}
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
                onClick={handleBookingAction}
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
