<script setup lang="ts">import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMarketStore } from '@/stores/marketStore';
import { useUserStore } from '@/stores/userStore';
import type { InfoType, MarketInfo } from '@/types/market';
const router = useRouter();
const marketStore = useMarketStore();
const userStore = useUserStore();
const selectedType = ref<InfoType>('secondhand');
const form = ref({
 title: '',
 description: '',
 campus: '',
 location: '',
 price: '',
 quality: '',
 tags: '',
 images: [] as string[],
 lostFoundType: 'lost',
 itemFeatures: '',
 reward: '',
 currentCount: '1',
 targetCount: '',
 deadline: '',
 taskContent: '',
 expectedTime: '',
});
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
const campuses = ['东校区', '西校区', '南校区', '北校区'];
const qualityOptions = [
 { value: 'new', label: '全新' },
 { value: 'like-new', label: '几乎全新' },
 { value: 'good', label: '成色良好' },
 { value: 'fair', label: '有使用痕迹' },
 { value: 'poor', label: '成色较差' },
];
const canSubmit = computed(() => {
 if (!form.value.title || !form.value.description || !form.value.campus)
 return false;
 if (selectedType.value === 'secondhand' && (!form.value.price || !form.value.quality))
 return false;
 if (selectedType.value === 'lostfound' && !form.value.itemFeatures)
 return false;
 if (selectedType.value === 'groupbuy' && (!form.value.targetCount || !form.value.deadline))
 return false;
 if (selectedType.value === 'errand' && !form.value.taskContent)
 return false;
 return true;
});
function handleSubmit() {
 if (!canSubmit.value || !userStore.user)
 return;
 const infoData: Omit<MarketInfo, 'id' | 'createdAt' | 'publisher' | 'status' | 'viewCount' | 'replyCount'> = {
 title: form.value.title,
 description: form.value.description,
 type: selectedType.value,
 campus: form.value.campus,
 location: form.value.location || '校内',
 tags: form.value.tags.split(',').map(t => t.trim()).filter(t => t),
 images: form.value.images,
 };
 if (selectedType.value === 'secondhand') {
 infoData.price = parseFloat(form.value.price);
 infoData.quality = form.value.quality;
 }
 if (selectedType.value === 'lostfound') {
 infoData.lostFoundType = form.value.lostFoundType;
 infoData.itemFeatures = form.value.itemFeatures;
 infoData.reward = form.value.reward ? parseFloat(form.value.reward) : undefined;
 }
 if (selectedType.value === 'groupbuy') {
 infoData.currentCount = parseInt(form.value.currentCount);
 infoData.targetCount = parseInt(form.value.targetCount);
 infoData.deadline = form.value.deadline;
 }
 if (selectedType.value === 'errand') {
 infoData.taskContent = form.value.taskContent;
 infoData.reward = form.value.reward ? parseFloat(form.value.reward) : undefined;
 infoData.expectedTime = form.value.expectedTime;
 }
 marketStore.publishInfo(infoData);
 router.push('/market');
}
</script>

<template>
  <div class="publish-page">
    <header class="publish-header">
      <div class="header-content">
        <button class="back-btn" @click="router.back()">
          <span>←</span>
        </button>
        <h1>发布信息</h1>
        <button class="submit-btn" :class="{ disabled: !canSubmit }" @click="handleSubmit()">
          发布
        </button>
      </div>
    </header>

    <main class="publish-main">
      <div class="type-section">
        <label class="section-label">选择类型</label>
        <div class="type-grid">
          <button
            v-for="item in infoTypes"
            :key="item.type"
            class="type-card"
            :class="{ active: selectedType === item.type }"
            @click="selectedType = item.type"
          >
            <span class="type-icon">{{ item.icon }}</span>
            <span class="type-name">{{ item.label }}</span>
          </button>
        </div>
      </div>

      <div class="form-section">
        <div class="form-group">
          <label class="form-label">标题 *</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="输入信息标题"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label class="form-label">校区 *</label>
          <select v-model="form.campus" class="form-input">
            <option value="">请选择校区</option>
            <option v-for="campus in campuses" :key="campus" :value="campus">
              {{ campus }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">详细地点</label>
          <input
            v-model="form.location"
            type="text"
            placeholder="如：教学楼A栋、宿舍3号楼"
            class="form-input"
          />
        </div>

        <div v-if="selectedType === 'secondhand'" class="secondhand-fields">
          <div class="form-group">
            <label class="form-label">价格 *</label>
            <div class="price-input-wrapper">
              <span>¥</span>
              <input
                v-model="form.price"
                type="number"
                placeholder="0.00"
                class="form-input price-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">成色 *</label>
            <div class="quality-options">
              <button
                v-for="option in qualityOptions"
                :key="option.value"
                class="quality-option"
                :class="{ active: form.quality === option.value }"
                @click="form.quality = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="selectedType === 'lostfound'" class="lostfound-fields">
          <div class="form-group">
            <label class="form-label">类型</label>
            <div class="lostfound-type-options">
              <button
                class="lostfound-type-option"
                :class="{ active: form.lostFoundType === 'lost' }"
                @click="form.lostFoundType = 'lost'"
              >
                🔍 丢失物品
              </button>
              <button
                class="lostfound-type-option"
                :class="{ active: form.lostFoundType === 'found' }"
                @click="form.lostFoundType = 'found'"
              >
                🎯 拾获物品
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">物品特征 *</label>
            <textarea
              v-model="form.itemFeatures"
              placeholder="描述物品的特征，便于识别"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">悬赏金额</label>
            <div class="price-input-wrapper">
              <span>¥</span>
              <input
                v-model="form.reward"
                type="number"
                placeholder="0.00"
                class="form-input price-input"
              />
            </div>
          </div>
        </div>

        <div v-if="selectedType === 'groupbuy'" class="groupbuy-fields">
          <div class="form-group">
            <label class="form-label">目标人数 *</label>
            <input
              v-model="form.targetCount"
              type="number"
              placeholder="需要多少人参与"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label">截止时间 *</label>
            <input
              v-model="form.deadline"
              type="datetime-local"
              class="form-input"
            />
          </div>
        </div>

        <div v-if="selectedType === 'errand'" class="errand-fields">
          <div class="form-group">
            <label class="form-label">任务内容 *</label>
            <textarea
              v-model="form.taskContent"
              placeholder="详细描述需要完成的任务"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">酬劳</label>
            <div class="price-input-wrapper">
              <span>¥</span>
              <input
                v-model="form.reward"
                type="number"
                placeholder="0.00"
                class="form-input price-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">期望完成时间</label>
            <input
              v-model="form.expectedTime"
              type="datetime-local"
              class="form-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">详细描述 *</label>
          <textarea
            v-model="form.description"
            placeholder="详细描述您的信息..."
            class="form-textarea"
            rows="5"
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">标签</label>
          <input
            v-model="form.tags"
            type="text"
            placeholder="输入标签，用逗号分隔"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label class="form-label">图片</label>
          <div class="image-upload">
            <div class="upload-btn" @click="alert('图片上传功能开发中')">
              <span class="upload-icon">📷</span>
              <span>上传图片</span>
            </div>
            <div v-if="form.images.length > 0" class="uploaded-images">
              <div v-for="(img, index) in form.images" :key="index" class="uploaded-image">
                <img :src="img" :alt="`图片${index + 1}`" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.publish-page {
  min-height: 100vh;
  background: #f8fafc;
}

.publish-header {
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

.publish-header h1 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.submit-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

.submit-btn.disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.publish-main {
  padding: 20px;
}

.type-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.section-label {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  display: block;
  margin-bottom: 16px;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.type-card.active {
  border-color: #667eea;
  background: #f0f4ff;
}

.type-icon {
  font-size: 28px;
}

.type-name {
  font-size: 14px;
  font-weight: 500;
  color: #475569;
}

.type-card.active .type-name {
  color: #667eea;
}

.form-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  display: block;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #667eea;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  box-sizing: border-box;
  resize: vertical;
}

.form-textarea:focus {
  border-color: #667eea;
}

.price-input-wrapper {
  display: flex;
  align-items: center;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 12px;
}

.price-input-wrapper:focus-within {
  border-color: #667eea;
}

.price-input-wrapper span {
  font-size: 18px;
  color: #64748b;
}

.price-input {
  border: none;
  padding: 12px;
  font-size: 18px;
  outline: none;
}

.quality-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quality-option {
  padding: 8px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #64748b;
  background: #fff;
  cursor: pointer;
}

.quality-option.active {
  border-color: #667eea;
  color: #667eea;
  background: #f0f4ff;
}

.lostfound-type-options {
  display: flex;
  gap: 12px;
}

.lostfound-type-option {
  flex: 1;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #64748b;
  background: #fff;
  cursor: pointer;
}

.lostfound-type-option.active {
  border-color: #667eea;
  color: #667eea;
  background: #f0f4ff;
}

.image-upload {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.upload-btn {
  width: 100px;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
  cursor: pointer;
}

.upload-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.upload-btn span:last-child {
  font-size: 12px;
  color: #94a3b8;
}

.uploaded-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.uploaded-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
}

.uploaded-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
