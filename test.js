import test from 'tape';
import * as fuzzylib from './src/index';

test('findCharIndexes', (t) => {
  t.deepEqual(fuzzylib.findCharIndexes('f', 'foxfoo'), [0, 3]);
  t.deepEqual(fuzzylib.findCharIndexes('x', 'foxfoo'), [2]);
  t.deepEqual(fuzzylib.findCharIndexes('o', 'foxfoo'), [1, 4, 5]);

  t.end();
})

test('getCharIndexes', (t) => {
  const charIndexes = fuzzylib.getCharIndexes('foo', 'foxfoo');

  t.deepEqual(charIndexes, {
    f: [0, 3],
    o: [1, 4, 5]
  }, 'returns an object with each character mapped to an array with their indexes')

  t.end();
});

test('findMatches', (t) => {
  const matches = fuzzylib.findMatches('foo', {
    f: [0, 3],
    o: [1, 4, 5]
  });

  t.deepEqual(matches, [
    [0, 1, 4],
    [0, 1, 5],
    [0, 4, 5],
    [3, 4, 5]
  ], 'returns the different combinations of matches');

  t.end();
});

test('calculateScore', (t) => {
  const word = new fuzzylib.Entry('foxfoo');
  t.ok(
    fuzzylib.calculateScore('foo', word, [3, 4, 5])
    >
    fuzzylib.calculateScore('foo', word, [0, 1, 4]),
    'calcaulates a higher score for consecutive characters'
  );
  t.end();
});

test('Entry', (t) => {
  const word = new fuzzylib.Entry('foo bar');

  t.test('.wordStarts', (t) => {
    t.deepEqual(
      word.wordStarts,
      [true, false, false, false, true, false, false],
      'is an array with booleans saying which character starts a word'
    );
    t.end();
  });

  t.end();
});

test('fuzzymatch', (t) => {
  const word = new fuzzylib.Entry('foxfoo');
  t.deepEqual(
    fuzzylib.fuzzymatch('foo', 'foo', word).indexes,
    [3, 4, 5],
    'finds the best match'
  );
  t.end();
});

test('Fuzzysearch', (t) => {
  const Fuzzysearch = fuzzylib.default;

  const fuzzysearch = new Fuzzysearch([
    'xfxoxo',
    'foo Foo bar',
    'fasdasdo',
    'bfoo foo bar',
    'xFxOxO',
    'foo foo bar',
    'xfxOxO',
    'bfooFoo bar',
  ]);

  const expected = [
    'foo Foo bar',
    'foo foo bar',
    'bfoo foo bar',
    'bfooFoo bar',
    'xfxoxo',
    'xFxOxO',
    'xfxOxO',
  ];

  t.test('search', (t) => {
    t.plan(1);

    fuzzysearch.search('Foo').then((results) => {
      t.deepEqual(results.map((match) => match.string), expected, 'returns a promise that resolves with the matches');
    });
  });

  t.test('searchSync', (t) => {
    const results = fuzzysearch.searchSync('Foo');
    t.deepEqual(results.map((match) => match.string), expected, 'returns the matches');
    t.end();
  });

  t.end();
});
