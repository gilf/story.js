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
 * Contributors   
 */

(function (story) {

    var storyKeyPrefix = "__story__",
        storyStorageDefaultName = "_story_",
        storage = story.storage = function (name) {
            if (!name) {
                // In-memory storage is the default storage
                return story.types[story.StorageTypes.IN_MEMORY];
            }
            return story.types[name];
        };

    /* Public Members */

    story.types = {};
    story.StorageTypes = {
        WEB_STORAGE: "WebStorage",
        INDEXEDDB: "IndexedDB",
        COOKIE: "Cookie",
        IN_MEMORY: "InMemroy"
    };

    /* Utility Functions and Objects */

    var registerType = function (name, type) {
        story.types[name] = type;
    };

    var createStoreKey = function (key) {
        return storyKeyPrefix + key;
    };

    story.Promise = function () {
        this.thens = [];
    };

    story.Promise.prototype = {
        then: function (onResolve, onReject) {
            this.thens.push({ resolve: onResolve, reject: onReject });
        },
        resolve: function (value) {
            this.complete('resolve', value);
        },
        reject: function (error) {
            this.complete('reject', error);
        },
        complete: function (which, arg) {
            if (which === 'resolve') {
                this.then = function (resolve, reject) { 
                    resolve(arg); 
                }
            }
            else {
                this.then = function (resolve, reject) { 
                    reject(arg); 
                }
            }
            this.resolve = this.reject =
            function () {
                throw new Error('Promise already completed.');
    		};
            var aThen, i = 0;
            while (aThen = this.thens[i]) {
                aThen[which] && aThen[which](arg);
                i += 1;
            }
            delete this.thens;
        }
    };

    function promiseWrap(storyStorage, impl) {
        var promise = new story.Promise();
        impl(storyStorage, promise);
        return promise;
    }

    /*** story Types ***/

    /* Web Storage */

    var WebStorage = function () {
        this.storage = window.localStorage;
    };

    WebStorage.prototype.get = function (key) {
        return promiseWrap(this, function (storyStorage, promise) {
            try {
                var item = storyStorage.storage.getItem(createStoreKey(key));
                if (item !== null && item !== "undefined") {
                    item = window.JSON.parse(item);
                }
                else {
                    item = undefined;
                }
                promise.resolve(item);
            }
            catch (e) {
                promise.reject(e);
            }    
        });
    };

    WebStorage.prototype.add = function (key, value) {
        return promiseWrap(this, function (storyStorage, promise) {
            try {
                storyStorage.storage.setItem(createStoreKey(key), window.JSON.stringify(value));
                promise.resolve({ key: key, value: value });
            }
            catch (e) {
                if (e.code === 22 || e.number === 0x8007000E) {
                    promise.reject({ message: "QUOTA_EXCEEDED_ERR", error: e });
                } else {
                    promise.reject(e);
                }
            }
        });
    };

    WebStorage.prototype.update = function (key, value) {
        return this.add(key, value);
    };

    WebStorage.prototype.remove = function (key) {
        return promiseWrap(this, function (storyStorage, promise) { 
            try {
                storyStorage.storage.removeItem(createStoreKey(key));
                promise.resolve();
            }
            catch (e) {
                promise.reject(e);
            }    
        }); 
    };

    WebStorage.prototype.contains = function (key) {
        return promiseWrap(this, function (storyStorage, promise) { 
            try {
                var item = storyStorage.storage.getItem(createStoreKey(key));
                promise.resolve(item !== null);
            }
            catch (e) {
                promise.reject(e);
            }    
        });        
    };

    WebStorage.prototype.clear = function () {
        return promiseWrap(this, function (storyStorage, promise) { 
            try {
                storyStorage.storage.clear();
                promise.resolve();
            }
            catch (e) {
                promise.reject(e);
            }    
        });
    };

    if (window.localStorage) {
        registerType(story.StorageTypes.WEB_STORAGE, new WebStorage());
    }    

    /* IndexedDB  */

    var indexeddb = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
    var transaction = window.IDBTransaction || window.webkitIDBTransaction;

    var openTransaction = function (storage, mode) {
        var promise = new story.Promise();
        var name = storage.name;
        var db = storage.db;
        if (db) {
            promise.resolve({ trans: db.transaction(name, mode), name: name });
        } else {
            var request = storage.storage.open(storyStorageDefaultName + name);
            request.onsuccess = function (e) {
                storage.db = e.target.result;
                promise.resolve({ trans: db.transaction(name, mode), name: name });
            };
            request.onerror = function (e) {
               promise.reject(e);
            };
        }
        return promise;
    };

    var IDBFactory = function () {
    };

    var IDBStorage = function (name) {        
        this.name = name;
    };

    IDBFactory.prototype.createStore = function (options) {
        var promise = new story.Promise();
        var name = options.name;
        var store = new IDBStorage(name || storyStorageDefaultName);

        var request = indexeddb.open(name || storyStorageDefaultName, options.version || 1);  
        request.onsuccess = function (e) {
            store.db = request.result;
            promise.resolve(store);                                                            
        };
 
        request.onerror = function (e) {
            promise.reject("IndexedDB error: " + e.target.errorCode);
        };
 
        request.onupgradeneeded = function (e) {                   
            var objectStore = e.currentTarget.result.createObjectStore(name, { keyPath: options.keyPath, autoIncrement: options.autoInc });            

            for (var len = options.names.length, i = 0; i < len; i += 1) {
                objectStore.createIndex(options.names[i], options.values[i], { unique: options.unique[i] });
            }
        };
        return promise;
    };

    IDBStorage.prototype.get = function (key) {
        return promiseWrap(this, function (storyStorage, promise) { 
            openTransaction(storyStorage, transaction.READ_WRITE).then(function (options) {
                var values = [];

                options.trans.onerror = function (e) {
                    promise.reject(e);
                };
                options.trans.oncomplete = function () {
                    promise.resolve({ key: key, value: values });
                };

                var objectStore = options.trans.objectStore(options.name);
                var request = objectStore.get(key);
                request.onsuccess = function (event) {
                     values.push(event.target.result);
                }
            }, function (e) {
               promise.reject(e); 
            });
        });        
    };

    IDBStorage.prototype.add = function (key, value) {        
        return promiseWrap(this, function (storyStorage, promise) { 
            openTransaction(storyStorage, transaction.READ_WRITE).then(function (options) {
                options.trans.onabort = function (e) {
                    promise.reject(e);
                };
                options.trans.oncomplete = function () {
                    promise.resolve({ key: key, value: value });
                };

                options.trans.objectStore(options.name).add(value, key);           
            }, function (e) {
                if (e.code === 11) {
                    e = { name: "QUOTA_EXCEEDED_ERR", error: e };
                }
                promise.reject(e); 
            });
        });
    };

    IDBStorage.prototype.update = function (key, value) {
        return promiseWrap(this, function (storyStorage, promise) {  
            openTransaction(storyStorage, transaction.READ_WRITE).then(function (options) {
                    options.trans.onabort = function (e) {
                        promise.reject(e);
                    };
                    options.trans.oncomplete = function () {
                       promise.resolve({ key: key, value: value });
                    };

                    var request = options.trans.objectStore(options.name).openCursor(key);
                    request.pair = { key: key, value: value };
                    request.onsuccess = function (event) {
                        var cursor = event.target.result;
                        if (cursor) {
                            cursor.update(event.target.pair.value);
                        } else {
                            options.trans.abort();
                        }
                    }
                }, function (e) {
                    promise.reject(e); 
            });
        });
    };

    IDBStorage.prototype.remove = function (key) {
        return promiseWrap(this, function (storyStorage, promise) { 
            openTransaction(storyStorage, transaction.READ_WRITE).then(function (options) {
                options.trans.onerror = function (e) {
                    promise.reject(e);
                };
                options.trans.oncomplete = function () {
                    promise.resolve();
                };

                var objectStore = options.trans.objectStore(options.name);
                objectStore.delete(key);
            }, function (e) {
               promise.reject(e); 
            });
        });
    };

    IDBStorage.prototype.contains = function (key) {
        return promiseWrap(this, function (storyStorage, promise) { 
            openTransaction(storyStorage, transaction.READ_ONLY).then(function (options) {
                var request = options.trans.objectStore(options.name).openCursor(IDBKeyRange.only(key));
                options.trans.oncomplete = function () {
                    promise.resolve(request.result !== undefined);
                };
                options.trans.onerror = function (e) {
                    promise.reject(e);
                };
            }, function (e) {
               promise.reject(e); 
            });        
        });
    };

    IDBStorage.prototype.clear = function () {
        return promiseWrap(this, function (storyStorage, promise) { 
            openTransaction(storyStorage, transaction.READ_WRITE).then(function (options) {
                options.trans.onerror = function(e) {
                    promise.reject(e);
                };
                options.trans.oncomplete = function () {
                    promise.resolve();
                };

                options.trans.objectStore(options.name).clear();
            }, function (e) {
               promise.reject(e); 
            });
        });
    };

    IDBStorage.prototype.close = function () {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    };

    if (indexeddb) {
        registerType(story.StorageTypes.INDEXEDDB, new IDBFactory());
    }

    /* Cookie */

    var Cookie = function () {        
    };

    Cookie.prototype.get = function (key) {
        return promiseWrap(this, function (storyStorage, promise) {
            var match = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');

            if (match) {
                promise.resolve(unescape(match[2]));
            }
            else {
                promise.reject({ message: "Cookie doesn't exists" });
            }
        });
    };

    Cookie.prototype.add = function (key, value) {
        return promiseWrap(this, function (storyStorage, promise) {
                var cookieStr = key + "=" + escape(value);
            document.cookie = cookieStr;
            promise.resolve({ key: key, cookieString: cookieStr });
        });
    };

    Cookie.prototype.update = function (key, value) {
        return this.add(key, value);
    };

    Cookie.prototype.remove = function (key) {
        return promiseWrap(this, function (storyStorage, promise) {
            var expiry = new Date();
            expiry.setTime(expiry.getTime() - 1);
            document.cookie = key += "=; expires=" + expiry.toGMTString();
            promise.resolve();
        });
    };

    Cookie.prototype.contains = function (key) {
        return promiseWrap(this, function (storyStorage, promise) {
            var match = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
            match ? promise.resolve(true) : promise.resolve(false);    
        });
    };

    Cookie.prototype.clear = function () {
        return promiseWrap(this, function (storyStorage, promise) {
            document.cookie = "";
            promise.resolve();    
        });        
    };

    registerType(story.StorageTypes.COOKIE, new Cookie());

    /* In Memory Storage */

    var MemoryStorage = function () {
        this.storage = {};

        this.validateKey = function (key) {
            if (key instanceof Array || key === null || key === undefined) {
                return false;
            }
            return true;
        };
    };

    MemoryStorage.prototype.get = function (key) {
        return promiseWrap(this, function (storyStorage, promise) {
            if (storyStorage.validateKey(key)) {
                promise.resolve(storyStorage.storage[key]);
            }
            else {
                promise.reject("Invalid Key");
            }
        });
    };

    MemoryStorage.prototype.add = function (key, value) {
        return promiseWrap(this, function (storyStorage, promise) {
            if (storyStorage.validateKey(key)) {
                if (!storyStorage.storage.hasOwnProperty(key)) {
                    storyStorage.storage[key] = value;
                    promise.resolve({ key: key, value: value });
                } else {
                    promise.reject({ message: "key already exists", key: key });
                }
            }    
        });
    };

    MemoryStorage.prototype.update = function (key, value) {
        return promiseWrap(this, function (storyStorage, promise) {
            if (storyStorage.validateKey(key)) {
                if (storyStorage.storage.hasOwnProperty(key)) {
                    storyStorage.storage[key] = value;
                    promise.resolve({ key: key, value: value });
                }
            }
        });
    };

    MemoryStorage.prototype.remove = function (key) {
        return promiseWrap(this, function (storyStorage, promise) {
            if (storyStorage.validateKey(key)) {
                if (storyStorage.storage.hasOwnProperty(key)) {
                    delete storyStorage.storage[key];
                }
                promise.resolve();
            }
        });      
    };

    MemoryStorage.prototype.contains = function (key) {
        return promiseWrap(this, function (storyStorage, promise) {
            promise.resolve(storyStorage.storage.hasOwnProperty(key));
        });        
    };

    MemoryStorage.prototype.clear = function () {
        return promiseWrap(this, function (storyStorage, promise) {
            storyStorage.storage = {};
            promise.resolve();
        });       
    };

    registerType(story.StorageTypes.IN_MEMORY, new MemoryStorage());

}(this.story = this.story || {}));