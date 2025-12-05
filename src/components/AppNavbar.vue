<template>
  <nav class="navbar">
    <div class="nav-container">
      <h1 class="nav-title" @click="goHome" style="cursor: pointer">physics-bank 高中物理题典</h1>
      <div class="nav-links">
        <button class="nav-link" @click="goHome">题目列表</button>
        <button class="nav-link" @click="goAdd">添加题目</button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push({ name: 'Home' })
}

const goAdd = () => {
  router.push({ name: 'AddQuestion' })
}
</script>
