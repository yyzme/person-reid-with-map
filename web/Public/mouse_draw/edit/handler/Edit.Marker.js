BM.Edit = BM.Edit || {};

/**
 * @class BM.Edit.Marker
 * @aka Edit.Marker
 */
BM.Edit.Marker = BM.Handler.extend({
	// @method initialize(): void
	initialize: function (marker, options) {
		this._marker = marker;
		BM.setOptions(this, options);
	},

	// @method addHooks(): void
	// Add listener hooks to this handler
	addHooks: function () {
		var marker = this._marker;
		marker.dragging.enable();
		marker.on('dragend', this._onDragEnd, marker);
		this._toggleMarkerHighlight();
	},

	// @method removeHooks(): void
	// Remove listener hooks from this handler
	removeHooks: function () {
		var marker = this._marker;

		marker.dragging.disable();
		marker.off('dragend', this._onDragEnd, marker);
		this._toggleMarkerHighlight();
	},

	_onDragEnd: function (e) {
		var layer = e.target;
		layer.edited = true;
		this._map.fire(BM.Draw.Event.EDITMOVE, {layer: layer});
	},

	_toggleMarkerHighlight: function () {
		var icon = this._marker._icon;

		// Don't do anything if this layer is a marker but doesn't have an icon. Markers
		// should usually have icons. If using Leaflet.draw with Leaflet.markercluster there
		// is a chance that a marker doesn't.
		if (!icon) {
			return;
		}

		// This is quite naughty, but I don't see another way of doing it. (short of setting a new icon)
		icon.style.display = 'none';

		if (BM.DomUtil.hasClass(icon, 'leaflet-edit-marker-selected')) {
			BM.DomUtil.removeClass(icon, 'leaflet-edit-marker-selected');
			// Offset as the border will make the icon move.
			this._offsetMarker(icon, -4);

		} else {
			BM.DomUtil.addClass(icon, 'leaflet-edit-marker-selected');
			// Offset as the border will make the icon move.
			this._offsetMarker(icon, 4);
		}

		icon.style.display = '';
	},

	_offsetMarker: function (icon, offset) {
		var iconMarginTop = parseInt(icon.style.marginTop, 10) - offset,
			iconMarginLeft = parseInt(icon.style.marginLeft, 10) - offset;

		icon.style.marginTop = iconMarginTop + 'px';
		icon.style.marginLeft = iconMarginLeft + 'px';
	}
});

BM.Marker.addInitHook(function () {
	if (BM.Edit.Marker) {
		this.editing = new BM.Edit.Marker(this);

		if (this.options.editable) {
			this.editing.enable();
		}
	}
});
