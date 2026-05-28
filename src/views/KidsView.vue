<template>
  <div style="max-width: 1100px; margin: 0 auto; padding: 1.5rem">
    <!-- Kids header -->
    <div style="text-align: center; margin-bottom: 1.5rem">
      <div style="font-size: 2rem; font-weight: 800; color: var(--accent); margin-bottom: 0.25rem">📖 Picture Book</div>
      <div style="font-size: 1rem; color: var(--text-secondary)">Simple stories for little learners 🌟</div>
    </div>

    <!-- Story list -->
    <div v-if="!selectedStory" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem">
      <div
        v-for="article in kidsArticles"
        :key="article.id"
        class="card"
        style="padding: 0; overflow: hidden; cursor: pointer; border-radius: 16px; transition: transform 0.2s"
        @click="selectedStory = article"
      >
        <div
          style="height: 200px; background-size: cover; background-position: center; background-repeat: no-repeat"
          :style="{ backgroundImage: article.image ? `url(${article.image})` : 'linear-gradient(135deg, var(--accent-light), var(--accent))' }"
        ></div>
        <div style="padding: 1rem">
          <div style="font-size: 1.2rem; font-weight: 700; margin-bottom: 0.25rem">{{ article.title }}</div>
          <div style="font-size: 0.9rem; color: var(--text-secondary)">{{ article.title_cn }}</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem">
            {{ article.sentences?.length || 0 }} sentences ·
            {{ wordsForArticle(article.id).length }} words
          </div>
        </div>
      </div>
    </div>

    <!-- Single story view -->
    <div v-else>
      <div style="margin-bottom: 1rem">
        <button class="btn btn-outline" @click="selectedStory = null">← All Stories</button>
      </div>

      <!-- Story image -->
      <div
        v-if="selectedStory.image"
        style="width: 100%; max-height: 400px; border-radius: 16px; overflow: hidden; margin-bottom: 1.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.1)"
      >
        <img
          :src="selectedStory.image"
          :alt="selectedStory.title"
          style="width: 100%; height: 100%; object-fit: cover"
          loading="lazy"
        />
      </div>

      <!-- Story title -->
      <div style="text-align: center; margin-bottom: 1rem">
        <div style="font-size: 1.5rem; font-weight: 800; color: var(--accent)">{{ selectedStory.title }}</div>
        <div style="font-size: 1rem; color: var(--text-secondary)">{{ selectedStory.title_cn }}</div>
      </div>

      <!-- Sentences -->
      <div class="card" style="padding: 1.5rem; border-radius: 16px; margin-bottom: 1rem">
        <div style="margin-bottom: 0.5rem; display: flex; gap: 0.5rem; align-items: center">
          <button class="btn btn-outline" style="font-size: 0.85rem" @click="readStoryAloud">🔊 Read Aloud</button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.75rem">
          <div
            v-for="(sentence, si) in selectedStory.sentences"
            :key="si"
            style="padding: 0.75rem 1rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px"
            @click="speakSentence(sentence)"
          >
            <div style="font-size: 1.1rem; line-height: 1.6; font-weight: 500">
              <template v-for="(part, pi) in highlightSentence(sentence, selectedStory)" :key="pi">
                <span v-if="part.highlight" style="background: var(--accent-light); color: var(--accent); padding: 0 4px; border-radius: 4px; font-weight: 700"
                  >{{ part.text }}</span>
                <span v-else>{{ part.text }}</span>
              </template>
            </div>
            <div v-if="selectedStory.sentences_cn && selectedStory.sentences_cn[si]"
              style="font-size: 0.95rem; color: var(--text-secondary); margin-top: 0.25rem"
            >{{ selectedStory.sentences_cn[si] }}</div>
          </div>
        </div>
      </div>

      <!-- Words from this story -->
      <div style="margin-bottom: 0.5rem">
        <h3 style="font-weight: 600">Words in this story ({{ storyWords.length }})</h3>
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.5rem">
        <div
          v-for="w in storyWords"
          :key="w.id"
          class="card"
          style="padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: center; border-radius: 12px"
        >
          <div>
            <div style="font-weight: 700; font-size: 1.1rem">{{ w.word }}</div>
            <div style="font-size: 0.9rem; color: var(--text-secondary)">{{ w.chinese }}</div>
            <div v-if="w.sentence_in_article" style="font-size: 0.8rem; font-style: italic; color: var(--text-secondary); margin-top: 0.25rem">
              "{{ w.sentence_in_article }}"
            </div>
          </div>
          <button class="btn btn-outline" style="font-size: 0.75rem" @click="speakWord(w.word)">🔊</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useVocabStore } from '../stores/vocabStore';
import { speak } from '../lib/speech.js';

const store = useVocabStore();
const selectedStory = ref(null);

const kidsArticles = computed(() => {
  return store.articles.filter(a => a.level === 'kids' || a.image);
});

const storyWords = computed(() => {
  if (!selectedStory.value) return [];
  return store.wordsByArticleId[selectedStory.value.id] || [];
});

function wordsForArticle(articleId) {
  return store.wordsByArticleId[articleId] || [];
}

function highlightSentence(sentence, article) {
  const words = store.wordsByArticleId[article.id] || [];
  const highlights = new Set(words.map(w => w.word.toLowerCase()));
  const parts = [];
  const re = /[\w'-]+|[^\w'-]+/g;
  let m;
  let lastIdx = 0;
  while ((m = re.exec(sentence)) !== null) {
    if (m.index > lastIdx) {
      parts.push({ text: sentence.slice(lastIdx, m.index), highlight: false });
    }
    const word = m[0];
    parts.push({ text: word, highlight: highlights.has(word.toLowerCase()) });
    lastIdx = m.index + word.length;
  }
  if (lastIdx < sentence.length) {
    parts.push({ text: sentence.slice(lastIdx), highlight: false });
  }
  return parts;
}

let reading = false;
async function readStoryAloud() {
  if (reading || !selectedStory.value) return;
  reading = true;
  try {
    const text = selectedStory.value.sentences.join('. ');
    await speak(text);
  } catch (e) {
    console.warn('TTS failed:', e.message);
  }
  reading = false;
}

async function speakSentence(text) {
  try {
    await speak(text);
  } catch (e) {
    console.warn('TTS failed:', e.message);
  }
}

async function speakWord(word) {
  try {
    await speak(word);
  } catch (e) {
    console.warn('TTS failed:', e.message);
  }
}
</script>
