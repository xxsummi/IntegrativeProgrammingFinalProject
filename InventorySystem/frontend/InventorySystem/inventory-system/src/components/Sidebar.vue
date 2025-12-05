<template>
  <div style="height: 100%; background: #545c64;">
    <div style="padding: 10px; text-align: center; border-bottom: 1px solid #434a50;">
      <el-button @click="$emit('toggle')" type="primary" :icon="collapsed ? 'Expand' : 'Fold'" circle size="small" />
    </div>
    <el-menu 
      default-active="1" 
      router 
      :collapse="collapsed"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
    >
      <el-menu-item index="/">
        <el-icon><House /></el-icon>
        <span>Dashboard</span>
      </el-menu-item>
      <el-menu-item index="/inventory">
        <el-icon><Box /></el-icon>
        <span>Inventory</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { House, Box } from '@element-plus/icons-vue'

defineProps({
  collapsed: Boolean
})

defineEmits(['toggle'])
</script>
