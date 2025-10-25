<template>
  <div style="padding: 20px">
    <!-- Header Actions -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <el-button type="primary" @click="showAddDialog = true">
        Add Product
      </el-button>

      <!-- Search -->
      <el-input
        v-model="search"
        placeholder="Search by name"
        clearable
        @input="fetchProducts"
        style="width: 300px"
      />
    </div>

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

    <!-- Table -->
    <el-table :data="products" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="120" />
      <el-table-column prop="name" label="Name" />
      <el-table-column prop="description" label="Description" />
      <el-table-column prop="price" label="Price" />
      <el-table-column prop="stock" label="Stock" />
      <el-table-column prop="sku" label="SKU" />

      <el-table-column label="Actions" width="240">
        <template #default="scope">
          <el-button size="small" @click="openEditDialog(scope.row)">
            Edit
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="deleteProduct(scope.row.id)"
            style="margin-left: 5px"
          >
            Delete
          </el-button>
          <el-button
            type="success"
            size="small"
            @click="addStock(scope.row)"
            style="margin-left: 5px"
          >
            + Stock
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <el-pagination
      background
      layout="prev, pager, next"
      :page-size="pageSize"
      :current-page="page"
      :total="totalItems"
      @current-change="handlePageChange"
      style="margin-top: 20px; text-align: center"
    />

    <!-- Edit Dialog -->
    <el-dialog v-model="editDialogVisible" title="Edit Product" width="500px">
      <el-form :model="editProduct" label-width="120px">
        <el-form-item label="Name">
          <el-input v-model="editProduct.name" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="editProduct.description" />
        </el-form-item>
        <el-form-item label="Price">
          <el-input v-model="editProduct.price" type="number" />
        </el-form-item>
        <el-form-item label="Stock">
          <el-input v-model="editProduct.stock" type="number" />
        </el-form-item>
        <el-form-item label="SKU">
          <el-input v-model="editProduct.sku" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveEdit">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'InventoryTable',
  data() {
    return {
      products: [],
      page: 1,
      pageSize: 5,
      totalItems: 0,
      search: '',
      showAddDialog: false,
      newProduct: {
        name: '',
        description: '',
        price: 0,
        stock: 0,
        sku: ''
      },
      editDialogVisible: false,
      editProduct: {
        id: '',
        name: '',
        description: '',
        price: 0,
        stock: 0,
        sku: ''
      }
    }
  },
  mounted() {
    this.fetchProducts()
  },
  methods: {
    async fetchProducts() {
      try {
        const response = await axios.get('https://localhost:7266/api/products', {
          params: {
            page: this.page,
            pageSize: this.pageSize,
            search: this.search
          }
        })
        this.products = response.data.products || []
        this.totalItems = response.data.totalItems || 0
      } catch (err) {
        console.error(err)
      }
    },
    async addProduct() {
      try {
        await axios.post('https://localhost:7266/api/products', this.newProduct)
        this.showAddDialog = false
        this.newProduct = { name: '', description: '', price: 0, stock: 0, sku: '' }
        this.fetchProducts()
      } catch (err) {
        console.error('Failed to add product:', err)
      }
    },
    handlePageChange(page) {
      this.page = page
      this.fetchProducts()
    },
    openEditDialog(product) {
      this.editProduct = { ...product }
      this.editDialogVisible = true
    },
    async saveEdit() {
      try {
        await axios.put(`https://localhost:7266/api/products/${this.editProduct.id}`, this.editProduct)
        this.editDialogVisible = false
        this.fetchProducts()
      } catch (err) {
        console.error(err)
      }
    },
    async deleteProduct(id) {
      if (confirm('Are you sure you want to delete this product?')) {
        try {
          await axios.delete(`https://localhost:7266/api/products/${id}`)
          this.fetchProducts()
        } catch (err) {
          console.error(err)
        }
      }
    },
    async addStock(product) {
      const amount = prompt('Enter amount to add:', 1)
      if (amount && !isNaN(amount)) {
        try {
          await axios.put(`https://localhost:7266/api/products/${product.id}/addstock`, {
            amount: parseInt(amount)
          })
          this.fetchProducts()
        } catch (err) {
          console.error(err)
        }
      }
    }
  }
}
</script>

<style scoped>
.inventory-page {
  padding: 20px;
}
</style>
