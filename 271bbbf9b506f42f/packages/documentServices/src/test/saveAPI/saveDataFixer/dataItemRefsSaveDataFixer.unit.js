define(['lodash',
    'documentServices/saveAPI/saveDataFixer/plugins/dataItemRefsSaveDataFixer',
    'documentServices/dataAccessLayer/wixImmutable',
    'documentServices/dataModel/DataSchemas.json',
    'documentServices/dataModel/DesignSchemas.json'
], function (_,
             dataItemRefsSaveDataFixer,
             wixImmutable,
             dataSchemas,
             designSchemas) {
    'use strict';

    describe('dataItemRefsSaveDataFixer', function () {

        describe('specs for Data', function () {

            var SCHEMA_MAP = {
                withoutRef: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string'
                        }
                    }
                },
                withRef: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string'
                        },
                        ref: {
                            type: 'ref'
                        },
                        someKey: {
                            'type': ['null', 'string'],
                            'default': null
                        }
                    }
                },
                withRefList: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string'
                        },
                        items: {
                            type: ['null', 'refList']
                        }
                    }

                }
            };

            beforeEach(function () {
                _.merge(dataSchemas, SCHEMA_MAP);
            });

            afterEach(function () {
                _.forEach(_.keys(SCHEMA_MAP), function (key) {
                    delete dataSchemas[key];
                });
            });

            function runFixer(dataToSave, lastSnapshot, currentSnapshot) {
                dataItemRefsSaveDataFixer.exec(dataToSave, wixImmutable.fromJS(lastSnapshot), wixImmutable.fromJS(currentSnapshot));
            }

            it('Should not change dataNodes in full save flow', function () {
                var dataToSave = {
                    dataDelta: {
                        document_data: {
                            data_1: {
                                id: 'data_1',
                                type: 'withoutRef'
                            }
                        }
                    }
                };

                var lastSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                document_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                var currentSnapshot = _.cloneDeep(lastSnapshot);

                runFixer(dataToSave, lastSnapshot, currentSnapshot);

                expect(_.size(dataToSave.dataDelta.document_data)).toEqual(1);
                expect(dataToSave.dataDelta.document_data.data_1).toBeDefined();
            });

            it('Should add data item that are referenced from existing data item', function () {
                var dataToSave = {
                    dataDelta: {
                        document_data: {
                            data_1: {
                                id: 'data_1',
                                type: 'withRef',
                                ref: '#data_2'
                            }
                        }
                    }
                };
                var lastSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                document_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRef',
                                        ref: '#data_3'
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withoutRef'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };
                var currentSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                document_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRef',
                                        ref: '#data_2'
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withoutRef'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                runFixer(dataToSave, lastSnapshot, currentSnapshot);

                expect(dataToSave.dataDelta.document_data).toEqual({
                    data_1: {
                        id: 'data_1',
                        type: 'withRef',
                        ref: '#data_2'
                    },
                    data_2: {
                        id: 'data_2',
                        type: 'withoutRef'
                    }
                });
            });

            it('Should add ref data items that is not exists in the old snapshot - code should not break', function () {
                var dataToSave = {
                    dataDelta: {
                        document_data: {
                            data_1: {
                                id: 'data_1',
                                type: 'withRef',
                                ref: '#data_2'
                            },
                            data_2: {
                                id: 'data_2',
                                type: 'withoutRef'
                            }
                        }
                    }
                };
                var lastSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                document_data: {}
                            }
                        }
                    }
                };
                var currentSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                document_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRef',
                                        ref: '#data_2'
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                runFixer(dataToSave, lastSnapshot, currentSnapshot);

                expect(dataToSave.dataDelta.document_data).toEqual({
                    data_1: {
                        id: 'data_1',
                        type: 'withRef',
                        ref: '#data_2'
                    },
                    data_2: {
                        id: 'data_2',
                        type: 'withoutRef'
                    }
                });
            });

            it('Should add ref data items if their page did not exist in last snapshot - code should not break', function () {
                var dataToSave = {
                    dataDelta: {
                        document_data: {
                            data_1: {
                                id: 'data_1',
                                type: 'withRef',
                                ref: '#data_2'
                            },
                            data_2: {
                                id: 'data_2',
                                type: 'withoutRef'
                            }
                        }
                    }
                };
                var lastSnapshot = {
                    pagesData: {
                        cpj1: {
                            data: {
                                document_data: {}
                            }
                        }
                    }
                };
                var currentSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                document_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRef',
                                        ref: '#data_2'
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                runFixer(dataToSave, lastSnapshot, currentSnapshot);

                expect(dataToSave.dataDelta.document_data).toEqual({
                    data_1: {
                        id: 'data_1',
                        type: 'withRef',
                        ref: '#data_2'
                    },
                    data_2: {
                        id: 'data_2',
                        type: 'withoutRef'
                    }
                });
            });

            it('Should not add ref data item if the ref has not changed', function () {
                var dataToSave = {
                    dataDelta: {
                        document_data: {
                            data_1: {
                                id: 'data_1',
                                type: 'withRef',
                                ref: '#data_2',
                                someKey: 'shraga'
                            }
                        }
                    }
                };

                var lastSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                document_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRef',
                                        ref: '#data_2',
                                        someKey: 'yehotam'
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withoutRef'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };
                var currentSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                document_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRef',
                                        ref: '#data_2',
                                        someKey: 'shraga'
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withoutRef'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                runFixer(dataToSave, lastSnapshot, currentSnapshot);

                expect(dataToSave.dataDelta.document_data).toEqual({
                    data_1: {
                        id: 'data_1',
                        type: 'withRef',
                        ref: '#data_2',
                        someKey: 'shraga'
                    }
                });
            });

            it('Should add data items recursively that are referenced from existing data item', function () {
                var dataToSave = {
                    dataDelta: {
                        document_data: {
                            data_1: {
                                id: 'data_1',
                                type: 'withRef',
                                ref: '#data_2'
                            }
                        }
                    }
                };

                var lastSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                document_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRef',
                                        ref: '#data_3'
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withRef',
                                        ref: '#data_4'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withoutRef'
                                    },
                                    data_4: {
                                        id: 'data_4',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                var currentSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                document_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRef',
                                        ref: '#data_2'
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withRef',
                                        ref: '#data_4'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withoutRef'
                                    },
                                    data_4: {
                                        id: 'data_4',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                runFixer(dataToSave, lastSnapshot, currentSnapshot);

                expect(dataToSave.dataDelta.document_data).toEqual({
                    data_1: {
                        id: 'data_1',
                        type: 'withRef',
                        ref: '#data_2'
                    },
                    data_2: {
                        id: 'data_2',
                        type: 'withRef',
                        ref: '#data_4'
                    },
                    data_4: {
                        id: 'data_4',
                        type: 'withoutRef'
                    }
                });
            });

            it('Should add data items recursively with that are referenced from existing ref list', function () {
                var dataToSave = {
                    dataDelta: {
                        document_data: {
                            data_1: {
                                id: 'data_1',
                                type: 'withRefList',
                                items: ['#data_2', '#data_4', '#data_6']
                            }
                        }
                    }
                };

                var lastSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                document_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRefList',
                                        items: ['#data_2', '#data_3']
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withRef',
                                        ref: '#data_21'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withRef',
                                        ref: '#data_31'
                                    },
                                    data_4: {
                                        id: 'data_4',
                                        type: 'withRef',
                                        ref: '#data_41'
                                    },
                                    data_6: {
                                        id: 'data_6',
                                        type: 'withRefList',
                                        items: ['#data_61', '#data_62']
                                    },
                                    data_21: {
                                        id: 'data_21',
                                        type: 'withoutRef'
                                    },
                                    data_31: {
                                        id: 'data_31',
                                        type: 'withoutRef'
                                    },
                                    data_41: {
                                        id: 'data_41',
                                        type: 'withoutRef'
                                    },
                                    data_61: {
                                        id: 'data_61',
                                        type: 'withoutRef'
                                    },
                                    data_62: {
                                        id: 'data_62',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                var currentSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                document_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRefList',
                                        items: ['#data_2', '#data_4', '#data_6']
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withRef',
                                        ref: '#data_21'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withRef',
                                        ref: '#data_31'
                                    },
                                    data_4: {
                                        id: 'data_4',
                                        type: 'withRef',
                                        ref: '#data_41'
                                    },
                                    data_6: {
                                        id: 'data_6',
                                        type: 'withRefList',
                                        items: ['#data_61', '#data_62']
                                    },
                                    data_21: {
                                        id: 'data_21',
                                        type: 'withoutRef'
                                    },
                                    data_31: {
                                        id: 'data_31',
                                        type: 'withoutRef'
                                    },
                                    data_41: {
                                        id: 'data_41',
                                        type: 'withoutRef'
                                    },
                                    data_61: {
                                        id: 'data_61',
                                        type: 'withoutRef'
                                    },
                                    data_62: {
                                        id: 'data_62',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                runFixer(dataToSave, lastSnapshot, currentSnapshot);

                expect(dataToSave.dataDelta.document_data).toEqual({
                    data_1: {
                        id: 'data_1',
                        type: 'withRefList',
                        items: ['#data_2', '#data_4', '#data_6']
                    },
                    data_4: {
                        id: 'data_4',
                        type: 'withRef',
                        ref: '#data_41'
                    },
                    data_6: {
                        id: 'data_6',
                        type: 'withRefList',
                        items: ['#data_61', '#data_62']
                    },
                    data_41: {
                        id: 'data_41',
                        type: 'withoutRef'
                    },
                    data_61: {
                        id: 'data_61',
                        type: 'withoutRef'
                    },
                    data_62: {
                        id: 'data_62',
                        type: 'withoutRef'
                    }
                });
            });

            it('Should not stuck in inifinte loop if there is a circular refs', function () {
                var dataToSave = {
                    dataDelta: {
                        document_data: {
                            data_1: {
                                id: 'data_1',
                                type: 'withRefList',
                                items: ['#data_2', '#data_4', '#data_6']
                            }
                        }
                    }
                };

                var lastSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                document_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRefList',
                                        items: ['#data_2', '#data_3']
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withRef',
                                        ref: '#data_21'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withRef',
                                        ref: '#data_31'
                                    },
                                    data_4: {
                                        id: 'data_4',
                                        type: 'withRef',
                                        ref: '#data_41'
                                    },
                                    data_6: {
                                        id: 'data_6',
                                        type: 'withRefList',
                                        items: ['#data_61', '#data_62']
                                    },
                                    data_21: {
                                        id: 'data_21',
                                        type: 'withoutRef'
                                    },
                                    data_31: {
                                        id: 'data_31',
                                        type: 'withoutRef'
                                    },
                                    data_41: {
                                        id: 'data_41',
                                        type: 'withoutRef'
                                    },
                                    data_61: {
                                        id: 'data_61',
                                        type: 'withoutRef'
                                    },
                                    data_62: {
                                        id: 'data_62',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                var currentSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                document_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRefList',
                                        items: ['#data_2', '#data_4', '#data_6']
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withRef',
                                        ref: '#data_21'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withRef',
                                        ref: '#data_31'
                                    },
                                    data_4: {
                                        id: 'data_4',
                                        type: 'withRef',
                                        ref: '#data_41'
                                    },
                                    data_6: {
                                        id: 'data_6',
                                        type: 'withRefList',
                                        items: ['#data_61', '#data_62']
                                    },
                                    data_21: {
                                        id: 'data_21',
                                        type: 'withoutRef'
                                    },
                                    data_31: {
                                        id: 'data_31',
                                        type: 'withoutRef'
                                    },
                                    data_41: {
                                        id: 'data_41',
                                        type: 'withoutRef'
                                    },
                                    data_61: {
                                        id: 'data_61',
                                        type: 'withoutRef'
                                    },
                                    data_62: {
                                        id: 'data_62',
                                        type: 'withRef',
                                        ref: '#data_4'
                                    }
                                }
                            }
                        }
                    }
                };

                runFixer(dataToSave, lastSnapshot, currentSnapshot);

                expect(dataToSave.dataDelta.document_data).toEqual({
                    data_1: {
                        id: 'data_1',
                        type: 'withRefList',
                        items: ['#data_2', '#data_4', '#data_6']
                    },
                    data_4: {
                        id: 'data_4',
                        type: 'withRef',
                        ref: '#data_41'
                    },
                    data_6: {
                        id: 'data_6',
                        type: 'withRefList',
                        items: ['#data_61', '#data_62']
                    },
                    data_41: {
                        id: 'data_41',
                        type: 'withoutRef'
                    },
                    data_61: {
                        id: 'data_61',
                        type: 'withoutRef'
                    },
                    data_62: {
                        id: 'data_62',
                        type: 'withRef',
                        ref: '#data_4'
                    }
                });
            });

            it('Should add data items that are referenced from pageBackgrounds key inside a page', function () {
                var dataToSave = {
                    dataDelta: {
                        document_data: {
                            data_1: {
                                id: 'data_1',
                                type: 'Page',
                                pageBackgrounds: {
                                    desktop: {
                                        ref: '#data_2'
                                    },
                                    mobile: {
                                        ref: '#data_3'
                                    }
                                }
                            }
                        }
                    }
                };

                var lastSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                document_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'Page',
                                        pageBackgrounds: {
                                            desktop: {
                                                ref: '#data_4'
                                            },
                                            mobile: {
                                                ref: '#data_5'
                                            }
                                        }
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withoutRef'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withoutRef'
                                    },
                                    data_4: {
                                        id: 'data_4',
                                        type: 'withoutRef'
                                    },
                                    data_5: {
                                        id: 'data_5',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                var currentSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                document_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'Page',
                                        pageBackgrounds: {
                                            desktop: {
                                                ref: '#data_2'
                                            },
                                            mobile: {
                                                ref: '#data_3'
                                            }
                                        }
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withoutRef'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withoutRef'
                                    },
                                    data_4: {
                                        id: 'data_4',
                                        type: 'withoutRef'
                                    },
                                    data_5: {
                                        id: 'data_5',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                runFixer(dataToSave, lastSnapshot, currentSnapshot);

                expect(dataToSave.dataDelta.document_data).toEqual({
                    data_1: {
                        id: 'data_1',
                        type: 'Page',
                        pageBackgrounds: {
                            desktop: {
                                ref: '#data_2'
                            },
                            mobile: {
                                ref: '#data_3'
                            }
                        }
                    },
                    data_2: {
                        id: 'data_2',
                        type: 'withoutRef'
                    },
                    data_3: {
                        id: 'data_3',
                        type: 'withoutRef'
                    }
                });
            });

            it('Should not break if ref data does not exist (CUSTOM_MENU_HEADER)', function () {
                var dataToSave = {
                    dataDelta: {
                        document_data: {
                            data_1: {
                                id: 'data_1',
                                type: 'withRef',
                                ref: '#data_2'
                            }
                        }
                    }
                };
                var lastSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                document_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRef',
                                        ref: '#data_3'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };
                var currentSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                document_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRef',
                                        ref: '#data_2'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                runFixer(dataToSave, lastSnapshot, currentSnapshot);

                expect(dataToSave.dataDelta.document_data).toEqual({
                    data_1: {
                        id: 'data_1',
                        type: 'withRef',
                        ref: '#data_2'
                    }
                });
            });

        });

        describe('specs for Design Data', function () {

            var SCHEMA_MAP = {
                withoutRef: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string'
                        }
                    }
                },
                withRef: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string'
                        },
                        ref: {
                            type: 'ref'
                        },
                        someKey: {
                            'type': ['null', 'string'],
                            'default': null
                        }
                    }
                },
                withRefList: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string'
                        },
                        items: {
                            type: ['null', 'refList']
                        }
                    }

                }
            };

            beforeEach(function () {
                _.merge(designSchemas, SCHEMA_MAP);
            });

            afterEach(function () {
                _.forEach(_.keys(SCHEMA_MAP), function (key) {
                    delete designSchemas[key];
                });
            });

            function runFixer(dataToSave, lastSnapshot, currentSnapshot) {
                dataItemRefsSaveDataFixer.exec(dataToSave, wixImmutable.fromJS(lastSnapshot), wixImmutable.fromJS(currentSnapshot));
            }

            it('Should not change dataNodes in full save flow - Design Data', function () {
                var dataToSave = {
                    dataDelta: {
                        design_data: {
                            data_1: {
                                id: 'data_1',
                                type: 'withoutRef'
                            }
                        }
                    }
                };

                var lastSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                design_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                var currentSnapshot = _.cloneDeep(lastSnapshot);

                runFixer(dataToSave, lastSnapshot, currentSnapshot);

                expect(_.size(dataToSave.dataDelta.design_data)).toEqual(1);
                expect(dataToSave.dataDelta.design_data.data_1).toBeDefined();
            });

            it('Should add data item that are referenced from existing data item - Design Data', function () {
                var dataToSave = {
                    dataDelta: {
                        design_data: {
                            data_1: {
                                id: 'data_1',
                                type: 'withRef',
                                ref: '#data_2'
                            }
                        }
                    }
                };
                var lastSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                design_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRef',
                                        ref: '#data_3'
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withoutRef'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };
                var currentSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                design_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRef',
                                        ref: '#data_2'
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withoutRef'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                runFixer(dataToSave, lastSnapshot, currentSnapshot);

                expect(dataToSave.dataDelta.design_data).toEqual({
                    data_1: {
                        id: 'data_1',
                        type: 'withRef',
                        ref: '#data_2'
                    },
                    data_2: {
                        id: 'data_2',
                        type: 'withoutRef'
                    }
                });
            });

            it('Should add ref data items that is not exists in the old snapshot - code should not break - Design Data', function () {
                var dataToSave = {
                    dataDelta: {
                        design_data: {
                            data_1: {
                                id: 'data_1',
                                type: 'withRef',
                                ref: '#data_2'
                            },
                            data_2: {
                                id: 'data_2',
                                type: 'withoutRef'
                            }
                        }
                    }
                };
                var lastSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                design_data: {}
                            }
                        }
                    }
                };
                var currentSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                design_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRef',
                                        ref: '#data_2'
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                runFixer(dataToSave, lastSnapshot, currentSnapshot);

                expect(dataToSave.dataDelta.design_data).toEqual({
                    data_1: {
                        id: 'data_1',
                        type: 'withRef',
                        ref: '#data_2'
                    },
                    data_2: {
                        id: 'data_2',
                        type: 'withoutRef'
                    }
                });
            });

            it('Should add ref data items if their page did not exist in last snapshot - code should not break - Design Data', function () {
                var dataToSave = {
                    dataDelta: {
                        design_data: {
                            data_1: {
                                id: 'data_1',
                                type: 'withRef',
                                ref: '#data_2'
                            },
                            data_2: {
                                id: 'data_2',
                                type: 'withoutRef'
                            }
                        }
                    }
                };
                var lastSnapshot = {
                    pagesData: {
                        cpj1: {
                            data: {
                                design_data: {}
                            }
                        }
                    }
                };
                var currentSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                design_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRef',
                                        ref: '#data_2'
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                runFixer(dataToSave, lastSnapshot, currentSnapshot);

                expect(dataToSave.dataDelta.design_data).toEqual({
                    data_1: {
                        id: 'data_1',
                        type: 'withRef',
                        ref: '#data_2'
                    },
                    data_2: {
                        id: 'data_2',
                        type: 'withoutRef'
                    }
                });
            });

            it('Should not add ref data item if the ref has not changed - Design Data', function () {
                var dataToSave = {
                    dataDelta: {
                        design_data: {
                            data_1: {
                                id: 'data_1',
                                type: 'withRef',
                                ref: '#data_2',
                                someKey: 'shraga'
                            }
                        }
                    }
                };

                var lastSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                design_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRef',
                                        ref: '#data_2',
                                        someKey: 'yehotam'
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withoutRef'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };
                var currentSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                design_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRef',
                                        ref: '#data_2',
                                        someKey: 'shraga'
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withoutRef'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                runFixer(dataToSave, lastSnapshot, currentSnapshot);

                expect(dataToSave.dataDelta.design_data).toEqual({
                    data_1: {
                        id: 'data_1',
                        type: 'withRef',
                        ref: '#data_2',
                        someKey: 'shraga'
                    }
                });
            });

            it('Should add data items recursively that are referenced from existing data item - Design Data', function () {
                var dataToSave = {
                    dataDelta: {
                        design_data: {
                            data_1: {
                                id: 'data_1',
                                type: 'withRef',
                                ref: '#data_2'
                            }
                        }
                    }
                };

                var lastSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                design_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRef',
                                        ref: '#data_3'
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withRef',
                                        ref: '#data_4'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withoutRef'
                                    },
                                    data_4: {
                                        id: 'data_4',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                var currentSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                design_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRef',
                                        ref: '#data_2'
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withRef',
                                        ref: '#data_4'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withoutRef'
                                    },
                                    data_4: {
                                        id: 'data_4',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                runFixer(dataToSave, lastSnapshot, currentSnapshot);

                expect(dataToSave.dataDelta.design_data).toEqual({
                    data_1: {
                        id: 'data_1',
                        type: 'withRef',
                        ref: '#data_2'
                    },
                    data_2: {
                        id: 'data_2',
                        type: 'withRef',
                        ref: '#data_4'
                    },
                    data_4: {
                        id: 'data_4',
                        type: 'withoutRef'
                    }
                });
            });

            it('Should add data items recursively with that are referenced from existing ref list - Design Data', function () {
                var dataToSave = {
                    dataDelta: {
                        design_data: {
                            data_1: {
                                id: 'data_1',
                                type: 'withRefList',
                                items: ['#data_2', '#data_4', '#data_6']
                            }
                        }
                    }
                };

                var lastSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                design_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRefList',
                                        items: ['#data_2', '#data_3']
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withRef',
                                        ref: '#data_21'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withRef',
                                        ref: '#data_31'
                                    },
                                    data_4: {
                                        id: 'data_4',
                                        type: 'withRef',
                                        ref: '#data_41'
                                    },
                                    data_6: {
                                        id: 'data_6',
                                        type: 'withRefList',
                                        items: ['#data_61', '#data_62']
                                    },
                                    data_21: {
                                        id: 'data_21',
                                        type: 'withoutRef'
                                    },
                                    data_31: {
                                        id: 'data_31',
                                        type: 'withoutRef'
                                    },
                                    data_41: {
                                        id: 'data_41',
                                        type: 'withoutRef'
                                    },
                                    data_61: {
                                        id: 'data_61',
                                        type: 'withoutRef'
                                    },
                                    data_62: {
                                        id: 'data_62',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                var currentSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                design_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRefList',
                                        items: ['#data_2', '#data_4', '#data_6']
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withRef',
                                        ref: '#data_21'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withRef',
                                        ref: '#data_31'
                                    },
                                    data_4: {
                                        id: 'data_4',
                                        type: 'withRef',
                                        ref: '#data_41'
                                    },
                                    data_6: {
                                        id: 'data_6',
                                        type: 'withRefList',
                                        items: ['#data_61', '#data_62']
                                    },
                                    data_21: {
                                        id: 'data_21',
                                        type: 'withoutRef'
                                    },
                                    data_31: {
                                        id: 'data_31',
                                        type: 'withoutRef'
                                    },
                                    data_41: {
                                        id: 'data_41',
                                        type: 'withoutRef'
                                    },
                                    data_61: {
                                        id: 'data_61',
                                        type: 'withoutRef'
                                    },
                                    data_62: {
                                        id: 'data_62',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                runFixer(dataToSave, lastSnapshot, currentSnapshot);

                expect(dataToSave.dataDelta.design_data).toEqual({
                    data_1: {
                        id: 'data_1',
                        type: 'withRefList',
                        items: ['#data_2', '#data_4', '#data_6']
                    },
                    data_4: {
                        id: 'data_4',
                        type: 'withRef',
                        ref: '#data_41'
                    },
                    data_6: {
                        id: 'data_6',
                        type: 'withRefList',
                        items: ['#data_61', '#data_62']
                    },
                    data_41: {
                        id: 'data_41',
                        type: 'withoutRef'
                    },
                    data_61: {
                        id: 'data_61',
                        type: 'withoutRef'
                    },
                    data_62: {
                        id: 'data_62',
                        type: 'withoutRef'
                    }
                });
            });

            it('Should not stuck in inifinte loop if there is a circular refs - Design Data', function () {
                var dataToSave = {
                    dataDelta: {
                        design_data: {
                            data_1: {
                                id: 'data_1',
                                type: 'withRefList',
                                items: ['#data_2', '#data_4', '#data_6']
                            }
                        }
                    }
                };

                var lastSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                design_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRefList',
                                        items: ['#data_2', '#data_3']
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withRef',
                                        ref: '#data_21'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withRef',
                                        ref: '#data_31'
                                    },
                                    data_4: {
                                        id: 'data_4',
                                        type: 'withRef',
                                        ref: '#data_41'
                                    },
                                    data_6: {
                                        id: 'data_6',
                                        type: 'withRefList',
                                        items: ['#data_61', '#data_62']
                                    },
                                    data_21: {
                                        id: 'data_21',
                                        type: 'withoutRef'
                                    },
                                    data_31: {
                                        id: 'data_31',
                                        type: 'withoutRef'
                                    },
                                    data_41: {
                                        id: 'data_41',
                                        type: 'withoutRef'
                                    },
                                    data_61: {
                                        id: 'data_61',
                                        type: 'withoutRef'
                                    },
                                    data_62: {
                                        id: 'data_62',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                var currentSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                design_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRefList',
                                        items: ['#data_2', '#data_4', '#data_6']
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withRef',
                                        ref: '#data_21'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withRef',
                                        ref: '#data_31'
                                    },
                                    data_4: {
                                        id: 'data_4',
                                        type: 'withRef',
                                        ref: '#data_41'
                                    },
                                    data_6: {
                                        id: 'data_6',
                                        type: 'withRefList',
                                        items: ['#data_61', '#data_62']
                                    },
                                    data_21: {
                                        id: 'data_21',
                                        type: 'withoutRef'
                                    },
                                    data_31: {
                                        id: 'data_31',
                                        type: 'withoutRef'
                                    },
                                    data_41: {
                                        id: 'data_41',
                                        type: 'withoutRef'
                                    },
                                    data_61: {
                                        id: 'data_61',
                                        type: 'withoutRef'
                                    },
                                    data_62: {
                                        id: 'data_62',
                                        type: 'withRef',
                                        ref: '#data_4'
                                    }
                                }
                            }
                        }
                    }
                };

                runFixer(dataToSave, lastSnapshot, currentSnapshot);

                expect(dataToSave.dataDelta.design_data).toEqual({
                    data_1: {
                        id: 'data_1',
                        type: 'withRefList',
                        items: ['#data_2', '#data_4', '#data_6']
                    },
                    data_4: {
                        id: 'data_4',
                        type: 'withRef',
                        ref: '#data_41'
                    },
                    data_6: {
                        id: 'data_6',
                        type: 'withRefList',
                        items: ['#data_61', '#data_62']
                    },
                    data_41: {
                        id: 'data_41',
                        type: 'withoutRef'
                    },
                    data_61: {
                        id: 'data_61',
                        type: 'withoutRef'
                    },
                    data_62: {
                        id: 'data_62',
                        type: 'withRef',
                        ref: '#data_4'
                    }
                });
            });

            it('Should add data items that are referenced from pageBackgrounds key inside a page - Design Data', function () {
                var dataToSave = {
                    dataDelta: {
                        design_data: {
                            data_1: {
                                id: 'data_1',
                                type: 'Page',
                                pageBackgrounds: {
                                    desktop: {
                                        ref: '#data_2'
                                    },
                                    mobile: {
                                        ref: '#data_3'
                                    }
                                }
                            }
                        }
                    }
                };

                var lastSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                design_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'Page',
                                        pageBackgrounds: {
                                            desktop: {
                                                ref: '#data_4'
                                            },
                                            mobile: {
                                                ref: '#data_5'
                                            }
                                        }
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withoutRef'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withoutRef'
                                    },
                                    data_4: {
                                        id: 'data_4',
                                        type: 'withoutRef'
                                    },
                                    data_5: {
                                        id: 'data_5',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                var currentSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                design_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'Page',
                                        pageBackgrounds: {
                                            desktop: {
                                                ref: '#data_2'
                                            },
                                            mobile: {
                                                ref: '#data_3'
                                            }
                                        }
                                    },
                                    data_2: {
                                        id: 'data_2',
                                        type: 'withoutRef'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withoutRef'
                                    },
                                    data_4: {
                                        id: 'data_4',
                                        type: 'withoutRef'
                                    },
                                    data_5: {
                                        id: 'data_5',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                runFixer(dataToSave, lastSnapshot, currentSnapshot);

                expect(dataToSave.dataDelta.design_data).toEqual({
                    data_1: {
                        id: 'data_1',
                        type: 'Page',
                        pageBackgrounds: {
                            desktop: {
                                ref: '#data_2'
                            },
                            mobile: {
                                ref: '#data_3'
                            }
                        }
                    },
                    data_2: {
                        id: 'data_2',
                        type: 'withoutRef'
                    },
                    data_3: {
                        id: 'data_3',
                        type: 'withoutRef'
                    }
                });
            });

            it('Should not break if ref data does not exist (CUSTOM_MENU_HEADER) - Design Data', function () {
                var dataToSave = {
                    dataDelta: {
                        design_data: {
                            data_1: {
                                id: 'data_1',
                                type: 'withRef',
                                ref: '#data_2'
                            }
                        }
                    }
                };
                var lastSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                design_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRef',
                                        ref: '#data_3'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };
                var currentSnapshot = {
                    pagesData: {
                        mainPage: {
                            data: {
                                design_data: {
                                    data_1: {
                                        id: 'data_1',
                                        type: 'withRef',
                                        ref: '#data_2'
                                    },
                                    data_3: {
                                        id: 'data_3',
                                        type: 'withoutRef'
                                    }
                                }
                            }
                        }
                    }
                };

                runFixer(dataToSave, lastSnapshot, currentSnapshot);

                expect(dataToSave.dataDelta.design_data).toEqual({
                    data_1: {
                        id: 'data_1',
                        type: 'withRef',
                        ref: '#data_2'
                    }
                });
            });

        });

    });

});
