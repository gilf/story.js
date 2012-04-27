/// <reference path="story.js" />
/// <referene path="scripts/Jasmine/jasmine-1.1.0/jasmine.js" />

var storage = story.storage(story.StorageTypes.COOKIE);

describe('Storage on cookie tester', function () {
    it('Adds \"key\" with \"value\" to cookie storage', function () {
        storage.add("key", "value").then(function (data) {
            expect(data).toBeDefined();
        }
        , function (error) {
            expect(error).toThrow(new Error("Error adding key to storage"));
        });

    });

    it('Get value by key named  \"key\" from cookie storage, expected to equals \"value\"', function () {
        storage.get("key").then(function (data) {
            expect(data).toEqual("value");
        }
        , function (error) {
            expect(error).toThrow(new Error("Error getting value from storage"));
        });

    });

    it('get whether  the storage contains \"key\" expected to be true', function () {
        storage.contains("key").then(function (data) {
            expect(data).toBeTruthy();
        }
        , function (error) {
            expect(error).toThrow(new Error("Error on contain function"));
        });

    });

    it('Updates the key named \"key\" in the storage to \"value1\"', function () {
        storage.update("key", "value1").then(function (data) {
            console.log(data);
            storage.get("key").then(function (data) {
                expect(data).toEqual("value1");
            }
        , function (error) {
            expect(error).toBeUndefined();
        });

        }, function (error) {
            expect(error).toThrow(new Error("Error updating storage"));
        });

    });


    it('Removes the key named \"key\" from the storage', function () {
        storage.remove("key").then(function (data) {
            storage.contains("key").then(function (data) {
                expect(data).toBeFalsy();
            })
        }
        , function (error) {
            expect(error).toThrow(new Error("Error removing"));
        }
        );

    });

    it('Clears all storage', function () {
        storage.clear().then(function (data) {

            expect(document.cookie).toEqual("");
        })
    }
        , function (error) {
            expect(error).toThrow(new Error("Error clearing storage"));
        }
        );

});

