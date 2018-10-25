var gulp = require('gulp');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var fileinclude = require('gulp-file-include');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var del = require('del');
var gulpSequence = require('gulp-sequence');
var prettify = require('gulp-html-prettify');
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

gulp.task('html', function () {
  return gulp.src('./source/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(prettify({
      indent_char: ' ',
      indent_size: 2
    }))
    .pipe(gulp.dest('./docs'));
});

gulp.task('fonts', function () {
  return gulp.src('./source/fonts/*')
    .pipe(gulp.dest('./docs/fonts'));
});

gulp.task('css', function () {
  return gulp.src('./source/less/style.less')
    .pipe(less())
    .pipe(sourcemaps.init())
    .pipe(autoprefixer({
      browsers: ['last 4 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('./docs/css'))
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./docs/css'));
});

gulp.task('js', function () {
  return gulp.src('./source/ts/*.ts')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(tsProject())
    .js
    .pipe(sourcemaps.init())
    .pipe(gulp.dest('./docs/js'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./docs/js'));
});

gulp.task('json', function () {
  return gulp.src('./events.json')
    .pipe(gulp.dest('./docs'));
});

gulp.task('images', function () {
  return gulp.src('./source/images/*')
    .pipe(imagemin([
      imagemin.svgo({
        plugins: [
          {removeViewBox: true},
          {cleanupIDs: false}
        ]
      })
    ]))
    .pipe(gulp.dest('./docs/images'));
});

gulp.task('watch', function () {
  gulp.watch('source/**/*.html', ['html']);
  gulp.watch('source/less/**/*.less', ['css']);
  gulp.watch('source/js/**/*.js', ['js']);
  gulp.watch('source/images/*', ['images']);
  gulp.watch('source/fonts/*', ['fonts']);
});

gulp.task('clean', function () {
  return del(['docs/**/*']);
});

gulp.task('default', gulpSequence('clean', ['html', 'css', 'js', 'json', 'images', 'fonts']));
