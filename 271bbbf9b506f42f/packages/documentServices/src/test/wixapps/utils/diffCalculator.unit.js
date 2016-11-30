define([
	'documentServices/dataAccessLayer/wixImmutable',
	'documentServices/wixapps/utils/diffCalculator'
], function (wixImmutable, diffCalculator) {
    'use strict';

	describe('diffCalculator', function () {
        describe('getItemsDiff', function () {
            it('no changes without items', function () {
	            var result = diffCalculator.getItemsDiff(wixImmutable.fromJS({}), wixImmutable.fromJS({}));
                expect(result.created).toEqual([]);
                expect(result.updated).toEqual([]);
                expect(result.deleted).toEqual([]);
            });

            it('no changes with items', function () {
	            var items = wixImmutable.fromJS({
                    typeId1: {
                        item1: {
                            _iid: "item1",
                            title: "Room 1"
                        }
                    }
	            });
                var result = diffCalculator.getItemsDiff(items, items);
                expect(result.created).toEqual([]);
                expect(result.updated).toEqual([]);
                expect(result.deleted).toEqual([]);
            });

            it('item was added', function () {
	            var items = wixImmutable.fromJS({
                    typeId1: {
	                    item1: {
		                    _iid: "item1",
		                    title: "Room 1"
	                    }
                    }
	            });
	            var result = diffCalculator.getItemsDiff(wixImmutable.fromJS({}), items);
	            expect(result.created).toEqual([items.toJS().typeId1.item1]);
                expect(result.updated).toEqual([]);
                expect(result.deleted).toEqual([]);
            });

            it('item was deleted', function () {
	            var items = wixImmutable.fromJS({
                    typeId1: {
	                    item1: {
		                    _iid: "item1",
		                    title: "Room 1"
	                    }
                    }
	            });
	            var result = diffCalculator.getItemsDiff(items, wixImmutable.fromJS({}));
                expect(result.created).toEqual([]);
                expect(result.updated).toEqual([]);
	            expect(result.deleted).toEqual([items.getIn(['typeId1', 'item1', '_iid'])]);
            });

            it('item was changed', function () {
	            var itemsBefore = wixImmutable.fromJS({
                    typeId1: {
                        item1: {
                            _iid: "item1",
                            title: "Room 1"
                        }
                    }
	            });
	            var itemsAfter = wixImmutable.fromJS({
                    typeId1: {
                        item1: {
	                        _iid: "item1",
	                        title: "Room 11"
                        }
                    }
	            });
                var result = diffCalculator.getItemsDiff(itemsBefore, itemsAfter);
                expect(result.created).toEqual([]);
	            expect(result.updated).toEqual([itemsAfter.toJS().typeId1.item1]);
                expect(result.deleted).toEqual([]);
            });

            it('item was changed, but only an ignored field', function () {
	            var itemsBefore = wixImmutable.fromJS({
                    typeId1: {
                        item1: {
                            _iid: "item1",
                            title: "Room 1",
                            ignore: "x"
                        }
                    }
	            });
	            var itemsAfter = wixImmutable.fromJS({
                    typeId1: {
                        item1: {
                            _iid: "item1",
                            title: "Room 1",
                            ignore: "y"
                        }
                    }
	            });
                var result = diffCalculator.getItemsDiff(itemsBefore, itemsAfter, ['ignore']);
                expect(result.created).toEqual([]);
                expect(result.updated).toEqual([]);
                expect(result.deleted).toEqual([]);
            });

            it('item was changed, and a transform function was provided', function () {
	            var itemsBefore = wixImmutable.fromJS({
                    typeId1: {
                        item1: {
                            _iid: "item1",
                            title: "Room 1"
                        }
                    }
	            });
	            var itemsAfter = wixImmutable.fromJS({
                    typeId1: {
                        item1: {
                            _iid: "item1",
                            title: "Room 11"
                        }
                    }
	            });

                function transformFunc(itemBefore, itemAfter) {
                    itemAfter.title += itemBefore.title;
                    return itemAfter;
                }

                var expected = {
                    _iid: "item1",
                    title: "Room 11Room 1"
                };

                var result = diffCalculator.getItemsDiff(itemsBefore, itemsAfter, [], transformFunc);
                expect(result.created).toEqual([]);
                expect(result.updated).toEqual([expected]);
                expect(result.deleted).toEqual([]);
            });

            it('one item was changed, one created, and one deleted', function () {
	            var itemsBefore = wixImmutable.fromJS({
                    typeId1: {
                        item1: {
                            _iid: "item1",
                            title: "Room 1"
                        },
                        item2: {
                            _iid: "item2",
                            title: "Room 2"
                        }
                    }
	            });
	            var itemsAfter = wixImmutable.fromJS({
                    typeId1: {
                        item1: {
                            _iid: "item1",
                            title: "Room 11"
                        },
                        item3: {
                            _iid: "item3",
                            title: "Room 3"
                        }
                    }
	            });
                var result = diffCalculator.getItemsDiff(itemsBefore, itemsAfter);
	            expect(result.created).toEqual([itemsAfter.toJS().typeId1.item3]);
	            expect(result.updated).toEqual([itemsAfter.toJS().typeId1.item1]);
	            expect(result.deleted).toEqual([itemsBefore.getIn(['typeId1', 'item2', '_iid'])]);
            });

            it('two items from one type were delete, and two items from another type were created', function () {
	            var itemsBefore = wixImmutable.fromJS({
                    typeId1: {
                        item1: {
                            _iid: "item1",
                            title: "Room 1"
                        },
                        item2: {
                            _iid: "item2",
                            title: "Room 2"
                        }
                    }
	            });
	            var itemsAfter = wixImmutable.fromJS({
                    typeId2: {
                        item3: {
                            _iid: "item3",
                            title: "Room 3"
                        },
                        item4: {
                            _iid: "item4",
                            title: "Room 4"
                        }
                    }
	            });
                var result = diffCalculator.getItemsDiff(itemsBefore, itemsAfter);
	            expect(result.created).toEqual([itemsAfter.toJS().typeId2.item3, itemsAfter.toJS().typeId2.item4]);
                expect(result.updated).toEqual([]);
	            expect(result.deleted).toEqual([itemsBefore.getIn(['typeId1', 'item1', '_iid']), itemsBefore.getIn(['typeId1', 'item2', '_iid'])]);
            });

            it('one out of two items in one type was updated, andtwo items from another type were created', function () {
	            var itemsBefore = wixImmutable.fromJS({
                    typeId1: {
                        item1: {
                            _iid: "item1",
                            title: "Room 1"
                        },
                        item2: {
                            _iid: "item2",
                            title: "Room 2"
                        }
                    }
	            });
	            var itemsAfter = wixImmutable.fromJS({
                    typeId1: {
                        item1: {
                            _iid: "item1",
                            title: "Room 1"
                        },
                        item2: {
                            _iid: "item2",
                            title: "Room 22"
                        }
                    },
                    typeId2: {
                        item3: {
                            _iid: "item3",
                            title: "Room 3"
                        },
                        item4: {
                            _iid: "item4",
                            title: "Room 4"
                        }
                    }
	            });
                var result = diffCalculator.getItemsDiff(itemsBefore, itemsAfter);
	            expect(result.created).toEqual([itemsAfter.toJS().typeId2.item3, itemsAfter.toJS().typeId2.item4]);
	            expect(result.updated).toEqual([itemsAfter.toJS().typeId1.item2]);
                expect(result.deleted).toEqual([]);
            });
        });
    });
});