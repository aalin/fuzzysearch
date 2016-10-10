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
  })

  t.end();
});

test('findMatches', (t) => {
  const matches = fuzzylib.findMatches('foo', 'foxfoo', {
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
  const word = new fuzzylib.Word('foxfoo');
  t.equal(fuzzylib.calculateScore('foo', word, [0, 1, 4]), 16, 'calculates a score');
  t.equal(fuzzylib.calculateScore('foo', word, [3, 4, 5]), 18, 'returns a higher score for consecutive characters');
  t.end();
});

test('Word', (t) => {
  const word = new fuzzylib.Word('foo bar');

  t.test('beginning of word', (t) => {
    t.equal(word.matchValue(4, 'b'), 4, 'returns a higher score for the exact same match');
    t.equal(word.matchValue(4, 'B'), 2, 'returns a lower score when there is no exact match');
    t.end();
  });

  t.test('middle of word', (t) => {
    t.equal(word.matchValue(1, 'o'), 2, 'returns a higher score for the exact same match');
    t.equal(word.matchValue(1, 'O'), 1, 'returns a lower score when there is no exact match');
    t.end();
  });

  t.end();
});

test('fuzzymatch', (t) => {
  const word = new fuzzylib.Word('foxfoo');
  t.deepEqual(fuzzylib.fuzzymatch('foo', 'foo', word).indexes, [3, 4, 5]);
  t.end();
});

test('fuzzysearchSync', (t) => {
  const words = [
    'foo Foo bar',
    'foo foo bar',
    'bfooFoo bar',
    'bfoo foo bar',
    'xFxOxO',
    'xfxOxO',
    'xfxoxo',
    'fasdasdo'
  ];

  const result = fuzzylib.fuzzysearchSync('Foo', words);

  t.deepEqual(result.map((res) => res.word), [
    'foo Foo bar',
    'bfooFoo bar',
    'bfoo foo bar',
    'foo foo bar',
    'xfxoxo',
    'xFxOxO',
    'xfxOxO',
  ]);

  t.end();
});

test('fuzzysearch', (t) => {
  t.plan(1);

  fuzzylib.default('foo', ['foobar', 'foxoobar']).then((results) => {
    t.deepEqual(results.map((match) => match.word), ['foobar', 'foxoobar']);
  });
});
