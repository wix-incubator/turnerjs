define(['lodash', 'testUtils', 'adminLoginButton'],
    function (_, testUtils, adminLoginButton) {
        'use strict';

        function createAdminLogonButton(props, node) {
            return testUtils.componentBuilder('wysiwyg.viewer.components.AdminLoginButton', props, node);
        }

        function createAdminLogonButtonProps(overrides) {
            return testUtils.santaTypesBuilder.getComponentProps(adminLoginButton, _.merge({
                compData: {
                    label: "aaa"
                }
            }, overrides));
        }

        describe('admin/webmaster login button component', function () {

            it("should have a label", function () {
                var props = createAdminLogonButtonProps({
                    compData: {
                        label: "Webmaster Login"
                    }
                });

                var button = createAdminLogonButton(props);
                var skinProps = button.getSkinProperties();
                expect(skinProps.label.children[0]).toEqual("Webmaster Login");
            });

            it('should create a link to site editor and have a session id', function () {
                var props = createAdminLogonButtonProps({
                    metaSiteId: "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb",
                    siteId: "cccccccc-cccc-4ccc-cccc-cccccccccccc"
                });
                var button = createAdminLogonButton(props);
                var refData = button.getSkinProperties();
                expect(refData.link.href).toEqual('http://editor.wix.com/html/editor/web/renderer/edit/cccccccc-cccc-4ccc-cccc-cccccccccccc?metaSiteId=bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb&editorSessionId=aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa');
            });

            it('should explicitly target the same window to prevent the preview iframe from navigating away', function () {
                var props = createAdminLogonButtonProps();
                var button = createAdminLogonButton(props);
                var refData = button.getSkinProperties();
                expect(refData.link.target).toEqual('_self');
            });

            it('should call buttonMixin.resetMinHeightIfNeeded with skinProps', function () {
                var props = createAdminLogonButtonProps();
                var button = createAdminLogonButton(props);
                spyOn(button, 'resetMinHeightIfNeeded');
                var refData = button.getSkinProperties();
                expect(button.resetMinHeightIfNeeded).toHaveBeenCalledWith(refData);
            });

            it('should call buttonMixin.resetMinHeightIfNeeded with skinProps', function () {
                var props = createAdminLogonButtonProps({
                    style: {
                        height: 15
                    }
                });

                var button = createAdminLogonButton(props);
                spyOn(button, 'getLabelStyle').and.returnValue({'a': 4});
                var refData = button.getSkinProperties();

                expect(refData.label.style.lineHeight).toBe('15px');
                expect(refData.label.style.a).toBe(4);
            });

        });
    });
