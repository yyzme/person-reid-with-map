/**
 * @class BM.Draw.Toolbar
 * @aka Toolbar
 *
 * The toolbar class of the API — it is used to create the ui
 * This will be depreciated
 *
 * @example
 *
 * ```js
 *    var toolbar = BM.Toolbar();
 *    toolbar.addToolbar(map);
 * ```
 *
 * ### Disabling a toolbar
 *
 * If you do not want a particular toolbar in your app you can turn it off by setting the toolbar to false.
 *
 * ```js
 *      var drawControl = new BM.Control.Draw({
 *          draw: false,
 *          edit: {
 *              featureGroup: editableLayers
 *          }
 *      });
 * ```
 *
 * ### Disabling a toolbar item
 *
 * If you want to turn off a particular toolbar item, set it to false. The following disables drawing polygons and
 * markers. It also turns off the ability to edit layers.
 *
 * ```js
 *      var drawControl = new BM.Control.Draw({
 *          draw: {
 *              polygon: false,
 *              marker: false
 *          },
 *          edit: {
 *              featureGroup: editableLayers,
 *              edit: false
 *          }
 *      });
 * ```
 */
BM.Toolbar = BM.Class.extend({
	// @section Methods for modifying the toolbar

	// @method initialize(options): void
	// Toolbar constructor
	initialize: function (options) {
		BM.setOptions(this, options);

		this._modes = {};
		this._actionButtons = [];
		this._activeMode = null;

		var version = BM.version.split('.');
		//If Version is >= 1.2.0
		if (parseInt(version[0], 10) === 1 && parseInt(version[1], 10) >= 2) {
			BM.Toolbar.include(BM.Evented.prototype);
		} else {
			BM.Toolbar.include(BM.Mixin.Events);
		}
	},

	// @method enabled(): boolean
	// Gets a true/false of whether the toolbar is enabled
	enabled: function () {
		return this._activeMode !== null;
	},

	// @method disable(): void
	// Disables the toolbar
	disable: function () {
		if (!this.enabled()) {
			return;
		}

		this._activeMode.handler.disable();
	},

	// @method addToolbar(map): BM.DomUtil
	// Adds the toolbar to the map and returns the toolbar dom element
	addToolbar: function (map) {
		var container = BM.DomUtil.create('div', 'bigemap-draw-section'),
			buttonIndex = 0,
			buttonClassPrefix = this._toolbarClass || '',
			modeHandlers = this.getModeHandlers(map),
			i;

		this._toolbarContainer = BM.DomUtil.create('div', 'bigemap-draw-toolbar bigemap-bar');
		this._map = map;

		for (i = 0; i < modeHandlers.length; i++) {
			if (modeHandlers[i].enabled) {
				this._initModeHandler(
					modeHandlers[i].handler,
					this._toolbarContainer,
					buttonIndex++,
					buttonClassPrefix,
					modeHandlers[i].title
				);
			}
		}

		// if no buttons were added, do not add the toolbar
		if (!buttonIndex) {
			return;
		}

		// Save button index of the last button, -1 as we would have ++ after the last button
		this._lastButtonIndex = --buttonIndex;

		// Create empty actions part of the toolbar
		this._actionsContainer = BM.DomUtil.create('ul', 'bigemap-draw-actions');

		// Add draw and cancel containers to the control container
		container.appendChild(this._toolbarContainer);
		container.appendChild(this._actionsContainer);

		return container;
	},

	// @method removeToolbar(): void
	// Removes the toolbar and drops the handler event listeners
	removeToolbar: function () {
		// Dispose each handler
		for (var handlerId in this._modes) {
			if (this._modes.hasOwnProperty(handlerId)) {
				// Unbind handler button
				this._disposeButton(
					this._modes[handlerId].button,
					this._modes[handlerId].handler.enable,
					this._modes[handlerId].handler
				);

				// Make sure is disabled
				this._modes[handlerId].handler.disable();

				// Unbind handler
				this._modes[handlerId].handler
					.off('enabled', this._handlerActivated, this)
					.off('disabled', this._handlerDeactivated, this);
			}
		}
		this._modes = {};

		// Dispose the actions toolbar
		for (var i = 0, l = this._actionButtons.length; i < l; i++) {
			this._disposeButton(
				this._actionButtons[i].button,
				this._actionButtons[i].callback,
				this
			);
		}
		this._actionButtons = [];
		this._actionsContainer = null;
	},

	_initModeHandler: function (handler, container, buttonIndex, classNamePredix, buttonTitle) {
		var type = handler.type;

		this._modes[type] = {};

		this._modes[type].handler = handler;

		this._modes[type].button = this._createButton({
			type: type,
			title: buttonTitle,
			className: classNamePredix + '-' + type,
			container: container,
			callback: this._modes[type].handler.enable,
			context: this._modes[type].handler
		});

		this._modes[type].buttonIndex = buttonIndex;

		this._modes[type].handler
			.on('enabled', this._handlerActivated, this)
			.on('disabled', this._handlerDeactivated, this);
	},

	/* Detect iOS based on browser User Agent, based on:
	 * http://stackoverflow.com/a/9039885 */
	_detectIOS: function () {
		var iOS = (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);
		return iOS;
	},

	_createButton: function (options) {

		var link = BM.DomUtil.create('a', options.className || '', options.container);
		// Screen reader tag
		var sr = BM.DomUtil.create('span', 'sr-only', options.container);

		link.href = '#';
		link.appendChild(sr);

		if (options.title) {
			link.title = options.title;
			sr.innerHTML = options.title;
		}

		if (options.text) {
			link.innerHTML = options.text;
			sr.innerHTML = options.text;
		}

		/* iOS does not use click events */
		var buttonEvent = this._detectIOS() ? 'touchstart' : 'click';

		BM.DomEvent
			.on(link, 'click', BM.DomEvent.stopPropagation)
			.on(link, 'mousedown', BM.DomEvent.stopPropagation)
			.on(link, 'dblclick', BM.DomEvent.stopPropagation)
			.on(link, 'touchstart', BM.DomEvent.stopPropagation)
			.on(link, 'click', BM.DomEvent.preventDefault)
			.on(link, buttonEvent, options.callback, options.context);

		return link;
	},

	_disposeButton: function (button, callback) {
		/* iOS does not use click events */
		var buttonEvent = this._detectIOS() ? 'touchstart' : 'click';

		BM.DomEvent
			.off(button, 'click', BM.DomEvent.stopPropagation)
			.off(button, 'mousedown', BM.DomEvent.stopPropagation)
			.off(button, 'dblclick', BM.DomEvent.stopPropagation)
			.off(button, 'touchstart', BM.DomEvent.stopPropagation)
			.off(button, 'click', BM.DomEvent.preventDefault)
			.off(button, buttonEvent, callback);
	},

	_handlerActivated: function (e) {
		// Disable active mode (if present)
		this.disable();

		// Cache new active feature
		this._activeMode = this._modes[e.handler];

		BM.DomUtil.addClass(this._activeMode.button, 'bigemap-draw-toolbar-button-enabled');

		this._showActionsToolbar();

		this.fire('enable');
	},

	_handlerDeactivated: function () {
		this._hideActionsToolbar();

		BM.DomUtil.removeClass(this._activeMode.button, 'bigemap-draw-toolbar-button-enabled');

		this._activeMode = null;

		this.fire('disable');
	},

	_createActions: function (handler) {
		var container = this._actionsContainer,
			buttons = this.getActions(handler),
			l = buttons.length,
			li, di, dl, button;

		// Dispose the actions toolbar (todo: dispose only not used buttons)
		for (di = 0, dl = this._actionButtons.length; di < dl; di++) {
			this._disposeButton(this._actionButtons[di].button, this._actionButtons[di].callback);
		}
		this._actionButtons = [];

		// Remove all old buttons
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}

		for (var i = 0; i < l; i++) {
			if ('enabled' in buttons[i] && !buttons[i].enabled) {
				continue;
			}

			li = BM.DomUtil.create('li', '', container);

			button = this._createButton({
				title: buttons[i].title,
				text: buttons[i].text,
				container: li,
				callback: buttons[i].callback,
				context: buttons[i].context
			});

			this._actionButtons.push({
				button: button,
				callback: buttons[i].callback
			});
		}
	},

	_showActionsToolbar: function () {
		var buttonIndex = this._activeMode.buttonIndex,
			lastButtonIndex = this._lastButtonIndex,
			toolbarPosition = this._activeMode.button.offsetTop - 1;

		// Recreate action buttons on every click
		this._createActions(this._activeMode.handler);

		// Correctly position the cancel button
		this._actionsContainer.style.top = toolbarPosition + 'px';

		if (buttonIndex === 0) {
			BM.DomUtil.addClass(this._toolbarContainer, 'bigemap-draw-toolbar-notop');
			BM.DomUtil.addClass(this._actionsContainer, 'bigemap-draw-actions-top');
		}

		if (buttonIndex === lastButtonIndex) {
			BM.DomUtil.addClass(this._toolbarContainer, 'bigemap-draw-toolbar-nobottom');
			BM.DomUtil.addClass(this._actionsContainer, 'bigemap-draw-actions-bottom');
		}

		this._actionsContainer.style.display = 'block';
		this._map.fire(BM.Draw.Event.TOOLBAROPENED);
	},

	_hideActionsToolbar: function () {
		this._actionsContainer.style.display = 'none';

		BM.DomUtil.removeClass(this._toolbarContainer, 'bigemap-draw-toolbar-notop');
		BM.DomUtil.removeClass(this._toolbarContainer, 'bigemap-draw-toolbar-nobottom');
		BM.DomUtil.removeClass(this._actionsContainer, 'bigemap-draw-actions-top');
		BM.DomUtil.removeClass(this._actionsContainer, 'bigemap-draw-actions-bottom');
		this._map.fire(BM.Draw.Event.TOOLBARCLOSED);
	}
});
