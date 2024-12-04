<script setup lang="ts">
import type { ICoil } from '@/model/interfaces'
import CoilCard from '../card/CoilCard.vue'
defineProps<{ items: ICoil[] }>()
</script>
<template>
  <ul class="list gap-3 px-3">
    <CoilCard
      v-for="item in items"
      :key="item.id"
      v-bind="item"
      :id="item.id"
      :material="item.material"
      :color="item.color"
      :length="item.length"
      :imgUrl="item.imgUrl"
    ></CoilCard>
  </ul>
</template>
<style scoped></style>
