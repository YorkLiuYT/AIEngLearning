/**
 * IndexedDB wrapper for vocab + articles storage.
 * Database: vocab-app, Stores: words, articles
 */
const DB_NAME = 'vocab-app';
const DB_VERSION = 2;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      // Words store (v1)
      if (!db.objectStoreNames.contains('words')) {
        const store = db.createObjectStore('words', { keyPath: 'id' });
        store.createIndex('tags', 'tags', { multiEntry: true });
        store.createIndex('next_review', 'srs.next_review');
        store.createIndex('article_id', 'article_id');
      }
      // Articles store (v2)
      if (!db.objectStoreNames.contains('articles')) {
        const store = db.createObjectStore('articles', { keyPath: 'id' });
        store.createIndex('theme', 'theme');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ── Words ──

export async function getAllWords() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('words', 'readonly');
    const store = tx.objectStore('words');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function getWord(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('words', 'readonly');
    const store = tx.objectStore('words');
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function putWord(word) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('words', 'readwrite');
    const store = tx.objectStore('words');
    const req = store.put(word);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function deleteWord(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('words', 'readwrite');
    const store = tx.objectStore('words');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function importWords(words) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('words', 'readwrite');
    const store = tx.objectStore('words');
    for (const w of words) store.put(w);
    tx.oncomplete = () => { resolve(); db.close(); };
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearWords() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('words', 'readwrite');
    const store = tx.objectStore('words');
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function getWordsByArticle(articleId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('words', 'readonly');
    const store = tx.objectStore('words');
    const index = store.index('article_id');
    const req = index.getAll(articleId);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

// ── Articles ──

export async function getAllArticles() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('articles', 'readonly');
    const store = tx.objectStore('articles');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function putArticle(article) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('articles', 'readwrite');
    const store = tx.objectStore('articles');
    const req = store.put(article);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function deleteArticle(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('articles', 'readwrite');
    const store = tx.objectStore('articles');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function importArticles(articles) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('articles', 'readwrite');
    const store = tx.objectStore('articles');
    for (const a of articles) store.put(a);
    tx.oncomplete = () => { resolve(); db.close(); };
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearArticles() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('articles', 'readwrite');
    const store = tx.objectStore('articles');
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}
