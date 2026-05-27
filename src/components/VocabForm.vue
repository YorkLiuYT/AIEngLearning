<template>
  <div class="card" style="margin-bottom: 1rem">
    <h3 style="font-weight: 600; margin-bottom: 1rem">{{ editId ? 'Edit Word' : 'Add New Word' }}</h3>
    <div style="display: flex; flex-direction: column; gap: 0.75rem">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem">
        <div>
          <label style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem; display: block">Word</label>
          <input v-model="form.word" placeholder="e.g. abandon" />
        </div>
        <div>
          <label style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem; display: block">Chinese</label>
          <input v-model="form.chinese" placeholder="中文释义" />
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem">
        <div>
          <label style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem; display: block">Part of Speech</label>
          <select v-model="form.part_of_speech">
            <option value="">— select —</option>
            <option>verb</option>
            <option>noun</option>
            <option>adjective</option>
            <option>adverb</option>
            <option>phrase</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem; display: block">Tags</label>
          <input v-model="tagInput" placeholder="tech, TOEIC_High_Freq" @keydown.enter.prevent="addTag" />
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem">
        <div>
          <label style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem; display: block">Article</label>
          <select v-model="form.article_id">
            <option value="">— none —</option>
            <option v-for="a in articles" :key="a.id" :value="a.id">{{ a.title }}</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem; display: block">Grammar</label>
          <input v-model="form.grammar" placeholder="e.g. subjunctive mood, passive voice" />
        </div>
      </div>
      <div>
        <label style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem; display: block">Example Sentence</label>
        <input v-model="form.example" placeholder="They decided to abandon the project." />
      </div>
      <div>
        <label style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem; display: block">Sentence from Article (original)</label>
        <input v-model="form.sentence_in_article" placeholder="The original sentence from the article" />
      </div>
      <div>
        <label style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem; display: block">Sentence Translation (中文翻譯)</label>
        <input v-model="form.sentence_translation" placeholder="文章句子的中文翻譯" />
      </div>
      <div>
        <label style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem; display: block">Source Article (text note)</label>
        <input v-model="form.source_article" placeholder="Daily Article 2026-05-27" />
      </div>
      <div>
        <label style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem; display: block">Context (optional note)</label>
        <input v-model="form.context" placeholder="The company decided to abandon the old system." />
      </div>
      <div style="display: flex; gap: 0.5rem">
        <button class="btn btn-primary" @click="submit">Save</button>
        <button v-if="editId" class="btn btn-outline" @click="$emit('cancel')">Cancel</button>
      </div>
    </div>
    <div v-if="form.tags.length" style="margin-top: 0.75rem">
      <span class="tag" v-for="(t, i) in form.tags" :key="i" style="margin-right: 4px; cursor: pointer" @click="removeTag(i)">
        {{ t }} ✕
      </span>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import { useVocabStore } from '../stores/vocabStore';

const emit = defineEmits(['save', 'cancel']);
const props = defineProps({
  editData: Object,
  editId: String,
});

const store = useVocabStore();
const articles = store.articles;

const form = reactive({
  word: '',
  chinese: '',
  part_of_speech: '',
  example: '',
  context: '',
  source_article: '',
  article_id: '',
  sentence_in_article: '',
  sentence_translation: '',
  grammar: '',
  tags: [],
});

const tagInput = ref('');

watch(() => props.editData, (val) => {
  if (val) {
    form.word = val.word || '';
    form.chinese = val.chinese || '';
    form.part_of_speech = val.part_of_speech || '';
    form.example = val.example || '';
    form.context = val.context || '';
    form.source_article = val.source_article || '';
    form.article_id = val.article_id || '';
    form.sentence_in_article = val.sentence_in_article || '';
    form.sentence_translation = val.sentence_translation || '';
    form.grammar = val.grammar || '';
    form.tags = [...(val.tags || [])];
  }
}, { immediate: true });

function addTag() {
  const t = tagInput.value.trim();
  if (t && !form.tags.includes(t)) {
    form.tags.push(t);
  }
  tagInput.value = '';
}

function removeTag(i) {
  form.tags.splice(i, 1);
}

function submit() {
  if (!form.word.trim() || !form.chinese.trim()) return;
  emit('save', { ...form });
}
</script>
