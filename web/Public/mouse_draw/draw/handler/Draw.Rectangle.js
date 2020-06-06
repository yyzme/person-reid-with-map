/**
 * @class BM.Draw.Rectangle
 * @aka Draw.Rectangle
 * @inherits BM.Draw.SimpleShape
 */
BM.Draw.Rectangle = BM.Draw.SimpleShape.extend({
	statics: {
		TYPE: 'rectangle'
	},

	options: {
		shapeOptions: {
			stroke: true,
			color: '#3388ff',
			weight: 4,
			opacity: 0.5,
			fill: true,
			fillColor: null, //same as color by default
			fillOpacity: 0.2,
			clickable: true
		},
		showArea: true, //Whether to show the area in the tooltip
		metric: true // Whether to use the metric measurement system or imperial
	},

	// @method initialize(): void
	initialize: function (map, options) {
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = BM.Draw.Rectangle.TYPE;

		this._initialLabelText = BM.drawLocal.draw.handlers.rectangle.tooltip.start;

		BM.Draw.SimpleShape.prototype.initialize.call(this, map, options);
	},

	// @method disable(): void
	disable: function () {
		if (!this._enabled) {
			return;
		}

		this._isCurrentlyTwoClickDrawing = false;
		BM.Draw.SimpleShape.prototype.disable.call(this);
	},

	_onMouseUp: function (e) {
		if (!this._shape && !this._isCurrentlyTwoClickDrawing) {
			this._isCurrentlyTwoClickDrawing = true;
			return;
		}

		// Make sure closing click is on map
		if (this._isCurrentlyTwoClickDrawing && !_hasAncestor(e.target, 'bigemap-pane')) {
			return;
		}

		BM.Draw.SimpleShape.prototype._onMouseUp.call(this);
	},

	_drawShape: function (latlng) {
		if (!this._shape) {
			this._shape = new BM.Rectangle(new BM.LatLngBounds(this._startLatLng, latlng), this.options.shapeOptions);
			this._map.addLayer(this._shape);
		} else {
			this._shape.setBounds(new BM.LatLngBounds(this._startLatLng, latlng));
		}
	},

	_fireCreatedEvent: function () {
		var rectangle = new BM.Rectangle(this._shape.getBounds(), this.options.shapeOptions);
		BM.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, rectangle);
	},

	_getTooltipText: function () {
		var tooltipText = BM.Draw.SimpleShape.prototype._getTooltipText.call(this),
			shape = this._shape,
			showArea = this.options.showArea,
			latLngs, area, subtext;

		if (shape) {
			latLngs = this._shape._defaultShape ? this._shape._defaultShape() : this._shape.getLatLngs();
			area = BM.GeometryUtil.geodesicArea(latLngs);
			subtext = showArea ? BM.GeometryUtil.readableArea(area, this.options.metric) : '';
		}

		return {
			text: tooltipText.text,
			subtext: subtext
		};
	}
});

function _hasAncestor(el, cls) {
	while ((el = el.parentElement) && !el.classList.contains(cls)) {
		;
	}
	return el;
}
