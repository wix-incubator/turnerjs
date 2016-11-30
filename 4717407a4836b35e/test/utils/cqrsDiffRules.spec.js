import { diffRules } from '../../src/utils/transformers/cqrsDiffRules';

describe('CQRS Commands diff rules', () => {

    describe('Checking Generic Update Prop', () => {

        it('should check changes for name property', () => {
            const oldName = 'name';
            const newName = 'new_name';

            expect(diffRules.name(oldName, newName)).toEqual(['updated', 'new_name']);
        });
        it('should be no change for same name', function () {
            const oldName = 'name';
            const newName = 'name';

            expect(diffRules.name(oldName, newName)).toBeFalsy();
            expect(diffRules.name()).toBeFalsy();
        });

    });

    describe('Checking quantity updates', () => {

        it('should check quantity decrement', () => {
            const oldVal = 10;
            const newVal = 5;

            expect(diffRules.quantity(oldVal, newVal)).toEqual(['dec', oldVal - newVal]);
        });

        it('should check quantity increment', () => {
            const oldVal = 5;
            const newVal = 10;

            expect(diffRules.quantity(oldVal, newVal)).toEqual(['inc', newVal - oldVal]);
        });

        it('should be no changes for same quantity', () => {
            const oldVal = 10;
            const newVal = 10;

            expect(diffRules.quantity(oldVal, newVal)).toBeFalsy();
            expect(diffRules.quantity()).toBeFalsy();
        });

    });

    describe('Checking Collection manipulations with genericArrayDiff', () => {

        it('should check for new collections items', () => {

            const oldCollections = [
                {id: 'unic_0', name: 'first'},
                {id: 'unic_1', name: 'second'}
            ];

            const newCollections = [
                {id: 'unic_0', name: 'first'},
                {id: 'unic_1', name: 'second'},
                {id: 'unic_2', name: 'third'},
            ];

            expect(diffRules.collections(oldCollections, newCollections)).toEqual(
                [['added', {id: 'unic_2', name: 'third'}]]
            )
        });

        it('should check for deleted collections items', () => {

            const oldCollections = [
                {id: 'unic_0', name: 'first'},
                {id: 'unic_1', name: 'second'},
                {id: 'unic_2', name: 'third'}
            ];

            const newCollections = [
                {id: 'unic_0', name: 'first'},
                {id: 'unic_1', name: 'second'}
            ];

            expect(diffRules.collections(oldCollections, newCollections)).toEqual(
                [['deleted', {id: 'unic_2', name: 'third'}]]
            )
        });

    });

    describe('Checking Media manipulations with genericArrayDiff', () => {

        it('should check for updated Media items', () => {

            const oldMedia = [ { "url":"2", "title":"title" } ];
            const newMedia = [ { "url":"2", "title":"" } ];

            expect(diffRules.media(oldMedia, newMedia)).toEqual([['updated', newMedia[0]]]);
        });

        it('should check for deleted, added and updated Media items', () => {

            const oldMedia = [ { "url":"2", "title":"title" }, { "url":"1", "title":"title" } ];
            const newMedia = [ { "url":"2", "title":"" }, { "url":"3", "title":"title" }];

            const res = diffRules.media(oldMedia, newMedia);

            expect(res.map(i => i[0]).sort()).toEqual(['deleted', 'updated', 'added'].sort());
        });
    });

    describe('Checking grouped diff', () => {

        it('should get the difference for inventory structure, quantity', function () {
            const oldInventory = {
                quantity: 1,
                status: 'in_stock',
                trackingMethod: 'status'
            };

            const newInventory = {
                quantity: 2,
                status: 'in_stock',
                trackingMethod: 'status'
            };

            expect(diffRules.inventory(oldInventory, newInventory)).toEqual({
                quantity: ['inc', 1]
            })

        });

        it('should get the difference for inventory structure, all fields', function () {
            const oldInventory = {
                quantity: 1,
                status: 'in_stock',
                trackingMethod: 'status',
                someRemovedProp: 1,

            };

            const newInventory = {
                quantity: 0,
                status: 'out_of_stock',
                trackingMethod: 'quantity',
                someAddedProp: 1,
            };

            expect(diffRules.inventory(oldInventory, newInventory)).toEqual({
                quantity: ['dec', 1],
                status: ['updated', 'out_of_stock'],
                trackingMethod: ['updated', 'quantity'],
                someAddedProp: ['added', 1],
                someRemovedProp: ['deleted', 1]
            })

        });


        it('should get the difference for managedProductItems structure', function () {
            const oldManagedProductItems = {
                0: {
                    inventory: {
                        quantity: 0,
                        status: "in_stock"
                    },
                    optionsSelections: [1, 2],
                    visibility: 'visible'
                },
                1: {
                    inventory: {
                        quantity: 0,
                        status: "in_stock"
                    },
                    optionsSelections: [1, 3],
                    visibility: 'visible'
                }
            };

            const newManagedProductItems = {
                0: {
                    inventory: {
                        quantity: 1,
                        status: "in_stock"
                    },
                    optionsSelections: [1, 2],
                    visibility: 'visible'
                },
                1: {
                    inventory: {
                        quantity: 2,
                        status: "out_of_stock"
                    },
                    optionsSelections: [1, 3],
                    visibility: 'visible'
                },
                2: {
                    inventory: {
                        quantity: 1,
                        status: "in_stock"
                    },
                    optionsSelections: [2, 2],
                    visibility: 'visible'
                }
            };

            expect(diffRules.managedProductItems(oldManagedProductItems, newManagedProductItems)).toEqual({
                '0': { inventory: { quantity: ['inc', 1] } },
                '1': { inventory: { quantity: ['inc', 2], status: ['updated', 'out_of_stock'] } },
                '2': { inventory: { quantity: ['inc', 1] } }
            })

        });

    });

});
