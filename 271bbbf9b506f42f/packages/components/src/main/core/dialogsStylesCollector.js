define(["lodash", "core"], function (_, /** core */ core) {
  "use strict";

  function dialogStyleCollector(structureInfo, themeData, siteData, loadedStyles) {
    loadedStyles.b1 = loadedStyles.b1 || "s" + _.size(loadedStyles);
  }
  core.styleCollector.registerClassBasedStyleCollector("wysiwyg.viewer.components.dialogs.EnterPasswordDialog", dialogStyleCollector);
  core.styleCollector.registerClassBasedStyleCollector("wysiwyg.viewer.components.dialogs.NotificationDialog", dialogStyleCollector);
  core.styleCollector.registerClassBasedStyleCollector("wysiwyg.viewer.components.dialogs.siteMemberDialogs.MemberLoginDialog", dialogStyleCollector);
  core.styleCollector.registerClassBasedStyleCollector("wysiwyg.viewer.components.dialogs.siteMemberDialogs.RequestPasswordResetDialog", dialogStyleCollector);
  core.styleCollector.registerClassBasedStyleCollector("wysiwyg.viewer.components.dialogs.siteMemberDialogs.ResetPasswordDialog", dialogStyleCollector);
  core.styleCollector.registerClassBasedStyleCollector("wysiwyg.viewer.components.dialogs.siteMemberDialogs.SignUpDialog", dialogStyleCollector);
});
