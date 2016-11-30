define.skin('wysiwyg.common.components.skypecallbutton.viewer.skins.SkypeCallButtonSkin', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.skinParams([
        { "id": "webThemeDir", "type": Constants.SkinParamTypes.URL, "defaultTheme": "WEB_THEME_DIRECTORY" }
    ]);

    def.html('' +
        '<iframe skinpart="iframe"' +
        ' src="about:blank" frameborder="0"' +
        ' allowtransparency="true"' +
        ' class="hidden" scrolling="no">' +
        '</iframe>' +
        '<div skinpart="placeholder"></div>');

    def.css([
        '%iframe% { border: 0; display: none; }',
        '%placeholder% { background-repeat: no-repeat; background-size: cover; }',
        '[state~=iframe_ready] %iframe% { display: block; }',

        /* small buttons */

        '[state~=call][state~=small][state~=blue] %placeholder% ' +
        '{ background-image: url(http://www.skypeassets.com/i/scom/images/skype-buttons/callbutton_16px.png);  }',

        '[state~=call][state~=small][state~=white] %placeholder% ' +
        '{ background-image: url(http://www.skypeassets.com/i/scom/images/skype-buttons/callbutton_trans_16px.png);  }',

        '[state~=chat][state~=small][state~=blue] %placeholder% ' +
        '{ background-image: url(http://www.skypeassets.com/i/scom/images/skype-buttons/chatbutton_16px.png);  }',

        '[state~=chat][state~=small][state~=white] %placeholder% ' +
        '{ background-image: url(http://www.skypeassets.com/i/scom/images/skype-buttons/chatbutton_trans_16px.png);  }',

        /* medium buttons */

        '[state~=call][state~=medium][state~=blue] %placeholder% ' +
        '{ background-image: url(http://www.skypeassets.com/i/scom/images/skype-buttons/callbutton_24px.png);  }',

        '[state~=call][state~=medium][state~=white] %placeholder% ' +
        '{ background-image: url(http://www.skypeassets.com/i/scom/images/skype-buttons/callbutton_trans_24px.png);  }',

        '[state~=chat][state~=medium][state~=blue] %placeholder% ' +
        '{ background-image: url(http://www.skypeassets.com/i/scom/images/skype-buttons/chatbutton_24px.png);  }',

        '[state~=chat][state~=medium][state~=white] %placeholder% ' +
        '{ background-image: url(http://www.skypeassets.com/i/scom/images/skype-buttons/chatbutton_trans_24px.png);  }',

        /* large buttons */

        '[state~=call][state~=large][state~=blue] %placeholder% ' +
        '{ background-image: url(http://www.skypeassets.com/i/scom/images/skype-buttons/callbutton_32px.png);  }',

        '[state~=call][state~=large][state~=white] %placeholder% ' +
        '{ background-image: url(http://www.skypeassets.com/i/scom/images/skype-buttons/callbutton_trans_32px.png);  }',

        '[state~=chat][state~=large][state~=blue] %placeholder% ' +
        '{ background-image: url(http://www.skypeassets.com/i/scom/images/skype-buttons/chatbutton_32px.png);  }',

        '[state~=chat][state~=large][state~=white] %placeholder% ' +
        '{ background-image: url(http://www.skypeassets.com/i/scom/images/skype-buttons/chatbutton_trans_32px.png);  }'
    ]);
});
