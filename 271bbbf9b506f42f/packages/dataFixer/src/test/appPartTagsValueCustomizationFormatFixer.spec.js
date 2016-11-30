define([
    'dataFixer/plugins/appPartTagsValueCustomizationFormatFixer'
], function (
    appPartTagsValueCustomizationFormatFixer
) {
    'use strict';

    describe('appPartTagsValueCustomizationFormatFixer', function () {
        it('should change format of tags-value customizations from desktop to common', function () {
            this.expectInputTransformation({
                data: {
                    document_data: {
                        appPart: {
                            appLogicCustomizations: [
                                this.createTagsValueCustomizationWithFormat(this.Format.DESKTOP)
                            ],
                            type: this.APP_PART_TYPE
                        }
                    }
                }
            }, {
                data: {
                    document_data: {
                        appPart: {
                            appLogicCustomizations: [
                                this.createTagsValueCustomizationWithFormat(this.Format.COMMON)
                            ],
                            type: this.APP_PART_TYPE
                        }
                    }
                }
            });

            this.expectInputTransformation({
                data: {
                    document_data: {
                        otherAppPart: {
                            appLogicCustomizations: [
                                this.createTagsValueCustomizationWithFormat(this.Format.DESKTOP)
                            ],
                            type: this.APP_PART_TYPE
                        }
                    }
                }
            }, {
                data: {
                    document_data: {
                        otherAppPart: {
                            appLogicCustomizations: [
                                this.createTagsValueCustomizationWithFormat(this.Format.COMMON)
                            ],
                            type: this.APP_PART_TYPE
                        }
                    }
                }
            });

            this.expectInputTransformation({
                data: {
                    document_data: {
                        appPart: {
                            appLogicCustomizations: [
                                this.createTagsValueCustomizationWithFormat(this.Format.DESKTOP),
                                this.createTagsValueCustomizationWithFormat(this.Format.DESKTOP),
                                this.createTagsValueCustomizationWithFormat(this.Format.DESKTOP)
                            ],
                            type: this.APP_PART_TYPE
                        }
                    }
                }
            }, {
                data: {
                    document_data: {
                        appPart: {
                            appLogicCustomizations: [
                                this.createTagsValueCustomizationWithFormat(this.Format.COMMON),
                                this.createTagsValueCustomizationWithFormat(this.Format.COMMON),
                                this.createTagsValueCustomizationWithFormat(this.Format.COMMON)
                            ],
                            type: this.APP_PART_TYPE
                        }
                    }
                }
            });

            this.expectInputTransformation({
                data: {
                    document_data: {
                        appPart: {
                            appLogicCustomizations: [
                                this.createTagsValueCustomizationWithFormat(this.Format.DESKTOP),
                                this.createNonTagsValueCustomizationWithFormat(this.Format.DESKTOP)
                            ],
                            type: this.APP_PART_TYPE
                        },
                        otherAppPart: {
                            appLogicCustomizations: [
                                this.createNonTagsValueCustomizationWithFormat(this.Format.DESKTOP),
                                this.createTagsValueCustomizationWithFormat(this.Format.DESKTOP)
                            ],
                            type: this.APP_PART_TYPE
                        }
                    }
                }
            }, {
                data: {
                    document_data: {
                        appPart: {
                            appLogicCustomizations: [
                                this.createTagsValueCustomizationWithFormat(this.Format.COMMON),
                                this.createNonTagsValueCustomizationWithFormat(this.Format.DESKTOP)
                            ],
                            type: this.APP_PART_TYPE
                        },
                        otherAppPart: {
                            appLogicCustomizations: [
                                this.createNonTagsValueCustomizationWithFormat(this.Format.DESKTOP),
                                this.createTagsValueCustomizationWithFormat(this.Format.COMMON)
                            ],
                            type: this.APP_PART_TYPE
                        }
                    }
                }
            });
        });

        it('should not change format of tags-value customizations from non-desktop to common', function () {
            this.expectInputTransformation({
                data: {
                    document_data: {
                        appPart: {
                            appLogicCustomizations: [
                                this.createTagsValueCustomizationWithFormat(this.Format.MOBILE)
                            ],
                            type: this.APP_PART_TYPE
                        }
                    }
                }
            }, {
                data: {
                    document_data: {
                        appPart: {
                            appLogicCustomizations: [
                                this.createTagsValueCustomizationWithFormat(this.Format.MOBILE)
                            ],
                            type: this.APP_PART_TYPE
                        }
                    }
                }
            });
        });

        it('should not change format of non-tags-value customizations', function () {
            this.expectInputTransformation({
                data: {
                    document_data: {
                        appPart: {
                            appLogicCustomizations: [
                                this.createNonTagsValueCustomizationWithFormat(this.Format.DESKTOP)
                            ],
                            type: this.APP_PART_TYPE
                        }
                    }
                }
            }, {
                data: {
                    document_data: {
                        appPart: {
                            appLogicCustomizations: [
                                this.createNonTagsValueCustomizationWithFormat(this.Format.DESKTOP)
                            ],
                            type: this.APP_PART_TYPE
                        }
                    }
                }
            });
        });

        it('should ignore non-app-part components', function () {
            this.expectInputTransformation({
                data: {
                    document_data: {
                        appPart: {
                            appLogicCustomizations: [
                                this.createTagsValueCustomizationWithFormat(this.Format.DESKTOP)
                            ],
                            type: this.NON_APP_PART_TYPE
                        }
                    }
                }
            }, {
                data: {
                    document_data: {
                        appPart: {
                            appLogicCustomizations: [
                                this.createTagsValueCustomizationWithFormat(this.Format.DESKTOP)
                            ],
                            type: this.NON_APP_PART_TYPE
                        }
                    }
                }
            });
        });

        it('should not break if there is a null customization', function () {
            this.expectInputTransformation({
                data: {
                    document_data: {
                        appPart: {
                            appLogicCustomizations: [null],
                            type: this.APP_PART_TYPE
                        }
                    }
                }
            }, {
                data: {
                    document_data: {
                        appPart: {
                            appLogicCustomizations: [null],
                            type: this.APP_PART_TYPE
                        }
                    }
                }
            });
        });

        beforeEach(function () {
            this.expectInputTransformation = function (input, inputAfterTransformation) {
                appPartTagsValueCustomizationFormatFixer.exec(input);
                expect(input).toEqual(inputAfterTransformation);
            };

            this.createTagsValueCustomizationWithFormat = function (format) {
                return {
                    fieldId: 'tagsValue',
                    forType: 'Post',
                    format: format,
                    key: 'value',
                    type: 'AppPartCustomization',
                    view: 'SinglePostMediaTop'
                };
            };

            this.createNonTagsValueCustomizationWithFormat = function (format) {
                return {
                    fieldId: 'G3qC',
                    forType: 'J3MQ3N',
                    format: format,
                    key: 'NEi9T',
                    mode: 'i52z',
                    type: 'SKwcc',
                    value: 'TDvLkT3jn'
                };
            };

            this.Format = {
                COMMON: '*',
                DESKTOP: '',
                MOBILE: 'Mobile'
            };

            this.APP_PART_TYPE = 'AppPart';
            this.NON_APP_PART_TYPE = 'NonAppPart';
        });
    });
});
