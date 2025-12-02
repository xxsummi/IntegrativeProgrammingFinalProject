import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ProductGrid.css";

function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  // Fetch products on load
  useEffect(() => {
    axios.get("http://localhost:3000/api/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error("Failed to fetch products:", err));
  }, []);

  // Add item to cart
  const handleBuy = (product) => {
    const updatedCart = [...cart, product];
    setCart(updatedCart);
    setTotal(prev => prev + Number(product.unit_price));
  };

  // Finalize purchase
  const handlePurchase = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
      const salePayload = {
        items: cart.map(item => ({
          product_sku: item.sku,
          quantity: 1
        }))
      };

      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to purchase.");
        return;
      }

      // Send request with Authorization header
      await axios.post(
        "http://localhost:3000/api/sales",
        salePayload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert(`Purchase successful! Total: ₱${total}`);

      // Reset cart
      setCart([]);
      setTotal(0);
    } catch (err) {
      console.error("Purchase error:", err);
      alert("Purchase failed!");
    }
  };

  // Remove item from cart
  const handleRemove = (index) => {
    const itemToRemove = cart[index];
    const updatedCart = cart.filter((_, idx) => idx !== index);
    setCart(updatedCart);
    setTotal(prev => prev - Number(itemToRemove.unit_price));
  };


  return (
    <div>
      <div className="grid-container">
        {products.map(p => (
          <div className="product-card" key={p.sku}>
            <div className="product-image">📷</div>
            <h3>{p.name}</h3>
            <p>₱{p.unit_price}</p>
            <button onClick={() => handleBuy(p)}>Buy</button>
          </div>
        ))}
      </div>

      {/* Cart UI */}
      <div className="cart">
        <h2>Cart</h2>
        <ul>
          {cart.map((item, idx) => (
            <li key={idx}>
              {item.name} - ₱{item.unit_price}{" "}
              <button onClick={() => handleRemove(idx)}>Remove</button>
            </li>
          ))}
        </ul>
        <h3>Total: ₱{total}</h3>
        <button onClick={handlePurchase} disabled={cart.length === 0}>
          Purchase
        </button>
      </div>
    </div>
  );
}

export default ProductGrid;
