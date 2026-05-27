<template>
  <div class="card" style="margin-bottom: 1rem">
    <h3 style="font-weight: 600; margin-bottom: 1rem">{{ editId ? 'Edit Article' : 'Add New Article' }}</h3>
    <div style="display: flex; flex-direction: column; gap: 0.75rem">
      <div>
        <label style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem; display: block">Title</label>
        <input v-model="form.title" placeholder="Article title" />
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem">
        <div>
          <label style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem; display: block">Theme</label>
          <input v-model="form.theme" placeholder="e.g. Tech_News, TOEIC" />
        </div>
        <div>
          <label style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem; display: block">Source</label>
          <input v-model="form.source" placeholder="e.g. BBC News, CNN" />
        </div>
      </div>
      <div>
        <label style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem; display: block">Full Text</label>
        <textarea v-model="form.full_text" rows="8" placeholder="Paste the full article text here..." style="width: 100%; resize: vertical; font-size: 0.9rem"></textarea>
      </div>
      <div style="display: flex; gap: 0.5rem">
        <button class="btn btn-primary" @click="submit">Save</button>
        <button v-if="editId" class="btn btn-outline" @click="$emit('cancel')">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue';

const emit = defineEmits(['save', 'cancel']);
const props = defineProps({
  editData: Object,
  editId: String,
});

const form = reactive({
  title: '',
  theme: '',
  source: '',
  full_text: '',
});

watch(() => props.editData, (val) => {
  if (val) {
    form.title = val.title || '';
    form.theme = val.theme || '';
    form.source = val.source || '';
    form.full_text = val.full_text || '';
  }
}, { immediate: true });

function submit() {
  if (!form.title.trim()) return;
  emit('save', { ...form });
}
</script>
