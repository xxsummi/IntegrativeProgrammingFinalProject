<template>
  <div class="inventory-container">
    <el-card class="inventory-card">
      <template #header>
        <div class="card-header">
          <h3 class="card-title">Product Inventory</h3>
          <div class="header-actions">
            <el-input
              v-model="search"
              placeholder="Search products..."
              clearable
              @input="fetchProducts"
              class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="showAddDialog = true" class="add-btn">
              <el-icon><Plus /></el-icon>
              Add Product
            </el-button>
          </div>
        </div>
      </template>

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
      <el-table :data="products" class="products-table" stripe>
        <el-table-column prop="id" label="ID" width="200" />
        <el-table-column prop="name" label="Product Name" min-width="200" />
        <el-table-column prop="description" label="Description" min-width="250" show-overflow-tooltip />
        <el-table-column prop="price" label="Price" width="120">
          <template #default="scope">
            <span class="price">${{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="Stock" width="100">
          <template #default="scope">
            <el-tag :type="getStockStatus(scope.row.stock)" size="small">
              {{ scope.row.stock }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sku" label="SKU" width="120" />

        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button size="small" @click="openEditDialog(scope.row)" class="edit-btn">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button size="small" @click="addStock(scope.row)" class="stock-btn">
                <el-icon><Plus /></el-icon>
              </el-button>
              <el-button
                size="small"
                @click="deleteProduct(scope.row.id)"
                class="delete-btn"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :page-size="pageSize"
          :current-page="page"
          :total="totalItems"
          @current-change="handlePageChange"
          class="pagination"
        />
      </div>
    </el-card>

    <!-- Edit Dialog -->
    <el-dialog v-model="editDialogVisible" title="Edit Product" width="500px" class="edit-dialog">
      <el-form :model="editProduct" label-width="100px" class="edit-form">
        <el-form-item label="Name">
          <el-input v-model="editProduct.name" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="editProduct.description" type="textarea" />
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
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="saveEdit">Save Changes</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import api from '../api/axios'
import signalr from '../api/signalr'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'

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
  async mounted() {
    this.fetchProducts()
    await signalr.connect()
    
    signalr.on('stockUpdated', (data) => {
      const product = this.products.find(p => p.sku === data.sku)
      if (product) {
        product.stock = data.stock
      }
    })
    
    signalr.on('productAdded', () => {
      this.fetchProducts()
    })
    
    signalr.on('productDeleted', () => {
      this.fetchProducts()
    })
  },
  
  beforeUnmount() {
    signalr.disconnect()
  },
  methods: {
    async fetchProducts() {
      try {
        const response = await api.get('/products', {
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
        await api.post('/products', this.newProduct)
        this.showAddDialog = false
        this.newProduct = { name: '', description: '', price: 0, stock: 0, sku: '' }
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
        await api.put(`/products/${this.editProduct.id}`, this.editProduct)
        this.editDialogVisible = false
        this.fetchProducts()
      } catch (err) {
        console.error(err)
      }
    },
    async deleteProduct(id) {
      if (confirm('Are you sure you want to delete this product?')) {
        try {
          await api.delete(`/products/${id}`)
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
          await api.post(`/products/addstock/${product.id}`, {
            amount: parseInt(amount)
          })
          this.fetchProducts()
        } catch (err) {
          console.error(err)
        }
      }
    },
    getStockStatus(stock) {
      if (stock <= 10) return 'danger'
      if (stock <= 50) return 'warning'
      return 'success'
    }
  },
  components: {
    Search,
    Plus,
    Edit,
    Delete
  }
}
</script>

<style scoped>
.inventory-container {
  margin: 0 auto;
  align-items: center;
  justify-content: center;
}

.inventory-card {
  border: none;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.card-title {
  color: #1e293b;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 280px;
}

.add-btn {
  background: #3b82f6;
  border: none;
  border-radius: 8px;
  font-weight: 500;
}

.products-table {
  margin: 20px 0;
  width: 100%;
}

.price {
  font-weight: 600;
  color: #059669;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.edit-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #3b82f6;
}

.stock-btn {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #059669;
}

.delete-btn {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.edit-btn:hover {
  background: #e2e8f0;
}

.stock-btn:hover {
  background: #dcfce7;
}

.delete-btn:hover {
  background: #fee2e2;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.edit-dialog .el-dialog__header {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.edit-form {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
