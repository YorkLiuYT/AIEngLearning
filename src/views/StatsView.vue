<template>
  <div style="max-width: 600px; margin: 0 auto; padding: 1.5rem">
    <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem">Progress Stats</h2>

    <!-- Overview cards -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1.5rem">
      <div class="card" style="text-align: center">
        <div style="font-size: 2rem; font-weight: 700; color: var(--accent)">{{ stats.total }}</div>
        <div style="font-size: 0.875rem; color: var(--text-secondary)">Total Words</div>
      </div>
      <div class="card" style="text-align: center">
        <div style="font-size: 2rem; font-weight: 700; color: var(--green)">{{ stats.learned }}</div>
        <div style="font-size: 0.875rem; color: var(--text-secondary)">Learned (L3+)</div>
      </div>
      <div class="card" style="text-align: center">
        <div style="font-size: 2rem; font-weight: 700; color: var(--orange)">{{ stats.due }}</div>
        <div style="font-size: 0.875rem; color: var(--text-secondary)">Due Now</div>
      </div>
    </div>

    <ProgressBar label="Mastery" :value="stats.learned" :max="Math.max(stats.total, 1)" color="var(--green)" />

    <!-- Level distribution -->
    <h3 style="font-weight: 600; margin: 1rem 0 0.5rem">Level Distribution</h3>
    <div style="display: flex; flex-direction: column; gap: 0.5rem">
      <div v-for="l in 6" :key="l" style="display: flex; align-items: center; gap: 0.5rem">
        <span style="font-size: 0.875rem; min-width: 40px">L{{ l }}</span>
        <div style="flex: 1; height: 20px; background: var(--bg-side); border-radius: 6px; overflow: hidden">
          <div
            :style="{
              width: levelPct(l) + '%',
              height: '100%',
              background: l >= 3 ? 'var(--green)' : l >= 1 ? 'var(--orange)' : 'var(--border)',
              borderRadius: '6px',
              transition: 'width 0.3s',
            }"
          />
        </div>
        <span style="font-size: 0.875rem; min-width: 40px; color: var(--text-secondary)">{{ levelCount(l) }}</span>
      </div>
    </div>

    <!-- Tag breakdown -->
    <h3 style="font-weight: 600; margin: 1rem 0 0.5rem">By Tag</h3>
    <div style="display: flex; flex-direction: column; gap: 0.5rem">
      <div v-for="tag in tagStats" :key="tag.name" style="display: flex; align-items: center; gap: 0.5rem">
        <span style="font-size: 0.875rem; min-width: 120px">{{ tag.name }}</span>
        <div style="flex: 1; height: 16px; background: var(--bg-side); border-radius: 6px; overflow: hidden">
          <div
            :style="{
              width: (tag.count / stats.total) * 100 + '%',
              height: '100%',
              background: 'var(--accent)',
              borderRadius: '6px',
            }"
          />
        </div>
        <span style="font-size: 0.875rem; color: var(--text-secondary)">{{ tag.count }}</span>
      </div>
      <div v-if="tagStats.length === 0" style="font-size: 0.875rem; color: var(--text-secondary)">No tags yet</div>
    </div>

    <!-- Review history -->
    <h3 style="font-weight: 600; margin: 1rem 0 0.5rem">Review History</h3>
    <div style="font-size: 0.875rem; color: var(--text-secondary)">
      Total reviews: {{ totalReviews }} <br>
      Avg level: {{ avgLevel.toFixed(1) }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useVocabStore } from '../stores/vocabStore';
import ProgressBar from '../components/ProgressBar.vue';

const store = useVocabStore();

const stats = computed(() => store.progress);

function levelCount(l) {
  return store.words.filter(w => w.srs.level === l).length;
}

function levelPct(l) {
  const max = Math.max(stats.value.total, 1);
  return (levelCount(l) / max) * 100;
}

const tagStats = computed(() => {
  const map = {};
  for (const w of store.words) {
    if (w.tags) {
      for (const t of w.tags) {
        map[t] = (map[t] || 0) + 1;
      }
    }
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
});

const totalReviews = computed(() => {
  return store.words.reduce((sum, w) => sum + w.srs.review_count, 0);
});

const avgLevel = computed(() => {
  const n = store.words.length;
  if (n === 0) return 0;
  return store.words.reduce((sum, w) => sum + w.srs.level, 0) / n;
});
</script>
