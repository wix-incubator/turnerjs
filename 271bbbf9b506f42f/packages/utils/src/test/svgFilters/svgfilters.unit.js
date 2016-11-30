define(['lodash', 'utils/svgFilters/svgFiltersTemplates', 'utils/svgFilters/svgFiltersGetters'], function (_, filters, getters) {
    'use strict';

    describe('Test svgFilters util', function () {

        describe('svgFiltersTemplates interface', function () {

            it('should have a masterTemplate', function () {
                expect(filters.masterTemplate).toEqual(jasmine.any(Function));
            });

            it('should have a templates list', function () {
                expect(filters.templates).toEqual(jasmine.any(Array));
            });

            describe('each filter', function () {
                _.forEach(filters.templates, function (filter) {
                    it('should have a "name" property as a string', function () {
                        expect(filter.name).toEqual(jasmine.any(String));
                    });

                    it('should have a template function', function () {
                        expect(filter.template).toEqual(jasmine.any(Function));
                    });

                    it('should either have no defaults or defaults should be an object', function () {
                        var isValidDefaults = _.isPlainObject(filter.defaults) || _.isUndefined(filter.defaults);
                        expect(isValidDefaults).toBeTruthy();
                    });
                });
            });

            it('name property should be unique', function () {
                var names = _.map(filters, 'name');
                expect(names).toEqual(_.uniq(names));
            });
        });

        describe('svgFilters.getFilter', function () {

            beforeEach(function () {
                this.templateSpy = jasmine.createSpy('template');
                this.masterTemplateSpy = jasmine.createSpy('masterTemplate');
                this.defaults = {'key': 'value'};
                this.mockFilters = {
                    masterTemplate: this.masterTemplateSpy,
                    templates: [{name: 'mock', defaults: this.defaults, template: this.templateSpy}]
                };
            });

            it('should throw error if filter not found', function () {
                var illegalFilterRequest = function () {
                    return getters.getFilter(this.mockFilters, '1', 'someFilter');
                };
                expect(illegalFilterRequest).toThrowError(TypeError);
            });

            it('should compile filter template', function () {
                getters.getFilter(this.mockFilters, '1', 'mock');
                expect(this.templateSpy).toHaveBeenCalled();
            });

            it('should compile the master filter template', function () {
                getters.getFilter(this.mockFilters, '1', 'mock');
                expect(this.masterTemplateSpy).toHaveBeenCalled();
            });

            it('should use the value in "defaults" inside the template', function () {
                getters.getFilter(this.mockFilters, '1', 'mock');
                expect(this.templateSpy).toHaveBeenCalledWith(this.defaults);
            });

            it('should override defaults if passed "overrides" object', function () {
                getters.getFilter(this.mockFilters, '1', 'mock', {'key': 'override'});
                expect(this.templateSpy).toHaveBeenCalledWith({'key': 'override'});
            });

        });

        describe('svgFilters.getFilterDefaults', function () {

            beforeEach(function () {
                this.defaults = {'key': 'value'};
                this.mockFilters = {
                    masterTemplate: function () {
                        return '';
                    },
                    templates: [
                        {
                            name: 'withDefaults',
                            defaults: this.defaults,
                            template: function () {
                                return '';
                            }
                        },
                        {
                            name: 'withoutDefaults',
                            template: function () {
                                return '';
                            }
                        }
                    ]
                };
            });

            it('should return a clone of the defaults object defined on a filter template', function () {
                var defaults = getters.getFilterDefaults(this.mockFilters, 'withDefaults');
                expect(defaults).toEqual(this.defaults);
                expect(defaults).not.toBe(this.defaults);
            });

            it('should return an empty object if no defaults defined for a template', function () {
                var defaults = getters.getFilterDefaults(this.mockFilters, 'withoutDefaults');
                expect(defaults).toEqual({});
            });
        });

        describe('svgFilters.getFilterNames', function () {

            beforeEach(function () {
                this.mockFilters = {
                    masterTemplate: function () {
                        return '';
                    },
                    templates: [
                        {name: 'first'},
                        {name: 'second'},
                        {name: 'third'}
                    ]
                };
                this.names = ['first', 'second', 'third'];
            });


            it('should return a list of the filter names', function(){
                var names = getters.getFilterNames(this.mockFilters);
                expect(names).toEqual(this.names);
            });
        });

    });

});
