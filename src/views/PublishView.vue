<template>
  <section class="page">
    <div class="page-header">
      <h1>发布信息</h1>
      <p>选择发布类型，填写必要信息，让校园需求更快被看见。</p>
    </div>

    <form class="publish-form" @submit.prevent="handleSubmit">
      <FormField label="发布类型" required>
        <select v-model="publishType">
          <option value="trade">二手交易</option>
          <option value="lostFound">失物招领</option>
          <option value="groupBuy">拼单搭子</option>
          <option value="errand">跑腿委托</option>
        </select>
      </FormField>

      <FormField label="标题" required :error="errors.title">
        <input v-model.trim="form.title" type="text" placeholder="请输入标题" />
      </FormField>

      <FormField label="地点" required :error="errors.location">
        <input v-model.trim="form.location" type="text" placeholder="请输入地点" />
      </FormField>

      <div v-if="publishType === 'trade'" class="trade-fields">
        <FormField label="分类" required :error="errors.category">
          <select v-model="form.category">
            <option value="">请选择分类</option>
            <option value="数码设备">数码设备</option>
            <option value="图书教材">图书教材</option>
            <option value="生活用品">生活用品</option>
            <option value="运动器材">运动器材</option>
            <option value="其他">其他</option>
          </select>
        </FormField>

        <FormField label="价格" required :error="errors.price">
          <div class="price-input-wrapper">
            <span>¥</span>
            <input v-model="form.price" type="number" placeholder="0.00" />
          </div>
        </FormField>

        <FormField label="成色" required :error="errors.condition">
          <select v-model="form.condition">
            <option value="">请选择成色</option>
            <option value="全新">全新</option>
            <option value="几乎全新">几乎全新</option>
            <option value="成色良好">成色良好</option>
            <option value="有使用痕迹">有使用痕迹</option>
          </select>
        </FormField>

        <FormField label="图片">
          <input v-model="form.image" type="text" placeholder="请输入图片URL" />
        </FormField>
      </div>

      <div v-if="publishType === 'lostFound'" class="lostfound-fields">
        <FormField label="类型" required :error="errors.type">
          <select v-model="form.type">
            <option value="lost">丢失物品</option>
            <option value="found">拾获物品</option>
          </select>
        </FormField>

        <FormField label="物品名称" required :error="errors.itemName">
          <input v-model.trim="form.itemName" type="text" placeholder="请输入物品名称" />
        </FormField>

        <FormField label="时间" required :error="errors.eventTime">
          <input v-model="form.eventTime" type="datetime-local" />
        </FormField>

        <FormField label="联系方式" required :error="errors.contact">
          <input v-model.trim="form.contact" type="text" placeholder="请输入联系方式" />
        </FormField>
      </div>

      <div v-if="publishType === 'groupBuy'" class="groupbuy-fields">
        <FormField label="拼单类型" required :error="errors.type">
          <select v-model="form.type">
            <option value="">请选择拼单类型</option>
            <option value="美食">美食</option>
            <option value="数码">数码</option>
            <option value="日用品">日用品</option>
            <option value="其他">其他</option>
          </select>
        </FormField>

        <FormField label="目标人数" required :error="errors.targetCount">
          <input v-model="form.targetCount" type="number" placeholder="需要多少人参与" />
        </FormField>

        <FormField label="截止时间" required :error="errors.deadline">
          <input v-model="form.deadline" type="datetime-local" />
        </FormField>
      </div>

      <div v-if="publishType === 'errand'" class="errand-fields">
        <FormField label="任务类型" required :error="errors.taskType">
          <select v-model="form.taskType">
            <option value="">请选择任务类型</option>
            <option value="取快递">取快递</option>
            <option value="买东西">买东西</option>
            <option value="送东西">送东西</option>
            <option value="其他">其他</option>
          </select>
        </FormField>

        <FormField label="报酬" required :error="errors.reward">
          <div class="price-input-wrapper">
            <span>¥</span>
            <input v-model="form.reward" type="number" placeholder="0.00" />
          </div>
        </FormField>

        <FormField label="起点" required :error="errors.from">
          <input v-model.trim="form.from" type="text" placeholder="请输入起点" />
        </FormField>

        <FormField label="终点" required :error="errors.to">
          <input v-model.trim="form.to" type="text" placeholder="请输入终点" />
        </FormField>

        <FormField label="截止时间" required :error="errors.deadline">
          <input v-model="form.deadline" type="datetime-local" />
        </FormField>
      </div>

      <FormField label="描述" required :error="errors.description">
        <textarea v-model.trim="form.description" rows="5" placeholder="请简要描述具体情况"></textarea>
      </FormField>

      <div class="actions">
        <button type="button" class="secondary" @click="resetForm">重置</button>
        <button type="submit" class="primary" :disabled="submitting">
          {{ submitting ? '提交中...' : '发布' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import FormField from '@/components/FormField.vue'
import { createTrade } from '@/api/trade'
import { createLostFound } from '@/api/lostFound'
import { createGroupBuy } from '@/api/groupBuy'
import { createErrand } from '@/api/errand'

const router = useRouter()
const publishType = ref<'trade' | 'lostFound' | 'groupBuy' | 'errand'>('trade')
const submitting = ref(false)

const form = reactive({
  title: '',
  location: '',
  description: '',
  category: '',
  price: '',
  condition: '',
  image: '',
  type: '',
  itemName: '',
  eventTime: '',
  contact: '',
  targetCount: '',
  deadline: '',
  taskType: '',
  reward: '',
  from: '',
  to: '',
})

const errors = reactive<Record<string, string>>({})

function validateForm(): boolean {
  Object.keys(errors).forEach(key => delete errors[key])

  if (!form.title) errors.title = '请输入标题'
  if (!form.location) errors.location = '请输入地点'
  if (!form.description) errors.description = '请输入描述'

  if (publishType.value === 'trade') {
    if (!form.category) errors.category = '请选择分类'
    if (!form.price) errors.price = '请输入价格'
    if (!form.condition) errors.condition = '请选择成色'
  }

  if (publishType.value === 'lostFound') {
    if (!form.type) errors.type = '请选择类型'
    if (!form.itemName) errors.itemName = '请输入物品名称'
    if (!form.eventTime) errors.eventTime = '请选择时间'
    if (!form.contact) errors.contact = '请输入联系方式'
  }

  if (publishType.value === 'groupBuy') {
    if (!form.type) errors.type = '请选择拼单类型'
    if (!form.targetCount) errors.targetCount = '请输入目标人数'
    if (!form.deadline) errors.deadline = '请选择截止时间'
  }

  if (publishType.value === 'errand') {
    if (!form.taskType) errors.taskType = '请选择任务类型'
    if (!form.reward) errors.reward = '请输入报酬'
    if (!form.from) errors.from = '请输入起点'
    if (!form.to) errors.to = '请输入终点'
    if (!form.deadline) errors.deadline = '请选择截止时间'
  }

  return Object.keys(errors).length === 0
}

async function handleSubmit() {
  if (!validateForm()) return

  submitting.value = true

  try {
    const now = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(/\//g, '-')

    if (publishType.value === 'trade') {
      await createTrade({
        title: form.title,
        category: form.category,
        price: parseFloat(form.price),
        condition: form.condition,
        location: form.location,
        publisher: '当前用户',
        publishTime: now,
        image: form.image || '',
        status: 'open',
        description: form.description,
      })
    }

    if (publishType.value === 'lostFound') {
      await createLostFound({
        title: form.title,
        type: form.type as 'lost' | 'found',
        itemName: form.itemName,
        location: form.location,
        eventTime: form.eventTime,
        contact: form.contact,
        status: 'open',
        description: form.description,
      })
    }

    if (publishType.value === 'groupBuy') {
      await createGroupBuy({
        title: form.title,
        type: form.type,
        targetCount: parseInt(form.targetCount),
        currentCount: 1,
        deadline: form.deadline,
        location: form.location,
        publisher: '当前用户',
        status: 'open',
        description: form.description,
      })
    }

    if (publishType.value === 'errand') {
      await createErrand({
        title: form.title,
        taskType: form.taskType,
        reward: parseFloat(form.reward),
        from: form.from,
        to: form.to,
        deadline: form.deadline,
        publisher: '当前用户',
        status: 'open',
        description: form.description,
      })
    }

    alert('发布成功！')
    router.push('/')
  } catch (error) {
    alert('发布失败，请重试')
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  Object.keys(form).forEach(key => {
    (form as Record<string, unknown>)[key] = ''
  })
  Object.keys(errors).forEach(key => delete errors[key])
}
</script>

<style scoped>
.page {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-header p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.publish-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.publish-form input,
.publish-form select,
.publish-form textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.publish-form input:focus,
.publish-form select:focus,
.publish-form textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.publish-form textarea {
  resize: vertical;
  min-height: 100px;
}

.price-input-wrapper {
  display: flex;
  align-items: center;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 0 16px;
  transition: border-color 0.2s;
}

.price-input-wrapper:focus-within {
  border-color: #3b82f6;
}

.price-input-wrapper span {
  font-size: 16px;
  color: #6b7280;
}

.price-input-wrapper input {
  border: none;
  padding: 12px;
  font-size: 16px;
  outline: none;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.actions button {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.actions button.primary {
  background: #3b82f6;
  color: white;
  border: none;
}

.actions button.primary:hover:not(:disabled) {
  background: #2563eb;
}

.actions button.primary:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

.actions button.secondary {
  background: #f3f4f6;
  color: #374151;
  border: none;
}

.actions button.secondary:hover {
  background: #e5e7eb;
}
</style>