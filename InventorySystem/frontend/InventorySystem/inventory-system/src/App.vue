<template>
  <el-container style="height: 100vh">
    <el-aside width="200px">
      <Sidebar />
    </el-aside>

    <el-container>
      <el-header>
        <Navbar />
      </el-header>

      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
</script>
