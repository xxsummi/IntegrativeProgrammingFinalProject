import React, { useState } from "react";
import ProductGrid from "./components/ProductGrid";
import Login from "./components/Login";

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
  };

  return (
    <div>
      <h1>Don Macchiato Coffee Shop</h1>
      {loggedIn ? (
        <>
          <button onClick={handleLogout} style={{ marginBottom: 20 }}>
            Logout
          </button>
          <ProductGrid />
        </>
      ) : (
        <Login onLogin={() => setLoggedIn(true)} />
      )}
    </div>
  );
}

export default App;
