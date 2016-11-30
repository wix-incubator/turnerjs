define([
    'dataFixer/plugins/appPartReadMoreValueCustomizationFormatFixer',
    'coreUtils'
], function (
    fixer,
    coreUtils
) {

    'use strict';


    describe('appPartReadMoreValueCustomizationFormatFixer', function () {

        describe('getAppPartType', function () {

            it('should equal any Function', function () {
                expect(fixer.getAppPartType).toEqual(jasmine.any(Function));
            });


            describe('when called', function () {

                it('should return "AppPart"', function () {
                    expect(fixer.getAppPartType.call()).toBe('AppPart');
                });

            });

        });


        describe('getBlogFeedAppPartNames', function () {

            it('should equal any Function', function () {
                expect(fixer.getBlogFeedAppPartNames).toEqual(jasmine.any(Function));
            });


            describe('when called', function () {

                describe('return value', function () {

                    var returnValue;


                    beforeEach(function () {
                        returnValue = fixer.getBlogFeedAppPartNames.call();
                    });


                    it('should equal any Array', function () {
                        expect(returnValue).toEqual(jasmine.any(Array));
                    });


                    it('should contain blogAppPartNames.FEED', function () {
                        expect(returnValue).toContain(coreUtils.blogAppPartNames.FEED);
                    });


                    it('should contain blogAppPartNames.CUSTOM_FEED', function () {
                        expect(returnValue).toContain(coreUtils.blogAppPartNames.CUSTOM_FEED);
                    });

                });

            });

        });


        describe('getReadMoreValueCustomizationFieldId', function () {

            it('should equal any Function', function () {
                expect(fixer.getReadMoreValueCustomizationFieldId).toEqual(jasmine.any(Function));
            });


            describe('when called', function () {

                it('should return "ReadMoreBtn"', function () {
                    var returnValue = fixer.getReadMoreValueCustomizationFieldId.call();
                    expect(returnValue).toBe('ReadMoreBtn');
                });

            });

        });


        describe('getReadMoreValueCustomizationKey', function () {

            it('should equal any Function', function () {
                expect(fixer.getReadMoreValueCustomizationKey).toEqual(jasmine.any(Function));
            });


            describe('when called', function () {

                it('should return "value"', function () {
                    var returnValue = fixer.getReadMoreValueCustomizationKey.call();
                    expect(returnValue).toBe('value');
                });

            });

        });


        describe('getAffectedReadMoreValueCustomizationViews', function () {

            it('should equal any Function', function () {
                expect(fixer.getAffectedReadMoreValueCustomizationViews).toEqual(jasmine.any(Function));
            });

            describe('when called', function () {

                describe('return value', function () {

                    var returnValue;


                    beforeEach(function () {
                        returnValue = fixer.getAffectedReadMoreValueCustomizationViews.call();
                    });


                    it('should equal any Array', function () {
                        expect(returnValue).toEqual(jasmine.any(Array));
                    });


                    it('should contain "MediaLeft"', function () {
                        expect(returnValue).toContain('MediaLeft');
                    });


                    it('should contain "MediaLeftPage"', function () {
                        expect(returnValue).toContain('MediaLeftPage');
                    });


                    it('should contain "MediaRight"', function () {
                        expect(returnValue).toContain('MediaRight');
                    });


                    it('should contain "MediaRightPage"', function () {
                        expect(returnValue).toContain('MediaRightPage');
                    });


                    it('should contain "MediaZigzag"', function () {
                        expect(returnValue).toContain('MediaZigzag');
                    });


                    it('should contain "MediaZigzagPage"', function () {
                        expect(returnValue).toContain('MediaZigzagPage');
                    });


                    it('should contain "Masonry"', function () {
                        expect(returnValue).toContain('Masonry');
                    });


                    it('should contain "MasonryPage"', function () {
                        expect(returnValue).toContain('MasonryPage');
                    });

                });

            });

        });


        describe('exec', function () {

            it('should equal any Function', function () {
                expect(fixer.exec).toEqual(jasmine.any(Function));
            });


            describe('when called', function () {

                var affectedReadMoreValueCustomizationView;
                var appPartType;
                var blogFeedAppPartName;
                var pageJson;
                var readMoreValueCustomizationFieldId;
                var readMoreValueCustomizationKey;


                beforeEach(function () {
                    appPartType = fixer.getAppPartType();
                    blogFeedAppPartName = fixer.getBlogFeedAppPartNames()[0];

                    readMoreValueCustomizationFieldId = fixer.getReadMoreValueCustomizationFieldId();
                    readMoreValueCustomizationKey = fixer.getReadMoreValueCustomizationKey();
                    affectedReadMoreValueCustomizationView = fixer.getAffectedReadMoreValueCustomizationViews()[0];
                });


                describe('with page JSON having component data of blog feed app part(s) containing affected "read more" value customization(s)', function () {

                    it('should change the format of the affected customization(s) from "" to "*"', function () {
                        pageJson = {
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        };
                        fixer.exec.call(undefined, pageJson);
                        expect(pageJson).toEqual({
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '*',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        });

                        pageJson = {
                            data: {
                                document_data: {
                                    otherAppPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        };
                        fixer.exec.call(undefined, pageJson);
                        expect(pageJson).toEqual({
                            data: {
                                document_data: {
                                    otherAppPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '*',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        });

                        pageJson = {
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    },
                                    otherAppPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        };
                        fixer.exec.call(undefined, pageJson);
                        expect(pageJson).toEqual({
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '*',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    },
                                    otherAppPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '*',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        });

                        pageJson = {
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{}, {
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        };
                        fixer.exec.call(undefined, pageJson);
                        expect(pageJson).toEqual({
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{}, {
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '*',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        });

                        pageJson = {
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '',
                                            view: affectedReadMoreValueCustomizationView
                                        }, {}],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        };
                        fixer.exec.call(undefined, pageJson);
                        expect(pageJson).toEqual({
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '*',
                                            view: affectedReadMoreValueCustomizationView
                                        }, {}],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        });
                    });


                    it('should ignore component data whose type differs from one returned by getAppPartType', function () {
                        spyOn(fixer, 'getAppPartType').and.returnValue('OtherType');

                        pageJson = {
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        };
                        fixer.exec.call(undefined, pageJson);
                        expect(pageJson).toEqual({
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        });

                        pageJson = {
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: 'OtherType'
                                    }
                                }
                            }
                        };
                        fixer.exec.call(undefined, pageJson);
                        expect(pageJson).toEqual({
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '*',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: 'OtherType'
                                    }
                                }
                            }
                        });
                    });


                    it('should ignore component data whose app part name differs from ones returned by getBlogFeedAppPartNames', function () {
                        spyOn(fixer, 'getBlogFeedAppPartNames');

                        pageJson = {
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: 'AppPartName',
                                        type: appPartType
                                    }
                                }
                            }
                        };
                        fixer.getBlogFeedAppPartNames.and.returnValue(['OtherAppPartName']);
                        fixer.exec.call(undefined, pageJson);
                        expect(pageJson).toEqual({
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: 'AppPartName',
                                        type: appPartType
                                    }
                                }
                            }
                        });

                        pageJson = {
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: 'OtherAppPartName',
                                        type: appPartType
                                    }
                                }
                            }
                        };
                        fixer.getBlogFeedAppPartNames.and.returnValue(['OtherAppPartName']);
                        fixer.exec.call(undefined, pageJson);
                        expect(pageJson).toEqual({
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '*',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: 'OtherAppPartName',
                                        type: appPartType
                                    }
                                }
                            }
                        });

                        pageJson = {
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: 'AnotherAppPartName',
                                        type: appPartType
                                    }
                                }
                            }
                        };
                        fixer.getBlogFeedAppPartNames.and.returnValue(['AppPartName', 'AnotherAppPartName', 'OtherAppPartName']);
                        fixer.exec.call(undefined, pageJson);
                        expect(pageJson).toEqual({
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '*',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: 'AnotherAppPartName',
                                        type: appPartType
                                    }
                                }
                            }
                        });
                    });


                    it('should ignore customizations whose field ID differs from one returned by getReadMoreValueCustomizationFieldId', function () {
                        spyOn(fixer, 'getReadMoreValueCustomizationFieldId').and.returnValue('OtherFieldId');

                        pageJson = {
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: 'FieldId',
                                            key: readMoreValueCustomizationKey,
                                            format: '',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        };
                        fixer.exec.call(undefined, pageJson);
                        expect(pageJson).toEqual({
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: 'FieldId',
                                            key: readMoreValueCustomizationKey,
                                            format: '',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        });


                        pageJson = {
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: 'OtherFieldId',
                                            key: readMoreValueCustomizationKey,
                                            format: '',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        };
                        fixer.exec.call(undefined, pageJson);
                        expect(pageJson).toEqual({
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: 'OtherFieldId',
                                            key: readMoreValueCustomizationKey,
                                            format: '*',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        });
                    });


                    it('should ignore customizations whose key differs from one returned by getReadMoreValueCustomizationKey', function () {
                        spyOn(fixer, 'getReadMoreValueCustomizationKey').and.returnValue('OtherKey');

                        pageJson = {
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: 'Key',
                                            format: '',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        };
                        fixer.exec.call(undefined, pageJson);
                        expect(pageJson).toEqual({
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: 'Key',
                                            format: '',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        });


                        pageJson = {
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: 'OtherKey',
                                            format: '',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        };
                        fixer.exec.call(undefined, pageJson);
                        expect(pageJson).toEqual({
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: 'OtherKey',
                                            format: '*',
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        });
                    });


                    it('should ignore customizations whose format differs from ""', function () {
                        pageJson = {
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        };
                        fixer.exec.call(undefined, pageJson);
                        expect(pageJson).toEqual({
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            view: affectedReadMoreValueCustomizationView
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        });
                    });


                    it('should ignore customizations whose view differs from ones returned by getAffectedReadMoreValueCustomizationViews', function () {
                        spyOn(fixer, 'getAffectedReadMoreValueCustomizationViews');

                        pageJson = {
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '',
                                            view: 'View'
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        };
                        fixer.getAffectedReadMoreValueCustomizationViews.and.returnValue(['OtherView']);
                        fixer.exec.call(undefined, pageJson);
                        expect(pageJson).toEqual({
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '',
                                            view: 'View'
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        });

                        pageJson = {
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '',
                                            view: 'OtherView'
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        };
                        fixer.getAffectedReadMoreValueCustomizationViews.and.returnValue(['OtherView']);
                        fixer.exec.call(undefined, pageJson);
                        expect(pageJson).toEqual({
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '*',
                                            view: 'OtherView'
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        });

                        pageJson = {
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '',
                                            view: 'AnotherView'
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        };
                        fixer.getAffectedReadMoreValueCustomizationViews.and.returnValue(['View', 'AnotherView', 'OtherView']);
                        fixer.exec.call(undefined, pageJson);
                        expect(pageJson).toEqual({
                            data: {
                                document_data: {
                                    appPart: {
                                        appLogicCustomizations: [{
                                            fieldId: readMoreValueCustomizationFieldId,
                                            key: readMoreValueCustomizationKey,
                                            format: '*',
                                            view: 'AnotherView'
                                        }],
                                        appPartName: blogFeedAppPartName,
                                        type: appPartType
                                    }
                                }
                            }
                        });
                    });


                    describe('and the corresponding unaffected customization(s)', function () {

                        it('should drop the unaffected customization(s)', function () {
                            pageJson = {
                                data: {
                                    document_data: {
                                        appPart: {
                                            appLogicCustomizations: [{
                                                fieldId: readMoreValueCustomizationFieldId,
                                                key: readMoreValueCustomizationKey,
                                                format: '*',
                                                view: affectedReadMoreValueCustomizationView,
                                                value: 'Value'
                                            }, {
                                                fieldId: readMoreValueCustomizationFieldId,
                                                key: readMoreValueCustomizationKey,
                                                format: '',
                                                view: affectedReadMoreValueCustomizationView,
                                                value: 'OtherValue'
                                            }],
                                            appPartName: blogFeedAppPartName,
                                            type: appPartType
                                        }
                                    }
                                }
                            };
                            fixer.exec.call(undefined, pageJson);
                            expect(pageJson).toEqual({
                                data: {
                                    document_data: {
                                        appPart: {
                                            appLogicCustomizations: [{
                                                fieldId: readMoreValueCustomizationFieldId,
                                                key: readMoreValueCustomizationKey,
                                                format: '*',
                                                view: affectedReadMoreValueCustomizationView,
                                                value: 'OtherValue'
                                            }],
                                            appPartName: blogFeedAppPartName,
                                            type: appPartType
                                        }
                                    }
                                }
                            });

                            pageJson = {
                                data: {
                                    document_data: {
                                        appPart: {
                                            appLogicCustomizations: [{
                                                fieldId: 'OtherFieldId',
                                                key: readMoreValueCustomizationKey,
                                                format: '*',
                                                view: affectedReadMoreValueCustomizationView
                                            }, {
                                                fieldId: readMoreValueCustomizationFieldId,
                                                key: readMoreValueCustomizationKey,
                                                format: '',
                                                view: affectedReadMoreValueCustomizationView
                                            }],
                                            appPartName: blogFeedAppPartName,
                                            type: appPartType
                                        }
                                    }
                                }
                            };
                            fixer.exec.call(undefined, pageJson);
                            expect(pageJson).toEqual({
                                data: {
                                    document_data: {
                                        appPart: {
                                            appLogicCustomizations: [{
                                                fieldId: 'OtherFieldId',
                                                key: readMoreValueCustomizationKey,
                                                format: '*',
                                                view: affectedReadMoreValueCustomizationView
                                            }, {
                                                fieldId: readMoreValueCustomizationFieldId,
                                                key: readMoreValueCustomizationKey,
                                                format: '*',
                                                view: affectedReadMoreValueCustomizationView
                                            }],
                                            appPartName: blogFeedAppPartName,
                                            type: appPartType
                                        }
                                    }
                                }
                            });

                            pageJson = {
                                data: {
                                    document_data: {
                                        appPart: {
                                            appLogicCustomizations: [{
                                                fieldId: readMoreValueCustomizationFieldId,
                                                key: 'OtherKey',
                                                format: '*',
                                                view: affectedReadMoreValueCustomizationView
                                            }, {
                                                fieldId: readMoreValueCustomizationFieldId,
                                                key: readMoreValueCustomizationKey,
                                                format: '',
                                                view: affectedReadMoreValueCustomizationView
                                            }],
                                            appPartName: blogFeedAppPartName,
                                            type: appPartType
                                        }
                                    }
                                }
                            };
                            fixer.exec.call(undefined, pageJson);
                            expect(pageJson).toEqual({
                                data: {
                                    document_data: {
                                        appPart: {
                                            appLogicCustomizations: [{
                                                fieldId: readMoreValueCustomizationFieldId,
                                                key: 'OtherKey',
                                                format: '*',
                                                view: affectedReadMoreValueCustomizationView
                                            }, {
                                                fieldId: readMoreValueCustomizationFieldId,
                                                key: readMoreValueCustomizationKey,
                                                format: '*',
                                                view: affectedReadMoreValueCustomizationView
                                            }],
                                            appPartName: blogFeedAppPartName,
                                            type: appPartType
                                        }
                                    }
                                }
                            });

                            pageJson = {
                                data: {
                                    document_data: {
                                        appPart: {
                                            appLogicCustomizations: [{
                                                fieldId: readMoreValueCustomizationFieldId,
                                                key: readMoreValueCustomizationKey,
                                                format: '*',
                                                view: 'MediaLeftPage'
                                            }, {
                                                fieldId: readMoreValueCustomizationFieldId,
                                                key: readMoreValueCustomizationKey,
                                                format: '',
                                                view: affectedReadMoreValueCustomizationView
                                            }],
                                            appPartName: blogFeedAppPartName,
                                            type: appPartType
                                        }
                                    }
                                }
                            };
                            fixer.exec.call(undefined, pageJson);
                            expect(pageJson).toEqual({
                                data: {
                                    document_data: {
                                        appPart: {
                                            appLogicCustomizations: [{
                                                fieldId: readMoreValueCustomizationFieldId,
                                                key: readMoreValueCustomizationKey,
                                                format: '*',
                                                view: 'MediaLeftPage'
                                            }, {
                                                fieldId: readMoreValueCustomizationFieldId,
                                                key: readMoreValueCustomizationKey,
                                                format: '*',
                                                view: affectedReadMoreValueCustomizationView
                                            }],
                                            appPartName: blogFeedAppPartName,
                                            type: appPartType
                                        }
                                    }
                                }
                            });

                            pageJson = {
                                data: {
                                    document_data: {
                                        appPart: {
                                            appLogicCustomizations: [{
                                                fieldId: readMoreValueCustomizationFieldId,
                                                key: readMoreValueCustomizationKey,
                                                format: '*',
                                                view: affectedReadMoreValueCustomizationView
                                            }, {
                                                fieldId: readMoreValueCustomizationFieldId,
                                                key: readMoreValueCustomizationKey,
                                                format: '',
                                                view: affectedReadMoreValueCustomizationView
                                            }, {
                                                fieldId: readMoreValueCustomizationFieldId,
                                                key: readMoreValueCustomizationKey,
                                                format: '*',
                                                view: affectedReadMoreValueCustomizationView
                                            }],
                                            appPartName: blogFeedAppPartName,
                                            type: appPartType
                                        }
                                    }
                                }
                            };
                            fixer.exec.call(undefined, pageJson);
                            expect(pageJson).toEqual({
                                data: {
                                    document_data: {
                                        appPart: {
                                            appLogicCustomizations: [{
                                                fieldId: readMoreValueCustomizationFieldId,
                                                key: readMoreValueCustomizationKey,
                                                format: '*',
                                                view: affectedReadMoreValueCustomizationView
                                            }],
                                            appPartName: blogFeedAppPartName,
                                            type: appPartType
                                        }
                                    }
                                }
                            });
                        });

                    });

                });


                describe('with empty page JSON', function () {

                    it('should not throw', function () {
                        expect(function () {
                            fixer.exec.call(undefined, {});
                        }).not.toThrow();
                    });

                });


                describe('with page JSON that has no document data', function () {

                    it('should not throw', function () {
                        expect(function () {
                            fixer.exec.call(undefined, {data: {}});
                        }).not.toThrow();
                    });

                });


                describe('with page JSON having component data of blog feed app part(s) containing null in their customizations', function () {

                    it('should not throw', function () {
                        expect(function () {
                            fixer.exec.call(undefined, {
                                data: {
                                    document_data: {
                                        appPart: {
                                            appLogicCustomizations: [null],
                                            appPartName: blogFeedAppPartName,
                                            type: appPartType
                                        }
                                    }
                                }
                            });
                        }).not.toThrow();
                    });

                });

            });

        });

    });

});
