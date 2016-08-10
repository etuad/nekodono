"use strict";

var conf = require("../config.js");
var gulp = require("gulp");
var $ = require("gulp-load-plugins")();
var browserSync = require("browser-sync");

gulp.task("js", function () {
    return gulp.src(conf.js.src)
        .pipe($.sourcemaps.init())
        .pipe($.babel({
            presets: ["es2015"]
        }))
        .pipe($.concat("apps.js"))
        .pipe($.crLfReplace({changeCode: "LF"}))
        .pipe(gulp.dest(conf.js.dest))
        .pipe($.rename({suffix: ".min"}))
        //.pipe($.uglify())
        .pipe($.uglify({preserveComments: "some"}))
        .pipe($.sourcemaps.write("maps"))
        .pipe(gulp.dest(conf.js.dest))
        .pipe(browserSync.reload({
            stream: true
        }));
});
