<template>
  <div>
    <NavBar
      :current-tab="currentTab"
      :tabs="tabs"
      :progress="store.progress"
      :theme="store.theme"
      @navigate="currentTab = $event"
    />
    <StudyView v-if="currentTab === 'study'" />
    <KidsView v-if="currentTab === 'kids'" />
    <ArticleView v-if="currentTab === 'articles'" />
    <ManageView v-if="currentTab === 'manage'" />
    <StatsView v-if="currentTab === 'stats'" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useVocabStore } from './stores/vocabStore';
import NavBar from './components/NavBar.vue';
import StudyView from './views/StudyView.vue';
import ArticleView from './views/ArticleView.vue';
import ManageView from './views/ManageView.vue';
import StatsView from './views/StatsView.vue';
import KidsView from './views/KidsView.vue';

const store = useVocabStore();
const currentTab = ref('study');
const tabs = [
  { id: 'study', label: 'Study' },
  { id: 'kids', label: '📚 Kids' },
  { id: 'articles', label: 'Articles' },
  { id: 'manage', label: 'Manage' },
  { id: 'stats', label: 'Stats' },
];

onMounted(() => {
  const t = localStorage.getItem('theme') || 'auto';
  store.setTheme(t);
});
</script>
