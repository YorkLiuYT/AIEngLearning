/**
 * Spaced Repetition System (SM-2 variant)
 *
 * On "correct": level + 1, interval doubles (1→2→4→8→16→32→64 max)
 * On "forget":   level = max(0, level - 2), interval = max(1, floor(interval / 2))
 * Smooth degradation — well-studied words don't reset to zero.
 */

export function getDefaultSRS() {
  const now = Date.now();
  return {
    level: 0,
    interval: 1,
    next_review: now,
    review_count: 0,
  };
}

export function handleCorrect(srs) {
  const newLevel = Math.min(srs.level + 1, 6);
  const intervals = [1, 2, 4, 8, 16, 32, 64];
  const newInterval = intervals[newLevel] || 64;
  const now = Date.now();
  return {
    level: newLevel,
    interval: newInterval,
    next_review: now + newInterval * 86400000,
    review_count: srs.review_count + 1,
  };
}

export function handleForget(srs) {
  const newLevel = Math.max(0, srs.level - 2);
  const intervals = [1, 2, 4, 8, 16, 32, 64];
  const newInterval = Math.max(1, Math.floor(srs.interval / 2));
  const now = Date.now();
  return {
    level: newLevel,
    interval: newInterval,
    next_review: now + newInterval * 86400000,
    review_count: srs.review_count + 1,
  };
}

/**
 * How many words are due for review right now?
 */
export function isDue(srs) {
  return Date.now() >= srs.next_review;
}

export function getDueCount(words) {
  return words.filter(w => isDue(w.srs)).length;
}

export function getProgress(words) {
  const total = words.length;
  const learned = words.filter(w => w.srs.level >= 3).length;
  const due = getDueCount(words);
  return { total, learned, due };
}
