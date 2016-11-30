define(['testUtils', 'lodash', 'components/components/bgImageStrip/bgImageStrip'], function (testUtils, _, bgImageStrip ) {
    'use strict';

    function getComponent(props) {
        var compDef = _.clone(bgImageStrip);
        compDef.props = props;
        return compDef;
    }

    // style properties including url have moved to containerAndScreenWidthLayout
    xdescribe('bgImageStrip Component', function () {
        beforeEach(function(){
            this.props = testUtils.mockFactory.mockProps().setCompData({
                uri: '',
                id: 'data'
            }).setCompProp({
                bgPosition: 'center center',
                bgRepeat: 'repeat-y',
                bgSize: 'auto',
                id: 'props'
            });
        });

        it('Should have a valid source when given a real image uri (placeholder string)', function() {
            this.props.compData.uri = 'good_image_uri.png';

            var comp = getComponent(this.props);
            var skinProps = comp.getSkinProperties();
            var backgroundStyle = skinProps.bg.style.backgroundImage;

            expect(backgroundStyle).toBeDefined();
            expect(backgroundStyle).not.toBe('');
        });

        it('Should have an empty source when given a fake image uri (empty string)', function() {
            this.props.compData.uri = '';

            var comp = getComponent(this.props);
            var skinProps = comp.getSkinProperties();
            var backgroundStyle = skinProps.bg.style;
            var expectedBackgroundStyle = {};
            expect(backgroundStyle).toEqual(expectedBackgroundStyle);
        });

        it('Should have an empty source when given a fake image uri (boolean false)', function() {
            this.props.compData.uri = false;
            var comp = getComponent(this.props);
            var skinProps = comp.getSkinProperties();
            var backgroundStyle = skinProps.bg.style;

            var expectedBackgroundStyle = {};

            expect(backgroundStyle).toEqual(expectedBackgroundStyle);
        });

    });

});
