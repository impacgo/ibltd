import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./CategoryDetails.css";

const API_BASE = "http://16.16.68.189:3000";
const STORAGE_KEY = "ironboy_cart";

const CategoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categoryName, setCategoryName] = useState("");
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [showCart, setShowCart] = useState(false);

  const [cartItems, setCartItems] = useState([]);
  const [totalQty, setTotalQty] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // ---------------- CART HELPERS ----------------
  const loadCart = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  };

  const saveCart = (cartObj) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartObj));
    updateCartTotals();
  };

  // ---------------- UPDATE CART TOTALS ----------------
  const updateCartTotals = () => {
    const cart = loadCart();
    const items = Object.values(cart);

    setCartItems(items);
    setTotalQty(items.reduce((s, i) => s + i.qty, 0));
    setTotalAmount(items.reduce((s, i) => s + i.qty * i.price, 0));
  };

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    loadData();
    updateCartTotals();
  }, [id]);

  const loadData = async () => {
    try {
      const catRes = await fetch(`${API_BASE}/categories`);
      const catJson = await catRes.json();
      const cat = (catJson.data || []).find((c) => c.id == id);
      if (cat) setCategoryName(cat.name);

      const prodRes = await fetch(`${API_BASE}/products1`);
      const prodJson = await prodRes.json();
      const list = Array.isArray(prodJson) ? prodJson : prodJson.data;

      const cartMap = loadCart();

      const filtered = list
        .filter((p) => p.category_id == id)
        .map((p) => ({
          ...p,
          price: Number(p.price ?? p.standard_price ?? 0),
          qty: cartMap[p.id]?.qty || 0,
        }));

      setProducts(filtered);
    } catch (e) {
      console.error("Error loading:", e);
    }
  };

  // ---------------- UPDATE QTY ----------------
  const updateQty = (productId, change) => {
    let cart = loadCart();

    const prevQty = cart[productId]?.qty || 0;
    const newQty = Math.max(0, prevQty + change);

    if (newQty === 0) delete cart[productId];
    else {
      const p = products.find((x) => x.id === productId);
      cart[productId] = {
        id: productId,
        name: p.name,
        price: p.price,
        qty: newQty,
      };
    }

    saveCart(cart);

    // Update product list UI
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, qty: newQty } : p
      )
    );

    updateCartTotals();
  };

  // ---------------- UI ----------------
  return (
    <div className="cd-page">
      <div className="cd-container">
        <button className="cd-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <h2 className="cd-title">{categoryName}</h2>

        <input
          type="text"
          className="cd-search"
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {products
          .filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((item) => (
            <div key={item.id} className="cd-card">
              <div className="cd-info">
                <h3>{item.name}</h3>
                <p className="cd-price">£{item.price.toFixed(2)}</p>
              </div>

              <div className="cd-counter">
                <button onClick={() => updateQty(item.id, -1)}>-</button>
                <span>{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)}>+</button>
              </div>
            </div>
          ))}

        {products.length === 0 && <p className="cd-empty">No services found.</p>}
      </div>

      {/* FLOATING CART BUTTON */}
      {totalQty > 0 && (
        <div className="cart-button" onClick={() => setShowCart(true)}>
          <div>{totalQty} items</div>
          <div>View Cart • £{totalAmount.toFixed(2)}</div>
        </div>
      )}

      {/* CART POPUP MODAL */}
      {showCart && (
        <div className="cart-popup-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-popup" onClick={(e) => e.stopPropagation()}>
            <div className="cart-popup-header">
              <h3>Your Cart</h3>
              <button className="cart-popup-close" onClick={() => setShowCart(false)}>
                ✖
              </button>
            </div>

            <div className="cart-popup-content">
              {cartItems.length === 0 ? (
                <p className="cart-popup-empty">Your cart is empty</p>
              ) : (
                <div className="cart-popup-items">
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-popup-item">
                      <div className="cart-popup-item-info">
                        <h4>{item.name}</h4>
                        <p>£{item.price.toFixed(2)} each</p>
                      </div>

                      <div className="cart-popup-counter">
                        <button onClick={() => updateQty(item.id, -1)}>-</button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="cart-popup-footer">
              <div className="cart-popup-total">
                <div className="cart-popup-total-label">Total Amount:</div>
                <div className="cart-popup-total-value">£{totalAmount.toFixed(2)}</div>
              </div>

              <button
                className="cart-popup-checkout-btn"
                onClick={() => {
                  if (cartItems.length === 0) {
                    alert("Your cart is empty!");
                    return;
                  }
                  setShowCart(false);
                  navigate("/checkout");
                }}
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDetails;