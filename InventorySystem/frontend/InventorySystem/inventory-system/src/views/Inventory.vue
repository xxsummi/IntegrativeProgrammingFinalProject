<template>
  <div class="inventory-page">
    <!-- Card Container -->
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>Inventory</span>
        </div>
      </template>

      <!-- Table -->
      <InventoryTable ref="tableRef" @open-add-dialog="showAddDialog = true" />
    </el-card>

    <!-- Add Product Dialog -->
    <el-dialog v-model="showAddDialog" title="Add Product" width="500px">
      <el-form :model="newProduct" label-width="120px">
        <el-form-item label="Name">
          <el-input v-model="newProduct.name" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="newProduct.description" />
        </el-form-item>
        <el-form-item label="Price">
          <el-input v-model="newProduct.price" type="number" />
        </el-form-item>
        <el-form-item label="Stock">
          <el-input v-model="newProduct.stock" type="number" />
        </el-form-item>
        <el-form-item label="SKU">
          <el-input v-model="newProduct.sku" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">Cancel</el-button>
        <el-button type="primary" @click="addProduct">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import InventoryTable from '../components/InventoryTable.vue'

const showAddDialog = ref(false)

const newProduct = ref({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  sku: ''
})

const tableRef = ref(null)

const addProduct = async () => {
  try {
    await axios.post('https://localhost:7266/api/products', newProduct.value)
    showAddDialog.value = false
    newProduct.value = { name: '', description: '', price: 0, stock: 0, sku: '' }
    if (tableRef.value?.fetchProducts) {
      tableRef.value.fetchProducts()
    }
  } catch (err) {
    console.error('Failed to add product:', err)
  }
}
</script>

<style scoped>
.inventory-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
