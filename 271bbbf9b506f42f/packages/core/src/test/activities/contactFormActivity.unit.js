define(['lodash', 'core/activities/contactFormActivity', 'testUtils'], function (_, ContactFormActivity, testUtils) {
    'use strict';

    describe('ContactFormActivity', function () {
        var activity, fields, activityInfo, fieldLabels, expectedAdditionalFields;
        var someSubject = 'Hello',
            someMessage = 'Hello Santa!';

        beforeEach(function () {
            activityInfo = {
                hubSecurityToken: jasmine.createSpy().and.returnValue(123456789),
                svSession: jasmine.createSpy().and.returnValue('sv-session'),
                metaSiteId: jasmine.createSpy().and.returnValue('metasite-id'),
                currentUrl: {
                    host: 'wix.com',
                    full: 'http://wix.com/activities'
                }
            };
            fields = {
                name: 'John Doe',
                email: 'john@doe.com',
                address: "John's address",
                phone: '00001',
                subject: someSubject,
                message: someMessage
            };
            fieldLabels = {
                name: 'name-label',
                email: 'email-label',
                address: "address-label",
                phone: 'phone-label',
                subject: 'subject-label',
                message: 'message-label'
            };

            activity = new ContactFormActivity(activityInfo, fields, fieldLabels);

            expectedAdditionalFields = _(fields).keys().map(function(key){
                return {name: fieldLabels[key], value: fields[key]};
            }).value();
        });

        describe('getParams', function () {
            it('should get activity params', function () {
                var params = activity.getParams();
                expect(params['component-name']).toEqual('ContactForm');
            });
        });

        describe('getPayload', function () {
            function expectValidContactUpdate(contactUpdate, formFields) {
                var expected = {
                    name: {
                        first: 'John',
                        last: 'Doe'
                    },
                    emails: [{tag: 'main', email: formFields.email}],
                    addresses: [{tag: 'main', address: formFields.address}]
                };

                if (formFields.phone) {
                   expected.phones = [{tag: 'main', phone: formFields.phone}];
                }

                expect(contactUpdate).toEqual(expected);
            }

            function expectValidActivityDetails(activityDetails) {
                expect(activityDetails).toEqual({
                  additionalInfoUrl : null,
                  summary: '<strong>' + someSubject + '</strong><br>' + someMessage
                });
            }

            describe('should return valid activity payload', function () {
              it('when contactFormActivity experiment is closed', function() {
                  var payload = activity.getPayload();

                  expectValidContactUpdate(payload.contactUpdate, fields);
                  expectValidActivityDetails(payload.activityDetails);

                  expect(payload.activityType).toEqual('contact/contact-form');
                  expect(payload.activityInfo).toEqual({
                      fields : [{
                          name : 'name',
                          value : 'John Doe'
                      },
                      {
                          name : 'email',
                          value : 'john@doe.com'
                      },
                      {
                          name : 'address',
                          value : "John's address"
                      },
                      {
                          name : 'phone',
                          value : '00001'
                      },
                      {
                          name : 'subject',
                          value : someSubject
                      },
                      {
                          name : 'message',
                          value : someMessage
                      }]
                  });
              });



              it('when phone is missing', function () {
                  fields.phone = null;
                  activity = new ContactFormActivity(activityInfo, fields, fieldLabels);
                  var payload = activity.getPayload();
                  expectValidContactUpdate(payload.contactUpdate, fields);
              });

              it('when contactFormActivity experiment is open', function () {
                  testUtils.experimentHelper.openExperiments('contactFormActivity');

                  var payload = activity.getPayload();

                  expectValidContactUpdate(payload.contactUpdate, fields);
                  expectValidActivityDetails(payload.activityDetails);
                  expect(payload.activityType).toEqual('form/contact-form');
                  expect(payload.activityInfo).toEqual({
                    subject: someSubject,
                    content: {
                      message: someMessage,
                      media: []
                    },
                    additionalFields: expectedAdditionalFields
                  });
              });
            });
        });
    });
});
