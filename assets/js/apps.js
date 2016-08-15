"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

(function e(t, n, r) {
	function s(o, u) {
		if (!n[o]) {
			if (!t[o]) {
				var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
			}var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
				var n = t[o][1][e];return s(n ? n : e);
			}, l, l.exports, e, t, n, r);
		}return n[o].exports;
	}var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
		s(r[o]);
	}return s;
})({ 1: [function (require, module, exports) {
		;(function () {
			'use strict';

			/**
    * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
    *
    * @codingstandard ftlabs-jsv2
    * @copyright The Financial Times Limited [All Rights Reserved]
    * @license MIT License (see LICENSE.txt)
    */

			/*jslint browser:true, node:true*/
			/*global define, Event, Node*/

			/**
    * Instantiate fast-clicking listeners on the specified layer.
    *
    * @constructor
    * @param {Element} layer The layer to listen on
    * @param {Object} [options={}] The options to override the defaults
    */

			function FastClick(layer, options) {
				var oldOnClick;

				options = options || {};

				/**
     * Whether a click is currently being tracked.
     *
     * @type boolean
     */
				this.trackingClick = false;

				/**
     * Timestamp for when click tracking started.
     *
     * @type number
     */
				this.trackingClickStart = 0;

				/**
     * The element being tracked for a click.
     *
     * @type EventTarget
     */
				this.targetElement = null;

				/**
     * X-coordinate of touch start event.
     *
     * @type number
     */
				this.touchStartX = 0;

				/**
     * Y-coordinate of touch start event.
     *
     * @type number
     */
				this.touchStartY = 0;

				/**
     * ID of the last touch, retrieved from Touch.identifier.
     *
     * @type number
     */
				this.lastTouchIdentifier = 0;

				/**
     * Touchmove boundary, beyond which a click will be cancelled.
     *
     * @type number
     */
				this.touchBoundary = options.touchBoundary || 10;

				/**
     * The FastClick layer.
     *
     * @type Element
     */
				this.layer = layer;

				/**
     * The minimum time between tap(touchstart and touchend) events
     *
     * @type number
     */
				this.tapDelay = options.tapDelay || 200;

				/**
     * The maximum time for a tap
     *
     * @type number
     */
				this.tapTimeout = options.tapTimeout || 700;

				if (FastClick.notNeeded(layer)) {
					return;
				}

				// Some old versions of Android don't have Function.prototype.bind
				function bind(method, context) {
					return function () {
						return method.apply(context, arguments);
					};
				}

				var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
				var context = this;
				for (var i = 0, l = methods.length; i < l; i++) {
					context[methods[i]] = bind(context[methods[i]], context);
				}

				// Set up event handlers as required
				if (deviceIsAndroid) {
					layer.addEventListener('mouseover', this.onMouse, true);
					layer.addEventListener('mousedown', this.onMouse, true);
					layer.addEventListener('mouseup', this.onMouse, true);
				}

				layer.addEventListener('click', this.onClick, true);
				layer.addEventListener('touchstart', this.onTouchStart, false);
				layer.addEventListener('touchmove', this.onTouchMove, false);
				layer.addEventListener('touchend', this.onTouchEnd, false);
				layer.addEventListener('touchcancel', this.onTouchCancel, false);

				// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
				// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
				// layer when they are cancelled.
				if (!Event.prototype.stopImmediatePropagation) {
					layer.removeEventListener = function (type, callback, capture) {
						var rmv = Node.prototype.removeEventListener;
						if (type === 'click') {
							rmv.call(layer, type, callback.hijacked || callback, capture);
						} else {
							rmv.call(layer, type, callback, capture);
						}
					};

					layer.addEventListener = function (type, callback, capture) {
						var adv = Node.prototype.addEventListener;
						if (type === 'click') {
							adv.call(layer, type, callback.hijacked || (callback.hijacked = function (event) {
								if (!event.propagationStopped) {
									callback(event);
								}
							}), capture);
						} else {
							adv.call(layer, type, callback, capture);
						}
					};
				}

				// If a handler is already declared in the element's onclick attribute, it will be fired before
				// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
				// adding it as listener.
				if (typeof layer.onclick === 'function') {

					// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
					// - the old one won't work if passed to addEventListener directly.
					oldOnClick = layer.onclick;
					layer.addEventListener('click', function (event) {
						oldOnClick(event);
					}, false);
					layer.onclick = null;
				}
			}

			/**
   * Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
   *
   * @type boolean
   */
			var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

			/**
    * Android requires exceptions.
    *
    * @type boolean
    */
			var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;

			/**
    * iOS requires exceptions.
    *
    * @type boolean
    */
			var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;

			/**
    * iOS 4 requires an exception for select elements.
    *
    * @type boolean
    */
			var deviceIsIOS4 = deviceIsIOS && /OS 4_\d(_\d)?/.test(navigator.userAgent);

			/**
    * iOS 6.0-7.* requires the target element to be manually derived
    *
    * @type boolean
    */
			var deviceIsIOSWithBadTarget = deviceIsIOS && /OS [6-7]_\d/.test(navigator.userAgent);

			/**
    * BlackBerry requires exceptions.
    *
    * @type boolean
    */
			var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

			/**
    * Determine whether a given element requires a native click.
    *
    * @param {EventTarget|Element} target Target DOM element
    * @returns {boolean} Returns true if the element needs a native click
    */
			FastClick.prototype.needsClick = function (target) {
				switch (target.nodeName.toLowerCase()) {

					// Don't send a synthetic click to disabled inputs (issue #62)
					case 'button':
					case 'select':
					case 'textarea':
						if (target.disabled) {
							return true;
						}

						break;
					case 'input':

						// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
						if (deviceIsIOS && target.type === 'file' || target.disabled) {
							return true;
						}

						break;
					case 'label':
					case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
					case 'video':
						return true;
				}

				return (/\bneedsclick\b/.test(target.className)
				);
			};

			/**
    * Determine whether a given element requires a call to focus to simulate click into element.
    *
    * @param {EventTarget|Element} target Target DOM element
    * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
    */
			FastClick.prototype.needsFocus = function (target) {
				switch (target.nodeName.toLowerCase()) {
					case 'textarea':
						return true;
					case 'select':
						return !deviceIsAndroid;
					case 'input':
						switch (target.type) {
							case 'button':
							case 'checkbox':
							case 'file':
							case 'image':
							case 'radio':
							case 'submit':
								return false;
						}

						// No point in attempting to focus disabled inputs
						return !target.disabled && !target.readOnly;
					default:
						return (/\bneedsfocus\b/.test(target.className)
						);
				}
			};

			/**
    * Send a click event to the specified element.
    *
    * @param {EventTarget|Element} targetElement
    * @param {Event} event
    */
			FastClick.prototype.sendClick = function (targetElement, event) {
				var clickEvent, touch;

				// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
				if (document.activeElement && document.activeElement !== targetElement) {
					document.activeElement.blur();
				}

				touch = event.changedTouches[0];

				// Synthesise a click event, with an extra attribute so it can be tracked
				clickEvent = document.createEvent('MouseEvents');
				clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
				clickEvent.forwardedTouchEvent = true;
				targetElement.dispatchEvent(clickEvent);
			};

			FastClick.prototype.determineEventType = function (targetElement) {

				//Issue #159: Android Chrome Select Box does not open with a synthetic click event
				if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
					return 'mousedown';
				}

				return 'click';
			};

			/**
    * @param {EventTarget|Element} targetElement
    */
			FastClick.prototype.focus = function (targetElement) {
				var length;

				// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
				if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
					length = targetElement.value.length;
					targetElement.setSelectionRange(length, length);
				} else {
					targetElement.focus();
				}
			};

			/**
    * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
    *
    * @param {EventTarget|Element} targetElement
    */
			FastClick.prototype.updateScrollParent = function (targetElement) {
				var scrollParent, parentElement;

				scrollParent = targetElement.fastClickScrollParent;

				// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
				// target element was moved to another parent.
				if (!scrollParent || !scrollParent.contains(targetElement)) {
					parentElement = targetElement;
					do {
						if (parentElement.scrollHeight > parentElement.offsetHeight) {
							scrollParent = parentElement;
							targetElement.fastClickScrollParent = parentElement;
							break;
						}

						parentElement = parentElement.parentElement;
					} while (parentElement);
				}

				// Always update the scroll top tracker if possible.
				if (scrollParent) {
					scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
				}
			};

			/**
    * @param {EventTarget} targetElement
    * @returns {Element|EventTarget}
    */
			FastClick.prototype.getTargetElementFromEventTarget = function (eventTarget) {

				// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
				if (eventTarget.nodeType === Node.TEXT_NODE) {
					return eventTarget.parentNode;
				}

				return eventTarget;
			};

			/**
    * On touch start, record the position and scroll offset.
    *
    * @param {Event} event
    * @returns {boolean}
    */
			FastClick.prototype.onTouchStart = function (event) {
				var targetElement, touch, selection;

				// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
				if (event.targetTouches.length > 1) {
					return true;
				}

				targetElement = this.getTargetElementFromEventTarget(event.target);
				touch = event.targetTouches[0];

				if (deviceIsIOS) {

					// Only trusted events will deselect text on iOS (issue #49)
					selection = window.getSelection();
					if (selection.rangeCount && !selection.isCollapsed) {
						return true;
					}

					if (!deviceIsIOS4) {

						// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
						// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
						// with the same identifier as the touch event that previously triggered the click that triggered the alert.
						// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
						// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
						// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
						// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
						// random integers, it's safe to to continue if the identifier is 0 here.
						if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
							event.preventDefault();
							return false;
						}

						this.lastTouchIdentifier = touch.identifier;

						// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
						// 1) the user does a fling scroll on the scrollable layer
						// 2) the user stops the fling scroll with another tap
						// then the event.target of the last 'touchend' event will be the element that was under the user's finger
						// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
						// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
						this.updateScrollParent(targetElement);
					}
				}

				this.trackingClick = true;
				this.trackingClickStart = event.timeStamp;
				this.targetElement = targetElement;

				this.touchStartX = touch.pageX;
				this.touchStartY = touch.pageY;

				// Prevent phantom clicks on fast double-tap (issue #36)
				if (event.timeStamp - this.lastClickTime < this.tapDelay) {
					event.preventDefault();
				}

				return true;
			};

			/**
    * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
    *
    * @param {Event} event
    * @returns {boolean}
    */
			FastClick.prototype.touchHasMoved = function (event) {
				var touch = event.changedTouches[0],
				    boundary = this.touchBoundary;

				if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
					return true;
				}

				return false;
			};

			/**
    * Update the last position.
    *
    * @param {Event} event
    * @returns {boolean}
    */
			FastClick.prototype.onTouchMove = function (event) {
				if (!this.trackingClick) {
					return true;
				}

				// If the touch has moved, cancel the click tracking
				if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
					this.trackingClick = false;
					this.targetElement = null;
				}

				return true;
			};

			/**
    * Attempt to find the labelled control for the given label element.
    *
    * @param {EventTarget|HTMLLabelElement} labelElement
    * @returns {Element|null}
    */
			FastClick.prototype.findControl = function (labelElement) {

				// Fast path for newer browsers supporting the HTML5 control attribute
				if (labelElement.control !== undefined) {
					return labelElement.control;
				}

				// All browsers under test that support touch events also support the HTML5 htmlFor attribute
				if (labelElement.htmlFor) {
					return document.getElementById(labelElement.htmlFor);
				}

				// If no for attribute exists, attempt to retrieve the first labellable descendant element
				// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
				return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
			};

			/**
    * On touch end, determine whether to send a click event at once.
    *
    * @param {Event} event
    * @returns {boolean}
    */
			FastClick.prototype.onTouchEnd = function (event) {
				var forElement,
				    trackingClickStart,
				    targetTagName,
				    scrollParent,
				    touch,
				    targetElement = this.targetElement;

				if (!this.trackingClick) {
					return true;
				}

				// Prevent phantom clicks on fast double-tap (issue #36)
				if (event.timeStamp - this.lastClickTime < this.tapDelay) {
					this.cancelNextClick = true;
					return true;
				}

				if (event.timeStamp - this.trackingClickStart > this.tapTimeout) {
					return true;
				}

				// Reset to prevent wrong click cancel on input (issue #156).
				this.cancelNextClick = false;

				this.lastClickTime = event.timeStamp;

				trackingClickStart = this.trackingClickStart;
				this.trackingClick = false;
				this.trackingClickStart = 0;

				// On some iOS devices, the targetElement supplied with the event is invalid if the layer
				// is performing a transition or scroll, and has to be re-detected manually. Note that
				// for this to function correctly, it must be called *after* the event target is checked!
				// See issue #57; also filed as rdar://13048589 .
				if (deviceIsIOSWithBadTarget) {
					touch = event.changedTouches[0];

					// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
					targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
					targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
				}

				targetTagName = targetElement.tagName.toLowerCase();
				if (targetTagName === 'label') {
					forElement = this.findControl(targetElement);
					if (forElement) {
						this.focus(targetElement);
						if (deviceIsAndroid) {
							return false;
						}

						targetElement = forElement;
					}
				} else if (this.needsFocus(targetElement)) {

					// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
					// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
					if (event.timeStamp - trackingClickStart > 100 || deviceIsIOS && window.top !== window && targetTagName === 'input') {
						this.targetElement = null;
						return false;
					}

					this.focus(targetElement);
					this.sendClick(targetElement, event);

					// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
					// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
					if (!deviceIsIOS || targetTagName !== 'select') {
						this.targetElement = null;
						event.preventDefault();
					}

					return false;
				}

				if (deviceIsIOS && !deviceIsIOS4) {

					// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
					// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
					scrollParent = targetElement.fastClickScrollParent;
					if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
						return true;
					}
				}

				// Prevent the actual click from going though - unless the target node is marked as requiring
				// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
				if (!this.needsClick(targetElement)) {
					event.preventDefault();
					this.sendClick(targetElement, event);
				}

				return false;
			};

			/**
    * On touch cancel, stop tracking the click.
    *
    * @returns {void}
    */
			FastClick.prototype.onTouchCancel = function () {
				this.trackingClick = false;
				this.targetElement = null;
			};

			/**
    * Determine mouse events which should be permitted.
    *
    * @param {Event} event
    * @returns {boolean}
    */
			FastClick.prototype.onMouse = function (event) {

				// If a target element was never set (because a touch event was never fired) allow the event
				if (!this.targetElement) {
					return true;
				}

				if (event.forwardedTouchEvent) {
					return true;
				}

				// Programmatically generated events targeting a specific element should be permitted
				if (!event.cancelable) {
					return true;
				}

				// Derive and check the target element to see whether the mouse event needs to be permitted;
				// unless explicitly enabled, prevent non-touch click events from triggering actions,
				// to prevent ghost/doubleclicks.
				if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

					// Prevent any user-added listeners declared on FastClick element from being fired.
					if (event.stopImmediatePropagation) {
						event.stopImmediatePropagation();
					} else {

						// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
						event.propagationStopped = true;
					}

					// Cancel the event
					event.stopPropagation();
					event.preventDefault();

					return false;
				}

				// If the mouse event is permitted, return true for the action to go through.
				return true;
			};

			/**
    * On actual clicks, determine whether this is a touch-generated click, a click action occurring
    * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
    * an actual click which should be permitted.
    *
    * @param {Event} event
    * @returns {boolean}
    */
			FastClick.prototype.onClick = function (event) {
				var permitted;

				// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
				if (this.trackingClick) {
					this.targetElement = null;
					this.trackingClick = false;
					return true;
				}

				// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
				if (event.target.type === 'submit' && event.detail === 0) {
					return true;
				}

				permitted = this.onMouse(event);

				// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
				if (!permitted) {
					this.targetElement = null;
				}

				// If clicks are permitted, return true for the action to go through.
				return permitted;
			};

			/**
    * Remove all FastClick's event listeners.
    *
    * @returns {void}
    */
			FastClick.prototype.destroy = function () {
				var layer = this.layer;

				if (deviceIsAndroid) {
					layer.removeEventListener('mouseover', this.onMouse, true);
					layer.removeEventListener('mousedown', this.onMouse, true);
					layer.removeEventListener('mouseup', this.onMouse, true);
				}

				layer.removeEventListener('click', this.onClick, true);
				layer.removeEventListener('touchstart', this.onTouchStart, false);
				layer.removeEventListener('touchmove', this.onTouchMove, false);
				layer.removeEventListener('touchend', this.onTouchEnd, false);
				layer.removeEventListener('touchcancel', this.onTouchCancel, false);
			};

			/**
    * Check whether FastClick is needed.
    *
    * @param {Element} layer The layer to listen on
    */
			FastClick.notNeeded = function (layer) {
				var metaViewport;
				var chromeVersion;
				var blackberryVersion;
				var firefoxVersion;

				// Devices that don't support touch don't need FastClick
				if (typeof window.ontouchstart === 'undefined') {
					return true;
				}

				// Chrome version - zero for other browsers
				chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1];

				if (chromeVersion) {

					if (deviceIsAndroid) {
						metaViewport = document.querySelector('meta[name=viewport]');

						if (metaViewport) {
							// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
							if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
								return true;
							}
							// Chrome 32 and above with width=device-width or less don't need FastClick
							if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
								return true;
							}
						}

						// Chrome desktop doesn't need FastClick (issue #15)
					} else {
						return true;
					}
				}

				if (deviceIsBlackBerry10) {
					blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

					// BlackBerry 10.3+ does not require Fastclick library.
					// https://github.com/ftlabs/fastclick/issues/251
					if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
						metaViewport = document.querySelector('meta[name=viewport]');

						if (metaViewport) {
							// user-scalable=no eliminates click delay.
							if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
								return true;
							}
							// width=device-width (or less than device-width) eliminates click delay.
							if (document.documentElement.scrollWidth <= window.outerWidth) {
								return true;
							}
						}
					}
				}

				// IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
				if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
					return true;
				}

				// Firefox version - zero for other browsers
				firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1];

				if (firefoxVersion >= 27) {
					// Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

					metaViewport = document.querySelector('meta[name=viewport]');
					if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
						return true;
					}
				}

				// IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
				// http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
				if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
					return true;
				}

				return false;
			};

			/**
    * Factory method for creating a FastClick object
    *
    * @param {Element} layer The layer to listen on
    * @param {Object} [options={}] The options to override the defaults
    */
			FastClick.attach = function (layer, options) {
				return new FastClick(layer, options);
			};

			if (typeof define === 'function' && _typeof(define.amd) === 'object' && define.amd) {

				// AMD. Register as an anonymous module.
				define(function () {
					return FastClick;
				});
			} else if (typeof module !== 'undefined' && module.exports) {
				module.exports = FastClick.attach;
				module.exports.FastClick = FastClick;
			} else {
				window.FastClick = FastClick;
			}
		})();
	}, {}], 2: [function (require, module, exports) {
		!function ($) {

			"use strict";

			var FOUNDATION_VERSION = '6.2.2';

			// Global Foundation object
			// This is attached to the window, or used as a module for AMD/Browserify
			var Foundation = {
				version: FOUNDATION_VERSION,

				/**
     * Stores initialized plugins.
     */
				_plugins: {},

				/**
     * Stores generated unique ids for plugin instances
     */
				_uuids: [],

				/**
     * Returns a boolean for RTL support
     */
				rtl: function rtl() {
					return $('html').attr('dir') === 'rtl';
				},
				/**
     * Defines a Foundation plugin, adding it to the `Foundation` namespace and the list of plugins to initialize when reflowing.
     * @param {Object} plugin - The constructor of the plugin.
     */
				plugin: function plugin(_plugin, name) {
					// Object key to use when adding to global Foundation object
					// Examples: Foundation.Reveal, Foundation.OffCanvas
					var className = name || functionName(_plugin);
					// Object key to use when storing the plugin, also used to create the identifying data attribute for the plugin
					// Examples: data-reveal, data-off-canvas
					var attrName = hyphenate(className);

					// Add to the Foundation object and the plugins list (for reflowing)
					this._plugins[attrName] = this[className] = _plugin;
				},
				/**
     * @function
     * Populates the _uuids array with pointers to each individual plugin instance.
     * Adds the `zfPlugin` data-attribute to programmatically created plugins to allow use of $(selector).foundation(method) calls.
     * Also fires the initialization event for each plugin, consolidating repetitive code.
     * @param {Object} plugin - an instance of a plugin, usually `this` in context.
     * @param {String} name - the name of the plugin, passed as a camelCased string.
     * @fires Plugin#init
     */
				registerPlugin: function registerPlugin(plugin, name) {
					var pluginName = name ? hyphenate(name) : functionName(plugin.constructor).toLowerCase();
					plugin.uuid = this.GetYoDigits(6, pluginName);

					if (!plugin.$element.attr("data-" + pluginName)) {
						plugin.$element.attr("data-" + pluginName, plugin.uuid);
					}
					if (!plugin.$element.data('zfPlugin')) {
						plugin.$element.data('zfPlugin', plugin);
					}
					/**
      * Fires when the plugin has initialized.
      * @event Plugin#init
      */
					plugin.$element.trigger("init.zf." + pluginName);

					this._uuids.push(plugin.uuid);

					return;
				},
				/**
     * @function
     * Removes the plugins uuid from the _uuids array.
     * Removes the zfPlugin data attribute, as well as the data-plugin-name attribute.
     * Also fires the destroyed event for the plugin, consolidating repetitive code.
     * @param {Object} plugin - an instance of a plugin, usually `this` in context.
     * @fires Plugin#destroyed
     */
				unregisterPlugin: function unregisterPlugin(plugin) {
					var pluginName = hyphenate(functionName(plugin.$element.data('zfPlugin').constructor));

					this._uuids.splice(this._uuids.indexOf(plugin.uuid), 1);
					plugin.$element.removeAttr("data-" + pluginName).removeData('zfPlugin')
					/**
      * Fires when the plugin has been destroyed.
      * @event Plugin#destroyed
      */
					.trigger("destroyed.zf." + pluginName);
					for (var prop in plugin) {
						plugin[prop] = null; //clean up script to prep for garbage collection.
					}
					return;
				},

				/**
     * @function
     * Causes one or more active plugins to re-initialize, resetting event listeners, recalculating positions, etc.
     * @param {String} plugins - optional string of an individual plugin key, attained by calling `$(element).data('pluginName')`, or string of a plugin class i.e. `'dropdown'`
     * @default If no argument is passed, reflow all currently active plugins.
     */
				reInit: function reInit(plugins) {
					var isJQ = plugins instanceof $;
					try {
						if (isJQ) {
							plugins.each(function () {
								$(this).data('zfPlugin')._init();
							});
						} else {
							var type = typeof plugins === "undefined" ? "undefined" : _typeof(plugins),
							    _this = this,
							    fns = {
								'object': function object(plgs) {
									plgs.forEach(function (p) {
										p = hyphenate(p);
										$('[data-' + p + ']').foundation('_init');
									});
								},
								'string': function string() {
									plugins = hyphenate(plugins);
									$('[data-' + plugins + ']').foundation('_init');
								},
								'undefined': function undefined() {
									this['object'](Object.keys(_this._plugins));
								}
							};
							fns[type](plugins);
						}
					} catch (err) {
						console.error(err);
					} finally {
						return plugins;
					}
				},

				/**
     * returns a random base-36 uid with namespacing
     * @function
     * @param {Number} length - number of random base-36 digits desired. Increase for more random strings.
     * @param {String} namespace - name of plugin to be incorporated in uid, optional.
     * @default {String} '' - if no plugin name is provided, nothing is appended to the uid.
     * @returns {String} - unique id
     */
				GetYoDigits: function GetYoDigits(length, namespace) {
					length = length || 6;
					return Math.round(Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)).toString(36).slice(1) + (namespace ? "-" + namespace : '');
				},
				/**
     * Initialize plugins on any elements within `elem` (and `elem` itself) that aren't already initialized.
     * @param {Object} elem - jQuery object containing the element to check inside. Also checks the element itself, unless it's the `document` object.
     * @param {String|Array} plugins - A list of plugins to initialize. Leave this out to initialize everything.
     */
				reflow: function reflow(elem, plugins) {

					// If plugins is undefined, just grab everything
					if (typeof plugins === 'undefined') {
						plugins = Object.keys(this._plugins);
					}
					// If plugins is a string, convert it to an array with one item
					else if (typeof plugins === 'string') {
							plugins = [plugins];
						}

					var _this = this;

					// Iterate through each plugin
					$.each(plugins, function (i, name) {
						// Get the current plugin
						var plugin = _this._plugins[name];

						// Localize the search to all elements inside elem, as well as elem itself, unless elem === document
						var $elem = $(elem).find('[data-' + name + ']').addBack('[data-' + name + ']');

						// For each plugin found, initialize it
						$elem.each(function () {
							var $el = $(this),
							    opts = {};
							// Don't double-dip on plugins
							if ($el.data('zfPlugin')) {
								console.warn("Tried to initialize " + name + " on an element that already has a Foundation plugin.");
								return;
							}

							if ($el.attr('data-options')) {
								var thing = $el.attr('data-options').split(';').forEach(function (e, i) {
									var opt = e.split(':').map(function (el) {
										return el.trim();
									});
									if (opt[0]) opts[opt[0]] = parseValue(opt[1]);
								});
							}
							try {
								$el.data('zfPlugin', new plugin($(this), opts));
							} catch (er) {
								console.error(er);
							} finally {
								return;
							}
						});
					});
				},
				getFnName: functionName,
				transitionend: function transitionend($elem) {
					var transitions = {
						'transition': 'transitionend',
						'WebkitTransition': 'webkitTransitionEnd',
						'MozTransition': 'transitionend',
						'OTransition': 'otransitionend'
					};
					var elem = document.createElement('div'),
					    end;

					for (var t in transitions) {
						if (typeof elem.style[t] !== 'undefined') {
							end = transitions[t];
						}
					}
					if (end) {
						return end;
					} else {
						end = setTimeout(function () {
							$elem.triggerHandler('transitionend', [$elem]);
						}, 1);
						return 'transitionend';
					}
				}
			};

			Foundation.util = {
				/**
     * Function for applying a debounce effect to a function call.
     * @function
     * @param {Function} func - Function to be called at end of timeout.
     * @param {Number} delay - Time in ms to delay the call of `func`.
     * @returns function
     */
				throttle: function throttle(func, delay) {
					var timer = null;

					return function () {
						var context = this,
						    args = arguments;

						if (timer === null) {
							timer = setTimeout(function () {
								func.apply(context, args);
								timer = null;
							}, delay);
						}
					};
				}
			};

			// TODO: consider not making this a jQuery function
			// TODO: need way to reflow vs. re-initialize
			/**
    * The Foundation jQuery method.
    * @param {String|Array} method - An action to perform on the current jQuery object.
    */
			var foundation = function foundation(method) {
				var type = typeof method === "undefined" ? "undefined" : _typeof(method),
				    $meta = $('meta.foundation-mq'),
				    $noJS = $('.no-js');

				if (!$meta.length) {
					$('<meta class="foundation-mq">').appendTo(document.head);
				}
				if ($noJS.length) {
					$noJS.removeClass('no-js');
				}

				if (type === 'undefined') {
					//needs to initialize the Foundation object, or an individual plugin.
					Foundation.MediaQuery._init();
					Foundation.reflow(this);
				} else if (type === 'string') {
					//an individual method to invoke on a plugin or group of plugins
					var args = Array.prototype.slice.call(arguments, 1); //collect all the arguments, if necessary
					var plugClass = this.data('zfPlugin'); //determine the class of plugin

					if (plugClass !== undefined && plugClass[method] !== undefined) {
						//make sure both the class and method exist
						if (this.length === 1) {
							//if there's only one, call it directly.
							plugClass[method].apply(plugClass, args);
						} else {
							this.each(function (i, el) {
								//otherwise loop through the jQuery collection and invoke the method on each
								plugClass[method].apply($(el).data('zfPlugin'), args);
							});
						}
					} else {
						//error for no class or no method
						throw new ReferenceError("We're sorry, '" + method + "' is not an available method for " + (plugClass ? functionName(plugClass) : 'this element') + '.');
					}
				} else {
					//error for invalid argument type
					throw new TypeError("We're sorry, " + type + " is not a valid parameter. You must use a string representing the method you wish to invoke.");
				}
				return this;
			};

			window.Foundation = Foundation;
			$.fn.foundation = foundation;

			// Polyfill for requestAnimationFrame
			(function () {
				if (!Date.now || !window.Date.now) window.Date.now = Date.now = function () {
					return new Date().getTime();
				};

				var vendors = ['webkit', 'moz'];
				for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
					var vp = vendors[i];
					window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
					window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
				}
				if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
					var lastTime = 0;
					window.requestAnimationFrame = function (callback) {
						var now = Date.now();
						var nextTime = Math.max(lastTime + 16, now);
						return setTimeout(function () {
							callback(lastTime = nextTime);
						}, nextTime - now);
					};
					window.cancelAnimationFrame = clearTimeout;
				}
				/**
     * Polyfill for performance.now, required by rAF
     */
				if (!window.performance || !window.performance.now) {
					window.performance = {
						start: Date.now(),
						now: function now() {
							return Date.now() - this.start;
						}
					};
				}
			})();
			if (!Function.prototype.bind) {
				Function.prototype.bind = function (oThis) {
					if (typeof this !== 'function') {
						// closest thing possible to the ECMAScript 5
						// internal IsCallable function
						throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
					}

					var aArgs = Array.prototype.slice.call(arguments, 1),
					    fToBind = this,
					    fNOP = function fNOP() {},
					    fBound = function fBound() {
						return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
					};

					if (this.prototype) {
						// native functions don't have a prototype
						fNOP.prototype = this.prototype;
					}
					fBound.prototype = new fNOP();

					return fBound;
				};
			}
			// Polyfill to get the name of a function in IE9
			function functionName(fn) {
				if (Function.prototype.name === undefined) {
					var funcNameRegex = /function\s([^(]{1,})\(/;
					var results = funcNameRegex.exec(fn.toString());
					return results && results.length > 1 ? results[1].trim() : "";
				} else if (fn.prototype === undefined) {
					return fn.constructor.name;
				} else {
					return fn.prototype.constructor.name;
				}
			}
			function parseValue(str) {
				if (/true/.test(str)) return true;else if (/false/.test(str)) return false;else if (!isNaN(str * 1)) return parseFloat(str);
				return str;
			}
			// Convert PascalCase to kebab-case
			// Thank you: http://stackoverflow.com/a/8955580
			function hyphenate(str) {
				return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
			}
		}(jQuery);
	}, {}], 3: [function (require, module, exports) {
		'use strict';

		!function ($) {

			// Default set of media queries
			var defaultQueries = {
				'default': 'only screen',
				landscape: 'only screen and (orientation: landscape)',
				portrait: 'only screen and (orientation: portrait)',
				retina: 'only screen and (-webkit-min-device-pixel-ratio: 2),' + 'only screen and (min--moz-device-pixel-ratio: 2),' + 'only screen and (-o-min-device-pixel-ratio: 2/1),' + 'only screen and (min-device-pixel-ratio: 2),' + 'only screen and (min-resolution: 192dpi),' + 'only screen and (min-resolution: 2dppx)'
			};

			var MediaQuery = {
				queries: [],

				current: '',

				/**
     * Initializes the media query helper, by extracting the breakpoint list from the CSS and activating the breakpoint watcher.
     * @function
     * @private
     */
				_init: function _init() {
					var self = this;
					var extractedStyles = $('.foundation-mq').css('font-family');
					var namedQueries;

					namedQueries = parseStyleToObject(extractedStyles);

					for (var key in namedQueries) {
						if (namedQueries.hasOwnProperty(key)) {
							self.queries.push({
								name: key,
								value: "only screen and (min-width: " + namedQueries[key] + ")"
							});
						}
					}

					this.current = this._getCurrentSize();

					this._watcher();
				},


				/**
     * Checks if the screen is at least as wide as a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to check.
     * @returns {Boolean} `true` if the breakpoint matches, `false` if it's smaller.
     */
				atLeast: function atLeast(size) {
					var query = this.get(size);

					if (query) {
						return window.matchMedia(query).matches;
					}

					return false;
				},


				/**
     * Gets the media query of a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to get.
     * @returns {String|null} - The media query of the breakpoint, or `null` if the breakpoint doesn't exist.
     */
				get: function get(size) {
					for (var i in this.queries) {
						if (this.queries.hasOwnProperty(i)) {
							var query = this.queries[i];
							if (size === query.name) return query.value;
						}
					}

					return null;
				},


				/**
     * Gets the current breakpoint name by testing every breakpoint and returning the last one to match (the biggest one).
     * @function
     * @private
     * @returns {String} Name of the current breakpoint.
     */
				_getCurrentSize: function _getCurrentSize() {
					var matched;

					for (var i = 0; i < this.queries.length; i++) {
						var query = this.queries[i];

						if (window.matchMedia(query.value).matches) {
							matched = query;
						}
					}

					if ((typeof matched === "undefined" ? "undefined" : _typeof(matched)) === 'object') {
						return matched.name;
					} else {
						return matched;
					}
				},


				/**
     * Activates the breakpoint watcher, which fires an event on the window whenever the breakpoint changes.
     * @function
     * @private
     */
				_watcher: function _watcher() {
					var _this2 = this;

					$(window).on('resize.zf.mediaquery', function () {
						var newSize = _this2._getCurrentSize(),
						    currentSize = _this2.current;

						if (newSize !== currentSize) {
							// Change the current media query
							_this2.current = newSize;

							// Broadcast the media query change on the window
							$(window).trigger('changed.zf.mediaquery', [newSize, currentSize]);
						}
					});
				}
			};

			Foundation.MediaQuery = MediaQuery;

			// matchMedia() polyfill - Test a CSS media type/query in JS.
			// Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license
			window.matchMedia || (window.matchMedia = function () {
				'use strict';

				// For browsers that support matchMedium api such as IE 9 and webkit

				var styleMedia = window.styleMedia || window.media;

				// For those that don't support matchMedium
				if (!styleMedia) {
					var style = document.createElement('style'),
					    script = document.getElementsByTagName('script')[0],
					    info = null;

					style.type = 'text/css';
					style.id = 'matchmediajs-test';

					script.parentNode.insertBefore(style, script);

					// 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
					info = 'getComputedStyle' in window && window.getComputedStyle(style, null) || style.currentStyle;

					styleMedia = {
						matchMedium: function matchMedium(media) {
							var text = "@media " + media + "{ #matchmediajs-test { width: 1px; } }";

							// 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
							if (style.styleSheet) {
								style.styleSheet.cssText = text;
							} else {
								style.textContent = text;
							}

							// Test if media query is true or false
							return info.width === '1px';
						}
					};
				}

				return function (media) {
					return {
						matches: styleMedia.matchMedium(media || 'all'),
						media: media || 'all'
					};
				};
			}());

			// Thank you: https://github.com/sindresorhus/query-string
			function parseStyleToObject(str) {
				var styleObject = {};

				if (typeof str !== 'string') {
					return styleObject;
				}

				str = str.trim().slice(1, -1); // browsers re-quote string style values

				if (!str) {
					return styleObject;
				}

				styleObject = str.split('&').reduce(function (ret, param) {
					var parts = param.replace(/\+/g, ' ').split('=');
					var key = parts[0];
					var val = parts[1];
					key = decodeURIComponent(key);

					// missing `=` should be `null`:
					// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
					val = val === undefined ? null : decodeURIComponent(val);

					if (!ret.hasOwnProperty(key)) {
						ret[key] = val;
					} else if (Array.isArray(ret[key])) {
						ret[key].push(val);
					} else {
						ret[key] = [ret[key], val];
					}
					return ret;
				}, {});

				return styleObject;
			}

			Foundation.MediaQuery = MediaQuery;
		}(jQuery);
	}, {}], 4: [function (require, module, exports) {
		var fastclick = require("fastclick/lib/fastclick");
		var foundation = require("foundation-sites/js/foundation.core");
		var foundationUtilMediaQuery = require("foundation-sites/js/foundation.util.mediaQuery");
		var navigation = require("./requires/navigation");
		var skipLinkFocusFix = require("./requires/skip-link-focus-fix");

		(function ($) {
			"use strict";

			$(document).foundation();
		})(jQuery);
	}, { "./requires/navigation": 5, "./requires/skip-link-focus-fix": 6, "fastclick/lib/fastclick": 1, "foundation-sites/js/foundation.core": 2, "foundation-sites/js/foundation.util.mediaQuery": 3 }], 5: [function (require, module, exports) {
		/**
   * File navigation.js.
   *
   * Handles toggling the navigation menu for small screens and enables TAB key
   * navigation support for dropdown menus.
   */
		(function () {
			var container, button, menu, links, subMenus, i, len;

			container = document.getElementById('site-navigation');
			if (!container) {
				return;
			}

			button = container.getElementsByTagName('button')[0];
			if ('undefined' === typeof button) {
				return;
			}

			menu = container.getElementsByTagName('ul')[0];

			// Hide menu toggle button if menu is empty and return early.
			if ('undefined' === typeof menu) {
				button.style.display = 'none';
				return;
			}

			menu.setAttribute('aria-expanded', 'false');
			if (-1 === menu.className.indexOf('nav-menu')) {
				menu.className += ' nav-menu';
			}

			button.onclick = function () {
				console.log("Tests");
				if (-1 !== container.className.indexOf('toggled')) {
					container.className = container.className.replace(' toggled', '');
					button.setAttribute('aria-expanded', 'false');
					menu.setAttribute('aria-expanded', 'false');
				} else {
					container.className += ' toggled';
					button.setAttribute('aria-expanded', 'true');
					menu.setAttribute('aria-expanded', 'true');
				}
			};

			// Get all the link elements within the menu.
			links = menu.getElementsByTagName('a');
			subMenus = menu.getElementsByTagName('ul');

			// Set menu items with submenus to aria-haspopup="true".
			for (i = 0, len = subMenus.length; i < len; i++) {
				subMenus[i].parentNode.setAttribute('aria-haspopup', 'true');
			}

			// Each time a menu link is focused or blurred, toggle focus.
			for (i = 0, len = links.length; i < len; i++) {
				links[i].addEventListener('focus', toggleFocus, true);
				links[i].addEventListener('blur', toggleFocus, true);
			}

			/**
    * Sets or removes .focus class on an element.
    */
			function toggleFocus() {
				var self = this;

				// Move up through the ancestors of the current link until we hit .nav-menu.
				while (-1 === self.className.indexOf('nav-menu')) {

					// On li elements toggle the class .focus.
					if ('li' === self.tagName.toLowerCase()) {
						if (-1 !== self.className.indexOf('focus')) {
							self.className = self.className.replace(' focus', '');
						} else {
							self.className += ' focus';
						}
					}

					self = self.parentElement;
				}
			}
		})();
	}, {}], 6: [function (require, module, exports) {
		/**
   * File skip-link-focus-fix.js.
   *
   * Helps with accessibility for keyboard only users.
   *
   * Learn more: https://git.io/vWdr2
   */
		(function () {
			var isWebkit = navigator.userAgent.toLowerCase().indexOf('webkit') > -1,
			    isOpera = navigator.userAgent.toLowerCase().indexOf('opera') > -1,
			    isIe = navigator.userAgent.toLowerCase().indexOf('msie') > -1;

			if ((isWebkit || isOpera || isIe) && document.getElementById && window.addEventListener) {
				window.addEventListener('hashchange', function () {
					var id = location.hash.substring(1),
					    element;

					if (!/^[A-z0-9_-]+$/.test(id)) {
						return;
					}

					element = document.getElementById(id);

					if (element) {
						if (!/^(?:a|select|input|button|textarea)$/i.test(element.tagName)) {
							element.tabIndex = -1;
						}

						element.focus();
					}
				}, false);
			}
		})();
	}, {}] }, {}, [4]);