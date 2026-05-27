import { defineStore } from 'pinia';
import {
  getAllWords, putWord, deleteWord, importWords, clearWords,
  getAllArticles, putArticle, deleteArticle, importArticles, clearArticles,
  getWordsByArticle,
} from '../lib/db.js';
import { getDefaultSRS, handleCorrect, handleForget, isDue, getDueCount, getProgress } from '../lib/srs.js';

export const useVocabStore = defineStore('vocab', {
  state: () => ({
    words: [],
    articles: [],
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
    allThemes() {
      const themes = new Set();
      for (const a of this.articles) {
        if (a.theme) themes.add(a.theme);
      }
      return [...themes].sort();
    },
    wordsByArticleId() {
      const map = {};
      for (const w of this.words) {
        const aid = w.article_id || '__none__';
        if (!map[aid]) map[aid] = [];
        map[aid].push(w);
      }
      return map;
    },
  },

  actions: {
    async loadAll() {
      this.loading = true;
      this.words = await getAllWords();
      this.articles = await getAllArticles();
      this.loading = false;

      // Auto-load sample data on first visit
      if (this.words.length === 0 && this.articles.length === 0 && !localStorage.getItem('sampleLoaded')) {
        try {
          const resp = await fetch('./sample-articles.json');
          if (resp.ok) {
            const data = await resp.json();
            if (data.articles && data.articles.length > 0) {
              await importArticles(data.articles);
            }
            if (data.words && data.words.length > 0) {
              await importWords(data.words);
            }
            // Reload from DB
            this.words = await getAllWords();
            this.articles = await getAllArticles();
          }
        } catch (e) {
          console.warn('Auto-load sample data failed:', e.message);
        }
        localStorage.setItem('sampleLoaded', '1');
      }

      this.checkBackupToast();
    },

    // ── Words ──

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
        article_id: wordData.article_id || '',
        sentence_in_article: wordData.sentence_in_article || '',
        sentence_translation: wordData.sentence_translation || '',
        grammar: wordData.grammar || '',
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
      const data = JSON.parse(json);
      // Support both full export (articles + words) and legacy word-only
      if (data.articles && Array.isArray(data.articles)) {
        await importArticles(data.articles);
      }
      if (data.words && Array.isArray(data.words)) {
        await importWords(data.words);
      } else if (Array.isArray(data)) {
        await importWords(data);
      }
      await this.loadAll();
    },

    exportToJSON() {
      return JSON.stringify({
        version: 2,
        exported_at: new Date().toISOString(),
        articles: this.articles,
        words: this.words,
      }, null, 2);
    },

    async clearAll() {
      await clearWords();
      await clearArticles();
      this.words = [];
      this.articles = [];
    },

    // ── Articles ──

    async addArticle(articleData) {
      const id = crypto.randomUUID();
      const article = {
        id,
        title: articleData.title,
        theme: articleData.theme || '',
        source: articleData.source || '',
        full_text: articleData.full_text || '',
        created_at: Date.now(),
      };
      await putArticle(article);
      this.articles.push(article);
      return article;
    },

    async updateArticle(id, updates) {
      const idx = this.articles.findIndex(a => a.id === id);
      if (idx === -1) return;
      const updated = { ...this.articles[idx], ...updates };
      await putArticle(updated);
      this.articles[idx] = updated;
    },

    async deleteArticle(id) {
      // Remove all words belonging to this article
      const wordsToDelete = this.words.filter(w => w.article_id === id);
      for (const w of wordsToDelete) {
        await deleteWord(w.id);
      }
      this.words = this.words.filter(w => w.article_id !== id);
      await deleteArticle(id);
      this.articles = this.articles.filter(a => a.id !== id);
    },

    // ── Theme ──

    setTheme(t) {
      this.theme = t;
      localStorage.setItem('theme', t);
      applyTheme(t);
    },

    checkBackupToast() {
      const now = new Date();
      const weekStart = getWeekStart(now);
      const stored = parseInt(localStorage.getItem('backupToastWeek') || '0');
      if (stored < weekStart && (this.words.length > 0 || this.articles.length > 0)) {
        this.backupToastShown = weekStart;
        localStorage.setItem('backupToastWeek', String(weekStart));
        return true;
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
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    root.classList.toggle('dark', mq.matches);
  }
}
