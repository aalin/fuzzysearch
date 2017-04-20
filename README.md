# @aalin/fuzzysearch

Clever and fast async fuzzy searcher.

After looking for a good fuzzy matcher, and I couldn't find one, I decided to write my own.

Install:

    npm install --save @aalin/fuzzysearch

Usage:

```javascript
import Fuzzysearch from '@aalin/fuzzysearch';

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

fuzzysearch.search('Foo')
  .then((results) => {
    console.log(results);
  });

// Outputs:

[
  { string: 'foo Foo bar',  indexes: [ 4, 5, 6 ], score: 54, index: 1 },
  { string: 'foo foo bar',  indexes: [ 0, 1, 2 ], score: 51, index: 5 },
  { string: 'bfoo foo bar', indexes: [ 5, 6, 7 ], score: 45, index: 3 },
  { string: 'bfooFoo bar',  indexes: [ 4, 5, 6 ], score: 42, index: 7 },
  { string: 'xfxoxo',       indexes: [ 1, 3, 5 ], score:  9, index: 0 },
  { string: 'xFxOxO',       indexes: [ 1, 3, 5 ], score:  6, index: 4 },
  { string: 'xfxOxO',       indexes: [ 1, 3, 5 ], score:  3, index: 6 }
]
```

Matching is case insensitive but exact casing is ranked higher.
Consecutive matches are ranked higher.
Characters in beginning of words are ranked higher.
