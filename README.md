# @aalin/fuzzysearch

After looking for a good fuzzy searcher, and I couldn't find one, I decided to write my own.

Install:

    npm install --save @aalin/fuzzysearch

Usage:

    import fuzzysearch from '@aalin/fuzzysearch';

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

    fuzzysearch('foo', words).then((results) => {
      /* results is now:
        [
          { word: 'foo Foo bar', indexes: [ 4, 5, 6 ], score: 24 },
          { word: 'bfooFoo bar', indexes: [ 1, 2, 3 ], score: 20 },
          { word: 'bfoo foo bar', indexes: [ 1, 2, 3 ], score: 20 },
          { word: 'foo foo bar', indexes: [ 0, 1, 2 ], score: 18 },
          { word: 'xfxoxo', indexes: [ 1, 3, 5 ], score: 10 },
          { word: 'xFxOxO', indexes: [ 1, 3, 5 ], score: 8 },
          { word: 'xfxOxO', indexes: [ 1, 3, 5 ], score: 6 }
        ]
      */
    });

Matching is case insensitive but exact casing is ranked higher.
Consecutive matches are ranked higher.
Characters in beginning of words are ranked higher.
