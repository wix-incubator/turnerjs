define(['react', 'lodash', 'previewExtensionsCore'], function (React, _, previewExtensionsCore) {
    'use strict';

    var previewExtensionsRegistrar = previewExtensionsCore.registrar;

    function addSlideShowIcon(refData, santaBase) {
        var iconUrl = santaBase + '/static/images/slideshowGallery/ico_slide.png';

        var overlay = React.DOM.div({
            style: {
                position: 'absolute',
                top: '50%',
                left: '0',
                width: '100%',
                marginTop: '-18px',
                textAlign: 'center'
            },
            className: 'slideShowClickBlocker',
            children: [React.DOM.b({
                className: 'slideShowClickBlocker',
                style: {
                    display: 'inline-block',
                    borderRadius: '3px',
                    background: '#222 url(' + iconUrl + ') no-repeat 8px 50%',
                    opacity: '0.6',
                    color: '#ffffff',
                    padding: '0 14px 0 66px',
                    whiteSpace: 'nowrap',
                    height: '38px',
                    lineHeight: '39px',
                    fontSize: '12px',
                    position: 'static',
                    width: 'auto'
                },
                children: ['Slide Deck Gallery']
            })]
        });

        refData[""].addChildren = refData[""].addChildren || [];
        refData[""].addChildren.push(overlay);
    }

    var extension = {
        getButtonsState: function () {
            return {
                $editMode: (this.props.siteData.renderFlags.isSlideShowGalleryClickAllowed ? '' : 'showButtons')
            };
        },
        transformRefData: function transformRefData(refData) {
            if (!this.props.siteData.renderFlags.isSlideShowGalleryClickAllowed) {
                refData[""] = refData[""] || {};

                addSlideShowIcon(refData, this.props.siteData.santaBase);
            }

            if (this.props.siteData.renderFlags.shouldResetSlideShowNextPrevButtonsPosition) {
                refData[''] = refData[''] || {};
                refData[''].style = _.assign({}, refData[''].style, {overflow: 'visible'});
                refData.buttonNext = refData.buttonNext || {};
                refData.buttonNext.style = _.assign({}, refData.buttonNext.style, {right: 0});

                refData.buttonPrev = refData.buttonPrev || {};
                refData.buttonPrev.style = _.assign({}, refData.buttonPrev.style, {left: 0});
            }
        },
        resetGalleryState: function () {
            var initialState = this.getInitialState();
            this.registerReLayout();
            this.setState(initialState);
        }

    };

    previewExtensionsRegistrar.registerCompExtension('wysiwyg.viewer.components.SlideShowGallery', extension);
});
