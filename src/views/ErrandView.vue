<template>
  <main class="page">
    <h1>跑腿委托</h1>
    <p>这里将展示校园跑腿任务信息。</p>
    <div class="page-content">
      <div class="feature-card">
        <h3>发布任务</h3>
        <p>发布跑腿需求，找到同学帮忙完成</p>
      </div>
      <div class="feature-card">
        <h3>接取任务</h3>
        <p>查看任务详情，接取适合自己的任务</p>
      </div>
      <div class="feature-card">
        <h3>赚取酬劳</h3>
        <p>完成任务获得酬劳，灵活赚取零花钱</p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goToPublish() {
  router.push('/publish?type=errand')
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