/*!
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
!function e(t,n,o){function i(a,s){if(!n[a]){if(!t[a]){var u="function"==typeof require&&require;if(!s&&u)return u(a,!0);if(r)return r(a,!0);var d=new Error("Cannot find module '"+a+"'");throw d.code="MODULE_NOT_FOUND",d}var c=n[a]={exports:{}};t[a][0].call(c.exports,function(e){var n=t[a][1][e];return i(n?n:e)},c,c.exports,e,t,n,o)}return n[a].exports}for(var r="function"==typeof require&&require,a=0;a<o.length;a++)i(o[a]);return i}({1:[function(e,t,n){"use strict";function o(e){return e&&e.__esModule?e:{"default":e}}var i=e("./libs/Toaster"),r=o(i);!function(){function e(){window.Polymer=window.Polymer||{},window.Polymer.dom="shadow";var e=["elements/audio-processor/audio-processor.html","elements/audio-visualizer/audio-visualizer.html","elements/tuning-instructions/tuning-instructions.html"];e.forEach(function(e){var t=document.createElement("link");t.rel="import",t.href=e,t.async="true",document.head.appendChild(t)})}if(window.AudioContext=window.AudioContext||window.webkitAudioContext||window.mozAudioContext||window.msAudioContext,navigator.getUserMedia=navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia||navigator.msGetUserMedia,"undefined"==typeof window.AudioContext||"undefined"==typeof navigator.getUserMedia)return void requestAnimationFrame(function(){document.body.classList.add("unsupported")});document.body.classList.add("supported");var t="registerElement"in document&&"import"in document.createElement("link")&&"content"in document.createElement("template");if(t)e();else{var n=document.createElement("script");n.async=!0,n.src="../third_party/webcomponents-lite.min.js",n.onload=e,document.head.appendChild(n)}"serviceWorker"in navigator&&navigator.serviceWorker.register("scripts/sw.js").then(function(e){var t=!1;e.active&&(t=!0),e.onupdatefound=function(n){console.log("A new Service Worker version has been found..."),e.installing.onstatechange=function(e){"installed"===this.state?(console.log("Service Worker Installed."),t?(0,r["default"])().then(function(e){e.toast("App updated. Restart for the new version.")}):(0,r["default"])().then(function(e){e.toast("App ready for offline use.")})):console.log("New Service Worker state: ",this.state)}}},function(e){console.log(e)})}()},{"./libs/Toaster":2}],2:[function(e,t,n){"use strict";function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(){return"undefined"!=typeof window.ToasterInstance_?Promise.resolve(window.ToasterInstance_):(window.ToasterInstance_=new a,Promise.resolve(window.ToasterInstance_))}Object.defineProperty(n,"__esModule",{value:!0});var r=function(){function e(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(t,n,o){return n&&e(t.prototype,n),o&&e(t,o),t}}();n["default"]=i;var a=function(){function e(){o(this,e),this.view=document.querySelector(".toast-view"),this.hideTimeout=0,this.hideBound=this.hide.bind(this)}return r(e,[{key:"toast",value:function(e){this.view.textContent=e,this.view.classList.add("toast-view--visible"),clearTimeout(this.hideTimeout),this.hideTimeout=setTimeout(this.hideBound,3e3)}},{key:"hide",value:function(){this.view.classList.remove("toast-view--visible")}}]),e}();t.exports=n["default"]},{}]},{},[1]);
