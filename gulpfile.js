/**
 * Gulp for WordPress theme
 *
 * @package   Nekodono.
 * @author    KUCKLU & VisuALive.
 * @copyright Copyright (c) KUCKLU and VisuAlive.
 * @link      https://www.visualive.jp/
 * @license   GNU General Public License version 3
 */
"use strict";

var conf = require("./source/gulp/config.js");
var requireDir = require("require-dir");
var tasks = requireDir(conf.gulpTasks);
