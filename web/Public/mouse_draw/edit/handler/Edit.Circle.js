BM.Edit = BM.Edit || {};
/**
 * @class BM.Edit.Circle
 * @aka Edit.Circle
 * @inherits BM.Edit.CircleMarker
 */
BM.Edit.Circle = BM.Edit.CircleMarker.extend({

	_createResizeMarker: function () {
		var center = this._shape.getLatLng(),
			resizemarkerPoint = this._getResizeMarkerPoint(center);

		this._resizeMarkers = [];
		this._resizeMarkers.push(this._createMarker(resizemarkerPoint, this.options.resizeIcon));
	},

	_getResizeMarkerPoint: function (latlng) {
		// From BM.shape.getBounds()
		var delta = this._shape._radius * Math.cos(Math.PI / 4),
			point = this._map.project(latlng);
		return this._map.unproject([point.x + delta, point.y - delta]);
	},

	_resize: function (latlng) {
		var moveLatLng = this._moveMarker.getLatLng();

		// Calculate the radius based on the version
		if (BM.GeometryUtil.isVersion07x()) {
			radius = moveLatLng.distanceTo(latlng);
		} else {
			radius = this._map.distance(moveLatLng, latlng);
		}
		this._shape.setRadius(radius);

		if (this._map.editTooltip) {
			this._map._editTooltip.updateContent({
				text: BM.drawLocal.edit.handlers.edit.tooltip.subtext + '<br />' + BM.drawLocal.edit.handlers.edit.tooltip.text,
				subtext: BM.drawLocal.draw.handlers.circle.radius + ': ' +
				BM.GeometryUtil.readableDistance(radius, true, this.options.feet, this.options.nautic)
			});
		}

		this._shape.setRadius(radius);

		this._map.fire(BM.Draw.Event.EDITRESIZE, {layer: this._shape});
	}
});

BM.Circle.addInitHook(function () {
	if (BM.Edit.Circle) {
		this.editing = new BM.Edit.Circle(this);

		if (this.options.editable) {
			this.editing.enable();
		}
	}
});
