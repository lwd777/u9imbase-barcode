const path = require('path');
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const del = require('del');
const stylish = require('jshint-stylish');
const runSequence = require('run-sequence');

const $ = gulpLoadPlugins({
    rename: {
        'gulp-angular-filesort': 'fileSort'
    }
});

const config = {
    src: 'src',
    styles: 'css',
    fonts: 'fonts',
    images: 'img',
    scripts: 'js',
    dist: 'dist',
    module: 'u9imbase-barcode'
};

const banner =
'/*! \n\
 * \n\
 * Copyright 2017 u9mobile. \n\
 * \n\
 * u9imbase-barcode, v1.0.0 \n\
 * 智能工厂移动应用-Base_Barcode库 \n\
 * \n\
 * By @lwd \n\
 * \n\
 * Licensed under the MIT license. Please see LICENSE for more information. \n\
 * \n\
 */\n\n';

gulp.task('clean', del.bind(null, [config.dist]));

gulp.task('lint', () => {
  return gulp.src(path.join(config.src, config.scripts + '/**/*.js'))
    .pipe($.jshint())
    .pipe($.jshint.reporter(stylish));
});

gulp.task('styles', () => {
    return gulp.src(path.join(config.src, config.styles + '/**/*.css'))
        .pipe($.concat(config.module + '.css'))
        .pipe($.header(banner))
        .pipe(gulp.dest(path.join(config.dist, config.styles)));
});

gulp.task('cssnano', () => {
    return gulp.src(path.join(config.dist, config.styles + '/' + config.module + '.css'))
        .pipe($.rename(config.module + '.min.css'))
        // .pipe($.cssnano({ safe: true, autoprefixer: false }))
        .pipe(gulp.dest(path.join(config.dist, config.styles)));
});

gulp.task('images', () => {
    return gulp.src(path.join(config.src, config.images + '/**/*'))
        // .pipe($.cache($.imagemin()))
        .pipe(gulp.dest(path.join(config.dist, config.images)));
});

gulp.task('fonts', () => {
    return gulp.src(path.join(config.src, config.fonts + '/**/*'))
        // .pipe($.cache($.imagemin()))
        .pipe(gulp.dest(path.join(config.dist, config.fonts)));
});

gulp.task('scripts', () => {
    return gulp.src(path.join(config.src, config.scripts + '/**/*.js'))
        .pipe($.fileSort())
        .pipe($.concat(config.module + '.js'))
        .pipe($.header(banner))
        .pipe(gulp.dest(config.dist));
});

gulp.task('uglify', () => {
    return gulp.src(path.join(config.dist, config.module + '.js'))
        .pipe($.rename(config.module + '.min.js'))
        .pipe($.uglify())
        .pipe($.header(banner))
        .pipe(gulp.dest(config.dist));
});

gulp.task('build', () => {
    return new Promise(resolve => {
        runSequence('lint', ['styles', 'scripts', 'fonts', 'images'], ['cssnano', 'uglify'], resolve);
    });
});

gulp.task('gzip', () => {
    return gulp.src(path.join(config.dist, '/**/*')).pipe($.size({ title: 'build', gzip: true }));
});

gulp.task('dist', () => {
    return new Promise(resolve => {
        runSequence('clean', 'build', 'gzip', resolve);
    });
});
