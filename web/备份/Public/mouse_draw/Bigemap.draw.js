/**
 * Leaflet.draw assumes that you have already included the Leaflet library.
 */
BM.drawVersion = '0.4.2';
/**
 * @class BM.Draw
 * @aka Draw
 *
 *
 * To add the draw toolbar set the option drawControl: true in the map options.
 *
 * @example
 * ```js
 *      var map = BM.map('map', {drawControl: true}).setView([51.505, -0.09], 13);
 *
 *      BM.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
 *          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
 *      }).addTo(map);
 * ```
 *
 * ### Adding the edit toolbar
 * To use the edit toolbar you must initialise the Leaflet.draw control and manually add it to the map.
 *
 * ```js
 *      var map = BM.map('map').setView([51.505, -0.09], 13);
 *
 *      BM.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
 *          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
 *      }).addTo(map);
 *
 *      // FeatureGroup is to store editable layers
 *      var drawnItems = new BM.FeatureGroup();
 *      map.addLayer(drawnItems);
 *
 *      var drawControl = new BM.Control.Draw({
 *          edit: {
 *              featureGroup: drawnItems
 *          }
 *      });
 *      map.addControl(drawControl);
 * ```
 *
 * The key here is the featureGroup option. This tells the plugin which FeatureGroup contains the layers that
 * should be editable. The featureGroup can contain 0 or more features with geometry types Point, LineString, and Polygon.
 * Leaflet.draw does not work with multigeometry features such as MultiPoint, MultiLineString, MultiPolygon,
 * or GeometryCollection. If you need to add multigeometry features to the draw plugin, convert them to a
 * FeatureCollection of non-multigeometries (Points, LineStrings, or Polygons).
 */
BM.Draw = {};

/**
 * @class BM.drawLocal
 * @aka BM.drawLocal
 *
 * The core toolbar class of the API — it is used to create the toolbar ui
 *
 * @example
 * ```js
 *      var modifiedDraw = BM.drawLocal.extend({
 *          draw: {
 *              toolbar: {
 *                  buttons: {
 *                      polygon: 'Draw an awesome polygon'
 *                  }
 *              }
 *          }
 *      });
 * ```
 *
 * The default state for the control is the draw toolbar just below the zoom control.
 *  This will allow map users to draw vectors and markers.
 *  **Please note the edit toolbar is not enabled by default.**
 */
BM.drawLocal = {
	// format: {
	// 	numeric: {
	// 		delimiters: {
	// 			thousands: ',',
	// 			decimal: '.'
	// 		}
	// 	}
	// },
	draw: {
		toolbar: {
			// #TODO: this should be reorganized where actions are nested in actions
			// ex: actions.undo  or actions.cancel
			actions: {
				title: '取消',
				text: '取消'
			},
			finish: {
				title: '完成',
				text: '完成'
			},
			undo: {
				title: '删除最后一个点',
				text: '删除最后一个点'
			},
			buttons: {
				polyline: '线条',
				polygon: '多边形',
				rectangle: '矩形',
				circle: '圆',
				marker: '标注',
				circlemarker: '圆标注'
			}
		},
		handlers: {
			circle: {
				tooltip: {
					start: '单击开始'
				},
				radius: '半径'
			},
			circlemarker: {
				tooltip: {
					start: '单击地图开始'
				}
			},
			marker: {
				tooltip: {
					start: '单击地图开始'
				}
			},
			polygon: {
				tooltip: {
					start: '单击地图开始',
					cont: '',
					end: '单击第一个点完成'
				}
			},
			polyline: {
				error: '<strong>Error:</strong> 边界出错!',
				tooltip: {
					start: '单击地图开始',
					cont: '',
					end: '单击第一个点完成'
				}
			},
			rectangle: {
				tooltip: {
					start: '单击地图开始'
				}
			},
			simpleshape: {
				tooltip: {
					end: '松开鼠标结束'
				}
			}
		}
	},
	edit: {
		toolbar: {
			actions: {
				save: {
					title: '保存',
					text: '保存'
				},
				cancel: {
					title: '取消',
					text: 'Cancel'
				},
				clearAll: {
					title: '全部取消',
					text: '全部取消'
				}
			},
			buttons: {
				edit: '编辑',
				editDisabled: '请先选择一个要素',
				remove: '删除',
				removeDisabled: '没有删除的要素'
			}
		},
		handlers: {
			edit: {
				tooltip: {
					text: '单击定位点来编辑',
					subtext: ''
				}
			},
			remove: {
				tooltip: {
					text: '删除'
				}
			}
		}
	}
};
