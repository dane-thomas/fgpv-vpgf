/**
 * ### What's new
 * 
 * #### September 14
 * - Added namespace `GEOMETRY` which houses, you guessed it, geometry related classes
 * - Added `ConfigLayer` and `SimpleLayer` to `RV.LAYER` namespace (still a WIP)
 *     - `ConfigLayer` is more or less a `LegendNode` in `legend-block.class.js`. It is created via JSON layer config snippets. Geometry changes (add/remove) are not supported.
 *     - `SimpleLayer` is created programmatically and allows for full geometry.
 * 
 * @see {@link RV.LAYER}
 * @see {@link RV.GEOMETRY}
 * 
 * *********
 * 
 * ### Introduction
 * 
 * The API is available through the global `RV` namespace, after the `rv-main.js` file is added to the host page.
 * 
 * ```html
 * <html>
 * <head>
 * <!-- load any css -->
 * </head>
 * <body>
 *     <div id="myMap"></div>
 *     <script src="rv-main.js" />
 *     <script>
 *         // lets initialize our map
 *         const mapInstance = new RV.Map(document.getElementById('myMap'), 'mapConfig.json');
 *     </script>
 * </body>
 * </html>
 * ```
 * 
 * We should see a map pop-up on the screen, but this won't work. The API may not be ready by the time the javascript engine reaches our
 * custom script tag. So, we initalize our code inside a function that is guaranteed to be available even if the API isn't, and is invoked
 * when the API is ready:
 * 
 * ```js
 * // lets initialize our map
 * RV.onReady(function() {
 *     const mapInstance = new RV.Map(document.getElementById('myMap'), 'mapConfig.json');
 * });
 * ```
 * <br>
 * #### LayerGroups & Layers
 * 
 * The final design of what exactly a layer will be is yet to be determined - so there will be some magic hand waving in some places to illustrate 
 * how layers in a general sense are handled.
 * 
 * Layers so far have:
 *     - geometry -> things that are visualized on the map
 *     - properties -> data, like those found in a data table
 *     - settings -> for things like opacity
 * 
 * Layers will in most cases reside in a `LayerGroup` - a fancy version of an array with special properties and events to make handling many of them easier.
 * 
 * ```js
 * // lets create two layers with my magic wand
 * const myLayer1 = new MagicLayer();
 * const myLayer2 = new MagicLayer();
 * 
 * const layerGroup1 = new RV.LAYER.LayerGroup();
 * layerGroup1.add(myLayer1);
 * layerGroup1.add(myLayer2);
 * ```
 * 
 * Pretty boring so far. How about we open an external data table whenever a layer has data to show (again with a lot of magic)?
 * 
 * ```js
 * layerGroup1.addListener('properties_loaded', function(layerName, properties) {
 *     magicDatatable.open(properties);
 * });
 * 
 * myLayer2.setProperties([{objectid: 1, title: 'A Title'}, {objectid: 2, title: 'Another Title'}]);
 * ```
 * <br>
 * #### Using layerGroups
 * 
 * A `layerGroup` can define the list of available basemaps, layers on a map, or in a legend. Lets add a layer to the map and show it in the legend
 * 
 * ```js
 * // show on the map
 * mapInstance.layers.add(myLayer2);
 * myLayer2.setOpacity(0); // where did it go? It's hidden!
 * myLayer2.setOpacity(70); // that's better
 * 
 * // Its not yet in the legend, lets add it
 * const specificLegendEntry = mapInstance.ui.legend.getById('legendGroup1');
 * specificLegendEntry.add(myLayer2);
 * 
 * // And lets add a custom element after it, just because we can...
 * var legendDiv = document.createElement('div');
 * $(legendDiv).html('Some text...');
 * specificLegendEntry.add(legendDiv);
 * ```
 * 
 * The process is similar with basemaps.
 * 
 * #### UI control
 * 
 * We can open and close panels like:
 * 
 * ```js
 * mapInstance.ui.panels.getById('left').open();
 * ```
 * 
 * Of course we would be opening an empty panel. Lets try this again:
 * ```js
 * mapInstance.ui.panels.addListener('opened', function(panel) {
 *     if (panel.getId() === 'left')
 *         panel.setContent(aDivNode);
 * });
 * 
 * mapInstance.ui.panels.getById('left').open();
 * ```
 * 
 * We can also stop panels from opening or closing by listening to the `opening` and `closing` events like so:
 * 
 * ```js
 * mapInstance.ui.panels.addListener('closing', function(panel, event) {
 *     if (panel.getId() === 'left')
 *         event.stop();
 * });
 * ```
 * 
 * Apart from that, `mapInstance.ui.anchors` provides dom nodes of common places in the viewer you may want to edit or add.
 * Adding a custom map control is easy:
 * 
 * ```js
 * $(mapInstance.ui.anchors.MAP_CONTROLS).append('<div>my control</div>');
 * ```
 * <br>
 * ### Event based with MVCObject & MVCArray
 * 
 * Both API users and our backend API implementation will rely on events to signal changes. When a user changes certain properties in the API
 * an event is triggered in the core viewer. Likewise, any backend API changes trigger events which API users can listen to.
 * 
 * Available events are documented throughout this API. 
 * 
 * `MVCObject` & `MVCArray` are custom implementations based off similar Google MVC object designs.
 * 
 */

export declare module RV {
    /** A map instance is needed for every map on the page. To display `x` number of maps at the same time, you'll need `x` number of map instances,
     * with separate div containers for each one.
     * 
     * @example <br><br>
     * 
     * ```js
     * var mapInstance = new Map(document.getElementById('map'));
     * ```
     */
    export class Map extends MVCObject {
        /** Creates a new map inside of the given HTML container, which is typically a DIV element. 
         * If opts is a string then it is considered to be a url to a json config snippet of a map.
        */
        constructor(mapDiv: HTMLElement, opts?: Object | JSON | string);

        /**
         * Contains UI related functionality.
         * 
         * @example #### Adding data tags on the side menu buttons for Google tag manager integration <br><br>
         * 
         * ```js
         * $(mapInstance.ui.anchors.SIDE_MENU.GROUPS).find('button').each(function(node) {
         *     node.data('google-tag', '');
         * });
         * ```
         * 
         * @example #### Opening the left side menu panel<br><br>
         * 
         * ```js
         * mapInstance.ui.panels.getById('sideMenu').open();
         * ```
         * 
         * @example #### Adding a map control button<br><br>
         * ```js
         * var controlDiv = document.createElement('div');
         * controlDiv.style.backgroundColor = '#fff'; // style as needed
         * $(mapInstance.ui.anchors.MAP_CONTROLS).appendChild(controlDiv);
         * ```
         */
        ui: {
            anchors: UI.anchorPoints;
            panels: UI.PanelRegistry;
            legend: UI.LegendEntry;
            basemaps: UI.Basemap;
        };

        /** 
         * Every Map has a `layers` object by default, so there is no need to initialize one - even if the map has no layers.
         * 
         * @example #### Add geoJSON & getting a layer by its ID <br><br>
         * 
         * ```js
         * var mapInstance = new RV.Map(...);
         * mapInstance.layers.addGeoJson(...);
         * mapInstance.layers.getLayerById(...); 
         * ```
         */
        layers: LAYER.LayerGroup;

        /** Returns the position displayed at the center of the map.  */
        setCenter(latlng: RV.GEOMETRY.LatLng | RV.GEOMETRY.LatLngLiteral) : void;
        setZoom(zoom: number) : void;
        /** Changes the center of the map to the given LatLng. If the change is less than both the width and height of the map, the transition will be smoothly animated. */
        panTo(latLng: RV.GEOMETRY.LatLng | RV.GEOMETRY.LatLngLiteral) : void;
        /** Changes the center of the map by the given distance in pixels. If the distance is less than both the width and height of the map, the transition will be smoothly animated.  */
        panBy(x: number, y: number) : void;
        getZoom(): number;
        /** Returns the current Projection, based on currently active basemap projection. */
        getProjection(): Projection;
        getDiv(): HTMLElement;
        getCenter(): RV.GEOMETRY.LatLng;
        getBounds(): RV.GEOMETRY.LatLngBounds;
        /** Puts the map into full screen mode when enabled is true, otherwise it cancels fullscreen mode. */
        fullscreen(enabled: boolean) : void;

        /** 
         * This event is fired when the viewport boundary changes.
         * @event bounds_changed
         * @property {RV.GEOMETRY.LatLngBounds} newBounds
         */
        bounds_changed: Event;

        /** 
         * This event is fired when the map center property changes.
         * @event center_changed
         * @property {latlng} newLatLng
         */
        center_changed: Event;

        /** 
         * This event is fired when the user clicks on the map, but does not fire for clicks on panels or other map controls.
         * @event click
         * @property {Event.MouseEvent} event
         */
        click: Event;

        /** 
         * This event is fired when the users mouse moves over the map, but does not fire for movement over panels or other map controls.
         * @event mousemove
         * @property {Event.MouseEvent} event
         */
        mousemove: Event;

        /** 
         * This event is fired when the map projection changes.
         * @event projection_changed
         * @property {Projection} projection
         */
        projection_changed: Event;

        /** 
         * This event is fired when the maps zoom level changes.
         * @event zoom_changed
         * @property {number} zoom
         */
        zoom_changed: Event;
    }

    export interface Projection {
        /** Translates from the LatLng cylinder to the Point plane. This interface specifies a function which implements translation from given LatLng values to world coordinates on the map projection. The Maps API calls this method when it needs to plot locations on screen. Projection objects must implement this method. */
        fromLatLngToPoint(latLng: RV.GEOMETRY.LatLng, point?: RV.GEOMETRY.CoordinatePoint);
        /** This interface specifies a function which implements translation from world coordinates on a map projection to LatLng values. The Maps API calls this method when it needs to translate actions on screen to positions on the map. Projection objects must implement this method. */
        fromPointToLatLng(pixel: RV.GEOMETRY.CoordinatePoint, nowrap?: boolean);
    }

    /** The MVCObject constructor is guaranteed to be an empty function, and so you may inherit from MVCObject by simply writing `MySubclass.prototype = new google.maps.MVCObject();`. Unless otherwise noted, this is not true of other classes in the API, and inheriting from other classes in the API is not supported. */
    export class MVCObject {
        /** 
         * Adds the given listener function to the given event name. 
         * Returns an identifier for this listener that can be used with RV.event.removeListener. 
         * 
         * @see {@link RV.event.addListener}
         * */
        addListener(eventName: string, handler: Function): MapsEventListener;
        /** Returns the value of the property specified by 'key' */
        get(key: string): any;
        /** Sets 'value' to 'key' on 'this'. */
        set(key: string, value?: any): MVCObject;
        /** Generic handler for state changes. Override this in derived classes to handle arbitrary state changes. 
         * @example <br><br>
         * ```js
         * var m = new MVCObject();
         * m.changed = sinon.spy();
         * m.set('k', 1);
         * m.changed.should.have.been.calledOnce;
         * ```
        */
        changed(...args: any[]): void;
        /** Notify all observers of a change on this property. This notifies both objects that are bound to the object's property as well as the object that it is bound to. */
        notify(key: string): MVCObject;
        /** Sets a collection of key-value pairs. */
        setValues(values: any): MVCObject;
        /** Updates value of target.targetKey to this.key whenever it is updated.  */
        bindTo(key: string, target: MVCObject, targetKey?: string, noNotify?: boolean): MVCObject;
        /** Removes a binding. */
        unbind(key: string): MVCObject;
        /** Removes all bindings. */
        unbindAll(): MVCObject;
    }

    export interface MapsEventListener {
        /** Removes the listener. Calling listener.remove() is equivalent to RV.event.removeListener(listener). */
        remove(): void;
    }

    export class MVCArray<A> extends MVCObject {
        constructor(array?: Array<A>);
        /** Removes all elements from the array. */
        clear();
        /** Iterate over each element, calling the provided callback. The callback is called for each element like: callback(element, index). */
        forEach(callback: (element: A, index: number) => void);
        /** Returns a reference to the underlying Array. Warning: if the Array is mutated, no events will be fired by this object. */
        getArray(): Array<A>;
        /** Returns the element at the specified index. */
        getAt(i:number): A;
        /** Returns the number of elements in this array. */
        getLength(): number;
        /** Inserts an element at the specified index. */
        insertAt(i: number, elem: A);
        /** Removes the last element of the array and returns that element. */
        pop(): A;
        /** Adds one element to the end of the array and returns the new length of the array. */
        push(elem: A): number;
        /** Removes an element from the specified index. */
        removeAt(i:number): A;
        /** Sets an element at the specified index. */
        setAt(i:number, elem: A);

        /** 
         * This event is fired when insertAt() is called. The event passes the index that was passed to insertAt().
         * @event insert_at
         * @property {number} index
         */
        insert_at: Event;

        /** 
         * This event is fired when removeAt() is called. The event passes the index that was passed to removeAt() and the element that was removed from the array.
         * @event remove_at
         * @property {number} index
         * @property {any} element
         */
        remove_at: Event; 
        /** 
         * This event is fired when setAt() is called. The event passes the index that was passed to setAt() and the element that was previously in the array at that index.
         * @event set_at
         * @property {number} index
         * @property {any} element
         */
        set_at: Event;
    }

    
    /**
     * ### BaseGeometry
     * Geometry types extend `BaseGeometry`, such as `Point`, `MultiPoint`, `LineString`, and `MultiLineString`.
     * 
     * ### LayerGeometry
     * Makes handling various types of geometry easier on simple layers.
     * 
     * ### Geometry units
     * All geometry is calculated in latitude / longitude. In general `LatLngLiteral` and `LatLngBoundsLiteral` can be used in places where
     * `LatLng` and `LatLngBounds` are used and will be converted into their respective instance classes automatically.
     */
    export module GEOMETRY {

        /** A LatLngBounds instance represents a rectangle in geographical coordinates. */
        export class LatLngBounds {
            /** Constructs a rectangle from the points at its south-west and north-east corners. */
            constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
            /** Returns true if the given lat/lng is in this bounds. */
            contains(latLng: LatLng | LatLngLiteral): boolean;
            equals(other:LatLngBounds | LatLngBoundsLiteral): boolean;
            /** Extends this bounds to contain the given point. */
            extend(point:LatLng|LatLngLiteral): LatLngBounds;
            /** Computes the center of this LatLngBounds. */
            getCenter(): LatLng;
            /** Returns the north-east corner of this bounds. */
            getNorthEast(): LatLng;
            /** Returns the south-west corner of this bounds. */
            getSouthWest(): LatLng;
            /** Returns true if this bounds shares any points with the other bounds. */
            intersects(other: LatLngBounds | LatLngBoundsLiteral): boolean;
            /** Returns if the bounds are empty. */
            isEmpty(): boolean;
            /** Converts to JSON representation. This function is intended to be used via JSON.stringify. */
            toJSON(): LatLngBoundsLiteral
            /** Converts to string. */
            toString(): string;
            /** Returns a string of the form "lat_lo,lng_lo,lat_hi,lng_hi" for this bounds, where "lo" corresponds to the southwest corner of the bounding box, while "hi" corresponds to the northeast corner of that box. */
            toUrlValue(precision?:number): string;
            /** Extends this bounds to contain the union of this and the given bounds. */
            union(other: LatLngBounds | LatLngBoundsLiteral): LatLngBounds;
        }

        /** Object literals are accepted in place of LatLngBounds objects throughout the API. These are automatically converted to LatLngBounds objects. All south, west, north and east must be set, otherwise an exception is thrown. */
        export interface LatLngBoundsLiteral {
            /** East longitude in degrees. */
            east: number;
            /** North latitude in degrees. */
            north: number;
            /** South latitude in degrees. */
            south: number;
            /** West longitude in degrees. */
            west: number;
        }
        export class CoordinatePoint {
            constructor(x: number, y: number);
            /** Compares two Points. */
            equals(other: Point): boolean;
            /** Returns a string representation of this Point. */
            toString(): string;
            /** The X coordinate */
            x: number;
            /** The Y coordinate */
            y: number;
        }

        export class LatLng  {
            /** Creates a LatLng object representing a geographic point. */
            constructor(lat: number, lng: number);
            /** Comparison function. */
            equals(other:LatLng): boolean;
            /** Returns the latitude in degrees. */
            lat(): number;
            /** Returns the longitude in degrees. */
            lng();
            /** Converts to JSON representation. This function is intended to be used via JSON.stringify. */
            toJSON(): LatLngLiteral;
            /** Converts to string representation. */
            toString(): string;
            /** Returns a string of the form "lat,lng" for this LatLng. We round the lat/lng values to 6 decimal places by default. */
            toUrlValue(precision?: number): string;
        }
    
        export interface LatLngLiteral {
            /** Latitude in degrees. */
            lat: number;
            /** Longitude in degrees. */
            lng: number;
        }

        /**
         * All geometry types must derive from this class. Not intented to be instantiated on its own.
         */
        export class BaseGeometry {
            constructor(id: string);
            /** Repeatedly invokes the given function, passing a point from the geometry to the function on each invocation. */
            forEachLatLng(callback: (latLng: LatLng) => void)
            /** Returns the type of the geometry object. Possibilities are "Point", "MultiPoint", "LineString", or "MultiLineString". */
            getType(): string;
            /** Returns the geometry id. */
            getId(): string;
        }

        export class LayerGeometry {
            /** Recursively calls callback for every geometry. */
            forEach(callback: (geometry: BaseGeometry) => void): void;
            /** Sets the value of a data item by key. */
            setGeometry(geometry: BaseGeometry | LatLng | LatLngLiteral): void;
            /** Returns the value of the requested data, or undefined if the data does not exist. */
            getGeometry(): Array<BaseGeometry>;
            /**
             * Removes geometry
             * @param geometry any strings should reference a particular geometry instance with that ID. If undefined, all geometry is removed.
             */
            removeGeometry(geometry: Array<string> | string | undefined): void;
    
            /** 
             * This event is triggered whenever geometry is added.
             * @event geometry_added
             * @property {Array<BaseGeometry>} geometry
             * 
             */
            geometry_added: Event;
    
            /** 
             * This event is triggered whenever geometry is removed.
             * @event geometry_removed
             * @property {Array<BaseGeometry>} geometry
             * 
             */
            geometry_removed: Event;
        }

        /** A Point geometry contains a single LatLng. */
        export class Point extends RV.GEOMETRY.BaseGeometry {
            /** Constructs a Point from the given LatLng or LatLngLiteral. */
            constructor(latLng: RV.GEOMETRY.LatLng | RV.GEOMETRY.LatLngLiteral);
            /** Returns the contained LatLng. */
            get(): RV.GEOMETRY.LatLng;
            /** Returns the string "Point". */
            getType(): string;

            /** URL of icon to be displayed on the map. */
            icon: string;
        }

        /** A MultiPoint geometry contains a number of LatLngs. */
        export class MultiPoint extends RV.GEOMETRY.BaseGeometry {
            /** Constructs a MultiPoint from the given LatLngs or LatLngLiterals. */
            constructor(elements: Array<RV.GEOMETRY.LatLng | RV.GEOMETRY.LatLngLiteral>);
            /** Returns an array of the contained LatLngs. A new array is returned each time getArray() is called. */
            getArray(): Array<RV.GEOMETRY.LatLng>
            /** Returns the n-th contained LatLng. */
            getAt(n: number): RV.GEOMETRY.LatLng;
            /** Returns the number of contained LatLngs. */
            getLength(): number;
            /** Returns the string "MultiPoint". */
            getType(): string;
        }

        /** A LineString geometry contains a number of LatLngs. */
        export class LineString extends MultiPoint {
            /** Returns the string "LineString". */
            getType(): string;
        }

        /** A MultiLineString geometry contains a number of LineStrings. */
        export class MultiLineString extends RV.GEOMETRY.BaseGeometry {
            /** Constructs a MultiLineString from the given LineStrings or arrays of positions. */
            constructor(elements: Array<LineString | Array<RV.GEOMETRY.LatLng | RV.GEOMETRY.LatLngLiteral>>);
            /** Returns an array of the contained LineStrings. A new array is returned each time getArray() is called. */
            getArray(): Array<LineString>;
            /** Returns the n-th contained LineString. */
            getAt(n:number): Array<LineString>;
            /** Returns the number of contained LatLngs. */
            getLength(): number;
            /** Returns the string "MultiLineString". */
            getType(): string;
        }
    }

    /**
     * The layer namespace encapsulates the various types of layers and layer sub classes such as geometry.
     */
    export module LAYER {

        export class LayerData {
            /** Recursively calls callback for every data item. */
            forEach(callback: (data: DataItem) => void): void;
            /** Sets the value of a data item by key. */
            setData(key: string, newValue: any): void;
            /** Sets data for each key-value pair in the provided object. */
            setData(keyValue: Object): void;
            /** Returns the value of the requested data, or undefined if the data does not exist. */
            getData(key: string): any;
            /** Returns all data. If applicable, this will pull data from a server, however an empty array will still be
             * returned if no prior data existed. Use the `data_added` event to determine when pulled data is ready.
             */
            getData(): Array<DataItem>;
            /** Removes the data with the given key, or all data if key is undefined. */
            removeData(key: string | undefined): void;
    
            /** 
             * This event is triggered whenever one or more data items are added.
             * @event data_added
             * @property {Array<DataItem>} data
             * 
             */
            data_added: Event;
    
            /** 
             * This event is triggered whenever an existing data entry is updated.
             * @event data_changed
             * @property {DataItem} dataBeforeChange
             * @property {DataItem} dataAfterChange
             * 
             */
            data_changed: Event;
    
            /** 
             * This event is triggered when data is removed.
             * @event data_removed
             * @property {Array<DataItem>} deletedData
             */
            data_removed: Event;
        }
    
        export interface DataItem {
            name: string;
            value: string | number;
        }

        export class BaseLayer {
            data: LayerData;
    
            /** Returns the name of the layer.  */
            getName(): string;
            /** Sets the name of the layer. This updates the name throughout the viewer. */
            setName(name: string): void;
            /** Returns the opacity of the layer on the map from 0 (hidden) to 100 (fully visible) */
            getOpacity(): number;
            /** Sets the opacity value.
             * @returns boolean true if opacity was set successfully, false otherwise (some layers or configurations may not support this)
             */
            setOpacity(opacity: number): boolean;
            /** Exports the layer to a GeoJSON object. */
            toGeoJson(callback: (obj: Object) => void): void;
    
            /** 
             * This event is triggered when the opacity changes.
             * @event setproperty
             */
            opacity_changed: Event;
        }
    
        export class ConfigLayer extends BaseLayer {
            /** Requires a schema valid JSON config layer snippet.  */
            constructor(config: JSON);
            /** Returns the underlying layer type such as esriFeature, esriDynamic, and ogcWms. */
            getType(): string;
            /** Returns the layer ID. */
            getId(): string;
    
            /** 
             * This event is fired when the layers state changes.
             * 
             * The state can be one of 'rv-error', 'rv-bad-projection', 'rv-loading', 'rv-refresh', and 'rv-loaded'. 
             * This event is always fired at least once with 'rv-loading' as the first state type.
             * @event state_changed
             * @property {string} stateName
             */
            state_changed: Event;
        }
    
        /**
         * A simple layer is one created programmatically, without the use of a config construct. 
         */
        export class SimpleLayer extends BaseLayer {
            constructor(name: string);
            geometry: RV.GEOMETRY.LayerGeometry;
        }

        export class LayerGroup extends MVCObject {
            /** Adds the provided layer to the group, and returns the added layer.
             * 
             * If the layer has an ID, it will replace any existing layer in the collection with the same ID. If no layer or JSON is given, a new layer will be created with null geometry and no properties.
             * 
             * Note that the IDs 1234 and '1234' are equivalent. Adding a layer with ID 1234 will replace a layer with ID '1234', and vice versa.
             */
            add(layer?: BaseLayer): BaseLayer;
            /** Adds GeoJSON layers to the collection. Give this method a parsed JSON. The imported layers are returned. Throws an exception if the GeoJSON could not be imported. */
            addGeoJson(geoJson: Object): Array<BaseLayer>;
            /** Checks whether the given layer is in the collection. */
            contains(layer: BaseLayer): boolean;
            /** Repeatedly invokes the given function, passing a layer in the collection to the function on each invocation. The order of iteration through the layers is undefined. */
            forEach(callback: (layer: BaseLayer) => void);
            /** Returns the layer with the given ID, if it exists in the collection. Otherwise returns undefined.
             * 
             * Note that the IDs 1234 and '1234' are equivalent. Either can be used to look up the same layer.
             */
            getLayerById(id: number | string): BaseLayer | undefined;
            /** Loads GeoJSON from a URL, and adds the layers to the collection. */
            loadGeoJson(url: string, callback?: (layers: Array<BaseLayer>) => void): void;
            /** Removes a layer from the collection. */
            remove(layer: BaseLayer): void;
            /** Exports the layers in the collection to a GeoJSON object. */
            toGeoJson(callback: (object: Object) => void);

            /** 
             * This event is fired when a layer is added to the collection.
             * @event addlayer
             * @property {BaseLayer} layer
             */
            addlayer: Event;

            /** 
             * This event is fired when a layer is removed to the collection.
             * @event removelayer
             * @property {BaseLayer} layer
             */
            removelayer: Event;

            /** 
             * This event is fired for a click on the geometry.
             * @event click
             * @property {Event.MouseEvent} event
             */
            click: Event;

            /** 
             * This event is fired when a layer's geometry is set.
             * @event setgeometry
             * @property {BaseLayer} layer
             * @property {BaseGeometry} newGeometry
             * @property {BaseGeometry} oldGeometry
             */
            setgeometry: Event;

            /** 
             * This event is fired when a layer's property is set.
             * @event setproperty
             * @property {BaseLayer} layer
             * @property {string} name - the property name
             * @property {any} newValue
             * @property {any} oldValue - The previous value. Will be undefined if the property was added.
             */
            setproperty: Event;

            /** 
             * This event is fired when a set of layer property is set.
             * @event setproperty
             * @property {BaseLayer} layer
             * @property {object} properties - key-value pair of the set values
             */
            properties_loaded: Event;

            /** 
             * This event is fired when a layer's property is removed.
             * @event removeproperty
             * @property {BaseLayer} layer
             * @property {string} name - the property name
             * @property {any} oldValue
             */
            removeproperty: Event;
        }
    }

    /** Defines UI component classes and interfaces. */
    export module UI {

        /**
         * Defines a basemap which is selectable from the basemap panel once added to the map. For example:
         * 
         * ```js
         * var myBasemap = new RV.UI.Basemap('My Custom Basemap', 'A personal favorite of mine.', [myLayer1, myLayer2]);
         * myBasemap.setActive(true); // make active so it is displayed when added.
         * mapInstance.set('basemaps', myBasemap);
         * ```
         * 
         * @example <br><br>
         * 
         * ```js
         * var firstBasemap = mapInstance.ui.basemaps.getLayerById(0);
         * firstBasemap.addListener('active_changed', function(isActive) {
         *     if (isActive) {
         *         firstBasemap.setName('Active Basemap');
         *     }
         * });
         * ```
         */
        export class Basemap extends LAYER.LayerGroup {
            constructor(name: string, layers: Array<RV.LAYER.BaseLayer> | RV.LAYER.BaseLayer, description?: string);
            getName(): string;
            setName(name: string): void;
            getDescription(): string;
            setDescription(desc: string): void;
            /** Returns true if this basemap is currently shown on the map. */
            isActive(): boolean;
            setActive(active: boolean): void;
            /** Derived from the layer projections that compose this basemap. You cannot set a projection. */
            getProjection(): Projection;
            
            /**
             * @event name_changed
             * @property {string} name - The new name
             */
            name_changed: Event;

            /**
             * @event description_changed
             * @property {string} description - The new description
             */
            description_changed: Event;

            /**
             * @event active_changed
             * @property {string} isActive
             */
            active_changed: Event;
        }

        /** Dom nodes for places of interest around the viewer for easier selector location. */
        export interface anchorPoints {
            /** The side menu slide out panel */
            SIDE_MENU: {
                TITLE_IMAGE: Node;
                TITLE: Node;
                GROUPS: MVCArray<Node>;
                FOOTER: Node;
            };
            /** Map navigation controls found at bottom right. */
            MAP_CONTROLS: Node;
            /** Basemap - top right */
            BASEMAP: Node;
            /** Legend action bar containing import, show/hide all, and toggle open/closed */
            LEGEND_BAR: Node;
            /** Main legend section containing legend items */
            LEGEND: Node;
        }

        /**
         * @todo Discuss if we should add more panel locations?
         * 
         * <br><br>
         * ```text
         * Panel types:
         *  sideMenu    -   Left siding menu panel
         *  legend      -   Legend panel
         *  import      -   Import wizard
         *  details     -   Layer details
         *  basemap     -   Basemap selector slider menu
         * 
         * There are also top level types:
         *  left    -   contains legend, import, details
         *  center  -   datatables
         * ```
         */
        export class PanelRegistry {
            /** Returns a panel by the given id */
            getById(id: string): Panel | undefined;
            forEach(callback: (panel: Panel) => void): void;

            /** 
             * This event is fired when a panel is fully open and content is finished rendering.
             * @event opened
             * @property {Panel} Panel
             */
            opened: Event;
            
            /** 
             * This event is fired when a panel is fully closed.
             * @event closed
             * @property {Panel} Panel
             */
            closed: Event;

            /** 
             * This event is fired before a panel starts to open. Calling `event.stop()` prevents the panel from opening.
             * @event opening
             * @property {Panel} Panel
             * @property {Event.StoppableEvent} event
             * @property {Node} content
             */
            opening: EVENT.StoppableEvent;

            /** 
             * This event is fired before a panel starts to close. Calling `event.stop()` prevents the panel from closing.
             * @event closing
             * @property {Panel} Panel
             * @property {Event.StoppableEvent} event
             */
            closing: EVENT.StoppableEvent;
        }

        /**
         * Note that opening legend when details is open will close details first. Events will be fired for auto closed panels.
         */
        export class Panel {
            /** Returns the panel identifier, can be "featureDetails", "legend", ... */
            getId(): string;
            /** Opens this panel in the viewer */
            open(): void;
            /** Closes this panel in the viewer */
            close(): void;
            isOpen(): boolean;
            /** Returns the dom node of the panel content. */
            getContent(): Node;
            /**
             * You can provide a dom node to set as the panels content.
             */
            setContent(node: Node): void;
            
            /** 
             * This event is fired when the panel is fully open and content is finished rendering.
             * @event opened
             */
            opened: Event;

            /** 
             * This event is fired when the panel is fully closed.
             * @event closed
             */
            closed: Event;

            /** 
             * This event is fired before the panel starts to open. Calling `event.stop()` prevents the panel from opening.
             * @event opening
             * @property {Event.StoppableEvent} event
             * @property {Node} content
             */
            opening: EVENT.StoppableEvent;

            /** 
             * This event is fired before the panel starts to close. Calling `event.stop()` prevents the panel from closing.
             * @event closing
             * @property {Event.StoppableEvent} event
             */
            closing: EVENT.StoppableEvent;
        }

        export class LegendEntry {

            constructor(id: string, title?: string);
            /** Displayed as the entry title in the legend.  */
            setTitle(title: string): void;
            /** Adds an entry to this legend block. */
            add(member: RV.LAYER.LayerGroup | Node | LegendEntry): void;
            /** Returns the dom node containing this legend entry. */
            getNode(): Node;
            /** Returns any descendents of this legend entry */
            getMembers(): RV.LAYER.LayerGroup | Node | LegendEntry;
            /** Returns the legendEntry with the specified id only if this or a member of this legendEntry has the id set. */
            getById(id: string): LegendEntry | undefined;
        }
    }

    /**
     * Uses the `RV.Event` namespace. Handles event registration on MVCObjects and on DOM Nodes.
     * 
     * @example The following two statements are equivalent <br><br>
     * 
     * ```js
     * mapInstance.addListener('bounds_changed', function() {...});
     * RV.Event.addListener(mapInstance, 'bounds_changed', function() {...});
     * ```
     */
    export module EVENT {
        /** Cross browser event handler registration. This listener is removed by calling removeListener(handle) for the handle that is returned by this function. */
        export function addDomListener(instance: Object, eventName: string, handler: Function, capture?: boolean): MapsEventListener;
        /** Wrapper around addDomListener that removes the listener after the first event. */
        export function addDomListenerOnce(instance: Object, eventName: string, handler: Function, capture?: boolean): MapsEventListener;
        /** Adds the given listener function to the given event name for the given object instance. Returns an identifier for this listener that can be used with removeListener(). */
        export function addListener(instance: Object, eventName: string, handler: Function): MapsEventListener;
        /** Like addListener, but the handler removes itself after handling the first event. */
        export function addListenerOnce(instance:Object, eventName:string, handler:Function): MapsEventListener;
        /** Removes all listeners for all events for the given instance. */
        export function clearInstanceListeners(instance: Object);
        /** Removes all listeners for the given event for the given instance. */
        export function clearListeners(instance: Object, eventName: string);
        /** Removes the given listener, which should have been returned by addListener above. Equivalent to calling listener.remove(). */
        export function removeListener(listener: MapsEventListener);
        /** Triggers the given event. All arguments after eventName are passed as arguments to the listeners. */
        export function trigger(instance: Object, eventName: string, ...var_args: Array<any>);

        export class MouseEvent extends StoppableEvent {
            /** The latitude/longitude that was below the cursor when the event occurred. */
            latLng: RV.GEOMETRY.LatLng;
        }
    
        export class StoppableEvent {
            /** Prevents this event from propagating further, and in some case preventing viewer action. */
            stop(): void;
        }
    }
}