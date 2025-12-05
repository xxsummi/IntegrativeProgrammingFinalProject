<template>
  <div class="sidebar-container">
    <div class="sidebar-header">
      <div v-if="!collapsed" class="logo">
        <el-icon class="logo-icon"><Box /></el-icon>
        <span class="logo-text">Inventory</span>
      </div>
      <el-button 
        @click="$emit('toggle')" 
        class="toggle-btn"
        :icon="collapsed ? 'Expand' : 'Fold'" 
        circle 
        size="small" 
      />
    </div>
    
    <el-menu 
      default-active="/inventory" 
      router 
      :collapse="collapsed"
      class="sidebar-menu"
    >
      <el-menu-item index="/inventory" class="menu-item">
        <el-icon><Box /></el-icon>
        <span>Products</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { Box } from '@element-plus/icons-vue'

defineProps({
  collapsed: Boolean
})

defineEmits(['toggle'])
</script>

<style scoped>
.sidebar-container {
  height: 100%;
  background: linear-gradient(180deg, #1e293b 0%, #334155 100%);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  color: #3b82f6;
  font-size: 24px;
}

.logo-text {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.toggle-btn {
  background: rgba(255,255,255,0.1) !important;
  border: none !important;
  color: white !important;
}

.toggle-btn:hover {
  background: rgba(255,255,255,0.2) !important;
}

.sidebar-menu {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px 0;
}

.sidebar-menu .el-menu-item {
  color: #cbd5e1;
  margin: 4px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}

.sidebar-menu .el-menu-item:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.sidebar-menu .el-menu-item.is-active {
  background: #3b82f6;
  color: white;
}

.sidebar-menu .el-menu-item .el-icon {
  margin-right: 12px;
}
</style>
