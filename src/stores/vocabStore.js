import { defineStore } from 'pinia';
import { getAllWords, putWord, deleteWord, importWords, clearAll } from '../lib/db.js';
import { getDefaultSRS, handleCorrect, handleForget, isDue, getDueCount, getProgress } from '../lib/srs.js';

export const useVocabStore = defineStore('vocab', {
  state: () => ({
    words: [],
    loading: true,
    theme: localStorage.getItem('theme') || 'auto',
    backupToastShown: parseInt(localStorage.getItem('backupToastWeek') || '0'),
  }),

  getters: {
    dueWords() {
      return this.words.filter(w => isDue(w.srs));
    },
    newWords() {
      return this.words.filter(w => w.srs.level === 0 && w.srs.review_count === 0);
    },
    progress() {
      return getProgress(this.words);
    },
    allTags() {
      const tags = new Set();
      for (const w of this.words) {
        if (w.tags) w.tags.forEach(t => tags.add(t));
      }
      return [...tags].sort();
    },
  },

  actions: {
    async loadWords() {
      this.loading = true;
      this.words = await getAllWords();
      this.loading = false;
      this.checkBackupToast();
    },

    async addWord(wordData) {
      const id = crypto.randomUUID();
      const word = {
        id,
        word: wordData.word,
        chinese: wordData.chinese,
        part_of_speech: wordData.part_of_speech || '',
        example: wordData.example || '',
        source_article: wordData.source_article || '',
        context: wordData.context || '',
        tags: wordData.tags || [],
        srs: getDefaultSRS(),
        created_at: Date.now(),
      };
      await putWord(word);
      this.words.push(word);
      return word;
    },

    async updateWord(id, updates) {
      const idx = this.words.findIndex(w => w.id === id);
      if (idx === -1) return;
      const updated = { ...this.words[idx], ...updates };
      await putWord(updated);
      this.words[idx] = updated;
    },

    async deleteWord(id) {
      await deleteWord(id);
      this.words = this.words.filter(w => w.id !== id);
    },

    async recordCorrect(id) {
      const idx = this.words.findIndex(w => w.id === id);
      if (idx === -1) return;
      const word = this.words[idx];
      word.srs = handleCorrect(word.srs);
      await putWord(word);
    },

    async recordForget(id) {
      const idx = this.words.findIndex(w => w.id === id);
      if (idx === -1) return;
      const word = this.words[idx];
      word.srs = handleForget(word.srs);
      await putWord(word);
    },

    async importFromJSON(json) {
      const words = JSON.parse(json);
      await importWords(words);
      await this.loadWords();
    },

    exportToJSON() {
      return JSON.stringify(this.words, null, 2);
    },

    async clearAll() {
      await clearAll();
      this.words = [];
    },

    setTheme(t) {
      this.theme = t;
      localStorage.setItem('theme', t);
      applyTheme(t);
    },

    checkBackupToast() {
      const now = new Date();
      const weekStart = getWeekStart(now);
      const stored = parseInt(localStorage.getItem('backupToastWeek') || '0');
      if (stored < weekStart && this.words.length > 0) {
        this.backupToastShown = weekStart;
        localStorage.setItem('backupToastWeek', String(weekStart));
        return true; // caller can show toast
      }
      return false;
    },
  },
});

function getWeekStart(d) {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.getFullYear(), d.getMonth(), diff);
  return Math.floor(monday.getTime() / 1000);
}

function applyTheme(t) {
  const root = document.documentElement;
  if (t === 'dark') {
    root.classList.add('dark');
  } else if (t === 'light') {
    root.classList.remove('dark');
  } else {
    // auto
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    root.classList.toggle('dark', mq.matches);
  }
}
