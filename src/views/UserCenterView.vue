<template>
  <main class="page">
    <h1>个人中心</h1>
    <p>这里将展示用户个人信息和功能入口。</p>
    <div class="page-content">
      <div class="feature-card">
        <h3>个人信息</h3>
        <p>查看和编辑个人资料</p>
      </div>
      <div class="feature-card">
        <h3>我的发布</h3>
        <p>管理已发布的信息</p>
      </div>
      <div class="feature-card">
        <h3>我的收藏</h3>
        <p>查看收藏的商品和信息</p>
      </div>
      <div class="feature-card">
        <h3>交易记录</h3>
        <p>查看历史交易记录</p>
      </div>
      <div class="feature-card">
        <h3>设置</h3>
        <p>账号设置和偏好配置</p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goToProfile() {
  router.push('/profile')
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