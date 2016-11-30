/*global app, PMS*/

app.service('transportService', ['$rootScope', 'translationService', 'biService', function ($rootScope, translationService, biService) {
	var pms = this.pms = new PMS({
			connectionID: 'OrganizeImages',
			targetWindow: window.parent
		});

	var	uniqueID;
    var presetImgs;

	this.addImages = function(newImages){
        var addMethod = this.userSets.addMethod;

        if (this.userSets.addMethod !== 'splice'){
            this.images[addMethod].apply(this.images, newImages);
        } else{
            this.images.splice.apply(this.images, [this.selectedImgIndex + 1, 0].concat(newImages));
        }

        pms.trigger('added, changed', newImages);
	};

	this.changeImage = function (pos, data) {
		var image = this.images[pos].data,
			i;

		for (i in image) {
			if (image.hasOwnProperty(i) && data.hasOwnProperty(i)) {
				image[i] = data[i];
			}
		}

		pms.trigger('changed', image);
	};

	this.getNewID = function () {
		return 'new_' + uniqueID++;
	};

	this.removeImg = function (key) {
		var removed = this.images.splice(key, 1);
		var biEventParam;

        if (presetImgs && presetImgs.length && removed.length && presetImgs.indexOf(removed[0].data.uri) > -1){
            biEventParam = '1'; // default image
        } else{
            biEventParam = '0';
        }

		biService.sendBiEvent('ORGIMAGES_CLICK_DELETE', biEventParam);
		pms.trigger('removed, changed', removed);
	};

	this.reorderImgs = function (from, to) {
		var moved = this.images.splice(from, 1)[0];

		this.images.splice(to, 0, moved);
		pms.trigger('reordered, changed', moved);
        biService.collectChanges({ biEvent: 'ORGIMAGES_START_REORDERING' });

		return moved;
	};

	this.close = function () {
		this.images.length = 0;
        this._setDefaults();
		pms.off('changed');
        biService.sendCollectedChanges();
		pms.send('closed');
	};

	this.save = function () {
		pms.send('save', this.images);
	};

	this.openLinkDialog = function (data) {
		if (!this.isLinkDialogOpened) {
			this.isLinkDialogOpened = true;
			pms.send('openLinkDialog', data);
		}

	};

	this.openHelpDialog = function (helpId) {
		pms.send('openHelpDialog', helpId);
	};

    this.sendUserSets = function(){
        pms.send('setUserSets', this.userSets);
    };

	this._set = function (e) {
		var data = e.data;
        var userSets = data.userSets;
		this.topology = data.topology;

		$rootScope.$apply(function () {
            var userSetsProps = Object.keys(userSets);

            if (userSetsProps.length){
                userSetsProps.forEach(function(p){ // in order not to change the reference, because it used by data binding
                    this.userSets[p] = userSets[p];
                }, this);
            } else{
                this.forceUserSettings = true;
            }

			translationService.setTranslation(data.translation);
			this.images.push.apply(this.images, data.images);
		}.bind(this));

		pms.once('changed', function () {
			this.isChanged = true;
		}, this);

        if (data.isPreset){
            presetImgs = [];
            data.images.forEach(function(image){
                presetImgs.push(image.data.uri);
            });
        }

		pms.trigger('setup');
		pms.send('setup');
	};

	this._setLink = function (e) {
		var data = e.data,
			img = this.images[data.imgData.position];

        biService.collectChanges({ biEvent: 'ORGIMAGES_ADD_LINK' });

		$rootScope.$apply(function(){
			pms.trigger('changed');
			img.data.link = data.link;
			img.linkText = data.linkText;

			if (img.id !== data.id) { // if a new dataSchema was created for image
				img.id = data.id;
			}

			this.isLinkDialogOpened = false;
		}.bind(this));
	};

	this._cancelSetLink = function () {
		this.isLinkDialogOpened = false;
	};

    this._setDefaults = function(){
        uniqueID = 0;
        presetImgs = null;
        this.isLinkDialogOpened = false;
        this.isChanged = false;
        this.topology = {};
        this.selectedImgIndex = 0;
        this.forceUserSettings = false;

        this.userSets = {
            addMethod: 'unshift',
            keepTitles: true
        }
    };

    this.images = [];
    this._setDefaults();

    biService.setup({
        pms: pms,

        changesCollector: function(biData, changesCollection){
            if (!changesCollection[biData.biEvent]){
                changesCollection[biData.biEvent] = biData.biEventParam || true;
            }
        }
    });

	pms.send('ready');
	pms.on('set', this._set, this);
	pms.on('setLink', this._setLink, this);
	pms.on('setLinkCanceled', this._cancelSetLink, this);
}]);