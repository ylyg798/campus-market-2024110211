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

      <FormField label="描述" required :error="errors.description">
        <textarea v-model.trim="form.description" rows="5" placeholder="请简要描述具体情况"></textarea>
      </FormField>

      <template v-if="publishType === 'trade'">
        <FormField label="商品分类" required :error="errors.category">
          <input v-model.trim="form.category" type="text" placeholder="如：数码配件、教材资料、生活用品" />
        </FormField>

        <FormField label="价格" required :error="errors.price">
          <input v-model.number="form.price" type="number" min="0" placeholder="请输入价格" />
        </FormField>

        <FormField label="成色" required :error="errors.condition">
          <select v-model="form.condition">
            <option value="">请选择成色</option>
            <option value="全新">全新</option>
            <option value="九成新">九成新</option>
            <option value="八成新">八成新</option>
            <option value="正常使用痕迹">正常使用痕迹</option>
          </select>
        </FormField>
      </template>

      <template v-if="publishType === 'lostFound'">
        <FormField label="信息类型" required>
          <select v-model="form.lostFoundType">
            <option value="lost">寻物</option>
            <option value="found">招领</option>
          </select>
        </FormField>

        <FormField label="物品名称" required :error="errors.itemName">
          <input v-model.trim="form.itemName" type="text" placeholder="请输入物品名称" />
        </FormField>

        <FormField label="发生时间" required :error="errors.eventTime">
          <input v-model="form.eventTime" type="datetime-local" />
        </FormField>
      </template>

      <template v-if="publishType === 'groupBuy'">
        <FormField label="拼单类型" required :error="errors.groupType">
          <input v-model.trim="form.groupType" type="text" placeholder="如：拼餐、资料团购、运动搭子" />
        </FormField>

        <FormField label="目标人数" required :error="errors.targetCount">
          <input v-model.number="form.targetCount" type="number" min="2" placeholder="请输入目标人数" />
        </FormField>

        <FormField label="截止时间" required :error="errors.deadline">
          <input v-model="form.deadline" type="datetime-local" />
        </FormField>
      </template>

      <template v-if="publishType === 'errand'">
        <FormField label="任务类型" required :error="errors.taskType">
          <input v-model.trim="form.taskType" type="text" placeholder="如：取快递、代买、代送" />
        </FormField>

        <FormField label="酬劳" required :error="errors.reward">
          <input v-model.number="form.reward" type="number" min="0" placeholder="请输入酬劳" />
        </FormField>

        <FormField label="取件地点" required :error="errors.from">
          <input v-model.trim="form.from" type="text" placeholder="请输入取件地点" />
        </FormField>

        <FormField label="送达地点" required :error="errors.to">
          <input v-model.trim="form.to" type="text" placeholder="请输入送达地点" />
        </FormField>

        <FormField label="截止时间" required :error="errors.deadline">
          <input v-model="form.deadline" type="datetime-local" />
        </FormField>
      </template>

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
  lostFoundType: '',
  itemName: '',
  eventTime: '',
  contact: '',
  groupType: '',
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
    if (!form.category) errors.category = '请输入商品分类'
    if (!form.price) errors.price = '请输入价格'
    if (!form.condition) errors.condition = '请选择成色'
  }

  if (publishType.value === 'lostFound') {
    if (!form.lostFoundType) errors.lostFoundType = '请选择信息类型'
    if (!form.itemName) errors.itemName = '请输入物品名称'
    if (!form.eventTime) errors.eventTime = '请选择发生时间'
  }

  if (publishType.value === 'groupBuy') {
    if (!form.groupType) errors.groupType = '请输入拼单类型'
    if (!form.targetCount) errors.targetCount = '请输入目标人数'
    if (!form.deadline) errors.deadline = '请选择截止时间'
  }

  if (publishType.value === 'errand') {
    if (!form.taskType) errors.taskType = '请输入任务类型'
    if (!form.reward) errors.reward = '请输入酬劳'
    if (!form.from) errors.from = '请输入取件地点'
    if (!form.to) errors.to = '请输入送达地点'
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
        image: '',
        status: 'open',
        description: form.description,
      })
    }

    if (publishType.value === 'lostFound') {
      await createLostFound({
        title: form.title,
        type: form.lostFoundType as 'lost' | 'found',
        itemName: form.itemName,
        location: form.location,
        eventTime: form.eventTime,
        contact: '',
        status: 'open',
        description: form.description,
      })
    }

    if (publishType.value === 'groupBuy') {
      await createGroupBuy({
        title: form.title,
        type: form.groupType,
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
