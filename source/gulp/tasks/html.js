'use strict';

var conf = require('../config.js');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');

gulp.task('html', function () {
    return gulp.src(conf.html.src)
        .pipe(browserSync.reload({
            stream: true
        }));
});
