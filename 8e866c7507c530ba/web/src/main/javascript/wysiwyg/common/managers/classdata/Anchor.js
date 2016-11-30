/**
 * Created by IntelliJ IDEA.
 * User: nadav
 * Date: 20/09/11
 * Time: 16:59
 * To change this template use File | Settings | File Templates.
 */
define.Class('wysiwyg.common.managers.classdata.Anchor', function(classDefinition){
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.fields({
        ANCHOR_TOP_TOP: 'TOP_TOP',
        ANCHOR_BOTTOM_TOP:'BOTTOM_TOP',
        ANCHOR_BOTTOM_BOTTOM: 'BOTTOM_BOTTOM',
        ANCHOR_BOTTOM_PARENT: 'BOTTOM_PARENT',
        ANCHOR_LOCK_BOTTOM: 'LOCK_BOTTOM',
        type: 'BOTTOM_TOP',
        distance: 0,
        topToTop: 0,
        locked: false,
        fromComp: null,
        toComp: null,
        originalValue: NaN
    });
});


