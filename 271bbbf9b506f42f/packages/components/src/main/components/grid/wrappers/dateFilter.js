define([
        'lodash',
        'components/components/grid/core/enums'
    ],
    function (_, enums) {
        'use strict';

        var filtering = enums.filtering;
        var DateOperator = filtering.DateOperator;
        var DateOperatorFuncs = filtering.DateOperatorFuncs;

        function DateFilter () {}

        DateFilter.prototype.init = function (params) {
            this.eGui = window.document.createElement('div');
            this.eGui.innerHTML =
                '<div><select class="date-filter-select ag-filter-select">' +
                _.map(DateOperator, function(value, key){
                    return '<option value="' + key + '">' + value + '</option>';
                }).join('') +
                '</select></div>' +
                '<div><input type="number" class="date-filter-amount ag-filter-filter" min="0" placeholder="Filter..." /></div>';

            this.select = this.eGui.querySelector('.date-filter-select');
            this.input = this.eGui.querySelector('.date-filter-amount');

            this.select.addEventListener('change', params.filterChangedCallback);
            this.input.addEventListener('change', params.filterChangedCallback);
        };

        DateFilter.prototype.getGui = function () {
            return this.eGui;
        };

        DateFilter.prototype.doesFilterPass = function (params) {
            var difference = Number(this.input.value) || 0;
            var operator = this.select.value;
            if (!_.isUndefined(DateOperatorFuncs[operator])) {
                return DateOperatorFuncs[operator](difference, params.data.date);
            }
            return true;
        };

        DateFilter.prototype.isFilterActive = function () {
            return this.select.value !== DateOperator.NONE;
        };

        DateFilter.prototype.getApi = function() {
            return {
                getModel: _.bind(function() {
                    return {
                        type: enums.FieldType.DATE,
                        operator: this.select.value,
                        value: Number(this.input.value)
                    };
                }, this),
                setModel: _.bind(function(model) {
                    if (_.isUndefined(model)) {
                        model = {
                            type: enums.FieldType.DATE,
                            operator: DateOperator.NONE,
                            value: ''
                        };
                    }
                    this.select.value = model.operator;
                    this.input.value = model.value;
                }, this)
            };
        };

        return DateFilter;
    }
);
