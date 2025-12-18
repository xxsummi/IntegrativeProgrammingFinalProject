<template>
  <div class="navbar">
    <div class="navbar-content">
      <h1 class="page-title">Inventory Management</h1>
      <div class="navbar-actions">
        <el-dropdown trigger="click">
          <el-badge :value="notifications.length" class="notification-badge">
            <el-button circle>
              <el-icon><Bell /></el-icon>
            </el-button>
          </el-badge>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-if="notifications.length === 0" disabled>
                No new notifications
              </el-dropdown-item>
              <el-dropdown-item v-for="(note, index) in notifications" :key="index">
                {{ note.message }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Bell } from '@element-plus/icons-vue'
import signalr from '../api/signalr' // make sure this is the same instance

const notifications = ref([])

onMounted(async () => {
  await signalr.connect() // ensure it's connected

  // Listen to stock updates
  signalr.on('stockUpdated', (data) => {
    notifications.value.unshift({
      message: `Stock updated for SKU ${data.sku}: ${data.stock} remaining`
    })
  })
})

onBeforeUnmount(() => {
  // optional: don't disconnect if other components also use it
})
</script>

<style scoped>
.navbar {
  height: 100%;
  display: flex;
  align-items: center;
}

.navbar-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  color: #1e293b;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-badge .el-button {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.notification-badge .el-button:hover {
  background: #e2e8f0;
  color: #3b82f6;
}
</style>
