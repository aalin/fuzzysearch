# @aalin/fuzzysearch

After looking for a good fuzzy searcher, and I couldn't find one, I decided to write my own.

Install:

    npm install --save @aalin/fuzzysearch

Usage:

```javascript
import Fuzzysearch from '@aalin/fuzzysearch';

const fuzzysearch = new Fuzzysearch([
  'foo Foo bar',
  'foo foo bar',
  'bfooFoo bar',
  'bfoo foo bar',
  'xFxOxO',
  'xfxOxO',
  'xfxoxo',
  'fasdasdo'
]);

fuzzysearch.search('Foo')
  .then((results) => {
    console.log(results);
  });

// Outputs:

[
  { word: 'foo Foo bar', indexes: [ 4, 5, 6 ], score: 24 },
  { word: 'foo foo bar', indexes: [ 0, 1, 2 ], score: 18 },
  { word: 'bfooFoo bar', indexes: [ 4, 5, 6 ], score: 18 },
  { word: 'bfoo foo bar', indexes: [ 5, 6, 7 ], score: 18 },
  { word: 'xfxoxo', indexes: [ 1, 3, 5 ], score: 5 },
  { word: 'xFxOxO', indexes: [ 1, 3, 5 ], score: 4 },
  { word: 'xfxOxO', indexes: [ 1, 3, 5 ], score: 3 }
]
```

Matching is case insensitive but exact casing is ranked higher.
Consecutive matches are ranked higher.
Characters in beginning of words are ranked higher.
