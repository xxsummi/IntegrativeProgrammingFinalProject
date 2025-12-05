<template>
  <div class="navbar">
    <div class="navbar-content">
      <h1 class="page-title">Inventory Management</h1>
      <div class="navbar-actions">
        <el-badge :value="12" class="notification-badge">
          <el-button circle>
            <el-icon><Bell /></el-icon>
          </el-button>
        </el-badge>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Bell } from '@element-plus/icons-vue'
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
