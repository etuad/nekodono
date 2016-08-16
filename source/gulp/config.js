"use strict";

var path = require('path');
var root = __dirname;
var gulpTasks = root + "/tasks";
var theme = path.resolve(root + "/../../");
var themeName = theme.replace(/((.*?)\/)*/, "");
var wpPath = root.replace("/wp-content/themes/" + themeName + "/source/gulp", "");
var wpURI = "http://nekodono.com";
var wpThemeUri = wpURI + "/wp-content/themes/" + themeName;
var wpSSL = false;
var src = theme + "/source";
var dest = theme + "/assets";
var bowerComponents = theme + "/bower_components";
var nodeModules = theme + "/node_modules";

module.exports = {
    root           : root,
    gulpTasks      : gulpTasks,
    wpPath         : wpPath,
    wpURI          : wpURI,
    wpThemeUri     : wpThemeUri,
    wpSSL          : wpSSL,
    theme          : theme,
    src            : src,
    dest           : dest,
    bowerComponents: bowerComponents,
    nodeModules    : nodeModules,
    html           : [
        theme + "/**/*.html",
        theme + "/**/*.php"
    ],
    img            : {
        src : src + "/img/**/*.+(jpg|jpeg|png|gif|svg)",
        dest: dest + "/img"
    },
    scss           : {
        src : [
            src + "/scss/**/*.scss"
        ],
        dest: dest + "/css"
    },
    js             : {
        map   : src + "/js/**/*.map",
        src   : [
            src + "/js/apps.js"
        ],
        minify: [
            dest + "/js/**/*.js",
            "!" + dest + "/js/**/*.min.js"
        ],
        dest  : dest + "/js"
    },
    del            : [
        dest + "/img/**/*.+(jpg|jpeg|png|gif|svg)",
        dest + "/css/**/*.+(css|map)",
        dest + "/js/**/*.+(js|map)",
        "!" + dest + "/css/vendor/**/*.css",
        "!" + dest + "/js/customizer.js"
    ]
};
