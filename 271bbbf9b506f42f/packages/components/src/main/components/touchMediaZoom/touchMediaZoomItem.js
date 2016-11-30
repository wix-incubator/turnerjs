define(['lodash', 'react', 'core'],
    function (_, React, core) {

    'use strict';

    /**
     * @class components.touchMediaZoomItem
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'TouchMediaZoomItem',
        mixins: [core.compMixins.skinBasedComp],
        propTypes: {
            itemWidth: React.PropTypes.number.isRequired,
            itemLeft: React.PropTypes.number.isRequired,
            screenWidth: React.PropTypes.number.isRequired,
            imageData: React.PropTypes.object.isRequired,
            imageFastData: React.PropTypes.object.isRequired,
            title: React.PropTypes.string,
            description: React.PropTypes.string,
            link: React.PropTypes.object,
            showInfo: React.PropTypes.bool.isRequired
        },

        getTitle: function () {
            return {
                className: this.classSet({hidden: !this.props.title}),
                children: this.props.title
            };
        },

        getDescription: function () {
            return {
                className: this.classSet({hidden: !this.props.description}),
                children: this.props.description
            };
        },

        getLink: function () {
            return _.assign({}, this.props.link, {
                className: this.classSet({hidden: !this.props.link}),
                onClick: function(e){
                    e.stopPropagation();
                }
            });
        },

        hasInfo: function () {
            return this.props.title || this.props.description || this.props.link;
        },

        isImageFullWidth: function(){
            return this.props.screenWidth <= this.props.imageFastData.css.img.width;
        },

        getSkinProperties: function () {
            var fastImage = React.createElement('img', {
                src: this.props.imageFastData.uri,
                style: this.props.imageFastData.css.img,
                className: this.classSet({fast: true})
            });

            var image = React.createElement('img', {
                src: this.props.imageData.uri,
                style: this.props.imageData.css.img,
                className: this.classSet({heavy: true})
            });

            return {
                "": {
                    className: this.classSet({parallax: this.isImageFullWidth()}),
                    style: {
                        width: this.props.itemWidth + 'px',
                        left: this.props.itemLeft + '%'
                    }
                },
                imageContainer: {
                    style: {
                        width: this.props.screenWidth + 'px'
                    },
                    children: [fastImage, image]
                },
                info: {
                    className: this.classSet({hidden: !this.props.showInfo || !this.hasInfo()}),
                    style: {
                        width: this.props.screenWidth + 'px'
                    }
                },
                description: this.getDescription(),
                title: this.getTitle(),
                link: this.getLink()
            };
        }
    };
});
