/**
 * @class BM.DrawToolbar
 * @aka Toolbar
 */
BM.DrawToolbar = BM.Toolbar.extend({

	statics: {
		TYPE: 'draw'
	},

	options: {
		polyline: {},
		polygon: {},
		rectangle: {},
		circle: {},
		marker: {},
		circlemarker: {}
	},

	// @method initialize(): void
	initialize: function (options) {
		// Ensure that the options are merged correctly since BM.extend is only shallow
		for (var type in this.options) {
			if (this.options.hasOwnProperty(type)) {
				if (options[type]) {
					options[type] = BM.extend({}, this.options[type], options[type]);
				}
			}
		}

		this._toolbarClass = 'bigemap-draw-draw';
		BM.Toolbar.prototype.initialize.call(this, options);
	},

	// @method getModeHandlers(): object
	// Get mode handlers information
	getModeHandlers: function (map) {
		return [
			{
				enabled: this.options.polyline,
				handler: new BM.Draw.Polyline(map, this.options.polyline),
				title: BM.drawLocal.draw.toolbar.buttons.polyline
			},
			{
				enabled: this.options.polygon,
				handler: new BM.Draw.Polygon(map, this.options.polygon),
				title: BM.drawLocal.draw.toolbar.buttons.polygon
			},
			{
				enabled: this.options.rectangle,
				handler: new BM.Draw.Rectangle(map, this.options.rectangle),
				title: BM.drawLocal.draw.toolbar.buttons.rectangle
			},
			{
				enabled: this.options.circle,
				handler: new BM.Draw.Circle(map, this.options.circle),
				title: BM.drawLocal.draw.toolbar.buttons.circle
			},
			{
				enabled: this.options.marker,
				handler: new BM.Draw.Marker(map, this.options.marker),
				title: BM.drawLocal.draw.toolbar.buttons.marker
			},
			{
				enabled: this.options.circlemarker,
				handler: new BM.Draw.CircleMarker(map, this.options.circlemarker),
				title: BM.drawLocal.draw.toolbar.buttons.circlemarker
			}
		];
	},

	// @method getActions(): object
	// Get action information
	getActions: function (handler) {
		return [
			{
				enabled: handler.completeShape,
				title: BM.drawLocal.draw.toolbar.finish.title,
				text: BM.drawLocal.draw.toolbar.finish.text,
				callback: handler.completeShape,
				context: handler
			},
			{
				enabled: handler.deleteLastVertex,
				title: BM.drawLocal.draw.toolbar.undo.title,
				text: BM.drawLocal.draw.toolbar.undo.text,
				callback: handler.deleteLastVertex,
				context: handler
			},
			{
				title: BM.drawLocal.draw.toolbar.actions.title,
				text: BM.drawLocal.draw.toolbar.actions.text,
				callback: this.disable,
				context: this
			}
		];
	},

	// @method setOptions(): void
	// Sets the options to the toolbar
	setOptions: function (options) {
		BM.setOptions(this, options);

		for (var type in this._modes) {
			if (this._modes.hasOwnProperty(type) && options.hasOwnProperty(type)) {
				this._modes[type].handler.setOptions(options[type]);
			}
		}
	}
});
