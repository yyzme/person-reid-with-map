BM.Draw = BM.Draw || {};

/**
 * @class BM.Draw.Feature
 * @aka Draw.Feature
 */
BM.Draw.Feature = BM.Handler.extend({

	// @method initialize(): void
	initialize: function (map, options) {
		this._map = map;
		this._container = map._container;
		this._overlayPane = map._panes.overlayPane;
		this._popupPane = map._panes.popupPane;

		// Merge default shapeOptions options with custom shapeOptions
		if (options && options.shapeOptions) {
			options.shapeOptions = BM.Util.extend({}, this.options.shapeOptions, options.shapeOptions);
		}
		BM.setOptions(this, options);

		var version = BM.version.split('.');
		//If Version is >= 1.2.0
		if (parseInt(version[0], 10) === 1 && parseInt(version[1], 10) >= 2) {
			BM.Draw.Feature.include(BM.Evented.prototype);
		} else {
			BM.Draw.Feature.include(BM.Mixin.Events);
		}
	},

	// @method enable(): void
	// Enables this handler
	enable: function () {
		if (this._enabled) {
			return;
		}

		BM.Handler.prototype.enable.call(this);

		this.fire('enabled', {handler: this.type});

		this._map.fire(BM.Draw.Event.DRAWSTART, {layerType: this.type});
	},

	// @method disable(): void
	disable: function () {
		if (!this._enabled) {
			return;
		}

		BM.Handler.prototype.disable.call(this);

		this._map.fire(BM.Draw.Event.DRAWSTOP, {layerType: this.type});

		this.fire('disabled', {handler: this.type});
	},

	// @method addHooks(): void
	// Add's event listeners to this handler
	addHooks: function () {
		var map = this._map;

		if (map) {
			BM.DomUtil.disableTextSelection();

			map.getContainer().focus();

			this._tooltip = new BM.Draw.Tooltip(this._map);

			BM.DomEvent.on(this._container, 'keyup', this._cancelDrawing, this);
		}
	},

	// @method removeHooks(): void
	// Removes event listeners from this handler
	removeHooks: function () {
		if (this._map) {
			BM.DomUtil.enableTextSelection();

			this._tooltip.dispose();
			this._tooltip = null;

			BM.DomEvent.off(this._container, 'keyup', this._cancelDrawing, this);
		}
	},

	// @method setOptions(object): void
	// Sets new options to this handler
	setOptions: function (options) {
		BM.setOptions(this, options);
	},

	_fireCreatedEvent: function (layer) {
		this._map.fire(BM.Draw.Event.CREATED, {layer: layer, layerType: this.type});
	},

	// Cancel drawing when the escape key is pressed
	_cancelDrawing: function (e) {
		if (e.keyCode === 27) {
			this._map.fire('draw:canceled', {layerType: this.type});
			this.disable();
		}
	}
});
