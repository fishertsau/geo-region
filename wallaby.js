module.exports = function (wallaby) {
  process.env.NODE_ENV = 'test';

  return {
    files: [
      'package.json',
      'app/**/*.js',
      { pattern: 'tests/**/*.test.js', ignore: true },
      { pattern: 'tests/**/*.test.mjs', ignore: true },
    ],
    tests: [
      'tests/**/*.test.js',
      'tests/**/*.test.mjs',
    ],
    env: {
      type: 'node',
    },
    testFramework: 'mocha',
    // 測試前,需要將source code用babel轉譯為common js
    compilers: {
      '**/*.*js': wallaby.compilers.babel({
        babelrc: true,
      }),
    },
  };
}
