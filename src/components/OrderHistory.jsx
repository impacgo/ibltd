import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./OrderHistory.css";

const API_BASE = "http://51.21.123.162:3000";

// Order Details Modal Component
const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  // Format date properly
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      // Handle ISO string or already formatted string
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Try to parse as UK date format (DD/MM/YYYY)
        const parts = dateString.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          const parsedDate = new Date(year, month, day);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
          }
        }
        return dateString; // Return original if can't parse
      }
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString;
    }
  };

  // Format time properly
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      // Try to extract time from string like "08/12/2025, 10:00 AM - 11:00 AM"
      const timeMatch = timeString.match(/(\d{1,2}:\d{2}\s*[AP]M)/i);
      if (timeMatch) {
        return timeMatch[1];
      }
      
      // Try parsing as date
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
      
      return timeString;
    } catch (error) {
      console.error("Error formatting time:", timeString, error);
      return timeString;
    }
  };

  // Format date and time together
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    
    const date = formatDate(dateTimeString);
    const time = formatTime(dateTimeString);
    
    if (date === dateTimeString && time === dateTimeString) {
      return dateTimeString; // Return original if both failed
    }
    
    return `${date} at ${time}`;
  };

  // Calculate total items quantity
  const getTotalItems = () => {
    if (!order.items || order.items.length === 0) return 0;
    return order.items.reduce((total, item) => total + item.quantity, 0);
  };

  // Calculate subtotal from items
  const calculateItemsSubtotal = () => {
    if (!order.items || order.items.length === 0) return 0;
    return order.items.reduce((total, item) => {
      const price = parseFloat(item.price_at_purchase || 0);
      return total + (price * item.quantity);
    }, 0);
  };

  return (
    <div className="order-details-modal-backdrop" onClick={onClose}>
      <div className="order-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <i className="fas fa-receipt"></i> Order Details #{order.order_id}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {/* Order Summary */}
          <div className="modal-section">
            <h3 className="section-title">
              <i className="fas fa-info-circle"></i> Order Summary
            </h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Order ID:</span>
                <span className="summary-value">#{order.order_id}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Order Date:</span>
                <span className="summary-value">{formatDate(order.created_at)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Status:</span>
                <span className="summary-value">
                  <span className={`status-badge ${order.delivery_slot ? 'status-completed' : 'status-processing'}`}>
                    {order.delivery_slot ? 'Completed' : 'Processing'}
                  </span>
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total Items:</span>
                <span className="summary-value">{getTotalItems()} items</span>
              </div>
            </div>
          </div>

          {/* Schedule Information */}
          {(order.collect_slot || order.delivery_slot) && (
            <div className="modal-section">
              <h3 className="section-title">
                <i className="fas fa-calendar-alt"></i> Schedule
              </h3>
              <div className="schedule-cards">
                {order.collect_slot && (
                  <div className="schedule-card">
                    <div className="schedule-icon">
                      <i className="fas fa-truck-loading"></i>
                    </div>
                    <div className="schedule-details">
                      <div className="schedule-type">Pickup</div>
                      <div className="schedule-time">
                        {formatDateTime(order.collect_slot)}
                      </div>
                    </div>
                  </div>
                )}
                {order.delivery_slot && (
                  <div className="schedule-card">
                    <div className="schedule-icon">
                      <i className="fas fa-truck"></i>
                    </div>
                    <div className="schedule-details">
                      <div className="schedule-type">Delivery</div>
                      <div className="schedule-time">
                        {formatDateTime(order.delivery_slot)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Address Information */}
          {(order.full_address || order.postcode) && (
            <div className="modal-section">
              <h3 className="section-title">
                <i className="fas fa-map-marker-alt" style={{color:"black"}}></i> Delivery Address
              </h3>
              <div className="address-card">
                <div className="address-details">
                  {order.full_address && (
                    <div className="address-line">{order.full_address}</div>
                  )}
                  {order.postcode && (
                    <div className="address-line">
                      <strong>Postcode:</strong> {order.postcode}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order Items - Enhanced Display */}
          {order.items && order.items.length > 0 && (
            <div className="modal-section">
              <h3 className="section-title">
                <i className="fas fa-shopping-bag"></i> Order Items ({order.items.length})
              </h3>
              <div className="items-table-container">
                <div className="items-table">
                  <div className="table-header">
                    <div className="table-col item-col">Item</div>
                    <div className="table-col quantity-col">Quantity</div>
                    <div className="table-col price-col">Price</div>
                    <div className="table-col total-col">Total</div>
                  </div>
                  {order.items.map((item, index) => (
                    <div key={index} className="table-row">
                      <div className="table-col item-col">
                        <div className="item-name">{item.product_name}</div>
                        {item.product_id && (
                          <div className="item-id">ID: {item.product_id}</div>
                        )}
                      </div>
                      <div className="table-col quantity-col">
                        <span className="item-quantity">x{item.quantity}</span>
                      </div>
                      <div className="table-col price-col">
                        <span className="item-price">
                          £{parseFloat(item.price_at_purchase || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="table-col total-col">
                        <span className="item-total">
                          £{((item.price_at_purchase || 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Special Instructions */}
          {order.notes && (
            <div className="modal-section">
              <h3 className="section-title">
                <i className="fas fa-sticky-note"></i> Special Instructions
              </h3>
              <div className="notes-card">
                <p>{order.notes}</p>
              </div>
            </div>
          )}

          {/* Images */}
          {order.images && order.images.length > 0 && (
            <div className="modal-section">
              <h3 className="section-title">
                <i className="fas fa-images"></i> Order Images ({order.images.length})
              </h3>
              <div className="images-grid">
                {order.images.map((img, index) => (
                  <div key={index} className="image-container">
                    <img 
                      src={img} 
                      alt={`Order ${order.order_id} - Image ${index + 1}`}
                      className="order-image"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/120?text=No+Image";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="modal-section">
            <h3 className="section-title">
              <i className="fas fa-credit-card"></i> Payment Summary
            </h3>
            <div className="payment-summary-card">
              <div className="payment-row">
                <span>Items Subtotal:</span>
                <span>£{calculateItemsSubtotal().toFixed(2)}</span>
              </div>
              {order.subtotal && order.subtotal > calculateItemsSubtotal() && (
                <div className="payment-row">
                  <span>Service Charges:</span>
                  <span>£{(order.subtotal - calculateItemsSubtotal()).toFixed(2)}</span>
                </div>
              )}
              <div className="payment-row">
                <span>Subtotal:</span>
                <span>£{parseFloat(order.subtotal || calculateItemsSubtotal() || 0).toFixed(2)}</span>
              </div>
              {order.tip && order.tip > 0 && (
                <div className="payment-row">
                  <span>Tip:</span>
                  <span>£{parseFloat(order.tip).toFixed(2)}</span>
                </div>
              )}
              <div className="payment-row total">
                <span>Total Amount:</span>
                <span>£{parseFloat(order.total || order.subtotal || calculateItemsSubtotal() || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn close-btn" onClick={onClose}>
            <i className="fas fa-times"></i> Close
          </button>
          <button 
            className="modal-btn reorder-btn"
            onClick={() => {
              window.location.href = "/quick-booking";
            }}
          >
            <i className="fas fa-redo"></i> Place Similar Order
          </button>
        </div>
      </div>
    </div>
  );
};

// Main OrderHistory Component
const OrderHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE}/orders`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch orders: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("📊 Orders fetched:", data.orders?.length || 0);
      console.log("📋 Sample order:", data.orders?.[0]);
      setOrders(data.orders || []);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      setError(err.message || "Failed to load order history");
    } finally {
      setLoading(false);
    }
  }, []);

  // Enhanced date formatting
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      // Handle ISO string or already formatted string
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Try to parse as UK date format (DD/MM/YYYY)
        const parts = dateString.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          const parsedDate = new Date(year, month, day);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
          }
        }
        return dateString; // Return original if can't parse
      }
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString;
    }
  };

  // Enhanced time formatting
  const formatTime = (timeString) => {
    if (!timeString) return "";
    try {
      // Try to extract time from string like "08/12/2025, 10:00 AM - 11:00 AM"
      const timeMatch = timeString.match(/(\d{1,2}:\d{2}\s*[AP]M)/i);
      if (timeMatch) {
        return timeMatch[1];
      }
      
      // Try parsing as date
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
      
      return "";
    } catch (error) {
      console.error("Error formatting time:", timeString, error);
      return "";
    }
  };

  // Format date and time for display
  const formatDateTimeDisplay = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    
    const date = formatDate(dateTimeString);
    const time = formatTime(dateTimeString);
    
    if (time) {
      return `${date} at ${time}`;
    }
    
    return date; // Return just date if time parsing failed
  };

  // Get status badge class
  const getStatusBadgeClass = (order) => {
    if (order.delivery_slot) {
      try {
        const deliveryDate = new Date(order.delivery_slot);
        const now = new Date();
        if (!isNaN(deliveryDate.getTime())) {
          if (deliveryDate < now) {
            return "status-completed";
          }
        }
      } catch (error) {
        console.error("Error parsing delivery date:", error);
      }
    }
    
    return "status-processing";
  };

  // Get status text
  const getStatusText = (order) => {
    if (order.delivery_slot) {
      try {
        const deliveryDate = new Date(order.delivery_slot);
        const now = new Date();
        if (!isNaN(deliveryDate.getTime())) {
          if (deliveryDate < now) {
            return "Completed";
          }
        }
      } catch (error) {
        console.error("Error parsing delivery date:", error);
      }
    }
    
    return "Processing";
  };

  // Calculate estimated delivery date
  const getEstimatedDelivery = (order) => {
    if (!order.delivery_slot) return "N/A";
    
    const formatted = formatDateTimeDisplay(order.delivery_slot);
    return formatted === "N/A" ? "To be confirmed" : formatted.split(" at ")[0];
  };

  // Filter orders based on status
  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true;
    if (filter === "pending") return !order.delivery_slot;
    if (filter === "completed") {
      if (order.delivery_slot) {
        try {
          const deliveryDate = new Date(order.delivery_slot);
          const now = new Date();
          if (!isNaN(deliveryDate.getTime())) {
            return deliveryDate < now;
          }
        } catch (error) {
          return false;
        }
      }
      return false;
    }
    return true;
  });

  // Toggle order expansion
  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Handle view full details
  const handleViewFullDetails = async (orderId, e) => {
    if (e) e.stopPropagation();
    
    try {
      setLoadingDetails(true);
      setSelectedOrder(orderId);
      
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log(`📡 Fetching order details for ID: ${orderId}`);
      const response = await fetch(`${API_BASE}/orders/${orderId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch order details: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("📋 Order details fetched:", data);
      setOrderDetails(data);
    } catch (err) {
      console.error("❌ Error fetching order details:", err);
      setError(err.message || "Failed to load order details");
      setSelectedOrder(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Close order details modal
  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setOrderDetails(null);
  };

  if (!user) {
    return (
      <div className="order-history-container">
        <div className="login-required">
          <i className="fas fa-user-lock"></i>
          <h2>Login Required</h2>
          <p>Please login to view your order history</p>
          <Link to="/" className="back-to-home-btn">
            <i className="fas fa-arrow-left"></i> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="order-history-page">
        <div className="order-history-container">
          {/* Header */}
          <div className="order-history-header">
            <div className="header-content">
              <button 
                className="back-button"
                onClick={() => navigate(-1)}
                aria-label="Go back"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <h1 className="page-title">Order History</h1>
            </div>
            <p className="page-subtitle">
              Track your laundry service orders and view details
            </p>
          </div>

          {/* Stats Summary */}
          <div className="order-stats">
            <div className="stat-card">
              <div className="stat-value">{orders.length}</div>
              <div className="stat-label">Total Orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {orders.filter(o => !o.delivery_slot).length}
              </div>
              <div className="stat-label">Active</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {orders.filter(o => {
                  if (o.delivery_slot) {
                    try {
                      const deliveryDate = new Date(o.delivery_slot);
                      const now = new Date();
                      if (!isNaN(deliveryDate.getTime())) {
                        return deliveryDate < now;
                      }
                    } catch (error) {
                      return false;
                    }
                  }
                  return false;
                }).length}
              </div>
              <div className="stat-label">Completed</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All Orders
            </button>
            <button
              className={`filter-tab ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              Pending
            </button>
            <button
              className={`filter-tab ${filter === "completed" ? "active" : ""}`}
              onClick={() => setFilter("completed")}
            >
              Completed
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading your orders...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="error-container">
              <i className="fas fa-exclamation-circle error-icon"></i>
              <h3>Unable to Load Orders</h3>
              <p>{error}</p>
              <button 
                className="retry-btn"
                onClick={fetchOrders}
              >
                <i className="fas fa-redo"></i> Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredOrders.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <i className="fas fa-shopping-bag"></i>
              </div>
              <h3>No Orders Found</h3>
              <p>
                {filter === "all" 
                  ? "You haven't placed any orders yet." 
                  : `You don't have any ${filter} orders.`}
              </p>
              <Link to="/" className="browse-services-btn">
                <i className="fas fa-search"></i> Browse Services
              </Link>
            </div>
          )}

          {/* Orders List */}
          {!loading && !error && filteredOrders.length > 0 && (
            <div className="orders-list">
              {filteredOrders.map(order => (
                <div 
                  key={order.order_id} 
                  className={`order-card ${expandedOrder === order.order_id ? "expanded" : ""}`}
                >
                  {/* Order Header */}
                  <div 
                    className="order-header"
                    onClick={() => toggleOrderExpansion(order.order_id)}
                  >
                    <div className="order-info">
                      <div className="order-id">
                        <span className="order-label">Order ID:</span>
                        <span className="order-value">#{order.order_id}</span>
                      </div>
                      <div className="order-date">
                        <span className="order-label">Placed on:</span>
                        <span className="order-value">{formatDate(order.created_at)}</span>
                      </div>
                    </div>
                    
                    <div className="order-status-section">
                      <div className={`status-badge ${getStatusBadgeClass(order)}`}>
                        {getStatusText(order)}
                      </div>
                      <div className="order-amount">
                        £{parseFloat(order.total || order.subtotal || 0).toFixed(2)}
                      </div>
                      <button 
                        className="expand-toggle"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleOrderExpansion(order.order_id);
                        }}
                        aria-label={expandedOrder === order.order_id ? "Collapse details" : "Expand details"}
                      >
                        <i className={`fas fa-chevron-${expandedOrder === order.order_id ? "up" : "down"}`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Collapsed Preview */}
                  {expandedOrder !== order.order_id && (
                    <div className="order-preview">
                      <div className="preview-item">
                        <i className="fas fa-box-open"></i>
                        <span>{order.items?.length || 0} items</span>
                      </div>
                      <div className="preview-item">
                        <i className="fas fa-calendar-check"></i>
                        <span>Est. Delivery: {getEstimatedDelivery(order)}</span>
                      </div>
                    </div>
                  )}

                  {/* Expanded Details */}
                  {expandedOrder === order.order_id && (
                    <div className="order-details">
                      {/* Schedule Info */}
                      {(order.collect_slot || order.delivery_slot) && (
                        <div className="details-section">
                          <h4 className="details-title">
                            <i className="fas fa-clock"></i> Schedule
                          </h4>
                          <div className="schedule-grid">
                            {order.collect_slot && (
                              <div className="schedule-item">
                                <span className="schedule-label">Pickup:</span>
                                <span className="schedule-value">
                                  {formatDateTimeDisplay(order.collect_slot)}
                                </span>
                              </div>
                            )}
                            {order.delivery_slot && (
                              <div className="schedule-item">
                                <span className="schedule-label">Delivery:</span>
                                <span className="schedule-value">
                                  {formatDateTimeDisplay(order.delivery_slot)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Order Items */}
                      {order.items && order.items.length > 0 && (
                        <div className="details-section">
                          <h4 className="details-title">
                            <i className="fas fa-list"></i> Items ({order.items.length})
                          </h4>
                          <div className="items-list">
                            {order.items.map((item, index) => (
                              <div key={index} className="item-row">
                                <span className="item-name">{item.product_name}</span>
                                <span className="item-quantity">x{item.quantity}</span>
                                <span className="item-price">
                                  £{((item.price_at_purchase || 0) * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {order.notes && (
                        <div className="details-section">
                          <h4 className="details-title">
                            <i className="fas fa-sticky-note"></i> Special Instructions
                          </h4>
                          <div className="order-notes">
                            <p>{order.notes}</p>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="action-buttons">
                        <button 
                          className="action-btn view-details-btn"
                          onClick={(e) => handleViewFullDetails(order.order_id, e)}
                          disabled={loadingDetails && selectedOrder === order.order_id}
                        >
                          {loadingDetails && selectedOrder === order.order_id ? (
                            <>
                              <div className="btn-spinner"></div>
                              Loading...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-eye"></i> View Full Details
                            </>
                          )}
                        </button>
                        <button 
                          className="action-btn reorder-btn"
                          onClick={() => navigate("/quick-booking")}
                        >
                          <i className="fas fa-redo"></i> Reorder
                        </button>
                      </div>

                      {/* Payment Summary */}
                      <div className="payment-summary">
                        <h4 className="details-title">
                          <i className="fas fa-receipt"></i> Payment Summary
                        </h4>
                        <div className="summary-grid">
                          <div className="summary-row">
                            <span>Subtotal:</span>
                            <span>£{parseFloat(order.subtotal || 0).toFixed(2)}</span>
                          </div>
                          {order.tip && order.tip > 0 && (
                            <div className="summary-row">
                              <span>Tip:</span>
                              <span>£{parseFloat(order.tip).toFixed(2)}</span>
                            </div>
                          )}
                          <div className="summary-row total-row">
                            <span>Total:</span>
                            <span>£{parseFloat(order.total || order.subtotal || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={orderDetails}
          onClose={closeOrderDetails}
        />
      )}
    </>
  );
};

export default OrderHistory;