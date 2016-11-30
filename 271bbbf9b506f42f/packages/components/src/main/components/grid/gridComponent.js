define([
    'lodash',
    'core',
    'santaProps',
    'components/components/grid/core/grid',
    'components/components/grid/core/enums'
], function (
    _,
    core,
    santaProps,
    Grid,
    enums
) {
    'use strict';

    var THEME_CLASS_NAME = 'ag-fresh';
    var MIN_PAGINATION_WIDTH = 540;

    return {
        displayName: 'Grid',
        mixins: [core.compMixins.skinBasedComp, core.compMixins.runTimeCompData],

        propTypes: {
            compData: santaProps.Types.Component.compData.isRequired,
            compProp: santaProps.Types.Component.compProp.isRequired,
            linkRenderInfo: santaProps.Types.Link.linkRenderInfo,
            getMediaFullStaticUrl: santaProps.Types.ServiceTopology.getMediaFullStaticUrl
        },

        statics: {
            useSantaTypes: true
        },

        getClasses: function () {
            var classes = {};
            classes[THEME_CLASS_NAME] = true;
            // This scenario covers having 0 rows set from SDK.dataFetcher or SDK.rows.
            // Should still hide the pagination buttons in case the grid component is filtering static data.
            classes['hide-pagination-panel'] = this.props.compData.rows.length === 0;
            classes['align-text-left'] = this.props.compProp.horizontalAlignment === enums.HorizontalAlignment.LEFT;
            classes['align-text-right'] = this.props.compProp.horizontalAlignment === enums.HorizontalAlignment.RIGHT;
            classes['align-text-center'] = this.props.compProp.horizontalAlignment === enums.HorizontalAlignment.CENTER;
            classes['disable-horizontal-scroll'] = this.props.compProp.columnLayout === enums.ColumnLayout.EQUAL;
            classes['break-pagination-rows'] = this.props.style.width < MIN_PAGINATION_WIDTH;
            return classes;
        },

        transformNextProps: function (props, nextProps) {
            // This method is introduced by a Preview Extension
            if (_.isFunction(this.transformPropsWithPreviewDummyData)) {
                return this.transformPropsWithPreviewDummyData(props, nextProps);
            }
            return nextProps;
        },

        componentDidMount: function () {
            this.grid = Grid(this); // eslint-disable-line new-cap
            this.componentViewMode = this.props.renderFlags.componentViewMode;
            Grid.init(this.grid, this.props, this.refs.grid);
        },

        componentWillReceiveProps: function (nextProps) {
            var transformedNextProps = this.transformNextProps(this.props, nextProps);
            if (transformedNextProps.renderFlags.componentViewMode !== this.componentViewMode) {
                this.componentViewMode = transformedNextProps.renderFlags.componentViewMode;
                Grid.handleViewModeChange(this.grid, transformedNextProps, this.componentViewMode);
            }
            Grid.update(this.grid, this.props, transformedNextProps, this.refs.grid, this.componentViewMode);
        },

        getSkinProperties: function () {
            var classes = this.getClasses();
            var skinProps = {
                '': {
                    className: _.reduce(classes, function (className, value, key) {
                        if (value) {
                            className += ' ' + key;
                        }

                        return className;
                    }, '')
                }
            };

            return skinProps;
        },

        componentWillUnmount: function () {
            Grid.destroy(this.grid);
        }
    };

});
