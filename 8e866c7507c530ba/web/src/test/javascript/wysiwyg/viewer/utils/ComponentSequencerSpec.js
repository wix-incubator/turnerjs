describe('ComponentSequencer', function () {
    var sequencer;

    beforeEach(function () {
        var seqConstr = W.Classes.get('wysiwyg.viewer.utils.ComponentSequencer', function (seqConstr) {
            sequencer = new seqConstr;
        });
        if (seqConstr) {
            sequencer = new seqConstr;
        }
        waitsFor(function () {
            return sequencer !== undefined;
        });
    });

    describe('_createCompsFromDataList', function () {
        var dataList;
        var dataItemList;
        var container;
        var finished;
        var compSetupCount;
        var compSetupEvents;

        beforeEach(function () {
            dataList = [
                W.Data.addDataItemWithUniqueId('', { type: 'Text', text: 'RZA' }),
                W.Data.addDataItemWithUniqueId('', { type: 'Text', text: 'Mos Def' }),
                W.Data.addDataItemWithUniqueId('', { type: 'Text', text: 'Ghostface Killa' })
            ];
            dataItemList = dataList.map(function (item) {
                return item.dataObject;
            });
            container = new Element('div');
            finished = false;
            sequencer.addEvent('productionFinished', function () {
                finished = true;
            });
            compSetupCount = 0;
            compSetupEvents = [];
            sequencer.addEvent('componentSetup', function (payload) {
                compSetupCount++;
                compSetupEvents.push(payload);
            });
        });

        it('generates wysiwyg components by [comp] and [skin]', function () {
            sequencer.resolveItem = function (dataItem, index, value) {
                return { comp: 'wysiwyg.viewer.components.WRichText', skin: 'wysiwyg.viewer.skins.WRichTextSkin' };
            };
            sequencer._createCompsFromDataList(container, dataItemList);
            waitsFor(function () {
                return finished;
            });
            runs(function () {
                expect(container.children.length).toBe(3);
                expect(compSetupCount).toBe(3);
                Array.forEach(container.children, function (child, index) {
                    expect(child.getLogic().className).toBe('wysiwyg.viewer.components.WRichText');
                    expect(child.getLogic().getDataItem()).toBe(dataItemList[index]);
                });
            });
        });

        it('generates wysiwyg components as raw elements', function () {
            sequencer.resolveItem = function (dataItem, index, value) {
                return new Element('div', { signature: 'yo' });
            };
            sequencer._createCompsFromDataList(container, dataItemList);
            waitsFor(function () {
                return finished;
            });
            runs(function () {
                expect(container.children.length).toBe(3);
                expect(compSetupCount).toBe(3);
                Array.forEach(container.children, function (child, index) {
                    expect(child.getLogic).not.toBeUndefined();
                    expect(child.getLogic().getDataItem()).toBe(dataItemList[index]);
                    expect(child.getAttribute('signature')).toBe("yo");
                });
            });
        });

        it('generates wysiwyg components as a mix bunch', function () {
            sequencer.resolveItem = function (dataItem, index, value) {
                if (index == 1) {
                    return { comp: 'wysiwyg.viewer.components.WRichText', skin: 'wysiwyg.viewer.skins.WRichTextSkin' };
                }
                return new Element('div', { signature: 'yo' });
            };
            sequencer._createCompsFromDataList(container, dataItemList);
            waitsFor(function () {
                return finished;
            });
            runs(function () {
                expect(container.children.length).toBe(3);
                expect(compSetupCount).toBe(3);
                Array.forEach(container.children, function (child, index) {
                    expect(child.getLogic).not.toBeUndefined();
                    expect(child.getLogic().getDataItem()).toBe(dataItemList[index]);
                });
                expect(container.children[0].getAttribute('signature')).toBe("yo");
                expect(container.children[1].getLogic().className).toBe('wysiwyg.viewer.components.WRichText');
                expect(container.children[2].getAttribute('signature')).toBe("yo");
            });
        });

        it('reuses existing elements', function () {
            var toBeReused;
            sequencer.resolveItem = function (dataItem, index, value) {
                return { comp: 'wysiwyg.viewer.components.WRichText', skin: 'wysiwyg.viewer.skins.WRichTextSkin' };
            };
            sequencer._createCompsFromDataList(container, dataItemList);
            waitsFor(function () {
                return finished;
            });
            runs(function () {
                toBeReused = container.children[1];
                container.children[2].destroy();
                container.children[0].destroy();
                finished = false;
                compSetupCount = 0;
                compSetupEvents = [];
                sequencer._createCompsFromDataList(container, dataItemList);
            });
            waitsFor(function () {
                return finished;
            });
            runs(function () {
                expect(container.children.length).toBe(3);
                expect(compSetupCount).toBe(3);
                expect(toBeReused).toBe(container.children[1]);

                // The order of events is not important, the index is
                compSetupEvents = compSetupEvents.sort(function (a,b) {
                    return a.index - b.index;
                });
                expect(compSetupEvents[0]).toEqual({method:"create", compView: container.children[0], index:0 });
                expect(compSetupEvents[1]).toEqual({method:"reuse", compView: container.children[1], index:1 });
                expect(compSetupEvents[2]).toEqual({method:"create", compView: container.children[2], index:2 });
            });
        });
    });

    describe('_resolveRefList', function () {
        var resultList;
        var imageList;
        beforeEach(function () {
            imageList = [
                W.Data.addDataItemWithUniqueId('', { type: 'Image' }),
                W.Data.addDataItemWithUniqueId('', { type: 'Image' }),
                W.Data.addDataItemWithUniqueId('', { type: 'Image' })
            ];
        });

        it('basic request with array type', function () {
                var refList = imageList.map(function (item) {
                    return "#" + item.id
                });
                sequencer._resolveRefList(refList, function (dataList) {
                    resultList = dataList;
                });
                waitsFor(function () {
                    return resultList !== undefined;
                });
                runs(function () {
                    expect(resultList.length).toBe(3);
                    expect(resultList[0]).toEqual(imageList[0].dataObject);
                    expect(resultList[1]).toEqual(imageList[1].dataObject);
                    expect(resultList[2]).toEqual(imageList[2].dataObject);
                });
            }
        );
        it('empty request', function () {
                var resultList;
                sequencer._resolveRefList([], function (dataList) {
                    resultList = dataList;
                });
                waitsFor(function () {
                    return resultList !== undefined;
                });
                runs(function () {
                    expect(resultList.length).toBe(0);
                });
            }
        );
        it('basic request with List type', function () {
                var resultList;
                var listItem = W.Data.createDataItem({ type: 'ImageList', items: imageList.map(function (item) {
                    return item.dataObject
                })});
                sequencer._resolveRefList(listItem, function (dataList) {
                    resultList = dataList;
                });
                waitsFor(function () {
                    return resultList !== undefined;
                });
                runs(function () {
                    expect(resultList.length).toBe(3);
                    expect(resultList[0]).toEqual(imageList[0].dataObject);
                    expect(resultList[1]).toEqual(imageList[1].dataObject);
                    expect(resultList[2]).toEqual(imageList[2].dataObject);
                });
            }
        );
    });
});
