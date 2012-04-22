/// <reference path="story.js" />
var factory = story.storage(story.StorageTypes.INDEXEDDB);
factory.createStore({
    name: "people",
    keyPath: undefined,
    autoInc: false,
    names: ["name", "email"],
    values: ["name", "email"],
    unique: [false, true]
}).then(function (storage) {
    console.log(storage);
    storage.add("key", "value").then(function (data) {
        console.log(data);
    }, function (error) {
        console.log(error);
    });
    storage.get("key").then(function (data) {
        console.log(data);
    }, function (error) {
        console.log(error);
    });
    storage.contains("key").then(function (data) {
        console.log(data);
    }, function (error) {
        console.log(error);
    });
    storage.update("key", "value1").then(function (data) {
        console.log(data);
    }, function (error) {
        console.log(error);
    });
    storage.remove("key").then(function (data) {
        console.log(data);
    }, function (error) {
        console.log(error);
    });
    storage.contains("key").then(function (data) {
        console.log(data);
    }, function (error) {
        console.log(error);
    });
    storage.clear().then(function (data) {
        console.log(data);
    }, function (error) {
        console.log(error);
    });
}, function (error) {
    console.log(error);
});