/** @class wysiwyg.common.behaviors.utilities.InsertSplitHtmlText */
define.experiment.newClass('wysiwyg.common.behaviors.utilities.InsertSplitHtmlText.AnimationText', function(classDefinition) {

    /** @type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.utilize(['wysiwyg.common.behaviors.utilities.SplitHtmlText']);
    def.resources(['W.Utils']);

    def.statics({
        _splitTextElementIdPrefix: 'splitTextElementIdPrefix_',
        _splitTextElementIdSuffix: '_splitTextElementIdSuffix',
        _splitTextHiddenClass: 'splitTextHidden' // Should be in viewerWeb.css

    });

    def.methods({

        /**
         * Create an instance of the InsertSplitHtmlText class.
         * rootNode is optional, it can be passed later using the parse(HTMLElement) method.
         * @param {HTMLElement} [rootNode]
         * @param {string} type 'letters', 'words'
         */
        initialize: function(rootNode, type) {
            if (rootNode) {
                this.clear(rootNode);
                this.parse(rootNode, type);
            }
        },

        /**
         * Parse an html text part and split it to words and letters.
         * Usage: var splitText = new SplitHtmlText(someHtmlNode);
         *        var letters = splitText.letters;
         *        etc..
         * Note: using inner HTML, any event handlers will be lost.
         * @param {HTMLElement} rootNode
         * @param {string} type 'letters', 'words'
         */
        parse: function(rootNode, type) {
            var splitHtmlText = new this.imports.SplitHtmlText();

            this._tags = splitHtmlText._tags;

            this._rootNode = rootNode;
            this._rootNode.removeClass('hideForAnimation');
            this._rootNode.id = this._rootNode.id || this._splitTextElementIdPrefix + this.resources.W.Utils.getGUID();

            this._splitNode = document.createElement(rootNode.nodeName);
            this._splitNode.className = rootNode.className;
            this._splitNode.style.cssText = rootNode.style.cssText;
            this._splitNode.id = rootNode.id + this._splitTextElementIdSuffix;
            this._splitNode.innerHTML = splitHtmlText.split(rootNode.innerHTML, type);

            this._rootNode.parentNode.insertBefore(this._splitNode, this._rootNode);
            this._rootNode.addClass(this._splitTextHiddenClass);

            this._setPublicVars();
        },

        /**
         * Remove the SplitText node, and revert visibility of original node.
         * This function can be called on any HTML element when passing rootNode.
         * @param {HTMLElement} [rootNode] if rootNode is defined try to revert it, else try to revert the stored node.
         */
        revert: function(rootNode) {
            var splitNode;
            rootNode = rootNode || this._rootNode;

            if (!rootNode) {
                return;
            }

            if (this._splitNode && this._splitNode.nextSibling === rootNode) {
                splitNode = this._splitNode;
            }
            else {
                splitNode = document.getElementById(rootNode.id + this._splitTextElementIdSuffix);
            }

            if (splitNode) {
                splitNode.parentNode.removeChild(splitNode);
                rootNode.removeClass(this._splitTextHiddenClass);
                if (rootNode.id.indexOf(this._splitTextElementIdPrefix) === 0) {
                    rootNode.id = '';
                }
            }
        },

        /**
         * Revert and clear all references to html nodes
         */
        clear: function(rootNode) {
            this.revert(rootNode);
            delete this._rootNode;
            delete this._splitNode;
            delete this.letters;
            delete this.words;
            delete this.paragraphs;
            delete this.spaces;
            delete this.root;
            delete this.originalRoot;
        },

        isReady: function() {
            return true;
        },

        /**
         * set public variables for this instance
         * @private
         */
        _setPublicVars: function(){
            /**
             * get all the letters (if defined)
             * @type {NodeList|Array}
             */
            this.letters = this._toArray(this._splitNode.getElements(this._tags.letter) || []) ;

            /**
             * get all the words
             * @type {NodeList|Array}
             */
            this.words = this._toArray(this._splitNode.getElements(this._tags.word) || []);

            /**
             * get all paragraphs
             * @type {NodeList|Array}
             */
            this.paragraphs = this._toArray(this._splitNode.getElements('>p, >h1, >h2, >h3, >h4, >h5, >h6, li') || []);

            /**
             * get all spaces
             * @type {NodeList|Array}
             */
            this.spaces = this._toArray(this._splitNode.getElements('.' + this._tags.space) || []);

            /**
             * Return the root split text node
             * @returns {Node|null}
             */
            this.root = this._splitNode || null;

            /**
             * Return the original root node
             * @returns {Node|null}
             */
            this.originalRoot = this._rootNode || null;
        },

        /**
         * Clone an array or convert an array like var to an array (to skip using _.toArray, don't want lodash dependencies here)
         * NOTE: Does not validate input, will return unexpected results for unexpected inputs
         * @param {Array|NodeList|arguments} list
         * @returns {Array}
         * @private
         */
        _toArray: function(list){
            return [].slice.call(list, 0);
        }
    });
});