describe('BaseAction', function() {

    testRequire()
        .classes('wysiwyg.viewer.managers.actions.base.BaseAction')
        .resources('W.Viewer');


    var mockData = {
        behaviors: [
            // comp1 / behavior1
            {
                pageId: 'page1',
                sourceId: 'comp1',
                targetId: 'target1',
                name: 'behavior1',
                playOnce: true,
                duration: '1.5',
                delay: 0.3,
                params: {
                    from: {
                        rotation: 360
                    }
                }
            },
            // comp1 / behavior2
            {
                pageId: 'page1',
                sourceId: 'comp1',
                targetId: 'target1',
                name: 'behavior2',
                playOnce: true,
                duration: '1.5',
                delay: 0.3,
                params: {
                    from: {
                        rotation: 360
                    }
                }
            },
            // comp2 / behavior1
            {
                pageId: 'page1',
                sourceId: 'comp2',
                targetId: 'target2',
                name: 'behavior1',
                playOnce: true,
                duration: '1.5',
                delay: 0.3,
                params: {
                    from: {
                        rotation: 360
                    }
                }
            },
            // Component on a master page
            {
                pageId: 'master',
                sourceId: 'comp3',
                targetId: 'target3',
                name: 'behavior2',
                playOnce: true,
                duration: '1.5',
                delay: 0.3,
                params: {
                    from: {
                        rotation: 360
                    }
                }
            }
        ]
    };

    beforeEach(function() {
        this.viewingDevice = 'mockDevice';
        this.otherViewingDevice = 'otherDevice';
        this.baseAction = new this.BaseAction(this.viewingDevice);

        this.baseAction.addBehaviors(mockData.behaviors);
    });

    describe('BaseAction test suite', function() {

        it('Should add component behaviors', function() {
            expect(this.baseAction._behaviors[this.viewingDevice]).toEqual(mockData.behaviors);
        });

        it('Should remove all behaviors of a specified sourceId', function() {

            this.baseAction.removeComponentBehaviors('comp1');
            this.baseAction.removeComponentBehaviors('comp2');
            // 3 behaviors are supposed to be removed
            // we expect that the last behavior would still exist ( the master page component has 'comp3' )
            expect(this.baseAction._behaviors[this.viewingDevice][0]).toEqual(mockData.behaviors[3]);
        });

        it('Should return all the behaviors for a specified sourceId', function() {
            expect(this.baseAction.getBehaviorsBySourceId('comp1')).toEqual([mockData.behaviors[0], mockData.behaviors[1]]);
            expect(this.baseAction.getBehaviorsBySourceId('comp2')).toEqual([mockData.behaviors[2]]);
            expect(this.baseAction.getBehaviorsBySourceId('comp3')).toEqual([mockData.behaviors[3]]);
        });

        it('Should return all the behaviors for a specified pageId', function() {
            expect(this.baseAction.getBehaviorsByPageId('page1')).toEqual([mockData.behaviors[0], mockData.behaviors[1], mockData.behaviors[2]]);
            expect(this.baseAction.getBehaviorsByPageId('master')).toEqual([mockData.behaviors[3]]);
        });

        it('Should return all the behaviors for a specified targetId', function() {
            expect(this.baseAction.getBehaviorsByTargetId('target1')).toEqual([mockData.behaviors[0], mockData.behaviors[1]]);
            expect(this.baseAction.getBehaviorsByTargetId('target2')).toEqual([mockData.behaviors[2]]);
            expect(this.baseAction.getBehaviorsByTargetId('target3')).toEqual([mockData.behaviors[3]]);
        });

        it('Should return all the target components for a specified pageId ( +incl. master )', function() {
            // our 4 behaviors have in total 3 unique targets ( because behavior[0] and behavior[1] share the same targetId )
            expect(this.baseAction.getTargetIdsByPageId('page1')).toEqual(['target1', 'target2', 'target3']);
        });

        it('Should set a different viewingDevice', function() {
            this.baseAction._setViewingDeviceForBehaviors({viewerMode: this.otherViewingDevice});
            this.baseAction.addBehaviors(mockData.behaviors);
            expect(this.baseAction._behaviors[this.otherViewingDevice]).toEqual(mockData.behaviors);
        });

    });
});