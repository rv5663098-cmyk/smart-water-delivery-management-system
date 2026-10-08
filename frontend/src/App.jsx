import { useEffect, useState } from "react";
import WaterBackground from "./WaterBackground";
import "./App.css";

function App() {
  
  const [dashboard, setDashboard] = useState({
    totalOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
  });

  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({
  orderId: "",
  deliveryPerson: "",
  deliveryAddress: ""
});
   const [customers, setCustomers] = useState([]);
   const [editingProductId, setEditingProductId] = useState(null);
   const [products, setProducts] = useState([]);

    const [showProductModal, setShowProductModal] = useState(false);

const [productForm, setProductForm] = useState({
  productName: "",
  sizeInLiters: "",
  price: "",
  available: true,
   stockQuantity: 0,
});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
 

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);

  const [showOrderModal, setShowOrderModal] = useState(false);

const [orderForm, setOrderForm] = useState({
  customerId: "",
  productId: "",
  quantity: 1
});

const [customerForm, setCustomerForm] = useState({
  name: "",
  mobile: "",
  email: "",
  address: "",
});

  useEffect(() => {
    loadDashboardData();
  }, []);

    useEffect(() => {
    fetch("http://localhost:8080/api/customers")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }

        return response.json();
      })
      .then((data) => {
        setCustomers(data);
      })
      .catch((error) => {
        console.error("Customer fetch error:", error);
      });
  }, []);

  useEffect(() => {
  fetch("http://localhost:8080/api/products")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      return response.json();
    })
    .then((data) => {
      setProducts(data);
    })
    .catch((error) => {
      console.error("Product fetch error:", error);
    });
}, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

    const [dashboardResponse, ordersResponse, deliveriesResponse] =
  await Promise.all([
    fetch("http://localhost:8080/api/dashboard/summary"),
    fetch("http://localhost:8080/api/orders"),
    fetch("http://localhost:8080/api/deliveries"),
  ]);

      if (!dashboardResponse.ok) {
        throw new Error("Dashboard API failed");
      }

      if (!ordersResponse.ok) {
        throw new Error("Orders API failed");
      }

      const dashboardData = await dashboardResponse.json();
      const ordersData = await ordersResponse.json();
      const deliveriesData = await deliveriesResponse.json();

      setDashboard(dashboardData);
      setOrders(ordersData);
      setDeliveries(deliveriesData);
    } catch (err) {
      console.error(err);
      setError(
        "Backend se data load nahi ho pa raha. Check karo ki Spring Boot server running hai."
      );
    } finally {
      setLoading(false);
    }
  };

 const handleAddOrder = async () => {
  // Frontend validation
  if (!orderForm.customerId) {
    alert("Please select a customer.");
    return;
  }

  if (!orderForm.productId) {
    alert("Please select a water product.");
    return;
  }

  if (!orderForm.quantity || Number(orderForm.quantity) < 1) {
    alert("Quantity must be at least 1.");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:8080/api/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: Number(orderForm.customerId),
          productId: Number(orderForm.productId),
          quantity: Number(orderForm.quantity),
        }),
      }
    );

    if (!response.ok) {
      let errorMessage = "Failed to create order.";

      try {
        const errorData = await response.json();

       if (errorData.error) {
  errorMessage = errorData.error;
} else if (errorData.message) {
  errorMessage = errorData.message;
}
      } catch {
        // Ignore JSON parsing error
      }

      throw new Error(errorMessage);
    }

    const newOrder = await response.json();

    setOrders((prevOrders) => [
      ...prevOrders,
      newOrder,
    ]);

    setOrderForm({
      customerId: "",
      productId: "",
      quantity: 1,
    });

    setShowOrderModal(false);

    alert("Order placed successfully!");
  } catch (error) {
    console.error("Add order error:", error);

    alert(
      error.message || "Order place nahi ho paaya."
    );
  }
};

const handleAddDelivery = async () => {
  try {
    const response = await fetch(
      "http://localhost:8080/api/deliveries",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order: {
            id: Number(deliveryForm.orderId),
            quantity: Number(
    orders.find(order => order.id === Number(deliveryForm.orderId))?.quantity
  ),
          },
          deliveryPerson: deliveryForm.deliveryPerson,
          deliveryAddress: deliveryForm.deliveryAddress,
          status: "ASSIGNED",
        }),
      }
    );

   if (!response.ok) {
  const errorText = await response.text();
  console.error("Backend delivery error:", errorText);
  throw new Error(errorText || "Failed to create delivery");
}

    const newDelivery = await response.json();

    setDeliveries((prevDeliveries) => [
      ...prevDeliveries,
      newDelivery,
    ]);

    setDeliveryForm({
      orderId: "",
      deliveryPerson: "",
      deliveryAddress: "",
    });

    setShowDeliveryModal(false);

    alert("Delivery assigned successfully!");
  } catch (error) {
    console.error("Add delivery error:", error);
    alert("Delivery already exists for this order");
  }
};

const handleUpdateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/orders/${orderId}/status?status=${newStatus}`,
      {
        method: "PUT",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update order status");
    }

    const updatedOrder = await response.json();

    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? updatedOrder : order
      )
    );

    alert("Order status updated successfully!");
  } catch (error) {
    console.error("Update order status error:", error);
    alert("Order status update nahi ho paaya.");
  }
};

const handleDeleteOrder = async (orderId) => {
  const confirmDelete = window.confirm(
    "Kya aap is order ko delete karna chahte hain?"
  );

  if (!confirmDelete) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8080/api/orders/${orderId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete order");
    }

    setOrders((prevOrders) =>
      prevOrders.filter((order) => order.id !== orderId)
    );

    alert("Order deleted successfully!");
  } catch (error) {
    console.error("Delete order error:", error);
    alert("Order delete nahi ho paaya.");
  }
};

  const handleAddCustomer = async () => {
  try {
    const response = await fetch("http://localhost:8080/api/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customerForm),
    });

    if (!response.ok) {
      throw new Error("Failed to add customer");
    }

    const newCustomer = await response.json();

    // Customer list update
    setCustomers((prevCustomers) => [
      ...prevCustomers,
      newCustomer,
    ]);

    // Form reset
    setCustomerForm({
      name: "",
      mobile: "",
      email: "",
      address: "",
    });

    // Modal close
    setShowCustomerModal(false);

    alert("Customer added successfully!");
  } catch (error) {
    console.error("Add customer error:", error);
    alert("Customer add nahi ho paaya.");
  }
};

const handleDeactivateCustomer = async (id) => {
  const confirmDeactivate = window.confirm(
    "Are you sure that you want to deactivate this customer?"
  );

  if (!confirmDeactivate) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8080/api/customers/${id}/deactivate`,
      {
        method: "PUT",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to deactivate customer");
    }

    const updatedCustomer = await response.json();

    setCustomers((prevCustomers) =>
      prevCustomers.map((customer) =>
        customer.id === id ? updatedCustomer : customer
      )
    );

    alert("Customer deactivated successfully!");
  } catch (error) {
    console.error("Deactivate customer error:", error);
    alert("Customer could not be deactivated .");
  }
};

   const handleActivateCustomer = async (id) => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/customers/${id}/activate`,
      {
        method: "PUT",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to activate customer");
    }

    const updatedCustomer = await response.json();

    setCustomers((prevCustomers) =>
      prevCustomers.map((customer) =>
        customer.id === id ? updatedCustomer : customer
      )
    );

    alert("Customer activated successfully!");
  } catch (error) {
    console.error("Activate customer error:", error);
    alert("Customer could not be activated.");
  }
};

   const handleEditCustomer = (customer) => {
  setEditingCustomerId(customer.id);

  setCustomerForm({
    name: customer.name,
    mobile: customer.mobile,
    email: customer.email,
    address: customer.address,
  });

  setShowCustomerModal(true);
};

const handleUpdateCustomer = async () => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/customers/${editingCustomerId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerForm),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update customer");
    }

    const updatedCustomer = await response.json();

    setCustomers((prevCustomers) =>
      prevCustomers.map((customer) =>
        customer.id === editingCustomerId
          ? updatedCustomer
          : customer
      )
    );

    setCustomerForm({
      name: "",
      mobile: "",
      email: "",
      address: "",
    });

    setEditingCustomerId(null);
    setShowCustomerModal(false);

    alert("Customer updated successfully!");
  } catch (error) {
    console.error("Update customer error:", error);
    alert("Customer update nahi ho paaya.");
  }
};

// DEACTIVATE PRODUCT
const handleDeactivateProduct = async (id) => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/products/${id}/deactivate`,
      {
        method: "PUT",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to deactivate product");
    }

    const updatedProduct = await response.json();

    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? updatedProduct : product
      )
    );

    alert("Product deactivated successfully!");
  } catch (error) {
    console.error("Deactivate product error:", error);
    alert("Product deactivate nahi ho paaya.");
  }
};


// ACTIVATE PRODUCT
const handleActivateProduct = async (id) => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/products/${id}/activate`,
      {
        method: "PUT",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to activate product");
    }

    const updatedProduct = await response.json();

    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? updatedProduct : product
      )
    );

    alert("Product activated successfully!");
  } catch (error) {
    console.error("Activate product error:", error);
    alert("Product activate nahi ho paaya.");
  }
};

const handleAddProduct = async (e) => {
  e.preventDefault();

  try {
    const productData = {
      productName: productForm.productName,
      sizeInLiters: Number(productForm.sizeInLiters),
      price: Number(productForm.price),
      available: productForm.available,
       stockQuantity: Number(productForm.stockQuantity),
    };

    let response;

    // EDIT PRODUCT
    if (editingProductId !== null) {
      response = await fetch(
        `http://localhost:8080/api/products/${editingProductId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      const updatedProduct = await response.json();

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === editingProductId ? updatedProduct : product
        )
      );

      alert("Product updated successfully!");
    }

    // ADD PRODUCT
    else {
      response = await fetch("http://localhost:8080/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error("Failed to add product");
      }

      const newProduct = await response.json();

      setProducts((prevProducts) => [
        ...prevProducts,
        newProduct,
      ]);

      alert("Product added successfully!");
    }

    // FORM RESET
    setProductForm({
      productName: "",
      sizeInLiters: "",
      price: "",
      available: true,
       stockQuantity: 0,
    });

    // EDIT MODE RESET
    setEditingProductId(null);

    // MODAL CLOSE
    setShowProductModal(false);

  } catch (error) {
    console.error("Product error:", error);
    alert("Product save nahi ho paya.");
  }
};
 
const handleEditProduct = (product) => {
  setEditingProductId(product.id);

  setProductForm({
    productName: product.productName,
    sizeInLiters: product.sizeInLiters,
    price: product.price,
    available: product.available,
     stockQuantity: product.stockQuantity,
  });

  setShowProductModal(true);
};

const handleUpdateStock = async (product) => {
  const newStock = window.prompt(
    "Enter new stock quantity:",
    product.stockQuantity
  );

  if (newStock === null) {
    return;
  }

  const quantity = Number(newStock);

  if (!Number.isInteger(quantity) || quantity < 0) {
    alert("Please enter a valid stock quantity.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8080/api/products/${product.id}/stock?quantity=${quantity}`,
      {
        method: "PUT",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update stock");
    }

    const updatedProduct = await response.json();

    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.id === updatedProduct.id ? updatedProduct : p
      )
    );

    alert("Stock updated successfully!");
  } catch (error) {
    alert(error.message);
  }
};

const handleDeleteProduct = async (productId) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this product?"
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(
      `http://localhost:8080/api/products/${productId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete product");
    }

    setProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== productId)
    );

    alert("Product deleted successfully!");
  } catch (error) {
    console.error("Delete product error:", error);
    alert("Product delete nahi ho paaya.");
  }
};

  return (
    
    <div
    
  className="app"
>
  <WaterBackground />
      {/* Navbar */}
      <nav className="navbar">

        <div className="logo">
          💧 AquaSmart
        </div>

        <div className="nav-links">
          <a href="#dashboard">Dashboard</a>
          <a href="#orders">Orders</a>
          <a href="#customers">Customers</a>
          <a href="#deliveries">Deliveries</a>
        </div>

        <button className="profile-btn">
          Admin
        </button>

      </nav>


      {/* Main Content */}
      <main className="main-content">

        {/* Welcome Section */}
        <section className="welcome-section" id="dashboard">

          <div>
            <p className="welcome-label">
             DELIVER WATER SMARTLY WITH
            </p>

            <h1>
              AQUA-ROUTE
            </h1>

            <p className="welcome-text">
              Manage customers, water orders and deliveries
              from one simple dashboard.
            </p>
          </div>

          <div className="water-icon">
            💧
          </div>

        </section>


        {/* Error Message */}
        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              background: "#ffe8e8",
              color: "#c62828",
              borderRadius: "10px",
            }}
          >
            {error}
          </div>
        )}


        {/* Statistics */}
        <section className="stats-grid">

          {/* Total Orders */}
          <div className="stat-card">

            <div className="stat-icon blue">
              📦
            </div>

            <div>
              <p>Total Orders</p>

              <h2>
                {loading ? "..." : dashboard.totalOrders}
              </h2>
            </div>

          </div>


          {/* Confirmed Orders */}
          <div className="stat-card">

            <div className="stat-icon green">
              ✅
            </div>

            <div>
              <p>Confirmed Orders</p>

              <h2>
                {loading ? "..." : dashboard.confirmedOrders}
              </h2>
            </div>

          </div>


          {/* Delivered Orders */}
          <div className="stat-card">

            <div className="stat-icon purple">
              🚚
            </div>

            <div>
              <p>Delivered Orders</p>

              <h2>
                {loading ? "..." : dashboard.deliveredOrders}
              </h2>
            </div>

          </div>


          {/* Revenue */}
          <div className="stat-card">

            <div className="stat-icon orange">
              ₹
            </div>

            <div>
              <p>Total Revenue</p>

              <h2>
                {loading
                  ? "..."
                  : `₹${dashboard.totalRevenue}`}
              </h2>
            </div>

          </div>

        </section>


        {/* Quick Actions */}
        <section className="section">

          <div className="section-header">

            <div>
              <h2>Quick Actions</h2>

              <p>
                Manage your water delivery system
              </p>
            </div>

          </div>


          <div className="actions-grid">

            <button className="action-card">
              <span>👤</span>

              <div>
                <h3>Customers</h3>

                <p>
                  Manage customers
                </p>
              </div>
            </button>


            <button className="action-card">
              <span>💧</span>

              <div>
                <h3>Water Products</h3>

                <p>
                  Manage water products
                </p>
              </div>
            </button>


            <button className="action-card">
              <span>📦</span>

              <div>
                <h3>Orders</h3>

                <p>
                  View and manage orders
                </p>
              </div>
            </button>


            <button className="action-card">
              <span>🚚</span>

              <div>
                <h3>Deliveries</h3>

                <p>
                  Track deliveries
                </p>
              </div>
            </button>

          </div>

        </section>


        {/* Recent Orders */}
        <section className="section" id="orders">

          <div className="section-header">

            <div>
              <h2>Recent Orders</h2>

              <p>
                Latest water orders
              </p>
            </div>

              <div>
    <button
      className="add-btn"
      onClick={() => setShowOrderModal(true)}
    >
      + Add Order
    </button>

    <button
      className="refresh-btn"
      onClick={loadDashboardData}
    >
      Refresh
    </button>
  </div>

          </div>


          <div className="orders-card">

            {loading ? (

              <div
                style={{
                  padding: "30px",
                  textAlign: "center",
                  color: "#737e90",
                }}
              >
                Loading orders...
              </div>

            ) : orders.length === 0 ? (

              <div
                style={{
                  padding: "30px",
                  textAlign: "center",
                  color: "#737e90",
                }}
              >
                No orders found.
              </div>

            ) : (

              [...orders].sort((a, b) => b.id - a.id).slice(0, 5).map((order) => (

                <div
                  className="order-row"
                  key={order.id}
                >

                  {/* Customer */}
                  <div>

                    <strong>
                      Order #{order.id}
                    </strong>

                    <span>
                      {order.customer?.name || "Unknown Customer"}
                    </span>

                  </div>


                  {/* Product */}
                  <div>

                    <span>
                      {order.quantity} ×{" "}
                      {order.product?.productName ||
                        "Water Product"}
                    </span>

                  </div>


                  {/* Amount */}
                  <div className="amount">

                    ₹{order.totalAmount}

                  </div>


                  {/* Status */}
                <select
  value={order.status || "PLACED"}
  onChange={(e) =>
    handleUpdateOrderStatus(order.id, e.target.value)
  }
  className={`status ${
    order.status?.toLowerCase() === "confirmed"
      ? "confirmed"
      : "placed"
  }`}
>
  <option value="PLACED">PLACED</option>
  <option value="CONFIRMED">CONFIRMED</option>
  <option value="OUT FOR DELIVERY">OUT FOR DELIVERY</option>
  <option value="DELIVERED">DELIVERED</option>
  <option value="CANCELLED">CANCELLED</option>
</select>

        <button
  className="delete-btn"
  onClick={() => handleDeleteOrder(order.id)}
>
  Delete
</button>

                </div>

              ))

            )}

          </div>

        </section>

{/* Water Products */}
<section className="section" id="products">

  <div className="section-header">

    <div>
      <h2>Water Products</h2>
      <p>Available water products</p>
    </div>

 <button
  className="add-btn"
  onClick={() => {
    setProductForm({
      productName: "",
      sizeInLiters: "",
      price: "",
      available: true,
        stockQuantity: 0,
    });
       setEditingProductId(null);  
    setShowProductModal(true);
  }}
>
  + Add Product
</button>

  </div>

  <div className="products-card">

    {products.length === 0 ? (

      <div
        style={{
          padding: "30px",
          textAlign: "center",
          color: "#737e90",
        }}
      >
        No products found.
      </div>

    ) : (

      products.map((product) => {
  const stockStatus =
    product.stockQuantity === 0
      ? "Out of Stock"
      : product.stockQuantity <= 10
      ? "Low Stock"
      : "In Stock";

  return (


        <div
  className="water-product-card"
  key={product.id}
>


        <div>
  <h3>{product.productName}</h3>
  <p>{product.sizeInLiters} Liter</p>
</div>

          <div>
            <strong>₹{product.price}</strong>
          </div>
          <p>
  <strong>Stock:</strong> {product.stockQuantity}
</p>

<p>
  <strong>Stock Status:</strong> {stockStatus}
</p>

          <div>
            <span>
              {product.available
                ? "Available"
                : "Unavailable"}
            </span>
          </div>

<div className="water-product-actions">

  <button
    className="edit-btn"
    onClick={() => handleEditProduct(product)}
  >
    Edit
  </button>

  <button
  className="stock-btn"
  onClick={() => handleUpdateStock(product)}
>
  Update Stock
</button>

  {product.available ? (
    <button
      className="deactivate-btn"
      onClick={() => handleDeactivateProduct(product.id)}
    >
      Deactivate
    </button>
  ) : (
    <button
      className="activate-btn"
      onClick={() => handleActivateProduct(product.id)}
    >
      Activate
    </button>
  )}

  </div>

        </div>

      );
})

    )}

  </div>

</section> 

{/* Deliveries */}
<section className="section" id="deliveries">
  <div className="section-header">
    <div>
      <h2>Deliveries</h2>
      <p>Track and manage water deliveries</p>
    </div>
      <button
    className="add-btn"
    onClick={() => setShowDeliveryModal(true)}
  >
    + Add Delivery
  </button>
  </div>

  <div className="deliveries-card">

  {deliveries.length === 0 ? (
    <p>No deliveries found.</p>
  ) : (
    deliveries.map((delivery) => (
      <div className="delivery-item" key={delivery.id}>

        <div className="delivery-card">
          <h3>Delivery #{delivery.id}</h3>

          <p>
            Order #{delivery.order?.id}
          </p>

          <p>
            Delivery Person: {delivery.deliveryPerson}
          </p>

          <p>
            Address: {delivery.deliveryAddress}
          </p>
          <div>
         <select
    className={`delivery-status ${(
        delivery.status || "ASSIGNED"
    ).toLowerCase().replaceAll(" ", "-")}`}
    value={delivery.status || "ASSIGNED"}
            onChange={(e) =>
              fetch(
                `http://localhost:8080/api/deliveries/${delivery.id}/status?status=${e.target.value}`,
                {
                  method: "PUT",
                }
              )
                .then((response) => {
                  if (!response.ok) {
                    throw new Error("Status update failed");
                  }

                  return response.json();
                })
                .then((updatedDelivery) => {
                  setDeliveries((prevDeliveries) =>
                    prevDeliveries.map((item) =>
                      item.id === delivery.id
                        ? updatedDelivery
                        : item
                    )
                  );
                })
                .catch((error) => {
                  console.error(
                    "Delivery status update error:",
                    error
                  );
                  alert("Delivery status update nahi ho paaya.");
                })
            }
          >
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="OUT FOR DELIVERY">
              OUT FOR DELIVERY
            </option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
         </div>

      </div>
    ))

  )}

{showDeliveryModal && (
  <div className="modal-overlay">
    <div className="customer-modal">

      <div className="modal-header">
        <div>
          <h2>Add Delivery</h2>
          <p>Assign a delivery to an order</p>
        </div>

        <button
          className="modal-close"
          onClick={() => setShowDeliveryModal(false)}
        >
          ×
        </button>
      </div>

      <div className="modal-body">

        <label>Order</label>
        <select
          value={deliveryForm.orderId}
          onChange={(e) =>
            setDeliveryForm({
              ...deliveryForm,
              orderId: e.target.value
            })
          }
        >
          <option value="">Select Order</option>

          {orders.map((order) => (
            <option key={order.id} value={order.id}>
              Order #{order.id} - {order.customer?.name || "Customer"}
            </option>
          ))}
        </select>

        <label>Delivery Person</label>
        <input
          type="text"
          placeholder="Enter delivery person name"
          value={deliveryForm.deliveryPerson}
          onChange={(e) =>
            setDeliveryForm({
              ...deliveryForm,
              deliveryPerson: e.target.value
            })
          }
        />

        <label>Delivery Address</label>
        <input
          type="text"
          placeholder="Enter delivery address"
          value={deliveryForm.deliveryAddress}
          onChange={(e) =>
            setDeliveryForm({
              ...deliveryForm,
              deliveryAddress: e.target.value
            })
          }
        />

      </div>

      <div className="modal-actions">

        <button
          type="button"
          onClick={() => setShowDeliveryModal(false)}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleAddDelivery}
        >
          Add Delivery
        </button>

      </div>

    </div>
  </div>
)}

</div>
</section>

        {/* Customers */}
<section className="section" id="customers">

  <div className="section-header">
  <div>
    <h2>Customers</h2>
    <p>Registered water delivery customers</p>
  </div>

<button
  className="add-btn"
  onClick={() => {
    setEditingCustomerId(null);

    setCustomerForm({
      name: "",
      mobile: "",
      email: "",
      address: "",
    });

    setShowCustomerModal(true);
  }}
>
  + Add Customer
</button>
</div>
  <div className="customers-card">

    {customers.length === 0 ? (

      <div
        style={{
          padding: "30px",
          textAlign: "center",
          color: "#737e90",
        }}
      >
        No customers found.
      </div>

    ) : (

      customers.map((customer) => (

        <div
          className="customer-row"
          key={customer.id}
        >

          <div>
            <strong>{customer.name}</strong>
            <span>{customer.email}</span>
          </div>

          <div>
            <span>{customer.mobile}</span>
          </div>

        <div className="customer-actions">

  <button
    className="edit-btn"
    onClick={() => handleEditCustomer(customer)}
  >
    Edit
  </button>

<button
  className={customer.active ? "deactivate-btn" : "activate-btn"}
  onClick={() =>
    customer.active
      ? handleDeactivateCustomer(customer.id)
      : handleActivateCustomer(customer.id)
  }
>
  {customer.active ? "Deactivate" : "Activate"}
</button>

           </div>

        </div>

      ))

    )}

  </div>

</section>

{/* Add Order Modal */}
{showOrderModal && (
  <div className="modal-overlay">
    <div className="customer-modal">
      
      <div className="modal-header">
        <div>
          <h2>Add Order</h2>
          <p>Create a new water order</p>
        </div>

        <button
          className="modal-close"
          onClick={() => setShowOrderModal(false)}
        >
          ×
        </button>
      </div>

      <div className="modal-body">

        {/* Customer */}
        <label>Customer</label>
        <select
          value={orderForm.customerId}
          onChange={(e) =>
            setOrderForm({
              ...orderForm,
              customerId: e.target.value
            })
          }
        >
          <option value="">Select Customer</option>

        {customers
  .filter((customer) => customer.active)
  .map((customer) => (
    <option key={customer.id} value={customer.id}>
      {customer.name}
    </option>
  ))}
        </select>

        {/* Water Product */}
        <label>Water Product</label>
        <select
          value={orderForm.productId}
          onChange={(e) =>
            setOrderForm({
              ...orderForm,
              productId: e.target.value
            })
          }
        >
          <option value="">Select Water Product</option>

          {products
            .filter((product) => product.available)
            .map((product) => (
              <option key={product.id} value={product.id}>
                {product.productName} - ₹{product.price}
              </option>
            ))}
        </select>

        {/* Quantity */}
        <label>Quantity</label>
        <input
          type="number"
          min="1"
          value={orderForm.quantity}
          onChange={(e) =>
            setOrderForm({
              ...orderForm,
              quantity: Number(e.target.value)
            })
          }
        />

      </div>

      <div className="modal-actions">

        <button
          type="button"
          onClick={() => setShowOrderModal(false)}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleAddOrder}
        >
          Add Order
        </button>

      </div>

    </div>
  </div>
)}

{/* Add Customer Modal */}

{showCustomerModal && (
  <div className="modal-overlay">

    <div className="customer-modal">

      <div className="modal-header">
        <div>
         <h2>
  {editingCustomerId ? "Edit Customer" : "Add Customer"}
</h2>

<p>
  {editingCustomerId
    ? "Update customer details"
    : "Enter customer details"}
</p>
        </div>

        <button
          className="close-btn"
          onClick={() => setShowCustomerModal(false)}
        >
          ×
        </button>
      </div>

      <div className="customer-form">

        <label>
          Name
          <input
            type="text"
            placeholder="Enter customer name"
            value={customerForm.name}
            onChange={(e) =>
              setCustomerForm({
                ...customerForm,
                name: e.target.value,
              })
            }
          />
        </label>

        <label>
          Mobile
          <input
            type="text"
            placeholder="Enter mobile number"
            value={customerForm.mobile}
            onChange={(e) =>
              setCustomerForm({
                ...customerForm,
                mobile: e.target.value,
              })
            }
          />
        </label>

        <label>
          Email
          <input
            type="email"
            placeholder="Enter email"
            value={customerForm.email}
            onChange={(e) =>
              setCustomerForm({
                ...customerForm,
                email: e.target.value,
              })
            }
          />
        </label>

        <label>
          Address
          <input
            type="text"
            placeholder="Enter address"
            value={customerForm.address}
            onChange={(e) =>
              setCustomerForm({
                ...customerForm,
                address: e.target.value,
              })
            }
          />
        </label>

      </div>

      <div className="modal-actions">

        <button
          className="cancel-btn"
          onClick={() => setShowCustomerModal(false)}
        >
          Cancel
        </button>

<button
  className="save-btn"
  onClick={
    editingCustomerId
      ? handleUpdateCustomer
      : handleAddCustomer
  }
>
  {editingCustomerId ? "Update Customer" : "Add Customer"}
</button>

      </div>

    </div>

  </div>
)}


      </main>


      {/* Footer */}
      <footer>

        <p>
          © 2026 SmartWater Delivery Management System
        </p>

      </footer>

      {showProductModal && (
  <div className="modal-overlay">
    <div className="modal">
      <button
        className="modal-close"
        onClick={() => setShowProductModal(false)}
      >
        ×
      </button>
<h2>
  {editingProductId ? "Edit Water Product" : "Add Water Product"}
</h2>

<p>
  {editingProductId
    ? "Update water product details"
    : "Enter water product details"}
</p>

 <form onSubmit={handleAddProduct}>
        <label>Product Name</label>
        <input
          type="text"
          value={productForm.productName}
          onChange={(e) =>
            setProductForm({
              ...productForm,
              productName: e.target.value,
            })
          }
          placeholder="Example: 20 Liter Water Can"
        />

        <label>Size (Liters)</label>
        <input
          type="number"
          value={productForm.sizeInLiters}
          onChange={(e) =>
            setProductForm({
              ...productForm,
              sizeInLiters: e.target.value,
            })
          }
          placeholder="20"
        />

        <label>Price</label>
        <input
          type="number"
          value={productForm.price}
          onChange={(e) =>
            setProductForm({
              ...productForm,
              price: e.target.value,
            })
          }
          placeholder="80"
        />

        <label>Stock Quantity</label>
<input
  type="number"
  min="0"
  value={productForm.stockQuantity}
  onChange={(e) =>
    setProductForm({
      ...productForm,
      stockQuantity: e.target.value,
    })
  }
  placeholder="100"
/>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={productForm.available}
            onChange={(e) =>
              setProductForm({
                ...productForm,
                available: e.target.checked,
              })
            }
          />
          Available
        </label>

        <div className="modal-actions">
          <button
            type="button"
            onClick={() => setShowProductModal(false)}
          >
            Cancel
          </button>

         <button type="submit">
  {editingProductId ? "Update Product" : "Add Product"}
</button>
        </div>
      </form>
    </div>
  </div>
)}

    </div>
  );
}

export default App;