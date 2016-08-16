"use strict";

var conf = require("../config.js");
var gulp = require("gulp");
var $ = require("gulp-load-plugins")();
var browserSync = require("browser-sync");
var watching = false;

gulp.task("js", $.watchify(function (watchify) {
    var buffer = require("vinyl-buffer");
    var browserify = require("browserify");

    return gulp.src(conf.js.src)
        .pipe(watchify({
            watch: watching
        }))
        .pipe($.streamify($.babel({
            presets: ["es2015"]
        })))
        .pipe($.streamify($.sourcemaps.init()))
        .pipe($.streamify($.concat("apps.js")))
        .pipe($.streamify($.crLfReplace({changeCode: "LF"})))
        .pipe(gulp.dest(conf.js.dest))
        .pipe($.rename({suffix: ".min"}))
        .pipe($.streamify($.uglify({preserveComments: "some"})))
        .pipe($.streamify($.sourcemaps.write(".", {
            sourceRoot: "../../",
            mapFile: function(mapFilePath) {
                return mapFile.replace('.js.map', '.map');
            }
        })))
        .pipe(gulp.dest(conf.js.dest))
        .pipe(browserSync.reload({
            stream: true
        }));
}));

gulp.task("enableWatchMode", function () {
    watching = true
});
gulp.task("watchify", ["enableWatchMode", "js"]);