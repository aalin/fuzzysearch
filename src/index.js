export
function findCharIndexes(ch, str) {
  return Array.from(str, (_, i) => i).filter((i) => str[i] == ch);
}

export
function getCharIndexes(chars, str) {
  return Array.from(chars).reduce((obj, ch) => {
    if (!obj || obj[ch]) { return obj; }

    const indexes = findCharIndexes(ch, str);

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
function getRanges(array) {
  const ranges = [];

  for (var i = 0; i < array.length; i++) {
    const start = array[i];
    let end = start;

    while (array[i + 1] - array[i] == 1) {
      end = array[i + 1];
      i++;
    }

    ranges.push([start, end]);
  }

  return ranges;
}

export
function calculateScore(search, entry, indexes) {
  let score = 0.0;
  let prevIndex = -1;
  let consecutiveCount = 1;
  let isInWord = false;

  indexes.forEach((index, i) => {
    const ch =  search[i];
    const isConsecutive = index !== 0 && prevIndex + 1 === index;
    const isWordStart = entry.wordStarts[index];

    let value = 1;

    // Consecutive
    if (isInWord && isConsecutive) { value += 2; }
    // Equal case
    if (entry.str[index] === ch) { value += 3; }
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
class Entry {
  constructor(str) {
    this.length = str.length;
    this.str = str;
    this.normal = str.toLowerCase();

    this.wordStarts = Array.from(str, (_, index) => {
      if (index === 0 || WORD_START_CHARS.indexOf(str[index - 1]) !== -1) {
        return true;
      }

      return false;
    });
  }
}

export
function fuzzymatch(search, normalizedSearch, entry, index) {
  if (search.length > entry.length) { return; }

  const charIndexes = getCharIndexes(normalizedSearch, entry.normal);

  if (!charIndexes) { return; }

  return findMatches(normalizedSearch, charIndexes)
    .map((indexes) => {
      return {
        string: entry.str,
        ranges: getRanges(indexes),
        indexes: indexes,
        score: calculateScore(search, entry, indexes),
        index
      };
    })
    .sort((a, b) => b.score - a.score)[0];
}

function sortMatches(matches) {
  return matches.sort((a, b) => {
    if (b.score === a.score) {
      return a.string - b.string;
    }

    return b.score - a.score;
  });
}

export
function fuzzysearchSync(search, entries) {
  const normalizedSearch = search.toLowerCase();

  const matches = entries
    .reduce((arr, entry, i) => {
      const match = fuzzymatch(search, normalizedSearch, entry, i);
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
function fuzzysearch(search, entries) {
  const normalizedSearch = search.toLowerCase();

  return asyncReduce(entries, (next, arr, entry, index) => {
    const match = fuzzymatch(search, normalizedSearch, entry, index);
    next(match ? arr.concat(match) : arr);
  }, []).then(sortMatches);
}

export default
class Fuzzysearch {
  constructor(entries) {
    this._entries = entries.map((entry) => new Entry(entry));
  }

  search(str) {
    return fuzzysearch(str, this._entries);
  }

  searchSync(str) {
    return fuzzysearchSync(str, this._entries);
  }
}
