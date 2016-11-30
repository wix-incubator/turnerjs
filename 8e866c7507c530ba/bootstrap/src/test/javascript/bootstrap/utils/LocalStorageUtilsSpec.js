describe("LocalStorageUtils", function() {

    testRequire().resources("W.Utils");
    var store = window.localStorage;
    var lsUtil;

    beforeEach(function() {
        store.clear();
        lsUtil = this.W.Utils.LocalStorageUtils;
    });

    afterEach(function () {
        store.clear();
    });

    it("should throw for empty keys", function () {
        var self = this;
        expect(function () { self.W.Utils.LocalStorageUtils.getItem(""); }).toThrow();
        expect(function () { self.W.Utils.LocalStorageUtils.setItem("", {}); }).toThrow();
        expect(function () { self.W.Utils.LocalStorageUtils.removeItem(""); }).toThrow();
    });

    it("should store data in the local storage", function () {
        var data = { local: "storage" };
        lsUtil.setItem("saveme", data);

        var fromStore = store.getItem("saveme");
        expect(fromStore).toEqual("{\"local\":\"storage\"}");
    });

    it("should retrieve data from the local storage", function () {
        var data = { local: "storage" };
        lsUtil.setItem("saveme", data);

        var fromUtil = lsUtil.getItem("saveme");
        expect(fromUtil).toEqual(data);
    });

    it("should remove specific items from the local storage", function () {
        var data1 = { v:1, local:"storage" };
        var data2 = { v:2, local:"storage" };
        var data3 = { v:3, local:"storage" };
        lsUtil.setItem("saveme1", data1);
        lsUtil.setItem("saveme2", data2);
        lsUtil.setItem("saveme3", data3);

        expect(store.length).toEqual(3);

        lsUtil.removeItem("saveme1");

        expect(store.length).toEqual(2);
        expect(store.getItem("saveme1")).toBeNull();
        expect(store.getItem("saveme2")).not.toBeNull();
        expect(store.getItem("saveme3")).not.toBeNull();

        lsUtil.removeItem("saveme3");

        expect(store.length).toEqual(1);
        expect(store.getItem("saveme1")).toBeNull();
        expect(store.getItem("saveme2")).not.toBeNull();
        expect(store.getItem("saveme3")).toBeNull();

        lsUtil.removeItem("saveme2");

        expect(store.length).toEqual(0);
        expect(store.getItem("saveme1")).toBeNull();
        expect(store.getItem("saveme2")).toBeNull();
        expect(store.getItem("saveme3")).toBeNull();
    });

    it("should clear the local storage", function () {
        var data1 = { v:1, local:"storage" };
        var data2 = { v:2, local:"storage" };
        var data3 = { v:3, local:"storage" };
        lsUtil.setItem("saveme1", data1);
        lsUtil.setItem("saveme2", data2);
        lsUtil.setItem("saveme3", data3);

        expect(store.length).toEqual(3);

        lsUtil.clear();

        expect(store.length).toEqual(0);
        expect(store.getItem("saveme1")).toBeNull();
        expect(store.getItem("saveme2")).toBeNull();
        expect(store.getItem("saveme3")).toBeNull();
    });

    it("should return the current number of items in the local storage", function () {
        var data1 = { v:1, local:"storage" };
        var data2 = { v:2, local:"storage" };
        var data3 = { v:3, local:"storage" };

        lsUtil.setItem("saveme1", data1);
        expect(lsUtil.getLength()).toEqual(1);

        lsUtil.setItem("saveme2", data2);
        expect(lsUtil.getLength()).toEqual(2);

        lsUtil.setItem("saveme3", data3);
        expect(lsUtil.getLength()).toEqual(3);

        lsUtil.removeItem("saveme1");
        expect(lsUtil.getLength()).toEqual(2);

        lsUtil.removeItem("saveme1");
        expect(lsUtil.getLength()).toEqual(2);

        lsUtil.removeItem("saveme3");
        expect(lsUtil.getLength()).toEqual(1);

        lsUtil.removeItem("saveme2");
        expect(lsUtil.getLength()).toEqual(0);
    });

});