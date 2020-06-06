/*BM.Map.mergeOptions({
 editControl: true
 });*/
/**
 * @class BM.EditToolbar
 * @aka EditToolbar
 */
BM.EditToolbar = BM.Toolbar.extend({
	statics: {
		TYPE: 'edit'
	},

	options: {
		edit: {
			selectedPathOptions: {
				dashArray: '10, 10',

				fill: true,
				fillColor: '#fe57a1',
				fillOpacity: 0.1,

				// Whether to user the existing layers color
				maintainColor: false
			}
		},
		remove: {},
		poly: null,
		featureGroup: null /* REQUIRED! TODO: perhaps if not set then all layers on the map are selectable? */
	},

	// @method intialize(): void
	initialize: function (options) {
		// Need to set this manually since null is an acceptable value here
		if (options.edit) {
			if (typeof options.edit.selectedPathOptions === 'undefined') {
				options.edit.selectedPathOptions = this.options.edit.selectedPathOptions;
			}
			options.edit.selectedPathOptions = BM.extend({}, this.options.edit.selectedPathOptions, options.edit.selectedPathOptions);
		}

		if (options.remove) {
			options.remove = BM.extend({}, this.options.remove, options.remove);
		}

		if (options.poly) {
			options.poly = BM.extend({}, this.options.poly, options.poly);
		}

		this._toolbarClass = 'bigemap-draw-edit';
		BM.Toolbar.prototype.initialize.call(this, options);

		this._selectedFeatureCount = 0;
	},

	// @method getModeHandlers(): object
	// Get mode handlers information
	getModeHandlers: function (map) {
		var featureGroup = this.options.featureGroup;
		return [
			{
				enabled: this.options.edit,
				handler: new BM.EditToolbar.Edit(map, {
					featureGroup: featureGroup,
					selectedPathOptions: this.options.edit.selectedPathOptions,
					poly: this.options.poly
				}),
				title: BM.drawLocal.edit.toolbar.buttons.edit
			},
			{
				enabled: this.options.remove,
				handler: new BM.EditToolbar.Delete(map, {
					featureGroup: featureGroup
				}),
				title: BM.drawLocal.edit.toolbar.buttons.remove
			}
		];
	},

	// @method getActions(): object
	// Get actions information
	getActions: function (handler) {
		var actions = [
			{
				title: BM.drawLocal.edit.toolbar.actions.save.title,
				text: BM.drawLocal.edit.toolbar.actions.save.text,
				callback: this._save,
				context: this
			},
			{
				title: BM.drawLocal.edit.toolbar.actions.cancel.title,
				text: BM.drawLocal.edit.toolbar.actions.cancel.text,
				callback: this.disable,
				context: this
			}
		];

		if (handler.removeAllLayers) {
			actions.push({
				title: BM.drawLocal.edit.toolbar.actions.clearAll.title,
				text: BM.drawLocal.edit.toolbar.actions.clearAll.text,
				callback: this._clearAllLayers,
				context: this
			});
		}

		return actions;
	},

	// @method addToolbar(map): BM.DomUtil
	// Adds the toolbar to the map
	addToolbar: function (map) {
		var container = BM.Toolbar.prototype.addToolbar.call(this, map);

		this._checkDisabled();

		this.options.featureGroup.on('layeradd layerremove', this._checkDisabled, this);

		return container;
	},

	// @method removeToolbar(): void
	// Removes the toolbar from the map
	removeToolbar: function () {
		this.options.featureGroup.off('layeradd layerremove', this._checkDisabled, this);

		BM.Toolbar.prototype.removeToolbar.call(this);
	},

	// @method disable(): void
	// Disables the toolbar
	disable: function () {
		if (!this.enabled()) {
			return;
		}

		this._activeMode.handler.revertLayers();

		BM.Toolbar.prototype.disable.call(this);
	},

	_save: function () {
		this._activeMode.handler.save();
		if (this._activeMode) {
			this._activeMode.handler.disable();
		}
	},

	_clearAllLayers: function () {
		this._activeMode.handler.removeAllLayers();
		if (this._activeMode) {
			this._activeMode.handler.disable();
		}
	},

	_checkDisabled: function () {
		var featureGroup = this.options.featureGroup,
			hasLayers = featureGroup.getLayers().length !== 0,
			button;

		if (this.options.edit) {
			button = this._modes[BM.EditToolbar.Edit.TYPE].button;

			if (hasLayers) {
				BM.DomUtil.removeClass(button, 'bigemap-disabled');
			} else {
				BM.DomUtil.addClass(button, 'bigemap-disabled');
			}

			button.setAttribute(
				'title',
				hasLayers ?
					BM.drawLocal.edit.toolbar.buttons.edit
					: BM.drawLocal.edit.toolbar.buttons.editDisabled
			);
		}

		if (this.options.remove) {
			button = this._modes[BM.EditToolbar.Delete.TYPE].button;

			if (hasLayers) {
				BM.DomUtil.removeClass(button, 'bigemap-disabled');
			} else {
				BM.DomUtil.addClass(button, 'bigemap-disabled');
			}

			button.setAttribute(
				'title',
				hasLayers ?
					BM.drawLocal.edit.toolbar.buttons.remove
					: BM.drawLocal.edit.toolbar.buttons.removeDisabled
			);
		}
	}
});
