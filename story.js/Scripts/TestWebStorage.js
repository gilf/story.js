/// <reference path="../story.js" />
var storage = story.storage(story.StorageTypes.LOCAL_STORAGE);
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

var storage = story.storage(story.StorageTypes.SESSION_STORAGE);
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