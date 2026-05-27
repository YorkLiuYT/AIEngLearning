<template>
  <div class="card" style="text-align: center; min-height: 320px; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer; user-select: none" @click="flip">
    <div v-if="!flipped" key="front" style="font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem">
      {{ word.word }}
      <button
        class="btn btn-outline"
        style="font-size: 1rem; padding: 0.25rem 0.5rem; margin-left: 0.5rem; vertical-align: middle"
        @click.stop="doSpeak"
        title="Pronounce"
      >🔊</button>
    </div>
    <div v-else key="back" style="width: 100%">
      <div style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.25rem">{{ word.chinese }}</div>
      <div v-if="word.part_of_speech" style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem">
        {{ word.part_of_speech }}
      </div>

      <!-- Sentence from article + translation -->
      <div v-if="word.sentence_in_article" style="font-size: 1rem; font-style: italic; color: var(--text-secondary); margin-bottom: 0.25rem; padding: 0 1rem">
        "{{ word.sentence_in_article }}"
      </div>
      <div v-if="word.sentence_translation" style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.75rem">
        → {{ word.sentence_translation }}
      </div>

      <!-- Fallback example sentence -->
      <div v-else-if="word.example" style="font-size: 1rem; font-style: italic; color: var(--text-secondary); margin-bottom: 0.75rem">
        "{{ word.example }}"
      </div>

      <!-- Grammar explanation -->
      <div v-if="word.grammar" style="font-size: 0.875rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; padding: 0.5rem 0.75rem; margin: 0.5rem 1rem; color: var(--accent)">
        📝 Grammar: {{ word.grammar }}
      </div>

      <!-- Context / source -->
      <div v-if="word.context" style="font-size: 0.875rem; color: var(--accent); margin-bottom: 0.25rem">
        📖 {{ word.context }}
      </div>
      <div v-if="word.source_article" style="font-size: 0.75rem; color: var(--text-secondary)">
        📌 {{ word.source_article }}
      </div>

      <!-- Tags -->
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
import { speak } from '../lib/speech.js';

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

let speaking = false;
async function doSpeak() {
  if (speaking) return;
  speaking = true;
  try {
    await speak(props.word.word);
  } catch (e) {
    console.warn('TTS failed:', e.message);
  }
  speaking = false;
}
</script>
