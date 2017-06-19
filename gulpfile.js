'use srtict';

const pjson = require('./package.json');
const dirs = pjson.config.directories;

// devDependencies
const gulp            = require('gulp');
const scss            = require('gulp-scss');
const debug           = require('gulp-debug');
const sourcemaps      = require('gulp-sourcemaps');
const cleanss         = require('gulp-cleancss');
const postcss         = require('gulp-postcss');
const autoprefixer    = require('autoprefixer');
const mqpacker        = require('css-mqpacker');
const rename          = require('gulp-rename');
const gulpIf          = require('gulp-if');
const del             = require('del');
const imagemin        = require('gulp-imagemin');
const pngquant        = require('imagemin-pngquant');
const svgstore        = require('gulp-svgstore');
const svgmin          = require('gulp-svgmin');
const path            = require('path');
const cheerio         = require('gulp-cheerio');
const fileinclude     = require('gulp-file-include');
const newer           = require('gulp-newer');
const notify          = require('gulp-notify');
const uglify          = require('gulp-uglify');
const concat          = require('gulp-concat');
const browserSync     = require('browser-sync').create();
const replace         = require('gulp-replace');
const size            = require('gulp-size')
const csslint         = require('gulp-csslint');
const jslint          = require('gulp-jslint');


// Compilation SCSS
gulp.task('scss', function() {
  console.log('-------------- Compilation SCSS');
  return gulp.src(dirs.source + '/scss/style.scss')
    .pipe(sourcemaps.init())
    .pipe(debug({title: "SCSS:"}))
    .pipe(scss())
    .on('error', notify.onError(function(err){
      return {
        title: 'Styles compilation error',
        message: err.message
      }
    }))
    .pipe(postcss([
        autoprefixer({browsers: ['last 2 version']}),
        mqpacker({
          sort: true
        }),
    ]))
    .pipe(cleanss())
    .pipe(rename('style.min.css'))
    .pipe(sourcemaps.write('/'))
    .pipe(gulp.dest(dirs.build + '/css'))
    .pipe(browserSync.stream());
});


// Copying and optimization images
gulp.task('img', function () {
  console.log('---------- Copying and optimization images');
  return gulp.src(dirs.source + '/img/**/*.{jpg,jpeg,gif,png,svg}', {since: gulp.lastRun('img')})
    .pipe(newer(dirs.build + '/img'))  // only those source files that are newer than corresponding destination files
    .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
    }))
    .pipe(gulp.dest(dirs.build + '/img'));
});


// Optimization images // folder=src/img/icons/ npm start img:opt
const folder = process.env.folder;
gulp.task('img:opt', function (callback) {
  console.log('---------- Optimization images');
  return gulp.src(folder + '/*.{jpg,jpeg,gif,png,svg}')
    .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
    }))
    .pipe(gulp.dest(folder));
});


// Copying fonts
gulp.task('fonts:copy', function () {
  console.log('---------- Copying fonts');
  return gulp.src(dirs.source + '/fonts/*.{ttf,woff,woff2,eot,svg}', {since: gulp.lastRun('fonts:copy')})
    .pipe(newer(dirs.build + '/fonts'))  // only those source files that are newer than corresponding destination files
    .pipe(size({
      title: 'Size',
      showFiles: true,
      showTotal: false,
    }))
    .pipe(gulp.dest(dirs.build + '/fonts'));
});

// Copying video
gulp.task('video', function () {
  console.log('---------- Copying video');
  return gulp.src(dirs.source + '/video/*.{mp4,ogv,webm}', {since: gulp.lastRun('video')})
    .pipe(newer(dirs.build + '/video'))  // only those source files that are newer than corresponding destination files
    .pipe(gulp.dest(dirs.build + '/video'));
});

// Building SVG-sprite for sprite-svg--localstorage
gulp.task('svgstore', function (callback) {
  let spritePath = dirs.source + '/blocks/sprite-svg--localstorage/svg/';
  console.log('---------- Build SVG-sprite');
  return gulp.src(spritePath + '*.svg')
    .pipe(svgmin(function (file) {
      return {
        plugins: [{
          cleanupIDs: {
            minify: true
          }
        }]
      }
    }))
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(cheerio(function ($) {
      $('svg').attr('style',  'display:none');
    }))
    .pipe(rename('sprite-svg--ls.svg'))
    .pipe(size({
      title: 'Size',
      showFiles: true,
      showTotal: false,
    }))
    .pipe(gulp.dest(dirs.source + '/blocks/sprite-svg--localstorage/img'));
});



// Compilation HTML
gulp.task('html', function() {
  console.log('---------- Compilation HTML');
  return gulp.src(dirs.source + '/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
      indent: true,
    }))
    .pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))
    .pipe(gulp.dest(dirs.build));
});


// Javascript
gulp.task('js', function (callback) {
  console.log('---------- Building JS');
  return gulp.src(dirs.source + '/js/*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('script.min.js'))
    .pipe(uglify())
    .on('error', notify.onError(function(err){
      return {
        title: 'Javascript uglify error',
        message: err.message
      }
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(size({
      title: 'Size',
      showFiles: true,
      showTotal: false,
    }))
    .pipe(gulp.dest(dirs.build + '/js'));
});


// Cleaning build folder
gulp.task('clean', function () {
  console.log('---------- Cleaning build folder');
  return del([
    dirs.build + '/**/*',
    '!' + dirs.build + '/readme.md'
  ]);
});



// Build
gulp.task('build', gulp.series(
  'clean',
  'svgstore',
  gulp.parallel('scss', 'img', 'js', 'fonts:copy', 'video'),
  'html'
));


// Localserver, watch
gulp.task('serve', gulp.series('build', function() {
  browserSync.init({
    server: dirs.build,
    port: 3000,
    startPath: 'index.html'
  });
  gulp.watch([
    dirs.source + '/*.html',
    dirs.source + '/_include/*.html',
    dirs.source + '/blocks/**/*.html',
  ], gulp.series('html', reloader));
  gulp.watch(dirs.source + '/scss/**/*.scss', gulp.series('scss'));
  gulp.watch(dirs.source + '/img', gulp.series('img', reloader));
  gulp.watch(dirs.source + '/video', gulp.series('video', reloader));
  gulp.watch(dirs.source + '/js', gulp.series('js', reloader));
  gulp.watch(dirs.source + '/fonts/*.{ttf,woff,woff2,eot,svg}', gulp.series('fonts:copy', reloader));
}));


// Default task
gulp.task('default',
  gulp.series('serve')
);

// Reload in browser
function reloader(done) {
  browserSync.reload();
  done();
}