<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import AppLayout from '@/components/AppLayout.vue'
import SetupView from '@/views/SetupView.vue'

const userStore = useUserStore()

const isLoggedIn = computed(() => userStore.user)

onMounted(() => {
  userStore.loadUser()
})
</script>

<template>
  <div id="app">
    <template v-if="isLoggedIn">
      <AppLayout />
    </template>
    <template v-else>
      <SetupView />
    </template>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f7fb;
  color: #1e293b;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
}
</style>