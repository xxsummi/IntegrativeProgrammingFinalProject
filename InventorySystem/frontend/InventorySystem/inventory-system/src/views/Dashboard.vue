<template>
  <div class="dashboard">
    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon products">
            <el-icon><Box /></el-icon>
          </div>
          <div class="stat-info">
            <h3>{{ totalProducts }}</h3>
            <p>Total Products</p>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon stock">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <h3>{{ totalStock }}</h3>
            <p>Items in Stock</p>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon low-stock">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <h3>{{ lowStockCount }}</h3>
            <p>Low Stock Items</p>
          </div>
        </div>
      </el-card>
    </div>

    <el-card class="recent-activity">
      <template #header>
        <h3>Recent Activity</h3>
      </template>
      <div class="activity-list">
        <div class="activity-item" v-for="activity in recentActivity" :key="activity.id">
          <div class="activity-icon">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="activity-content">
            <p>{{ activity.message }}</p>
            <span class="activity-time">{{ activity.time }}</span>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Box, TrendCharts, Warning, Clock } from '@element-plus/icons-vue'

const totalProducts = ref(0)
const totalStock = ref(0)
const lowStockCount = ref(0)
const recentActivity = ref([
  { id: 1, message: 'Product "Laptop" stock updated', time: '2 minutes ago' },
  { id: 2, message: 'New product "Mouse" added', time: '15 minutes ago' },
  { id: 3, message: 'Stock alert for "Keyboard"', time: '1 hour ago' }
])

onMounted(() => {
  // Simulate loading stats
  totalProducts.value = 156
  totalStock.value = 2847
  lowStockCount.value = 8
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  border: none;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-radius: 12px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-icon.products {
  background: #dbeafe;
  color: #3b82f6;
}

.stat-icon.stock {
  background: #dcfce7;
  color: #22c55e;
}

.stat-icon.low-stock {
  background: #fef3c7;
  color: #f59e0b;
}

.stat-info h3 {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.stat-info p {
  color: #64748b;
  margin: 4px 0 0 0;
  font-size: 14px;
}

.recent-activity {
  border: none;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-radius: 12px;
}

.recent-activity .el-card__header {
  padding: 20px 20px 0 20px;
}

.recent-activity h3 {
  color: #1e293b;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.activity-icon {
  width: 32px;
  height: 32px;
  background: #e2e8f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.activity-content p {
  margin: 0;
  color: #334155;
  font-weight: 500;
}

.activity-time {
  color: #64748b;
  font-size: 12px;
}
</style>
