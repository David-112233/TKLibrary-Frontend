<template>
  <nav class="navbar bg-white shadow-md">
    <div class="nav-container container mx-auto px-4 py-3 flex justify-between items-center">
      <h1 class="nav-title text-xl font-bold text-primary-color cursor-pointer transition-all hover:scale-105" @click="goHome">physics-bank 高中物理题典</h1>
      <div class="nav-links flex gap-3">
        <button class="nav-link rounded-md px-4 py-2 transition-all hover:bg-primary-light" @click="goHome">题目列表</button>
        <button class="nav-link rounded-md px-4 py-2 transition-all hover:bg-primary-light" @click="goAdd">添加题目</button>
        <button class="nav-link rounded-md px-4 py-2 transition-all hover:bg-primary-light" @click="goAIChat">AI问答</button>
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

const goAIChat = () => {
  router.push({ name: 'AIChat' })
}
</script>

<style scoped>
.navbar {
  background-color: var(--card-background);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-title {
  color: var(--primary-color);
  margin: 0;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-link {
  background-color: lightskyblue;
  border: none;
  color: var(--text-color);
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-md);
  transition: var(--transition);
}

.nav-link:hover {
  background-color: var(--primary-light);
  color: var(--primary-color);
}

.text-primary-color {
  color: var(--primary-color);
}

.bg-primary-light {
  background-color: var(--primary-light);
}
</style>
