<template>
  <section class="page">
    <div class="page-header">
      <h1>跑腿委托</h1>
      <p>发布或接取跑腿任务，帮助同学解决临时需求。</p>
    </div>

    <div v-if="!loading && errands.length > 0" class="list">
      <ItemCard
        v-for="item in errands"
        :key="item.id"
        :title="item.title"
        :description="item.description"
        :tag="item.taskType"
        :location="item.from + ' → ' + item.to"
        :time="item.deadline"
      >
        <template #footer>
          <strong class="reward">酬劳 ¥{{ item.reward }}</strong>
          <span>{{ item.status }}</span>

          <button class="favorite-btn" @click="favoriteStore.toggleFavorite({
            id: item.id,
            type: 'errand',
            title: item.title,
            description: item.description,
            location: item.from + ' → ' + item.to
          })">
            {{ favoriteStore.isFavorite('errand', item.id) ? '已收藏' : '收藏' }}
          </button>
        </template>
      </ItemCard>
    </div>

    <EmptyState
      v-if="!loading && errands.length === 0"
      text="暂无跑腿委托信息"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ItemCard from '../components/ItemCard.vue'
import EmptyState from '../components/EmptyState.vue'
import { getErrands, type ErrandItem } from '../api/errand'
import { useFavoriteStore } from '../stores/favorite'

const favoriteStore = useFavoriteStore()

const errands = ref<ErrandItem[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getErrands()
    errands.value = res.data
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  padding: 24px;
  border-radius: 16px;
  background: #fff;
}

.page-header h1 {
  margin: 0 0 8px;
}

.page-header p {
  margin: 0;
  color: #6b7280;
}

.list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.reward {
  color: #f59e0b;
}

.favorite-btn {
  margin-left: auto;
  border: none;
  border-radius: 999px;
  padding: 6px 12px;
  cursor: pointer;
  background: #f3f4f6;
  color: #374151;
}
</style>
