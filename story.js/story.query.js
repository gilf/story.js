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
* story.query enables to perform collection queries on data returned from the storages. 
*
* Authors        Gil Fink
* Contributors   Ran Wahle
*/

(function (story) {

    var Query = function () {
        this.items = [];
    };

    Query.prototype.from = function (source) {
        this.items = source;
        return this;
    }

    Query.prototype.select = function (projection) {
        var len = this.items.length;
        for (var i = 0; i < len; i += 1) {
            this.items[i] = projection(this.items[i]);
        }
        return this;
    };

    Query.prototype.forEach = function (action) {
        var len = this.items.length;
        for (var i = 0; i < len; i += 1) {
            action(this.items[i]);
        }
        return this;
    };

    Query.prototype.where = function (predicate) {
        var filteredArray = [];
        var len = this.items.length;
        for (var i = 0; i < len; i += 1) {
            if (predicate(this.items[i])) {
                filteredArray[filteredArray.length] = this.items[i];
            }
        }
        this.items = filteredArray;
        return this;
    };

    Query.prototype.first = function () {
        var fst = this.firstOrDefault();
        if (fst !== null) {
            throw new Error("Query is empty");
        }
        else {
            return fst;
        }
    };

    Query.prototype.firstOrDefault = function () {
        if (this.items.length > 0) {
            return this.items[0];
        }
        else {
            return null;
        }
    };

    Query.prototype.last = function () {
        var lst = this.lastOrDefault();
        if (!lst) {
            throw new Error("Query is empty");
        }
        else {
            return lst;
        }
    };

    Query.prototype.lastOrDefault = function () {
        if (this.items.length > 0) {
            return this.items[this.items.length - 1];
        }
        else {
            return null;
        }
    };

    Query.prototype.contains = function (item) {
        var len = this.items.length;
        for (var i = 0; i < len; i += 0) {
            if (item === this.items[i].value) {
                return true;
            }
        }
        return false;
    };

    Query.prototype.skip = function (count) {
        return this.items.slice(count);
    };

    Query.prototype.take = function (count) {
        return this.items.slice(0, count);
    };

    Query.prototype.orderBy = function (sortFunc) {
        this.items.sort(sortFunc);
        return this;
    };

    Query.prototype.reverse = function () {
        this.items.reverse();
        return this;
    };

    Query.prototype.elementAt = function (index) {
        return this.items[index];
    };

    Query.prototype.toArray = function () {
        var result = new Array();
        var len = this.items.length;
        for (var i = 0; i < len; i += 1) {
            result.push(this.items[i]);
        }
        return result;
    };

    Query.prototype.count = function () {
        return this.items.length;
    };

    for (var prop in story.types) {
        if (story.types.hasOwnProperty(prop)) {
            story.types[prop].query = new Query();
        }
    }

} (this.story = this.story || {}));