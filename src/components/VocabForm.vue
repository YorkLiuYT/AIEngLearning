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
      <div>
        <label style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem; display: block">Example Sentence</label>
        <input v-model="form.example" placeholder="They decided to abandon the project." />
      </div>
      <div>
        <label style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem; display: block">Context (sentence where you found this word)</label>
        <input v-model="form.context" placeholder="The company decided to abandon the old system." />
      </div>
      <div>
        <label style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem; display: block">Source Article</label>
        <input v-model="form.source_article" placeholder="Daily Article 2026-05-27" />
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

const emit = defineEmits(['save', 'cancel']);
const props = defineProps({
  editData: Object,
  editId: String,
});

const form = reactive({
  word: '',
  chinese: '',
  part_of_speech: '',
  example: '',
  context: '',
  source_article: '',
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
