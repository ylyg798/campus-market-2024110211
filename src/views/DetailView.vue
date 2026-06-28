<script setup lang="ts">import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useMarketStore } from '@/stores/marketStore';
import { useFavoriteStore } from '@/stores/favoriteStore';
import { useUserStore } from '@/stores/userStore';
import { useMessageStore } from '@/stores/messageStore';
import type { InfoType, InfoStatus } from '@/types/market';
const router = useRouter();
const route = useRoute();
const marketStore = useMarketStore();
const favoriteStore = useFavoriteStore();
const userStore = useUserStore();
const messageStore = useMessageStore();
const isFavorite = ref(false);
const showBargainModal = ref(false);
const bargainOffer = ref('');
const bargainResult = ref('');
const showStatusModal = ref(false);
const selectedStatus = ref<'active' | 'claimed' | 'in-progress' | 'completed' | 'closed'>('active');
const taskProgressText = ref('');
const infoTypes: {
 type: InfoType;
 label: string;
 icon: string;
}[] = [
 { type: 'secondhand', label: '二手交易', icon: '🛒' },
 { type: 'lostfound', label: '失物招领', icon: '🔍' },
 { type: 'groupbuy', label: '拼单搭子', icon: '🤝' },
 { type: 'errand', label: '跑腿委托', icon: '🚶' },
];
const qualityLabels: Record<string, string> = {
 'new': '全新',
 'like-new': '几乎全新',
 'good': '成色良好',
 'fair': '有使用痕迹',
 'poor': '成色较差',
};
const statusLabels: Record<string, string> = {
 'active': '待接取',
 'claimed': '已接取',
 'in-progress': '进行中',
 'completed': '已完成',
 'closed': '已关闭',
};
const currentInfo = computed(() => marketStore.currentInfo);
const canAcceptTask = computed(() => {
 if (!currentInfo.value || !userStore.user) return false;
 if (currentInfo.value.type !== 'errand') return false;
 if (currentInfo.value.status !== 'active') return false;
 if (currentInfo.value.publisher.id === userStore.user.id) return false;
 return true;
});
const isTaskPublisher = computed(() => {
 if (!currentInfo.value || !userStore.user) return false;
 return currentInfo.value.publisher.id === userStore.user.id;
});
const isTaskAssignee = computed(() => {
 if (!currentInfo.value || !userStore.user) return false;
 return currentInfo.value.assignee?.id === userStore.user.id;
});
function getTypeName(type: InfoType) {
 return infoTypes.find(t => t.type === type)?.label || type;
}
function getTypeIcon(type: InfoType) {
 return infoTypes.find(t => t.type === type)?.icon || '📋';
}
function formatTime(dateString: string) {
 const date = new Date(dateString);
 return date.toLocaleString('zh-CN', {
 year: 'numeric',
 month: '2-digit',
 day: '2-digit',
 hour: '2-digit',
 minute: '2-digit',
 });
}
function toggleFavorite() {
 if (!userStore.user)
 return;
 const info = currentInfo.value;
 if (!info)
 return;
 favoriteStore.toggleFavorite(userStore.user.id, info.id, info.type, info.title);
 isFavorite.value = !isFavorite.value;
}
async function contactPublisher() {
 if (!userStore.user || !currentInfo.value)
 return;
 await messageStore.createConversation(userStore.user.id, currentInfo.value.publisher.id, currentInfo.value.id, currentInfo.value.title);
 router.push('/messages');
}
function openBargain() {
 showBargainModal.value = true;
 bargainOffer.value = '';
 bargainResult.value = '';
}
function submitBargain() {
 if (!currentInfo.value?.price || !bargainOffer.value)
 return;
 const offer = parseFloat(bargainOffer.value);
 const price = currentInfo.value.price;
 bargainResult.value = messageStore.generateBargainReply(offer, price);
}
function closeBargain() {
 showBargainModal.value = false;
}
async function acceptTask() {
 if (!canAcceptTask.value || !userStore.user) return;
 try {
 await marketStore.acceptTask(currentInfo.value!.id, userStore.user.id, userStore.user.nickname);
 alert('成功接取任务！请与发布者联系确认细节。');
 } catch (error) {
 alert('接取任务失败，请稍后重试');
 }
}
function openStatusModal() {
 if (!currentInfo.value) return;
 selectedStatus.value = currentInfo.value.status as 'active' | 'claimed' | 'in-progress' | 'completed' | 'closed';
 taskProgressText.value = currentInfo.value.taskProgress || '';
 showStatusModal.value = true;
}
async function updateTaskStatus() {
 if (!currentInfo.value) return;
 try {
 await marketStore.updateTaskStatus(
 currentInfo.value.id,
 selectedStatus.value,
 taskProgressText.value
 );
 showStatusModal.value = false;
 alert('任务状态已更新');
 } catch (error) {
 alert('更新失败，请稍后重试');
 }
}
function closeStatusModal() {
 showStatusModal.value = false;
}
async function fetchData() {
 const id = route.params.id as string;
 await marketStore.fetchMarketInfo(id);
 if (userStore.user) {
 await favoriteStore.fetchFavorites(userStore.user.id);
 isFavorite.value = favoriteStore.isFavorite(id);
 }
}
onMounted(() => {
 fetchData();
});
</script>

<template>
  <div class="detail-page">
    <header class="detail-header">
      <div class="header-content">
        <button class="back-btn" @click="router.back()">
          <span>←</span>
        </button>
        <h1>信息详情</h1>
        <div class="header-actions">
          <button class="favorite-btn" :class="{ active: isFavorite }" @click="toggleFavorite()">
            <span>{{ isFavorite ? '❤️' : '🤍' }}</span>
          </button>
        </div>
      </div>
    </header>

    <main v-if="currentInfo" class="detail-main">
      <div class="image-section">
        <div v-if="currentInfo.images.length > 0" class="image-slider">
          <img v-for="(img, index) in currentInfo.images" :key="index" :src="img" :alt="currentInfo.title" />
        </div>
        <div v-else class="no-image-section">
          <span class="no-image-icon">{{ getTypeIcon(currentInfo.type) }}</span>
          <span class="no-image-text">{{ getTypeName(currentInfo.type) }}</span>
        </div>
      </div>

      <div class="info-section">
        <div class="info-header">
          <div class="type-badge">{{ getTypeName(currentInfo.type) }}</div>
          <div class="status-badge" :class="currentInfo.status">
            {{ currentInfo.status === 'active' ? '进行中' : currentInfo.status === 'completed' ? '已完成' : '已关闭' }}
          </div>
        </div>

        <h2 class="info-title">{{ currentInfo.title }}</h2>

        <div class="info-meta">
          <div class="meta-item">
            <span class="meta-icon">📍</span>
            <span>{{ currentInfo.campus }} · {{ currentInfo.location }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">🕐</span>
            <span>{{ formatTime(currentInfo.createdAt) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">👁️</span>
            <span>浏览 {{ currentInfo.viewCount }} 次</span>
          </div>
        </div>

        <div class="price-section" v-if="currentInfo.price">
          <div class="price-label">价格</div>
          <div class="price-value">¥{{ currentInfo.price }}</div>
          <button v-if="currentInfo.type === 'secondhand'" class="bargain-btn" @click="openBargain()">
            💰 砍价
          </button>
        </div>

        <div class="special-fields" v-if="currentInfo.type === 'secondhand' && currentInfo.quality">
          <div class="field-row">
            <span class="field-label">成色</span>
            <span class="field-value">{{ qualityLabels[currentInfo.quality] }}</span>
          </div>
        </div>

        <div class="special-fields" v-if="currentInfo.type === 'lostfound'">
          <div class="field-row">
            <span class="field-label">类型</span>
            <span class="field-value">{{ currentInfo.lostFoundType === 'lost' ? '丢失物品' : '拾获物品' }}</span>
          </div>
          <div class="field-row" v-if="currentInfo.itemFeatures">
            <span class="field-label">物品特征</span>
            <span class="field-value">{{ currentInfo.itemFeatures }}</span>
          </div>
        </div>

        <div class="special-fields" v-if="currentInfo.type === 'groupbuy'">
          <div class="field-row">
            <span class="field-label">参与人数</span>
            <span class="field-value">{{ currentInfo.currentCount }}/{{ currentInfo.targetCount }} 人</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${((currentInfo.currentCount || 0) / (currentInfo.targetCount || 1)) * 100}%` }"></div>
          </div>
          <div class="field-row" v-if="currentInfo.deadline">
            <span class="field-label">截止时间</span>
            <span class="field-value">{{ formatTime(currentInfo.deadline) }}</span>
          </div>
        </div>

        <div class="special-fields" v-if="currentInfo.type === 'errand'">
          <div class="field-row">
            <span class="field-label">任务状态</span>
            <span class="field-value task-status" :class="currentInfo.status">
              {{ statusLabels[currentInfo.status] || currentInfo.status }}
            </span>
          </div>
          <div class="field-row" v-if="currentInfo.taskContent">
            <span class="field-label">任务内容</span>
            <span class="field-value">{{ currentInfo.taskContent }}</span>
          </div>
          <div class="field-row" v-if="currentInfo.reward">
            <span class="field-label">酬劳</span>
            <span class="field-value reward">¥{{ currentInfo.reward }}</span>
          </div>
          <div class="field-row" v-if="currentInfo.expectedTime">
            <span class="field-label">期望完成时间</span>
            <span class="field-value">{{ formatTime(currentInfo.expectedTime) }}</span>
          </div>

          <!-- 任务接取者信息 -->
          <div class="assignee-section" v-if="currentInfo.assignee">
            <div class="assignee-header">
              <span class="assignee-icon">✅</span>
              <span class="assignee-title">已由同学接取</span>
            </div>
            <div class="assignee-info">
              <div class="assignee-avatar">
                <span>👤</span>
              </div>
              <div class="assignee-details">
                <div class="assignee-name">{{ currentInfo.assignee.nickname }}</div>
                <div class="assignee-time">接取时间：{{ formatTime(currentInfo.assignee.acceptedAt) }}</div>
              </div>
            </div>
          </div>

          <!-- 任务进度 -->
          <div class="task-progress-section" v-if="currentInfo.taskProgress">
            <div class="progress-header">
              <span class="progress-icon">📝</span>
              <span class="progress-title">任务进度</span>
            </div>
            <div class="progress-content">{{ currentInfo.taskProgress }}</div>
          </div>

          <!-- 任务管理按钮 -->
          <div class="task-actions" v-if="currentInfo.type === 'errand'">
            <!-- 接任务按钮 -->
            <button v-if="canAcceptTask" class="accept-task-btn" @click="acceptTask()">
              🎯 接受任务
            </button>

            <!-- 状态管理按钮 -->
            <button
              v-if="isTaskPublisher || isTaskAssignee"
              class="update-status-btn"
              @click="openStatusModal()"
            >
              🔄 更新任务状态
            </button>
          </div>
        </div>

        <div class="tags-section">
          <div v-for="tag in currentInfo.tags" :key="tag" class="tag">{{ tag }}</div>
        </div>

        <div class="description-section">
          <h3>详细描述</h3>
          <p>{{ currentInfo.description }}</p>
        </div>

        <div class="publisher-section">
          <div class="publisher-avatar">
            <span>👤</span>
          </div>
          <div class="publisher-info">
            <div class="publisher-name">{{ currentInfo.publisher.nickname }}</div>
            <div class="publisher-role">发布者</div>
          </div>
          <button class="contact-btn" @click="contactPublisher()">
            💬 联系
          </button>
        </div>

        <div class="safety-tips">
          <div class="tips-header">
            <span class="tips-icon">⚠️</span>
            <h3>交易安全提醒</h3>
          </div>
          <ul class="tips-list">
            <li>📍 尽量选择公共地点交易</li>
            <li>🔍 贵重物品注意验真</li>
            <li>🔒 保护个人联系方式和隐私</li>
          </ul>
        </div>
      </div>
    </main>

    <nav class="bottom-nav">
      <button class="nav-item" @click="router.push('/')">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">首页</span>
      </button>
      <button class="nav-item" @click="router.push('/market')">
        <span class="nav-icon">🛒</span>
        <span class="nav-label">集市</span>
      </button>
      <button class="nav-item publish-btn" @click="router.push('/publish')">
        <span class="nav-icon">+</span>
      </button>
      <button class="nav-item" @click="router.push('/messages')">
        <span class="nav-icon">💬</span>
        <span class="nav-label">消息</span>
      </button>
      <button class="nav-item" @click="router.push('/profile')">
        <span class="nav-icon">👤</span>
        <span class="nav-label">我的</span>
      </button>
    </nav>

    <div v-if="showBargainModal" class="modal-overlay" @click="closeBargain()">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>💰 模拟砍价</h3>
          <button class="close-btn" @click="closeBargain()">✕</button>
        </div>
        <div class="modal-body">
          <p class="original-price">原价：¥{{ currentInfo?.price }}</p>
          <div class="bargain-input-group">
            <label>您的出价：</label>
            <div class="input-wrapper">
              <span>¥</span>
              <input v-model="bargainOffer" type="number" placeholder="输入出价金额" />
            </div>
          </div>
          <div v-if="bargainResult" class="bargain-result">
            <p>卖家回复：</p>
            <p class="result-text">{{ bargainResult }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeBargain()">取消</button>
          <button class="submit-btn" @click="submitBargain()">提交出价</button>
        </div>
      </div>
    </div>

    <!-- 任务状态更新模态框 -->
    <div v-if="showStatusModal" class="modal-overlay" @click="closeStatusModal()">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>🔄 更新任务状态</h3>
          <button class="close-btn" @click="closeStatusModal()">✕</button>
        </div>
        <div class="modal-body">
          <div class="status-options">
            <label class="status-label">选择任务状态：</label>
            <div class="status-grid">
              <button
                v-for="(label, status) in statusLabels"
                :key="status"
                class="status-option"
                :class="{ active: selectedStatus === status }"
                @click="selectedStatus = status as 'active' | 'claimed' | 'in-progress' | 'completed' | 'closed'"
              >
                {{ label }}
              </button>
            </div>
          </div>

          <div class="progress-input-section">
            <label class="progress-label">任务进度描述：</label>
            <textarea
              v-model="taskProgressText"
              placeholder="描述当前任务进展情况（可选）"
              class="progress-textarea"
              rows="3"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeStatusModal()">取消</button>
          <button class="submit-btn" @click="updateTaskStatus()">确认更新</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 80px;
}

.detail-header {
  background: #fff;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
}

.detail-header h1 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.favorite-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
}

.favorite-btn.active {
  background: #fef2f2;
}

.detail-main {
  padding: 16px;
}

.image-section {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
}

.image-slider {
  display: flex;
  overflow-x: auto;
}

.image-slider img {
  flex: 0 0 100%;
  width: 100%;
  height: 280px;
  object-fit: cover;
}

.no-image-section {
  height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}

.no-image-icon {
  font-size: 64px;
  margin-bottom: 12px;
}

.no-image-text {
  font-size: 16px;
  color: #64748b;
}

.info-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
}

.info-header {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.type-badge {
  padding: 4px 12px;
  background: #eef2ff;
  color: #6366f1;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.status-badge.active {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.completed {
  background: #fef9c3;
  color: #ca8a04;
}

.status-badge.closed {
  background: #fecaca;
  color: #dc2626;
}

.info-title {
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.info-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
}

.meta-icon {
  font-size: 14px;
}

.price-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.price-label {
  font-size: 14px;
  color: #64748b;
}

.price-value {
  font-size: 28px;
  font-weight: 700;
  color: #10b981;
}

.bargain-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.special-fields {
  margin-bottom: 20px;
}

.field-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.field-row:last-child {
  border-bottom: none;
}

.field-label {
  font-size: 14px;
  color: #64748b;
}

.field-value {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
}

.field-value.reward {
  color: #10b981;
  font-weight: 600;
}

.progress-bar {
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  margin: 8px 0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  border-radius: 4px;
  transition: width 0.3s;
}

.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.tag {
  padding: 4px 12px;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 4px;
  font-size: 12px;
}

.description-section {
  margin-bottom: 20px;
}

.description-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.description-section p {
  font-size: 14px;
  color: #475569;
  line-height: 1.7;
  margin: 0;
}

.publisher-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 20px;
}

.publisher-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.publisher-info {
  flex: 1;
}

.publisher-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.publisher-role {
  font-size: 12px;
  color: #94a3b8;
}

.contact-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.safety-tips {
  background: #fff8f0;
  border: 1px solid #fed7aa;
  border-radius: 12px;
  padding: 16px;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.tips-icon {
  font-size: 16px;
}

.tips-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: #d97706;
  margin: 0;
}

.tips-list {
  margin: 0;
  padding-left: 20px;
}

.tips-list li {
  font-size: 13px;
  color: #92400e;
  margin-bottom: 4px;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
}

.nav-item.active {
  color: #10b981;
}

.nav-icon {
  font-size: 22px;
}

.nav-label {
  font-size: 11px;
  color: #64748b;
}

.publish-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -20px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.publish-btn .nav-icon {
  font-size: 28px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  border: none;
  background: none;
  font-size: 18px;
  color: #94a3b8;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.original-price {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 16px 0;
}

.bargain-input-group {
  margin-bottom: 16px;
}

.bargain-input-group label {
  font-size: 14px;
  color: #64748b;
  display: block;
  margin-bottom: 8px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
}

.input-wrapper span {
  font-size: 18px;
  color: #64748b;
  margin-right: 8px;
}

.input-wrapper input {
  flex: 1;
  border: none;
  font-size: 18px;
  outline: none;
}

.bargain-result {
  padding: 12px;
  background: #f0fdf4;
  border-radius: 8px;
}

.bargain-result p {
  margin: 0;
}

.bargain-result p:first-child {
  font-size: 12px;
  color: #16a34a;
  margin-bottom: 4px;
}

.result-text {
  font-size: 14px;
  color: #1e293b;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
}

.cancel-btn {
  flex: 1;
  padding: 12px;
  background: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

.submit-btn {
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

/* 跑腿委托任务样式 */
.task-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
}

.task-status.active {
  background: #dbeafe;
  color: #1e40af;
}

.task-status.claimed {
  background: #fef3c7;
  color: #92400e;
}

.task-status.in-progress {
  background: #fce7f3;
  color: #9f1239;
}

.task-status.completed {
  background: #d1fae5;
  color: #065f46;
}

.task-status.closed {
  background: #f1f5f9;
  color: #475569;
}

.assignee-section {
  margin-top: 16px;
  padding: 12px;
  background: #f0fdf4;
  border-radius: 12px;
  border: 1px solid #86efac;
}

.assignee-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.assignee-icon {
  font-size: 18px;
}

.assignee-title {
  font-size: 14px;
  font-weight: 600;
  color: #059669;
}

.assignee-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.assignee-avatar {
  width: 40px;
  height: 40px;
  background: #d1fae5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.assignee-details {
  flex: 1;
}

.assignee-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.assignee-time {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.task-progress-section {
  margin-top: 16px;
  padding: 12px;
  background: #fef3c7;
  border-radius: 12px;
  border: 1px solid #fcd34d;
}

.progress-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.progress-icon {
  font-size: 16px;
}

.progress-title {
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
}

.progress-content {
  font-size: 13px;
  color: #78350f;
  line-height: 1.6;
}

.task-actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}

.accept-task-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.accept-task-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.update-status-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.update-status-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

/* 任务状态更新模态框样式 */
.status-options {
  margin-bottom: 20px;
}

.status-label {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 12px;
  display: block;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.status-option {
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.status-option.active {
  border-color: #10b981;
  color: #10b981;
  background: #f0fdf4;
  font-weight: 600;
}

.progress-input-section {
  margin-top: 20px;
}

.progress-label {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
  display: block;
}

.progress-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  resize: vertical;
  box-sizing: border-box;
}

.progress-textarea:focus {
  border-color: #10b981;
}
</style>
