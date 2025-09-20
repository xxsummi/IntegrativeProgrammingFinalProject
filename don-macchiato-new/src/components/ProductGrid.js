import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ProductGrid.css";

function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  // Fetch products on load
  useEffect(() => {
    axios.get("http://localhost:8080/api/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error("Failed to fetch products:", err));
  }, []);

  // Add item to cart
  const handleBuy = (product) => {
    const updatedCart = [...cart, product];
    setCart(updatedCart);
    setTotal(prev => prev + Number(product.price));
  };

  // Finalize purchase
  const handlePurchase = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
      // For simplicity, we just send one request per product
      // You could optimize this into a single "bulk order" request
      for (const product of cart) {
        await axios.post("http://localhost:8080/api/buy", {
          user_id: 1,             // hardcoded for demo
          product_sku: product.sku,
          quantity: 1
        });
      }

      alert(`Purchase successful! Total: ₱${total}`);

      // Reset cart
      setCart([]);
      setTotal(0);
    } catch (err) {
      console.error("Purchase error:", err);
      alert("Purchase failed!");
    }
  };

  return (
    <div>
      <div className="grid-container">
        {products.map(p => (
          <div className="product-card" key={p.sku}>
            <div className="product-image">📷</div>
            <h3>{p.name}</h3>
            <p>₱{p.price}</p>
            <button onClick={() => handleBuy(p)}>Buy</button>
          </div>
        ))}
      </div>

      {/* Cart UI */}
      <div className="cart">
        <h2>Cart</h2>
        <ul>
          {cart.map((item, idx) => (
            <li key={idx}>{item.name} - ₱{item.price}</li>
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
