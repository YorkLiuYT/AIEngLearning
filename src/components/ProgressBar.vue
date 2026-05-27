<template>
  <div style="margin-bottom: 1rem">
    <div style="display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem">
      <span>{{ label }}</span>
      <span>{{ value }}/{{ max }}</span>
    </div>
    <div style="height: 6px; background: var(--bg-side); border-radius: 999px; overflow: hidden">
      <div
        :style="{
          width: max > 0 ? (value / max) * 100 + '%' : '0%',
          height: '100%',
          background: color || 'var(--accent)',
          borderRadius: '999px',
          transition: 'width 0.3s ease',
        }"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: Number,
  max: Number,
  color: String,
});
</script>
