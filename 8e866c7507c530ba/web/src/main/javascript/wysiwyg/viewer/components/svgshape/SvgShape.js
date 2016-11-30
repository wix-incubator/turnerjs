/**
 * @class wysiwyg.viewer.components.svgshape.SvgShape
 */
define.component('wysiwyg.viewer.components.svgshape.SvgShape', function (componentDefinition) {

    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.traits(["wysiwyg.viewer.components.svgshape.traits.SvgShapeUtils"]);

    def.resources(['W.Skins', 'W.Theme']);

    def.utilize(['wysiwyg.viewer.components.svgshape.SvgScaler']);

    def.propertiesSchemaType('SvgShapeProperties');

    def.binds(['_mediaGalleryCallback']);

    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: false,
                proportionalResize: true
            },
            custom: [
                {
                    label: 'SVGSHAPE_SELECT_SKIN',
                    command: 'WEditorCommands.OpenMediaFrame',
                    commandParameter: {
                        commandSource: 'FPP',
                        publicMediaFile: 'shapes',
                        i18nPrefix: 'shape',
                        selectionType: 'single',
                        callback: '_mediaGalleryCallback',
                        hasPrivateMedia: false
                    }
                }
            ]
        }
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._rotatable = true;
        },

        isRenderNeeded: function (invalidations) {
            var renderTriggers = [
                this.INVALIDATIONS.DISPLAY,
                this.INVALIDATIONS.STYLE_PARAM_CHANGE
            ];
            return invalidations.isInvalidated(renderTriggers) || this.parent(invalidations);
        },

        _onRender: function (renderEvent) {
            var currentSize,
                invalidations = renderEvent.data.invalidations,
                skinChanged = invalidations.isInvalidated([this.INVALIDATIONS.SKIN_CHANGE]),
                styleParamChanged = invalidations.isInvalidated([this.INVALIDATIONS.STYLE_PARAM_CHANGE]),
                firstRender = invalidations.isInvalidated([this.INVALIDATIONS.FIRST_RENDER]),
                strokeWidth,
                minHeight,
                minWidth,
                aspectRatio;

            this._initializeScaler(skinChanged);

            currentSize = this.svgScaler.getActualDimensions();

            if (!currentSize.width || !currentSize.height) {
                return;
            }

            if (!this.svgScaler.aspectRatio) {
                this.svgScaler.setAspectRatio(currentSize);
            }

            strokeWidth = parseFloat(this.getSkin().getParamValue('strokewidth')._amount);

            if (styleParamChanged || skinChanged || firstRender) {
                aspectRatio = this.svgScaler.getOriginalAspectRatio();
                if (aspectRatio > 1) {
                    minHeight = strokeWidth + 1;
                    minWidth = minHeight * aspectRatio;
                } else {
                    minWidth = strokeWidth + 1;
                    minHeight = minWidth / aspectRatio;
                }

                this.setMinW(minWidth);
                this.setMinH(minHeight);
            }

            this.scaleSvgElementSize(currentSize);
            this.scaleSvgContents(currentSize, strokeWidth);
            this.svgScaler.translateShapePosition(strokeWidth);
        },
        scaleSvgElementSize: function (currentSize) {
            var requestedSvgCanvasSize = {
                    width: parseFloat(this.$view.style.minWidth),
                    height: parseFloat(this.$view.style.minHeight)
                },
                newSvgCanvasScale,
                targetSize;

            if (this.getComponentProperty('maintainAspectRatio')) {
                newSvgCanvasScale = this.calculateScale(currentSize, requestedSvgCanvasSize);
                targetSize = {
                    width: Math.ceil(currentSize.width * newSvgCanvasScale.scaleX),
                    height: Math.ceil(currentSize.height * newSvgCanvasScale.scaleY)
                };
            } else {
                targetSize = requestedSvgCanvasSize;
            }

            this.svgScaler.svgElement.style.width = targetSize.width + 'px';
            this.svgScaler.svgElement.style.height = targetSize.height + 'px';
        },

        scaleSvgContents: function (currentSize, strokeWidth) {
            var requestedSvgContentsSize = {
                    width: parseFloat(this.$view.style.minWidth) - strokeWidth,
                    height: parseFloat(this.$view.style.minHeight) - strokeWidth
                },
                newSvgContentsScale = this.calculateScale(currentSize, requestedSvgContentsSize);

            this.svgScaler.scale(newSvgContentsScale.scaleX, newSvgContentsScale.scaleY);
        },

        calculateScale: function (oldSize, newSize) {
            var maintainAspectRatio = this.getComponentProperty('maintainAspectRatio'),
                originalAspectRatio = this.svgScaler.getOriginalAspectRatio(),
                currentAspectRatio = newSize.width / newSize.height,
                scaleX,
                scaleY;

            if (!oldSize.width) {
                scaleX = 1;
            } else if (maintainAspectRatio && currentAspectRatio > originalAspectRatio) {
                scaleX = (newSize.height * originalAspectRatio) / oldSize.width;
            } else {
                scaleX = newSize.width / oldSize.width;
            }

            if (!oldSize.height) {
                scaleY = 1;
            } else if (maintainAspectRatio && currentAspectRatio < originalAspectRatio) {
                scaleY = (newSize.width / originalAspectRatio) / oldSize.height;
            } else {
                scaleY = newSize.height / oldSize.height;
            }

            return {
                scaleX: this.round(scaleX),
                scaleY: this.round(scaleY)
            };
        },

        _initializeScaler: function (force) {
            if (!this.svgElement || force) {
                this.svgElement = this.$view.getElementsByTagName('svg')[0];
            }
            if (!this.svgScaler || force) {
                this.svgScaler = new this.imports.SvgScaler(this.svgElement);
            }
        },

        _setSkin: function (skinName) {
            var compResources = this.resources.W,
                styleId = this.getStyle().getDataItem().get('id'),
                dfd = Q.defer();

            compResources.Skins.getSkin(skinName, function (skin) {
                var skinParamMapper = compResources.Theme._styleCache[styleId];
                if (skinParamMapper) {
                    skinParamMapper.setSkin(skin);
                }
                dfd.resolve(skin);
            });

            return dfd.promise;
        },
        _getSkinNameFromFileName: function (fileName) {
            //Example fileName: shapes/1d23a4adcc180e6168c9eb24b62ae238_svgshape.v1.CartIcon.js
            //Example skinName: svgshape.v1.svg_1d23a4adcc180e6168c9eb24b62ae238.CartIcon

            var regEx = /^shapes\/([a-z0-9]{32})_svgshape\.(v\d)\.([A-Z][A-Za-z0-9_]*)\.js$/i,
                partsArr = regEx.exec(fileName),
                md5Hash = partsArr[1],
                version = partsArr[2],
                name = partsArr[3];

            return (['svgshape', version, 'svg_' + md5Hash, name].join('.'));
        },

        _mediaGalleryCallback: function (rawData) {
            if (!rawData.fileName || rawData.fileName.indexOf('_svgshape.v1.') === -1 ||
                rawData.fileName.lastIndexOf('.js') !== (rawData.fileName.length - 3)) {
                console.log('invalid shape data received from media gallery: ', rawData);
                return;
            }

            this._setSkin(this._getSkinNameFromFileName(rawData.fileName))
                .then(function () {
                    window.parent.W.Commands.executeCommand('WEditorCommands.UpdateEditedComponentPanel', {});
                });

            this._logChangeMediaSuccess();
        },
        _logChangeMediaSuccess: function () {
            LOG.reportEvent(wixEvents.CHANGE_IMAGE_CLICK_SUCCESS, {c1: this.className });
        }
    });
});
