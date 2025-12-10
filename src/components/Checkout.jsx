import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

const API_BASE = "https://api.ironingboy.com";
const STORAGE_KEY = "ironboy_cart";

const Checkout = () => {
  const navigate = useNavigate();

  // ---------------- CART ----------------
  const [cartItems, setCartItems] = useState([]);

  const loadCart = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  };

const [selectedDate, setSelectedDate] = useState(null);


  useEffect(() => {
    setCartItems(Object.values(loadCart()));
  }, []);

  const totalAmount = cartItems.reduce((sum, i) => sum + i.qty * i.price, 0);
  const [currentMonth, setCurrentMonth] = useState(new Date());

const generateCalendar = (month) => {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const days = [];

  // Leading empty days
  for (let i = 0; i < first.getDay(); i++) {
    days.push({ date: "", isCurrentMonth: false });
  }

  // Actual days
  for (let d = 1; d <= last.getDate(); d++) {
    const dateObj = new Date(month.getFullYear(), month.getMonth(), d);
    days.push({
      date: d,
      fullDate: dateObj,
      isCurrentMonth: true,
      isToday:
        dateObj.toDateString() === new Date().toDateString(),
    });
  }

  return days;
};

const calendarDays = generateCalendar(currentMonth);

const handleDatePickedCustom = (dateObj) => {
  setSelectedDate(dateObj);

  const iso = dateObj.toISOString().split("T")[0];
  handleDatePicked({ target: { value: iso } });
};



  // ---------------- USER ----------------
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("ironboy_user");
    if (!u) {
      navigate("/");
      return;
    }
    setUser(JSON.parse(u));
  }, []);

  // ---------------- ADDRESS ----------------
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [pickupAddress, setPickupAddress] = useState(null);
  const [sameAddress, setSameAddress] = useState(true);

  const fetchAddresses = async () => {
    try {
      const token = user.token;

      const res = await fetch(`${API_BASE}/addresses`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      setAddresses(json);

      if (json.length > 0) {
        const selected = json.find((a) => a.is_selected === true);
        const a = selected ?? json[0];
        const id = a.address_id.toString();

        setDeliveryAddress(id);
        setPickupAddress(id);
      }

      setLoadingAddresses(false);
    } catch {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  const updateAddressSelection = async (id) => {
    try {
      const token = user.token;
      await fetch(`${API_BASE}/addresses/select/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {}
  };

  // ---------------- SLOT SYSTEM ----------------
  const [collectDate, setCollectDate] = useState("");
  const [deliverDate, setDeliverDate] = useState("");

  const [collectSlot, setCollectSlot] = useState("");
  const [deliverSlot, setDeliverSlot] = useState("");

  const [slotType, setSlotType] = useState(""); // "collect" or "deliver"
  const [slotList, setSlotList] = useState([]);

  const [showDateModal, setShowDateModal] = useState(false);
  const [showSlotSheet, setShowSlotSheet] = useState(false);

  // ---------------- GENERATE TIME SLOTS ----------------
  const generateTimeSlots = (dateObj, isCollect) => {
    const slots = [];
    const now = new Date();

    for (let h = 9; h < 19; h++) {
      const start = new Date(dateObj);
      start.setHours(h);

      if (isCollect && dateObj.toDateString() === now.toDateString() && start < now) {
        continue;
      }

      const startH = h % 12 || 12;
      const endH = (h + 2) % 12 || 12;

      const startPeriod = h < 12 ? "AM" : "PM";
      const endPeriod = (h + 2) < 12 ? "AM" : "PM";

      slots.push(`${startH} ${startPeriod} – ${endH} ${endPeriod}`);
    }

    return slots;
  };

  // ---------------- OPEN DATE PICKER ----------------
  const openSlotSelector = (type) => {
    setSlotType(type);
    setShowDateModal(true);
  };

  // ---------------- DATE SELECTED ----------------
  const handleDatePicked = (e) => {
    const selected = e.target.value; // YYYY-MM-DD

    if (!selected) return;

    const dateObj = new Date(selected);

    // Delivery must be after collect
    if (slotType === "deliver" && collectDate) {
      const collectObj = new Date(collectDate);
      if (dateObj <= collectObj) {
        alert("Delivery date must be after collection date");
        return;
      }
    }

    if (slotType === "collect") setCollectDate(selected);
    else setDeliverDate(selected);

    const slots = generateTimeSlots(dateObj, slotType === "collect");

    if (slots.length === 0) {
      alert("No available time slots for this date");
      return;
    }

    setSlotList(slots);
    setShowDateModal(false);
    setShowSlotSheet(true);
  };

  // ---------------- SLOT SELECTED ----------------
  const selectSlot = (slot) => {
    if (slotType === "collect") setCollectSlot(slot);
    else setDeliverSlot(slot);

    setShowSlotSheet(false);
  };

  // ---------------------------------------------------------
  // PROCEED
  // ---------------------------------------------------------
  const proceed = () => {
    if (!collectDate || !collectSlot) {
      alert("Select collection date & slot");
      return;
    }

    if (!deliverDate || !deliverSlot) {
      alert("Select delivery date & slot");
      return;
    }

    navigate("/review-order", {
      state: {
        collect: `${collectDate}, ${collectSlot}`,
        delivery: `${deliverDate}, ${deliverSlot}`,
        deliveryAddressId: deliveryAddress,
        pickupAddressId: sameAddress ? deliveryAddress : pickupAddress,
        useSameAddress: sameAddress,
        items: cartItems,
        total: totalAmount,
      },
    });
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="checkout-page">
      <h2>Checkout</h2>

      {/* CART LIST */}
      <div className="checkout-cart-box">
        {cartItems.map((item) => (
          <div className="checkout-item" key={item.id}>
            <div>
              <h4>{item.name}</h4>
              <p>Qty: {item.qty}</p>
            </div>
            <strong>£{(item.qty * item.price).toFixed(2)}</strong>
          </div>
        ))}

        <div className="checkout-total">
          <strong>Total: £{totalAmount.toFixed(2)}</strong>
        </div>
      </div>

      {/* SLOTS */}
      <h3>My Slot</h3>

      <div className="slot-box" onClick={() => openSlotSelector("collect")}>
        <p>Collect from me</p>
        <span>
          {collectDate && collectSlot
            ? `${collectDate}, ${collectSlot}`
            : "Select date & time"}
        </span>
      </div>

      <div className="slot-box" onClick={() => openSlotSelector("deliver")}>
        <p>Deliver to me</p>
        <span>
          {deliverDate && deliverSlot
            ? `${deliverDate}, ${deliverSlot}`
            : "Select date & time"}
        </span>
      </div>

      {/* ADDRESS SECTION */}
      <h3>Address Details</h3>

      <label className="same-address-toggle">
        <input
          type="checkbox"
          checked={sameAddress}
          onChange={(e) => {
            setSameAddress(e.target.checked);
            if (e.target.checked) setPickupAddress(deliveryAddress);
          }}
        />
        Pickup from same address
      </label>

      {loadingAddresses ? (
        <p>Loading addresses...</p>
      ) : (
        <>
          <h4>Delivery Address</h4>

          {addresses.map((a) => (
            <label key={a.address_id} className="addr-option">
              <input
                type="radio"
                checked={deliveryAddress === a.address_id.toString()}
                onChange={() => {
                  setDeliveryAddress(a.address_id.toString());
                  if (sameAddress) setPickupAddress(a.address_id.toString());
                  updateAddressSelection(a.address_id); // Backend update
                }}
              />
              <span>{a.full_address}</span>
            </label>
          ))}

          {!sameAddress && (
            <>
              <h4>Pickup Address</h4>

              {addresses.map((a) => (
                <label key={a.address_id} className="addr-option">
                  <input
                    type="radio"
                    checked={pickupAddress === a.address_id.toString()}
                    onChange={() => setPickupAddress(a.address_id.toString())}
                  />
                  <span>{a.full_address}</span>
                </label>
              ))}
            </>
          )}
        </>
      )}

      {/* BUTTON */}
      <button className="checkout-proceed-btn" onClick={proceed}>
        Review & Confirm
      </button>

      {/* ---------------- DATE MODAL ---------------- */}
    {showDateModal && (
  <div className="calendar-overlay" onClick={() => setShowDateModal(false)}>
    <div
      className="calendar-sheet"
      onClick={(e) => e.stopPropagation()}
    >
      {/* HEADER */}
      <div className="calendar-header">
        <h3>Select date</h3>
      </div>

      {/* MONTH SWITCH */}
      <div className="calendar-month-bar">
        <button className="nav-btn" onClick={() =>
          setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
        }>
          ‹
        </button>

        <span className="month-title">
          {currentMonth.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </span>

        <button className="nav-btn" onClick={() =>
          setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
        }>
          ›
        </button>
      </div>

      {/* WEEK DAY LABELS */}
      <div className="calendar-grid calendar-week-row">
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <div key={d} className="calendar-week-label">{d}</div>
        ))}
      </div>

      {/* DATES */}
      <div className="calendar-grid">
        {calendarDays.map((d, i) => (
          <div
            key={i}
            className={
              "calendar-cell " +
              (!d.isCurrentMonth ? "calendar-outside " : "") +
              (d.isToday ? "calendar-today " : "") +
              (d.isSelected ? "calendar-selected " : "")
            }
            onClick={() => d.isCurrentMonth && handleDatePickedCustom(d.fullDate)}
          >
            {d.date || ""}
          </div>
        ))}
      </div>

      {/* CANCEL BUTTON */}
      <button className="calendar-cancel-btn" onClick={() => setShowDateModal(false)}>
        Cancel
      </button>
    </div>
  </div>
)}



      {/* ---------------- TIME SLOT BOTTOM SHEET ---------------- */}
      {showSlotSheet && (
        <div className="slot-sheet">
          <div className="sheet-header">
            Select Time Slot for {slotType === "collect" ? "Collection" : "Delivery"}
          </div>

          <div className="slot-scroll">
            {slotList.map((slot, i) => (
              <button key={i} className="slot-chip" onClick={() => selectSlot(slot)}>
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
