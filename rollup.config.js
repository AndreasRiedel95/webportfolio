import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import sveltePreprocess from 'svelte-preprocess';
import alias from '@rollup/plugin-alias';
import babel from '@rollup/plugin-babel';

const production = !process.env.ROLLUP_WATCH;
console.log('Production', production);

const aliases = alias({
  resolve: ['.svelte', '.js'], //optional, by default this will just look for .js files or folders
  entries: [
    { find: 'components', replacement: 'src/components' },
    { find: 'util', replacement: 'src/util' },
    { find: 'pages', replacement: 'src/components/pages' },
    { find: 'pager', replacement: 'src/components/pager' },
  ],
});

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true,
      });

      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    },
  };
}

export default {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/build/bundle.js',
  },
  plugins: [
    svelte({
      // enable run-time checks when not in production
      dev: !production,
      // Add sass support
      preprocess: sveltePreprocess({
        sourceMap: !production,
        defaults: {
          style: 'scss',
        },
        postcss: {
          plugins: [autoprefixer(), production && cssnano()].filter((plugin) => plugin),
        },
      }),
      // we'll extract any component CSS out into
      // a separate file - better for performance
      css: (css) => {
        css.write('bundle.css');
      },
    }),
    aliases,
    production &&
      babel({
        extensions: ['.js', '.mjs', '.html', '.svelte'],
        include: ['src/**', 'node_modules/svelte/**'],
      }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload('public'),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};
