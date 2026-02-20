import React, { useState, useEffect, useRef } from "react";
import "./AddAddressModal.css";

export default function AddAddressModal({ open, onClose, onSaved, apiBase, isGuest = false }) {
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [placePredictions, setPlacePredictions] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState({ lat: 51.5074, lng: -0.1278 }); // Default: London
  const [selectedLocation, setSelectedLocation] = useState({ lat: 51.5074, lng: -0.1278 });
  const [isManualEdit, setIsManualEdit] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  
  // User data state (for both logged in and guest users)
  const [userData, setUserData] = useState({
    name: "",
    phone: "",
    email: "",
    loading: false
  });
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const geocoderRef = useRef(null);
  const placesServiceRef = useRef(null);
  
  const [form, setForm] = useState({
    name: "",
    address_type: "home",
    phone: "",
    email: "", // REQUIRED FIELD
    full_address: "",
    house_number: "",
    street_name: "",
    postcode: "",
    pincode: "",
    city: "",
    state: "",
    country: "",
    additional_details: "",
    latitude: "",
    longitude: "",
  });

  const GOOGLE_API_KEY = "AIzaSyD56pnfmwCIdcJ_xerUT75wRxeR71uMPcc";

  // Initialize when modal opens
  useEffect(() => {
    if (open) {
      loadUserData();
      
      if (!window.google) {
        loadGoogleMaps();
      } else if (window.google) {
        setMapLoaded(true);
        initializeMapServices();
      }
    }

    return () => {
      // Cleanup when component unmounts
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [open]);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (mapLoaded && open) {
      initializeMapServices();
      initializeMap();
      getCurrentLocation();
    }
  }, [mapLoaded, open]);

  // Load user data from localStorage or API
  const loadUserData = () => {
    if (isGuest) {
      // For guest users, load from localStorage
      const guestName = localStorage.getItem('guestName') || '';
      const guestPhone = localStorage.getItem('guestPhone') || '';
      const guestEmail = localStorage.getItem('guestEmail') || '';
      
      setUserData({
        name: guestName,
        phone: guestPhone,
        email: guestEmail,
        loading: false
      });

      // Auto-fill form with guest data
      setForm(prev => ({
        ...prev,
        name: guestName,
        phone: guestPhone,
        email: guestEmail
      }));
    } else {
      // For logged in users, try to fetch from API
      fetchUserProfile();
    }
  };

  // Fetch user profile from backend (for logged in users)
  const fetchUserProfile = async () => {
    setUserData(prev => ({ ...prev, loading: true }));
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        console.warn("No JWT token found - user is guest");
        setUserData(prev => ({ ...prev, loading: false }));
        return;
      }

      const response = await fetch(`${apiBase}/profile`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ User profile fetched:", data);
        
        setUserData({
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          loading: false
        });

        // Auto-fill name, phone, and email in form
        setForm(prev => ({
          ...prev,
          name: data.name || prev.name,
          phone: data.phone || prev.phone,
          email: data.email || prev.email
        }));
      } else {
        console.warn("Failed to fetch profile:", response.status);
        setUserData(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserData(prev => ({ ...prev, loading: false }));
    }
  };

  const loadGoogleMaps = () => {
    // Check if script is already loading or loaded
    if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      existingScript.onload = () => {
        console.log("Google Maps loaded from existing script");
        setMapLoaded(true);
      };
      existingScript.onerror = () => {
        console.error("Existing Google Maps script failed to load");
        loadNewGoogleMapsScript();
      };
      return;
    }

    loadNewGoogleMapsScript();
  };

  const loadNewGoogleMapsScript = () => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("✅ Google Maps loaded successfully");
      setMapLoaded(true);
      setMapError(null);
    };
    script.onerror = (error) => {
      console.error("❌ Failed to load Google Maps:", error);
      setMapError("Failed to load Google Maps. Please check your internet connection.");
    };
    document.head.appendChild(script);
  };

  const initializeMapServices = () => {
    if (!window.google || !window.google.maps) {
      console.warn("Google Maps API not available");
      return;
    }

    try {
      // Initialize services
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      geocoderRef.current = new window.google.maps.Geocoder();
      placesServiceRef.current = new window.google.maps.places.PlacesService(document.createElement('div'));
      
      console.log("✅ Google Maps services initialized");
    } catch (error) {
      console.error("Error initializing Google Maps services:", error);
      setMapError("Error initializing map services");
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      console.warn("Map container or Google Maps not available");
      return;
    }

    try {
      const mapOptions = {
        center: selectedLocation,
        zoom: 15,
        streetViewControl: false,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          position: window.google.maps.ControlPosition.TOP_RIGHT
        },
        fullscreenControl: true,
        fullscreenControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_BOTTOM
        },
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_BOTTOM
        },
        gestureHandling: "greedy",
        styles: [
          {
            featureType: "poi.business",
            stylers: [{ visibility: "off" }]
          },
          {
            featureType: "transit",
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }]
          }
        ],
        clickableIcons: false
      };

      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Add click listener for map
      map.addListener("click", handleMapClick);

      // Create initial marker
      markerRef.current = new window.google.maps.Marker({
        position: selectedLocation,
        map: map,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
        title: "Drag to adjust location",
        optimized: false
      });

      // Add dragend listener to marker
      markerRef.current.addListener("dragend", handleMarkerDragEnd);
      
      console.log("✅ Map initialized successfully");
      
    } catch (error) {
      console.error("❌ Error initializing map:", error);
      setMapError("Error initializing map. Please refresh the page.");
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported by browser");
      // Use default location and geocode
      reverseGeocode(51.5074, -0.1278);
      return;
    }

    setIsGeolocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("📍 Current location obtained:", latitude, longitude);
        
        const location = { lat: latitude, lng: longitude };
        setCurrentLocation(location);
        setSelectedLocation(location);
        
        setForm(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }));
        
        // Update map if it exists
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(location);
          mapInstanceRef.current.setZoom(16);
          
          if (markerRef.current) {
            markerRef.current.setPosition(location);
          } else {
            markerRef.current = new window.google.maps.Marker({
              position: location,
              map: mapInstanceRef.current,
              draggable: true,
              animation: window.google.maps.Animation.DROP,
              title: "Drag to adjust location"
            });
            markerRef.current.addListener("dragend", handleMarkerDragEnd);
          }
        }
        
        // Geocode the location to get address
        reverseGeocode(latitude, longitude);
        setIsGeolocating(false);
      },
      (error) => {
        console.warn("Geolocation failed:", error.message);
        // Use default London location
        reverseGeocode(51.5074, -0.1278);
        setIsGeolocating(false);
      },
      { 
        timeout: 10000, 
        enableHighAccuracy: true,
        maximumAge: 0 
      }
    );
  };

  const reverseGeocode = (lat, lng) => {
    if (!geocoderRef.current) {
      console.warn("Geocoder not initialized");
      return;
    }

    geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        const address = results[0];
        console.log("📍 Reverse geocode successful:", address.formatted_address);
        parseAddressComponents(address);
        setSearchInput(address.formatted_address);
      } else {
        console.warn("Reverse geocoding failed:", status);
        // Set basic location info
        setForm(prev => ({
          ...prev,
          full_address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
          city: "",
          country: "",
          postcode: ""
        }));
        setSearchInput(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    });
  };

  const parseAddressComponents = (address) => {
    const components = address.address_components;
    let streetNumber = "";
    let route = "";
    let city = "";
    let state = "";
    let country = "";
    let postalCode = "";
    let neighborhood = "";
    let sublocality = "";
    let administrative_area_level_2 = "";

    components.forEach(component => {
      const types = component.types;
      
      if (types.includes("street_number")) {
        streetNumber = component.long_name;
      }
      if (types.includes("route")) {
        route = component.long_name;
      }
      if (types.includes("locality")) {
        city = component.long_name;
      }
      if (types.includes("postal_town") && !city) {
        city = component.long_name;
      }
      if (types.includes("administrative_area_level_1")) {
        state = component.long_name;
      }
      if (types.includes("country")) {
        country = component.long_name;
      }
      if (types.includes("postal_code")) {
        postalCode = component.long_name;
      }
      if (types.includes("neighborhood")) {
        neighborhood = component.long_name;
      }
      if (types.includes("sublocality")) {
        sublocality = component.long_name;
      }
      if (types.includes("administrative_area_level_2")) {
        administrative_area_level_2 = component.long_name;
      }
    });

    // Use sublocality if city not found
    if (!city && sublocality) {
      city = sublocality;
    }
    if (!city && administrative_area_level_2) {
      city = administrative_area_level_2;
    }

    setForm(prev => ({
      ...prev,
      full_address: address.formatted_address,
      house_number: streetNumber,
      street_name: route || neighborhood || "",
      city: city || "",
      state: state || "",
      country: country || "",
      postcode: postalCode || "",
      pincode: postalCode || "",
    }));
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    if (!autocompleteServiceRef.current || value.length < 3) {
      setPlacePredictions([]);
      return;
    }

    try {
      autocompleteServiceRef.current.getPlacePredictions(
        { 
          input: value, 
          types: ['address', 'establishment', 'geocode'],
          componentRestrictions: { country: ['uk', 'gb', 'ie'] } // UK and Ireland
        },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setPlacePredictions(predictions.slice(0, 6)); // Limit to 6 predictions
          } else {
            setPlacePredictions([]);
          }
        }
      );
    } catch (error) {
      console.error("Autocomplete error:", error);
      setPlacePredictions([]);
    }
  };

  const handlePlaceSelect = (placeId) => {
    if (!placesServiceRef.current) return;

    placesServiceRef.current.getDetails({ 
      placeId: placeId,
      fields: ['formatted_address', 'geometry', 'address_components', 'name', 'place_id']
    }, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        const location = place.geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        console.log("📍 Place selected:", place.formatted_address);
        
        setSelectedPlace(place);
        setSelectedLocation({ lat, lng });
        setIsManualEdit(false);
        
        setForm(prev => ({
          ...prev,
          full_address: place.formatted_address,
          latitude: lat.toString(),
          longitude: lng.toString()
        }));
        
        parseAddressComponents(place);
        setPlacePredictions([]);
        setSearchInput(place.formatted_address);
        
        // Update map and marker
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat, lng });
          mapInstanceRef.current.setZoom(17);
          
          if (markerRef.current) {
            markerRef.current.setPosition({ lat, lng });
          } else {
            markerRef.current = new window.google.maps.Marker({
              position: { lat, lng },
              map: mapInstanceRef.current,
              draggable: true,
              animation: window.google.maps.Animation.DROP,
            });
            markerRef.current.addListener("dragend", handleMarkerDragEnd);
          }
        }
      } else {
        console.error("Place details error:", status);
      }
    });
  };

  const handleMarkerDragEnd = (e) => {
    if (!e || !e.latLng) return;
    
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    console.log("📍 Marker dragged to:", lat, lng);
    
    setSelectedLocation({ lat, lng });
    setForm(prev => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString()
    }));
    
    // Reverse geocode the new location
    reverseGeocode(lat, lng);
  };

  const handleMapClick = (e) => {
    if (!e || !e.latLng) return;
    
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    console.log("📍 Map clicked at:", lat, lng);
    
    setSelectedLocation({ lat, lng });
    setForm(prev => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString()
    }));
    
    // Update or create marker
    if (markerRef.current) {
      markerRef.current.setPosition({ lat, lng });
    } else if (mapInstanceRef.current) {
      markerRef.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
      });
      markerRef.current.addListener("dragend", handleMarkerDragEnd);
    }
    
    // Reverse geocode the clicked location
    reverseGeocode(lat, lng);
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
    
    // If user manually edits address fields, mark as manual edit
    if (['full_address', 'house_number', 'street_name', 'city', 'postcode'].includes(field)) {
      setIsManualEdit(true);
    }
    
    // Save guest data to localStorage as they type
    if (isGuest && ['name', 'phone', 'email'].includes(field)) {
      localStorage.setItem(`guest${field.charAt(0).toUpperCase() + field.slice(1)}`, value);
    }
  };

  const handleAddressTypeSelect = (type) => {
    setForm(prev => ({ ...prev, address_type: type }));
  };

  const handleUseCurrentLocation = () => {
    getCurrentLocation();
  };

  // Email validation function
  const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const save = async () => {
    // Enhanced validation
    if (!form.name?.trim()) {
      alert("Please enter your name");
      return;
    }
    if (!form.phone?.trim()) {
      alert("Please enter your phone number");
      return;
    }
    
    // Email is now REQUIRED
    if (!form.email?.trim()) {
      alert("Please enter your email address");
      return;
    }
    
    // Validate email format
    if (!validateEmail(form.email.trim())) {
      alert("Please enter a valid email address");
      return;
    }
    
    if (!form.full_address?.trim()) {
      alert("Please select or enter an address");
      return;
    }
    if (!form.latitude || !form.longitude) {
      alert("Please select a location on the map");
      return;
    }

    // Basic phone validation
    const phoneDigits = form.phone.replace(/\D/g, '');
    if (phoneDigits.length < 5) {
      alert("Please enter a valid phone number with at least 5 digits");
      return;
    }

    setLoading(true);
    try {
      // Prepare address data
      const addressData = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(), // REQUIRED
        address_type: form.address_type,
        full_address: form.full_address.trim(),
        additional_details: form.additional_details?.trim() || "",
        pincode: form.pincode?.trim() || "",
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        house_number: form.house_number?.trim() || "",
        street_name: form.street_name?.trim() || "",
        postcode: form.postcode?.trim() || "",
        city: form.city?.trim() || "",
        state: form.state?.trim() || "",
        country: form.country?.trim() || "",
      };

      console.log("📤 Saving address:", addressData);

      let savedAddress;
      
      if (isGuest) {
        // For guest users, save to localStorage and return local object
        const guestAddresses = JSON.parse(localStorage.getItem('guestAddresses') || '[]');
        const newAddress = {
          ...addressData,
          id: Date.now().toString(),
          address_id: Date.now().toString(),
          is_selected: guestAddresses.length === 0 // First address becomes default
        };
        
        guestAddresses.push(newAddress);
        localStorage.setItem('guestAddresses', JSON.stringify(guestAddresses));
        
        // Save guest email and phone for order creation
        localStorage.setItem('guestEmail', form.email.trim());
        localStorage.setItem('guestPhone', form.phone.trim());
        localStorage.setItem('guestName', form.name.trim());
        
        savedAddress = newAddress;
        console.log("✅ Guest address saved to localStorage:", savedAddress);
      } else {
        // For logged in users, save to API
        const token = localStorage.getItem("jwtToken");
        if (!token) {
          throw new Error("Not authenticated. Please login again.");
        }

        // Update user profile with new email if changed
        if (form.email.trim() !== userData.email && form.email.trim()) {
          console.log("📝 Updating profile email...");
          await updateUserProfile("email", form.email.trim());
        }

        const response = await fetch(`${apiBase}/addresses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(addressData),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || data.error || `Failed to save address (Status: ${response.status})`);
        }
        
        savedAddress = data.address || data;
        console.log("✅ Address saved to API:", savedAddress);
      }

      // Reset form
      setForm({
        name: userData.name || "",
        address_type: "home",
        phone: userData.phone || "",
        email: userData.email || "",
        full_address: "",
        house_number: "",
        street_name: "",
        postcode: "",
        pincode: "",
        city: "",
        state: "",
        country: "",
        additional_details: "",
        latitude: "",
        longitude: "",
      });
      setSearchInput("");
      setPlacePredictions([]);
      setSelectedLocation(currentLocation);
      
      // Call onSaved callback with the saved address
      onSaved(savedAddress);
      onClose();
      
    } catch (error) {
      console.error("❌ Save error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to update user profile (for logged in users)
  const updateUserProfile = async (field, value) => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      console.warn("No JWT token found for profile update");
      return false;
    }

    try {
      const response = await fetch(`${apiBase}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (response.ok) {
        console.log(`✅ ${field} updated successfully`);
        setUserData(prev => ({ ...prev, [field]: value }));
        return true;
      } else {
        console.warn(`Failed to update ${field}:`, response.status);
        return false;
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      return false;
    }
  };

  if (!open) return null;

  const addressTypeIcons = {
    home: "🏠",
    work: "🏢",
    hotel: "🏨",
    others: "📍"
  };

  const addressTypeLabels = {
    home: "Home",
    work: "Office",
    hotel: "Hotel",
    others: "Others"
  };

  // Helper function to display user data loading state
  const renderUserInfo = () => {
    if (userData.loading) {
      return (
        <div className="am-profile-loading">
          <div className="am-spinner-tiny"></div>
          <span>Loading your information...</span>
        </div>
      );
    }
    
    return (
      <div className="am-profile-info">
        <span className="am-profile-note">
          {userData.name || userData.phone ? 
            "Your information loaded. You can edit if needed." : 
            "Please enter your personal details."}
        </span>
        {isGuest && (
          <span className="am-profile-phone-hint">
            Your details will be saved for this session
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="am-backdrop">
      <div className="am-card">
        <div className="am-head">
          <div className="am-title-section">
            <div className="am-icon">📍</div>
            <div>
              <strong>Add New Address</strong>
              <p className="am-subtitle">Select your location and add details</p>
            </div>
          </div>
          <button className="am-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="am-body">
          {/* Location Search Section */}
          <div className="am-section">
            <h3 className="am-section-title">Select Your Location</h3>
            
            <div className="am-search-container">
              <div className="am-search-icon">🔍</div>
              <input
                type="text"
                className="am-search-input"
                placeholder="Search for an address or place..."
                value={searchInput}
                onChange={handleSearchChange}
                disabled={!mapLoaded}
              />
              <button 
                className="am-current-location-btn"
                onClick={handleUseCurrentLocation}
                type="button"
                title="Use current location"
                disabled={isGeolocating || !mapLoaded}
              >
                {isGeolocating ? (
                  <div className="am-spinner-tiny"></div>
                ) : (
                  "📍"
                )}
              </button>
            </div>
            
            {placePredictions.length > 0 && (
              <div className="am-predictions-dropdown">
                {placePredictions.map((prediction) => (
                  <div
                    key={prediction.place_id}
                    className="am-prediction-item"
                    onClick={() => handlePlaceSelect(prediction.place_id)}
                  >
                    <div className="am-prediction-icon">📍</div>
                    <div className="am-prediction-text">
                      <div className="am-prediction-main">{prediction.structured_formatting.main_text}</div>
                      <div className="am-prediction-secondary">{prediction.structured_formatting.secondary_text}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map Container */}
          <div className="am-section">
            <div className="am-map-container">
              <div 
                ref={mapRef} 
                className="am-map"
              >
                {mapError && (
                  <div className="am-map-error">
                    <div className="am-error-icon">⚠️</div>
                    <p>{mapError}</p>
                    <button 
                      className="am-retry-btn"
                      onClick={() => {
                        setMapError(null);
                        loadGoogleMaps();
                      }}
                    >
                      Retry
                    </button>
                  </div>
                )}
                {!mapLoaded && !mapError && (
                  <div className="am-map-loading">
                    <div className="am-spinner"></div>
                    <p>Loading map...</p>
                  </div>
                )}
              </div>
              <div className="am-map-instructions">
                {mapLoaded ? (
                  <>
                    <span className="am-instruction-icon">📍</span>
                    Click on the map or search above to select your location
                    <br />
                    <span className="am-instruction-icon">👆</span>
                    Drag the marker to adjust location precisely
                  </>
                ) : (
                  "Initializing map..."
                )}
              </div>
            </div>
          </div>

          {/* Selected Address Details */}
          <div className="am-section">
            <h3 className="am-section-title">
              Selected Address 
              <span className="am-coordinates">
                ({parseFloat(form.latitude).toFixed(6)}, {parseFloat(form.longitude).toFixed(6)})
              </span>
            </h3>
            <div className="am-form-group">
              <textarea
                className="am-textarea"
                placeholder="Full address will appear here..."
                value={form.full_address}
                onChange={handleChange("full_address")}
                rows="2"
                disabled={!mapLoaded}
              />
              <div className="am-coordinates-display">
                Latitude: {form.latitude || "Not set"} | Longitude: {form.longitude || "Not set"}
              </div>
            </div>
          </div>

          {/* Address Type Selection */}
          <div className="am-section">
            <h3 className="am-section-title">Address Type</h3>
            <div className="am-type-grid">
              {Object.entries(addressTypeIcons).map(([type, icon]) => (
                <button
                  key={type}
                  className={`am-type-btn ${form.address_type === type ? 'active' : ''}`}
                  onClick={() => handleAddressTypeSelect(type)}
                  type="button"
                >
                  <div className="am-type-icon">{icon}</div>
                  <div className="am-type-label">{addressTypeLabels[type]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Personal Details with User Info */}
          <div className="am-section">
            <div className="am-section-header">
              <h3 className="am-section-title">Personal Details</h3>
              {renderUserInfo()}
            </div>
            
            <div className="am-form-group">
              <label>Name *</label>
              <input
                type="text"
                className="am-input"
                placeholder="Enter your name"
                value={form.name}
                onChange={handleChange("name")}
                required
              />
              {userData.name && form.name === userData.name && (
                <div className="am-field-hint">Loaded from your information</div>
              )}
            </div>
            
            <div className="am-form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                className="am-input"
                placeholder="Enter your phone number"
                value={form.phone}
                onChange={handleChange("phone")}
                required
              />
              {userData.phone && form.phone === userData.phone && (
                <div className="am-field-hint">Loaded from your information</div>
              )}
            </div>
            
            <div className="am-form-group">
              <label>Email Address *</label>
              <input
                type="email"
                className="am-input"
                placeholder="Enter your email address"
                value={form.email}
                onChange={handleChange("email")}
                required
              />
              {userData.email && form.email === userData.email && (
                <div className="am-field-hint">Loaded from your information</div>
              )}
              {!userData.email && form.email && (
                <div className="am-field-hint am-field-hint-new">
                  {isGuest ? "Will be saved for this session" : "Will be saved to your profile"}
                </div>
              )}
            </div>
          </div>

          {/* Address Details */}
          <div className="am-section">
            <h3 className="am-section-title">Address Details</h3>
            
            <div className="am-form-row">
              <div className="am-form-group">
                <label>House/Apt Number</label>
                <input
                  type="text"
                  className="am-input"
                  placeholder="House/Apt number"
                  value={form.house_number}
                  onChange={handleChange("house_number")}
                />
              </div>
              
              <div className="am-form-group">
                <label>Street Name</label>
                <input
                  type="text"
                  className="am-input"
                  placeholder="Street name"
                  value={form.street_name}
                  onChange={handleChange("street_name")}
                />
              </div>
            </div>
            
            <div className="am-form-row">
              <div className="am-form-group">
                <label>Postcode</label>
                <input
                  type="text"
                  className="am-input"
                  placeholder="Postal code"
                  value={form.postcode}
                  onChange={handleChange("postcode")}
                />
              </div>
              
              <div className="am-form-group">
                <label>City</label>
                <input
                  type="text"
                  className="am-input"
                  placeholder="City"
                  value={form.city}
                  onChange={handleChange("city")}
                />
              </div>
            </div>
            
            <div className="am-form-row">
              <div className="am-form-group">
                <label>State/County</label>
                <input
                  type="text"
                  className="am-input"
                  placeholder="State/County"
                  value={form.state}
                  onChange={handleChange("state")}
                />
              </div>
              
              <div className="am-form-group">
                <label>Country</label>
                <input
                  type="text"
                  className="am-input"
                  placeholder="Country"
                  value={form.country}
                  onChange={handleChange("country")}
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="am-section">
            <div className="am-form-group">
              <label>Additional Details (Optional)</label>
              <textarea
                className="am-textarea"
                placeholder="Floor, building, landmarks, or special instructions..."
                value={form.additional_details}
                onChange={handleChange("additional_details")}
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="am-footer">
          <button className="am-btn am-btn-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button 
            className="am-btn am-btn-save" 
            onClick={save} 
            disabled={loading || !form.name || !form.phone || !form.email || !form.full_address || !form.latitude || !form.longitude}
          >
            {loading ? (
              <>
                <div className="am-spinner-small"></div>
                Saving...
              </>
            ) : (
              'Save Address'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}