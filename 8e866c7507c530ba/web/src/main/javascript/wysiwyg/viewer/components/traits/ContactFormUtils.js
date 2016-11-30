/**
 * @class wysiwyg.viewer.components.traits.ContactFormUtils
 */
define.Class('wysiwyg.viewer.components.traits.ContactFormUtils', function (classDefinition) {
    /**@type wysiwyg.viewer.components.traits.ContactFormUtils */
    var def = classDefinition;

    def.resources(['W.Config']);

    def.methods({
        getMsgTemplate: function (fields, lingo) {
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                date = new Date(),
                htmFields = '',
                tplField = '<li style="list-style: none; margin: 0 0 5px 0; padding: 0;"><b>{{key}}</b> {{val}}</li>',
                tpl = '<ul style="list-style: none; margin: 0; padding: 0;">' +
                    '<li style="list-style: none; margin: 0 0 5px 0; padding: 0;"><b>{{ttl}}</b></li>' +
                    '<li style="list-style: none; margin: 0 0 15px 0; padding: 0;">{{ttl_via}} ' + window.location.protocol + "//" + window.location.hostname + window.location.pathname + '</li>' +
                    '<li style="list-style: none; margin: 0 0 5px 0; padding: 0;"><b>{{ttl_details}}</b></li>' +
                    '<li style="list-style: none; margin: 0 0 25px 0; padding: 0;">' +
                    '<ul  style="margin: 0 0 0 20px; padding: 0;">{{fields}}</ul>' +
                    '</li>' +
                    '<li style="list-style: none; margin: 0 0 15px 0; padding: 0;"><b>{{ttl_date}}</b> ' + date.getDate() + ' ' + months[date.getMonth()] + ', ' + date.getFullYear() + '</li>' +
                    '<li style="list-style: none; margin: 0; padding: 0;">{{tnx}}</li>' +
                    '</ul>';


            _.each(fields, function (val, key) {
                var label;
                if (!!key && !/^default_/.test(key)) {
                    label = key + ' : ';
                } else {
                    label = '';
                }
                htmFields += tplField.replace('{{key}}', label).replace('{{val}}', val);
            });

            return tpl.replace('{{fields}}', htmFields)
                .replace('{{ttl}}', lingo['msg_title'])
                .replace('{{ttl_via}}', lingo['msg_via'])
                .replace('{{ttl_details}}', lingo['msg_details'])
                .replace('{{ttl_date}}', lingo['msg_date'])
                .replace('{{tnx}}', lingo['msg_tnx']);
        },

        getMailServerUrl: function () {
            var preview = this.resources.W.Config.env.$isEditorViewerFrame;
            var site = window.location.protocol + "//" + window.location.hostname;
            var service = '/_api/common-services/notification/invoke';
            var cookie = preview ? W.CookiesManager.getCookie('wixSession') : '';
            var secured = preview ? 'Secured' : '';
            var template = '{{site}}{{service}}{{secured}}?accept=json&contentType=json&appUrl={{site}}{{cookie}}';

            return template.replace(/\{\{site\}\}/g, site)
                .replace('{{service}}', service)
                .replace('{{cookie}}', cookie)
                .replace('{{secured}}', secured);
        },

        getFallbackMailServerUrl: function () {
            var preview = this.resources.W.Config.env.$isEditorViewerFrame;
            var site = 'https://fallback.wix.com/';
            var service = '/_api/common-services/notification/invoke';
            var cookie = preview ? W.CookiesManager.getCookie('wixSession') : '';
            var secured = preview ? 'Secured' : '';
            var template = '{{site}}{{service}}{{secured}}?accept=json&contentType=json&appUrl={{site}}{{cookie}}';

            return template.replace(/\{\{site\}\}/g, site)
                .replace('{{service}}', service)
                .replace('{{cookie}}', cookie)
                .replace('{{secured}}', secured);
        },

        isInput: function (element) {
            return /(textarea|input)/.test(element.nodeName.toLowerCase());
        },

        needsValidation: function (el) {
            return (this.isInput(el) && (el.isRequired || $(el).hasClass('required')));
        },

        getDisplayedInputs: function (el) {
            return (this.isInput(el) && (!el.hidden || !$(el).hasClass('hidden')));
        },

        getEmptyInputs: function (el) {
            return (this.needsValidation(el) && (!el.value.replace(/^\s+|\s+$/g, '') || $(el).hasClass('isPlaceholder')));
        },

        setLabel: function (label, data) {
            if (!label) {
                return;
            }
            label.set('text', data.value);
            if (data.displayed) {
                $(label).removeClass('hidden');
            } else {
                $(label).addClass('hidden');
            }
        },

        setInput: function (input, data) {
            var hid = !data.displayed,
                req = data.displayed && data.required;

            input.hidden = hid;
            input.isRequired = req;
            input.name = data.value;
            if (hid) {
                $(input).addClass('hidden');
            } else {
                $(input).removeClass('hidden');
            }

            if (req) {
                $(input).addClass('required');
            } else {
                $(input).removeClass('required');
            }

            if (this.hasPlaceholder()) {
                $(input).setAttribute('placeholder', data.value);
                if (this.needsPoly()) {
                    this.setPHPoly($(input));
                    $(input).value = data.value;
                    return;
                }
            }
            $(input).addEvent('focus', function () {
                $(this).removeClass('error');
            });
        },

        hasPlaceholder: function () {
            return !this._skin.hidePlaceholders;
        },

        preFormatFields: function () {
            var fl = _.pick(this._skinParts, this.getDisplayedInputs, this);
            return {
                forSend: _.transform(fl, function (temp, input) {

                    var name = !!input.name ? input.name : 'default_' + input.getAttribute('skinpart');
                    temp[name] = ($(input).hasClass('isPlaceholder')) ? '' : input.value;

                }),

                forReport: _.transform(fl, function (temp, input, key) {
                    temp[key] = input.value;
                })
            };
        },

        needsPoly: function () {
            return !window.Modernizr.input.placeholder;
        },

        setPHPoly: function (input) {
            var val = input.value;
            var plh = input.getAttribute('placeholder');

            if (!val || (val === plh)) {
                input.value = plh;
                input.addClass('isPlaceholder');
            }

            input.addEvent('focus', function () {
                $(this).removeClass('error');
                if ($(this).hasClass('isPlaceholder')) {
                    $(this).value = '';
                    $(this).removeClass('isPlaceholder');
                }
            }, false);

            input.addEvent('blur', function () {
                var val = $(this).value,
                    plh = $(this).getAttribute('placeholder');

                if (!val || (val === plh)) {
                    $(this).value = plh;
                    $(this).addClass('isPlaceholder');
                } else {
                    $(this).removeClass('isPlaceholder');
                }
            }, false);
        }
    });
});
