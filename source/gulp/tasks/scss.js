"use strict";

var conf = require("../config.js");
var gulp = require("gulp");
var $ = require("gulp-load-plugins")();
var browserSync = require("browser-sync");

gulp.task("scss", function () {
    return gulp.src(conf.scss.src)
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            includePaths: [conf.nodeModules + "/foundation-sites/scss"]
        }).on("error", $.sass.logError))
        .pipe($.if("*.css", $.autoprefixer({
            browsers: ["last 2 versions", "ie >= 9", "and_chr >= 2.3"]
        })))
        .pipe($.if("*.css", $.mergeMediaQueries()))
        .pipe($.if("*.css", $.csscomb()))
        .pipe(gulp.dest(conf.scss.dest))
        .pipe($.if("*.css", $.rename({suffix: ".min"})))
        .pipe($.if("*.css", $.csso()))
        .pipe($.sourcemaps.write("maps"))
        .pipe(gulp.dest(conf.scss.dest))
        .pipe(browserSync.reload({
            stream: true
        }));
});
