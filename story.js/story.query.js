/*!
* story.js v0.1
*
* Copyright (c) Sela Group and Gil Fink. All rights reserved.
* Dual licensed under the MIT or GPL Version 2 licenses.
*
* Date: Fri Apr 20 14:00:12 2012 
*/

/*
* story.js enables web developers to use client-side storages in a common and simple way. 
* It includes abstraction layer on top of Web Storage API, IndexedDB API, Cookies API and 
* In-Memory storage.
*
* Authors        Gil Fink
* Contributors   Ran Wahle
*/

(function (story) {

    var Query = function () {
    };

    Query.prototype.select = function () {
        return this;
    };

    Query.prototype.forEach = function () {
        return this;
    };

    Query.prototype.where = function () {
        return this;
    };

} (this.story = this.story || {}));