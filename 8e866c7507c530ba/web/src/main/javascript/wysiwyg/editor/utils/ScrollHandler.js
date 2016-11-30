/**
 * @class wysiwyg.editor.utils.ScrollHandler
 */
define.Class("wysiwyg.editor.utils.ScrollHandler", function(classDefinition){
    /**
     * @type bootstrap.managers.classmanager.ClassDefinition
     */
    var def = classDefinition;

    def.resources(['W.Editor']);

    def.inherits('bootstrap.managers.BaseManager');

    def.binds(['scrollBlock', 'scrollUnBlock']);

    def.fields({
        _lastScrollPosition: 0,
        _cachedComponentstoBlock: null,
        _skinParts: {},
        _scrollBlocked: false,
        _className: 'ScrollHandler',
        _scrollBlockInitiator: null
    });
    /**
     * @lends wysiwyg.editor.utils.ScrollHandler
     */
    def.methods({

        scrollBlock: function(initiator) {

            // already blocked?
            if (this.isScrollBlocked()) {
                return;
            }

            this._scrollBlockInitiator = initiator ? initiator : this._className;

            // save the last scroll position
            this._lastScrollPosition = window.getScroll().y;
            // get the skin parts to block
            var $skinParts = this._getSkinPartsToBlock();

            _.forEach($skinParts, function($skinPart) {
                var skinPartTop, origStyles;

                origStyles = $skinPart.$view.getStyles('top', 'position');
                // cache original css values
                this._skinParts[$skinPart.$compId] = origStyles;

                // parseInt if needed
                skinPartTop = (typeof(origStyles.top) === 'string' && origStyles.top.indexOf('px') > -1) ? parseInt(origStyles.top) : 0;

                $skinPart.$view.setStyles({'top': skinPartTop - this._lastScrollPosition + 'px', 'position': 'fixed'});
            }, this);

            this._setScrollBlockedState(true);
        },

        scrollUnBlock: function(initiator) {

            initiator = initiator ? initiator : this._className;

            // scroll should not be unblocked and should not have a different initiator
            if (this.isScrollUnBlocked() || this._isDifferentScrollBlockInitiator(initiator)) {
                return;
            }

            // revert scroll changes
            window.scrollTo(0, this._lastScrollPosition);
            // get the skin parts to unblock
            var $skinParts = this._getSkinPartsToBlock();

            _.forEach($skinParts, function($skinPart) {
                var origSkinPartValues = this._skinParts[$skinPart.$compId];
                // revert style changes
                $skinPart.$view.setStyles({'top': origSkinPartValues.top, 'position': origSkinPartValues.position});
            }, this);

            this._setScrollBlockedState(false);
            this._scrollBlockInitiator = null;
        },

        isScrollBlocked: function() {
            return this._scrollBlocked;
        },

        isScrollUnBlocked: function() {
            return !this.isScrollBlocked();
        },

        _getSkinPartsToBlock: function() {
            if (this._cachedComponentstoBlock) {
                return this._cachedComponentstoBlock;
            }

            var compsToBlock = [],
                gridLinesLogic = this.resources.W.Editor.getEditorUI().getEditLayer().getGridLines(),
                componentEditBoxLogic = this.resources.W.Editor.getEditingFrame();

            compsToBlock.push({
                $compId: gridLinesLogic._compId,
                $view: gridLinesLogic.$view
            });

            compsToBlock.push({
                $compId: componentEditBoxLogic._compId,
                $view: componentEditBoxLogic._skinParts.rotatablePart
            });

            compsToBlock.push({
                $compId: componentEditBoxLogic._skinParts.moveToFooterButton._compId,
                $view: componentEditBoxLogic._skinParts.moveToFooterButton.$view
            });

            this._cachedComponentstoBlock = _.compact(compsToBlock);

            return this._cachedComponentstoBlock;
        },

        _isDifferentScrollBlockInitiator: function(initiator) {
            return initiator !== this._scrollBlockInitiator;
        },

        _setScrollBlockedState: function(state) {
            this._scrollBlocked = state;
        }
    });
});
