<template>
  <main class="page">
    <h1>二手交易</h1>
    <p>这里将展示校园二手商品信息。</p>
    <div class="page-content">
      <div class="feature-card">
        <h3>浏览商品</h3>
        <p>查看各类二手商品，找到你需要的物品</p>
      </div>
      <div class="feature-card">
        <h3>发布商品</h3>
        <p>发布闲置物品，与同学进行交易</p>
      </div>
      <div class="feature-card">
        <h3>价格筛选</h3>
        <p>按价格区间筛选，找到性价比最高的商品</p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goToPublish() {
  router.push('/publish?type=secondhand')
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