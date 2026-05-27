<template>
  <div style="max-width: 600px; margin: 0 auto; padding: 1.5rem">
    <!-- Stats summary -->
    <div style="display: flex; gap: 0.75rem; margin-bottom: 1rem; font-size: 0.875rem; color: var(--text-secondary)">
      <span>📚 Total: {{ store.progress.total }}</span>
      <span>✅ Learned: {{ store.progress.learned }}</span>
      <span>⏰ Due: {{ store.progress.due }}</span>
    </div>

    <ProgressBar label="Learning progress" :value="store.progress.learned" :max="Math.max(store.progress.total, 1)" />

    <!-- Session mode toggle -->
    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap">
      <button class="btn" :class="sessionMode === 'due' ? 'btn-primary' : 'btn-outline'" @click="sessionMode = 'due'">
        Review Due ({{ dueCount }})
      </button>
      <button class="btn" :class="sessionMode === 'new' ? 'btn-primary' : 'btn-outline'" @click="sessionMode = 'new'">
        New Words ({{ newCount }})
      </button>
      <button class="btn" :class="sessionMode === 'all' ? 'btn-primary' : 'btn-outline'" @click="sessionMode = 'all'">
        All Words
      </button>
    </div>

    <!-- Article filter -->
    <div style="margin-bottom: 1rem">
      <div style="display: flex; gap: 0.25rem; flex-wrap: wrap">
        <button
          class="btn btn-outline"
          :style="activeArticleFilter === '' ? 'background: var(--accent); color: white; border-color: var(--accent)' : ''"
          @click="activeArticleFilter = ''"
        >All Articles</button>
        <button
          class="btn btn-outline"
          v-for="a in store.articles"
          :key="a.id"
          :style="activeArticleFilter === a.id ? 'background: var(--accent); color: white; border-color: var(--accent)' : ''"
          @click="activeArticleFilter = a.id"
        >{{ a.title.length > 20 ? a.title.substring(0, 20) + '…' : a.title }}</button>
      </div>
    </div>

    <!-- Session queue -->
    <div v-if="loading" style="text-align: center; padding: 2rem; color: var(--text-secondary)">Loading...</div>
    <div v-else-if="queue.length === 0" style="text-align: center; padding: 3rem; color: var(--text-secondary)">
      <div style="font-size: 1.5rem; margin-bottom: 1rem">🎉</div>
      <div v-if="sessionMode === 'due'">No words due for review! Great job!</div>
      <div v-else-if="sessionMode === 'new'">No new words. Add some in Manage or Articles tab.</div>
      <div v-else>No words yet. Go to Manage tab to add words.</div>
    </div>

    <div v-else style="position: relative">
      <!-- Current card -->
      <FlashCard :word="currentWord" mode="flashcard" />

      <!-- Action buttons -->
      <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem">
        <button class="btn btn-red" style="padding: 0.75rem 2rem; font-size: 1rem" @click="markForget">
          ✗ Forget
        </button>
        <button class="btn btn-green" style="padding: 0.75rem 2rem; font-size: 1rem" @click="markCorrect">
          ✓ Know
        </button>
      </div>

      <!-- Queue progress -->
      <div style="text-align: center; margin-top: 1rem; font-size: 0.875rem; color: var(--text-secondary)">
        {{ currentIndex + 1 }} / {{ queue.length }}
      </div>
    </div>

    <!-- Toast backup reminder -->
    <div v-if="showBackupToast" style="position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%); background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem 1.5rem; font-size: 0.875rem; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 100">
      💡 Tip: Export your word list as JSON backup from the Manage tab.
      <button class="btn btn-outline" style="margin-left: 0.5rem" @click="showBackupToast = false">Got it</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useVocabStore } from '../stores/vocabStore';
import FlashCard from '../components/FlashCard.vue';
import ProgressBar from '../components/ProgressBar.vue';

const store = useVocabStore();
const sessionMode = ref('due');
const currentIndex = ref(0);
const loading = ref(true);
const showBackupToast = ref(false);
const activeArticleFilter = ref('');

// Filter words by article if active
const filteredWords = computed(() => {
  if (!activeArticleFilter.value) return store.words;
  return store.words.filter(w => w.article_id === activeArticleFilter.value);
});

const dueCount = computed(() => filteredWords.value.filter(w => isDueLocal(w.srs)).length);
const newCount = computed(() => filteredWords.value.filter(w => w.srs.level === 0 && w.srs.review_count === 0).length);

const queue = computed(() => {
  const words = filteredWords.value;
  if (sessionMode.value === 'due') {
    return words.filter(w => isDueLocal(w.srs));
  } else if (sessionMode.value === 'new') {
    return words.filter(w => w.srs.level === 0 && w.srs.review_count === 0);
  }
  return words;
});

const currentWord = computed(() => {
  if (queue.value.length === 0) return null;
  return queue.value[currentIndex.value];
});

import { speak } from '../lib/speech.js';

watch(sessionMode, () => { currentIndex.value = 0; });
watch(activeArticleFilter, () => { currentIndex.value = 0; });

// Auto-play: speak when current word changes
watch(currentWord, (word) => {
  if (word && store.ttsAutoPlay) {
    speak(word.word).catch(() => {});
  }
});

function isDueLocal(srs) {
  return Date.now() >= srs.next_review;
}

async function markCorrect() {
  if (!currentWord.value) return;
  await store.recordCorrect(currentWord.value.id);
  advance();
}

async function markForget() {
  if (!currentWord.value) return;
  await store.recordForget(currentWord.value.id);
  advance();
}

function advance() {
  if (currentIndex.value < queue.value.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0;
  }
}

onMounted(async () => {
  await store.loadAll();
  loading.value = false;
  if (store.checkBackupToast()) {
    showBackupToast.value = true;
  }
});
</script>
