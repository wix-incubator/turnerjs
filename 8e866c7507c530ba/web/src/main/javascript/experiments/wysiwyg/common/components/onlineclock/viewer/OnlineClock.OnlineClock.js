define.experiment.newComponent('wysiwyg.common.components.onlineclock.viewer.OnlineClock.OnlineClock', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.resources(['W.Config', 'W.Commands']);

    def.propertiesSchemaType('OnlineClockProperties');

    def.dataTypes(['OnlineClock']);

    def.skinParts({
        container: { type: 'htmlElement' },
        time: { type: 'htmlElement' },
        date: { type: 'htmlElement' }
    });

    def.states({
//        colon: ['colonShow', 'colonHide'],
        textAlign: ['alignLeft', 'alignCenter', 'alignRight']
    });

    def.binds(['_tick']);

    def.statics({
        langKeys: {
            en: {
                "MONTH_1": "January",
                "MONTH_2": "February",
                "MONTH_3": "March",
                "MONTH_4": "April",
                "MONTH_5": "May",
                "MONTH_6": "June",
                "MONTH_7": "July",
                "MONTH_8": "August",
                "MONTH_9": "September",
                "MONTH_10": "October",
                "MONTH_11": "November",
                "MONTH_12": "December"
            },
            es: {
                "MONTH_1": "Enero",
                "MONTH_2": "Febrero",
                "MONTH_3": "Marzo",
                "MONTH_4": "Abril",
                "MONTH_5": "Mayo",
                "MONTH_6": "Junio",
                "MONTH_7": "Julio",
                "MONTH_8": "Agosto",
                "MONTH_9": "Septiembre",
                "MONTH_10": "Octubre",
                "MONTH_11": "Noviembre",
                "MONTH_12": "Diciembre"
            },
            de: {
                "MONTH_1": "Januar",
                "MONTH_2": "Februar",
                "MONTH_3": "März",
                "MONTH_4": "April",
                "MONTH_5": "Mai",
                "MONTH_6": "Juni",
                "MONTH_7": "Juli",
                "MONTH_8": "August",
                "MONTH_9": "September",
                "MONTH_10": "Oktober",
                "MONTH_11": "November",
                "MONTH_12": "Dezember"
            },
            fr: {
                "MONTH_1": "Janvier",
                "MONTH_2": "Février",
                "MONTH_3": "Mars",
                "MONTH_4": "Avril",
                "MONTH_5": "Mai",
                "MONTH_6": "Juin",
                "MONTH_7": "Juillet",
                "MONTH_8": "Août",
                "MONTH_9": "Septembre",
                "MONTH_10": "Octobre",
                "MONTH_11": "Novembre",
                "MONTH_12": "Decembre"
            },
            it: {
                "MONTH_1": "Gennaio",
                "MONTH_2": "Febbraio",
                "MONTH_3": "Marzo",
                "MONTH_4": "Aprile",
                "MONTH_5": "Maggio",
                "MONTH_6": "Giugno",
                "MONTH_7": "Luglio",
                "MONTH_8": "Agosto",
                "MONTH_9": "Settembre",
                "MONTH_10": "Ottobre",
                "MONTH_11": "Novembre",
                "MONTH_12": "Dicembre"
            },
            ja: {
                "MONTH_1": "1 月",
                "MONTH_2": "2 月",
                "MONTH_3": "3 月",
                "MONTH_4": "4 月",
                "MONTH_5": "5 月",
                "MONTH_6": "6 月",
                "MONTH_7": "7 月",
                "MONTH_8": "8 月",
                "MONTH_9": "9 月",
                "MONTH_10": "10 月",
                "MONTH_11": "11 月",
                "MONTH_12": "12 月"
            },
            ko: {
                "MONTH_1": "1월",
                "MONTH_2": "2월",
                "MONTH_3": "3월",
                "MONTH_4": "4월",
                "MONTH_5": "5월",
                "MONTH_6": "6월",
                "MONTH_7": "7월",
                "MONTH_8": "8월",
                "MONTH_9": "9월",
                "MONTH_10": "10월",
                "MONTH_11": "11월",
                "MONTH_12": "12월"
            },
            pl: {
                "MONTH_1": "Styczeń",
                "MONTH_2": "Luty",
                "MONTH_3": "Marzec",
                "MONTH_4": "Kwiecień",
                "MONTH_5": "Maj",
                "MONTH_6": "Czerwiec",
                "MONTH_7": "Lipiec",
                "MONTH_8": "Sierpień",
                "MONTH_9": "Wrzesień",
                "MONTH_10": "Październik",
                "MONTH_11": "Listopad",
                "MONTH_12": "Grudzień"
            },
            pt: {
                "MONTH_1": "Janeiro",
                "MONTH_2": "Fevereiro",
                "MONTH_3": "Março",
                "MONTH_4": "Abril",
                "MONTH_5": "Maio",
                "MONTH_6": "Junho",
                "MONTH_7": "Julho",
                "MONTH_8": "Agosto",
                "MONTH_9": "Setembro",
                "MONTH_10": "Outubro",
                "MONTH_11": "Novembro",
                "MONTH_12": "Dezembro"
            },
            ru: {
                "MONTH_1": "Январь",
                "MONTH_2": "Февраль",
                "MONTH_3": "Март",
                "MONTH_4": "Апрель",
                "MONTH_5": "Май",
                "MONTH_6": "Июнь",
                "MONTH_7": "Июль",
                "MONTH_8": "Август",
                "MONTH_9": "Сентябрь",
                "MONTH_10": "Октябрь",
                "MONTH_11": "Ноябрь",
                "MONTH_12": "Декабрь"
            },
            tr: {
                "MONTH_1": "Ocak",
                "MONTH_2": "Şubat",
                "MONTH_3": "Mart",
                "MONTH_4": "Nisan",
                "MONTH_5": "Mayıs",
                "MONTH_6": "Haziran",
                "MONTH_7": "Temmuz",
                "MONTH_8": "Ağustos",
                "MONTH_9": "Eylül",
                "MONTH_10": "Ekim",
                "MONTH_11": "Kasım",
                "MONTH_12": "Aralık"
            }
        },
        GOOGLE_API_KEYX: 'AIzaSyCWeeateTaYGqsHhNcmoDfT7Us-vLDZVPs'
    });

    def.fields({
        _timer: null,
        _12_format: false,
        _short_format: false,
        _offset_object: null,
        dictionary: {}
    });

    // TODO size control + month size check
    // TODO sync seconds

    def.utilize(['core.managers.serverfacade.CorsRESTClient']);

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            this._restClient = new this.imports.CorsRESTClient();

            this.on(Constants.EventDispatcher.Events.EXTERMINATING, this, this._onDestroy);

            var that = this;

            this._date_formatters = {
                'monthfirst': function (date) {
                    return that.dictionary["MONTH_" + (date.getMonth() + 1)] + ', ' + date.getDate();
                },
                'datefirst': function (date) {
                    return date.getDate() + ', ' + that.dictionary["MONTH_" + (date.getMonth() + 1)];
                },
                'monthfirstshort': function (date) {
                    return that.dictionary["MONTH_" + (date.getMonth() + 1)].slice(0, 3) + '<span class="slash">/</span>' + date.getDate();
                },
                'datefirstshort': function (date) {
                    return date.getDate() + '<span class="slash">/</span>' + that.dictionary["MONTH_" + (date.getMonth() + 1)].slice(0, 3);
                }
            };

            this._updateDateHtml = function () {
            };

            this.resources.W.Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this._onEditModeChanged);
        },
        _isAlive: function () {
            return this.resources.W.Config.env.isPublicViewer() || this.resources.W.Config.env.isEditorInPreviewMode();
        },
        _onEditModeChanged: function (editorMode) {
            this._toggleClock();
        },
        _onFirstRender: function (e) {
            this._setDictionary(this.resources.W.Config.getLanguage());
        },
        _setDictionary: function (language) {
            this.dictionary = this.langKeys[language];
        },
        _onEachRender: function (e) {
            if (this.resources.W.Config.env.isViewingSecondaryDevice()) {
                this._updateFontSizeForMobile();
            }
            this._setTextAlign();
            this._toggleClock();
        },
        _toggleClock: function () {
            this._stopClock();
            this._prepareClock();
            if (this._isAlive()) {
                this._restartClock();
            } else {
                this._tick();
            }
        },
        _onRender: function (e) {
            if (e.data.invalidations.isInvalidated([this.INVALIDATIONS.FIRST_RENDER])) {
                this._onFirstRender(e);
            }
            this._onEachRender(e);
        },
        isRenderNeeded: function (invalidations) {
            var renderTriggers = [
                this.INVALIDATIONS.FIRST_RENDER,
                this.INVALIDATIONS.DATA_CHANGE,
                this.INVALIDATIONS.PROPERTIES_CHANGE,
                this.INVALIDATIONS.STYLE_PARAM_CHANGE,
                this.INVALIDATIONS.SKIN_CHANGE,
                this.INVALIDATIONS.MEASURED_SIZE_DIFFERS_FROM_REQUESTED
            ];
            return invalidations.isInvalidated(renderTriggers);
        },
        _updateFontSizeForMobile: function () {
            var timeFontSize = this.getComponentProperties().get('mobileTimeFontSize'),
                dateFontSize = this.getComponentProperties().get('mobileDateFontSize');
            if (typeof(timeFontSize) === 'number') {
                this._skinParts.time.setStyle('font-size', timeFontSize);
            } else {
                this._skinParts.time.setStyle('font-size', null);
            }
            if (typeof(dateFontSize) === 'number') {
                this._skinParts.date.setStyle('font-size', dateFontSize);
            } else {
                this._skinParts.date.setStyle('font-size', null);
            }
        },
        _setTextAlign: function () {
            var textAlign = this.getComponentProperty('textAlign');
            textAlign = 'align' + textAlign.charAt(0).toUpperCase() + textAlign.slice(1);
            this.setState(textAlign, 'textAlign');
        },
        _stopClock: function () {
            if (this._timer) {
                clearInterval(this._timer);
            }
        },
        _prepareClock: function () {
            var time_format = this.getComponentProperties().get('timeFormat').split('_');

            this._short_format = (time_format[0] == 'short');
            if (this._short_format) {
                this._skinParts.time.querySelector('.seconds').addClass('hidden');
                this._skinParts.time.querySelectorAll('.colon')[1].addClass('hidden');
            } else {
                this._skinParts.time.querySelector('.seconds').removeClass('hidden');
                this._skinParts.time.querySelectorAll('.colon')[1].removeClass('hidden');
            }

            this._12_format = (time_format[1] == '12');
            if (!this._12_format) {
                this._skinParts.time.querySelector('.ampm').addClass('hidden');
            } else {
                this._skinParts.time.querySelector('.ampm').removeClass('hidden');
            }

            if (this.getComponentProperties().get('showDate')) {
                this._skinParts.date.removeClass('hidden');
            } else {
                this._skinParts.date.addClass('hidden');
            }

            this._updateDateHtml = this._makeDateUpdater(
                this._skinParts.date,
                this.getComponentProperties().get('dateFormat')
            );
        },
        _restartClock: function () {

//            this.setWidth(30);
//            this.setHeight(15);

//            this.setState('colonShow');

            var date = new Date(),
                timestamp = parseInt(date.getTime() / 1000 + date.getTimezoneOffset() * 60),
                url = 'https://maps.googleapis.com/maps/api/timezone/json?location=' +
                    this.getDataItem().get('latitude') + ',' + this.getDataItem().get('longitude') +
                    '&timestamp=' + timestamp +
                    this.getGoogleApiKeyParam();

            this._restClient.get(url, null, {
                onSuccess: function (response) {
                    if (response.status !== "ZERO_RESULTS" && response.status !== "OVER_QUERY_LIMIT") {
                        this._offset_object = response;
                    }

                    this._stopClock();
                    this._timer = setInterval(this._tick, 1000);
                    this._tick();
                }.bind(this)
            });
        },

        _tick: function () {
            var date = this._getDateTime();

            var timeObject = this._getFormattedTimeObject(date);

            Object.forEach(timeObject, function (val, key) {
                this._setTimeHtmlComponent(key, val);
            }.bind(this));

            if (!this._skinParts.date.hasClass('hidden')) {
                this._updateDateHtml(date);
            }

//            if (this._short_format) {
//                if (this.getState('colon') == 'colonHide') {
//                    this.setState('colonShow');
//                } else {
//                    this.setState('colonHide');
//                }
//            }
        },

        _getDateTime: function () {
            if (!this._isAlive()) {
                return new Date(2000, 8, 30);
            }

            var date = new Date(),
                utc = date.getTime() + date.getTimezoneOffset() * 60000,
                locationOffset = 0;

            if (this._offset_object &&
                'rawOffset' in this._offset_object &&
                'dstOffset' in this._offset_object) {
                locationOffset = (this._offset_object.rawOffset + this._offset_object.dstOffset) * 1000;
            }

            date.setTime(utc + locationOffset);

            return date;
        },

        _makeDateUpdater: function (element, format) {
            return function (date) {
                element.innerHTML = this._date_formatters[format](date);
            };
        },

        _getFormattedTimeObject: function (date) {
            if (!this._isAlive()) {
                return {
                    hours: 88,
                    minutes: 88,
                    seconds: 88,
                    ampm: 'AM'
                };
            }

            var result = {};

            result.minutes = this._formatNumber(date.getMinutes());

            if (this._12_format) {
                var hours = date.getHours(),
                    am = true;

                if (hours > 11) {
                    hours -= 12;
                    am = false;
                }

                result.hours = this._formatNumber(hours || 12);
                result.ampm = am ? 'AM' : 'PM';

            } else {
                result.hours = this._formatNumber(date.getHours());
            }

            if (!this._short_format) {
                result.seconds = this._formatNumber(date.getSeconds());
            }

            return result;
        },

        _setTimeHtmlComponent: function (key, value) {
            this._skinParts.time.querySelector('.' + key).innerHTML = value;
        },

        _formatNumber: function (value) {
            return ('0' + value).slice(-2);
        },

        _onDestroy: function () {
            this._stopClock();
        },

        getGoogleApiKeyParam: function () {
            return this.GOOGLE_API_KEY ? '&key=' + this.GOOGLE_API_KEY : '';
        }
    });
});
