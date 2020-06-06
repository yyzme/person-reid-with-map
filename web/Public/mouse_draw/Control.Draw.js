/**
 * @class BM.Control.Draw
 * @aka BM.Draw
 */
BM.Control.Draw = BM.Control.extend({

	// Options
	options: {
		position: 'topleft',
		draw: {},
		edit: false
	},

	// @method initialize(): void
	// Initializes draw control, toolbars from the options
	initialize: function (options) {
		if (BM.version < '0.7') {
			throw new Error('Leaflet.draw 0.2.3+ requires Leaflet 0.7.0+. Download latest from https://github.com/Leaflet/Leaflet/');
		}

		BM.Control.prototype.initialize.call(this, options);

		var toolbar;

		this._toolbars = {};

		// Initialize toolbars
		if (BM.DrawToolbar && this.options.draw) {
			toolbar = new BM.DrawToolbar(this.options.draw);

			this._toolbars[BM.DrawToolbar.TYPE] = toolbar;

			// Listen for when toolbar is enabled
			this._toolbars[BM.DrawToolbar.TYPE].on('enable', this._toolbarEnabled, this);
		}

		if (BM.EditToolbar && this.options.edit) {
			toolbar = new BM.EditToolbar(this.options.edit);

			this._toolbars[BM.EditToolbar.TYPE] = toolbar;

			// Listen for when toolbar is enabled
			this._toolbars[BM.EditToolbar.TYPE].on('enable', this._toolbarEnabled, this);
		}
		BM.toolbar = this; //set global var for editing the toolbar
	},

	// @method onAdd(): container
	// Adds the toolbar container to the map
	onAdd: function (map) {
		var container = BM.DomUtil.create('div', 'bigemap-draw'),
			addedTopClass = false,
			topClassName = 'bigemap-draw-toolbar-top',
			toolbarContainer;

		for (var toolbarId in this._toolbars) {
			if (this._toolbars.hasOwnProperty(toolbarId)) {
				toolbarContainer = this._toolbars[toolbarId].addToolbar(map);

				if (toolbarContainer) {
					// Add class to the first toolbar to remove the margin
					if (!addedTopClass) {
						if (!BM.DomUtil.hasClass(toolbarContainer, topClassName)) {
							BM.DomUtil.addClass(toolbarContainer.childNodes[0], topClassName);
						}
						addedTopClass = true;
					}

					container.appendChild(toolbarContainer);
				}
			}
		}

		return container;
	},

	// @method onRemove(): void
	// Removes the toolbars from the map toolbar container
	onRemove: function () {
		for (var toolbarId in this._toolbars) {
			if (this._toolbars.hasOwnProperty(toolbarId)) {
				this._toolbars[toolbarId].removeToolbar();
			}
		}
	},

	// @method setDrawingOptions(options): void
	// Sets options to all toolbar instances
	setDrawingOptions: function (options) {
		for (var toolbarId in this._toolbars) {
			if (this._toolbars[toolbarId] instanceof BM.DrawToolbar) {
				this._toolbars[toolbarId].setOptions(options);
			}
		}
	},

	_toolbarEnabled: function (e) {
		var enabledToolbar = e.target;

		for (var toolbarId in this._toolbars) {
			if (this._toolbars[toolbarId] !== enabledToolbar) {
				this._toolbars[toolbarId].disable();
			}
		}
	}
});

BM.Map.mergeOptions({
	drawControlTooltips: true,
	drawControl: false
});

BM.Map.addInitHook(function () {
	if (this.options.drawControl) {
		this.drawControl = new BM.Control.Draw();
		this.addControl(this.drawControl);
	}
});
