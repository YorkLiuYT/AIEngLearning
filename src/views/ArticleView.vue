<template>
  <div style="max-width: 900px; margin: 0 auto; padding: 1.5rem">
    <!-- Article list header -->
    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap">
      <button class="btn btn-primary" @click="openAddForm">+ Add Article</button>
      <button class="btn btn-outline" @click="toggleView">{{ viewMode === 'list' ? 'Show Words' : 'Show Articles' }}</button>
    </div>

    <!-- Article add/edit form -->
    <ArticleForm
      v-if="showForm"
      :edit-id="editId"
      :edit-data="editData"
      @save="handleArticleSave"
      @cancel="showForm = false"
    />

    <!-- ARTICLE LIST VIEW -->
    <div v-if="viewMode === 'list'">
      <!-- Theme filter -->
      <div style="margin-bottom: 1rem">
        <div style="display: flex; gap: 0.25rem; flex-wrap: wrap">
          <button
            class="btn btn-outline"
            :style="activeTheme === '' ? 'background: var(--accent); color: white; border-color: var(--accent)' : ''"
            @click="activeTheme = ''"
          >All Themes</button>
          <button
            class="btn btn-outline"
            v-for="t in store.allThemes"
            :key="t"
            :style="activeTheme === t ? 'background: var(--accent); color: white; border-color: var(--accent)' : ''"
            @click="activeTheme = t"
          >{{ t }}</button>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1rem">
        <div v-if="filteredArticles.length === 0" style="text-align: center; padding: 2rem; color: var(--text-secondary)">
          No articles yet. Add one!
        </div>
        <div
          v-for="a in filteredArticles"
          :key="a.id"
          class="card"
          style="padding: 1rem; cursor: pointer"
          @click="selectArticle(a)"
        >
          <div style="font-weight: 600; margin-bottom: 0.25rem">{{ a.title }}</div>
          <div style="font-size: 0.875rem; color: var(--text-secondary)">
            <span v-if="a.theme">{{ a.theme }}</span>
            <span v-if="a.source"> · {{ a.source }}</span>
            <span> · {{ (store.wordsByArticleId[a.id] || []).length }} words</span>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
            {{ a.full_text ? a.full_text.substring(0, 120) + '...' : '' }}
          </div>
          <div style="display: flex; gap: 0.25rem; margin-top: 0.5rem">
            <button class="btn btn-outline" style="font-size: 0.75rem; padding: 0.25rem 0.5rem" @click.stop="openEditArticle(a)">Edit</button>
            <button class="btn" style="font-size: 0.75rem; padding: 0.25rem 0.5rem; background: var(--red); color: white" @click.stop="deleteArticle(a.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- SINGLE ARTICLE DETAIL VIEW -->
    <div v-else-if="selectedArticle">
      <div style="margin-bottom: 1rem">
        <button class="btn btn-outline" @click="selectedArticle = null">← Back to articles</button>
      </div>

      <!-- Article header -->
      <div class="card" style="padding: 1rem; margin-bottom: 1rem">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.5rem">
          <h2 style="font-weight: 700">{{ selectedArticle.title }}</h2>
          <button
            class="btn btn-outline"
            style="font-size: 0.75rem; padding: 0.25rem 0.5rem; flex-shrink: 0"
            @click="readArticleAloud"
            title="Read article aloud"
          >🔊 Read Aloud</button>
        </div>
        <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1rem">
          <span v-if="selectedArticle.theme">Theme: {{ selectedArticle.theme }}</span>
          <span v-if="selectedArticle.source"> · Source: {{ selectedArticle.source }}</span>
        </div>
        <!-- Full text with word highlights -->
        <div style="font-size: 0.95rem; line-height: 1.7; white-space: pre-wrap; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 1rem">
          <template v-for="(part, i) in highlightedTextParts" :key="i">
            <span v-if="part.highlight" style="background: var(--accent-light); color: var(--accent); padding: 0 2px; border-radius: 3px; font-weight: 600"
              >{{ part.text }}</span>
            <span v-else>{{ part.text }}</span>
          </template>
        </div>
      </div>

      <!-- Words from this article -->
      <div style="margin-bottom: 0.5rem; display: flex; gap: 0.5rem; align-items: center">
        <h3 style="font-weight: 600">Words from this article ({{ articleWords.length }})</h3>
        <button class="btn btn-outline" style="font-size: 0.75rem" @click="openAddFormForArticle">+ Add Word</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.5rem">
        <div v-if="articleWords.length === 0" style="text-align: center; padding: 2rem; color: var(--text-secondary)">
          No words extracted yet. Add vocabulary from this article.
        </div>
        <div
          v-for="w in articleWords"
          :key="w.id"
          class="card"
          style="padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem"
        >
          <div style="flex: 1">
            <div style="font-weight: 600">{{ w.word }}</div>
            <div style="font-size: 0.875rem; color: var(--text-secondary)">{{ w.chinese }}</div>
            <div v-if="w.sentence_in_article" style="font-size: 0.8rem; font-style: italic; color: var(--text-secondary); margin-top: 0.25rem">
              "{{ w.sentence_in_article }}"
            </div>
            <div v-if="w.sentence_translation" style="font-size: 0.8rem; color: var(--text-secondary)">
              → {{ w.sentence_translation }}
            </div>
            <div v-if="w.grammar" style="font-size: 0.8rem; color: var(--accent); margin-top: 0.25rem">
              📝 {{ w.grammar }}
            </div>
          </div>
          <div style="display: flex; gap: 0.25rem; align-items: center">
            <span style="font-size: 0.75rem; color: var(--text-secondary)">L{{ w.srs.level }}</span>
            <button class="btn btn-outline" style="font-size: 0.75rem; padding: 0.25rem 0.5rem" @click="openEditWord(w)">Edit</button>
            <button class="btn" style="font-size: 0.75rem; padding: 0.25rem 0.5rem; background: var(--red); color: white" @click="deleteWordFromArticle(w.id)">Del</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useVocabStore } from '../stores/vocabStore';
import ArticleForm from '../components/ArticleForm.vue';
import { speak } from '../lib/speech.js';

const store = useVocabStore();
const viewMode = ref('list');
const showForm = ref(false);
const editId = ref('');
const editData = ref(null);
const activeTheme = ref('');
const selectedArticle = ref(null);

const filteredArticles = computed(() => {
  if (!activeTheme.value) return store.articles;
  return store.articles.filter(a => a.theme === activeTheme.value);
});

const articleWords = computed(() => {
  if (!selectedArticle.value) return [];
  return store.wordsByArticleId[selectedArticle.value.id] || [];
});

const highlightedTextParts = computed(() => {
  const a = selectedArticle.value;
  if (!a || !a.full_text) return [{ text: '', highlight: false }];
  const words = articleWords.value;
  if (!words.length) return [{ text: a.full_text, highlight: false }];

  // Build highlight map
  const highlights = new Set(words.map(w => w.word.toLowerCase()));
  const parts = [];
  // Simple tokenizer — split by word boundaries
  const re = /[\w'-]+|[^a-zA-Z'-]+/g;
  let lastIdx = 0;
  let m;
  while ((m = re.exec(a.full_text)) !== null) {
    // Text before match
    if (m.index > lastIdx) {
      parts.push({ text: a.full_text.slice(lastIdx, m.index), highlight: false });
    }
    const word = m[0];
    const isHighlighted = highlights.has(word.toLowerCase());
    parts.push({ text: word, highlight: isHighlighted });
    lastIdx = m.index + word.length;
  }
  if (lastIdx < a.full_text.length) {
    parts.push({ text: a.full_text.slice(lastIdx), highlight: false });
  }
  return parts;
});

function selectArticle(a) {
  selectedArticle.value = a;
  viewMode.value = 'article';
}

function toggleView() {
  if (viewMode.value === 'list') {
    selectedArticle.value = null;
    viewMode.value = 'article';
  } else {
    selectedArticle.value = null;
    viewMode.value = 'list';
  }
}

function openAddForm() {
  editId.value = '';
  editData.value = null;
  showForm.value = true;
}

function openAddFormForArticle() {
  editId.value = '';
  editData.value = null;
  showForm.value = true;
  // Pre-fill article_id — handled by caller
}

function openEditArticle(a) {
  editId.value = a.id;
  editData.value = { ...a };
  showForm.value = true;
}

async function handleArticleSave(data) {
  if (editId.value) {
    await store.updateArticle(editId.value, data);
  } else {
    await store.addArticle(data);
  }
  showForm.value = false;
}

async function deleteArticle(id) {
  if (confirm('Delete this article and ALL its words?')) {
    await store.deleteArticle(id);
    if (selectedArticle.value && selectedArticle.value.id === id) {
      selectedArticle.value = null;
      viewMode.value = 'list';
    }
  }
}

// Word editing within article
function openEditWord(w) {
  // Navigate to Manage tab with pre-filled edit
  // For now we just alert the user
  alert('Edit this word in the Manage tab.');
}

async function deleteWordFromArticle(id) {
  if (confirm('Delete this word?')) {
    await store.deleteWord(id);
  }
}

let reading = false;
async function readArticleAloud() {
  if (reading || !selectedArticle.value?.full_text) return;
  reading = true;
  try {
    await speak(selectedArticle.value.full_text);
  } catch (e) {
    console.warn('TTS failed:', e.message);
  }
  reading = false;
}
</script>
