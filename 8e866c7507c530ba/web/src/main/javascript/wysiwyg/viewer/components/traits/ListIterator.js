/**
 * Created by IntelliJ IDEA.
 * User: alissav
 * Date: 1/17/12
 * Time: 11:08 AM
 * To change this template use File | Settings | File Templates.
 */

define.Class('wysiwyg.viewer.components.traits.ListIterator', function(classDefinition) {
    var def = classDefinition;

    def.fields({
        _currentItemIndex: 0,
        _oldItem: null,
        _currentItem: null,
        _numItems:-1,
        _locked:false,
        _lastCommand:""
    });

    def.methods({
        lock: function() {
            this._locked = true;
        },

        unlock: function(){
          this._locked = false;
        },

        isLocked: function() {
            return this._locked;
        },

        setListAndCurrentIndex: function(list, index){
            this._numItems = list.get("items").length;
            this._currentItemIndex = index;
            this._onCurrentItemChanged();
        },

        resetIterator: function(){
            this._currentItemIndex = 0;
            this._numItems = -1;
            this._locked = false;
            this._lastCommand = '';
            this._currentItem = null;
        },

        _onCurrentItemChanged: function(){
            this._oldItem = this._currentItem;
            this._currentItem = this.getDataItem().getData().items[this._currentItemIndex];
            this.fireEvent('currentItemChanged');
        },
        /* OVERRIDE *//*
         getAcceptableDataTypes: function() {
         return ['ImageList', ''];
         },*/

        gotoPrev : function () {
            if (!this._locked) {
                this._lastCommand = "prev";
                this._currentItemIndex = this._getPrevItemIndex();
                this._onCurrentItemChanged();
            }
        },

        gotoNext : function () {
            if (!this._locked) {
                this._lastCommand = "next";
                this._currentItemIndex = this._getNextItemIndex();
                this._onCurrentItemChanged();
            }
        },
        _getNextItemIndex : function () {
            var index = this._currentItemIndex;
            index++;
            if (index >= this._numItems) {
                index = 0;
            }
            return index;
        },

        _getPrevItemIndex : function () {
            var index = this._currentItemIndex;
            index--;
            if (index == -1) {
                index = this._numItems - 1;
            }
            return index;
        }
    });
});