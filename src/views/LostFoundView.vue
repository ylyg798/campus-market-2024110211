<template>
  <main class="page">
    <h1>失物招领</h1>
    <p>这里将展示校园失物招领信息。</p>
    <div class="page-content">
      <div class="feature-card">
        <h3>寻物启事</h3>
        <p>发布丢失物品信息，寻找失物下落</p>
      </div>
      <div class="feature-card">
        <h3>拾物招领</h3>
        <p>捡到物品，发布信息寻找失主</p>
      </div>
      <div class="feature-card">
        <h3>领取奖励</h3>
        <p>提供线索或归还物品可获得奖励</p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goToPublish() {
  router.push('/publish?type=lostfound')
}
</script>

<style scoped>
.page {
  padding: 24px;
}

.page h1 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.page p {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
}

.page-content {
  display: grid;
  gap: 16px;
}

.feature-card {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.feature-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.feature-card p {
  font-size: 14px;
  color: #666;
  margin: 0;
}
</style>