<template>
  <div class="container">
    <h1>☕ Don Mac Drinks Menu</h1>

    <div v-if="loading">Loading products...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <ul class="product-list">
        <li v-for="product in products" :key="product.sku" class="product-card">
          <h2>{{ product.name }}</h2>
          <p>{{ product.description }}</p>
          <p><strong>₱{{ product.price.toFixed(2) }}</strong></p>
          <p>Stock: {{ product.stock }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "Products",
  data() {
    return {
      products: [],
      loading: true,
      error: null,
    };
  },
  mounted() {
    fetch("http://localhost:5099/api/products")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        this.products = data.products; // 👈 pick out the array
        this.loading = false;
      })
      .catch((err) => {
        this.error = err.message;
        this.loading = false;
      });
  },
};
</script>
