define(['documentServices/platform/services/viewerInfoChangedEmitter'], function (viewerInfoChangedEmitter) {
    'use strict';

    function setScari(ps, scari) {
        var pointer = ps.pointers.wixCode.getScari();
        ps.dal.set(pointer, scari);

        // TODO temp workaround. Should be emitted only to dataBinding app.
        viewerInfoChangedEmitter.emit(ps, {scari: scari});
    }

    function getScari(ps) {
        var pointer = ps.pointers.wixCode.getScari();
        return ps.dal.get(pointer);
    }

    function setGridAppId(ps, gridAppId) {
        var pointer = ps.pointers.wixCode.getGridAppId();
        ps.dal.set(pointer, gridAppId);
    }

    function getGridAppId(ps) {
        var pointer = ps.pointers.wixCode.getGridAppId();
        return ps.dal.get(pointer);
    }

    return {
        setScari: setScari,
        getScari: getScari,
        setGridAppId: setGridAppId,
        getGridAppId: getGridAppId
    };
});
