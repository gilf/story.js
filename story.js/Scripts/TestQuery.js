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
    }).items;
    for (var i = 0; i < items.length; i++) {
        console.log(items[i].key + ' ' + items[i].value);
    }
}, function (error) {
    console.log(error);
});