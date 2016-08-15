"use strict";

var conf = require("../config.js");
var gulp = require("gulp");
var $ = require("gulp-load-plugins")();
var browserSync = require("browser-sync").create();

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
        .pipe($.sourcemaps.write({
            sourceRoot: conf.wpThemeUri + "/",
            mapFile: function(mapFilePath) {
                return mapFile.replace('.css.map', '.map');
            }
        }))
        .pipe(gulp.dest(conf.scss.dest))
        .pipe($.if("*.css", $.rename({suffix: ".min"})))
        .pipe($.if("*.css", $.csso()))
        .pipe($.sourcemaps.write({
            sourceRoot: conf.wpThemeUri + "/",
            mapFile: function(mapFilePath) {
                return mapFile.replace('.css.map', '.map');
            }
        }))
        .pipe(gulp.dest(conf.scss.dest))
        .pipe(browserSync.stream({match: '**/*.css'}));
});
