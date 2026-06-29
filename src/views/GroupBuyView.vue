<template>
  <section class="page">
    <div class="page-header">
      <h1>拼单搭子</h1>
      <p>找到志同道合的同学一起拼单，享受优惠价格。</p>
    </div>

    <div v-if="!loading && groupBuys.length > 0" class="list">
      <ItemCard
        v-for="item in groupBuys"
        :key="item.id"
        :title="item.title"
        :description="item.description"
        :tag="item.type"
        :location="item.location"
        :time="item.deadline"
      >
        <template #footer>
          <span>{{ item.currentCount }}/{{ item.targetCount }} 人</span>
          <span class="deadline">截止 {{ item.deadline }}</span>
        </template>
      </ItemCard>
    </div>

    <EmptyState
      v-if="!loading && groupBuys.length === 0"
      text="暂无拼单搭子信息"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ItemCard from '../components/ItemCard.vue'
import EmptyState from '../components/EmptyState.vue'
import { getGroupBuys, type GroupBuyItem } from '../api/groupBuy'

const groupBuys = ref<GroupBuyItem[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getGroupBuys()
    groupBuys.value = res.data
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

.deadline {
  margin-left: 12px;
  color: #6b7280;
}
</style>
