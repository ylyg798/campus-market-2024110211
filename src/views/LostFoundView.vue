<template>
  <section class="page">
    <div class="page-header">
      <h1>失物招领</h1>
      <p>寻找丢失的物品，或归还捡到的物品，共建文明校园。</p>
    </div>

    <div v-if="!loading && lostFounds.length > 0" class="list">
      <ItemCard
        v-for="item in lostFounds"
        :key="item.id"
        :title="item.title"
        :description="item.description"
        :tag="item.type === 'lost' ? '丢失' : '拾获'"
        :location="item.location"
        :time="item.eventTime"
      >
        <template #footer>
          <span :class="{ lost: item.type === 'lost', found: item.type === 'found' }">
            {{ item.type === 'lost' ? '寻找中' : '等待认领' }}
          </span>
        </template>
      </ItemCard>
    </div>

    <EmptyState
      v-if="!loading && lostFounds.length === 0"
      text="暂无失物招领信息"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ItemCard from '../components/ItemCard.vue'
import EmptyState from '../components/EmptyState.vue'
import { getLostFounds, type LostFoundItem } from '../api/lostFound'

const lostFounds = ref<LostFoundItem[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getLostFounds()
    lostFounds.value = res.data
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

.lost {
  color: #dc2626;
}

.found {
  color: #16a34a;
}
</style>
