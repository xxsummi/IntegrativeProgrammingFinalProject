<template>
  <div class="inventory-page">
    <InventoryTable ref="tableRef" @open-add-dialog="showAddDialog = true" />

    <!-- Add Product Dialog -->
    <el-dialog v-model="showAddDialog" title="Add New Product" width="500px" class="product-dialog">
      <el-form :model="newProduct" label-width="100px" class="product-form">
        <el-form-item label="Name">
          <el-input v-model="newProduct.name" placeholder="Enter product name" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="newProduct.description" type="textarea" placeholder="Enter description" />
        </el-form-item>
        <el-form-item label="Price">
          <el-input v-model="newProduct.price" type="number" placeholder="0.00" />
        </el-form-item>
        <el-form-item label="Stock">
          <el-input v-model="newProduct.stock" type="number" placeholder="0" />
        </el-form-item>
        <el-form-item label="SKU">
          <el-input v-model="newProduct.sku" placeholder="Enter SKU" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAddDialog = false">Cancel</el-button>
          <el-button type="primary" @click="addProduct">Add Product</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api/axios'
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
    await api.post('/products', newProduct.value) // use api instead of axios
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
  margin: 0 5rem;
}

.product-dialog .el-dialog__header {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.product-form {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
