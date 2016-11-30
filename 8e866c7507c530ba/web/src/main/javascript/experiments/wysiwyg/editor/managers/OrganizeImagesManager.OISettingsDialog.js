define.experiment.Class('wysiwyg.editor.managers.OrganizeImagesManager.OISettingsDialog', function (def, strategy) {
	def.resources([
		'topology',
		'scriptLoader',
		'W.Preview',
		'W.Commands',
		'W.Config',
		'W.Resources',
		'W.Utils',
        'W.Experiments'
	]);

	def.utilize([
		'core.components.image.ImageUrlNew',
		'wysiwyg.common.utils.LinkRenderer',
		'wysiwyg.editor.utils.Spinner'
	]);

    def.statics({
        _translationKeys: [
            'ORGANIZE_IMAGES_DIALOG_TITLE',
            'ORGANIZE_IMAGES_DIALOG_DESC',
            'ORGANIZE_IMAGES_DIALOG_ADD',
            'ORGANIZE_IMAGES_DIALOG_REPLACE',
            'ORGANIZE_IMAGES_DIALOG_DONE',
            'ORGANIZE_IMAGES_DIALOG_CANCEL',
            'ORGANIZE_IMAGES_DIALOG_NO_IMG_SELECTED',
            'ORGANIZE_IMAGES_DIALOG_IMG_TITLE',
            'ORGANIZE_IMAGES_DIALOG_IMG_DESC',
            'ORGANIZE_IMAGES_DIALOG_IMG_TITLE_PLACEHOLDER',
            'ORGANIZE_IMAGES_DIALOG_IMG_DESC_PLACEHOLDER',
            'ORGANIZE_IMAGES_DIALOG_IMG_LINK',
            'ORGANIZE_IMAGES_DIALOG_IMG_LINK_PLACEHOLDER',
            'ORGANIZE_IMAGES_DIALOG_IMG_TITLE_TOOLTIP',
            'ORGANIZE_IMAGES_DIALOG_IMG_DESC_TOOLTIP',
            'ORGANIZE_IMAGES_DIALOG_EMPTY_MSG',
            'ORGANIZE_IMAGES_DIALOG_CONFIRM_YES',
            'ORGANIZE_IMAGES_DIALOG_CONFIRM_NO',
            'ORGANIZE_IMAGES_DIALOG_CONFIRM_HEADER',
            'ORGANIZE_IMAGES_DIALOG_CONFIRM_MSG',
            'ORGANIZE_IMAGES_DIALOG_SETS_TITLE',
            'ORGANIZE_IMAGES_DIALOG_SETS_BODY',
            'ORGANIZE_IMAGES_DIALOG_SETS_ADD_PLACE',
            'Organize_Images_Dialog_Sets_Add_Title',
            'Organize_Images_Dialog_Sets_Add_Place_Start',
            'Organize_Images_Dialog_Sets_Add_Place_End',
            'Organize_Images_Dialog_Sets_Add_Place_After',
            'Organize_Images_Dialog_Sets_Add_Title_With',
            'Organize_Images_Dialog_Sets_Add_Title_Without',
            'Organize_Images_Dialog_Sets_Button_Continue',
            'Organize_Images_Dialog_Sets_Button_Set'
        ]
    });

	def.methods({
		initialize: function(params){
            var userPreferencesHandler = this._userPreferencesHandler = W.Editor.userPreferencesHandler;
            var loadScriptPromise = this._loadScript();
            this._dataManager = this.resources.W.Preview.getPreviewManagers().Data;
            this._dialogLayer = W.Editor.getDialogLayer();
            this._linkRenderer = new this.imports.LinkRenderer();
            this._spinner = new this.imports.Spinner();
            this._userSets = {};

            var ready = Q.all([
                userPreferencesHandler.getGlobalData('OrganizeImages'),
                loadScriptPromise
            ]);

            document.body.on('keydown', this, this._onEsc); // keydown used because DialogWindow closes on keydown event.

            ready.then(function(result){
                this._userSets = result[0];
                this.setup(params);
                this.openDialog();
            }.bind(this));
        },

        setup: function (params) {
            var comp = params.comp = this._getComp();

            this.dialog = document.getElementById('organizeImagesDialog');
            this.dialogData = this._getDialogData(comp);
            this._compData = comp._data;
        },

        _loadScript: function(){
            var deferred = Q.defer();

            if (!window.PMS){
                this.resources.scriptLoader.loadResource(
                    {
                        url: this.resources.topology.wysiwyg + "/html/external/OrganizeImages/libs/PMS.js"
                    },

                    {
                        onLoad: function(){
                            deferred.resolve();
                        },

                        onFailed: function () {
                            deferred.reject();
                            LOG.reportError("Organize Images failed to load PMS (Post Message Service)");
                        }
                    }
                );
            } else{
                deferred.resolve();
            }

            return deferred.promise;
        },

		_getDialogData: function(comp){
			var wConfig = this.resources.W.Config;
            var compData = comp._data;

            var dialogData = {
                images: [],
                thumb: {},
                translation: this._getTranslation(),

                topology: {
                    url: wConfig.getServiceTopologyProperty('mediaGalleryBaseUrl') + 'assets/media_gallery/index.html?' + 'mediaGalleryStaticBaseUrl' + '=' + wConfig.getServiceTopologyProperty('mediaGalleryStaticBaseUrl'),
                    editorSessionId: window.editorModel.editorSessionId,
                    baseHost: wConfig.getServiceTopologyProperty('baseDomain'),
                    deployedExperiments: this.resources.W.Experiments._runningExperimentIds
                },

                isPreset: compData.getMeta('isPreset'),
                userSets: this._userSets
            };

            var items = compData.get('items');
            var imageData;
            var link;
            var linkData;

			items.forEach(function (id, i) {
				imageData = this._dataManager.getDataByQuery(id);
				link = imageData.get('link');
                linkData = link && this._dataManager.getDataByQuery(link);

				dialogData.images.push({
					id: imageData.get('id'),
					data: imageData.cloneOwnData(),
					linkText: linkData ? this._linkRenderer.renderLinkDataItemForPropertyPanel(linkData) : ''
				});
			}, this);

			dialogData.thumb = { //TODO: this is thumb size (it is displayed in preview image section). Different components has different ways to calculate it, so this point should be universalized
				w: comp._itemWidth,
				h: comp._itemHeight - comp._bottomGap,
				mode: this._thumbModesMap[comp.getComponentProperties().get('imageMode')]
			};

			return dialogData;
		},

		_iFrameLoad: strategy.after(function(){
            this.pms.on('setUserSets', this._setUserSettings, this);
        }),

        _setUserSettings: function(e){
            var userSets = this._userSets = e.data;

            this._userPreferencesHandler.setGlobalData('OrganizeImages', userSets, {saveNow: true});
        },

        _newDialog: function () {
            var dialog = document.createElement('iframe');

            this._spinner.show();
            this.removeDialog();
            this.dialog = dialog;
            dialog.on('load', this, this._iFrameLoad);
            dialog.id = 'organizeImagesDialog';
            dialog.src = this.resources.topology.wysiwyg + "/html/external/OISettingsDialogExperiment/index.html";
            dialog.setAttribute('allowtransparency', true);
            this._dialogLayer.insertBefore(dialog, this._dialogLayer.children.length ? this._dialogLayer.children[0] : null); // fix for IE 9, which can't process "undefined" as a second argument
        },

		openDialog: function(){
            if (!this.dialog) {
                this._newDialog();
            } else {
                this._setDialog();
            }
        }
	});
});