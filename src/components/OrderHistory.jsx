import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./OrderHistory.css";

const API_BASE = "https://api.ironingboy.com";

// Order Details Modal Component
const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  const scrollRef = useRef(null);

  // FIXED: Proper date formatting for DD/MM/YYYY format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      // Check if it's already in DD/MM/YYYY format
      if (typeof dateString === 'string' && dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        if (day && month && year) {
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
          }
        }
      }
      
      // Try parsing as ISO date
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
      
      return dateString;
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString;
    }
  };

  // FIXED: Time formatting
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      // Check if it contains time (HH:MM format)
      if (typeof timeString === 'string') {
        const timeMatch = timeString.match(/(\d{1,2}:\d{2})/);
        if (timeMatch) {
          const [hours, minutes] = timeMatch[1].split(':');
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const hour12 = hour % 12 || 12;
          return `${hour12}:${minutes} ${ampm}`;
        }
      }
      
      // Try parsing as full date
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
      return dateTimeString;
    }
    
    return time !== "N/A" ? `${date} at ${time}` : date;
  };

  // Calculate total items quantity
  const getTotalItems = () => {
    if (!order.items || order.items.length === 0) return 0;
    return order.items.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  // Calculate subtotal from items
  const calculateItemsSubtotal = () => {
    if (!order.items || order.items.length === 0) return 0;
    return order.items.reduce((total, item) => {
      const price = parseFloat(item.price_at_purchase || item.price || 0);
      const quantity = parseInt(item.quantity || 1);
      return total + (price * quantity);
    }, 0);
  };

  return (
    <div className="order-details-modal-backdrop" onClick={onClose}>
      <div className="order-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <i className="fas fa-receipt"></i> Order Details #{order.order_id || order.id}
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
                <span className="summary-value">#{order.order_id || order.id}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Order Date:</span>
                <span className="summary-value">{formatDate(order.created_at)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Status:</span>
                <span className="summary-value">
                  <span className={`status-badge ${order.status === 'completed' ? 'status-completed' : 'status-processing'}`}>
                    {order.status || (order.delivery_slot ? 'Completed' : 'Processing')}
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
                <i className="fas fa-map-marker-alt"></i> Delivery Address
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
          {/* Order Items - Enhanced Display */}
{order.items && order.items.length > 0 && (
  <div className="modal-section">
    <h3 className="section-title">
      <i className="fas fa-shopping-bag"></i> Order Items ({order.items.length})
    </h3>
    <div className="items-table-container">
      {/* Table Header - Fixed column widths */}
      <div className="table-header" style={{ 
        display: 'grid', 
        gridTemplateColumns: '3fr 0.8fr 0.8fr 1fr',
        gap: '8px',
        padding: '12px 16px',
        background: 'var(--order-bg-light)',
        borderBottom: '2px solid var(--order-card-border)',
        fontWeight: '600'
      }}>
        <div className="table-col">Item</div>
        <div className="table-col" style={{ textAlign: 'center' }}>Qty</div>
        <div className="table-col" style={{ textAlign: 'right' }}>Price</div>
        <div className="table-col" style={{ textAlign: 'right' }}>Total</div>
      </div>

      {/* Table Rows */}
      {order.items.map((item, index) => {
        const price = parseFloat(item.price_at_purchase || item.price || 0);
        const quantity = parseInt(item.quantity || 1);
        return (
          <div key={index} className="table-row" style={{ 
            display: 'grid', 
            gridTemplateColumns: '3fr 0.8fr 0.8fr 1fr',
            gap: '8px',
            padding: '12px 16px',
            borderBottom: index < order.items.length - 1 ? '1px solid var(--order-card-border)' : 'none',
            alignItems: 'center'
          }}>
            <div className="table-col">
              <div style={{ fontWeight: '500', marginBottom: '4px' }}>{item.product_name || item.name || `Item #${item.product_id}`}</div>
              {item.product_id && (
                <div style={{ fontSize: '0.7rem', color: 'var(--order-text-muted)' }}>ID: {item.product_id}</div>
              )}
            </div>
            <div className="table-col" style={{ textAlign: 'center', fontWeight: '500' }}>{quantity}</div>
            <div className="table-col" style={{ textAlign: 'right', fontWeight: '500' }}>£{price.toFixed(2)}</div>
            <div className="table-col" style={{ textAlign: 'right', fontWeight: '600', color: 'var(--order-accent)' }}>£{(price * quantity).toFixed(2)}</div>
          </div>
        );
      })}

      {/* Optional: Add subtotal row */}
      {order.items.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '3fr 0.8fr 0.8fr 1fr',
          gap: '8px',
          padding: '12px 16px',
          background: 'var(--order-bg-light)',
          borderTop: '2px solid var(--order-card-border)',
          marginTop: '8px'
        }}>
          <div className="table-col" style={{ gridColumn: 'span 3', textAlign: 'right', fontWeight: '600' }}>
            Items Subtotal:
          </div>
          <div className="table-col" style={{ textAlign: 'right', fontWeight: '700', color: 'var(--order-accent)' }}>
            £{order.items.reduce((sum, item) => {
              const price = parseFloat(item.price_at_purchase || item.price || 0);
              const quantity = parseInt(item.quantity || 1);
              return sum + (price * quantity);
            }, 0).toFixed(2)}
          </div>
        </div>
      )}
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
                      alt={`Order ${order.order_id || order.id} - Image ${index + 1}`}
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
                  <span>£{(parseFloat(order.subtotal) - calculateItemsSubtotal()).toFixed(2)}</span>
                </div>
              )}
              <div className="payment-row">
                <span>Subtotal:</span>
                <span>£{parseFloat(order.subtotal || calculateItemsSubtotal() || 0).toFixed(2)}</span>
              </div>
              {order.tip && parseFloat(order.tip) > 0 && (
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
        if (response.status === 404) {
          setOrders([]);
          return;
        }
        const errorText = await response.text();
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      // Handle different API response structures
      const ordersList = data.orders || data.data || (Array.isArray(data) ? data : []);
      setOrders(ordersList);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      setError(err.message || "Failed to load order history");
    } finally {
      setLoading(false);
    }
  }, []);

  // FIXED: Proper date formatting for DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      // Handle DD/MM/YYYY format
      if (typeof dateString === 'string' && dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        if (day && month && year) {
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
          }
        }
      }
      
      // Try parsing as ISO date
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
      
      return dateString;
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString;
    }
  };

  // FIXED: Time formatting
  const formatTime = (timeString) => {
    if (!timeString) return "";
    try {
      // Check if it contains time (HH:MM format)
      if (typeof timeString === 'string') {
        const timeMatch = timeString.match(/(\d{1,2}:\d{2})/);
        if (timeMatch) {
          const [hours, minutes] = timeMatch[1].split(':');
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const hour12 = hour % 12 || 12;
          return `${hour12}:${minutes} ${ampm}`;
        }
      }
      
      // Try parsing as full date
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
    
    return time ? `${date} at ${time}` : date;
  };

  // Get status badge class
  const getStatusBadgeClass = (order) => {
    if (order.status === 'completed') return "status-completed";
    if (order.status === 'cancelled') return "status-cancelled";
    if (order.delivery_slot) {
      try {
        const deliveryDate = new Date(order.delivery_slot.split(' ')[0].split('/').reverse().join('-'));
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
    if (order.status === 'completed') return "Completed";
    if (order.status === 'cancelled') return "Cancelled";
    if (order.delivery_slot) {
      try {
        const deliveryDate = new Date(order.delivery_slot.split(' ')[0].split('/').reverse().join('-'));
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
    if (!order.delivery_slot) return "To be confirmed";
    
    const formatted = formatDateTimeDisplay(order.delivery_slot);
    return formatted.split(" at ")[0];
  };

  // Filter orders based on status
  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true;
    if (filter === "pending") {
      if (order.status === 'processing' || order.status === 'new') return true;
      return !order.delivery_slot;
    }
    if (filter === "completed") {
      if (order.status === 'completed') return true;
      if (order.delivery_slot) {
        try {
          const deliveryDate = new Date(order.delivery_slot.split(' ')[0].split('/').reverse().join('-'));
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

      const response = await fetch(`${API_BASE}/orders/${orderId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Order not found");
        }
        const errorText = await response.text();
        throw new Error(`Failed to fetch order details: ${response.status}`);
      }

      const data = await response.json();
      setOrderDetails(data.order || data);
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
                {orders.filter(o => o.status === 'processing' || !o.delivery_slot).length}
              </div>
              <div className="stat-label">Active</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {orders.filter(o => o.status === 'completed').length}
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
              <i className="fas fa-list-alt"></i>
              <span className="filter-text">All</span>
            </button>
            <button
              className={`filter-tab ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              <i className="fas fa-clock"></i>
              <span className="filter-text">Pending</span>
            </button>
            <button
              className={`filter-tab ${filter === "completed" ? "active" : ""}`}
              onClick={() => setFilter("completed")}
            >
              <i className="fas fa-check-circle"></i>
              <span className="filter-text">Completed</span>
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
                  key={order.order_id || order.id} 
                  className={`order-card ${expandedOrder === (order.order_id || order.id) ? "expanded" : ""}`}
                >
                  {/* Order Header */}
                  <div 
                    className="order-header"
                    onClick={() => toggleOrderExpansion(order.order_id || order.id)}
                  >
                    <div className="order-info">
                      <div className="order-id">
                        <span className="order-label">Order ID:</span>
                        <span className="order-value">#{order.order_id || order.id}</span>
                      </div>
                      <div className="order-date">
                        <span className="order-label">Placed on:</span>
                        <span className="order-value">{formatDate(order.created_at)}</span>
                      </div>
                    </div>
                    
                    <div className="order-status-section">
                      <div className={`status-badge ${getStatusBadgeClass(order)}`}>
                        <i className={`fas ${getStatusBadgeClass(order) === 'status-completed' ? 'fa-check-circle' : 'fa-clock'}`}></i>
                        <span className="status-text">{getStatusText(order)}</span>
                      </div>
                      <div className="order-amount">
                        £{parseFloat(order.total || order.subtotal || 0).toFixed(2)}
                      </div>
                      <button 
                        className="expand-toggle"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleOrderExpansion(order.order_id || order.id);
                        }}
                        aria-label={expandedOrder === (order.order_id || order.id) ? "Collapse details" : "Expand details"}
                      >
                        <i className={`fas fa-chevron-${expandedOrder === (order.order_id || order.id) ? "up" : "down"}`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Collapsed Preview */}
                  {expandedOrder !== (order.order_id || order.id) && (
                    <div className="order-preview">
                      <div className="preview-item">
                        <i className="fas fa-box-open"></i>
                        <span>{order.items?.length || 0} items</span>
                      </div>
                      <div className="preview-item">
                        <i className="fas fa-calendar-check"></i>
                        <span>Est. Delivery: {getEstimatedDelivery(order)}</span>
                      </div>
                      <div className="preview-action">
                        <button 
                          className="quick-action-btn"
                          onClick={(e) => handleViewFullDetails(order.order_id || order.id, e)}
                          aria-label="View full details"
                        >
                          <i className="fas fa-eye"></i>
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Expanded Details */}
                  {expandedOrder === (order.order_id || order.id) && (
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
                                <div className="schedule-icon-small">
                                  <i className="fas fa-truck-loading"></i>
                                </div>
                                <div className="schedule-details-compact">
                                  <span className="schedule-label">Pickup:</span>
                                  <span className="schedule-value">
                                    {formatDateTimeDisplay(order.collect_slot)}
                                  </span>
                                </div>
                              </div>
                            )}
                            {order.delivery_slot && (
                              <div className="schedule-item">
                                <div className="schedule-icon-small">
                                  <i className="fas fa-truck"></i>
                                </div>
                                <div className="schedule-details-compact">
                                  <span className="schedule-label">Delivery:</span>
                                  <span className="schedule-value">
                                    {formatDateTimeDisplay(order.delivery_slot)}
                                  </span>
                                </div>
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
                          <div className="items-list-compact">
                            {order.items.map((item, index) => {
                              const price = parseFloat(item.price_at_purchase || item.price || 0);
                              const quantity = parseInt(item.quantity || 1);
                              return (
                                <div key={index} className="item-row-compact">
                                  <div className="item-info-compact">
                                    <span className="item-name-compact">{item.product_name || item.name || `Item #${item.product_id}`}</span>
                                    <div className="item-details-compact">
                                      <span className="item-quantity-compact">x{quantity}</span>
                                      <span className="item-price-compact">
                                        £{(price * quantity).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {order.notes && (
                        <div className="details-section">
                          <h4 className="details-title">
                            <i className="fas fa-sticky-note"></i> Special Instructions
                          </h4>
                          <div className="order-notes-compact">
                            <p>{order.notes}</p>
                          </div>
                        </div>
                      )}

                      {/* Mobile Action Buttons */}
                      <div className="mobile-action-buttons">
                        <button 
                          className="mobile-action-btn view-details-btn"
                          onClick={(e) => handleViewFullDetails(order.order_id || order.id, e)}
                          disabled={loadingDetails && selectedOrder === (order.order_id || order.id)}
                        >
                          {loadingDetails && selectedOrder === (order.order_id || order.id) ? (
                            <>
                              <div className="btn-spinner-small"></div>
                              <span>Loading...</span>
                            </>
                          ) : (
                            <>
                              <i className="fas fa-eye"></i>
                              <span>View Full Details</span>
                            </>
                          )}
                        </button>
                        <button 
                          className="mobile-action-btn reorder-btn"
                          onClick={() => navigate("/quick-booking")}
                        >
                          <i className="fas fa-redo"></i>
                          <span>Reorder</span>
                        </button>
                      </div>

                      {/* Payment Summary */}
                      <div className="payment-summary-compact">
                        <h4 className="details-title">
                          <i className="fas fa-receipt"></i> Payment Summary
                        </h4>
                        <div className="summary-grid-compact">
                          <div className="summary-row-compact">
                            <span>Subtotal:</span>
                            <span>£{parseFloat(order.subtotal || 0).toFixed(2)}</span>
                          </div>
                          {order.tip && parseFloat(order.tip) > 0 && (
                            <div className="summary-row-compact">
                              <span>Tip:</span>
                              <span>£{parseFloat(order.tip).toFixed(2)}</span>
                            </div>
                          )}
                          <div className="summary-row-compact total-row">
                            <span>Total:</span>
                            <span>£{parseFloat(order.total || order.subtotal || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions Footer */}
                      <div className="quick-actions-footer">
                        <button 
                          className="close-details-btn"
                          onClick={() => toggleOrderExpansion(order.order_id || order.id)}
                        >
                          <i className="fas fa-times"></i>
                          <span>Close Details</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Back to Top Button */}
          {filteredOrders.length > 3 && (
            <button 
              className="back-to-top-btn"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
            >
              <i className="fas fa-arrow-up"></i>
            </button>
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