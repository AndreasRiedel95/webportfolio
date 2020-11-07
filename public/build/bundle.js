
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/layout/Navigation.svelte generated by Svelte v3.24.1 */

    const file = "src/components/layout/Navigation.svelte";

    function create_fragment(ctx) {
    	let nav;
    	let ul;
    	let li0;
    	let a0;
    	let div0;
    	let span0;
    	let t1;
    	let t2;
    	let a1;
    	let div1;
    	let span1;
    	let t4;
    	let t5;
    	let li1;
    	let a2;
    	let div2;
    	let span2;
    	let t7;
    	let t8;
    	let li2;
    	let a3;
    	let div3;
    	let span3;
    	let t10;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "All projects";
    			t1 = text("\n        All projects");
    			t2 = space();
    			a1 = element("a");
    			div1 = element("div");
    			span1 = element("span");
    			span1.textContent = "Digital";
    			t4 = text("\n        Digital");
    			t5 = space();
    			li1 = element("li");
    			a2 = element("a");
    			div2 = element("div");
    			span2 = element("span");
    			span2.textContent = "Print";
    			t7 = text("\n        Print");
    			t8 = space();
    			li2 = element("li");
    			a3 = element("a");
    			div3 = element("div");
    			span3 = element("span");
    			span3.textContent = "Multimedia";
    			t10 = text("\n        Multimedia");
    			attr_dev(span0, "class", "svelte-1e8i39g");
    			add_location(span0, file, 58, 51, 1564);
    			attr_dev(div0, "class", "filter__link-mask svelte-1e8i39g");
    			attr_dev(div0, "area-hidden", "");
    			add_location(div0, file, 58, 8, 1521);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "filter__link js-trigger is-active  svelte-1e8i39g");
    			add_location(a0, file, 57, 6, 1457);
    			attr_dev(span1, "class", "svelte-1e8i39g");
    			add_location(span1, file, 62, 51, 1730);
    			attr_dev(div1, "class", "filter__link-mask svelte-1e8i39g");
    			attr_dev(div1, "area-hidden", "");
    			add_location(div1, file, 62, 8, 1687);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "filter__link js-trigger svelte-1e8i39g");
    			add_location(a1, file, 61, 6, 1634);
    			attr_dev(li0, "class", "filter__item svelte-1e8i39g");
    			add_location(li0, file, 56, 4, 1425);
    			attr_dev(span2, "class", "svelte-1e8i39g");
    			add_location(span2, file, 68, 51, 1926);
    			attr_dev(div2, "class", "filter__link-mask svelte-1e8i39g");
    			attr_dev(div2, "area-hidden", "");
    			add_location(div2, file, 68, 8, 1883);
    			attr_dev(a2, "href", "#");
    			attr_dev(a2, "class", "filter__link js-trigger svelte-1e8i39g");
    			add_location(a2, file, 67, 6, 1830);
    			attr_dev(li1, "class", "filter__item svelte-1e8i39g");
    			add_location(li1, file, 66, 4, 1798);
    			attr_dev(span3, "class", "svelte-1e8i39g");
    			add_location(span3, file, 74, 51, 2118);
    			attr_dev(div3, "class", "filter__link-mask svelte-1e8i39g");
    			attr_dev(div3, "area-hidden", "");
    			add_location(div3, file, 74, 8, 2075);
    			attr_dev(a3, "href", "#");
    			attr_dev(a3, "class", "filter__link js-trigger svelte-1e8i39g");
    			add_location(a3, file, 73, 6, 2022);
    			attr_dev(li2, "class", "filter__item svelte-1e8i39g");
    			add_location(li2, file, 72, 4, 1990);
    			attr_dev(ul, "class", "filter__list svelte-1e8i39g");
    			add_location(ul, file, 55, 2, 1395);
    			attr_dev(nav, "class", "filter svelte-1e8i39g");
    			add_location(nav, file, 54, 0, 1372);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(a0, div0);
    			append_dev(div0, span0);
    			append_dev(a0, t1);
    			append_dev(li0, t2);
    			append_dev(li0, a1);
    			append_dev(a1, div1);
    			append_dev(div1, span1);
    			append_dev(a1, t4);
    			append_dev(ul, t5);
    			append_dev(ul, li1);
    			append_dev(li1, a2);
    			append_dev(a2, div2);
    			append_dev(div2, span2);
    			append_dev(a2, t7);
    			append_dev(ul, t8);
    			append_dev(ul, li2);
    			append_dev(li2, a3);
    			append_dev(a3, div3);
    			append_dev(div3, span3);
    			append_dev(a3, t10);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navigation> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Navigation", $$slots, []);
    	return [];
    }

    class Navigation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navigation",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var evEmitter = createCommonjsModule(function (module) {
    /**
     * EvEmitter v1.1.0
     * Lil' event emitter
     * MIT License
     */

    /* jshint unused: true, undef: true, strict: true */

    ( function( global, factory ) {
      // universal module definition
      /* jshint strict: false */ /* globals define, module, window */
      if (  module.exports ) {
        // CommonJS - Browserify, Webpack
        module.exports = factory();
      } else {
        // Browser globals
        global.EvEmitter = factory();
      }

    }( typeof window != 'undefined' ? window : commonjsGlobal, function() {

    function EvEmitter() {}

    var proto = EvEmitter.prototype;

    proto.on = function( eventName, listener ) {
      if ( !eventName || !listener ) {
        return;
      }
      // set events hash
      var events = this._events = this._events || {};
      // set listeners array
      var listeners = events[ eventName ] = events[ eventName ] || [];
      // only add once
      if ( listeners.indexOf( listener ) == -1 ) {
        listeners.push( listener );
      }

      return this;
    };

    proto.once = function( eventName, listener ) {
      if ( !eventName || !listener ) {
        return;
      }
      // add event
      this.on( eventName, listener );
      // set once flag
      // set onceEvents hash
      var onceEvents = this._onceEvents = this._onceEvents || {};
      // set onceListeners object
      var onceListeners = onceEvents[ eventName ] = onceEvents[ eventName ] || {};
      // set flag
      onceListeners[ listener ] = true;

      return this;
    };

    proto.off = function( eventName, listener ) {
      var listeners = this._events && this._events[ eventName ];
      if ( !listeners || !listeners.length ) {
        return;
      }
      var index = listeners.indexOf( listener );
      if ( index != -1 ) {
        listeners.splice( index, 1 );
      }

      return this;
    };

    proto.emitEvent = function( eventName, args ) {
      var listeners = this._events && this._events[ eventName ];
      if ( !listeners || !listeners.length ) {
        return;
      }
      // copy over to avoid interference if .off() in listener
      listeners = listeners.slice(0);
      args = args || [];
      // once stuff
      var onceListeners = this._onceEvents && this._onceEvents[ eventName ];

      for ( var i=0; i < listeners.length; i++ ) {
        var listener = listeners[i];
        var isOnce = onceListeners && onceListeners[ listener ];
        if ( isOnce ) {
          // remove listener
          // remove before trigger to prevent recursion
          this.off( eventName, listener );
          // unset once flag
          delete onceListeners[ listener ];
        }
        // trigger listener
        listener.apply( this, args );
      }

      return this;
    };

    proto.allOff = function() {
      delete this._events;
      delete this._onceEvents;
    };

    return EvEmitter;

    }));
    });

    var imagesloaded = createCommonjsModule(function (module) {
    /*!
     * imagesLoaded v4.1.4
     * JavaScript is all like "You images are done yet or what?"
     * MIT License
     */

    ( function( window, factory ) {  // universal module definition

      /*global define: false, module: false, require: false */

      if (  module.exports ) {
        // CommonJS
        module.exports = factory(
          window,
          evEmitter
        );
      } else {
        // browser global
        window.imagesLoaded = factory(
          window,
          window.EvEmitter
        );
      }

    })( typeof window !== 'undefined' ? window : commonjsGlobal,

    // --------------------------  factory -------------------------- //

    function factory( window, EvEmitter ) {

    var $ = window.jQuery;
    var console = window.console;

    // -------------------------- helpers -------------------------- //

    // extend objects
    function extend( a, b ) {
      for ( var prop in b ) {
        a[ prop ] = b[ prop ];
      }
      return a;
    }

    var arraySlice = Array.prototype.slice;

    // turn element or nodeList into an array
    function makeArray( obj ) {
      if ( Array.isArray( obj ) ) {
        // use object if already an array
        return obj;
      }

      var isArrayLike = typeof obj == 'object' && typeof obj.length == 'number';
      if ( isArrayLike ) {
        // convert nodeList to array
        return arraySlice.call( obj );
      }

      // array of single index
      return [ obj ];
    }

    // -------------------------- imagesLoaded -------------------------- //

    /**
     * @param {Array, Element, NodeList, String} elem
     * @param {Object or Function} options - if function, use as callback
     * @param {Function} onAlways - callback function
     */
    function ImagesLoaded( elem, options, onAlways ) {
      // coerce ImagesLoaded() without new, to be new ImagesLoaded()
      if ( !( this instanceof ImagesLoaded ) ) {
        return new ImagesLoaded( elem, options, onAlways );
      }
      // use elem as selector string
      var queryElem = elem;
      if ( typeof elem == 'string' ) {
        queryElem = document.querySelectorAll( elem );
      }
      // bail if bad element
      if ( !queryElem ) {
        console.error( 'Bad element for imagesLoaded ' + ( queryElem || elem ) );
        return;
      }

      this.elements = makeArray( queryElem );
      this.options = extend( {}, this.options );
      // shift arguments if no options set
      if ( typeof options == 'function' ) {
        onAlways = options;
      } else {
        extend( this.options, options );
      }

      if ( onAlways ) {
        this.on( 'always', onAlways );
      }

      this.getImages();

      if ( $ ) {
        // add jQuery Deferred object
        this.jqDeferred = new $.Deferred();
      }

      // HACK check async to allow time to bind listeners
      setTimeout( this.check.bind( this ) );
    }

    ImagesLoaded.prototype = Object.create( EvEmitter.prototype );

    ImagesLoaded.prototype.options = {};

    ImagesLoaded.prototype.getImages = function() {
      this.images = [];

      // filter & find items if we have an item selector
      this.elements.forEach( this.addElementImages, this );
    };

    /**
     * @param {Node} element
     */
    ImagesLoaded.prototype.addElementImages = function( elem ) {
      // filter siblings
      if ( elem.nodeName == 'IMG' ) {
        this.addImage( elem );
      }
      // get background image on element
      if ( this.options.background === true ) {
        this.addElementBackgroundImages( elem );
      }

      // find children
      // no non-element nodes, #143
      var nodeType = elem.nodeType;
      if ( !nodeType || !elementNodeTypes[ nodeType ] ) {
        return;
      }
      var childImgs = elem.querySelectorAll('img');
      // concat childElems to filterFound array
      for ( var i=0; i < childImgs.length; i++ ) {
        var img = childImgs[i];
        this.addImage( img );
      }

      // get child background images
      if ( typeof this.options.background == 'string' ) {
        var children = elem.querySelectorAll( this.options.background );
        for ( i=0; i < children.length; i++ ) {
          var child = children[i];
          this.addElementBackgroundImages( child );
        }
      }
    };

    var elementNodeTypes = {
      1: true,
      9: true,
      11: true
    };

    ImagesLoaded.prototype.addElementBackgroundImages = function( elem ) {
      var style = getComputedStyle( elem );
      if ( !style ) {
        // Firefox returns null if in a hidden iframe https://bugzil.la/548397
        return;
      }
      // get url inside url("...")
      var reURL = /url\((['"])?(.*?)\1\)/gi;
      var matches = reURL.exec( style.backgroundImage );
      while ( matches !== null ) {
        var url = matches && matches[2];
        if ( url ) {
          this.addBackground( url, elem );
        }
        matches = reURL.exec( style.backgroundImage );
      }
    };

    /**
     * @param {Image} img
     */
    ImagesLoaded.prototype.addImage = function( img ) {
      var loadingImage = new LoadingImage( img );
      this.images.push( loadingImage );
    };

    ImagesLoaded.prototype.addBackground = function( url, elem ) {
      var background = new Background( url, elem );
      this.images.push( background );
    };

    ImagesLoaded.prototype.check = function() {
      var _this = this;
      this.progressedCount = 0;
      this.hasAnyBroken = false;
      // complete if no images
      if ( !this.images.length ) {
        this.complete();
        return;
      }

      function onProgress( image, elem, message ) {
        // HACK - Chrome triggers event before object properties have changed. #83
        setTimeout( function() {
          _this.progress( image, elem, message );
        });
      }

      this.images.forEach( function( loadingImage ) {
        loadingImage.once( 'progress', onProgress );
        loadingImage.check();
      });
    };

    ImagesLoaded.prototype.progress = function( image, elem, message ) {
      this.progressedCount++;
      this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
      // progress event
      this.emitEvent( 'progress', [ this, image, elem ] );
      if ( this.jqDeferred && this.jqDeferred.notify ) {
        this.jqDeferred.notify( this, image );
      }
      // check if completed
      if ( this.progressedCount == this.images.length ) {
        this.complete();
      }

      if ( this.options.debug && console ) {
        console.log( 'progress: ' + message, image, elem );
      }
    };

    ImagesLoaded.prototype.complete = function() {
      var eventName = this.hasAnyBroken ? 'fail' : 'done';
      this.isComplete = true;
      this.emitEvent( eventName, [ this ] );
      this.emitEvent( 'always', [ this ] );
      if ( this.jqDeferred ) {
        var jqMethod = this.hasAnyBroken ? 'reject' : 'resolve';
        this.jqDeferred[ jqMethod ]( this );
      }
    };

    // --------------------------  -------------------------- //

    function LoadingImage( img ) {
      this.img = img;
    }

    LoadingImage.prototype = Object.create( EvEmitter.prototype );

    LoadingImage.prototype.check = function() {
      // If complete is true and browser supports natural sizes,
      // try to check for image status manually.
      var isComplete = this.getIsImageComplete();
      if ( isComplete ) {
        // report based on naturalWidth
        this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
        return;
      }

      // If none of the checks above matched, simulate loading on detached element.
      this.proxyImage = new Image();
      this.proxyImage.addEventListener( 'load', this );
      this.proxyImage.addEventListener( 'error', this );
      // bind to image as well for Firefox. #191
      this.img.addEventListener( 'load', this );
      this.img.addEventListener( 'error', this );
      this.proxyImage.src = this.img.src;
    };

    LoadingImage.prototype.getIsImageComplete = function() {
      // check for non-zero, non-undefined naturalWidth
      // fixes Safari+InfiniteScroll+Masonry bug infinite-scroll#671
      return this.img.complete && this.img.naturalWidth;
    };

    LoadingImage.prototype.confirm = function( isLoaded, message ) {
      this.isLoaded = isLoaded;
      this.emitEvent( 'progress', [ this, this.img, message ] );
    };

    // ----- events ----- //

    // trigger specified handler for event type
    LoadingImage.prototype.handleEvent = function( event ) {
      var method = 'on' + event.type;
      if ( this[ method ] ) {
        this[ method ]( event );
      }
    };

    LoadingImage.prototype.onload = function() {
      this.confirm( true, 'onload' );
      this.unbindEvents();
    };

    LoadingImage.prototype.onerror = function() {
      this.confirm( false, 'onerror' );
      this.unbindEvents();
    };

    LoadingImage.prototype.unbindEvents = function() {
      this.proxyImage.removeEventListener( 'load', this );
      this.proxyImage.removeEventListener( 'error', this );
      this.img.removeEventListener( 'load', this );
      this.img.removeEventListener( 'error', this );
    };

    // -------------------------- Background -------------------------- //

    function Background( url, element ) {
      this.url = url;
      this.element = element;
      this.img = new Image();
    }

    // inherit LoadingImage prototype
    Background.prototype = Object.create( LoadingImage.prototype );

    Background.prototype.check = function() {
      this.img.addEventListener( 'load', this );
      this.img.addEventListener( 'error', this );
      this.img.src = this.url;
      // check if image is already complete
      var isComplete = this.getIsImageComplete();
      if ( isComplete ) {
        this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
        this.unbindEvents();
      }
    };

    Background.prototype.unbindEvents = function() {
      this.img.removeEventListener( 'load', this );
      this.img.removeEventListener( 'error', this );
    };

    Background.prototype.confirm = function( isLoaded, message ) {
      this.isLoaded = isLoaded;
      this.emitEvent( 'progress', [ this, this.element, message ] );
    };

    // -------------------------- jQuery -------------------------- //

    ImagesLoaded.makeJQueryPlugin = function( jQuery ) {
      jQuery = jQuery || window.jQuery;
      if ( !jQuery ) {
        return;
      }
      // set local variable
      $ = jQuery;
      // $().imagesLoaded()
      $.fn.imagesLoaded = function( options, callback ) {
        var instance = new ImagesLoaded( this, options, callback );
        return instance.jqDeferred.promise( $(this) );
      };
    };
    // try making plugin
    ImagesLoaded.makeJQueryPlugin();

    // --------------------------  -------------------------- //

    return ImagesLoaded;

    });
    });

    /* src/components/containers/Slide.svelte generated by Svelte v3.24.1 */
    const file$1 = "src/components/containers/Slide.svelte";

    // (96:0) {:else}
    function create_else_block(ctx) {
    	let article;
    	let div5;
    	let div0;
    	let t0;
    	let t1;
    	let h1;
    	let div1;
    	let t2;
    	let t3;
    	let div2;
    	let t4;
    	let t5;
    	let t6;
    	let div3;
    	let t7;
    	let div4;
    	let t8;

    	const block = {
    		c: function create() {
    			article = element("article");
    			div5 = element("div");
    			div0 = element("div");
    			t0 = text(/*type*/ ctx[3]);
    			t1 = space();
    			h1 = element("h1");
    			div1 = element("div");
    			t2 = text(/*title*/ ctx[2]);
    			t3 = space();
    			div2 = element("div");
    			t4 = text("0");
    			t5 = text(/*projectNr*/ ctx[5]);
    			t6 = space();
    			div3 = element("div");
    			t7 = space();
    			div4 = element("div");
    			t8 = text(/*subTitle*/ ctx[4]);
    			attr_dev(div0, "class", "slide__type svelte-17i218e");
    			add_location(div0, file$1, 98, 6, 2374);
    			attr_dev(div1, "class", "js-transition-title");
    			add_location(div1, file$1, 100, 8, 2452);
    			attr_dev(h1, "class", "slide__title svelte-17i218e");
    			add_location(h1, file$1, 99, 6, 2418);
    			attr_dev(div2, "class", "slide__projectnr svelte-17i218e");
    			add_location(div2, file$1, 102, 6, 2517);
    			attr_dev(div3, "class", "slide__img slide__img--proxy svelte-17i218e");
    			add_location(div3, file$1, 103, 6, 2572);
    			attr_dev(div4, "class", "slide__project svelte-17i218e");
    			add_location(div4, file$1, 104, 6, 2623);
    			attr_dev(div5, "class", "slide__inner svelte-17i218e");
    			add_location(div5, file$1, 97, 4, 2341);
    			attr_dev(article, "class", "slide svelte-17i218e");
    			set_style(article, "--alignment", /*alignment*/ ctx[1]);
    			add_location(article, file$1, 96, 2, 2259);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div5);
    			append_dev(div5, div0);
    			append_dev(div0, t0);
    			append_dev(div5, t1);
    			append_dev(div5, h1);
    			append_dev(h1, div1);
    			append_dev(div1, t2);
    			append_dev(div5, t3);
    			append_dev(div5, div2);
    			append_dev(div2, t4);
    			append_dev(div2, t5);
    			append_dev(div5, t6);
    			append_dev(div5, div3);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div4, t8);
    			/*article_binding_1*/ ctx[13](article);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*type*/ 8) set_data_dev(t0, /*type*/ ctx[3]);
    			if (dirty & /*title*/ 4) set_data_dev(t2, /*title*/ ctx[2]);
    			if (dirty & /*projectNr*/ 32) set_data_dev(t5, /*projectNr*/ ctx[5]);
    			if (dirty & /*subTitle*/ 16) set_data_dev(t8, /*subTitle*/ ctx[4]);

    			if (dirty & /*alignment*/ 2) {
    				set_style(article, "--alignment", /*alignment*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			/*article_binding_1*/ ctx[13](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(96:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (88:0) {#if imageSlide}
    function create_if_block(ctx) {
    	let article;
    	let div1;
    	let div0;
    	let figure;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			article = element("article");
    			div1 = element("div");
    			div0 = element("div");
    			figure = element("figure");
    			img = element("img");
    			if (img.src !== (img_src_value = /*imgSrc*/ ctx[6])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "draggable", "false");
    			attr_dev(img, "class", "svelte-17i218e");
    			add_location(img, file$1, 91, 49, 2164);
    			attr_dev(figure, "class", "js-transition-img__inner svelte-17i218e");
    			add_location(figure, file$1, 91, 8, 2123);
    			attr_dev(div0, "class", "slide__img js-transition-img svelte-17i218e");
    			add_location(div0, file$1, 90, 6, 2072);
    			attr_dev(div1, "class", "slide__inner svelte-17i218e");
    			add_location(div1, file$1, 89, 4, 2039);
    			attr_dev(article, "class", "slide svelte-17i218e");
    			set_style(article, "--alignment", /*alignment*/ ctx[1]);
    			add_location(article, file$1, 88, 2, 1957);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div1);
    			append_dev(div1, div0);
    			append_dev(div0, figure);
    			append_dev(figure, img);
    			/*article_binding*/ ctx[12](article);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*imgSrc*/ 64 && img.src !== (img_src_value = /*imgSrc*/ ctx[6])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*alignment*/ 2) {
    				set_style(article, "--alignment", /*alignment*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			/*article_binding*/ ctx[12](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(88:0) {#if imageSlide}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*imageSlide*/ ctx[0]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { imageSlide = false } = $$props;
    	let { alignment = "flex-start" } = $$props;
    	let { id } = $$props;
    	let { title } = $$props;
    	let { filter } = $$props;
    	let { type } = $$props;
    	let { subTitle } = $$props;
    	let { projectNr } = $$props;
    	let { imgSrc } = $$props;
    	let { url } = $$props;
    	let slideOne;
    	let slideTwo;

    	const writable_props = [
    		"imageSlide",
    		"alignment",
    		"id",
    		"title",
    		"filter",
    		"type",
    		"subTitle",
    		"projectNr",
    		"imgSrc",
    		"url"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Slide> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Slide", $$slots, []);

    	function article_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			slideOne = $$value;
    			$$invalidate(7, slideOne);
    		});
    	}

    	function article_binding_1($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			slideTwo = $$value;
    			$$invalidate(8, slideTwo);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("imageSlide" in $$props) $$invalidate(0, imageSlide = $$props.imageSlide);
    		if ("alignment" in $$props) $$invalidate(1, alignment = $$props.alignment);
    		if ("id" in $$props) $$invalidate(9, id = $$props.id);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("filter" in $$props) $$invalidate(10, filter = $$props.filter);
    		if ("type" in $$props) $$invalidate(3, type = $$props.type);
    		if ("subTitle" in $$props) $$invalidate(4, subTitle = $$props.subTitle);
    		if ("projectNr" in $$props) $$invalidate(5, projectNr = $$props.projectNr);
    		if ("imgSrc" in $$props) $$invalidate(6, imgSrc = $$props.imgSrc);
    		if ("url" in $$props) $$invalidate(11, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		imageSlide,
    		alignment,
    		id,
    		title,
    		filter,
    		type,
    		subTitle,
    		projectNr,
    		imgSrc,
    		url,
    		slideOne,
    		slideTwo
    	});

    	$$self.$inject_state = $$props => {
    		if ("imageSlide" in $$props) $$invalidate(0, imageSlide = $$props.imageSlide);
    		if ("alignment" in $$props) $$invalidate(1, alignment = $$props.alignment);
    		if ("id" in $$props) $$invalidate(9, id = $$props.id);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("filter" in $$props) $$invalidate(10, filter = $$props.filter);
    		if ("type" in $$props) $$invalidate(3, type = $$props.type);
    		if ("subTitle" in $$props) $$invalidate(4, subTitle = $$props.subTitle);
    		if ("projectNr" in $$props) $$invalidate(5, projectNr = $$props.projectNr);
    		if ("imgSrc" in $$props) $$invalidate(6, imgSrc = $$props.imgSrc);
    		if ("url" in $$props) $$invalidate(11, url = $$props.url);
    		if ("slideOne" in $$props) $$invalidate(7, slideOne = $$props.slideOne);
    		if ("slideTwo" in $$props) $$invalidate(8, slideTwo = $$props.slideTwo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*slideTwo*/ 256) {
    			 dispatch("slideCreate", { cluster: 2, slide: slideTwo });
    		}

    		if ($$self.$$.dirty & /*slideOne*/ 128) {
    			 dispatch("slideCreate", { cluster: 1, slide: slideOne });
    		}
    	};

    	return [
    		imageSlide,
    		alignment,
    		title,
    		type,
    		subTitle,
    		projectNr,
    		imgSrc,
    		slideOne,
    		slideTwo,
    		id,
    		filter,
    		url,
    		article_binding,
    		article_binding_1
    	];
    }

    class Slide extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			imageSlide: 0,
    			alignment: 1,
    			id: 9,
    			title: 2,
    			filter: 10,
    			type: 3,
    			subTitle: 4,
    			projectNr: 5,
    			imgSrc: 6,
    			url: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slide",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[9] === undefined && !("id" in props)) {
    			console.warn("<Slide> was created without expected prop 'id'");
    		}

    		if (/*title*/ ctx[2] === undefined && !("title" in props)) {
    			console.warn("<Slide> was created without expected prop 'title'");
    		}

    		if (/*filter*/ ctx[10] === undefined && !("filter" in props)) {
    			console.warn("<Slide> was created without expected prop 'filter'");
    		}

    		if (/*type*/ ctx[3] === undefined && !("type" in props)) {
    			console.warn("<Slide> was created without expected prop 'type'");
    		}

    		if (/*subTitle*/ ctx[4] === undefined && !("subTitle" in props)) {
    			console.warn("<Slide> was created without expected prop 'subTitle'");
    		}

    		if (/*projectNr*/ ctx[5] === undefined && !("projectNr" in props)) {
    			console.warn("<Slide> was created without expected prop 'projectNr'");
    		}

    		if (/*imgSrc*/ ctx[6] === undefined && !("imgSrc" in props)) {
    			console.warn("<Slide> was created without expected prop 'imgSrc'");
    		}

    		if (/*url*/ ctx[11] === undefined && !("url" in props)) {
    			console.warn("<Slide> was created without expected prop 'url'");
    		}
    	}

    	get imageSlide() {
    		throw new Error("<Slide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imageSlide(value) {
    		throw new Error("<Slide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alignment() {
    		throw new Error("<Slide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alignment(value) {
    		throw new Error("<Slide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Slide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Slide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Slide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Slide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filter() {
    		throw new Error("<Slide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filter(value) {
    		throw new Error("<Slide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Slide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Slide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get subTitle() {
    		throw new Error("<Slide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subTitle(value) {
    		throw new Error("<Slide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get projectNr() {
    		throw new Error("<Slide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set projectNr(value) {
    		throw new Error("<Slide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imgSrc() {
    		throw new Error("<Slide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imgSrc(value) {
    		throw new Error("<Slide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Slide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Slide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.24.1 */
    const file$2 = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[42] = list[i];
    	child_ctx[44] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[42] = list[i];
    	child_ctx[44] = i;
    	return child_ctx;
    }

    // (386:4) {#each slideTemplates as template, i}
    function create_each_block_1(ctx) {
    	let slide;
    	let current;

    	const slide_spread_levels = [
    		{ imageSlide: true },
    		{
    			alignment: /*getSlideAlignment*/ ctx[11](/*i*/ ctx[44] + 1)
    		},
    		{ projectNr: /*i*/ ctx[44] + 1 },
    		/*template*/ ctx[42]
    	];

    	let slide_props = {};

    	for (let i = 0; i < slide_spread_levels.length; i += 1) {
    		slide_props = assign(slide_props, slide_spread_levels[i]);
    	}

    	slide = new Slide({ props: slide_props, $$inline: true });
    	slide.$on("slideCreate", /*slideCreate_handler*/ ctx[23]);

    	const block = {
    		c: function create() {
    			create_component(slide.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(slide, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const slide_changes = (dirty[0] & /*getSlideAlignment, slideTemplates*/ 3072)
    			? get_spread_update(slide_spread_levels, [
    					slide_spread_levels[0],
    					dirty[0] & /*getSlideAlignment*/ 2048 && {
    						alignment: /*getSlideAlignment*/ ctx[11](/*i*/ ctx[44] + 1)
    					},
    					slide_spread_levels[2],
    					dirty[0] & /*slideTemplates*/ 1024 && get_spread_object(/*template*/ ctx[42])
    				])
    			: {};

    			slide.$set(slide_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slide.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slide.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(slide, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(386:4) {#each slideTemplates as template, i}",
    		ctx
    	});

    	return block;
    }

    // (399:4) {#each slideTemplates as template, i}
    function create_each_block(ctx) {
    	let slide;
    	let current;

    	const slide_spread_levels = [
    		/*template*/ ctx[42],
    		{
    			alignment: /*getSlideAlignment*/ ctx[11](/*i*/ ctx[44] + 1)
    		},
    		{ projectNr: /*i*/ ctx[44] + 1 }
    	];

    	let slide_props = {};

    	for (let i = 0; i < slide_spread_levels.length; i += 1) {
    		slide_props = assign(slide_props, slide_spread_levels[i]);
    	}

    	slide = new Slide({ props: slide_props, $$inline: true });
    	slide.$on("slideCreate", /*slideCreate_handler_1*/ ctx[25]);

    	const block = {
    		c: function create() {
    			create_component(slide.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(slide, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const slide_changes = (dirty[0] & /*slideTemplates, getSlideAlignment*/ 3072)
    			? get_spread_update(slide_spread_levels, [
    					dirty[0] & /*slideTemplates*/ 1024 && get_spread_object(/*template*/ ctx[42]),
    					dirty[0] & /*getSlideAlignment*/ 2048 && {
    						alignment: /*getSlideAlignment*/ ctx[11](/*i*/ ctx[44] + 1)
    					},
    					slide_spread_levels[2]
    				])
    			: {};

    			slide.$set(slide_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slide.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slide.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(slide, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(399:4) {#each slideTemplates as template, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let div4;
    	let navigation;
    	let t0;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let div3;
    	let div2;
    	let t3;
    	let div11;
    	let div5;
    	let t4;
    	let div6;
    	let t5;
    	let div7;
    	let t6;
    	let div10;
    	let figure;
    	let img;
    	let img_src_value;
    	let t7;
    	let div9;
    	let div8;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[21]);
    	add_render_callback(/*onwindowscroll*/ ctx[22]);
    	navigation = new Navigation({ $$inline: true });
    	let each_value_1 = /*slideTemplates*/ ctx[10];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*slideTemplates*/ ctx[10];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			create_component(navigation.$$.fragment);
    			t0 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div3 = element("div");
    			div2 = element("div");
    			t3 = space();
    			div11 = element("div");
    			div5 = element("div");
    			t4 = space();
    			div6 = element("div");
    			t5 = space();
    			div7 = element("div");
    			t6 = space();
    			div10 = element("div");
    			figure = element("figure");
    			img = element("img");
    			t7 = space();
    			div9 = element("div");
    			div8 = element("div");
    			attr_dev(div0, "class", "scroll-content svelte-9p1a75");
    			set_style(div0, "transform", "translate3d(-" + /*data*/ ctx[9].last.one.toFixed(2) + "px, 0, 0) scaleY(" + /*bounce*/ ctx[6] + ") skewX(" + /*skew*/ ctx[7] + "deg)");
    			set_style(div0, "width", /*scrollContentWidth*/ ctx[1] + "px");
    			add_location(div0, file$2, 381, 2, 8174);
    			attr_dev(div1, "class", "scroll-content scroll-content--last svelte-9p1a75");
    			set_style(div1, "transform", "translate3d(-" + /*data*/ ctx[9].last.two.toFixed(2) + "px, 0, 0) scaleY(" + /*bounce*/ ctx[6] + ")");
    			set_style(div1, "width", /*scrollContentWidth*/ ctx[1] + "px");
    			add_location(div1, file$2, 394, 2, 8630);
    			attr_dev(div2, "class", "scrollbar__handle svelte-9p1a75");
    			set_style(div2, "transform", "scaleX(" + /*scale*/ ctx[8] + ")");
    			add_location(div2, file$2, 408, 4, 9108);
    			attr_dev(div3, "class", "scrollbar svelte-9p1a75");
    			attr_dev(div3, "data-scrollbar", "");
    			add_location(div3, file$2, 407, 2, 9065);
    			attr_dev(div4, "class", "scroll svelte-9p1a75");
    			add_location(div4, file$2, 379, 0, 8134);
    			attr_dev(div5, "class", "mask__slice js-mask__slice svelte-9p1a75");
    			add_location(div5, file$2, 413, 2, 9248);
    			attr_dev(div6, "class", "mask__slice js-mask__slice svelte-9p1a75");
    			add_location(div6, file$2, 414, 2, 9293);
    			attr_dev(div7, "class", "mask__slice js-mask__slice svelte-9p1a75");
    			add_location(div7, file$2, 415, 2, 9338);
    			attr_dev(img, "class", "js-logo svelte-9p1a75");
    			if (img.src !== (img_src_value = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/logo.svg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$2, 418, 6, 9452);
    			attr_dev(figure, "class", "logo logo--mask svelte-9p1a75");
    			add_location(figure, file$2, 417, 4, 9413);
    			attr_dev(div8, "class", "mask-line__inner js-mask-line svelte-9p1a75");
    			add_location(div8, file$2, 421, 6, 9603);
    			attr_dev(div9, "class", "mask-line js-mask-line svelte-9p1a75");
    			add_location(div9, file$2, 420, 4, 9560);
    			attr_dev(div10, "class", "mask__inner svelte-9p1a75");
    			add_location(div10, file$2, 416, 2, 9383);
    			attr_dev(div11, "class", "mask js-mask svelte-9p1a75");
    			add_location(div11, file$2, 412, 0, 9219);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			mount_component(navigation, div4, null);
    			append_dev(div4, t0);
    			append_dev(div4, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			/*div0_binding*/ ctx[24](div0);
    			append_dev(div4, t1);
    			append_dev(div4, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			/*div1_binding*/ ctx[26](div1);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			/*div2_binding*/ ctx[27](div2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div5);
    			append_dev(div11, t4);
    			append_dev(div11, div6);
    			append_dev(div11, t5);
    			append_dev(div11, div7);
    			append_dev(div11, t6);
    			append_dev(div11, div10);
    			append_dev(div10, figure);
    			append_dev(figure, img);
    			append_dev(div10, t7);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "resize", /*resize*/ ctx[17], false, false, false),
    					listen_dev(window, "scroll", /*handleScroll*/ ctx[13], false, false, false),
    					listen_dev(window, "mousemove", /*mousemove_handler*/ ctx[18], false, false, false),
    					listen_dev(window, "mousedown", /*mousedown_handler*/ ctx[19], false, false, false),
    					listen_dev(window, "mouseup", /*mouseup_handler*/ ctx[20], false, false, false),
    					listen_dev(window, "resize", /*onwindowresize*/ ctx[21]),
    					listen_dev(window, "scroll", () => {
    						scrolling = true;
    						clearTimeout(scrolling_timeout);
    						scrolling_timeout = setTimeout(clear_scrolling, 100);
    						/*onwindowscroll*/ ctx[22]();
    					})
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*scrollY*/ 8 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window.pageXOffset, /*scrollY*/ ctx[3]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			if (dirty[0] & /*getSlideAlignment, slideTemplates, handleSlideCreate*/ 7168) {
    				each_value_1 = /*slideTemplates*/ ctx[10];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty[0] & /*data, bounce, skew*/ 704) {
    				set_style(div0, "transform", "translate3d(-" + /*data*/ ctx[9].last.one.toFixed(2) + "px, 0, 0) scaleY(" + /*bounce*/ ctx[6] + ") skewX(" + /*skew*/ ctx[7] + "deg)");
    			}

    			if (!current || dirty[0] & /*scrollContentWidth*/ 2) {
    				set_style(div0, "width", /*scrollContentWidth*/ ctx[1] + "px");
    			}

    			if (dirty[0] & /*slideTemplates, getSlideAlignment, handleSlideCreate*/ 7168) {
    				each_value = /*slideTemplates*/ ctx[10];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty[0] & /*data, bounce*/ 576) {
    				set_style(div1, "transform", "translate3d(-" + /*data*/ ctx[9].last.two.toFixed(2) + "px, 0, 0) scaleY(" + /*bounce*/ ctx[6] + ")");
    			}

    			if (!current || dirty[0] & /*scrollContentWidth*/ 2) {
    				set_style(div1, "width", /*scrollContentWidth*/ ctx[1] + "px");
    			}

    			if (!current || dirty[0] & /*scale*/ 256) {
    				set_style(div2, "transform", "scaleX(" + /*scale*/ ctx[8] + ")");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navigation.$$.fragment, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navigation.$$.fragment, local);
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(navigation);
    			destroy_each(each_blocks_1, detaching);
    			/*div0_binding*/ ctx[24](null);
    			destroy_each(each_blocks, detaching);
    			/*div1_binding*/ ctx[26](null);
    			/*div2_binding*/ ctx[27](null);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div11);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	const slideTemplates = [
    		{
    			id: 0,
    			title: "TurnOver",
    			type: "iOS App for iPad",
    			filter: "print",
    			subTitle: "University",
    			imgSrc: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-one.png",
    			url: ""
    		},
    		{
    			id: 1,
    			title: "Rijksmuseums",
    			type: "App Conception",
    			filter: "print",
    			subTitle: "University",
    			imgSrc: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-two.png",
    			url: ""
    		},
    		{
    			id: 2,
    			title: "MAN InCar",
    			type: "Conception & App",
    			filter: "print",
    			subTitle: "University",
    			imgSrc: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-three.png",
    			url: ""
    		},
    		{
    			id: 4,
    			title: "ecographis",
    			filter: "digital",
    			type: "Website",
    			subTitle: "Work",
    			imgSrc: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-one.png",
    			url: ""
    		},
    		{
    			id: 5,
    			title: "mueslibar",
    			type: "Conception / Magazine",
    			filter: "print",
    			subTitle: "University",
    			imgSrc: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-two.png",
    			url: ""
    		},
    		{
    			id: 6,
    			title: "Human Projection",
    			type: "Photography",
    			filter: "digital",
    			subTitle: "University",
    			imgSrc: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-three.png",
    			url: ""
    		}
    	];

    	let windowHeight;
    	let scrollContentWidth;
    	let windowWidth;
    	let scrollY = 0;
    	let scrollContent = [];
    	let scrollHandle;
    	let bounce = 0;
    	let skew = 0;
    	let scale = 0;

    	let data = {
    		total: 0,
    		current: 0,
    		last: { one: 0, two: 0 },
    		on: 0,
    		off: 0
    	};

    	let slideArrays = [[], []];

    	let bounds = {
    		elem: 0,
    		content: 0,
    		width: 0,
    		max: 0,
    		min: 0
    	};

    	let dragging = false;
    	let rAF = null;
    	let parallax = null;

    	const math = {
    		lerp: (a, b, n) => {
    			return (1 - n) * a + n * b;
    		},
    		norm: (value, min, max) => {
    			return (value - min) / (max - min);
    		}
    	};

    	onMount(() => {
    		
    	}); // transition();

    	const getSlideAlignment = i => {
    		let alignment = "flex-start";

    		if (i % 2 === 0) {
    			alignment = "center";
    		}

    		if (i % 3 === 0) {
    			alignment = "flex-end";
    		}

    		return alignment;
    	};

    	const initScroll = () => {
    		$$invalidate(9, data = {
    			total: slideArrays[0].length - 1,
    			current: 0,
    			last: { one: 0, two: 0 },
    			on: 0,
    			off: 0
    		});

    		preload();
    		on();
    		run();
    	}; // this.createTimeline();

    	const handleSlideCreate = e => {
    		if (e.detail.cluster === 1) {
    			$$invalidate(28, slideArrays = [[...slideArrays[0], e.detail.slide], [...slideArrays[1]]]);
    		} else {
    			$$invalidate(28, slideArrays = [[...slideArrays[0]], [...slideArrays[1], e.detail.slide]]);
    		}
    	};

    	const on = () => {
    		setBounds(slideArrays[0]);
    		setBounds(slideArrays[1]);
    		customRequestAnimationFrame();
    	};

    	const handleScroll = () => {
    		if (dragging) return;
    		$$invalidate(9, data.current = scrollY, data);
    		clamp();
    	};

    	const handleMouseDown = e => {
    		dragging = true;
    		$$invalidate(9, data.on = e.clientX, data);
    	};

    	const handleMouseMove = e => {
    		if (!dragging) return;
    		drag(e);
    	};

    	const handleMouseUp = e => {
    		dragging = false;
    		$$invalidate(3, scrollY = data.current);
    	};

    	const drag = e => {
    		$$invalidate(9, data.current = scrollY - (e.clientX - data.on), data);
    		clamp();
    	};

    	const resize = () => {
    		setBounds(slideArrays[0]);
    		setBounds(slideArrays[1]);
    		handleScroll();
    	};

    	const preload = () => {
    		imagesloaded(scrollContent, instance => {
    			setBounds(slideArrays[0]);
    			setBounds(slideArrays[1]);
    		});
    	};

    	const run = () => {
    		$$invalidate(9, data.last.one = math.lerp(data.last.one, data.current, 0.085), data);
    		$$invalidate(9, data.last.one = Math.floor(data.last.one * 100) / 100, data);
    		$$invalidate(9, data.last.two = math.lerp(data.last.two, data.current, 0.07), data);
    		$$invalidate(9, data.last.two = Math.floor(data.last.two * 100) / 100, data);
    		const diff = data.current - data.last.one;
    		const acc = diff / windowWidth;
    		const velo = +acc;
    		$$invalidate(6, bounce = 1 - Math.abs(velo * 0.25));
    		$$invalidate(7, skew = velo * 20);
    		$$invalidate(8, scale = math.norm(data.last.two, 0, bounds.max));
    		customRequestAnimationFrame();
    	};

    	const customRequestAnimationFrame = () => {
    		rAF = requestAnimationFrame(run);
    	};

    	const setBounds = elems => {
    		let w = 0;

    		elems.forEach((el, index) => {
    			bounds = el.getBoundingClientRect();
    			el.style.position = "absolute";
    			el.style.top = 0;
    			el.style.left = `${w}px`;
    			w = w + bounds.width;
    			bounds.width = w;
    			bounds.max = bounds.width - windowWidth;

    			if (data.total === index && elems === slideArrays[0]) {
    				$$invalidate(1, scrollContentWidth = w);
    				document.body.style.height = `${w}px`;
    			}
    		});
    	};

    	const clamp = () => {
    		$$invalidate(9, data.current = Math.min(Math.max(data.current, 0), bounds.max), data);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	const mousemove_handler = e => handleMouseMove(e);
    	const mousedown_handler = e => handleMouseDown(e);
    	const mouseup_handler = e => handleMouseUp();

    	function onwindowresize() {
    		$$invalidate(0, windowHeight = window.innerHeight);
    		$$invalidate(2, windowWidth = window.innerWidth);
    	}

    	function onwindowscroll() {
    		$$invalidate(3, scrollY = window.pageYOffset);
    	}

    	const slideCreate_handler = e => handleSlideCreate(e);

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			scrollContent[0] = $$value;
    			$$invalidate(4, scrollContent);
    		});
    	}

    	const slideCreate_handler_1 = e => handleSlideCreate(e);

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			scrollContent[1] = $$value;
    			$$invalidate(4, scrollContent);
    		});
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			scrollHandle = $$value;
    			$$invalidate(5, scrollHandle);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		Navigation,
    		imagesLoaded: imagesloaded,
    		Slide,
    		slideTemplates,
    		windowHeight,
    		scrollContentWidth,
    		windowWidth,
    		scrollY,
    		scrollContent,
    		scrollHandle,
    		bounce,
    		skew,
    		scale,
    		data,
    		slideArrays,
    		bounds,
    		dragging,
    		rAF,
    		parallax,
    		math,
    		getSlideAlignment,
    		initScroll,
    		handleSlideCreate,
    		on,
    		handleScroll,
    		handleMouseDown,
    		handleMouseMove,
    		handleMouseUp,
    		drag,
    		resize,
    		preload,
    		run,
    		customRequestAnimationFrame,
    		setBounds,
    		clamp
    	});

    	$$self.$inject_state = $$props => {
    		if ("windowHeight" in $$props) $$invalidate(0, windowHeight = $$props.windowHeight);
    		if ("scrollContentWidth" in $$props) $$invalidate(1, scrollContentWidth = $$props.scrollContentWidth);
    		if ("windowWidth" in $$props) $$invalidate(2, windowWidth = $$props.windowWidth);
    		if ("scrollY" in $$props) $$invalidate(3, scrollY = $$props.scrollY);
    		if ("scrollContent" in $$props) $$invalidate(4, scrollContent = $$props.scrollContent);
    		if ("scrollHandle" in $$props) $$invalidate(5, scrollHandle = $$props.scrollHandle);
    		if ("bounce" in $$props) $$invalidate(6, bounce = $$props.bounce);
    		if ("skew" in $$props) $$invalidate(7, skew = $$props.skew);
    		if ("scale" in $$props) $$invalidate(8, scale = $$props.scale);
    		if ("data" in $$props) $$invalidate(9, data = $$props.data);
    		if ("slideArrays" in $$props) $$invalidate(28, slideArrays = $$props.slideArrays);
    		if ("bounds" in $$props) bounds = $$props.bounds;
    		if ("dragging" in $$props) dragging = $$props.dragging;
    		if ("rAF" in $$props) rAF = $$props.rAF;
    		if ("parallax" in $$props) parallax = $$props.parallax;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*slideArrays*/ 268435456) {
    			 if (slideArrays[0].length === slideTemplates.length && slideArrays[1].length === slideTemplates.length) {
    				initScroll();
    			}
    		}
    	};

    	return [
    		windowHeight,
    		scrollContentWidth,
    		windowWidth,
    		scrollY,
    		scrollContent,
    		scrollHandle,
    		bounce,
    		skew,
    		scale,
    		data,
    		slideTemplates,
    		getSlideAlignment,
    		handleSlideCreate,
    		handleScroll,
    		handleMouseDown,
    		handleMouseMove,
    		handleMouseUp,
    		resize,
    		mousemove_handler,
    		mousedown_handler,
    		mouseup_handler,
    		onwindowresize,
    		onwindowscroll,
    		slideCreate_handler,
    		div0_binding,
    		slideCreate_handler_1,
    		div1_binding,
    		div2_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
