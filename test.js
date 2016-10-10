import test from 'tape';
import * as fuzzylib from './index';

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

test('matchValue', (t) => {
  t.test('beginning of word', (t) => {
    t.equal(fuzzylib.matchValue('foo bar', 4, 'b'), 4, 'returns a higher score for the exact same match');
    t.equal(fuzzylib.matchValue('foo bar', 4, 'B'), 2, 'returns a lower score when there is no exact match');
    t.end();
  });

  t.test('middle of word', (t) => {
    t.equal(fuzzylib.matchValue('foo bar', 1, 'o'), 2, 'returns a higher score for the exact same match');
    t.equal(fuzzylib.matchValue('foo bar', 1, 'O'), 1, 'returns a lower score when there is no exact match');
    t.end();
  });

  t.end();
});

test('calculateScore', (t) => {
  t.equal(fuzzylib.calculateScore('foo', 'foxfoo', [0, 1, 4]), 16, 'calculates a score');
  t.equal(fuzzylib.calculateScore('foo', 'foxfoo', [3, 4, 5]), 18, 'returns a higher score for consecutive characters');
  t.end();
});

test('fuzzymatch', (t) => {
  t.deepEqual(fuzzylib.fuzzymatch('foo', 'foo', 'foxfoo').indexes, [3, 4, 5]);
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
