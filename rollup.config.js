import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import eslint from '@rollup/plugin-eslint';
import scss from 'rollup-plugin-scss';
import postcss from 'postcss';
import url from 'postcss-url';
import autoprefixer from 'autoprefixer';

export default {
  input: 'Resources/Private/JavaScript/find.js',
  output: {
    file: 'Resources/Public/JavaScript/find.js',
    format: 'iife'
  },
  plugins: [
    nodeResolve({browser: true}),
    commonjs(),
    eslint({cache: false, fix: true, exclude: ['node_modules/**', 'Resources/Private/Scss/**']}),
    babel({babelHelpers: 'bundled'}),
    scss({
      output: 'Resources/Public/CSS/find.css',
      processor: () => postcss([
        autoprefixer({overrideBrowserslist: 'last 2 versions'}),
        url({
          basePath: 'Resources/Private/Images/',
          url: 'inline',
          maxSize: 100,
          fallback: 'copy'
        }),
        ]),
    }),
  ],
};
