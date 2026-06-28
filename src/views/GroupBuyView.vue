<template>
  <main class="page">
    <h1>拼单搭子</h1>
    <p>这里将展示校园拼单团购信息。</p>
    <div class="page-content">
      <div class="feature-card">
        <h3>发起拼单</h3>
        <p>邀请同学一起团购，享受更低价格</p>
      </div>
      <div class="feature-card">
        <h3>参与拼单</h3>
        <p>加入他人发起的拼单，一起省钱</p>
      </div>
      <div class="feature-card">
        <h3>进度追踪</h3>
        <p>查看拼单进度，及时了解成团情况</p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goToPublish() {
  router.push('/publish?type=groupbuy')
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