define(['lodash', 'dataFixer/plugins/behaviorsFixer'], function(_, dataFixer) {
    'use strict';

    describe("behaviorsFixer spec", function () {
        function mockComp(id, behaviors, components) {
            return {
                components: components,
                behaviors: behaviors,
                layout: {height: 100, y: 0, width: 10},
                id: id
            };
        }

        beforeEach(function () {
            this.page = {
                structure: {
                    id: 'page',
                    components: [],
                    layout: {height: 100, y: 0}
                },
                data: {document_data: {}, theme_data: {}, component_properties: {}}
            };
        });

        describe('desktop components', function(){
            it('should delete behaviors if there are no behaviors or behaviors are empty', function () {
                this.page.structure.components = [
                    mockComp('a'),
                    mockComp('b', '[]'),
                    mockComp('c', '{}')
                ];

                dataFixer.exec(this.page);

                expect(this.page.structure.components[0].behaviorQuery).not.toBeDefined();
                expect(this.page.structure.components[1].behaviorQuery).not.toBeDefined();
                expect(this.page.structure.components[2].behaviorQuery).not.toBeDefined();
            });

            it('should do nothing if behaviors are of new structure (Array)', function () {
                this.page.structure.components = [
                    mockComp('a', '[{"someAttribute":"someValue"}]')
                ];

                dataFixer.exec(this.page);

                var behaviorQuery = this.page.structure.components[0].behaviorQuery;
                var expectedResult = [{"someAttribute":"someValue"}];
                expect(JSON.parse(_.get(this.page, ['data', 'behaviors_data', behaviorQuery, 'items']))).toEqual(expectedResult);
            });

            it('should convert old type of behaviors to new type', function () {
                var testString = '{"screenIn":{"targetId":[{"name":"someName","duration":"1","delay":"1"},{"name":"someName2","duration":"2","delay":"2"}]},"screenOut":{"targetId":[{"name":"someName","duration":"1","delay":"1"}]}}';
                var expected = [
                    {
                        action: 'screenIn',
                        targetId: '',
                        name: 'someName',
                        duration: '1',
                        delay: '1'
                    },
                    {
                        action: 'screenIn',
                        targetId: '',
                        name: 'someName2',
                        duration: '2',
                        delay: '2'
                    },
                    {
                        action: 'screenOut',
                        targetId: 'targetId',
                        name: 'someName',
                        duration: '1',
                        delay: '1'
                    }
                ];
                var result;
                this.page.structure.components = [
                    mockComp('a', testString)
                ];

                dataFixer.exec(this.page);

                var behaviorQuery = this.page.structure.components[0].behaviorQuery;
                result = JSON.parse(_.get(this.page, ['data', 'behaviors_data', behaviorQuery, 'items']));
                expect(result).toEqual(expected);
            });

            it('should recursively convert old type of behaviors to new type', function () {
                var testString = '{"screenIn":{"targetId":[{"name":"someName","duration":"1","delay":"1"}]}}';
                var expected = [
                    {
                        action: 'screenIn',
                        targetId: '',
                        name: 'someName',
                        duration: '1',
                        delay: '1'
                    }
                ];
                var result1, result2;
                this.page.structure.components = [
                    mockComp('a', testString, [
                        mockComp('b', testString)
                    ])
                ];

                dataFixer.exec(this.page);

                var behaviorsQuery1 = this.page.structure.components[0].behaviorQuery;
                result1 = JSON.parse(_.get(this.page, ['data', 'behaviors_data', behaviorsQuery1, 'items']));
                var behaviorsQuery2 = this.page.structure.components[0].components[0].behaviorQuery;
                result2 = JSON.parse(_.get(this.page, ['data', 'behaviors_data', behaviorsQuery2, 'items']));
                expect(result1).toEqual(expected);
                expect(result2).toEqual(expected);
            });
        });

        describe('mobile', function(){
            it('should delete behaviors if there are no behaviors or behaviors are empty', function () {
                this.page.structure.mobileComponents = [
                    mockComp('a'),
                    mockComp('b', '[]'),
                    mockComp('c', '{}')
                ];

                dataFixer.exec(this.page);

                expect(this.page.structure.mobileComponents[0].behaviorQuery).not.toBeDefined();
                expect(this.page.structure.mobileComponents[1].behaviorQuery).not.toBeDefined();
                expect(this.page.structure.mobileComponents[2].behaviorQuery).not.toBeDefined();
            });
        });
    });
});
