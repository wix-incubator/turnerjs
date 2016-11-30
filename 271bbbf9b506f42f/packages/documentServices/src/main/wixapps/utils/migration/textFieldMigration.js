define(["lodash", "wixappsCore"], function (_, wixappsCore) {
    'use strict';

    var compPropsToRemove = ['color', 'backgroundColor', 'bold', 'italic', 'lineThrough', 'underline', 'fontSize', 'line-height', 'fontFamily'];
    var layoutPath = 'comp.items.0.layout'.split('.');


    function getDataWithDefaultStyleForRichText(viewDef, data, partVersion, additionalStyle) {
        return wixappsCore.richTextUtils.getDataWithDefaultStyleForRichText(
            _.partialRight(wixappsCore.viewsUtils.getCompProp, viewDef),
            data,
            undefined,
            partVersion,
            additionalStyle);
    }

    function deleteCompProps(viewDef) {
        var compDef = _.get(viewDef, 'comp.items[0].comp');
        _.forEach(compPropsToRemove, function (compProp) {
            delete compDef[compProp];
        });
    }

    function deleteTextAlign(viewDef) {
        var layout = _.get(viewDef, layoutPath);
        if (layout) {
            delete layout['text-align'];
        }
    }

    function migrateViewDef(viewDef) {
        deleteCompProps(viewDef);
        deleteTextAlign(viewDef);
        return viewDef;
    }

    function migrate(textFieldDef, mobileTextFieldDef, fieldInItemsMap, partVersion) {
        var textAlign = _.get(textFieldDef, layoutPath.concat('text-align'));
        var additionalStyle = textAlign ? 'text-align:' + textAlign : '';
        var newData = _.mapValues(fieldInItemsMap, function (item) {
            return _.mapValues(item, function (data) {
                var newText = getDataWithDefaultStyleForRichText(_.get(textFieldDef, 'comp.items[0]'), data, partVersion, additionalStyle);
                return _.defaults({text: newText}, data);
            });
        });
        return {
            data: newData,
            viewDef: migrateViewDef(textFieldDef),
            mobileViewDef: migrateViewDef(mobileTextFieldDef)
        };
    }

    return {
        compPropsToRemove: compPropsToRemove,
        migrate: migrate
    };
});
