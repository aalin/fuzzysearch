export
function findCharIndexes(ch, word) {
  return Array.from(word, (_, i) => i).filter((i) => word[i] == ch);
}

export
function getCharIndexes(search, word) {
  return Array.from(search).reduce((obj, ch) => {
    if (!obj || obj[ch]) { return obj; }

    const indexes = findCharIndexes(ch, word);

    if (!indexes.length) { return; }

    return Object.assign(obj, {
      [ch]: indexes
    });
  }, {});
}

export
function findMatches(search, charIndexes, indexes = [], list = []) {
  const prevIndex = indexes.slice(-1)[0] || -1;
  const ch = search[indexes.length];

  if (!ch) {
    return list.concat([indexes]);
  }

  return charIndexes[ch].reduce((l, idx) => {
    if (idx <= prevIndex) {
      return l;
    }

    return findMatches(search, charIndexes, indexes.concat(idx), l);
  }, list);
}

export
function calculateScore(search, word, indexes) {
  let score = 0.0;
  let prevIndex = -1;
  let consecutiveCount = 1;
  let isInWord = false;

  indexes.forEach((index, i) => {
    const ch =  search[i];
    const isConsecutive = index !== 0 && prevIndex + 1 === index;
    const isWordStart = word.wordStarts[index];

    let value = 1;

    // Consecutive
    if (isInWord && isConsecutive) { value += 2; }
    // Equal case
    if (word.orig[index] === ch) { value += 3; }
    if (isWordStart) { value += 2; }
    if (index === 0) { value += 2; }

    if (isConsecutive) { consecutiveCount++; }

    prevIndex = index;
    isInWord = isWordStart || isConsecutive;
    score += value;
  });

  return score * consecutiveCount;
}

const WORD_START_CHARS = [' ', '/', '-', '_', '.'];

export
class Word {
  constructor(orig) {
    this.length = orig.length;
    this.orig = orig;
    this.normal = orig.toLowerCase();

    this.wordStarts = Array.from(orig, (_, index) => {
      if (index === 0 || WORD_START_CHARS.indexOf(orig[index - 1]) !== -1) {
        return true;
      }

      return false;
    });
  }
}

export
function fuzzymatch(search, normalizedSearch, word, index) {
  if (search.length > word.length) { return; }

  const charIndexes = getCharIndexes(normalizedSearch, word.normal);

  if (!charIndexes) { return; }

  return findMatches(normalizedSearch, charIndexes)
    .map((indexes) => {
      return {
        word: word.orig,
        indexes,
        score: calculateScore(search, word, indexes),
        index
      };
    })
    .sort((a, b) => b.score - a.score)[0];
}

function sortMatches(matches) {
  return matches.sort((a, b) => {
    if (b.score === a.score) {
      return a.word - b.word;
    }

    return b.score - a.score;
  });
}

export
function fuzzysearchSync(search, words) {
  const normalizedSearch = search.toLowerCase();

  const matches = words
    .reduce((arr, word, i) => {
      const match = fuzzymatch(search, normalizedSearch, word, i);
      return match ? arr.concat(match) : arr;
    }, []);

  return sortMatches(matches);
}

export
function asyncReduce([first, ...rest], fn, acc, index = 0) {
  return new Promise((resolve) => {
    fn((acc) => {
      if (rest.length) {
        resolve(asyncReduce(rest, fn, acc, index + 1));
      } else {
        resolve(acc);
      }
    }, acc, first, index);
  });
}

export
function fuzzysearch(search, words) {
  const normalizedSearch = search.toLowerCase();

  return asyncReduce(words, (next, arr, word, index) => {
    const match = fuzzymatch(search, normalizedSearch, word, index);
    next(match ? arr.concat(match) : arr);
  }, []).then(sortMatches);
}

export default
class Fuzzysearch {
  constructor(words) {
    this._words = words.map((word) => new Word(word));
  }

  search(str) {
    return fuzzysearch(str, this._words);
  }

  searchSync(str) {
    return fuzzysearchSync(str, this._words);
  }
}
