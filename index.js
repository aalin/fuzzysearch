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
function findMatches(search, word, charIndexes, indexes, list) {
  indexes = indexes || [];
  list = list || [];

  const prevIndex = indexes.slice(-1)[0] || -1;
  const ch = search[indexes.length];

  if (!ch) {
    return list.concat([indexes]);
  }

  return charIndexes[ch].reduce((l, idx) => {
    if (idx <= prevIndex) {
      return l;
    }

    return findMatches(search, word, charIndexes, indexes.concat(idx), l);
  }, list);
}

const WORD_START_CHARS = [' ', '/', '-', '_', '.'];

export
function matchValue(string, index, ch) {
  let weight = 1.0;

  if (index === 0 || WORD_START_CHARS.indexOf(string[index - 1]) !== -1) {
    weight = 2.0;
  }

  if (string[index] === ch) {
    return weight * 2.0;
  }

  return weight;
}

export
function calculateScore(search, word, indexes) {
  let score = 0.0;
  let prevIndex = 0;
  let consecutiveCount = 1;

  indexes.forEach((index, i) => {
    score += matchValue(word, index, search[i]);

    if (prevIndex + 1 === index) {
      consecutiveCount++;
    }

    prevIndex = index;
  });

  return score * consecutiveCount;
}

export
function fuzzymatch(search, normalizedSearch, word) {
  if (search.length > word.length) { return; }

  const normalizedWord = word.toLowerCase();
  const charIndexes = getCharIndexes(normalizedSearch, normalizedWord);

  if (!charIndexes) { return; }

  return findMatches(normalizedSearch, normalizedWord, charIndexes)
    .map((indexes) => {
      return {
        word,
        indexes,
        score: calculateScore(search, word, indexes)
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
    .reduce((arr, word) => {
      const match = fuzzymatch(search, normalizedSearch, word);
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

export default
function fuzzysearch(search, words) {
  const normalizedSearch = search.toLowerCase();

  return asyncReduce(words, (next, arr, word) => {
    const match = fuzzymatch(search, normalizedSearch, word);
    next(match ? arr.concat(match) : arr);
  }, []).then(sortMatches);
}
