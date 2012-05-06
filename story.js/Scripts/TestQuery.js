/// <reference path="../story.js" />
/// <reference path="../story.query.js" />

var storage = story.storage(story.StorageTypes.IN_MEMORY);
storage.add("key1", "value1").then(function (data) {
}, function (error) {
});
storage.add("key2", "value2").then(function (data) {
}, function (error) {
});
storage.add("key3", "value3").then(function (data) {
}, function (error) {
});
storage.getAll().then(function (data) {
    var items = storage.query.from(data).where(function (item) {
        return item.key === "key2";
    }).forEach(function (item) {
        console.log(item.key + ' ' + item.value);
    });
}, function (error) {
    console.log(error);
});