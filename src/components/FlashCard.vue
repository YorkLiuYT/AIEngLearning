<template>
  <div class="card" style="text-align: center; min-height: 280px; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer; user-select: none" @click="flip">
    <div v-if="!flipped" key="front" style="font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem">
      {{ word.word }}
    </div>
    <div v-else key="back" style="width: 100%">
      <div style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.25rem">{{ word.chinese }}</div>
      <div v-if="word.part_of_speech" style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem">
        {{ word.part_of_speech }}
      </div>
      <div v-if="word.example" style="font-size: 1rem; font-style: italic; color: var(--text-secondary); margin-bottom: 0.75rem">
        "{{ word.example }}"
      </div>
      <div v-if="word.context" style="font-size: 0.875rem; color: var(--accent); margin-bottom: 0.25rem">
        📖 {{ word.context }}
      </div>
      <div v-if="word.source_article" style="font-size: 0.75rem; color: var(--text-secondary)">
        📌 {{ word.source_article }}
      </div>
      <div v-if="word.tags && word.tags.length" style="margin-top: 0.5rem">
        <span class="tag" v-for="t in word.tags" :key="t" style="margin: 0 2px">{{ t }}</span>
      </div>
    </div>

    <!-- Quiz mode input (reserved for future spelling quiz) -->
    <div v-if="mode === 'quiz'" style="margin-top: 1rem; width: 100%">
      <input
        :placeholder="flipped ? '' : 'type the translation...'"
        style="text-align: center"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  word: Object,
  mode: { type: String, default: 'flashcard' }, // 'flashcard' | 'quiz'
});

const flipped = ref(false);
function flip() {
  if (props.mode === 'flashcard') {
    flipped.value = !flipped.value;
  }
}
</script>
