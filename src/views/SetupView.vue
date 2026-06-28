<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  nickname: '',
  college: '',
  campus: '',
  role: 'student' as 'student' | 'teacher' | 'staff',
})

const colleges = ['计算机学院', '电子信息学院', '经济管理学院', '外国语学院', '艺术设计学院', '其他']
const campuses = ['东校区', '西校区', '南校区', '北校区']
const roles = [
  { value: 'student', label: '学生' },
  { value: 'teacher', label: '教师' },
  { value: 'staff', label: '教职工' },
]

const errors = ref<Record<string, string>>({})

function validate() {
  errors.value = {}

  if (!form.value.nickname.trim()) {
    errors.value.nickname = '请输入昵称'
  } else if (form.value.nickname.length > 20) {
    errors.value.nickname = '昵称不能超过20个字符'
  }

  if (!form.value.college) {
    errors.value.college = '请选择学院'
  }

  if (!form.value.campus) {
    errors.value.campus = '请选择校区'
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) return

  await userStore.createUser(form.value)
  router.push('/')
}
</script>

<template>
  <div class="setup-page">
    <div class="setup-container">
      <div class="logo-section">
        <div class="logo">🏫</div>
        <h1>校园轻集市</h1>
        <p>创建您的本地身份</p>
      </div>

      <form @submit.prevent="handleSubmit" class="setup-form">
        <div class="form-group">
          <label>昵称</label>
          <input
            v-model="form.nickname"
            type="text"
            placeholder="请输入您的昵称"
            class="form-input"
            :class="{ 'has-error': errors.nickname }"
          />
          <span v-if="errors.nickname" class="error-message">{{ errors.nickname }}</span>
        </div>

        <div class="form-group">
          <label>学院</label>
          <select
            v-model="form.college"
            class="form-select"
            :class="{ 'has-error': errors.college }"
          >
            <option value="">请选择学院</option>
            <option v-for="college in colleges" :key="college" :value="college">
              {{ college }}
            </option>
          </select>
          <span v-if="errors.college" class="error-message">{{ errors.college }}</span>
        </div>

        <div class="form-group">
          <label>校区</label>
          <select
            v-model="form.campus"
            class="form-select"
            :class="{ 'has-error': errors.campus }"
          >
            <option value="">请选择校区</option>
            <option v-for="campus in campuses" :key="campus" :value="campus">
              {{ campus }}
            </option>
          </select>
          <span v-if="errors.campus" class="error-message">{{ errors.campus }}</span>
        </div>

        <div class="form-group">
          <label>身份角色</label>
          <div class="role-options">
            <label
              v-for="role in roles"
              :key="role.value"
              class="role-option"
              :class="{ active: form.role === role.value }"
            >
              <input
                type="radio"
                :value="role.value"
                v-model="form.role"
                class="role-radio"
              />
              <span>{{ role.label }}</span>
            </label>
          </div>
        </div>

        <button type="submit" class="submit-btn">开始使用</button>
      </form>

      <div class="tips">
        <p>💡 提示：本系统为模拟身份，不进行真实账号验证</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.setup-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 20px;
}

.setup-container {
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.logo-section {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  font-size: 64px;
  margin-bottom: 16px;
}

.logo-section h1 {
  font-size: 28px;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.logo-section p {
  color: #64748b;
  margin: 0;
}

.setup-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #334155;
  font-size: 14px;
}

.form-input,
.form-select {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #10b981;
}

.form-input.has-error,
.form-select.has-error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
}

.role-options {
  display: flex;
  gap: 12px;
}

.role-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #64748b;
}

.role-option.active {
  border-color: #10b981;
  background: #f0f5ff;
  color: #10b981;
}

.role-radio {
  display: none;
}

.submit-btn {
  margin-top: 12px;
  padding: 14px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.submit-btn:hover {
  opacity: 0.9;
}

.tips {
  margin-top: 24px;
  text-align: center;
}

.tips p {
  color: #94a3b8;
  font-size: 13px;
  margin: 0;
}
</style>
