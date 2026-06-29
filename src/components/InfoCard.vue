<template>
  <div class="info-card" :class="[`info-card--${type}`]" @click="handleClick">
    <div class="info-card__image" v-if="image">
      <img :src="image" :alt="title" />
    </div>
    <div class="info-card__content">
      <div class="info-card__header">
        <h3 class="info-card__title">{{ title }}</h3>
        <span class="info-card__tag" v-if="tag">{{ tag }}</span>
      </div>
      <p class="info-card__desc">{{ description }}</p>
      <div class="info-card__meta">
        <span class="info-card__price" v-if="price">{{ price }}</span>
        <span class="info-card__reward" v-if="reward">{{ reward }}</span>
        <span class="info-card__location">{{ location }}</span>
        <span class="info-card__time">{{ time }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'trade' | 'lostfound' | 'groupbuy' | 'errand'
  title: string
  description: string
  image?: string
  tag?: string
  price?: string | number
  reward?: string | number
  location?: string
  time?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'trade',
})

const emit = defineEmits<{
  click: []
}>()

function handleClick() {
  emit('click')
}
</script>

<style scoped>
.info-card {
  display: flex;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.info-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.info-card__image {
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  overflow: hidden;
  background: #f5f7fb;
}

.info-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-card__content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.info-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.info-card__title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.info-card__tag {
  flex-shrink: 0;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: #f0f5ff;
  color: #4080ff;
}

.info-card__desc {
  flex: 1;
  font-size: 13px;
  color: #666;
  margin: 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.info-card__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

.info-card__price {
  color: #ff4d4f;
  font-weight: 600;
}

.info-card__reward {
  color: #faad14;
  font-weight: 600;
}

.info-card__location,
.info-card__time {
  flex-shrink: 0;
}
</style>
