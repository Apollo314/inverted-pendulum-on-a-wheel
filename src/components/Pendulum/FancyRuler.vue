<template>
  <div
    class="ruler"
    :style="{
      translate: `${(lower_bound + total_ruler_length / 2) * ppm}px`,
    }"
  >
    <div
      v-for="i in range"
      :style="{ width: `${ppm}px` }"
      :class="{ odd: i & 1 }"
      :key="i"
      class="meter"
    >
      <div>{{ i }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    position?: number;
    total_ruler_length?: number;
    /**
     * pixel per meter (how many pixels should represent a meter)
     */
    ppm?: number;
  }>(),
  {
    total_ruler_length: 50,
    position: 0,
    ppm: 100,
  }
);

const lower_bound = computed(() => {
  return Math.floor(props.position - props.total_ruler_length / 2);
});

const range = computed(() => {
  return Array.from(
    new Array(props.total_ruler_length),
    (x, i) => i + lower_bound.value
  );
});
</script>

<style scoped lang="scss">
.ruler {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  position: relative;
  z-index: -1;
}

.meter {
  display: flex;
  padding-left: 5px;
  height: 30px;
  background: #243c5f;
  flex-shrink: 0;
  align-items: center;
  font-weight: 700;
  div {
    color: white;
  }
  &.odd {
    background: #1e2738;
  }
}
</style>
