BM.Edit = BM.Edit || {};
/**
 * @class BM.Edit.CircleMarker
 * @aka Edit.Circle
 * @inherits BM.Edit.SimpleShape
 */
BM.Edit.CircleMarker = BM.Edit.SimpleShape.extend({
	_createMoveMarker: function () {
		var center = this._shape.getLatLng();

		this._moveMarker = this._createMarker(center, this.options.moveIcon);
	},

	_createResizeMarker: function () {
		// To avoid an undefined check in BM.Edit.SimpleShape.removeHooks
		this._resizeMarkers = [];
	},

	_move: function (latlng) {
		if (this._resizeMarkers.length) {
			var resizemarkerPoint = this._getResizeMarkerPoint(latlng);
			// Move the resize marker
			this._resizeMarkers[0].setLatLng(resizemarkerPoint);
		}

		// Move the circle
		this._shape.setLatLng(latlng);

		this._map.fire(BM.Draw.Event.EDITMOVE, {layer: this._shape});
	},
});

BM.CircleMarker.addInitHook(function () {
	if (BM.Edit.CircleMarker) {
		this.editing = new BM.Edit.CircleMarker(this);

		if (this.options.editable) {
			this.editing.enable();
		}
	}

	this.on('add', function () {
		if (this.editing && this.editing.enabled()) {
			this.editing.addHooks();
		}
	});

	this.on('remove', function () {
		if (this.editing && this.editing.enabled()) {
			this.editing.removeHooks();
		}
	});
});
