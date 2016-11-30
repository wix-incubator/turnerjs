define([
    'definition!wixappsClassics/util/appPartCommonDataManager',
    'lodash'
], function (
    AppPartCommonDataManagerDefinition,
    _
) {
    'use strict';

    describe('appPartCommonDataManager', function () {
        it('should return undefined if data item is unset', function () {
            expect(this.getDataItem('id', 'key')).toBeUndefined();
        });

        it('should return set value of data item', function () {
            this.setDataItem('id', 'key', 'value');
            this.setDataItem('id', 'otherKey', 'otherValue');
            this.setDataItem('otherId', 'otherKey', 'value');
            expect(this.getDataItem('id', 'key')).toBe('value');
            expect(this.getDataItem('id', 'otherKey')).toBe('otherValue');
            expect(this.getDataItem('otherId', 'otherKey')).toBe('value');
        });

        it('should remove data for ID', function () {
            this.setDataItem('id', 'key', 'value');
            this.setDataItem('otherId', 'key', 'value');
            this.removeData('id');
            expect(this.getDataItem('id', 'key')).toBeUndefined();
            expect(this.getDataItem('otherId', 'key')).toBe('value');
        });

        it('should return default value if data item is unset', function () {
            this.setDataItem('id', 'otherKey', 'otherValue');
            expect(this.getDataItem('id', 'key', 'value')).toBe('value');
            expect(this.getDataItem('id', 'otherKey', 'value')).toBe('otherValue');
        });

        it('should return falsy value of data item instead of default one', function () {
            this.setDataItem('id', '""', '');
            expect(this.getDataItem('id', '""', 'value')).toBe('');

            this.setDataItem('id', '0', 0);
            expect(this.getDataItem('id', '0', 'value')).toBe(0);

            this.setDataItem('id', 'NaN', NaN);
            expect(isNaN(this.getDataItem('id', 'NaN', 'value'))).toBe(true);

            this.setDataItem('id', 'false', false);
            expect(this.getDataItem('id', 'false', 'value')).toBe(false);

            this.setDataItem('id', 'null', null);
            expect(this.getDataItem('id', 'null', 'value')).toBe(null);
        });

        beforeEach(function () {
            var appPartCommonDataManager = new AppPartCommonDataManagerDefinition(_);
            this.getDataItem = appPartCommonDataManager.getAppPartCommonDataItem;
            this.removeData = appPartCommonDataManager.removeAppPartCommonData;
            this.setDataItem = appPartCommonDataManager.setAppPartCommonDataItem;
        });
    });
});
