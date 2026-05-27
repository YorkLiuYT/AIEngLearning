<template>
  <div style="max-width: 900px; margin: 0 auto; padding: 1.5rem">
    <!-- Add / Edit form -->
    <VocabForm
      v-if="showForm"
      :edit-id="editId"
      :edit-data="editData"
      @save="handleSave"
      @cancel="showForm = false"
    />

    <!-- Import / Export / Clear buttons -->
    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap">
      <button class="btn btn-primary" @click="openAddForm">+ Add Word</button>
      <button class="btn btn-outline" @click="triggerImport">📥 Import JSON</button>
      <button class="btn btn-outline" @click="copyExport">📤 Copy JSON</button>
      <button class="btn btn-outline" @click="downloadExport">📤 Download JSON</button>
      <button class="btn" style="background: var(--red); color: white" @click="clearAll">🗑 Clear All</button>
    </div>
    <input
      ref="importInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleImport"
    />

    <!-- Tag filter -->
    <div style="margin-bottom: 1rem">
      <div style="display: flex; gap: 0.25rem; flex-wrap: wrap">
        <button
          class="btn btn-outline"
          :style="activeTag === '' ? 'background: var(--accent); color: white; border-color: var(--accent)' : ''"
          @click="activeTag = ''"
        >All</button>
        <button
          class="btn btn-outline"
          v-for="tag in store.allTags"
          :key="tag"
          :style="activeTag === tag ? 'background: var(--accent); color: white; border-color: var(--accent)' : ''"
          @click="activeTag = tag"
        >{{ tag }}</button>
      </div>
    </div>

    <!-- Word list -->
    <div style="display: flex; flex-direction: column; gap: 0.5rem">
      <div
        v-for="w in filteredWords"
        :key="w.id"
        class="card"
        style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; cursor: pointer"
        @click="openEdit(w)"
      >
        <div style="flex: 1">
          <div style="font-weight: 600">{{ w.word }}</div>
          <div style="font-size: 0.875rem; color: var(--text-secondary)">{{ w.chinese }}</div>
          <div v-if="w.grammar" style="font-size: 0.75rem; color: var(--accent)">📝 {{ w.grammar }}</div>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center; margin-left: 1rem; flex-shrink: 0">
          <!-- Article badge -->
          <div v-if="w.article_id && articleTitle(w.article_id)" style="font-size: 0.7rem; color: var(--text-secondary); max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
            📌 {{ articleTitle(w.article_id) }}
          </div>
          <div style="font-size: 0.75rem; color: var(--text-secondary)">
            L{{ w.srs.level }} · {{ w.srs.review_count }}x
          </div>
          <div
            :style="{
              width: '8px', height: '8px', borderRadius: '50%',
              background: w.srs.level >= 3 ? 'var(--green)' : w.srs.level >= 1 ? 'var(--orange)' : 'var(--border)',
            }"
          />
        </div>
      </div>
      <div v-if="filteredWords.length === 0" style="text-align: center; padding: 2rem; color: var(--text-secondary)">
        No words yet. Add some!
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useVocabStore } from '../stores/vocabStore';
import VocabForm from '../components/VocabForm.vue';

const store = useVocabStore();
const showForm = ref(false);
const editId = ref('');
const editData = ref(null);
const activeTag = ref('');
const importInput = ref(null);

const filteredWords = computed(() => {
  if (!activeTag.value) return store.words;
  return store.words.filter(w => w.tags && w.tags.includes(activeTag.value));
});

function articleTitle(articleId) {
  const a = store.articles.find(a => a.id === articleId);
  return a ? a.title : '';
}

function openAddForm() {
  editId.value = '';
  editData.value = null;
  showForm.value = true;
}

function openEdit(w) {
  editId.value = w.id;
  editData.value = { ...w };
  showForm.value = true;
}

async function handleSave(data) {
  if (editId.value) {
    await store.updateWord(editId.value, data);
  } else {
    await store.addWord(data);
  }
  showForm.value = false;
}

function triggerImport() {
  importInput.value.click();
}

async function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  await store.importFromJSON(text);
  importInput.value.value = '';
}

async function copyExport() {
  const json = store.exportToJSON();
  await navigator.clipboard.writeText(json);
  alert('JSON copied to clipboard!');
}

function downloadExport() {
  const json = store.exportToJSON();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vocab-backup.json';
  a.click();
  URL.revokeObjectURL(url);
}

async function clearAll() {
  if (confirm('Delete ALL words and articles? This cannot be undone.')) {
    await store.clearAll();
  }
}
</script>
