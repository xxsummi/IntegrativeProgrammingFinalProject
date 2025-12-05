<template>
  <el-container class="app-container">
    <el-header class="header">
      <Navbar />
    </el-header>

    <el-main class="content">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #f8fafc;
}

.app-container {
  height: 100vh;
  background: #f8fafc;
}



.header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 0 24px;
}

.content {
  background: #f8fafc;
  padding: 24px;
}
</style>
