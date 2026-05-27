<template>
  <nav class="flex items-center justify-between px-4 py-3" :style="{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }">
    <div class="flex items-center gap-6">
      <span style="font-weight: 700; font-size: 1.25rem; color: var(--accent)">Vocab</span>
      <div class="flex gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="btn"
          :class="currentTab === tab.id ? 'btn-primary' : 'btn-outline'"
          @click="$emit('navigate', tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <span style="font-size: 0.875rem; color: var(--text-secondary)">
        {{ progress.due }} due · {{ progress.learned }} learned
      </span>
      <select
        :value="store.ttsVoice"
        @change="store.setTTSVoice($event.target.value)"
        style="width: auto; padding: 0.25rem 0.5rem; font-size: 0.75rem"
        title="TTS voice"
      >
        <option value="auto">Voice: Auto</option>
        <option value="en-US">🇺🇸 US</option>
        <option value="en-GB">🇬🇧 UK</option>
      </select>
      <button
        class="btn btn-outline"
        style="font-size: 0.75rem; padding: 0.25rem 0.5rem"
        @click="store.toggleAutoPlay()"
        :title="store.ttsAutoPlay ? 'Auto-play ON' : 'Auto-play OFF'"
      >🔁 {{ store.ttsAutoPlay ? 'ON' : 'OFF' }}</button>
      <select
        :value="theme"
        @change="store.setTheme($event.target.value)"
        style="width: auto; padding: 0.25rem 0.5rem; font-size: 0.875rem"
      >
        <option value="auto">Auto</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  </nav>
</template>

<script setup>
import { useVocabStore } from '../stores/vocabStore';
const store = useVocabStore();
defineProps({
  currentTab: String,
  tabs: Array,
  progress: Object,
  theme: String,
});
defineEmits(['navigate']);
</script>
