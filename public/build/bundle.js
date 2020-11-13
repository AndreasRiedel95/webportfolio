
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
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
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
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
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
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

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

    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

    function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

    /*!
     * GSAP 3.5.1
     * https://greensock.com
     *
     * @license Copyright 2008-2020, GreenSock. All rights reserved.
     * Subject to the terms at https://greensock.com/standard-license or for
     * Club GreenSock members, the agreement issued with that membership.
     * @author: Jack Doyle, jack@greensock.com
    */

    /* eslint-disable */
    var _config = {
      autoSleep: 120,
      force3D: "auto",
      nullTargetWarn: 1,
      units: {
        lineHeight: ""
      }
    },
        _defaults = {
      duration: .5,
      overwrite: false,
      delay: 0
    },
        _bigNum = 1e8,
        _tinyNum = 1 / _bigNum,
        _2PI = Math.PI * 2,
        _HALF_PI = _2PI / 4,
        _gsID = 0,
        _sqrt = Math.sqrt,
        _cos = Math.cos,
        _sin = Math.sin,
        _isString = function _isString(value) {
      return typeof value === "string";
    },
        _isFunction = function _isFunction(value) {
      return typeof value === "function";
    },
        _isNumber = function _isNumber(value) {
      return typeof value === "number";
    },
        _isUndefined = function _isUndefined(value) {
      return typeof value === "undefined";
    },
        _isObject = function _isObject(value) {
      return typeof value === "object";
    },
        _isNotFalse = function _isNotFalse(value) {
      return value !== false;
    },
        _windowExists = function _windowExists() {
      return typeof window !== "undefined";
    },
        _isFuncOrString = function _isFuncOrString(value) {
      return _isFunction(value) || _isString(value);
    },
        _isTypedArray = typeof ArrayBuffer === "function" && ArrayBuffer.isView || function () {},
        // note: IE10 has ArrayBuffer, but NOT ArrayBuffer.isView().
    _isArray = Array.isArray,
        _strictNumExp = /(?:-?\.?\d|\.)+/gi,
        //only numbers (including negatives and decimals) but NOT relative values.
    _numExp = /[-+=.]*\d+[.e\-+]*\d*[e\-\+]*\d*/g,
        //finds any numbers, including ones that start with += or -=, negative numbers, and ones in scientific notation like 1e-8.
    _numWithUnitExp = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g,
        _complexStringNumExp = /[-+=.]*\d+(?:\.|e-|e)*\d*/gi,
        //duplicate so that while we're looping through matches from exec(), it doesn't contaminate the lastIndex of _numExp which we use to search for colors too.
    _relExp = /[+-]=-?[\.\d]+/,
        _delimitedValueExp = /[#\-+.]*\b[a-z\d-=+%.]+/gi,
        _globalTimeline,
        _win,
        _coreInitted,
        _doc,
        _globals = {},
        _installScope = {},
        _coreReady,
        _install = function _install(scope) {
      return (_installScope = _merge(scope, _globals)) && gsap;
    },
        _missingPlugin = function _missingPlugin(property, value) {
      return console.warn("Invalid property", property, "set to", value, "Missing plugin? gsap.registerPlugin()");
    },
        _warn = function _warn(message, suppress) {
      return !suppress && console.warn(message);
    },
        _addGlobal = function _addGlobal(name, obj) {
      return name && (_globals[name] = obj) && _installScope && (_installScope[name] = obj) || _globals;
    },
        _emptyFunc = function _emptyFunc() {
      return 0;
    },
        _reservedProps = {},
        _lazyTweens = [],
        _lazyLookup = {},
        _lastRenderedFrame,
        _plugins = {},
        _effects = {},
        _nextGCFrame = 30,
        _harnessPlugins = [],
        _callbackNames = "",
        _harness = function _harness(targets) {
      var target = targets[0],
          harnessPlugin,
          i;
      _isObject(target) || _isFunction(target) || (targets = [targets]);

      if (!(harnessPlugin = (target._gsap || {}).harness)) {
        i = _harnessPlugins.length;

        while (i-- && !_harnessPlugins[i].targetTest(target)) {}

        harnessPlugin = _harnessPlugins[i];
      }

      i = targets.length;

      while (i--) {
        targets[i] && (targets[i]._gsap || (targets[i]._gsap = new GSCache(targets[i], harnessPlugin))) || targets.splice(i, 1);
      }

      return targets;
    },
        _getCache = function _getCache(target) {
      return target._gsap || _harness(toArray(target))[0]._gsap;
    },
        _getProperty = function _getProperty(target, property, v) {
      return (v = target[property]) && _isFunction(v) ? target[property]() : _isUndefined(v) && target.getAttribute && target.getAttribute(property) || v;
    },
        _forEachName = function _forEachName(names, func) {
      return (names = names.split(",")).forEach(func) || names;
    },
        //split a comma-delimited list of names into an array, then run a forEach() function and return the split array (this is just a way to consolidate/shorten some code).
    _round = function _round(value) {
      return Math.round(value * 100000) / 100000 || 0;
    },
        _arrayContainsAny = function _arrayContainsAny(toSearch, toFind) {
      //searches one array to find matches for any of the items in the toFind array. As soon as one is found, it returns true. It does NOT return all the matches; it's simply a boolean search.
      var l = toFind.length,
          i = 0;

      for (; toSearch.indexOf(toFind[i]) < 0 && ++i < l;) {}

      return i < l;
    },
        _parseVars = function _parseVars(params, type, parent) {
      //reads the arguments passed to one of the key methods and figures out if the user is defining things with the OLD/legacy syntax where the duration is the 2nd parameter, and then it adjusts things accordingly and spits back the corrected vars object (with the duration added if necessary, as well as runBackwards or startAt or immediateRender). type 0 = to()/staggerTo(), 1 = from()/staggerFrom(), 2 = fromTo()/staggerFromTo()
      var isLegacy = _isNumber(params[1]),
          varsIndex = (isLegacy ? 2 : 1) + (type < 2 ? 0 : 1),
          vars = params[varsIndex],
          irVars;

      isLegacy && (vars.duration = params[1]);
      vars.parent = parent;

      if (type) {
        irVars = vars;

        while (parent && !("immediateRender" in irVars)) {
          // inheritance hasn't happened yet, but someone may have set a default in an ancestor timeline. We could do vars.immediateRender = _isNotFalse(_inheritDefaults(vars).immediateRender) but that'd exact a slight performance penalty because _inheritDefaults() also runs in the Tween constructor. We're paying a small kb price here to gain speed.
          irVars = parent.vars.defaults || {};
          parent = _isNotFalse(parent.vars.inherit) && parent.parent;
        }

        vars.immediateRender = _isNotFalse(irVars.immediateRender);
        type < 2 ? vars.runBackwards = 1 : vars.startAt = params[varsIndex - 1]; // "from" vars
      }

      return vars;
    },
        _lazyRender = function _lazyRender() {
      var l = _lazyTweens.length,
          a = _lazyTweens.slice(0),
          i,
          tween;

      _lazyLookup = {};
      _lazyTweens.length = 0;

      for (i = 0; i < l; i++) {
        tween = a[i];
        tween && tween._lazy && (tween.render(tween._lazy[0], tween._lazy[1], true)._lazy = 0);
      }
    },
        _lazySafeRender = function _lazySafeRender(animation, time, suppressEvents, force) {
      _lazyTweens.length && _lazyRender();
      animation.render(time, suppressEvents, force);
      _lazyTweens.length && _lazyRender(); //in case rendering caused any tweens to lazy-init, we should render them because typically when someone calls seek() or time() or progress(), they expect an immediate render.
    },
        _numericIfPossible = function _numericIfPossible(value) {
      var n = parseFloat(value);
      return (n || n === 0) && (value + "").match(_delimitedValueExp).length < 2 ? n : _isString(value) ? value.trim() : value;
    },
        _passThrough = function _passThrough(p) {
      return p;
    },
        _setDefaults = function _setDefaults(obj, defaults) {
      for (var p in defaults) {
        p in obj || (obj[p] = defaults[p]);
      }

      return obj;
    },
        _setKeyframeDefaults = function _setKeyframeDefaults(obj, defaults) {
      for (var p in defaults) {
        p in obj || p === "duration" || p === "ease" || (obj[p] = defaults[p]);
      }
    },
        _merge = function _merge(base, toMerge) {
      for (var p in toMerge) {
        base[p] = toMerge[p];
      }

      return base;
    },
        _mergeDeep = function _mergeDeep(base, toMerge) {
      for (var p in toMerge) {
        base[p] = _isObject(toMerge[p]) ? _mergeDeep(base[p] || (base[p] = {}), toMerge[p]) : toMerge[p];
      }

      return base;
    },
        _copyExcluding = function _copyExcluding(obj, excluding) {
      var copy = {},
          p;

      for (p in obj) {
        p in excluding || (copy[p] = obj[p]);
      }

      return copy;
    },
        _inheritDefaults = function _inheritDefaults(vars) {
      var parent = vars.parent || _globalTimeline,
          func = vars.keyframes ? _setKeyframeDefaults : _setDefaults;

      if (_isNotFalse(vars.inherit)) {
        while (parent) {
          func(vars, parent.vars.defaults);
          parent = parent.parent || parent._dp;
        }
      }

      return vars;
    },
        _arraysMatch = function _arraysMatch(a1, a2) {
      var i = a1.length,
          match = i === a2.length;

      while (match && i-- && a1[i] === a2[i]) {}

      return i < 0;
    },
        _addLinkedListItem = function _addLinkedListItem(parent, child, firstProp, lastProp, sortBy) {
      if (firstProp === void 0) {
        firstProp = "_first";
      }

      if (lastProp === void 0) {
        lastProp = "_last";
      }

      var prev = parent[lastProp],
          t;

      if (sortBy) {
        t = child[sortBy];

        while (prev && prev[sortBy] > t) {
          prev = prev._prev;
        }
      }

      if (prev) {
        child._next = prev._next;
        prev._next = child;
      } else {
        child._next = parent[firstProp];
        parent[firstProp] = child;
      }

      if (child._next) {
        child._next._prev = child;
      } else {
        parent[lastProp] = child;
      }

      child._prev = prev;
      child.parent = child._dp = parent;
      return child;
    },
        _removeLinkedListItem = function _removeLinkedListItem(parent, child, firstProp, lastProp) {
      if (firstProp === void 0) {
        firstProp = "_first";
      }

      if (lastProp === void 0) {
        lastProp = "_last";
      }

      var prev = child._prev,
          next = child._next;

      if (prev) {
        prev._next = next;
      } else if (parent[firstProp] === child) {
        parent[firstProp] = next;
      }

      if (next) {
        next._prev = prev;
      } else if (parent[lastProp] === child) {
        parent[lastProp] = prev;
      }

      child._next = child._prev = child.parent = null; // don't delete the _dp just so we can revert if necessary. But parent should be null to indicate the item isn't in a linked list.
    },
        _removeFromParent = function _removeFromParent(child, onlyIfParentHasAutoRemove) {
      child.parent && (!onlyIfParentHasAutoRemove || child.parent.autoRemoveChildren) && child.parent.remove(child);
      child._act = 0;
    },
        _uncache = function _uncache(animation, child) {
      if (animation && (!child || child._end > animation._dur || child._start < 0)) {
        // performance optimization: if a child animation is passed in we should only uncache if that child EXTENDS the animation (its end time is beyond the end)
        var a = animation;

        while (a) {
          a._dirty = 1;
          a = a.parent;
        }
      }

      return animation;
    },
        _recacheAncestors = function _recacheAncestors(animation) {
      var parent = animation.parent;

      while (parent && parent.parent) {
        //sometimes we must force a re-sort of all children and update the duration/totalDuration of all ancestor timelines immediately in case, for example, in the middle of a render loop, one tween alters another tween's timeScale which shoves its startTime before 0, forcing the parent timeline to shift around and shiftChildren() which could affect that next tween's render (startTime). Doesn't matter for the root timeline though.
        parent._dirty = 1;
        parent.totalDuration();
        parent = parent.parent;
      }

      return animation;
    },
        _hasNoPausedAncestors = function _hasNoPausedAncestors(animation) {
      return !animation || animation._ts && _hasNoPausedAncestors(animation.parent);
    },
        _elapsedCycleDuration = function _elapsedCycleDuration(animation) {
      return animation._repeat ? _animationCycle(animation._tTime, animation = animation.duration() + animation._rDelay) * animation : 0;
    },
        // feed in the totalTime and cycleDuration and it'll return the cycle (iteration minus 1) and if the playhead is exactly at the very END, it will NOT bump up to the next cycle.
    _animationCycle = function _animationCycle(tTime, cycleDuration) {
      return (tTime /= cycleDuration) && ~~tTime === tTime ? ~~tTime - 1 : ~~tTime;
    },
        _parentToChildTotalTime = function _parentToChildTotalTime(parentTime, child) {
      return (parentTime - child._start) * child._ts + (child._ts >= 0 ? 0 : child._dirty ? child.totalDuration() : child._tDur);
    },
        _setEnd = function _setEnd(animation) {
      return animation._end = _round(animation._start + (animation._tDur / Math.abs(animation._ts || animation._rts || _tinyNum) || 0));
    },
        _alignPlayhead = function _alignPlayhead(animation, totalTime) {
      // adjusts the animation's _start and _end according to the provided totalTime (only if the parent's smoothChildTiming is true and the animation isn't paused). It doesn't do any rendering or forcing things back into parent timelines, etc. - that's what totalTime() is for.
      var parent = animation._dp;

      if (parent && parent.smoothChildTiming && animation._ts) {
        animation._start = _round(animation._dp._time - (animation._ts > 0 ? totalTime / animation._ts : ((animation._dirty ? animation.totalDuration() : animation._tDur) - totalTime) / -animation._ts));

        _setEnd(animation);

        parent._dirty || _uncache(parent, animation); //for performance improvement. If the parent's cache is already dirty, it already took care of marking the ancestors as dirty too, so skip the function call here.
      }

      return animation;
    },

    /*
    _totalTimeToTime = (clampedTotalTime, duration, repeat, repeatDelay, yoyo) => {
    	let cycleDuration = duration + repeatDelay,
    		time = _round(clampedTotalTime % cycleDuration);
    	if (time > duration) {
    		time = duration;
    	}
    	return (yoyo && (~~(clampedTotalTime / cycleDuration) & 1)) ? duration - time : time;
    },
    */
    _postAddChecks = function _postAddChecks(timeline, child) {
      var t;

      if (child._time || child._initted && !child._dur) {
        //in case, for example, the _start is moved on a tween that has already rendered. Imagine it's at its end state, then the startTime is moved WAY later (after the end of this timeline), it should render at its beginning.
        t = _parentToChildTotalTime(timeline.rawTime(), child);

        if (!child._dur || _clamp(0, child.totalDuration(), t) - child._tTime > _tinyNum) {
          child.render(t, true);
        }
      } //if the timeline has already ended but the inserted tween/timeline extends the duration, we should enable this timeline again so that it renders properly. We should also align the playhead with the parent timeline's when appropriate.


      if (_uncache(timeline, child)._dp && timeline._initted && timeline._time >= timeline._dur && timeline._ts) {
        //in case any of the ancestors had completed but should now be enabled...
        if (timeline._dur < timeline.duration()) {
          t = timeline;

          while (t._dp) {
            t.rawTime() >= 0 && t.totalTime(t._tTime); //moves the timeline (shifts its startTime) if necessary, and also enables it. If it's currently zero, though, it may not be scheduled to render until later so there's no need to force it to align with the current playhead position. Only move to catch up with the playhead.

            t = t._dp;
          }
        }

        timeline._zTime = -_tinyNum; // helps ensure that the next render() will be forced (crossingStart = true in render()), even if the duration hasn't changed (we're adding a child which would need to get rendered). Definitely an edge case. Note: we MUST do this AFTER the loop above where the totalTime() might trigger a render() because this _addToTimeline() method gets called from the Animation constructor, BEFORE tweens even record their targets, etc. so we wouldn't want things to get triggered in the wrong order.
      }
    },
        _addToTimeline = function _addToTimeline(timeline, child, position, skipChecks) {
      child.parent && _removeFromParent(child);
      child._start = _round(position + child._delay);
      child._end = _round(child._start + (child.totalDuration() / Math.abs(child.timeScale()) || 0));

      _addLinkedListItem(timeline, child, "_first", "_last", timeline._sort ? "_start" : 0);

      timeline._recent = child;
      skipChecks || _postAddChecks(timeline, child);
      return timeline;
    },
        _scrollTrigger = function _scrollTrigger(animation, trigger) {
      return (_globals.ScrollTrigger || _missingPlugin("scrollTrigger", trigger)) && _globals.ScrollTrigger.create(trigger, animation);
    },
        _attemptInitTween = function _attemptInitTween(tween, totalTime, force, suppressEvents) {
      _initTween(tween, totalTime);

      if (!tween._initted) {
        return 1;
      }

      if (!force && tween._pt && (tween._dur && tween.vars.lazy !== false || !tween._dur && tween.vars.lazy) && _lastRenderedFrame !== _ticker.frame) {
        _lazyTweens.push(tween);

        tween._lazy = [totalTime, suppressEvents];
        return 1;
      }
    },
        _renderZeroDurationTween = function _renderZeroDurationTween(tween, totalTime, suppressEvents, force) {
      var prevRatio = tween.ratio,
          ratio = totalTime < 0 || !totalTime && prevRatio && !tween._start && tween._zTime > _tinyNum && !tween._dp._lock || (tween._ts < 0 || tween._dp._ts < 0) && tween.data !== "isFromStart" && tween.data !== "isStart" ? 0 : 1,
          // check parent's _lock because when a timeline repeats/yoyos and does its artificial wrapping, we shouldn't force the ratio back to 0. Also, if the tween or its parent is reversed and the totalTime is 0, we should go to a ratio of 0.
      repeatDelay = tween._rDelay,
          tTime = 0,
          pt,
          iteration,
          prevIteration;

      if (repeatDelay && tween._repeat) {
        // in case there's a zero-duration tween that has a repeat with a repeatDelay
        tTime = _clamp(0, tween._tDur, totalTime);
        iteration = _animationCycle(tTime, repeatDelay);
        prevIteration = _animationCycle(tween._tTime, repeatDelay);

        if (iteration !== prevIteration) {
          prevRatio = 1 - ratio;
          tween.vars.repeatRefresh && tween._initted && tween.invalidate();
        }
      }

      if (ratio !== prevRatio || force || tween._zTime === _tinyNum || !totalTime && tween._zTime) {
        if (!tween._initted && _attemptInitTween(tween, totalTime, force, suppressEvents)) {
          // if we render the very beginning (time == 0) of a fromTo(), we must force the render (normal tweens wouldn't need to render at a time of 0 when the prevTime was also 0). This is also mandatory to make sure overwriting kicks in immediately.
          return;
        }

        prevIteration = tween._zTime;
        tween._zTime = totalTime || (suppressEvents ? _tinyNum : 0); // when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect.

        suppressEvents || (suppressEvents = totalTime && !prevIteration); // if it was rendered previously at exactly 0 (_zTime) and now the playhead is moving away, DON'T fire callbacks otherwise they'll seem like duplicates.

        tween.ratio = ratio;
        tween._from && (ratio = 1 - ratio);
        tween._time = 0;
        tween._tTime = tTime;
        suppressEvents || _callback(tween, "onStart");
        pt = tween._pt;

        while (pt) {
          pt.r(ratio, pt.d);
          pt = pt._next;
        }

        tween._startAt && totalTime < 0 && tween._startAt.render(totalTime, true, true);
        tween._onUpdate && !suppressEvents && _callback(tween, "onUpdate");
        tTime && tween._repeat && !suppressEvents && tween.parent && _callback(tween, "onRepeat");

        if ((totalTime >= tween._tDur || totalTime < 0) && tween.ratio === ratio) {
          ratio && _removeFromParent(tween, 1);

          if (!suppressEvents) {
            _callback(tween, ratio ? "onComplete" : "onReverseComplete", true);

            tween._prom && tween._prom();
          }
        }
      } else if (!tween._zTime) {
        tween._zTime = totalTime;
      }
    },
        _findNextPauseTween = function _findNextPauseTween(animation, prevTime, time) {
      var child;

      if (time > prevTime) {
        child = animation._first;

        while (child && child._start <= time) {
          if (!child._dur && child.data === "isPause" && child._start > prevTime) {
            return child;
          }

          child = child._next;
        }
      } else {
        child = animation._last;

        while (child && child._start >= time) {
          if (!child._dur && child.data === "isPause" && child._start < prevTime) {
            return child;
          }

          child = child._prev;
        }
      }
    },
        _setDuration = function _setDuration(animation, duration, skipUncache, leavePlayhead) {
      var repeat = animation._repeat,
          dur = _round(duration) || 0,
          totalProgress = animation._tTime / animation._tDur;
      totalProgress && !leavePlayhead && (animation._time *= dur / animation._dur);
      animation._dur = dur;
      animation._tDur = !repeat ? dur : repeat < 0 ? 1e10 : _round(dur * (repeat + 1) + animation._rDelay * repeat);
      totalProgress && !leavePlayhead ? _alignPlayhead(animation, animation._tTime = animation._tDur * totalProgress) : animation.parent && _setEnd(animation);
      skipUncache || _uncache(animation.parent, animation);
      return animation;
    },
        _onUpdateTotalDuration = function _onUpdateTotalDuration(animation) {
      return animation instanceof Timeline ? _uncache(animation) : _setDuration(animation, animation._dur);
    },
        _zeroPosition = {
      _start: 0,
      endTime: _emptyFunc
    },
        _parsePosition = function _parsePosition(animation, position) {
      var labels = animation.labels,
          recent = animation._recent || _zeroPosition,
          clippedDuration = animation.duration() >= _bigNum ? recent.endTime(false) : animation._dur,
          //in case there's a child that infinitely repeats, users almost never intend for the insertion point of a new child to be based on a SUPER long value like that so we clip it and assume the most recently-added child's endTime should be used instead.
      i,
          offset;

      if (_isString(position) && (isNaN(position) || position in labels)) {
        //if the string is a number like "1", check to see if there's a label with that name, otherwise interpret it as a number (absolute value).
        i = position.charAt(0);

        if (i === "<" || i === ">") {
          return (i === "<" ? recent._start : recent.endTime(recent._repeat >= 0)) + (parseFloat(position.substr(1)) || 0);
        }

        i = position.indexOf("=");

        if (i < 0) {
          position in labels || (labels[position] = clippedDuration);
          return labels[position];
        }

        offset = +(position.charAt(i - 1) + position.substr(i + 1));
        return i > 1 ? _parsePosition(animation, position.substr(0, i - 1)) + offset : clippedDuration + offset;
      }

      return position == null ? clippedDuration : +position;
    },
        _conditionalReturn = function _conditionalReturn(value, func) {
      return value || value === 0 ? func(value) : func;
    },
        _clamp = function _clamp(min, max, value) {
      return value < min ? min : value > max ? max : value;
    },
        getUnit = function getUnit(value) {
      return (value = (value + "").substr((parseFloat(value) + "").length)) && isNaN(value) ? value : "";
    },
        // note: protect against padded numbers as strings, like "100.100". That shouldn't return "00" as the unit. If it's numeric, return no unit.
    clamp = function clamp(min, max, value) {
      return _conditionalReturn(value, function (v) {
        return _clamp(min, max, v);
      });
    },
        _slice = [].slice,
        _isArrayLike = function _isArrayLike(value, nonEmpty) {
      return value && _isObject(value) && "length" in value && (!nonEmpty && !value.length || value.length - 1 in value && _isObject(value[0])) && !value.nodeType && value !== _win;
    },
        _flatten = function _flatten(ar, leaveStrings, accumulator) {
      if (accumulator === void 0) {
        accumulator = [];
      }

      return ar.forEach(function (value) {
        var _accumulator;

        return _isString(value) && !leaveStrings || _isArrayLike(value, 1) ? (_accumulator = accumulator).push.apply(_accumulator, toArray(value)) : accumulator.push(value);
      }) || accumulator;
    },
        //takes any value and returns an array. If it's a string (and leaveStrings isn't true), it'll use document.querySelectorAll() and convert that to an array. It'll also accept iterables like jQuery objects.
    toArray = function toArray(value, leaveStrings) {
      return _isString(value) && !leaveStrings && (_coreInitted || !_wake()) ? _slice.call(_doc.querySelectorAll(value), 0) : _isArray(value) ? _flatten(value, leaveStrings) : _isArrayLike(value) ? _slice.call(value, 0) : value ? [value] : [];
    },
        shuffle = function shuffle(a) {
      return a.sort(function () {
        return .5 - Math.random();
      });
    },
        // alternative that's a bit faster and more reliably diverse but bigger:   for (let j, v, i = a.length; i; j = Math.floor(Math.random() * i), v = a[--i], a[i] = a[j], a[j] = v); return a;
    //for distributing values across an array. Can accept a number, a function or (most commonly) a function which can contain the following properties: {base, amount, from, ease, grid, axis, length, each}. Returns a function that expects the following parameters: index, target, array. Recognizes the following
    distribute = function distribute(v) {
      if (_isFunction(v)) {
        return v;
      }

      var vars = _isObject(v) ? v : {
        each: v
      },
          //n:1 is just to indicate v was a number; we leverage that later to set v according to the length we get. If a number is passed in, we treat it like the old stagger value where 0.1, for example, would mean that things would be distributed with 0.1 between each element in the array rather than a total "amount" that's chunked out among them all.
      ease = _parseEase(vars.ease),
          from = vars.from || 0,
          base = parseFloat(vars.base) || 0,
          cache = {},
          isDecimal = from > 0 && from < 1,
          ratios = isNaN(from) || isDecimal,
          axis = vars.axis,
          ratioX = from,
          ratioY = from;

      if (_isString(from)) {
        ratioX = ratioY = {
          center: .5,
          edges: .5,
          end: 1
        }[from] || 0;
      } else if (!isDecimal && ratios) {
        ratioX = from[0];
        ratioY = from[1];
      }

      return function (i, target, a) {
        var l = (a || vars).length,
            distances = cache[l],
            originX,
            originY,
            x,
            y,
            d,
            j,
            max,
            min,
            wrapAt;

        if (!distances) {
          wrapAt = vars.grid === "auto" ? 0 : (vars.grid || [1, _bigNum])[1];

          if (!wrapAt) {
            max = -_bigNum;

            while (max < (max = a[wrapAt++].getBoundingClientRect().left) && wrapAt < l) {}

            wrapAt--;
          }

          distances = cache[l] = [];
          originX = ratios ? Math.min(wrapAt, l) * ratioX - .5 : from % wrapAt;
          originY = ratios ? l * ratioY / wrapAt - .5 : from / wrapAt | 0;
          max = 0;
          min = _bigNum;

          for (j = 0; j < l; j++) {
            x = j % wrapAt - originX;
            y = originY - (j / wrapAt | 0);
            distances[j] = d = !axis ? _sqrt(x * x + y * y) : Math.abs(axis === "y" ? y : x);
            d > max && (max = d);
            d < min && (min = d);
          }

          from === "random" && shuffle(distances);
          distances.max = max - min;
          distances.min = min;
          distances.v = l = (parseFloat(vars.amount) || parseFloat(vars.each) * (wrapAt > l ? l - 1 : !axis ? Math.max(wrapAt, l / wrapAt) : axis === "y" ? l / wrapAt : wrapAt) || 0) * (from === "edges" ? -1 : 1);
          distances.b = l < 0 ? base - l : base;
          distances.u = getUnit(vars.amount || vars.each) || 0; //unit

          ease = ease && l < 0 ? _invertEase(ease) : ease;
        }

        l = (distances[i] - distances.min) / distances.max || 0;
        return _round(distances.b + (ease ? ease(l) : l) * distances.v) + distances.u; //round in order to work around floating point errors
      };
    },
        _roundModifier = function _roundModifier(v) {
      //pass in 0.1 get a function that'll round to the nearest tenth, or 5 to round to the closest 5, or 0.001 to the closest 1000th, etc.
      var p = v < 1 ? Math.pow(10, (v + "").length - 2) : 1; //to avoid floating point math errors (like 24 * 0.1 == 2.4000000000000004), we chop off at a specific number of decimal places (much faster than toFixed()

      return function (raw) {
        return Math.floor(Math.round(parseFloat(raw) / v) * v * p) / p + (_isNumber(raw) ? 0 : getUnit(raw));
      };
    },
        snap = function snap(snapTo, value) {
      var isArray = _isArray(snapTo),
          radius,
          is2D;

      if (!isArray && _isObject(snapTo)) {
        radius = isArray = snapTo.radius || _bigNum;

        if (snapTo.values) {
          snapTo = toArray(snapTo.values);

          if (is2D = !_isNumber(snapTo[0])) {
            radius *= radius; //performance optimization so we don't have to Math.sqrt() in the loop.
          }
        } else {
          snapTo = _roundModifier(snapTo.increment);
        }
      }

      return _conditionalReturn(value, !isArray ? _roundModifier(snapTo) : _isFunction(snapTo) ? function (raw) {
        is2D = snapTo(raw);
        return Math.abs(is2D - raw) <= radius ? is2D : raw;
      } : function (raw) {
        var x = parseFloat(is2D ? raw.x : raw),
            y = parseFloat(is2D ? raw.y : 0),
            min = _bigNum,
            closest = 0,
            i = snapTo.length,
            dx,
            dy;

        while (i--) {
          if (is2D) {
            dx = snapTo[i].x - x;
            dy = snapTo[i].y - y;
            dx = dx * dx + dy * dy;
          } else {
            dx = Math.abs(snapTo[i] - x);
          }

          if (dx < min) {
            min = dx;
            closest = i;
          }
        }

        closest = !radius || min <= radius ? snapTo[closest] : raw;
        return is2D || closest === raw || _isNumber(raw) ? closest : closest + getUnit(raw);
      });
    },
        random = function random(min, max, roundingIncrement, returnFunction) {
      return _conditionalReturn(_isArray(min) ? !max : roundingIncrement === true ? !!(roundingIncrement = 0) : !returnFunction, function () {
        return _isArray(min) ? min[~~(Math.random() * min.length)] : (roundingIncrement = roundingIncrement || 1e-5) && (returnFunction = roundingIncrement < 1 ? Math.pow(10, (roundingIncrement + "").length - 2) : 1) && Math.floor(Math.round((min + Math.random() * (max - min)) / roundingIncrement) * roundingIncrement * returnFunction) / returnFunction;
      });
    },
        pipe = function pipe() {
      for (var _len = arguments.length, functions = new Array(_len), _key = 0; _key < _len; _key++) {
        functions[_key] = arguments[_key];
      }

      return function (value) {
        return functions.reduce(function (v, f) {
          return f(v);
        }, value);
      };
    },
        unitize = function unitize(func, unit) {
      return function (value) {
        return func(parseFloat(value)) + (unit || getUnit(value));
      };
    },
        normalize = function normalize(min, max, value) {
      return mapRange(min, max, 0, 1, value);
    },
        _wrapArray = function _wrapArray(a, wrapper, value) {
      return _conditionalReturn(value, function (index) {
        return a[~~wrapper(index)];
      });
    },
        wrap = function wrap(min, max, value) {
      // NOTE: wrap() CANNOT be an arrow function! A very odd compiling bug causes problems (unrelated to GSAP).
      var range = max - min;
      return _isArray(min) ? _wrapArray(min, wrap(0, min.length), max) : _conditionalReturn(value, function (value) {
        return (range + (value - min) % range) % range + min;
      });
    },
        wrapYoyo = function wrapYoyo(min, max, value) {
      var range = max - min,
          total = range * 2;
      return _isArray(min) ? _wrapArray(min, wrapYoyo(0, min.length - 1), max) : _conditionalReturn(value, function (value) {
        value = (total + (value - min) % total) % total || 0;
        return min + (value > range ? total - value : value);
      });
    },
        _replaceRandom = function _replaceRandom(value) {
      //replaces all occurrences of random(...) in a string with the calculated random value. can be a range like random(-100, 100, 5) or an array like random([0, 100, 500])
      var prev = 0,
          s = "",
          i,
          nums,
          end,
          isArray;

      while (~(i = value.indexOf("random(", prev))) {
        end = value.indexOf(")", i);
        isArray = value.charAt(i + 7) === "[";
        nums = value.substr(i + 7, end - i - 7).match(isArray ? _delimitedValueExp : _strictNumExp);
        s += value.substr(prev, i - prev) + random(isArray ? nums : +nums[0], isArray ? 0 : +nums[1], +nums[2] || 1e-5);
        prev = end + 1;
      }

      return s + value.substr(prev, value.length - prev);
    },
        mapRange = function mapRange(inMin, inMax, outMin, outMax, value) {
      var inRange = inMax - inMin,
          outRange = outMax - outMin;
      return _conditionalReturn(value, function (value) {
        return outMin + ((value - inMin) / inRange * outRange || 0);
      });
    },
        interpolate = function interpolate(start, end, progress, mutate) {
      var func = isNaN(start + end) ? 0 : function (p) {
        return (1 - p) * start + p * end;
      };

      if (!func) {
        var isString = _isString(start),
            master = {},
            p,
            i,
            interpolators,
            l,
            il;

        progress === true && (mutate = 1) && (progress = null);

        if (isString) {
          start = {
            p: start
          };
          end = {
            p: end
          };
        } else if (_isArray(start) && !_isArray(end)) {
          interpolators = [];
          l = start.length;
          il = l - 2;

          for (i = 1; i < l; i++) {
            interpolators.push(interpolate(start[i - 1], start[i])); //build the interpolators up front as a performance optimization so that when the function is called many times, it can just reuse them.
          }

          l--;

          func = function func(p) {
            p *= l;
            var i = Math.min(il, ~~p);
            return interpolators[i](p - i);
          };

          progress = end;
        } else if (!mutate) {
          start = _merge(_isArray(start) ? [] : {}, start);
        }

        if (!interpolators) {
          for (p in end) {
            _addPropTween.call(master, start, p, "get", end[p]);
          }

          func = function func(p) {
            return _renderPropTweens(p, master) || (isString ? start.p : start);
          };
        }
      }

      return _conditionalReturn(progress, func);
    },
        _getLabelInDirection = function _getLabelInDirection(timeline, fromTime, backward) {
      //used for nextLabel() and previousLabel()
      var labels = timeline.labels,
          min = _bigNum,
          p,
          distance,
          label;

      for (p in labels) {
        distance = labels[p] - fromTime;

        if (distance < 0 === !!backward && distance && min > (distance = Math.abs(distance))) {
          label = p;
          min = distance;
        }
      }

      return label;
    },
        _callback = function _callback(animation, type, executeLazyFirst) {
      var v = animation.vars,
          callback = v[type],
          params,
          scope;

      if (!callback) {
        return;
      }

      params = v[type + "Params"];
      scope = v.callbackScope || animation;
      executeLazyFirst && _lazyTweens.length && _lazyRender(); //in case rendering caused any tweens to lazy-init, we should render them because typically when a timeline finishes, users expect things to have rendered fully. Imagine an onUpdate on a timeline that reports/checks tweened values.

      return params ? callback.apply(scope, params) : callback.call(scope);
    },
        _interrupt = function _interrupt(animation) {
      _removeFromParent(animation);

      animation.progress() < 1 && _callback(animation, "onInterrupt");
      return animation;
    },
        _quickTween,
        _createPlugin = function _createPlugin(config) {
      config = !config.name && config["default"] || config; //UMD packaging wraps things oddly, so for example MotionPathHelper becomes {MotionPathHelper:MotionPathHelper, default:MotionPathHelper}.

      var name = config.name,
          isFunc = _isFunction(config),
          Plugin = name && !isFunc && config.init ? function () {
        this._props = [];
      } : config,
          //in case someone passes in an object that's not a plugin, like CustomEase
      instanceDefaults = {
        init: _emptyFunc,
        render: _renderPropTweens,
        add: _addPropTween,
        kill: _killPropTweensOf,
        modifier: _addPluginModifier,
        rawVars: 0
      },
          statics = {
        targetTest: 0,
        get: 0,
        getSetter: _getSetter,
        aliases: {},
        register: 0
      };

      _wake();

      if (config !== Plugin) {
        if (_plugins[name]) {
          return;
        }

        _setDefaults(Plugin, _setDefaults(_copyExcluding(config, instanceDefaults), statics)); //static methods


        _merge(Plugin.prototype, _merge(instanceDefaults, _copyExcluding(config, statics))); //instance methods


        _plugins[Plugin.prop = name] = Plugin;

        if (config.targetTest) {
          _harnessPlugins.push(Plugin);

          _reservedProps[name] = 1;
        }

        name = (name === "css" ? "CSS" : name.charAt(0).toUpperCase() + name.substr(1)) + "Plugin"; //for the global name. "motionPath" should become MotionPathPlugin
      }

      _addGlobal(name, Plugin);

      config.register && config.register(gsap, Plugin, PropTween);
    },

    /*
     * --------------------------------------------------------------------------------------
     * COLORS
     * --------------------------------------------------------------------------------------
     */
    _255 = 255,
        _colorLookup = {
      aqua: [0, _255, _255],
      lime: [0, _255, 0],
      silver: [192, 192, 192],
      black: [0, 0, 0],
      maroon: [128, 0, 0],
      teal: [0, 128, 128],
      blue: [0, 0, _255],
      navy: [0, 0, 128],
      white: [_255, _255, _255],
      olive: [128, 128, 0],
      yellow: [_255, _255, 0],
      orange: [_255, 165, 0],
      gray: [128, 128, 128],
      purple: [128, 0, 128],
      green: [0, 128, 0],
      red: [_255, 0, 0],
      pink: [_255, 192, 203],
      cyan: [0, _255, _255],
      transparent: [_255, _255, _255, 0]
    },
        _hue = function _hue(h, m1, m2) {
      h = h < 0 ? h + 1 : h > 1 ? h - 1 : h;
      return (h * 6 < 1 ? m1 + (m2 - m1) * h * 6 : h < .5 ? m2 : h * 3 < 2 ? m1 + (m2 - m1) * (2 / 3 - h) * 6 : m1) * _255 + .5 | 0;
    },
        splitColor = function splitColor(v, toHSL, forceAlpha) {
      var a = !v ? _colorLookup.black : _isNumber(v) ? [v >> 16, v >> 8 & _255, v & _255] : 0,
          r,
          g,
          b,
          h,
          s,
          l,
          max,
          min,
          d,
          wasHSL;

      if (!a) {
        if (v.substr(-1) === ",") {
          //sometimes a trailing comma is included and we should chop it off (typically from a comma-delimited list of values like a textShadow:"2px 2px 2px blue, 5px 5px 5px rgb(255,0,0)" - in this example "blue," has a trailing comma. We could strip it out inside parseComplex() but we'd need to do it to the beginning and ending values plus it wouldn't provide protection from other potential scenarios like if the user passes in a similar value.
          v = v.substr(0, v.length - 1);
        }

        if (_colorLookup[v]) {
          a = _colorLookup[v];
        } else if (v.charAt(0) === "#") {
          if (v.length === 4) {
            //for shorthand like #9F0
            r = v.charAt(1);
            g = v.charAt(2);
            b = v.charAt(3);
            v = "#" + r + r + g + g + b + b;
          }

          v = parseInt(v.substr(1), 16);
          a = [v >> 16, v >> 8 & _255, v & _255];
        } else if (v.substr(0, 3) === "hsl") {
          a = wasHSL = v.match(_strictNumExp);

          if (!toHSL) {
            h = +a[0] % 360 / 360;
            s = +a[1] / 100;
            l = +a[2] / 100;
            g = l <= .5 ? l * (s + 1) : l + s - l * s;
            r = l * 2 - g;
            a.length > 3 && (a[3] *= 1); //cast as number

            a[0] = _hue(h + 1 / 3, r, g);
            a[1] = _hue(h, r, g);
            a[2] = _hue(h - 1 / 3, r, g);
          } else if (~v.indexOf("=")) {
            //if relative values are found, just return the raw strings with the relative prefixes in place.
            a = v.match(_numExp);
            forceAlpha && a.length < 4 && (a[3] = 1);
            return a;
          }
        } else {
          a = v.match(_strictNumExp) || _colorLookup.transparent;
        }

        a = a.map(Number);
      }

      if (toHSL && !wasHSL) {
        r = a[0] / _255;
        g = a[1] / _255;
        b = a[2] / _255;
        max = Math.max(r, g, b);
        min = Math.min(r, g, b);
        l = (max + min) / 2;

        if (max === min) {
          h = s = 0;
        } else {
          d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
          h *= 60;
        }

        a[0] = ~~(h + .5);
        a[1] = ~~(s * 100 + .5);
        a[2] = ~~(l * 100 + .5);
      }

      forceAlpha && a.length < 4 && (a[3] = 1);
      return a;
    },
        _colorOrderData = function _colorOrderData(v) {
      // strips out the colors from the string, finds all the numeric slots (with units) and returns an array of those. The Array also has a "c" property which is an Array of the index values where the colors belong. This is to help work around issues where there's a mis-matched order of color/numeric data like drop-shadow(#f00 0px 1px 2px) and drop-shadow(0x 1px 2px #f00). This is basically a helper function used in _formatColors()
      var values = [],
          c = [],
          i = -1;
      v.split(_colorExp).forEach(function (v) {
        var a = v.match(_numWithUnitExp) || [];
        values.push.apply(values, a);
        c.push(i += a.length + 1);
      });
      values.c = c;
      return values;
    },
        _formatColors = function _formatColors(s, toHSL, orderMatchData) {
      var result = "",
          colors = (s + result).match(_colorExp),
          type = toHSL ? "hsla(" : "rgba(",
          i = 0,
          c,
          shell,
          d,
          l;

      if (!colors) {
        return s;
      }

      colors = colors.map(function (color) {
        return (color = splitColor(color, toHSL, 1)) && type + (toHSL ? color[0] + "," + color[1] + "%," + color[2] + "%," + color[3] : color.join(",")) + ")";
      });

      if (orderMatchData) {
        d = _colorOrderData(s);
        c = orderMatchData.c;

        if (c.join(result) !== d.c.join(result)) {
          shell = s.replace(_colorExp, "1").split(_numWithUnitExp);
          l = shell.length - 1;

          for (; i < l; i++) {
            result += shell[i] + (~c.indexOf(i) ? colors.shift() || type + "0,0,0,0)" : (d.length ? d : colors.length ? colors : orderMatchData).shift());
          }
        }
      }

      if (!shell) {
        shell = s.split(_colorExp);
        l = shell.length - 1;

        for (; i < l; i++) {
          result += shell[i] + colors[i];
        }
      }

      return result + shell[l];
    },
        _colorExp = function () {
      var s = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3}){1,2}\\b",
          //we'll dynamically build this Regular Expression to conserve file size. After building it, it will be able to find rgb(), rgba(), # (hexadecimal), and named color values like red, blue, purple, etc.,
      p;

      for (p in _colorLookup) {
        s += "|" + p + "\\b";
      }

      return new RegExp(s + ")", "gi");
    }(),
        _hslExp = /hsl[a]?\(/,
        _colorStringFilter = function _colorStringFilter(a) {
      var combined = a.join(" "),
          toHSL;
      _colorExp.lastIndex = 0;

      if (_colorExp.test(combined)) {
        toHSL = _hslExp.test(combined);
        a[1] = _formatColors(a[1], toHSL);
        a[0] = _formatColors(a[0], toHSL, _colorOrderData(a[1])); // make sure the order of numbers/colors match with the END value.

        return true;
      }
    },

    /*
     * --------------------------------------------------------------------------------------
     * TICKER
     * --------------------------------------------------------------------------------------
     */
    _tickerActive,
        _ticker = function () {
      var _getTime = Date.now,
          _lagThreshold = 500,
          _adjustedLag = 33,
          _startTime = _getTime(),
          _lastUpdate = _startTime,
          _gap = 1000 / 240,
          _nextTime = _gap,
          _listeners = [],
          _id,
          _req,
          _raf,
          _self,
          _delta,
          _i,
          _tick = function _tick(v) {
        var elapsed = _getTime() - _lastUpdate,
            manual = v === true,
            overlap,
            dispatch,
            time,
            frame;

        elapsed > _lagThreshold && (_startTime += elapsed - _adjustedLag);
        _lastUpdate += elapsed;
        time = _lastUpdate - _startTime;
        overlap = time - _nextTime;

        if (overlap > 0 || manual) {
          frame = ++_self.frame;
          _delta = time - _self.time * 1000;
          _self.time = time = time / 1000;
          _nextTime += overlap + (overlap >= _gap ? 4 : _gap - overlap);
          dispatch = 1;
        }

        manual || (_id = _req(_tick)); //make sure the request is made before we dispatch the "tick" event so that timing is maintained. Otherwise, if processing the "tick" requires a bunch of time (like 15ms) and we're using a setTimeout() that's based on 16.7ms, it'd technically take 31.7ms between frames otherwise.

        if (dispatch) {
          for (_i = 0; _i < _listeners.length; _i++) {
            // use _i and check _listeners.length instead of a variable because a listener could get removed during the loop, and if that happens to an element less than the current index, it'd throw things off in the loop.
            _listeners[_i](time, _delta, frame, v);
          }
        }
      };

      _self = {
        time: 0,
        frame: 0,
        tick: function tick() {
          _tick(true);
        },
        deltaRatio: function deltaRatio(fps) {
          return _delta / (1000 / (fps || 60));
        },
        wake: function wake() {
          if (_coreReady) {
            if (!_coreInitted && _windowExists()) {
              _win = _coreInitted = window;
              _doc = _win.document || {};
              _globals.gsap = gsap;
              (_win.gsapVersions || (_win.gsapVersions = [])).push(gsap.version);

              _install(_installScope || _win.GreenSockGlobals || !_win.gsap && _win || {});

              _raf = _win.requestAnimationFrame;
            }

            _id && _self.sleep();

            _req = _raf || function (f) {
              return setTimeout(f, _nextTime - _self.time * 1000 + 1 | 0);
            };

            _tickerActive = 1;

            _tick(2);
          }
        },
        sleep: function sleep() {
          (_raf ? _win.cancelAnimationFrame : clearTimeout)(_id);
          _tickerActive = 0;
          _req = _emptyFunc;
        },
        lagSmoothing: function lagSmoothing(threshold, adjustedLag) {
          _lagThreshold = threshold || 1 / _tinyNum; //zero should be interpreted as basically unlimited

          _adjustedLag = Math.min(adjustedLag, _lagThreshold, 0);
        },
        fps: function fps(_fps) {
          _gap = 1000 / (_fps || 240);
          _nextTime = _self.time * 1000 + _gap;
        },
        add: function add(callback) {
          _listeners.indexOf(callback) < 0 && _listeners.push(callback);

          _wake();
        },
        remove: function remove(callback) {
          var i;
          ~(i = _listeners.indexOf(callback)) && _listeners.splice(i, 1) && _i >= i && _i--;
        },
        _listeners: _listeners
      };
      return _self;
    }(),
        _wake = function _wake() {
      return !_tickerActive && _ticker.wake();
    },
        //also ensures the core classes are initialized.

    /*
    * -------------------------------------------------
    * EASING
    * -------------------------------------------------
    */
    _easeMap = {},
        _customEaseExp = /^[\d.\-M][\d.\-,\s]/,
        _quotesExp = /["']/g,
        _parseObjectInString = function _parseObjectInString(value) {
      //takes a string like "{wiggles:10, type:anticipate})" and turns it into a real object. Notice it ends in ")" and includes the {} wrappers. This is because we only use this function for parsing ease configs and prioritized optimization rather than reusability.
      var obj = {},
          split = value.substr(1, value.length - 3).split(":"),
          key = split[0],
          i = 1,
          l = split.length,
          index,
          val,
          parsedVal;

      for (; i < l; i++) {
        val = split[i];
        index = i !== l - 1 ? val.lastIndexOf(",") : val.length;
        parsedVal = val.substr(0, index);
        obj[key] = isNaN(parsedVal) ? parsedVal.replace(_quotesExp, "").trim() : +parsedVal;
        key = val.substr(index + 1).trim();
      }

      return obj;
    },
        _valueInParentheses = function _valueInParentheses(value) {
      var open = value.indexOf("(") + 1,
          close = value.indexOf(")"),
          nested = value.indexOf("(", open);
      return value.substring(open, ~nested && nested < close ? value.indexOf(")", close + 1) : close);
    },
        _configEaseFromString = function _configEaseFromString(name) {
      //name can be a string like "elastic.out(1,0.5)", and pass in _easeMap as obj and it'll parse it out and call the actual function like _easeMap.Elastic.easeOut.config(1,0.5). It will also parse custom ease strings as long as CustomEase is loaded and registered (internally as _easeMap._CE).
      var split = (name + "").split("("),
          ease = _easeMap[split[0]];
      return ease && split.length > 1 && ease.config ? ease.config.apply(null, ~name.indexOf("{") ? [_parseObjectInString(split[1])] : _valueInParentheses(name).split(",").map(_numericIfPossible)) : _easeMap._CE && _customEaseExp.test(name) ? _easeMap._CE("", name) : ease;
    },
        _invertEase = function _invertEase(ease) {
      return function (p) {
        return 1 - ease(1 - p);
      };
    },
        // allow yoyoEase to be set in children and have those affected when the parent/ancestor timeline yoyos.
    _propagateYoyoEase = function _propagateYoyoEase(timeline, isYoyo) {
      var child = timeline._first,
          ease;

      while (child) {
        if (child instanceof Timeline) {
          _propagateYoyoEase(child, isYoyo);
        } else if (child.vars.yoyoEase && (!child._yoyo || !child._repeat) && child._yoyo !== isYoyo) {
          if (child.timeline) {
            _propagateYoyoEase(child.timeline, isYoyo);
          } else {
            ease = child._ease;
            child._ease = child._yEase;
            child._yEase = ease;
            child._yoyo = isYoyo;
          }
        }

        child = child._next;
      }
    },
        _parseEase = function _parseEase(ease, defaultEase) {
      return !ease ? defaultEase : (_isFunction(ease) ? ease : _easeMap[ease] || _configEaseFromString(ease)) || defaultEase;
    },
        _insertEase = function _insertEase(names, easeIn, easeOut, easeInOut) {
      if (easeOut === void 0) {
        easeOut = function easeOut(p) {
          return 1 - easeIn(1 - p);
        };
      }

      if (easeInOut === void 0) {
        easeInOut = function easeInOut(p) {
          return p < .5 ? easeIn(p * 2) / 2 : 1 - easeIn((1 - p) * 2) / 2;
        };
      }

      var ease = {
        easeIn: easeIn,
        easeOut: easeOut,
        easeInOut: easeInOut
      },
          lowercaseName;

      _forEachName(names, function (name) {
        _easeMap[name] = _globals[name] = ease;
        _easeMap[lowercaseName = name.toLowerCase()] = easeOut;

        for (var p in ease) {
          _easeMap[lowercaseName + (p === "easeIn" ? ".in" : p === "easeOut" ? ".out" : ".inOut")] = _easeMap[name + "." + p] = ease[p];
        }
      });

      return ease;
    },
        _easeInOutFromOut = function _easeInOutFromOut(easeOut) {
      return function (p) {
        return p < .5 ? (1 - easeOut(1 - p * 2)) / 2 : .5 + easeOut((p - .5) * 2) / 2;
      };
    },
        _configElastic = function _configElastic(type, amplitude, period) {
      var p1 = amplitude >= 1 ? amplitude : 1,
          //note: if amplitude is < 1, we simply adjust the period for a more natural feel. Otherwise the math doesn't work right and the curve starts at 1.
      p2 = (period || (type ? .3 : .45)) / (amplitude < 1 ? amplitude : 1),
          p3 = p2 / _2PI * (Math.asin(1 / p1) || 0),
          easeOut = function easeOut(p) {
        return p === 1 ? 1 : p1 * Math.pow(2, -10 * p) * _sin((p - p3) * p2) + 1;
      },
          ease = type === "out" ? easeOut : type === "in" ? function (p) {
        return 1 - easeOut(1 - p);
      } : _easeInOutFromOut(easeOut);

      p2 = _2PI / p2; //precalculate to optimize

      ease.config = function (amplitude, period) {
        return _configElastic(type, amplitude, period);
      };

      return ease;
    },
        _configBack = function _configBack(type, overshoot) {
      if (overshoot === void 0) {
        overshoot = 1.70158;
      }

      var easeOut = function easeOut(p) {
        return p ? --p * p * ((overshoot + 1) * p + overshoot) + 1 : 0;
      },
          ease = type === "out" ? easeOut : type === "in" ? function (p) {
        return 1 - easeOut(1 - p);
      } : _easeInOutFromOut(easeOut);

      ease.config = function (overshoot) {
        return _configBack(type, overshoot);
      };

      return ease;
    }; // a cheaper (kb and cpu) but more mild way to get a parameterized weighted ease by feeding in a value between -1 (easeIn) and 1 (easeOut) where 0 is linear.
    // _weightedEase = ratio => {
    // 	let y = 0.5 + ratio / 2;
    // 	return p => (2 * (1 - p) * p * y + p * p);
    // },
    // a stronger (but more expensive kb/cpu) parameterized weighted ease that lets you feed in a value between -1 (easeIn) and 1 (easeOut) where 0 is linear.
    // _weightedEaseStrong = ratio => {
    // 	ratio = .5 + ratio / 2;
    // 	let o = 1 / 3 * (ratio < .5 ? ratio : 1 - ratio),
    // 		b = ratio - o,
    // 		c = ratio + o;
    // 	return p => p === 1 ? p : 3 * b * (1 - p) * (1 - p) * p + 3 * c * (1 - p) * p * p + p * p * p;
    // };


    _forEachName("Linear,Quad,Cubic,Quart,Quint,Strong", function (name, i) {
      var power = i < 5 ? i + 1 : i;

      _insertEase(name + ",Power" + (power - 1), i ? function (p) {
        return Math.pow(p, power);
      } : function (p) {
        return p;
      }, function (p) {
        return 1 - Math.pow(1 - p, power);
      }, function (p) {
        return p < .5 ? Math.pow(p * 2, power) / 2 : 1 - Math.pow((1 - p) * 2, power) / 2;
      });
    });

    _easeMap.Linear.easeNone = _easeMap.none = _easeMap.Linear.easeIn;

    _insertEase("Elastic", _configElastic("in"), _configElastic("out"), _configElastic());

    (function (n, c) {
      var n1 = 1 / c,
          n2 = 2 * n1,
          n3 = 2.5 * n1,
          easeOut = function easeOut(p) {
        return p < n1 ? n * p * p : p < n2 ? n * Math.pow(p - 1.5 / c, 2) + .75 : p < n3 ? n * (p -= 2.25 / c) * p + .9375 : n * Math.pow(p - 2.625 / c, 2) + .984375;
      };

      _insertEase("Bounce", function (p) {
        return 1 - easeOut(1 - p);
      }, easeOut);
    })(7.5625, 2.75);

    _insertEase("Expo", function (p) {
      return p ? Math.pow(2, 10 * (p - 1)) : 0;
    });

    _insertEase("Circ", function (p) {
      return -(_sqrt(1 - p * p) - 1);
    });

    _insertEase("Sine", function (p) {
      return p === 1 ? 1 : -_cos(p * _HALF_PI) + 1;
    });

    _insertEase("Back", _configBack("in"), _configBack("out"), _configBack());

    _easeMap.SteppedEase = _easeMap.steps = _globals.SteppedEase = {
      config: function config(steps, immediateStart) {
        if (steps === void 0) {
          steps = 1;
        }

        var p1 = 1 / steps,
            p2 = steps + (immediateStart ? 0 : 1),
            p3 = immediateStart ? 1 : 0,
            max = 1 - _tinyNum;
        return function (p) {
          return ((p2 * _clamp(0, max, p) | 0) + p3) * p1;
        };
      }
    };
    _defaults.ease = _easeMap["quad.out"];

    _forEachName("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function (name) {
      return _callbackNames += name + "," + name + "Params,";
    });
    /*
     * --------------------------------------------------------------------------------------
     * CACHE
     * --------------------------------------------------------------------------------------
     */


    var GSCache = function GSCache(target, harness) {
      this.id = _gsID++;
      target._gsap = this;
      this.target = target;
      this.harness = harness;
      this.get = harness ? harness.get : _getProperty;
      this.set = harness ? harness.getSetter : _getSetter;
    };
    /*
     * --------------------------------------------------------------------------------------
     * ANIMATION
     * --------------------------------------------------------------------------------------
     */

    var Animation = /*#__PURE__*/function () {
      function Animation(vars, time) {
        var parent = vars.parent || _globalTimeline;
        this.vars = vars;
        this._delay = +vars.delay || 0;

        if (this._repeat = vars.repeat || 0) {
          this._rDelay = vars.repeatDelay || 0;
          this._yoyo = !!vars.yoyo || !!vars.yoyoEase;
        }

        this._ts = 1;

        _setDuration(this, +vars.duration, 1, 1);

        this.data = vars.data;
        _tickerActive || _ticker.wake();
        parent && _addToTimeline(parent, this, time || time === 0 ? time : parent._time, 1);
        vars.reversed && this.reverse();
        vars.paused && this.paused(true);
      }

      var _proto = Animation.prototype;

      _proto.delay = function delay(value) {
        if (value || value === 0) {
          this.parent && this.parent.smoothChildTiming && this.startTime(this._start + value - this._delay);
          this._delay = value;
          return this;
        }

        return this._delay;
      };

      _proto.duration = function duration(value) {
        return arguments.length ? this.totalDuration(this._repeat > 0 ? value + (value + this._rDelay) * this._repeat : value) : this.totalDuration() && this._dur;
      };

      _proto.totalDuration = function totalDuration(value) {
        if (!arguments.length) {
          return this._tDur;
        }

        this._dirty = 0;
        return _setDuration(this, this._repeat < 0 ? value : (value - this._repeat * this._rDelay) / (this._repeat + 1));
      };

      _proto.totalTime = function totalTime(_totalTime, suppressEvents) {
        _wake();

        if (!arguments.length) {
          return this._tTime;
        }

        var parent = this._dp;

        if (parent && parent.smoothChildTiming && this._ts) {
          _alignPlayhead(this, _totalTime); //in case any of the ancestor timelines had completed but should now be enabled, we should reset their totalTime() which will also ensure that they're lined up properly and enabled. Skip for animations that are on the root (wasteful). Example: a TimelineLite.exportRoot() is performed when there's a paused tween on the root, the export will not complete until that tween is unpaused, but imagine a child gets restarted later, after all [unpaused] tweens have completed. The start of that child would get pushed out, but one of the ancestors may have completed.


          while (parent.parent) {
            if (parent.parent._time !== parent._start + (parent._ts >= 0 ? parent._tTime / parent._ts : (parent.totalDuration() - parent._tTime) / -parent._ts)) {
              parent.totalTime(parent._tTime, true);
            }

            parent = parent.parent;
          }

          if (!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && _totalTime < this._tDur || this._ts < 0 && _totalTime > 0 || !this._tDur && !_totalTime)) {
            //if the animation doesn't have a parent, put it back into its last parent (recorded as _dp for exactly cases like this). Limit to parents with autoRemoveChildren (like globalTimeline) so that if the user manually removes an animation from a timeline and then alters its playhead, it doesn't get added back in.
            _addToTimeline(this._dp, this, this._start - this._delay);
          }
        }

        if (this._tTime !== _totalTime || !this._dur && !suppressEvents || this._initted && Math.abs(this._zTime) === _tinyNum || !_totalTime && !this._initted && (this.add || this._ptLookup)) {
          // check for _ptLookup on a Tween instance to ensure it has actually finished being instantiated, otherwise if this.reverse() gets called in the Animation constructor, it could trigger a render() here even though the _targets weren't populated, thus when _init() is called there won't be any PropTweens (it'll act like the tween is non-functional)
          this._ts || (this._pTime = _totalTime); // otherwise, if an animation is paused, then the playhead is moved back to zero, then resumed, it'd revert back to the original time at the pause

          _lazySafeRender(this, _totalTime, suppressEvents);
        }

        return this;
      };

      _proto.time = function time(value, suppressEvents) {
        return arguments.length ? this.totalTime(Math.min(this.totalDuration(), value + _elapsedCycleDuration(this)) % this._dur || (value ? this._dur : 0), suppressEvents) : this._time; // note: if the modulus results in 0, the playhead could be exactly at the end or the beginning, and we always defer to the END with a non-zero value, otherwise if you set the time() to the very end (duration()), it would render at the START!
      };

      _proto.totalProgress = function totalProgress(value, suppressEvents) {
        return arguments.length ? this.totalTime(this.totalDuration() * value, suppressEvents) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.ratio;
      };

      _proto.progress = function progress(value, suppressEvents) {
        return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - value : value) + _elapsedCycleDuration(this), suppressEvents) : this.duration() ? Math.min(1, this._time / this._dur) : this.ratio;
      };

      _proto.iteration = function iteration(value, suppressEvents) {
        var cycleDuration = this.duration() + this._rDelay;

        return arguments.length ? this.totalTime(this._time + (value - 1) * cycleDuration, suppressEvents) : this._repeat ? _animationCycle(this._tTime, cycleDuration) + 1 : 1;
      } // potential future addition:
      // isPlayingBackwards() {
      // 	let animation = this,
      // 		orientation = 1; // 1 = forward, -1 = backward
      // 	while (animation) {
      // 		orientation *= animation.reversed() || (animation.repeat() && !(animation.iteration() & 1)) ? -1 : 1;
      // 		animation = animation.parent;
      // 	}
      // 	return orientation < 0;
      // }
      ;

      _proto.timeScale = function timeScale(value) {
        if (!arguments.length) {
          return this._rts === -_tinyNum ? 0 : this._rts; // recorded timeScale. Special case: if someone calls reverse() on an animation with timeScale of 0, we assign it -_tinyNum to remember it's reversed.
        }

        if (this._rts === value) {
          return this;
        }

        var tTime = this.parent && this._ts ? _parentToChildTotalTime(this.parent._time, this) : this._tTime; // make sure to do the parentToChildTotalTime() BEFORE setting the new _ts because the old one must be used in that calculation.
        // prioritize rendering where the parent's playhead lines up instead of this._tTime because there could be a tween that's animating another tween's timeScale in the same rendering loop (same parent), thus if the timeScale tween renders first, it would alter _start BEFORE _tTime was set on that tick (in the rendering loop), effectively freezing it until the timeScale tween finishes.

        this._rts = +value || 0;
        this._ts = this._ps || value === -_tinyNum ? 0 : this._rts; // _ts is the functional timeScale which would be 0 if the animation is paused.

        return _recacheAncestors(this.totalTime(_clamp(-this._delay, this._tDur, tTime), true));
      };

      _proto.paused = function paused(value) {
        if (!arguments.length) {
          return this._ps;
        }

        if (this._ps !== value) {
          this._ps = value;

          if (value) {
            this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()); // if the pause occurs during the delay phase, make sure that's factored in when resuming.

            this._ts = this._act = 0; // _ts is the functional timeScale, so a paused tween would effectively have a timeScale of 0. We record the "real" timeScale as _rts (recorded time scale)
          } else {
            _wake();

            this._ts = this._rts; //only defer to _pTime (pauseTime) if tTime is zero. Remember, someone could pause() an animation, then scrub the playhead and resume(). If the parent doesn't have smoothChildTiming, we render at the rawTime() because the startTime won't get updated.

            this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && (this._tTime -= _tinyNum) && Math.abs(this._zTime) !== _tinyNum); // edge case: animation.progress(1).pause().play() wouldn't render again because the playhead is already at the end, but the call to totalTime() below will add it back to its parent...and not remove it again (since removing only happens upon rendering at a new time). Offsetting the _tTime slightly is done simply to cause the final render in totalTime() that'll pop it off its timeline (if autoRemoveChildren is true, of course). Check to make sure _zTime isn't -_tinyNum to avoid an edge case where the playhead is pushed to the end but INSIDE a tween/callback, the timeline itself is paused thus halting rendering and leaving a few unrendered. When resuming, it wouldn't render those otherwise.
          }
        }

        return this;
      };

      _proto.startTime = function startTime(value) {
        if (arguments.length) {
          this._start = value;
          var parent = this.parent || this._dp;
          parent && (parent._sort || !this.parent) && _addToTimeline(parent, this, value - this._delay);
          return this;
        }

        return this._start;
      };

      _proto.endTime = function endTime(includeRepeats) {
        return this._start + (_isNotFalse(includeRepeats) ? this.totalDuration() : this.duration()) / Math.abs(this._ts);
      };

      _proto.rawTime = function rawTime(wrapRepeats) {
        var parent = this.parent || this._dp; // _dp = detatched parent

        return !parent ? this._tTime : wrapRepeats && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : !this._ts ? this._tTime : _parentToChildTotalTime(parent.rawTime(wrapRepeats), this);
      };

      _proto.globalTime = function globalTime(rawTime) {
        var animation = this,
            time = arguments.length ? rawTime : animation.rawTime();

        while (animation) {
          time = animation._start + time / (animation._ts || 1);
          animation = animation._dp;
        }

        return time;
      };

      _proto.repeat = function repeat(value) {
        if (arguments.length) {
          this._repeat = value;
          return _onUpdateTotalDuration(this);
        }

        return this._repeat;
      };

      _proto.repeatDelay = function repeatDelay(value) {
        if (arguments.length) {
          this._rDelay = value;
          return _onUpdateTotalDuration(this);
        }

        return this._rDelay;
      };

      _proto.yoyo = function yoyo(value) {
        if (arguments.length) {
          this._yoyo = value;
          return this;
        }

        return this._yoyo;
      };

      _proto.seek = function seek(position, suppressEvents) {
        return this.totalTime(_parsePosition(this, position), _isNotFalse(suppressEvents));
      };

      _proto.restart = function restart(includeDelay, suppressEvents) {
        return this.play().totalTime(includeDelay ? -this._delay : 0, _isNotFalse(suppressEvents));
      };

      _proto.play = function play(from, suppressEvents) {
        from != null && this.seek(from, suppressEvents);
        return this.reversed(false).paused(false);
      };

      _proto.reverse = function reverse(from, suppressEvents) {
        from != null && this.seek(from || this.totalDuration(), suppressEvents);
        return this.reversed(true).paused(false);
      };

      _proto.pause = function pause(atTime, suppressEvents) {
        atTime != null && this.seek(atTime, suppressEvents);
        return this.paused(true);
      };

      _proto.resume = function resume() {
        return this.paused(false);
      };

      _proto.reversed = function reversed(value) {
        if (arguments.length) {
          !!value !== this.reversed() && this.timeScale(-this._rts || (value ? -_tinyNum : 0)); // in case timeScale is zero, reversing would have no effect so we use _tinyNum.

          return this;
        }

        return this._rts < 0;
      };

      _proto.invalidate = function invalidate() {
        this._initted = 0;
        this._zTime = -_tinyNum;
        return this;
      };

      _proto.isActive = function isActive() {
        var parent = this.parent || this._dp,
            start = this._start,
            rawTime;
        return !!(!parent || this._ts && this._initted && parent.isActive() && (rawTime = parent.rawTime(true)) >= start && rawTime < this.endTime(true) - _tinyNum);
      };

      _proto.eventCallback = function eventCallback(type, callback, params) {
        var vars = this.vars;

        if (arguments.length > 1) {
          if (!callback) {
            delete vars[type];
          } else {
            vars[type] = callback;
            params && (vars[type + "Params"] = params);
            type === "onUpdate" && (this._onUpdate = callback);
          }

          return this;
        }

        return vars[type];
      };

      _proto.then = function then(onFulfilled) {
        var self = this;
        return new Promise(function (resolve) {
          var f = _isFunction(onFulfilled) ? onFulfilled : _passThrough,
              _resolve = function _resolve() {
            var _then = self.then;
            self.then = null; // temporarily null the then() method to avoid an infinite loop (see https://github.com/greensock/GSAP/issues/322)

            _isFunction(f) && (f = f(self)) && (f.then || f === self) && (self.then = _then);
            resolve(f);
            self.then = _then;
          };

          if (self._initted && self.totalProgress() === 1 && self._ts >= 0 || !self._tTime && self._ts < 0) {
            _resolve();
          } else {
            self._prom = _resolve;
          }
        });
      };

      _proto.kill = function kill() {
        _interrupt(this);
      };

      return Animation;
    }();

    _setDefaults(Animation.prototype, {
      _time: 0,
      _start: 0,
      _end: 0,
      _tTime: 0,
      _tDur: 0,
      _dirty: 0,
      _repeat: 0,
      _yoyo: false,
      parent: null,
      _initted: false,
      _rDelay: 0,
      _ts: 1,
      _dp: 0,
      ratio: 0,
      _zTime: -_tinyNum,
      _prom: 0,
      _ps: false,
      _rts: 1
    });
    /*
     * -------------------------------------------------
     * TIMELINE
     * -------------------------------------------------
     */


    var Timeline = /*#__PURE__*/function (_Animation) {
      _inheritsLoose(Timeline, _Animation);

      function Timeline(vars, time) {
        var _this;

        if (vars === void 0) {
          vars = {};
        }

        _this = _Animation.call(this, vars, time) || this;
        _this.labels = {};
        _this.smoothChildTiming = !!vars.smoothChildTiming;
        _this.autoRemoveChildren = !!vars.autoRemoveChildren;
        _this._sort = _isNotFalse(vars.sortChildren);
        _this.parent && _postAddChecks(_this.parent, _assertThisInitialized(_this));
        vars.scrollTrigger && _scrollTrigger(_assertThisInitialized(_this), vars.scrollTrigger);
        return _this;
      }

      var _proto2 = Timeline.prototype;

      _proto2.to = function to(targets, vars, position) {
        new Tween(targets, _parseVars(arguments, 0, this), _parsePosition(this, _isNumber(vars) ? arguments[3] : position));
        return this;
      };

      _proto2.from = function from(targets, vars, position) {
        new Tween(targets, _parseVars(arguments, 1, this), _parsePosition(this, _isNumber(vars) ? arguments[3] : position));
        return this;
      };

      _proto2.fromTo = function fromTo(targets, fromVars, toVars, position) {
        new Tween(targets, _parseVars(arguments, 2, this), _parsePosition(this, _isNumber(fromVars) ? arguments[4] : position));
        return this;
      };

      _proto2.set = function set(targets, vars, position) {
        vars.duration = 0;
        vars.parent = this;
        _inheritDefaults(vars).repeatDelay || (vars.repeat = 0);
        vars.immediateRender = !!vars.immediateRender;
        new Tween(targets, vars, _parsePosition(this, position), 1);
        return this;
      };

      _proto2.call = function call(callback, params, position) {
        return _addToTimeline(this, Tween.delayedCall(0, callback, params), _parsePosition(this, position));
      } //ONLY for backward compatibility! Maybe delete?
      ;

      _proto2.staggerTo = function staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
        vars.duration = duration;
        vars.stagger = vars.stagger || stagger;
        vars.onComplete = onCompleteAll;
        vars.onCompleteParams = onCompleteAllParams;
        vars.parent = this;
        new Tween(targets, vars, _parsePosition(this, position));
        return this;
      };

      _proto2.staggerFrom = function staggerFrom(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
        vars.runBackwards = 1;
        _inheritDefaults(vars).immediateRender = _isNotFalse(vars.immediateRender);
        return this.staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams);
      };

      _proto2.staggerFromTo = function staggerFromTo(targets, duration, fromVars, toVars, stagger, position, onCompleteAll, onCompleteAllParams) {
        toVars.startAt = fromVars;
        _inheritDefaults(toVars).immediateRender = _isNotFalse(toVars.immediateRender);
        return this.staggerTo(targets, duration, toVars, stagger, position, onCompleteAll, onCompleteAllParams);
      };

      _proto2.render = function render(totalTime, suppressEvents, force) {
        var prevTime = this._time,
            tDur = this._dirty ? this.totalDuration() : this._tDur,
            dur = this._dur,
            tTime = this !== _globalTimeline && totalTime > tDur - _tinyNum && totalTime >= 0 ? tDur : totalTime < _tinyNum ? 0 : totalTime,
            crossingStart = this._zTime < 0 !== totalTime < 0 && (this._initted || !dur),
            time,
            child,
            next,
            iteration,
            cycleDuration,
            prevPaused,
            pauseTween,
            timeScale,
            prevStart,
            prevIteration,
            yoyo,
            isYoyo;

        if (tTime !== this._tTime || force || crossingStart) {
          if (prevTime !== this._time && dur) {
            //if totalDuration() finds a child with a negative startTime and smoothChildTiming is true, things get shifted around internally so we need to adjust the time accordingly. For example, if a tween starts at -30 we must shift EVERYTHING forward 30 seconds and move this timeline's startTime backward by 30 seconds so that things align with the playhead (no jump).
            tTime += this._time - prevTime;
            totalTime += this._time - prevTime;
          }

          time = tTime;
          prevStart = this._start;
          timeScale = this._ts;
          prevPaused = !timeScale;

          if (crossingStart) {
            dur || (prevTime = this._zTime); //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration timeline, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect.

            (totalTime || !suppressEvents) && (this._zTime = totalTime);
          }

          if (this._repeat) {
            //adjust the time for repeats and yoyos
            yoyo = this._yoyo;
            cycleDuration = dur + this._rDelay;
            time = _round(tTime % cycleDuration); //round to avoid floating point errors. (4 % 0.8 should be 0 but some browsers report it as 0.79999999!)

            if (tTime === tDur) {
              // the tDur === tTime is for edge cases where there's a lengthy decimal on the duration and it may reach the very end but the time is rendered as not-quite-there (remember, tDur is rounded to 4 decimals whereas dur isn't)
              iteration = this._repeat;
              time = dur;
            } else {
              iteration = ~~(tTime / cycleDuration);

              if (iteration && iteration === tTime / cycleDuration) {
                time = dur;
                iteration--;
              }

              time > dur && (time = dur);
            }

            prevIteration = _animationCycle(this._tTime, cycleDuration);
            !prevTime && this._tTime && prevIteration !== iteration && (prevIteration = iteration); // edge case - if someone does addPause() at the very beginning of a repeating timeline, that pause is technically at the same spot as the end which causes this._time to get set to 0 when the totalTime would normally place the playhead at the end. See https://greensock.com/forums/topic/23823-closing-nav-animation-not-working-on-ie-and-iphone-6-maybe-other-older-browser/?tab=comments#comment-113005

            if (yoyo && iteration & 1) {
              time = dur - time;
              isYoyo = 1;
            }
            /*
            make sure children at the end/beginning of the timeline are rendered properly. If, for example,
            a 3-second long timeline rendered at 2.9 seconds previously, and now renders at 3.2 seconds (which
            would get translated to 2.8 seconds if the timeline yoyos or 0.2 seconds if it just repeats), there
            could be a callback or a short tween that's at 2.95 or 3 seconds in which wouldn't render. So
            we need to push the timeline to the end (and/or beginning depending on its yoyo value). Also we must
            ensure that zero-duration tweens at the very beginning or end of the Timeline work.
            */


            if (iteration !== prevIteration && !this._lock) {
              var rewinding = yoyo && prevIteration & 1,
                  doesWrap = rewinding === (yoyo && iteration & 1);
              iteration < prevIteration && (rewinding = !rewinding);
              prevTime = rewinding ? 0 : dur;
              this._lock = 1;
              this.render(prevTime || (isYoyo ? 0 : _round(iteration * cycleDuration)), suppressEvents, !dur)._lock = 0;
              !suppressEvents && this.parent && _callback(this, "onRepeat");
              this.vars.repeatRefresh && !isYoyo && (this.invalidate()._lock = 1);

              if (prevTime !== this._time || prevPaused !== !this._ts) {
                return this;
              }

              dur = this._dur; // in case the duration changed in the onRepeat

              tDur = this._tDur;

              if (doesWrap) {
                this._lock = 2;
                prevTime = rewinding ? dur : -0.0001;
                this.render(prevTime, true);
                this.vars.repeatRefresh && !isYoyo && this.invalidate();
              }

              this._lock = 0;

              if (!this._ts && !prevPaused) {
                return this;
              } //in order for yoyoEase to work properly when there's a stagger, we must swap out the ease in each sub-tween.


              _propagateYoyoEase(this, isYoyo);
            }
          }

          if (this._hasPause && !this._forcing && this._lock < 2) {
            pauseTween = _findNextPauseTween(this, _round(prevTime), _round(time));

            if (pauseTween) {
              tTime -= time - (time = pauseTween._start);
            }
          }

          this._tTime = tTime;
          this._time = time;
          this._act = !timeScale; //as long as it's not paused, force it to be active so that if the user renders independent of the parent timeline, it'll be forced to re-render on the next tick.

          if (!this._initted) {
            this._onUpdate = this.vars.onUpdate;
            this._initted = 1;
            this._zTime = totalTime;
          }

          !prevTime && time && !suppressEvents && _callback(this, "onStart");

          if (time >= prevTime && totalTime >= 0) {
            child = this._first;

            while (child) {
              next = child._next;

              if ((child._act || time >= child._start) && child._ts && pauseTween !== child) {
                if (child.parent !== this) {
                  // an extreme edge case - the child's render could do something like kill() the "next" one in the linked list, or reparent it. In that case we must re-initiate the whole render to be safe.
                  return this.render(totalTime, suppressEvents, force);
                }

                child.render(child._ts > 0 ? (time - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (time - child._start) * child._ts, suppressEvents, force);

                if (time !== this._time || !this._ts && !prevPaused) {
                  //in case a tween pauses or seeks the timeline when rendering, like inside of an onUpdate/onComplete
                  pauseTween = 0;
                  next && (tTime += this._zTime = -_tinyNum); // it didn't finish rendering, so flag zTime as negative so that so that the next time render() is called it'll be forced (to render any remaining children)

                  break;
                }
              }

              child = next;
            }
          } else {
            child = this._last;
            var adjustedTime = totalTime < 0 ? totalTime : time; //when the playhead goes backward beyond the start of this timeline, we must pass that information down to the child animations so that zero-duration tweens know whether to render their starting or ending values.

            while (child) {
              next = child._prev;

              if ((child._act || adjustedTime <= child._end) && child._ts && pauseTween !== child) {
                if (child.parent !== this) {
                  // an extreme edge case - the child's render could do something like kill() the "next" one in the linked list, or reparent it. In that case we must re-initiate the whole render to be safe.
                  return this.render(totalTime, suppressEvents, force);
                }

                child.render(child._ts > 0 ? (adjustedTime - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (adjustedTime - child._start) * child._ts, suppressEvents, force);

                if (time !== this._time || !this._ts && !prevPaused) {
                  //in case a tween pauses or seeks the timeline when rendering, like inside of an onUpdate/onComplete
                  pauseTween = 0;
                  next && (tTime += this._zTime = adjustedTime ? -_tinyNum : _tinyNum); // it didn't finish rendering, so adjust zTime so that so that the next time render() is called it'll be forced (to render any remaining children)

                  break;
                }
              }

              child = next;
            }
          }

          if (pauseTween && !suppressEvents) {
            this.pause();
            pauseTween.render(time >= prevTime ? 0 : -_tinyNum)._zTime = time >= prevTime ? 1 : -1;

            if (this._ts) {
              //the callback resumed playback! So since we may have held back the playhead due to where the pause is positioned, go ahead and jump to where it's SUPPOSED to be (if no pause happened).
              this._start = prevStart; //if the pause was at an earlier time and the user resumed in the callback, it could reposition the timeline (changing its startTime), throwing things off slightly, so we make sure the _start doesn't shift.

              _setEnd(this);

              return this.render(totalTime, suppressEvents, force);
            }
          }

          this._onUpdate && !suppressEvents && _callback(this, "onUpdate", true);
          if (tTime === tDur && tDur >= this.totalDuration() || !tTime && prevTime) if (prevStart === this._start || Math.abs(timeScale) !== Math.abs(this._ts)) if (!this._lock) {
            (totalTime || !dur) && (tTime === tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1); // don't remove if the timeline is reversed and the playhead isn't at 0, otherwise tl.progress(1).reverse() won't work. Only remove if the playhead is at the end and timeScale is positive, or if the playhead is at 0 and the timeScale is negative.

            if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime)) {
              _callback(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);

              this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
            }
          }
        }

        return this;
      };

      _proto2.add = function add(child, position) {
        var _this2 = this;

        if (!_isNumber(position)) {
          position = _parsePosition(this, position);
        }

        if (!(child instanceof Animation)) {
          if (_isArray(child)) {
            child.forEach(function (obj) {
              return _this2.add(obj, position);
            });
            return this;
          }

          if (_isString(child)) {
            return this.addLabel(child, position);
          }

          if (_isFunction(child)) {
            child = Tween.delayedCall(0, child);
          } else {
            return this;
          }
        }

        return this !== child ? _addToTimeline(this, child, position) : this; //don't allow a timeline to be added to itself as a child!
      };

      _proto2.getChildren = function getChildren(nested, tweens, timelines, ignoreBeforeTime) {
        if (nested === void 0) {
          nested = true;
        }

        if (tweens === void 0) {
          tweens = true;
        }

        if (timelines === void 0) {
          timelines = true;
        }

        if (ignoreBeforeTime === void 0) {
          ignoreBeforeTime = -_bigNum;
        }

        var a = [],
            child = this._first;

        while (child) {
          if (child._start >= ignoreBeforeTime) {
            if (child instanceof Tween) {
              tweens && a.push(child);
            } else {
              timelines && a.push(child);
              nested && a.push.apply(a, child.getChildren(true, tweens, timelines));
            }
          }

          child = child._next;
        }

        return a;
      };

      _proto2.getById = function getById(id) {
        var animations = this.getChildren(1, 1, 1),
            i = animations.length;

        while (i--) {
          if (animations[i].vars.id === id) {
            return animations[i];
          }
        }
      };

      _proto2.remove = function remove(child) {
        if (_isString(child)) {
          return this.removeLabel(child);
        }

        if (_isFunction(child)) {
          return this.killTweensOf(child);
        }

        _removeLinkedListItem(this, child);

        if (child === this._recent) {
          this._recent = this._last;
        }

        return _uncache(this);
      };

      _proto2.totalTime = function totalTime(_totalTime2, suppressEvents) {
        if (!arguments.length) {
          return this._tTime;
        }

        this._forcing = 1;

        if (!this._dp && this._ts) {
          //special case for the global timeline (or any other that has no parent or detached parent).
          this._start = _round(_ticker.time - (this._ts > 0 ? _totalTime2 / this._ts : (this.totalDuration() - _totalTime2) / -this._ts));
        }

        _Animation.prototype.totalTime.call(this, _totalTime2, suppressEvents);

        this._forcing = 0;
        return this;
      };

      _proto2.addLabel = function addLabel(label, position) {
        this.labels[label] = _parsePosition(this, position);
        return this;
      };

      _proto2.removeLabel = function removeLabel(label) {
        delete this.labels[label];
        return this;
      };

      _proto2.addPause = function addPause(position, callback, params) {
        var t = Tween.delayedCall(0, callback || _emptyFunc, params);
        t.data = "isPause";
        this._hasPause = 1;
        return _addToTimeline(this, t, _parsePosition(this, position));
      };

      _proto2.removePause = function removePause(position) {
        var child = this._first;
        position = _parsePosition(this, position);

        while (child) {
          if (child._start === position && child.data === "isPause") {
            _removeFromParent(child);
          }

          child = child._next;
        }
      };

      _proto2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
        var tweens = this.getTweensOf(targets, onlyActive),
            i = tweens.length;

        while (i--) {
          _overwritingTween !== tweens[i] && tweens[i].kill(targets, props);
        }

        return this;
      };

      _proto2.getTweensOf = function getTweensOf(targets, onlyActive) {
        var a = [],
            parsedTargets = toArray(targets),
            child = this._first,
            isGlobalTime = _isNumber(onlyActive),
            // a number is interpreted as a global time. If the animation spans
        children;

        while (child) {
          if (child instanceof Tween) {
            if (_arrayContainsAny(child._targets, parsedTargets) && (isGlobalTime ? (!_overwritingTween || child._initted && child._ts) && child.globalTime(0) <= onlyActive && child.globalTime(child.totalDuration()) > onlyActive : !onlyActive || child.isActive())) {
              // note: if this is for overwriting, it should only be for tweens that aren't paused and are initted.
              a.push(child);
            }
          } else if ((children = child.getTweensOf(parsedTargets, onlyActive)).length) {
            a.push.apply(a, children);
          }

          child = child._next;
        }

        return a;
      };

      _proto2.tweenTo = function tweenTo(position, vars) {
        vars = vars || {};

        var tl = this,
            endTime = _parsePosition(tl, position),
            _vars = vars,
            startAt = _vars.startAt,
            _onStart = _vars.onStart,
            onStartParams = _vars.onStartParams,
            tween = Tween.to(tl, _setDefaults(vars, {
          ease: "none",
          lazy: false,
          time: endTime,
          overwrite: "auto",
          duration: vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale()) || _tinyNum,
          onStart: function onStart() {
            tl.pause();
            var duration = vars.duration || Math.abs((endTime - tl._time) / tl.timeScale());
            tween._dur !== duration && _setDuration(tween, duration, 0, 1).render(tween._time, true, true);
            _onStart && _onStart.apply(tween, onStartParams || []); //in case the user had an onStart in the vars - we don't want to overwrite it.
          }
        }));

        return tween;
      };

      _proto2.tweenFromTo = function tweenFromTo(fromPosition, toPosition, vars) {
        return this.tweenTo(toPosition, _setDefaults({
          startAt: {
            time: _parsePosition(this, fromPosition)
          }
        }, vars));
      };

      _proto2.recent = function recent() {
        return this._recent;
      };

      _proto2.nextLabel = function nextLabel(afterTime) {
        if (afterTime === void 0) {
          afterTime = this._time;
        }

        return _getLabelInDirection(this, _parsePosition(this, afterTime));
      };

      _proto2.previousLabel = function previousLabel(beforeTime) {
        if (beforeTime === void 0) {
          beforeTime = this._time;
        }

        return _getLabelInDirection(this, _parsePosition(this, beforeTime), 1);
      };

      _proto2.currentLabel = function currentLabel(value) {
        return arguments.length ? this.seek(value, true) : this.previousLabel(this._time + _tinyNum);
      };

      _proto2.shiftChildren = function shiftChildren(amount, adjustLabels, ignoreBeforeTime) {
        if (ignoreBeforeTime === void 0) {
          ignoreBeforeTime = 0;
        }

        var child = this._first,
            labels = this.labels,
            p;

        while (child) {
          if (child._start >= ignoreBeforeTime) {
            child._start += amount;
            child._end += amount;
          }

          child = child._next;
        }

        if (adjustLabels) {
          for (p in labels) {
            if (labels[p] >= ignoreBeforeTime) {
              labels[p] += amount;
            }
          }
        }

        return _uncache(this);
      };

      _proto2.invalidate = function invalidate() {
        var child = this._first;
        this._lock = 0;

        while (child) {
          child.invalidate();
          child = child._next;
        }

        return _Animation.prototype.invalidate.call(this);
      };

      _proto2.clear = function clear(includeLabels) {
        if (includeLabels === void 0) {
          includeLabels = true;
        }

        var child = this._first,
            next;

        while (child) {
          next = child._next;
          this.remove(child);
          child = next;
        }

        this._time = this._tTime = this._pTime = 0;
        includeLabels && (this.labels = {});
        return _uncache(this);
      };

      _proto2.totalDuration = function totalDuration(value) {
        var max = 0,
            self = this,
            child = self._last,
            prevStart = _bigNum,
            prev,
            start,
            parent;

        if (arguments.length) {
          return self.timeScale((self._repeat < 0 ? self.duration() : self.totalDuration()) / (self.reversed() ? -value : value));
        }

        if (self._dirty) {
          parent = self.parent;

          while (child) {
            prev = child._prev; //record it here in case the tween changes position in the sequence...

            child._dirty && child.totalDuration(); //could change the tween._startTime, so make sure the animation's cache is clean before analyzing it.

            start = child._start;

            if (start > prevStart && self._sort && child._ts && !self._lock) {
              //in case one of the tweens shifted out of order, it needs to be re-inserted into the correct position in the sequence
              self._lock = 1; //prevent endless recursive calls - there are methods that get triggered that check duration/totalDuration when we add().

              _addToTimeline(self, child, start - child._delay, 1)._lock = 0;
            } else {
              prevStart = start;
            }

            if (start < 0 && child._ts) {
              //children aren't allowed to have negative startTimes unless smoothChildTiming is true, so adjust here if one is found.
              max -= start;

              if (!parent && !self._dp || parent && parent.smoothChildTiming) {
                self._start += start / self._ts;
                self._time -= start;
                self._tTime -= start;
              }

              self.shiftChildren(-start, false, -1e999);
              prevStart = 0;
            }

            child._end > max && child._ts && (max = child._end);
            child = prev;
          }

          _setDuration(self, self === _globalTimeline && self._time > max ? self._time : max, 1, 1);

          self._dirty = 0;
        }

        return self._tDur;
      };

      Timeline.updateRoot = function updateRoot(time) {
        if (_globalTimeline._ts) {
          _lazySafeRender(_globalTimeline, _parentToChildTotalTime(time, _globalTimeline));

          _lastRenderedFrame = _ticker.frame;
        }

        if (_ticker.frame >= _nextGCFrame) {
          _nextGCFrame += _config.autoSleep || 120;
          var child = _globalTimeline._first;
          if (!child || !child._ts) if (_config.autoSleep && _ticker._listeners.length < 2) {
            while (child && !child._ts) {
              child = child._next;
            }

            child || _ticker.sleep();
          }
        }
      };

      return Timeline;
    }(Animation);

    _setDefaults(Timeline.prototype, {
      _lock: 0,
      _hasPause: 0,
      _forcing: 0
    });

    var _addComplexStringPropTween = function _addComplexStringPropTween(target, prop, start, end, setter, stringFilter, funcParam) {
      //note: we call _addComplexStringPropTween.call(tweenInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.
      var pt = new PropTween(this._pt, target, prop, 0, 1, _renderComplexString, null, setter),
          index = 0,
          matchIndex = 0,
          result,
          startNums,
          color,
          endNum,
          chunk,
          startNum,
          hasRandom,
          a;
      pt.b = start;
      pt.e = end;
      start += ""; //ensure values are strings

      end += "";

      if (hasRandom = ~end.indexOf("random(")) {
        end = _replaceRandom(end);
      }

      if (stringFilter) {
        a = [start, end];
        stringFilter(a, target, prop); //pass an array with the starting and ending values and let the filter do whatever it needs to the values.

        start = a[0];
        end = a[1];
      }

      startNums = start.match(_complexStringNumExp) || [];

      while (result = _complexStringNumExp.exec(end)) {
        endNum = result[0];
        chunk = end.substring(index, result.index);

        if (color) {
          color = (color + 1) % 5;
        } else if (chunk.substr(-5) === "rgba(") {
          color = 1;
        }

        if (endNum !== startNums[matchIndex++]) {
          startNum = parseFloat(startNums[matchIndex - 1]) || 0; //these nested PropTweens are handled in a special way - we'll never actually call a render or setter method on them. We'll just loop through them in the parent complex string PropTween's render method.

          pt._pt = {
            _next: pt._pt,
            p: chunk || matchIndex === 1 ? chunk : ",",
            //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
            s: startNum,
            c: endNum.charAt(1) === "=" ? parseFloat(endNum.substr(2)) * (endNum.charAt(0) === "-" ? -1 : 1) : parseFloat(endNum) - startNum,
            m: color && color < 4 ? Math.round : 0
          };
          index = _complexStringNumExp.lastIndex;
        }
      }

      pt.c = index < end.length ? end.substring(index, end.length) : ""; //we use the "c" of the PropTween to store the final part of the string (after the last number)

      pt.fp = funcParam;

      if (_relExp.test(end) || hasRandom) {
        pt.e = 0; //if the end string contains relative values or dynamic random(...) values, delete the end it so that on the final render we don't actually set it to the string with += or -= characters (forces it to use the calculated value).
      }

      this._pt = pt; //start the linked list with this new PropTween. Remember, we call _addComplexStringPropTween.call(tweenInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.

      return pt;
    },
        _addPropTween = function _addPropTween(target, prop, start, end, index, targets, modifier, stringFilter, funcParam) {
      _isFunction(end) && (end = end(index || 0, target, targets));
      var currentValue = target[prop],
          parsedStart = start !== "get" ? start : !_isFunction(currentValue) ? currentValue : funcParam ? target[prop.indexOf("set") || !_isFunction(target["get" + prop.substr(3)]) ? prop : "get" + prop.substr(3)](funcParam) : target[prop](),
          setter = !_isFunction(currentValue) ? _setterPlain : funcParam ? _setterFuncWithParam : _setterFunc,
          pt;

      if (_isString(end)) {
        if (~end.indexOf("random(")) {
          end = _replaceRandom(end);
        }

        if (end.charAt(1) === "=") {
          end = parseFloat(parsedStart) + parseFloat(end.substr(2)) * (end.charAt(0) === "-" ? -1 : 1) + (getUnit(parsedStart) || 0);
        }
      }

      if (parsedStart !== end) {
        if (!isNaN(parsedStart * end)) {
          pt = new PropTween(this._pt, target, prop, +parsedStart || 0, end - (parsedStart || 0), typeof currentValue === "boolean" ? _renderBoolean : _renderPlain, 0, setter);
          funcParam && (pt.fp = funcParam);
          modifier && pt.modifier(modifier, this, target);
          return this._pt = pt;
        }

        !currentValue && !(prop in target) && _missingPlugin(prop, end);
        return _addComplexStringPropTween.call(this, target, prop, parsedStart, end, setter, stringFilter || _config.stringFilter, funcParam);
      }
    },
        //creates a copy of the vars object and processes any function-based values (putting the resulting values directly into the copy) as well as strings with "random()" in them. It does NOT process relative values.
    _processVars = function _processVars(vars, index, target, targets, tween) {
      _isFunction(vars) && (vars = _parseFuncOrString(vars, tween, index, target, targets));

      if (!_isObject(vars) || vars.style && vars.nodeType || _isArray(vars) || _isTypedArray(vars)) {
        return _isString(vars) ? _parseFuncOrString(vars, tween, index, target, targets) : vars;
      }

      var copy = {},
          p;

      for (p in vars) {
        copy[p] = _parseFuncOrString(vars[p], tween, index, target, targets);
      }

      return copy;
    },
        _checkPlugin = function _checkPlugin(property, vars, tween, index, target, targets) {
      var plugin, pt, ptLookup, i;

      if (_plugins[property] && (plugin = new _plugins[property]()).init(target, plugin.rawVars ? vars[property] : _processVars(vars[property], index, target, targets, tween), tween, index, targets) !== false) {
        tween._pt = pt = new PropTween(tween._pt, target, property, 0, 1, plugin.render, plugin, 0, plugin.priority);

        if (tween !== _quickTween) {
          ptLookup = tween._ptLookup[tween._targets.indexOf(target)]; //note: we can't use tween._ptLookup[index] because for staggered tweens, the index from the fullTargets array won't match what it is in each individual tween that spawns from the stagger.

          i = plugin._props.length;

          while (i--) {
            ptLookup[plugin._props[i]] = pt;
          }
        }
      }

      return plugin;
    },
        _overwritingTween,
        //store a reference temporarily so we can avoid overwriting itself.
    _initTween = function _initTween(tween, time) {
      var vars = tween.vars,
          ease = vars.ease,
          startAt = vars.startAt,
          immediateRender = vars.immediateRender,
          lazy = vars.lazy,
          onUpdate = vars.onUpdate,
          onUpdateParams = vars.onUpdateParams,
          callbackScope = vars.callbackScope,
          runBackwards = vars.runBackwards,
          yoyoEase = vars.yoyoEase,
          keyframes = vars.keyframes,
          autoRevert = vars.autoRevert,
          dur = tween._dur,
          prevStartAt = tween._startAt,
          targets = tween._targets,
          parent = tween.parent,
          fullTargets = parent && parent.data === "nested" ? parent.parent._targets : targets,
          autoOverwrite = tween._overwrite === "auto",
          tl = tween.timeline,
          cleanVars,
          i,
          p,
          pt,
          target,
          hasPriority,
          gsData,
          harness,
          plugin,
          ptLookup,
          index,
          harnessVars,
          overwritten;
      tl && (!keyframes || !ease) && (ease = "none");
      tween._ease = _parseEase(ease, _defaults.ease);
      tween._yEase = yoyoEase ? _invertEase(_parseEase(yoyoEase === true ? ease : yoyoEase, _defaults.ease)) : 0;

      if (yoyoEase && tween._yoyo && !tween._repeat) {
        //there must have been a parent timeline with yoyo:true that is currently in its yoyo phase, so flip the eases.
        yoyoEase = tween._yEase;
        tween._yEase = tween._ease;
        tween._ease = yoyoEase;
      }

      if (!tl) {
        //if there's an internal timeline, skip all the parsing because we passed that task down the chain.
        harness = targets[0] ? _getCache(targets[0]).harness : 0;
        harnessVars = harness && vars[harness.prop]; //someone may need to specify CSS-specific values AND non-CSS values, like if the element has an "x" property plus it's a standard DOM element. We allow people to distinguish by wrapping plugin-specific stuff in a css:{} object for example.

        cleanVars = _copyExcluding(vars, _reservedProps);
        prevStartAt && prevStartAt.render(-1, true).kill();

        if (startAt) {
          _removeFromParent(tween._startAt = Tween.set(targets, _setDefaults({
            data: "isStart",
            overwrite: false,
            parent: parent,
            immediateRender: true,
            lazy: _isNotFalse(lazy),
            startAt: null,
            delay: 0,
            onUpdate: onUpdate,
            onUpdateParams: onUpdateParams,
            callbackScope: callbackScope,
            stagger: 0
          }, startAt))); //copy the properties/values into a new object to avoid collisions, like var to = {x:0}, from = {x:500}; timeline.fromTo(e, from, to).fromTo(e, to, from);


          if (immediateRender) {
            if (time > 0) {
              autoRevert || (tween._startAt = 0); //tweens that render immediately (like most from() and fromTo() tweens) shouldn't revert when their parent timeline's playhead goes backward past the startTime because the initial render could have happened anytime and it shouldn't be directly correlated to this tween's startTime. Imagine setting up a complex animation where the beginning states of various objects are rendered immediately but the tween doesn't happen for quite some time - if we revert to the starting values as soon as the playhead goes backward past the tween's startTime, it will throw things off visually. Reversion should only happen in Timeline instances where immediateRender was false or when autoRevert is explicitly set to true.
            } else if (dur && !(time < 0 && prevStartAt)) {
              time && (tween._zTime = time);
              return; //we skip initialization here so that overwriting doesn't occur until the tween actually begins. Otherwise, if you create several immediateRender:true tweens of the same target/properties to drop into a Timeline, the last one created would overwrite the first ones because they didn't get placed into the timeline yet before the first render occurs and kicks in overwriting.
            }
          }
        } else if (runBackwards && dur) {
          //from() tweens must be handled uniquely: their beginning values must be rendered but we don't want overwriting to occur yet (when time is still 0). Wait until the tween actually begins before doing all the routines like overwriting. At that time, we should render at the END of the tween to ensure that things initialize correctly (remember, from() tweens go backwards)
          if (prevStartAt) {
            !autoRevert && (tween._startAt = 0);
          } else {
            time && (immediateRender = false); //in rare cases (like if a from() tween runs and then is invalidate()-ed), immediateRender could be true but the initial forced-render gets skipped, so there's no need to force the render in this context when the _time is greater than 0

            p = _setDefaults({
              overwrite: false,
              data: "isFromStart",
              //we tag the tween with as "isFromStart" so that if [inside a plugin] we need to only do something at the very END of a tween, we have a way of identifying this tween as merely the one that's setting the beginning values for a "from()" tween. For example, clearProps in CSSPlugin should only get applied at the very END of a tween and without this tag, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in.
              lazy: immediateRender && _isNotFalse(lazy),
              immediateRender: immediateRender,
              //zero-duration tweens render immediately by default, but if we're not specifically instructed to render this tween immediately, we should skip this and merely _init() to record the starting values (rendering them immediately would push them to completion which is wasteful in that case - we'd have to render(-1) immediately after)
              stagger: 0,
              parent: parent //ensures that nested tweens that had a stagger are handled properly, like gsap.from(".class", {y:gsap.utils.wrap([-100,100])})

            }, cleanVars);
            harnessVars && (p[harness.prop] = harnessVars); // in case someone does something like .from(..., {css:{}})

            _removeFromParent(tween._startAt = Tween.set(targets, p));

            if (!immediateRender) {
              _initTween(tween._startAt, _tinyNum); //ensures that the initial values are recorded

            } else if (!time) {
              return;
            }
          }
        }

        tween._pt = 0;
        lazy = dur && _isNotFalse(lazy) || lazy && !dur;

        for (i = 0; i < targets.length; i++) {
          target = targets[i];
          gsData = target._gsap || _harness(targets)[i]._gsap;
          tween._ptLookup[i] = ptLookup = {};
          _lazyLookup[gsData.id] && _lazyTweens.length && _lazyRender(); //if other tweens of the same target have recently initted but haven't rendered yet, we've got to force the render so that the starting values are correct (imagine populating a timeline with a bunch of sequential tweens and then jumping to the end)

          index = fullTargets === targets ? i : fullTargets.indexOf(target);

          if (harness && (plugin = new harness()).init(target, harnessVars || cleanVars, tween, index, fullTargets) !== false) {
            tween._pt = pt = new PropTween(tween._pt, target, plugin.name, 0, 1, plugin.render, plugin, 0, plugin.priority);

            plugin._props.forEach(function (name) {
              ptLookup[name] = pt;
            });

            plugin.priority && (hasPriority = 1);
          }

          if (!harness || harnessVars) {
            for (p in cleanVars) {
              if (_plugins[p] && (plugin = _checkPlugin(p, cleanVars, tween, index, target, fullTargets))) {
                plugin.priority && (hasPriority = 1);
              } else {
                ptLookup[p] = pt = _addPropTween.call(tween, target, p, "get", cleanVars[p], index, fullTargets, 0, vars.stringFilter);
              }
            }
          }

          tween._op && tween._op[i] && tween.kill(target, tween._op[i]);

          if (autoOverwrite && tween._pt) {
            _overwritingTween = tween;

            _globalTimeline.killTweensOf(target, ptLookup, tween.globalTime(0)); //Also make sure the overwriting doesn't overwrite THIS tween!!!


            overwritten = !tween.parent;
            _overwritingTween = 0;
          }

          tween._pt && lazy && (_lazyLookup[gsData.id] = 1);
        }

        hasPriority && _sortPropTweensByPriority(tween);
        tween._onInit && tween._onInit(tween); //plugins like RoundProps must wait until ALL of the PropTweens are instantiated. In the plugin's init() function, it sets the _onInit on the tween instance. May not be pretty/intuitive, but it's fast and keeps file size down.
      }

      tween._from = !tl && !!vars.runBackwards; //nested timelines should never run backwards - the backwards-ness is in the child tweens.

      tween._onUpdate = onUpdate;
      tween._initted = (!tween._op || tween._pt) && !overwritten; // if overwrittenProps resulted in the entire tween being killed, do NOT flag it as initted or else it may render for one tick.
    },
        _addAliasesToVars = function _addAliasesToVars(targets, vars) {
      var harness = targets[0] ? _getCache(targets[0]).harness : 0,
          propertyAliases = harness && harness.aliases,
          copy,
          p,
          i,
          aliases;

      if (!propertyAliases) {
        return vars;
      }

      copy = _merge({}, vars);

      for (p in propertyAliases) {
        if (p in copy) {
          aliases = propertyAliases[p].split(",");
          i = aliases.length;

          while (i--) {
            copy[aliases[i]] = copy[p];
          }
        }
      }

      return copy;
    },
        _parseFuncOrString = function _parseFuncOrString(value, tween, i, target, targets) {
      return _isFunction(value) ? value.call(tween, i, target, targets) : _isString(value) && ~value.indexOf("random(") ? _replaceRandom(value) : value;
    },
        _staggerTweenProps = _callbackNames + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase",
        _staggerPropsToSkip = (_staggerTweenProps + ",id,stagger,delay,duration,paused,scrollTrigger").split(",");
    /*
     * --------------------------------------------------------------------------------------
     * TWEEN
     * --------------------------------------------------------------------------------------
     */


    var Tween = /*#__PURE__*/function (_Animation2) {
      _inheritsLoose(Tween, _Animation2);

      function Tween(targets, vars, time, skipInherit) {
        var _this3;

        if (typeof vars === "number") {
          time.duration = vars;
          vars = time;
          time = null;
        }

        _this3 = _Animation2.call(this, skipInherit ? vars : _inheritDefaults(vars), time) || this;
        var _this3$vars = _this3.vars,
            duration = _this3$vars.duration,
            delay = _this3$vars.delay,
            immediateRender = _this3$vars.immediateRender,
            stagger = _this3$vars.stagger,
            overwrite = _this3$vars.overwrite,
            keyframes = _this3$vars.keyframes,
            defaults = _this3$vars.defaults,
            scrollTrigger = _this3$vars.scrollTrigger,
            yoyoEase = _this3$vars.yoyoEase,
            parent = _this3.parent,
            parsedTargets = (_isArray(targets) || _isTypedArray(targets) ? _isNumber(targets[0]) : "length" in vars) ? [targets] : toArray(targets),
            tl,
            i,
            copy,
            l,
            p,
            curTarget,
            staggerFunc,
            staggerVarsToMerge;
        _this3._targets = parsedTargets.length ? _harness(parsedTargets) : _warn("GSAP target " + targets + " not found. https://greensock.com", !_config.nullTargetWarn) || [];
        _this3._ptLookup = []; //PropTween lookup. An array containing an object for each target, having keys for each tweening property

        _this3._overwrite = overwrite;

        if (keyframes || stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
          vars = _this3.vars;
          tl = _this3.timeline = new Timeline({
            data: "nested",
            defaults: defaults || {}
          });
          tl.kill();
          tl.parent = _assertThisInitialized(_this3);

          if (keyframes) {
            _setDefaults(tl.vars.defaults, {
              ease: "none"
            });

            keyframes.forEach(function (frame) {
              return tl.to(parsedTargets, frame, ">");
            });
          } else {
            l = parsedTargets.length;
            staggerFunc = stagger ? distribute(stagger) : _emptyFunc;

            if (_isObject(stagger)) {
              //users can pass in callbacks like onStart/onComplete in the stagger object. These should fire with each individual tween.
              for (p in stagger) {
                if (~_staggerTweenProps.indexOf(p)) {
                  staggerVarsToMerge || (staggerVarsToMerge = {});
                  staggerVarsToMerge[p] = stagger[p];
                }
              }
            }

            for (i = 0; i < l; i++) {
              copy = {};

              for (p in vars) {
                if (_staggerPropsToSkip.indexOf(p) < 0) {
                  copy[p] = vars[p];
                }
              }

              copy.stagger = 0;
              yoyoEase && (copy.yoyoEase = yoyoEase);
              staggerVarsToMerge && _merge(copy, staggerVarsToMerge);
              curTarget = parsedTargets[i]; //don't just copy duration or delay because if they're a string or function, we'd end up in an infinite loop because _isFuncOrString() would evaluate as true in the child tweens, entering this loop, etc. So we parse the value straight from vars and default to 0.

              copy.duration = +_parseFuncOrString(duration, _assertThisInitialized(_this3), i, curTarget, parsedTargets);
              copy.delay = (+_parseFuncOrString(delay, _assertThisInitialized(_this3), i, curTarget, parsedTargets) || 0) - _this3._delay;

              if (!stagger && l === 1 && copy.delay) {
                // if someone does delay:"random(1, 5)", repeat:-1, for example, the delay shouldn't be inside the repeat.
                _this3._delay = delay = copy.delay;
                _this3._start += delay;
                copy.delay = 0;
              }

              tl.to(curTarget, copy, staggerFunc(i, curTarget, parsedTargets));
            }

            tl.duration() ? duration = delay = 0 : _this3.timeline = 0; // if the timeline's duration is 0, we don't need a timeline internally!
          }

          duration || _this3.duration(duration = tl.duration());
        } else {
          _this3.timeline = 0; //speed optimization, faster lookups (no going up the prototype chain)
        }

        if (overwrite === true) {
          _overwritingTween = _assertThisInitialized(_this3);

          _globalTimeline.killTweensOf(parsedTargets);

          _overwritingTween = 0;
        }

        parent && _postAddChecks(parent, _assertThisInitialized(_this3));

        if (immediateRender || !duration && !keyframes && _this3._start === _round(parent._time) && _isNotFalse(immediateRender) && _hasNoPausedAncestors(_assertThisInitialized(_this3)) && parent.data !== "nested") {
          _this3._tTime = -_tinyNum; //forces a render without having to set the render() "force" parameter to true because we want to allow lazying by default (using the "force" parameter always forces an immediate full render)

          _this3.render(Math.max(0, -delay)); //in case delay is negative

        }

        scrollTrigger && _scrollTrigger(_assertThisInitialized(_this3), scrollTrigger);
        return _this3;
      }

      var _proto3 = Tween.prototype;

      _proto3.render = function render(totalTime, suppressEvents, force) {
        var prevTime = this._time,
            tDur = this._tDur,
            dur = this._dur,
            tTime = totalTime > tDur - _tinyNum && totalTime >= 0 ? tDur : totalTime < _tinyNum ? 0 : totalTime,
            time,
            pt,
            iteration,
            cycleDuration,
            prevIteration,
            isYoyo,
            ratio,
            timeline,
            yoyoEase;

        if (!dur) {
          _renderZeroDurationTween(this, totalTime, suppressEvents, force);
        } else if (tTime !== this._tTime || !totalTime || force || this._startAt && this._zTime < 0 !== totalTime < 0) {
          //this senses if we're crossing over the start time, in which case we must record _zTime and force the render, but we do it in this lengthy conditional way for performance reasons (usually we can skip the calculations): this._initted && (this._zTime < 0) !== (totalTime < 0)
          time = tTime;
          timeline = this.timeline;

          if (this._repeat) {
            //adjust the time for repeats and yoyos
            cycleDuration = dur + this._rDelay;
            time = _round(tTime % cycleDuration); //round to avoid floating point errors. (4 % 0.8 should be 0 but some browsers report it as 0.79999999!)

            if (tTime === tDur) {
              // the tDur === tTime is for edge cases where there's a lengthy decimal on the duration and it may reach the very end but the time is rendered as not-quite-there (remember, tDur is rounded to 4 decimals whereas dur isn't)
              iteration = this._repeat;
              time = dur;
            } else {
              iteration = ~~(tTime / cycleDuration);

              if (iteration && iteration === tTime / cycleDuration) {
                time = dur;
                iteration--;
              }

              time > dur && (time = dur);
            }

            isYoyo = this._yoyo && iteration & 1;

            if (isYoyo) {
              yoyoEase = this._yEase;
              time = dur - time;
            }

            prevIteration = _animationCycle(this._tTime, cycleDuration);

            if (time === prevTime && !force && this._initted) {
              //could be during the repeatDelay part. No need to render and fire callbacks.
              return this;
            }

            if (iteration !== prevIteration) {
              timeline && this._yEase && _propagateYoyoEase(timeline, isYoyo); //repeatRefresh functionality

              if (this.vars.repeatRefresh && !isYoyo && !this._lock) {
                this._lock = force = 1; //force, otherwise if lazy is true, the _attemptInitTween() will return and we'll jump out and get caught bouncing on each tick.

                this.render(_round(cycleDuration * iteration), true).invalidate()._lock = 0;
              }
            }
          }

          if (!this._initted) {
            if (_attemptInitTween(this, totalTime < 0 ? totalTime : time, force, suppressEvents)) {
              this._tTime = 0; // in constructor if immediateRender is true, we set _tTime to -_tinyNum to have the playhead cross the starting point but we can't leave _tTime as a negative number.

              return this;
            }

            if (dur !== this._dur) {
              // while initting, a plugin like InertiaPlugin might alter the duration, so rerun from the start to ensure everything renders as it should.
              return this.render(totalTime, suppressEvents, force);
            }
          }

          this._tTime = tTime;
          this._time = time;

          if (!this._act && this._ts) {
            this._act = 1; //as long as it's not paused, force it to be active so that if the user renders independent of the parent timeline, it'll be forced to re-render on the next tick.

            this._lazy = 0;
          }

          this.ratio = ratio = (yoyoEase || this._ease)(time / dur);

          if (this._from) {
            this.ratio = ratio = 1 - ratio;
          }

          time && !prevTime && !suppressEvents && _callback(this, "onStart");
          pt = this._pt;

          while (pt) {
            pt.r(ratio, pt.d);
            pt = pt._next;
          }

          timeline && timeline.render(totalTime < 0 ? totalTime : !time && isYoyo ? -_tinyNum : timeline._dur * ratio, suppressEvents, force) || this._startAt && (this._zTime = totalTime);

          if (this._onUpdate && !suppressEvents) {
            totalTime < 0 && this._startAt && this._startAt.render(totalTime, true, force); //note: for performance reasons, we tuck this conditional logic inside less traveled areas (most tweens don't have an onUpdate). We'd just have it at the end before the onComplete, but the values should be updated before any onUpdate is called, so we ALSO put it here and then if it's not called, we do so later near the onComplete.

            _callback(this, "onUpdate");
          }

          this._repeat && iteration !== prevIteration && this.vars.onRepeat && !suppressEvents && this.parent && _callback(this, "onRepeat");

          if ((tTime === this._tDur || !tTime) && this._tTime === tTime) {
            totalTime < 0 && this._startAt && !this._onUpdate && this._startAt.render(totalTime, true, true);
            (totalTime || !dur) && (tTime === this._tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1); // don't remove if we're rendering at exactly a time of 0, as there could be autoRevert values that should get set on the next tick (if the playhead goes backward beyond the startTime, negative totalTime). Don't remove if the timeline is reversed and the playhead isn't at 0, otherwise tl.progress(1).reverse() won't work. Only remove if the playhead is at the end and timeScale is positive, or if the playhead is at 0 and the timeScale is negative.

            if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime)) {
              // if prevTime and tTime are zero, we shouldn't fire the onReverseComplete. This could happen if you gsap.to(... {paused:true}).play();
              _callback(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);

              this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
            }
          }
        }

        return this;
      };

      _proto3.targets = function targets() {
        return this._targets;
      };

      _proto3.invalidate = function invalidate() {
        this._pt = this._op = this._startAt = this._onUpdate = this._act = this._lazy = 0;
        this._ptLookup = [];
        this.timeline && this.timeline.invalidate();
        return _Animation2.prototype.invalidate.call(this);
      };

      _proto3.kill = function kill(targets, vars) {
        if (vars === void 0) {
          vars = "all";
        }

        if (!targets && (!vars || vars === "all")) {
          this._lazy = 0;

          if (this.parent) {
            return _interrupt(this);
          }
        }

        if (this.timeline) {
          var tDur = this.timeline.totalDuration();
          this.timeline.killTweensOf(targets, vars, _overwritingTween && _overwritingTween.vars.overwrite !== true)._first || _interrupt(this); // if nothing is left tweenng, interrupt.

          this.parent && tDur !== this.timeline.totalDuration() && _setDuration(this, this._dur * this.timeline._tDur / tDur, 0, 1); // if a nested tween is killed that changes the duration, it should affect this tween's duration. We must use the ratio, though, because sometimes the internal timeline is stretched like for keyframes where they don't all add up to whatever the parent tween's duration was set to.

          return this;
        }

        var parsedTargets = this._targets,
            killingTargets = targets ? toArray(targets) : parsedTargets,
            propTweenLookup = this._ptLookup,
            firstPT = this._pt,
            overwrittenProps,
            curLookup,
            curOverwriteProps,
            props,
            p,
            pt,
            i;

        if ((!vars || vars === "all") && _arraysMatch(parsedTargets, killingTargets)) {
          vars === "all" && (this._pt = 0);
          return _interrupt(this);
        }

        overwrittenProps = this._op = this._op || [];

        if (vars !== "all") {
          //so people can pass in a comma-delimited list of property names
          if (_isString(vars)) {
            p = {};

            _forEachName(vars, function (name) {
              return p[name] = 1;
            });

            vars = p;
          }

          vars = _addAliasesToVars(parsedTargets, vars);
        }

        i = parsedTargets.length;

        while (i--) {
          if (~killingTargets.indexOf(parsedTargets[i])) {
            curLookup = propTweenLookup[i];

            if (vars === "all") {
              overwrittenProps[i] = vars;
              props = curLookup;
              curOverwriteProps = {};
            } else {
              curOverwriteProps = overwrittenProps[i] = overwrittenProps[i] || {};
              props = vars;
            }

            for (p in props) {
              pt = curLookup && curLookup[p];

              if (pt) {
                if (!("kill" in pt.d) || pt.d.kill(p) === true) {
                  _removeLinkedListItem(this, pt, "_pt");
                }

                delete curLookup[p];
              }

              if (curOverwriteProps !== "all") {
                curOverwriteProps[p] = 1;
              }
            }
          }
        }

        this._initted && !this._pt && firstPT && _interrupt(this); //if all tweening properties are killed, kill the tween. Without this line, if there's a tween with multiple targets and then you killTweensOf() each target individually, the tween would technically still remain active and fire its onComplete even though there aren't any more properties tweening.

        return this;
      };

      Tween.to = function to(targets, vars) {
        return new Tween(targets, vars, arguments[2]);
      };

      Tween.from = function from(targets, vars) {
        return new Tween(targets, _parseVars(arguments, 1));
      };

      Tween.delayedCall = function delayedCall(delay, callback, params, scope) {
        return new Tween(callback, 0, {
          immediateRender: false,
          lazy: false,
          overwrite: false,
          delay: delay,
          onComplete: callback,
          onReverseComplete: callback,
          onCompleteParams: params,
          onReverseCompleteParams: params,
          callbackScope: scope
        });
      };

      Tween.fromTo = function fromTo(targets, fromVars, toVars) {
        return new Tween(targets, _parseVars(arguments, 2));
      };

      Tween.set = function set(targets, vars) {
        vars.duration = 0;
        vars.repeatDelay || (vars.repeat = 0);
        return new Tween(targets, vars);
      };

      Tween.killTweensOf = function killTweensOf(targets, props, onlyActive) {
        return _globalTimeline.killTweensOf(targets, props, onlyActive);
      };

      return Tween;
    }(Animation);

    _setDefaults(Tween.prototype, {
      _targets: [],
      _lazy: 0,
      _startAt: 0,
      _op: 0,
      _onInit: 0
    }); //add the pertinent timeline methods to Tween instances so that users can chain conveniently and create a timeline automatically. (removed due to concerns that it'd ultimately add to more confusion especially for beginners)
    // _forEachName("to,from,fromTo,set,call,add,addLabel,addPause", name => {
    // 	Tween.prototype[name] = function() {
    // 		let tl = new Timeline();
    // 		return _addToTimeline(tl, this)[name].apply(tl, toArray(arguments));
    // 	}
    // });
    //for backward compatibility. Leverage the timeline calls.


    _forEachName("staggerTo,staggerFrom,staggerFromTo", function (name) {
      Tween[name] = function () {
        var tl = new Timeline(),
            params = _slice.call(arguments, 0);

        params.splice(name === "staggerFromTo" ? 5 : 4, 0, 0);
        return tl[name].apply(tl, params);
      };
    });
    /*
     * --------------------------------------------------------------------------------------
     * PROPTWEEN
     * --------------------------------------------------------------------------------------
     */


    var _setterPlain = function _setterPlain(target, property, value) {
      return target[property] = value;
    },
        _setterFunc = function _setterFunc(target, property, value) {
      return target[property](value);
    },
        _setterFuncWithParam = function _setterFuncWithParam(target, property, value, data) {
      return target[property](data.fp, value);
    },
        _setterAttribute = function _setterAttribute(target, property, value) {
      return target.setAttribute(property, value);
    },
        _getSetter = function _getSetter(target, property) {
      return _isFunction(target[property]) ? _setterFunc : _isUndefined(target[property]) && target.setAttribute ? _setterAttribute : _setterPlain;
    },
        _renderPlain = function _renderPlain(ratio, data) {
      return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 10000) / 10000, data);
    },
        _renderBoolean = function _renderBoolean(ratio, data) {
      return data.set(data.t, data.p, !!(data.s + data.c * ratio), data);
    },
        _renderComplexString = function _renderComplexString(ratio, data) {
      var pt = data._pt,
          s = "";

      if (!ratio && data.b) {
        //b = beginning string
        s = data.b;
      } else if (ratio === 1 && data.e) {
        //e = ending string
        s = data.e;
      } else {
        while (pt) {
          s = pt.p + (pt.m ? pt.m(pt.s + pt.c * ratio) : Math.round((pt.s + pt.c * ratio) * 10000) / 10000) + s; //we use the "p" property for the text inbetween (like a suffix). And in the context of a complex string, the modifier (m) is typically just Math.round(), like for RGB colors.

          pt = pt._next;
        }

        s += data.c; //we use the "c" of the PropTween to store the final chunk of non-numeric text.
      }

      data.set(data.t, data.p, s, data);
    },
        _renderPropTweens = function _renderPropTweens(ratio, data) {
      var pt = data._pt;

      while (pt) {
        pt.r(ratio, pt.d);
        pt = pt._next;
      }
    },
        _addPluginModifier = function _addPluginModifier(modifier, tween, target, property) {
      var pt = this._pt,
          next;

      while (pt) {
        next = pt._next;
        pt.p === property && pt.modifier(modifier, tween, target);
        pt = next;
      }
    },
        _killPropTweensOf = function _killPropTweensOf(property) {
      var pt = this._pt,
          hasNonDependentRemaining,
          next;

      while (pt) {
        next = pt._next;

        if (pt.p === property && !pt.op || pt.op === property) {
          _removeLinkedListItem(this, pt, "_pt");
        } else if (!pt.dep) {
          hasNonDependentRemaining = 1;
        }

        pt = next;
      }

      return !hasNonDependentRemaining;
    },
        _setterWithModifier = function _setterWithModifier(target, property, value, data) {
      data.mSet(target, property, data.m.call(data.tween, value, data.mt), data);
    },
        _sortPropTweensByPriority = function _sortPropTweensByPriority(parent) {
      var pt = parent._pt,
          next,
          pt2,
          first,
          last; //sorts the PropTween linked list in order of priority because some plugins need to do their work after ALL of the PropTweens were created (like RoundPropsPlugin and ModifiersPlugin)

      while (pt) {
        next = pt._next;
        pt2 = first;

        while (pt2 && pt2.pr > pt.pr) {
          pt2 = pt2._next;
        }

        if (pt._prev = pt2 ? pt2._prev : last) {
          pt._prev._next = pt;
        } else {
          first = pt;
        }

        if (pt._next = pt2) {
          pt2._prev = pt;
        } else {
          last = pt;
        }

        pt = next;
      }

      parent._pt = first;
    }; //PropTween key: t = target, p = prop, r = renderer, d = data, s = start, c = change, op = overwriteProperty (ONLY populated when it's different than p), pr = priority, _next/_prev for the linked list siblings, set = setter, m = modifier, mSet = modifierSetter (the original setter, before a modifier was added)


    var PropTween = /*#__PURE__*/function () {
      function PropTween(next, target, prop, start, change, renderer, data, setter, priority) {
        this.t = target;
        this.s = start;
        this.c = change;
        this.p = prop;
        this.r = renderer || _renderPlain;
        this.d = data || this;
        this.set = setter || _setterPlain;
        this.pr = priority || 0;
        this._next = next;

        if (next) {
          next._prev = this;
        }
      }

      var _proto4 = PropTween.prototype;

      _proto4.modifier = function modifier(func, tween, target) {
        this.mSet = this.mSet || this.set; //in case it was already set (a PropTween can only have one modifier)

        this.set = _setterWithModifier;
        this.m = func;
        this.mt = target; //modifier target

        this.tween = tween;
      };

      return PropTween;
    }(); //Initialization tasks

    _forEachName(_callbackNames + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function (name) {
      return _reservedProps[name] = 1;
    });

    _globals.TweenMax = _globals.TweenLite = Tween;
    _globals.TimelineLite = _globals.TimelineMax = Timeline;
    _globalTimeline = new Timeline({
      sortChildren: false,
      defaults: _defaults,
      autoRemoveChildren: true,
      id: "root",
      smoothChildTiming: true
    });
    _config.stringFilter = _colorStringFilter;
    /*
     * --------------------------------------------------------------------------------------
     * GSAP
     * --------------------------------------------------------------------------------------
     */

    var _gsap = {
      registerPlugin: function registerPlugin() {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        args.forEach(function (config) {
          return _createPlugin(config);
        });
      },
      timeline: function timeline(vars) {
        return new Timeline(vars);
      },
      getTweensOf: function getTweensOf(targets, onlyActive) {
        return _globalTimeline.getTweensOf(targets, onlyActive);
      },
      getProperty: function getProperty(target, property, unit, uncache) {
        _isString(target) && (target = toArray(target)[0]); //in case selector text or an array is passed in

        var getter = _getCache(target || {}).get,
            format = unit ? _passThrough : _numericIfPossible;

        unit === "native" && (unit = "");
        return !target ? target : !property ? function (property, unit, uncache) {
          return format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
        } : format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
      },
      quickSetter: function quickSetter(target, property, unit) {
        target = toArray(target);

        if (target.length > 1) {
          var setters = target.map(function (t) {
            return gsap.quickSetter(t, property, unit);
          }),
              l = setters.length;
          return function (value) {
            var i = l;

            while (i--) {
              setters[i](value);
            }
          };
        }

        target = target[0] || {};

        var Plugin = _plugins[property],
            cache = _getCache(target),
            p = cache.harness && (cache.harness.aliases || {})[property] || property,
            // in case it's an alias, like "rotate" for "rotation".
        setter = Plugin ? function (value) {
          var p = new Plugin();
          _quickTween._pt = 0;
          p.init(target, unit ? value + unit : value, _quickTween, 0, [target]);
          p.render(1, p);
          _quickTween._pt && _renderPropTweens(1, _quickTween);
        } : cache.set(target, p);

        return Plugin ? setter : function (value) {
          return setter(target, p, unit ? value + unit : value, cache, 1);
        };
      },
      isTweening: function isTweening(targets) {
        return _globalTimeline.getTweensOf(targets, true).length > 0;
      },
      defaults: function defaults(value) {
        value && value.ease && (value.ease = _parseEase(value.ease, _defaults.ease));
        return _mergeDeep(_defaults, value || {});
      },
      config: function config(value) {
        return _mergeDeep(_config, value || {});
      },
      registerEffect: function registerEffect(_ref) {
        var name = _ref.name,
            effect = _ref.effect,
            plugins = _ref.plugins,
            defaults = _ref.defaults,
            extendTimeline = _ref.extendTimeline;
        (plugins || "").split(",").forEach(function (pluginName) {
          return pluginName && !_plugins[pluginName] && !_globals[pluginName] && _warn(name + " effect requires " + pluginName + " plugin.");
        });

        _effects[name] = function (targets, vars, tl) {
          return effect(toArray(targets), _setDefaults(vars || {}, defaults), tl);
        };

        if (extendTimeline) {
          Timeline.prototype[name] = function (targets, vars, position) {
            return this.add(_effects[name](targets, _isObject(vars) ? vars : (position = vars) && {}, this), position);
          };
        }
      },
      registerEase: function registerEase(name, ease) {
        _easeMap[name] = _parseEase(ease);
      },
      parseEase: function parseEase(ease, defaultEase) {
        return arguments.length ? _parseEase(ease, defaultEase) : _easeMap;
      },
      getById: function getById(id) {
        return _globalTimeline.getById(id);
      },
      exportRoot: function exportRoot(vars, includeDelayedCalls) {
        if (vars === void 0) {
          vars = {};
        }

        var tl = new Timeline(vars),
            child,
            next;
        tl.smoothChildTiming = _isNotFalse(vars.smoothChildTiming);

        _globalTimeline.remove(tl);

        tl._dp = 0; //otherwise it'll get re-activated when adding children and be re-introduced into _globalTimeline's linked list (then added to itself).

        tl._time = tl._tTime = _globalTimeline._time;
        child = _globalTimeline._first;

        while (child) {
          next = child._next;

          if (includeDelayedCalls || !(!child._dur && child instanceof Tween && child.vars.onComplete === child._targets[0])) {
            _addToTimeline(tl, child, child._start - child._delay);
          }

          child = next;
        }

        _addToTimeline(_globalTimeline, tl, 0);

        return tl;
      },
      utils: {
        wrap: wrap,
        wrapYoyo: wrapYoyo,
        distribute: distribute,
        random: random,
        snap: snap,
        normalize: normalize,
        getUnit: getUnit,
        clamp: clamp,
        splitColor: splitColor,
        toArray: toArray,
        mapRange: mapRange,
        pipe: pipe,
        unitize: unitize,
        interpolate: interpolate,
        shuffle: shuffle
      },
      install: _install,
      effects: _effects,
      ticker: _ticker,
      updateRoot: Timeline.updateRoot,
      plugins: _plugins,
      globalTimeline: _globalTimeline,
      core: {
        PropTween: PropTween,
        globals: _addGlobal,
        Tween: Tween,
        Timeline: Timeline,
        Animation: Animation,
        getCache: _getCache,
        _removeLinkedListItem: _removeLinkedListItem
      }
    };

    _forEachName("to,from,fromTo,delayedCall,set,killTweensOf", function (name) {
      return _gsap[name] = Tween[name];
    });

    _ticker.add(Timeline.updateRoot);

    _quickTween = _gsap.to({}, {
      duration: 0
    }); // ---- EXTRA PLUGINS --------------------------------------------------------

    var _getPluginPropTween = function _getPluginPropTween(plugin, prop) {
      var pt = plugin._pt;

      while (pt && pt.p !== prop && pt.op !== prop && pt.fp !== prop) {
        pt = pt._next;
      }

      return pt;
    },
        _addModifiers = function _addModifiers(tween, modifiers) {
      var targets = tween._targets,
          p,
          i,
          pt;

      for (p in modifiers) {
        i = targets.length;

        while (i--) {
          pt = tween._ptLookup[i][p];

          if (pt && (pt = pt.d)) {
            if (pt._pt) {
              // is a plugin
              pt = _getPluginPropTween(pt, p);
            }

            pt && pt.modifier && pt.modifier(modifiers[p], tween, targets[i], p);
          }
        }
      }
    },
        _buildModifierPlugin = function _buildModifierPlugin(name, modifier) {
      return {
        name: name,
        rawVars: 1,
        //don't pre-process function-based values or "random()" strings.
        init: function init(target, vars, tween) {
          tween._onInit = function (tween) {
            var temp, p;

            if (_isString(vars)) {
              temp = {};

              _forEachName(vars, function (name) {
                return temp[name] = 1;
              }); //if the user passes in a comma-delimited list of property names to roundProps, like "x,y", we round to whole numbers.


              vars = temp;
            }

            if (modifier) {
              temp = {};

              for (p in vars) {
                temp[p] = modifier(vars[p]);
              }

              vars = temp;
            }

            _addModifiers(tween, vars);
          };
        }
      };
    }; //register core plugins


    var gsap = _gsap.registerPlugin({
      name: "attr",
      init: function init(target, vars, tween, index, targets) {
        var p, pt;

        for (p in vars) {
          pt = this.add(target, "setAttribute", (target.getAttribute(p) || 0) + "", vars[p], index, targets, 0, 0, p);
          pt && (pt.op = p);

          this._props.push(p);
        }
      }
    }, {
      name: "endArray",
      init: function init(target, value) {
        var i = value.length;

        while (i--) {
          this.add(target, i, target[i] || 0, value[i]);
        }
      }
    }, _buildModifierPlugin("roundProps", _roundModifier), _buildModifierPlugin("modifiers"), _buildModifierPlugin("snap", snap)) || _gsap; //to prevent the core plugins from being dropped via aggressive tree shaking, we must include them in the variable declaration in this way.

    Tween.version = Timeline.version = gsap.version = "3.5.1";
    _coreReady = 1;

    if (_windowExists()) {
      _wake();
    }

    var Expo = _easeMap.Expo;

    /*!
     * CSSPlugin 3.5.1
     * https://greensock.com
     *
     * Copyright 2008-2020, GreenSock. All rights reserved.
     * Subject to the terms at https://greensock.com/standard-license or for
     * Club GreenSock members, the agreement issued with that membership.
     * @author: Jack Doyle, jack@greensock.com
    */

    var _win$1,
        _doc$1,
        _docElement,
        _pluginInitted,
        _tempDiv,
        _tempDivStyler,
        _recentSetterPlugin,
        _windowExists$1 = function _windowExists() {
      return typeof window !== "undefined";
    },
        _transformProps = {},
        _RAD2DEG = 180 / Math.PI,
        _DEG2RAD = Math.PI / 180,
        _atan2 = Math.atan2,
        _bigNum$1 = 1e8,
        _capsExp = /([A-Z])/g,
        _horizontalExp = /(?:left|right|width|margin|padding|x)/i,
        _complexExp = /[\s,\(]\S/,
        _propertyAliases = {
      autoAlpha: "opacity,visibility",
      scale: "scaleX,scaleY",
      alpha: "opacity"
    },
        _renderCSSProp = function _renderCSSProp(ratio, data) {
      return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u, data);
    },
        _renderPropWithEnd = function _renderPropWithEnd(ratio, data) {
      return data.set(data.t, data.p, ratio === 1 ? data.e : Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u, data);
    },
        _renderCSSPropWithBeginning = function _renderCSSPropWithBeginning(ratio, data) {
      return data.set(data.t, data.p, ratio ? Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u : data.b, data);
    },
        //if units change, we need a way to render the original unit/value when the tween goes all the way back to the beginning (ratio:0)
    _renderRoundedCSSProp = function _renderRoundedCSSProp(ratio, data) {
      var value = data.s + data.c * ratio;
      data.set(data.t, data.p, ~~(value + (value < 0 ? -.5 : .5)) + data.u, data);
    },
        _renderNonTweeningValue = function _renderNonTweeningValue(ratio, data) {
      return data.set(data.t, data.p, ratio ? data.e : data.b, data);
    },
        _renderNonTweeningValueOnlyAtEnd = function _renderNonTweeningValueOnlyAtEnd(ratio, data) {
      return data.set(data.t, data.p, ratio !== 1 ? data.b : data.e, data);
    },
        _setterCSSStyle = function _setterCSSStyle(target, property, value) {
      return target.style[property] = value;
    },
        _setterCSSProp = function _setterCSSProp(target, property, value) {
      return target.style.setProperty(property, value);
    },
        _setterTransform = function _setterTransform(target, property, value) {
      return target._gsap[property] = value;
    },
        _setterScale = function _setterScale(target, property, value) {
      return target._gsap.scaleX = target._gsap.scaleY = value;
    },
        _setterScaleWithRender = function _setterScaleWithRender(target, property, value, data, ratio) {
      var cache = target._gsap;
      cache.scaleX = cache.scaleY = value;
      cache.renderTransform(ratio, cache);
    },
        _setterTransformWithRender = function _setterTransformWithRender(target, property, value, data, ratio) {
      var cache = target._gsap;
      cache[property] = value;
      cache.renderTransform(ratio, cache);
    },
        _transformProp = "transform",
        _transformOriginProp = _transformProp + "Origin",
        _supports3D,
        _createElement = function _createElement(type, ns) {
      var e = _doc$1.createElementNS ? _doc$1.createElementNS((ns || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), type) : _doc$1.createElement(type); //some servers swap in https for http in the namespace which can break things, making "style" inaccessible.

      return e.style ? e : _doc$1.createElement(type); //some environments won't allow access to the element's style when created with a namespace in which case we default to the standard createElement() to work around the issue. Also note that when GSAP is embedded directly inside an SVG file, createElement() won't allow access to the style object in Firefox (see https://greensock.com/forums/topic/20215-problem-using-tweenmax-in-standalone-self-containing-svg-file-err-cannot-set-property-csstext-of-undefined/).
    },
        _getComputedProperty = function _getComputedProperty(target, property, skipPrefixFallback) {
      var cs = getComputedStyle(target);
      return cs[property] || cs.getPropertyValue(property.replace(_capsExp, "-$1").toLowerCase()) || cs.getPropertyValue(property) || !skipPrefixFallback && _getComputedProperty(target, _checkPropPrefix(property) || property, 1) || ""; //css variables may not need caps swapped out for dashes and lowercase.
    },
        _prefixes = "O,Moz,ms,Ms,Webkit".split(","),
        _checkPropPrefix = function _checkPropPrefix(property, element, preferPrefix) {
      var e = element || _tempDiv,
          s = e.style,
          i = 5;

      if (property in s && !preferPrefix) {
        return property;
      }

      property = property.charAt(0).toUpperCase() + property.substr(1);

      while (i-- && !(_prefixes[i] + property in s)) {}

      return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? _prefixes[i] : "") + property;
    },
        _initCore = function _initCore() {
      if (_windowExists$1() && window.document) {
        _win$1 = window;
        _doc$1 = _win$1.document;
        _docElement = _doc$1.documentElement;
        _tempDiv = _createElement("div") || {
          style: {}
        };
        _tempDivStyler = _createElement("div");
        _transformProp = _checkPropPrefix(_transformProp);
        _transformOriginProp = _transformProp + "Origin";
        _tempDiv.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0"; //make sure to override certain properties that may contaminate measurements, in case the user has overreaching style sheets.

        _supports3D = !!_checkPropPrefix("perspective");
        _pluginInitted = 1;
      }
    },
        _getBBoxHack = function _getBBoxHack(swapIfPossible) {
      //works around issues in some browsers (like Firefox) that don't correctly report getBBox() on SVG elements inside a <defs> element and/or <mask>. We try creating an SVG, adding it to the documentElement and toss the element in there so that it's definitely part of the rendering tree, then grab the bbox and if it works, we actually swap out the original getBBox() method for our own that does these extra steps whenever getBBox is needed. This helps ensure that performance is optimal (only do all these extra steps when absolutely necessary...most elements don't need it).
      var svg = _createElement("svg", this.ownerSVGElement && this.ownerSVGElement.getAttribute("xmlns") || "http://www.w3.org/2000/svg"),
          oldParent = this.parentNode,
          oldSibling = this.nextSibling,
          oldCSS = this.style.cssText,
          bbox;

      _docElement.appendChild(svg);

      svg.appendChild(this);
      this.style.display = "block";

      if (swapIfPossible) {
        try {
          bbox = this.getBBox();
          this._gsapBBox = this.getBBox; //store the original

          this.getBBox = _getBBoxHack;
        } catch (e) {}
      } else if (this._gsapBBox) {
        bbox = this._gsapBBox();
      }

      if (oldParent) {
        if (oldSibling) {
          oldParent.insertBefore(this, oldSibling);
        } else {
          oldParent.appendChild(this);
        }
      }

      _docElement.removeChild(svg);

      this.style.cssText = oldCSS;
      return bbox;
    },
        _getAttributeFallbacks = function _getAttributeFallbacks(target, attributesArray) {
      var i = attributesArray.length;

      while (i--) {
        if (target.hasAttribute(attributesArray[i])) {
          return target.getAttribute(attributesArray[i]);
        }
      }
    },
        _getBBox = function _getBBox(target) {
      var bounds;

      try {
        bounds = target.getBBox(); //Firefox throws errors if you try calling getBBox() on an SVG element that's not rendered (like in a <symbol> or <defs>). https://bugzilla.mozilla.org/show_bug.cgi?id=612118
      } catch (error) {
        bounds = _getBBoxHack.call(target, true);
      }

      bounds && (bounds.width || bounds.height) || target.getBBox === _getBBoxHack || (bounds = _getBBoxHack.call(target, true)); //some browsers (like Firefox) misreport the bounds if the element has zero width and height (it just assumes it's at x:0, y:0), thus we need to manually grab the position in that case.

      return bounds && !bounds.width && !bounds.x && !bounds.y ? {
        x: +_getAttributeFallbacks(target, ["x", "cx", "x1"]) || 0,
        y: +_getAttributeFallbacks(target, ["y", "cy", "y1"]) || 0,
        width: 0,
        height: 0
      } : bounds;
    },
        _isSVG = function _isSVG(e) {
      return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && _getBBox(e));
    },
        //reports if the element is an SVG on which getBBox() actually works
    _removeProperty = function _removeProperty(target, property) {
      if (property) {
        var style = target.style;

        if (property in _transformProps && property !== _transformOriginProp) {
          property = _transformProp;
        }

        if (style.removeProperty) {
          if (property.substr(0, 2) === "ms" || property.substr(0, 6) === "webkit") {
            //Microsoft and some Webkit browsers don't conform to the standard of capitalizing the first prefix character, so we adjust so that when we prefix the caps with a dash, it's correct (otherwise it'd be "ms-transform" instead of "-ms-transform" for IE9, for example)
            property = "-" + property;
          }

          style.removeProperty(property.replace(_capsExp, "-$1").toLowerCase());
        } else {
          //note: old versions of IE use "removeAttribute()" instead of "removeProperty()"
          style.removeAttribute(property);
        }
      }
    },
        _addNonTweeningPT = function _addNonTweeningPT(plugin, target, property, beginning, end, onlySetAtEnd) {
      var pt = new PropTween(plugin._pt, target, property, 0, 1, onlySetAtEnd ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue);
      plugin._pt = pt;
      pt.b = beginning;
      pt.e = end;

      plugin._props.push(property);

      return pt;
    },
        _nonConvertibleUnits = {
      deg: 1,
      rad: 1,
      turn: 1
    },
        //takes a single value like 20px and converts it to the unit specified, like "%", returning only the numeric amount.
    _convertToUnit = function _convertToUnit(target, property, value, unit) {
      var curValue = parseFloat(value) || 0,
          curUnit = (value + "").trim().substr((curValue + "").length) || "px",
          // some browsers leave extra whitespace at the beginning of CSS variables, hence the need to trim()
      style = _tempDiv.style,
          horizontal = _horizontalExp.test(property),
          isRootSVG = target.tagName.toLowerCase() === "svg",
          measureProperty = (isRootSVG ? "client" : "offset") + (horizontal ? "Width" : "Height"),
          amount = 100,
          toPixels = unit === "px",
          toPercent = unit === "%",
          px,
          parent,
          cache,
          isSVG;

      if (unit === curUnit || !curValue || _nonConvertibleUnits[unit] || _nonConvertibleUnits[curUnit]) {
        return curValue;
      }

      curUnit !== "px" && !toPixels && (curValue = _convertToUnit(target, property, value, "px"));
      isSVG = target.getCTM && _isSVG(target);

      if (toPercent && (_transformProps[property] || ~property.indexOf("adius"))) {
        //transforms and borderRadius are relative to the size of the element itself!
        return _round(curValue / (isSVG ? target.getBBox()[horizontal ? "width" : "height"] : target[measureProperty]) * amount);
      }

      style[horizontal ? "width" : "height"] = amount + (toPixels ? curUnit : unit);
      parent = ~property.indexOf("adius") || unit === "em" && target.appendChild && !isRootSVG ? target : target.parentNode;

      if (isSVG) {
        parent = (target.ownerSVGElement || {}).parentNode;
      }

      if (!parent || parent === _doc$1 || !parent.appendChild) {
        parent = _doc$1.body;
      }

      cache = parent._gsap;

      if (cache && toPercent && cache.width && horizontal && cache.time === _ticker.time) {
        return _round(curValue / cache.width * amount);
      } else {
        (toPercent || curUnit === "%") && (style.position = _getComputedProperty(target, "position"));
        parent === target && (style.position = "static"); // like for borderRadius, if it's a % we must have it relative to the target itself but that may not have position: relative or position: absolute in which case it'd go up the chain until it finds its offsetParent (bad). position: static protects against that.

        parent.appendChild(_tempDiv);
        px = _tempDiv[measureProperty];
        parent.removeChild(_tempDiv);
        style.position = "absolute";

        if (horizontal && toPercent) {
          cache = _getCache(parent);
          cache.time = _ticker.time;
          cache.width = parent[measureProperty];
        }
      }

      return _round(toPixels ? px * curValue / amount : px && curValue ? amount / px * curValue : 0);
    },
        _get = function _get(target, property, unit, uncache) {
      var value;
      _pluginInitted || _initCore();

      if (property in _propertyAliases && property !== "transform") {
        property = _propertyAliases[property];

        if (~property.indexOf(",")) {
          property = property.split(",")[0];
        }
      }

      if (_transformProps[property] && property !== "transform") {
        value = _parseTransform(target, uncache);
        value = property !== "transformOrigin" ? value[property] : _firstTwoOnly(_getComputedProperty(target, _transformOriginProp)) + " " + value.zOrigin + "px";
      } else {
        value = target.style[property];

        if (!value || value === "auto" || uncache || ~(value + "").indexOf("calc(")) {
          value = _specialProps[property] && _specialProps[property](target, property, unit) || _getComputedProperty(target, property) || _getProperty(target, property) || (property === "opacity" ? 1 : 0); // note: some browsers, like Firefox, don't report borderRadius correctly! Instead, it only reports every corner like  borderTopLeftRadius
        }
      }

      return unit && !~(value + "").indexOf(" ") ? _convertToUnit(target, property, value, unit) + unit : value;
    },
        _tweenComplexCSSString = function _tweenComplexCSSString(target, prop, start, end) {
      //note: we call _tweenComplexCSSString.call(pluginInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.
      if (!start || start === "none") {
        // some browsers like Safari actually PREFER the prefixed property and mis-report the unprefixed value like clipPath (BUG). In other words, even though clipPath exists in the style ("clipPath" in target.style) and it's set in the CSS properly (along with -webkit-clip-path), Safari reports clipPath as "none" whereas WebkitClipPath reports accurately like "ellipse(100% 0% at 50% 0%)", so in this case we must SWITCH to using the prefixed property instead. See https://greensock.com/forums/topic/18310-clippath-doesnt-work-on-ios/
        var p = _checkPropPrefix(prop, target, 1),
            s = p && _getComputedProperty(target, p, 1);

        if (s && s !== start) {
          prop = p;
          start = s;
        } else if (prop === "borderColor") {
          start = _getComputedProperty(target, "borderTopColor"); // Firefox bug: always reports "borderColor" as "", so we must fall back to borderTopColor. See https://greensock.com/forums/topic/24583-how-to-return-colors-that-i-had-after-reverse/
        }
      }

      var pt = new PropTween(this._pt, target.style, prop, 0, 1, _renderComplexString),
          index = 0,
          matchIndex = 0,
          a,
          result,
          startValues,
          startNum,
          color,
          startValue,
          endValue,
          endNum,
          chunk,
          endUnit,
          startUnit,
          relative,
          endValues;
      pt.b = start;
      pt.e = end;
      start += ""; //ensure values are strings

      end += "";

      if (end === "auto") {
        target.style[prop] = end;
        end = _getComputedProperty(target, prop) || end;
        target.style[prop] = start;
      }

      a = [start, end];

      _colorStringFilter(a); //pass an array with the starting and ending values and let the filter do whatever it needs to the values. If colors are found, it returns true and then we must match where the color shows up order-wise because for things like boxShadow, sometimes the browser provides the computed values with the color FIRST, but the user provides it with the color LAST, so flip them if necessary. Same for drop-shadow().


      start = a[0];
      end = a[1];
      startValues = start.match(_numWithUnitExp) || [];
      endValues = end.match(_numWithUnitExp) || [];

      if (endValues.length) {
        while (result = _numWithUnitExp.exec(end)) {
          endValue = result[0];
          chunk = end.substring(index, result.index);

          if (color) {
            color = (color + 1) % 5;
          } else if (chunk.substr(-5) === "rgba(" || chunk.substr(-5) === "hsla(") {
            color = 1;
          }

          if (endValue !== (startValue = startValues[matchIndex++] || "")) {
            startNum = parseFloat(startValue) || 0;
            startUnit = startValue.substr((startNum + "").length);
            relative = endValue.charAt(1) === "=" ? +(endValue.charAt(0) + "1") : 0;

            if (relative) {
              endValue = endValue.substr(2);
            }

            endNum = parseFloat(endValue);
            endUnit = endValue.substr((endNum + "").length);
            index = _numWithUnitExp.lastIndex - endUnit.length;

            if (!endUnit) {
              //if something like "perspective:300" is passed in and we must add a unit to the end
              endUnit = endUnit || _config.units[prop] || startUnit;

              if (index === end.length) {
                end += endUnit;
                pt.e += endUnit;
              }
            }

            if (startUnit !== endUnit) {
              startNum = _convertToUnit(target, prop, startValue, endUnit) || 0;
            } //these nested PropTweens are handled in a special way - we'll never actually call a render or setter method on them. We'll just loop through them in the parent complex string PropTween's render method.


            pt._pt = {
              _next: pt._pt,
              p: chunk || matchIndex === 1 ? chunk : ",",
              //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
              s: startNum,
              c: relative ? relative * endNum : endNum - startNum,
              m: color && color < 4 ? Math.round : 0
            };
          }
        }

        pt.c = index < end.length ? end.substring(index, end.length) : ""; //we use the "c" of the PropTween to store the final part of the string (after the last number)
      } else {
        pt.r = prop === "display" && end === "none" ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue;
      }

      if (_relExp.test(end)) {
        pt.e = 0; //if the end string contains relative values or dynamic random(...) values, delete the end it so that on the final render we don't actually set it to the string with += or -= characters (forces it to use the calculated value).
      }

      this._pt = pt; //start the linked list with this new PropTween. Remember, we call _tweenComplexCSSString.call(pluginInstance...) to ensure that it's scoped properly. We may call it from within another plugin too, thus "this" would refer to the plugin.

      return pt;
    },
        _keywordToPercent = {
      top: "0%",
      bottom: "100%",
      left: "0%",
      right: "100%",
      center: "50%"
    },
        _convertKeywordsToPercentages = function _convertKeywordsToPercentages(value) {
      var split = value.split(" "),
          x = split[0],
          y = split[1] || "50%";

      if (x === "top" || x === "bottom" || y === "left" || y === "right") {
        //the user provided them in the wrong order, so flip them
        value = x;
        x = y;
        y = value;
      }

      split[0] = _keywordToPercent[x] || x;
      split[1] = _keywordToPercent[y] || y;
      return split.join(" ");
    },
        _renderClearProps = function _renderClearProps(ratio, data) {
      if (data.tween && data.tween._time === data.tween._dur) {
        var target = data.t,
            style = target.style,
            props = data.u,
            cache = target._gsap,
            prop,
            clearTransforms,
            i;

        if (props === "all" || props === true) {
          style.cssText = "";
          clearTransforms = 1;
        } else {
          props = props.split(",");
          i = props.length;

          while (--i > -1) {
            prop = props[i];

            if (_transformProps[prop]) {
              clearTransforms = 1;
              prop = prop === "transformOrigin" ? _transformOriginProp : _transformProp;
            }

            _removeProperty(target, prop);
          }
        }

        if (clearTransforms) {
          _removeProperty(target, _transformProp);

          if (cache) {
            cache.svg && target.removeAttribute("transform");

            _parseTransform(target, 1); // force all the cached values back to "normal"/identity, otherwise if there's another tween that's already set to render transforms on this element, it could display the wrong values.


            cache.uncache = 1;
          }
        }
      }
    },
        // note: specialProps should return 1 if (and only if) they have a non-zero priority. It indicates we need to sort the linked list.
    _specialProps = {
      clearProps: function clearProps(plugin, target, property, endValue, tween) {
        if (tween.data !== "isFromStart") {
          var pt = plugin._pt = new PropTween(plugin._pt, target, property, 0, 0, _renderClearProps);
          pt.u = endValue;
          pt.pr = -10;
          pt.tween = tween;

          plugin._props.push(property);

          return 1;
        }
      }
      /* className feature (about 0.4kb gzipped).
      , className(plugin, target, property, endValue, tween) {
      	let _renderClassName = (ratio, data) => {
      			data.css.render(ratio, data.css);
      			if (!ratio || ratio === 1) {
      				let inline = data.rmv,
      					target = data.t,
      					p;
      				target.setAttribute("class", ratio ? data.e : data.b);
      				for (p in inline) {
      					_removeProperty(target, p);
      				}
      			}
      		},
      		_getAllStyles = (target) => {
      			let styles = {},
      				computed = getComputedStyle(target),
      				p;
      			for (p in computed) {
      				if (isNaN(p) && p !== "cssText" && p !== "length") {
      					styles[p] = computed[p];
      				}
      			}
      			_setDefaults(styles, _parseTransform(target, 1));
      			return styles;
      		},
      		startClassList = target.getAttribute("class"),
      		style = target.style,
      		cssText = style.cssText,
      		cache = target._gsap,
      		classPT = cache.classPT,
      		inlineToRemoveAtEnd = {},
      		data = {t:target, plugin:plugin, rmv:inlineToRemoveAtEnd, b:startClassList, e:(endValue.charAt(1) !== "=") ? endValue : startClassList.replace(new RegExp("(?:\\s|^)" + endValue.substr(2) + "(?![\\w-])"), "") + ((endValue.charAt(0) === "+") ? " " + endValue.substr(2) : "")},
      		changingVars = {},
      		startVars = _getAllStyles(target),
      		transformRelated = /(transform|perspective)/i,
      		endVars, p;
      	if (classPT) {
      		classPT.r(1, classPT.d);
      		_removeLinkedListItem(classPT.d.plugin, classPT, "_pt");
      	}
      	target.setAttribute("class", data.e);
      	endVars = _getAllStyles(target, true);
      	target.setAttribute("class", startClassList);
      	for (p in endVars) {
      		if (endVars[p] !== startVars[p] && !transformRelated.test(p)) {
      			changingVars[p] = endVars[p];
      			if (!style[p] && style[p] !== "0") {
      				inlineToRemoveAtEnd[p] = 1;
      			}
      		}
      	}
      	cache.classPT = plugin._pt = new PropTween(plugin._pt, target, "className", 0, 0, _renderClassName, data, 0, -11);
      	if (style.cssText !== cssText) { //only apply if things change. Otherwise, in cases like a background-image that's pulled dynamically, it could cause a refresh. See https://greensock.com/forums/topic/20368-possible-gsap-bug-switching-classnames-in-chrome/.
      		style.cssText = cssText; //we recorded cssText before we swapped classes and ran _getAllStyles() because in cases when a className tween is overwritten, we remove all the related tweening properties from that class change (otherwise class-specific stuff can't override properties we've directly set on the target's style object due to specificity).
      	}
      	_parseTransform(target, true); //to clear the caching of transforms
      	data.css = new gsap.plugins.css();
      	data.css.init(target, changingVars, tween);
      	plugin._props.push(...data.css._props);
      	return 1;
      }
      */

    },

    /*
     * --------------------------------------------------------------------------------------
     * TRANSFORMS
     * --------------------------------------------------------------------------------------
     */
    _identity2DMatrix = [1, 0, 0, 1, 0, 0],
        _rotationalProperties = {},
        _isNullTransform = function _isNullTransform(value) {
      return value === "matrix(1, 0, 0, 1, 0, 0)" || value === "none" || !value;
    },
        _getComputedTransformMatrixAsArray = function _getComputedTransformMatrixAsArray(target) {
      var matrixString = _getComputedProperty(target, _transformProp);

      return _isNullTransform(matrixString) ? _identity2DMatrix : matrixString.substr(7).match(_numExp).map(_round);
    },
        _getMatrix = function _getMatrix(target, force2D) {
      var cache = target._gsap || _getCache(target),
          style = target.style,
          matrix = _getComputedTransformMatrixAsArray(target),
          parent,
          nextSibling,
          temp,
          addedToDOM;

      if (cache.svg && target.getAttribute("transform")) {
        temp = target.transform.baseVal.consolidate().matrix; //ensures that even complex values like "translate(50,60) rotate(135,0,0)" are parsed because it mashes it into a matrix.

        matrix = [temp.a, temp.b, temp.c, temp.d, temp.e, temp.f];
        return matrix.join(",") === "1,0,0,1,0,0" ? _identity2DMatrix : matrix;
      } else if (matrix === _identity2DMatrix && !target.offsetParent && target !== _docElement && !cache.svg) {
        //note: if offsetParent is null, that means the element isn't in the normal document flow, like if it has display:none or one of its ancestors has display:none). Firefox returns null for getComputedStyle() if the element is in an iframe that has display:none. https://bugzilla.mozilla.org/show_bug.cgi?id=548397
        //browsers don't report transforms accurately unless the element is in the DOM and has a display value that's not "none". Firefox and Microsoft browsers have a partial bug where they'll report transforms even if display:none BUT not any percentage-based values like translate(-50%, 8px) will be reported as if it's translate(0, 8px).
        temp = style.display;
        style.display = "block";
        parent = target.parentNode;

        if (!parent || !target.offsetParent) {
          // note: in 3.3.0 we switched target.offsetParent to _doc.body.contains(target) to avoid [sometimes unnecessary] MutationObserver calls but that wasn't adequate because there are edge cases where nested position: fixed elements need to get reparented to accurately sense transforms. See https://github.com/greensock/GSAP/issues/388 and https://github.com/greensock/GSAP/issues/375
          addedToDOM = 1; //flag

          nextSibling = target.nextSibling;

          _docElement.appendChild(target); //we must add it to the DOM in order to get values properly

        }

        matrix = _getComputedTransformMatrixAsArray(target);
        temp ? style.display = temp : _removeProperty(target, "display");

        if (addedToDOM) {
          nextSibling ? parent.insertBefore(target, nextSibling) : parent ? parent.appendChild(target) : _docElement.removeChild(target);
        }
      }

      return force2D && matrix.length > 6 ? [matrix[0], matrix[1], matrix[4], matrix[5], matrix[12], matrix[13]] : matrix;
    },
        _applySVGOrigin = function _applySVGOrigin(target, origin, originIsAbsolute, smooth, matrixArray, pluginToAddPropTweensTo) {
      var cache = target._gsap,
          matrix = matrixArray || _getMatrix(target, true),
          xOriginOld = cache.xOrigin || 0,
          yOriginOld = cache.yOrigin || 0,
          xOffsetOld = cache.xOffset || 0,
          yOffsetOld = cache.yOffset || 0,
          a = matrix[0],
          b = matrix[1],
          c = matrix[2],
          d = matrix[3],
          tx = matrix[4],
          ty = matrix[5],
          originSplit = origin.split(" "),
          xOrigin = parseFloat(originSplit[0]) || 0,
          yOrigin = parseFloat(originSplit[1]) || 0,
          bounds,
          determinant,
          x,
          y;

      if (!originIsAbsolute) {
        bounds = _getBBox(target);
        xOrigin = bounds.x + (~originSplit[0].indexOf("%") ? xOrigin / 100 * bounds.width : xOrigin);
        yOrigin = bounds.y + (~(originSplit[1] || originSplit[0]).indexOf("%") ? yOrigin / 100 * bounds.height : yOrigin);
      } else if (matrix !== _identity2DMatrix && (determinant = a * d - b * c)) {
        //if it's zero (like if scaleX and scaleY are zero), skip it to avoid errors with dividing by zero.
        x = xOrigin * (d / determinant) + yOrigin * (-c / determinant) + (c * ty - d * tx) / determinant;
        y = xOrigin * (-b / determinant) + yOrigin * (a / determinant) - (a * ty - b * tx) / determinant;
        xOrigin = x;
        yOrigin = y;
      }

      if (smooth || smooth !== false && cache.smooth) {
        tx = xOrigin - xOriginOld;
        ty = yOrigin - yOriginOld;
        cache.xOffset = xOffsetOld + (tx * a + ty * c) - tx;
        cache.yOffset = yOffsetOld + (tx * b + ty * d) - ty;
      } else {
        cache.xOffset = cache.yOffset = 0;
      }

      cache.xOrigin = xOrigin;
      cache.yOrigin = yOrigin;
      cache.smooth = !!smooth;
      cache.origin = origin;
      cache.originIsAbsolute = !!originIsAbsolute;
      target.style[_transformOriginProp] = "0px 0px"; //otherwise, if someone sets  an origin via CSS, it will likely interfere with the SVG transform attribute ones (because remember, we're baking the origin into the matrix() value).

      if (pluginToAddPropTweensTo) {
        _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOrigin", xOriginOld, xOrigin);

        _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOrigin", yOriginOld, yOrigin);

        _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOffset", xOffsetOld, cache.xOffset);

        _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOffset", yOffsetOld, cache.yOffset);
      }

      target.setAttribute("data-svg-origin", xOrigin + " " + yOrigin);
    },
        _parseTransform = function _parseTransform(target, uncache) {
      var cache = target._gsap || new GSCache(target);

      if ("x" in cache && !uncache && !cache.uncache) {
        return cache;
      }

      var style = target.style,
          invertedScaleX = cache.scaleX < 0,
          px = "px",
          deg = "deg",
          origin = _getComputedProperty(target, _transformOriginProp) || "0",
          x,
          y,
          z,
          scaleX,
          scaleY,
          rotation,
          rotationX,
          rotationY,
          skewX,
          skewY,
          perspective,
          xOrigin,
          yOrigin,
          matrix,
          angle,
          cos,
          sin,
          a,
          b,
          c,
          d,
          a12,
          a22,
          t1,
          t2,
          t3,
          a13,
          a23,
          a33,
          a42,
          a43,
          a32;
      x = y = z = rotation = rotationX = rotationY = skewX = skewY = perspective = 0;
      scaleX = scaleY = 1;
      cache.svg = !!(target.getCTM && _isSVG(target));
      matrix = _getMatrix(target, cache.svg);

      if (cache.svg) {
        t1 = !cache.uncache && target.getAttribute("data-svg-origin");

        _applySVGOrigin(target, t1 || origin, !!t1 || cache.originIsAbsolute, cache.smooth !== false, matrix);
      }

      xOrigin = cache.xOrigin || 0;
      yOrigin = cache.yOrigin || 0;

      if (matrix !== _identity2DMatrix) {
        a = matrix[0]; //a11

        b = matrix[1]; //a21

        c = matrix[2]; //a31

        d = matrix[3]; //a41

        x = a12 = matrix[4];
        y = a22 = matrix[5]; //2D matrix

        if (matrix.length === 6) {
          scaleX = Math.sqrt(a * a + b * b);
          scaleY = Math.sqrt(d * d + c * c);
          rotation = a || b ? _atan2(b, a) * _RAD2DEG : 0; //note: if scaleX is 0, we cannot accurately measure rotation. Same for skewX with a scaleY of 0. Therefore, we default to the previously recorded value (or zero if that doesn't exist).

          skewX = c || d ? _atan2(c, d) * _RAD2DEG + rotation : 0;
          skewX && (scaleY *= Math.cos(skewX * _DEG2RAD));

          if (cache.svg) {
            x -= xOrigin - (xOrigin * a + yOrigin * c);
            y -= yOrigin - (xOrigin * b + yOrigin * d);
          } //3D matrix

        } else {
          a32 = matrix[6];
          a42 = matrix[7];
          a13 = matrix[8];
          a23 = matrix[9];
          a33 = matrix[10];
          a43 = matrix[11];
          x = matrix[12];
          y = matrix[13];
          z = matrix[14];
          angle = _atan2(a32, a33);
          rotationX = angle * _RAD2DEG; //rotationX

          if (angle) {
            cos = Math.cos(-angle);
            sin = Math.sin(-angle);
            t1 = a12 * cos + a13 * sin;
            t2 = a22 * cos + a23 * sin;
            t3 = a32 * cos + a33 * sin;
            a13 = a12 * -sin + a13 * cos;
            a23 = a22 * -sin + a23 * cos;
            a33 = a32 * -sin + a33 * cos;
            a43 = a42 * -sin + a43 * cos;
            a12 = t1;
            a22 = t2;
            a32 = t3;
          } //rotationY


          angle = _atan2(-c, a33);
          rotationY = angle * _RAD2DEG;

          if (angle) {
            cos = Math.cos(-angle);
            sin = Math.sin(-angle);
            t1 = a * cos - a13 * sin;
            t2 = b * cos - a23 * sin;
            t3 = c * cos - a33 * sin;
            a43 = d * sin + a43 * cos;
            a = t1;
            b = t2;
            c = t3;
          } //rotationZ


          angle = _atan2(b, a);
          rotation = angle * _RAD2DEG;

          if (angle) {
            cos = Math.cos(angle);
            sin = Math.sin(angle);
            t1 = a * cos + b * sin;
            t2 = a12 * cos + a22 * sin;
            b = b * cos - a * sin;
            a22 = a22 * cos - a12 * sin;
            a = t1;
            a12 = t2;
          }

          if (rotationX && Math.abs(rotationX) + Math.abs(rotation) > 359.9) {
            //when rotationY is set, it will often be parsed as 180 degrees different than it should be, and rotationX and rotation both being 180 (it looks the same), so we adjust for that here.
            rotationX = rotation = 0;
            rotationY = 180 - rotationY;
          }

          scaleX = _round(Math.sqrt(a * a + b * b + c * c));
          scaleY = _round(Math.sqrt(a22 * a22 + a32 * a32));
          angle = _atan2(a12, a22);
          skewX = Math.abs(angle) > 0.0002 ? angle * _RAD2DEG : 0;
          perspective = a43 ? 1 / (a43 < 0 ? -a43 : a43) : 0;
        }

        if (cache.svg) {
          //sense if there are CSS transforms applied on an SVG element in which case we must overwrite them when rendering. The transform attribute is more reliable cross-browser, but we can't just remove the CSS ones because they may be applied in a CSS rule somewhere (not just inline).
          t1 = target.getAttribute("transform");
          cache.forceCSS = target.setAttribute("transform", "") || !_isNullTransform(_getComputedProperty(target, _transformProp));
          t1 && target.setAttribute("transform", t1);
        }
      }

      if (Math.abs(skewX) > 90 && Math.abs(skewX) < 270) {
        if (invertedScaleX) {
          scaleX *= -1;
          skewX += rotation <= 0 ? 180 : -180;
          rotation += rotation <= 0 ? 180 : -180;
        } else {
          scaleY *= -1;
          skewX += skewX <= 0 ? 180 : -180;
        }
      }

      cache.x = ((cache.xPercent = x && Math.round(target.offsetWidth / 2) === Math.round(-x) ? -50 : 0) ? 0 : x) + px;
      cache.y = ((cache.yPercent = y && Math.round(target.offsetHeight / 2) === Math.round(-y) ? -50 : 0) ? 0 : y) + px;
      cache.z = z + px;
      cache.scaleX = _round(scaleX);
      cache.scaleY = _round(scaleY);
      cache.rotation = _round(rotation) + deg;
      cache.rotationX = _round(rotationX) + deg;
      cache.rotationY = _round(rotationY) + deg;
      cache.skewX = skewX + deg;
      cache.skewY = skewY + deg;
      cache.transformPerspective = perspective + px;

      if (cache.zOrigin = parseFloat(origin.split(" ")[2]) || 0) {
        style[_transformOriginProp] = _firstTwoOnly(origin);
      }

      cache.xOffset = cache.yOffset = 0;
      cache.force3D = _config.force3D;
      cache.renderTransform = cache.svg ? _renderSVGTransforms : _supports3D ? _renderCSSTransforms : _renderNon3DTransforms;
      cache.uncache = 0;
      return cache;
    },
        _firstTwoOnly = function _firstTwoOnly(value) {
      return (value = value.split(" "))[0] + " " + value[1];
    },
        //for handling transformOrigin values, stripping out the 3rd dimension
    _addPxTranslate = function _addPxTranslate(target, start, value) {
      var unit = getUnit(start);
      return _round(parseFloat(start) + parseFloat(_convertToUnit(target, "x", value + "px", unit))) + unit;
    },
        _renderNon3DTransforms = function _renderNon3DTransforms(ratio, cache) {
      cache.z = "0px";
      cache.rotationY = cache.rotationX = "0deg";
      cache.force3D = 0;

      _renderCSSTransforms(ratio, cache);
    },
        _zeroDeg = "0deg",
        _zeroPx = "0px",
        _endParenthesis = ") ",
        _renderCSSTransforms = function _renderCSSTransforms(ratio, cache) {
      var _ref = cache || this,
          xPercent = _ref.xPercent,
          yPercent = _ref.yPercent,
          x = _ref.x,
          y = _ref.y,
          z = _ref.z,
          rotation = _ref.rotation,
          rotationY = _ref.rotationY,
          rotationX = _ref.rotationX,
          skewX = _ref.skewX,
          skewY = _ref.skewY,
          scaleX = _ref.scaleX,
          scaleY = _ref.scaleY,
          transformPerspective = _ref.transformPerspective,
          force3D = _ref.force3D,
          target = _ref.target,
          zOrigin = _ref.zOrigin,
          transforms = "",
          use3D = force3D === "auto" && ratio && ratio !== 1 || force3D === true; // Safari has a bug that causes it not to render 3D transform-origin values properly, so we force the z origin to 0, record it in the cache, and then do the math here to offset the translate values accordingly (basically do the 3D transform-origin part manually)


      if (zOrigin && (rotationX !== _zeroDeg || rotationY !== _zeroDeg)) {
        var angle = parseFloat(rotationY) * _DEG2RAD,
            a13 = Math.sin(angle),
            a33 = Math.cos(angle),
            cos;

        angle = parseFloat(rotationX) * _DEG2RAD;
        cos = Math.cos(angle);
        x = _addPxTranslate(target, x, a13 * cos * -zOrigin);
        y = _addPxTranslate(target, y, -Math.sin(angle) * -zOrigin);
        z = _addPxTranslate(target, z, a33 * cos * -zOrigin + zOrigin);
      }

      if (transformPerspective !== _zeroPx) {
        transforms += "perspective(" + transformPerspective + _endParenthesis;
      }

      if (xPercent || yPercent) {
        transforms += "translate(" + xPercent + "%, " + yPercent + "%) ";
      }

      if (use3D || x !== _zeroPx || y !== _zeroPx || z !== _zeroPx) {
        transforms += z !== _zeroPx || use3D ? "translate3d(" + x + ", " + y + ", " + z + ") " : "translate(" + x + ", " + y + _endParenthesis;
      }

      if (rotation !== _zeroDeg) {
        transforms += "rotate(" + rotation + _endParenthesis;
      }

      if (rotationY !== _zeroDeg) {
        transforms += "rotateY(" + rotationY + _endParenthesis;
      }

      if (rotationX !== _zeroDeg) {
        transforms += "rotateX(" + rotationX + _endParenthesis;
      }

      if (skewX !== _zeroDeg || skewY !== _zeroDeg) {
        transforms += "skew(" + skewX + ", " + skewY + _endParenthesis;
      }

      if (scaleX !== 1 || scaleY !== 1) {
        transforms += "scale(" + scaleX + ", " + scaleY + _endParenthesis;
      }

      target.style[_transformProp] = transforms || "translate(0, 0)";
    },
        _renderSVGTransforms = function _renderSVGTransforms(ratio, cache) {
      var _ref2 = cache || this,
          xPercent = _ref2.xPercent,
          yPercent = _ref2.yPercent,
          x = _ref2.x,
          y = _ref2.y,
          rotation = _ref2.rotation,
          skewX = _ref2.skewX,
          skewY = _ref2.skewY,
          scaleX = _ref2.scaleX,
          scaleY = _ref2.scaleY,
          target = _ref2.target,
          xOrigin = _ref2.xOrigin,
          yOrigin = _ref2.yOrigin,
          xOffset = _ref2.xOffset,
          yOffset = _ref2.yOffset,
          forceCSS = _ref2.forceCSS,
          tx = parseFloat(x),
          ty = parseFloat(y),
          a11,
          a21,
          a12,
          a22,
          temp;

      rotation = parseFloat(rotation);
      skewX = parseFloat(skewX);
      skewY = parseFloat(skewY);

      if (skewY) {
        //for performance reasons, we combine all skewing into the skewX and rotation values. Remember, a skewY of 10 degrees looks the same as a rotation of 10 degrees plus a skewX of 10 degrees.
        skewY = parseFloat(skewY);
        skewX += skewY;
        rotation += skewY;
      }

      if (rotation || skewX) {
        rotation *= _DEG2RAD;
        skewX *= _DEG2RAD;
        a11 = Math.cos(rotation) * scaleX;
        a21 = Math.sin(rotation) * scaleX;
        a12 = Math.sin(rotation - skewX) * -scaleY;
        a22 = Math.cos(rotation - skewX) * scaleY;

        if (skewX) {
          skewY *= _DEG2RAD;
          temp = Math.tan(skewX - skewY);
          temp = Math.sqrt(1 + temp * temp);
          a12 *= temp;
          a22 *= temp;

          if (skewY) {
            temp = Math.tan(skewY);
            temp = Math.sqrt(1 + temp * temp);
            a11 *= temp;
            a21 *= temp;
          }
        }

        a11 = _round(a11);
        a21 = _round(a21);
        a12 = _round(a12);
        a22 = _round(a22);
      } else {
        a11 = scaleX;
        a22 = scaleY;
        a21 = a12 = 0;
      }

      if (tx && !~(x + "").indexOf("px") || ty && !~(y + "").indexOf("px")) {
        tx = _convertToUnit(target, "x", x, "px");
        ty = _convertToUnit(target, "y", y, "px");
      }

      if (xOrigin || yOrigin || xOffset || yOffset) {
        tx = _round(tx + xOrigin - (xOrigin * a11 + yOrigin * a12) + xOffset);
        ty = _round(ty + yOrigin - (xOrigin * a21 + yOrigin * a22) + yOffset);
      }

      if (xPercent || yPercent) {
        //The SVG spec doesn't support percentage-based translation in the "transform" attribute, so we merge it into the translation to simulate it.
        temp = target.getBBox();
        tx = _round(tx + xPercent / 100 * temp.width);
        ty = _round(ty + yPercent / 100 * temp.height);
      }

      temp = "matrix(" + a11 + "," + a21 + "," + a12 + "," + a22 + "," + tx + "," + ty + ")";
      target.setAttribute("transform", temp);

      if (forceCSS) {
        //some browsers prioritize CSS transforms over the transform attribute. When we sense that the user has CSS transforms applied, we must overwrite them this way (otherwise some browser simply won't render the  transform attribute changes!)
        target.style[_transformProp] = temp;
      }
    },
        _addRotationalPropTween = function _addRotationalPropTween(plugin, target, property, startNum, endValue, relative) {
      var cap = 360,
          isString = _isString(endValue),
          endNum = parseFloat(endValue) * (isString && ~endValue.indexOf("rad") ? _RAD2DEG : 1),
          change = relative ? endNum * relative : endNum - startNum,
          finalValue = startNum + change + "deg",
          direction,
          pt;

      if (isString) {
        direction = endValue.split("_")[1];

        if (direction === "short") {
          change %= cap;

          if (change !== change % (cap / 2)) {
            change += change < 0 ? cap : -cap;
          }
        }

        if (direction === "cw" && change < 0) {
          change = (change + cap * _bigNum$1) % cap - ~~(change / cap) * cap;
        } else if (direction === "ccw" && change > 0) {
          change = (change - cap * _bigNum$1) % cap - ~~(change / cap) * cap;
        }
      }

      plugin._pt = pt = new PropTween(plugin._pt, target, property, startNum, change, _renderPropWithEnd);
      pt.e = finalValue;
      pt.u = "deg";

      plugin._props.push(property);

      return pt;
    },
        _addRawTransformPTs = function _addRawTransformPTs(plugin, transforms, target) {
      //for handling cases where someone passes in a whole transform string, like transform: "scale(2, 3) rotate(20deg) translateY(30em)"
      var style = _tempDivStyler.style,
          startCache = target._gsap,
          exclude = "perspective,force3D,transformOrigin,svgOrigin",
          endCache,
          p,
          startValue,
          endValue,
          startNum,
          endNum,
          startUnit,
          endUnit;
      style.cssText = getComputedStyle(target).cssText + ";position:absolute;display:block;"; //%-based translations will fail unless we set the width/height to match the original target (and padding/borders can affect it)

      style[_transformProp] = transforms;

      _doc$1.body.appendChild(_tempDivStyler);

      endCache = _parseTransform(_tempDivStyler, 1);

      for (p in _transformProps) {
        startValue = startCache[p];
        endValue = endCache[p];

        if (startValue !== endValue && exclude.indexOf(p) < 0) {
          //tweening to no perspective gives very unintuitive results - just keep the same perspective in that case.
          startUnit = getUnit(startValue);
          endUnit = getUnit(endValue);
          startNum = startUnit !== endUnit ? _convertToUnit(target, p, startValue, endUnit) : parseFloat(startValue);
          endNum = parseFloat(endValue);
          plugin._pt = new PropTween(plugin._pt, startCache, p, startNum, endNum - startNum, _renderCSSProp);
          plugin._pt.u = endUnit || 0;

          plugin._props.push(p);
        }
      }

      _doc$1.body.removeChild(_tempDivStyler);
    }; // handle splitting apart padding, margin, borderWidth, and borderRadius into their 4 components. Firefox, for example, won't report borderRadius correctly - it will only do borderTopLeftRadius and the other corners. We also want to handle paddingTop, marginLeft, borderRightWidth, etc.


    _forEachName("padding,margin,Width,Radius", function (name, index) {
      var t = "Top",
          r = "Right",
          b = "Bottom",
          l = "Left",
          props = (index < 3 ? [t, r, b, l] : [t + l, t + r, b + r, b + l]).map(function (side) {
        return index < 2 ? name + side : "border" + side + name;
      });

      _specialProps[index > 1 ? "border" + name : name] = function (plugin, target, property, endValue, tween) {
        var a, vars;

        if (arguments.length < 4) {
          // getter, passed target, property, and unit (from _get())
          a = props.map(function (prop) {
            return _get(plugin, prop, property);
          });
          vars = a.join(" ");
          return vars.split(a[0]).length === 5 ? a[0] : vars;
        }

        a = (endValue + "").split(" ");
        vars = {};
        props.forEach(function (prop, i) {
          return vars[prop] = a[i] = a[i] || a[(i - 1) / 2 | 0];
        });
        plugin.init(target, vars, tween);
      };
    });

    var CSSPlugin = {
      name: "css",
      register: _initCore,
      targetTest: function targetTest(target) {
        return target.style && target.nodeType;
      },
      init: function init(target, vars, tween, index, targets) {
        var props = this._props,
            style = target.style,
            startValue,
            endValue,
            endNum,
            startNum,
            type,
            specialProp,
            p,
            startUnit,
            endUnit,
            relative,
            isTransformRelated,
            transformPropTween,
            cache,
            smooth,
            hasPriority;
        _pluginInitted || _initCore();

        for (p in vars) {
          if (p === "autoRound") {
            continue;
          }

          endValue = vars[p];

          if (_plugins[p] && _checkPlugin(p, vars, tween, index, target, targets)) {
            //plugins
            continue;
          }

          type = typeof endValue;
          specialProp = _specialProps[p];

          if (type === "function") {
            endValue = endValue.call(tween, index, target, targets);
            type = typeof endValue;
          }

          if (type === "string" && ~endValue.indexOf("random(")) {
            endValue = _replaceRandom(endValue);
          }

          if (specialProp) {
            if (specialProp(this, target, p, endValue, tween)) {
              hasPriority = 1;
            }
          } else if (p.substr(0, 2) === "--") {
            //CSS variable
            this.add(style, "setProperty", getComputedStyle(target).getPropertyValue(p) + "", endValue + "", index, targets, 0, 0, p);
          } else if (type !== "undefined") {
            startValue = _get(target, p);
            startNum = parseFloat(startValue);
            relative = type === "string" && endValue.charAt(1) === "=" ? +(endValue.charAt(0) + "1") : 0;

            if (relative) {
              endValue = endValue.substr(2);
            }

            endNum = parseFloat(endValue);

            if (p in _propertyAliases) {
              if (p === "autoAlpha") {
                //special case where we control the visibility along with opacity. We still allow the opacity value to pass through and get tweened.
                if (startNum === 1 && _get(target, "visibility") === "hidden" && endNum) {
                  //if visibility is initially set to "hidden", we should interpret that as intent to make opacity 0 (a convenience)
                  startNum = 0;
                }

                _addNonTweeningPT(this, style, "visibility", startNum ? "inherit" : "hidden", endNum ? "inherit" : "hidden", !endNum);
              }

              if (p !== "scale" && p !== "transform") {
                p = _propertyAliases[p];
                ~p.indexOf(",") && (p = p.split(",")[0]);
              }
            }

            isTransformRelated = p in _transformProps; //--- TRANSFORM-RELATED ---

            if (isTransformRelated) {
              if (!transformPropTween) {
                cache = target._gsap;
                cache.renderTransform || _parseTransform(target); // if, for example, gsap.set(... {transform:"translateX(50vw)"}), the _get() call doesn't parse the transform, thus cache.renderTransform won't be set yet so force the parsing of the transform here.

                smooth = vars.smoothOrigin !== false && cache.smooth;
                transformPropTween = this._pt = new PropTween(this._pt, style, _transformProp, 0, 1, cache.renderTransform, cache, 0, -1); //the first time through, create the rendering PropTween so that it runs LAST (in the linked list, we keep adding to the beginning)

                transformPropTween.dep = 1; //flag it as dependent so that if things get killed/overwritten and this is the only PropTween left, we can safely kill the whole tween.
              }

              if (p === "scale") {
                this._pt = new PropTween(this._pt, cache, "scaleY", cache.scaleY, relative ? relative * endNum : endNum - cache.scaleY);
                props.push("scaleY", p);
                p += "X";
              } else if (p === "transformOrigin") {
                endValue = _convertKeywordsToPercentages(endValue); //in case something like "left top" or "bottom right" is passed in. Convert to percentages.

                if (cache.svg) {
                  _applySVGOrigin(target, endValue, 0, smooth, 0, this);
                } else {
                  endUnit = parseFloat(endValue.split(" ")[2]) || 0; //handle the zOrigin separately!

                  endUnit !== cache.zOrigin && _addNonTweeningPT(this, cache, "zOrigin", cache.zOrigin, endUnit);

                  _addNonTweeningPT(this, style, p, _firstTwoOnly(startValue), _firstTwoOnly(endValue));
                }

                continue;
              } else if (p === "svgOrigin") {
                _applySVGOrigin(target, endValue, 1, smooth, 0, this);

                continue;
              } else if (p in _rotationalProperties) {
                _addRotationalPropTween(this, cache, p, startNum, endValue, relative);

                continue;
              } else if (p === "smoothOrigin") {
                _addNonTweeningPT(this, cache, "smooth", cache.smooth, endValue);

                continue;
              } else if (p === "force3D") {
                cache[p] = endValue;
                continue;
              } else if (p === "transform") {
                _addRawTransformPTs(this, endValue, target);

                continue;
              }
            } else if (!(p in style)) {
              p = _checkPropPrefix(p) || p;
            }

            if (isTransformRelated || (endNum || endNum === 0) && (startNum || startNum === 0) && !_complexExp.test(endValue) && p in style) {
              startUnit = (startValue + "").substr((startNum + "").length);
              endNum || (endNum = 0); // protect against NaN

              endUnit = getUnit(endValue) || (p in _config.units ? _config.units[p] : startUnit);
              startUnit !== endUnit && (startNum = _convertToUnit(target, p, startValue, endUnit));
              this._pt = new PropTween(this._pt, isTransformRelated ? cache : style, p, startNum, relative ? relative * endNum : endNum - startNum, endUnit === "px" && vars.autoRound !== false && !isTransformRelated ? _renderRoundedCSSProp : _renderCSSProp);
              this._pt.u = endUnit || 0;

              if (startUnit !== endUnit) {
                //when the tween goes all the way back to the beginning, we need to revert it to the OLD/ORIGINAL value (with those units). We record that as a "b" (beginning) property and point to a render method that handles that. (performance optimization)
                this._pt.b = startValue;
                this._pt.r = _renderCSSPropWithBeginning;
              }
            } else if (!(p in style)) {
              if (p in target) {
                //maybe it's not a style - it could be a property added directly to an element in which case we'll try to animate that.
                this.add(target, p, target[p], endValue, index, targets);
              } else {
                _missingPlugin(p, endValue);

                continue;
              }
            } else {
              _tweenComplexCSSString.call(this, target, p, startValue, endValue);
            }

            props.push(p);
          }
        }

        hasPriority && _sortPropTweensByPriority(this);
      },
      get: _get,
      aliases: _propertyAliases,
      getSetter: function getSetter(target, property, plugin) {
        //returns a setter function that accepts target, property, value and applies it accordingly. Remember, properties like "x" aren't as simple as target.style.property = value because they've got to be applied to a proxy object and then merged into a transform string in a renderer.
        var p = _propertyAliases[property];
        p && p.indexOf(",") < 0 && (property = p);
        return property in _transformProps && property !== _transformOriginProp && (target._gsap.x || _get(target, "x")) ? plugin && _recentSetterPlugin === plugin ? property === "scale" ? _setterScale : _setterTransform : (_recentSetterPlugin = plugin || {}) && (property === "scale" ? _setterScaleWithRender : _setterTransformWithRender) : target.style && !_isUndefined(target.style[property]) ? _setterCSSStyle : ~property.indexOf("-") ? _setterCSSProp : _getSetter(target, property);
      },
      core: {
        _removeProperty: _removeProperty,
        _getMatrix: _getMatrix
      }
    };
    gsap.utils.checkPrefix = _checkPropPrefix;

    (function (positionAndScale, rotation, others, aliases) {
      var all = _forEachName(positionAndScale + "," + rotation + "," + others, function (name) {
        _transformProps[name] = 1;
      });

      _forEachName(rotation, function (name) {
        _config.units[name] = "deg";
        _rotationalProperties[name] = 1;
      });

      _propertyAliases[all[13]] = positionAndScale + "," + rotation;

      _forEachName(aliases, function (name) {
        var split = name.split(":");
        _propertyAliases[split[1]] = all[split[0]];
      });
    })("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");

    _forEachName("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function (name) {
      _config.units[name] = "px";
    });

    gsap.registerPlugin(CSSPlugin);

    /* src/components/layout/Navigation.svelte generated by Svelte v3.24.1 */
    const file = "src/components/layout/Navigation.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (94:6) {#each linkItems as item, i}
    function create_each_block(ctx) {
    	let li;
    	let a;
    	let div;
    	let span;
    	let t0_value = /*item*/ ctx[5].title + "";
    	let t0;
    	let t1;
    	let t2_value = /*item*/ ctx[5].title + "";
    	let t2;
    	let t3;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[3](/*item*/ ctx[5], /*i*/ ctx[7], ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			div = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			attr_dev(span, "class", "svelte-1pxo88g");
    			add_location(span, file, 96, 55, 2573);
    			attr_dev(div, "class", "filter__link-mask svelte-1pxo88g");
    			attr_dev(div, "area-hidden", "");
    			add_location(div, file, 96, 12, 2530);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "filter__link svelte-1pxo88g");
    			toggle_class(a, "is-active", /*i*/ ctx[7] === /*isActive*/ ctx[0]);
    			add_location(a, file, 95, 10, 2409);
    			attr_dev(li, "class", "filter__item svelte-1pxo88g");
    			add_location(li, file, 94, 8, 2373);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, div);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(a, t1);
    			append_dev(a, t2);
    			append_dev(li, t3);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*isActive*/ 1) {
    				toggle_class(a, "is-active", /*i*/ ctx[7] === /*isActive*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(94:6) {#each linkItems as item, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let nav;
    	let a0;
    	let t1;
    	let div;
    	let ul;
    	let t2;
    	let a1;
    	let each_value = /*linkItems*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			a0 = element("a");
    			a0.textContent = "AR";
    			t1 = space();
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			a1 = element("a");
    			a1.textContent = "PROFIL";
    			attr_dev(a0, "class", "logo link svelte-1pxo88g");
    			attr_dev(a0, "href", "/");
    			add_location(a0, file, 90, 2, 2240);
    			attr_dev(ul, "class", "filter__list svelte-1pxo88g");
    			add_location(ul, file, 92, 4, 2304);
    			attr_dev(div, "class", "filter svelte-1pxo88g");
    			add_location(div, file, 91, 2, 2279);
    			attr_dev(a1, "class", "link svelte-1pxo88g");
    			attr_dev(a1, "href", "/profile");
    			add_location(a1, file, 103, 2, 2694);
    			attr_dev(nav, "class", "svelte-1pxo88g");
    			add_location(nav, file, 89, 0, 2232);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, a0);
    			append_dev(nav, t1);
    			append_dev(nav, div);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(nav, t2);
    			append_dev(nav, a1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*isActive, handleItemClick, linkItems*/ 7) {
    				each_value = /*linkItems*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
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

    function instance($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let isActive = 0;

    	const linkItems = [
    		{ title: "All projects", filter: "all" },
    		{ title: "Digital", filter: "digital" },
    		{ title: "Print", filter: "print" },
    		{
    			title: "Multimedia",
    			filter: "multimedia"
    		}
    	];

    	const handleItemClick = (item, i) => {
    		$$invalidate(0, isActive = i);
    		dispatch("handleItemClick", { filter: item.filter });
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navigation> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Navigation", $$slots, []);
    	const click_handler = (item, i) => handleItemClick(item, i);

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		isActive,
    		linkItems,
    		handleItemClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("isActive" in $$props) $$invalidate(0, isActive = $$props.isActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isActive, linkItems, handleItemClick, click_handler];
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

    const { console: console_1 } = globals;
    const file$1 = "src/components/containers/Slide.svelte";

    // (141:0) {:else}
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
    			attr_dev(div0, "class", "slide__type svelte-acght3");
    			add_location(div0, file$1, 143, 6, 3552);
    			attr_dev(div1, "class", "js-transition-title");
    			add_location(div1, file$1, 145, 8, 3630);
    			attr_dev(h1, "class", "slide__title svelte-acght3");
    			add_location(h1, file$1, 144, 6, 3596);
    			attr_dev(div2, "class", "slide__projectnr svelte-acght3");
    			add_location(div2, file$1, 147, 6, 3695);
    			attr_dev(div3, "class", "slide__img slide__img--proxy svelte-acght3");
    			add_location(div3, file$1, 148, 6, 3750);
    			attr_dev(div4, "class", "slide__project svelte-acght3");
    			add_location(div4, file$1, 149, 6, 3801);
    			attr_dev(div5, "class", "slide__inner svelte-acght3");
    			add_location(div5, file$1, 142, 4, 3519);
    			attr_dev(article, "class", "slide svelte-acght3");
    			set_style(article, "--alignment", /*alignment*/ ctx[1]);
    			add_location(article, file$1, 141, 2, 3437);
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
    			/*article_binding*/ ctx[15](article);
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
    			/*article_binding*/ ctx[15](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(141:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (128:0) {#if imageSlide}
    function create_if_block(ctx) {
    	let a;
    	let div1;
    	let div0;
    	let figure;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			div1 = element("div");
    			div0 = element("div");
    			figure = element("figure");
    			img = element("img");
    			if (img.src !== (img_src_value = /*imgSrc*/ ctx[6])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "draggable", "false");
    			attr_dev(img, "class", "svelte-acght3");
    			add_location(img, file$1, 136, 49, 3348);
    			attr_dev(figure, "class", "js-transition-img__inner svelte-acght3");
    			add_location(figure, file$1, 136, 8, 3307);
    			attr_dev(div0, "class", "slide__img js-transition-img svelte-acght3");
    			add_location(div0, file$1, 135, 6, 3256);
    			attr_dev(div1, "class", "slide__inner svelte-acght3");
    			add_location(div1, file$1, 134, 4, 3223);
    			attr_dev(a, "href", "/project");
    			attr_dev(a, "class", "slide slide--image svelte-acght3");
    			set_style(a, "--alignment", /*alignment*/ ctx[1]);
    			add_location(a, file$1, 128, 2, 3075);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div1);
    			append_dev(div1, div0);
    			append_dev(div0, figure);
    			append_dev(figure, img);
    			/*a_binding*/ ctx[14](a);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*handleClick*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*imgSrc*/ 64 && img.src !== (img_src_value = /*imgSrc*/ ctx[6])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*alignment*/ 2) {
    				set_style(a, "--alignment", /*alignment*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			/*a_binding*/ ctx[14](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(128:0) {#if imageSlide}",
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
    	let { uuid } = $$props;
    	let { title } = $$props;
    	let { filter } = $$props;
    	let { type } = $$props;
    	let { subTitle } = $$props;
    	let { projectNr } = $$props;
    	let { imgSrc } = $$props;
    	let { url } = $$props;
    	let slideOne;
    	let slideTwo;

    	onDestroy(() => {
    		$$invalidate(7, slideOne = null);
    		$$invalidate(8, slideTwo = null);
    	});

    	const handleClick = () => {
    		console.log("CLICK ON IMAGE SLIDE");
    	};

    	const writable_props = [
    		"imageSlide",
    		"alignment",
    		"id",
    		"uuid",
    		"title",
    		"filter",
    		"type",
    		"subTitle",
    		"projectNr",
    		"imgSrc",
    		"url"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Slide> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Slide", $$slots, []);

    	function a_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			slideOne = $$value;
    			$$invalidate(7, slideOne);
    		});
    	}

    	function article_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			slideTwo = $$value;
    			$$invalidate(8, slideTwo);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("imageSlide" in $$props) $$invalidate(0, imageSlide = $$props.imageSlide);
    		if ("alignment" in $$props) $$invalidate(1, alignment = $$props.alignment);
    		if ("id" in $$props) $$invalidate(10, id = $$props.id);
    		if ("uuid" in $$props) $$invalidate(11, uuid = $$props.uuid);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("filter" in $$props) $$invalidate(12, filter = $$props.filter);
    		if ("type" in $$props) $$invalidate(3, type = $$props.type);
    		if ("subTitle" in $$props) $$invalidate(4, subTitle = $$props.subTitle);
    		if ("projectNr" in $$props) $$invalidate(5, projectNr = $$props.projectNr);
    		if ("imgSrc" in $$props) $$invalidate(6, imgSrc = $$props.imgSrc);
    		if ("url" in $$props) $$invalidate(13, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onDestroy,
    		dispatch,
    		imageSlide,
    		alignment,
    		id,
    		uuid,
    		title,
    		filter,
    		type,
    		subTitle,
    		projectNr,
    		imgSrc,
    		url,
    		slideOne,
    		slideTwo,
    		handleClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("imageSlide" in $$props) $$invalidate(0, imageSlide = $$props.imageSlide);
    		if ("alignment" in $$props) $$invalidate(1, alignment = $$props.alignment);
    		if ("id" in $$props) $$invalidate(10, id = $$props.id);
    		if ("uuid" in $$props) $$invalidate(11, uuid = $$props.uuid);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("filter" in $$props) $$invalidate(12, filter = $$props.filter);
    		if ("type" in $$props) $$invalidate(3, type = $$props.type);
    		if ("subTitle" in $$props) $$invalidate(4, subTitle = $$props.subTitle);
    		if ("projectNr" in $$props) $$invalidate(5, projectNr = $$props.projectNr);
    		if ("imgSrc" in $$props) $$invalidate(6, imgSrc = $$props.imgSrc);
    		if ("url" in $$props) $$invalidate(13, url = $$props.url);
    		if ("slideOne" in $$props) $$invalidate(7, slideOne = $$props.slideOne);
    		if ("slideTwo" in $$props) $$invalidate(8, slideTwo = $$props.slideTwo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*slideTwo, uuid*/ 2304) {
    			//We give in a uuid , to force svelte to rebind the slides
    			//This is necessary to filter them
    			 dispatch("slideCreate", { cluster: 2, slide: slideTwo, uuid });
    		}

    		if ($$self.$$.dirty & /*slideOne, uuid*/ 2176) {
    			 dispatch("slideCreate", { cluster: 1, slide: slideOne, uuid });
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
    		handleClick,
    		id,
    		uuid,
    		filter,
    		url,
    		a_binding,
    		article_binding
    	];
    }

    class Slide extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			imageSlide: 0,
    			alignment: 1,
    			id: 10,
    			uuid: 11,
    			title: 2,
    			filter: 12,
    			type: 3,
    			subTitle: 4,
    			projectNr: 5,
    			imgSrc: 6,
    			url: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slide",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[10] === undefined && !("id" in props)) {
    			console_1.warn("<Slide> was created without expected prop 'id'");
    		}

    		if (/*uuid*/ ctx[11] === undefined && !("uuid" in props)) {
    			console_1.warn("<Slide> was created without expected prop 'uuid'");
    		}

    		if (/*title*/ ctx[2] === undefined && !("title" in props)) {
    			console_1.warn("<Slide> was created without expected prop 'title'");
    		}

    		if (/*filter*/ ctx[12] === undefined && !("filter" in props)) {
    			console_1.warn("<Slide> was created without expected prop 'filter'");
    		}

    		if (/*type*/ ctx[3] === undefined && !("type" in props)) {
    			console_1.warn("<Slide> was created without expected prop 'type'");
    		}

    		if (/*subTitle*/ ctx[4] === undefined && !("subTitle" in props)) {
    			console_1.warn("<Slide> was created without expected prop 'subTitle'");
    		}

    		if (/*projectNr*/ ctx[5] === undefined && !("projectNr" in props)) {
    			console_1.warn("<Slide> was created without expected prop 'projectNr'");
    		}

    		if (/*imgSrc*/ ctx[6] === undefined && !("imgSrc" in props)) {
    			console_1.warn("<Slide> was created without expected prop 'imgSrc'");
    		}

    		if (/*url*/ ctx[13] === undefined && !("url" in props)) {
    			console_1.warn("<Slide> was created without expected prop 'url'");
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

    	get uuid() {
    		throw new Error("<Slide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set uuid(value) {
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

    /* src/components/pages/Home.svelte generated by Svelte v3.24.1 */

    const { setTimeout: setTimeout_1, window: window_1 } = globals;
    const file$2 = "src/components/pages/Home.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[76] = list[i];
    	child_ctx[78] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[76] = list[i];
    	child_ctx[78] = i;
    	return child_ctx;
    }

    // (637:6) {#each filteredTemplates as template, i}
    function create_each_block_1(ctx) {
    	let slide;
    	let current;

    	const slide_spread_levels = [
    		{ imageSlide: true },
    		{
    			alignment: /*getSlideAlignment*/ ctx[18](/*i*/ ctx[78] + 1)
    		},
    		{ projectNr: /*i*/ ctx[78] + 1 },
    		/*template*/ ctx[76]
    	];

    	let slide_props = {};

    	for (let i = 0; i < slide_spread_levels.length; i += 1) {
    		slide_props = assign(slide_props, slide_spread_levels[i]);
    	}

    	slide = new Slide({ props: slide_props, $$inline: true });
    	slide.$on("slideCreate", /*slideCreate_handler*/ ctx[31]);

    	const block = {
    		c: function create() {
    			create_component(slide.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(slide, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const slide_changes = (dirty[0] & /*getSlideAlignment, filteredTemplates*/ 264192)
    			? get_spread_update(slide_spread_levels, [
    					slide_spread_levels[0],
    					dirty[0] & /*getSlideAlignment*/ 262144 && {
    						alignment: /*getSlideAlignment*/ ctx[18](/*i*/ ctx[78] + 1)
    					},
    					slide_spread_levels[2],
    					dirty[0] & /*filteredTemplates*/ 2048 && get_spread_object(/*template*/ ctx[76])
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
    		source: "(637:6) {#each filteredTemplates as template, i}",
    		ctx
    	});

    	return block;
    }

    // (650:6) {#each filteredTemplates as template, i}
    function create_each_block$1(ctx) {
    	let slide;
    	let current;

    	const slide_spread_levels = [
    		/*template*/ ctx[76],
    		{
    			alignment: /*getSlideAlignment*/ ctx[18](/*i*/ ctx[78] + 1)
    		},
    		{ projectNr: /*i*/ ctx[78] + 1 }
    	];

    	let slide_props = {};

    	for (let i = 0; i < slide_spread_levels.length; i += 1) {
    		slide_props = assign(slide_props, slide_spread_levels[i]);
    	}

    	slide = new Slide({ props: slide_props, $$inline: true });
    	slide.$on("slideCreate", /*slideCreate_handler_1*/ ctx[33]);

    	const block = {
    		c: function create() {
    			create_component(slide.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(slide, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const slide_changes = (dirty[0] & /*filteredTemplates, getSlideAlignment*/ 264192)
    			? get_spread_update(slide_spread_levels, [
    					dirty[0] & /*filteredTemplates*/ 2048 && get_spread_object(/*template*/ ctx[76]),
    					dirty[0] & /*getSlideAlignment*/ 262144 && {
    						alignment: /*getSlideAlignment*/ ctx[18](/*i*/ ctx[78] + 1)
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(650:6) {#each filteredTemplates as template, i}",
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
    	let div5;
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
    	let div14;
    	let div6;
    	let t4;
    	let div7;
    	let t5;
    	let div8;
    	let t6;
    	let div13;
    	let div10;
    	let div9;
    	let t8;
    	let div12;
    	let div11;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[28]);
    	add_render_callback(/*onwindowscroll*/ ctx[29]);
    	navigation = new Navigation({ $$inline: true });
    	navigation.$on("handleItemClick", /*handleItemClick_handler*/ ctx[30]);
    	let each_value_1 = /*filteredTemplates*/ ctx[11];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*filteredTemplates*/ ctx[11];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div5 = element("div");
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
    			div14 = element("div");
    			div6 = element("div");
    			t4 = space();
    			div7 = element("div");
    			t5 = space();
    			div8 = element("div");
    			t6 = space();
    			div13 = element("div");
    			div10 = element("div");
    			div9 = element("div");
    			div9.textContent = "ANDREAS RIEDEL";
    			t8 = space();
    			div12 = element("div");
    			div11 = element("div");
    			attr_dev(div0, "class", "scroll-content svelte-ldesnb");
    			set_style(div0, "transform", "translate3d(-" + /*data*/ ctx[12].last.one.toFixed(2) + "px, 0, 0) scaleY(" + /*bounce*/ ctx[7] + ") skewX(" + /*skew*/ ctx[8] + "deg)");
    			set_style(div0, "width", /*scrollContentWidth*/ ctx[1] + "px");
    			add_location(div0, file$2, 632, 4, 13755);
    			attr_dev(div1, "class", "scroll-content scroll-content--last svelte-ldesnb");
    			set_style(div1, "transform", "translate3d(-" + /*data*/ ctx[12].last.two.toFixed(2) + "px, 0, 0) scaleY(" + /*bounce*/ ctx[7] + ")");
    			set_style(div1, "width", /*scrollContentWidth*/ ctx[1] + "px");
    			add_location(div1, file$2, 645, 4, 14240);
    			attr_dev(div2, "class", "scrollbar__handle svelte-ldesnb");
    			set_style(div2, "transform", "scaleX(" + /*scale*/ ctx[9] + ")");
    			add_location(div2, file$2, 659, 6, 14747);
    			attr_dev(div3, "class", "scrollbar svelte-ldesnb");
    			attr_dev(div3, "data-scrollbar", "");
    			add_location(div3, file$2, 658, 4, 14702);
    			attr_dev(div4, "class", "scroll svelte-ldesnb");
    			add_location(div4, file$2, 630, 2, 13642);
    			attr_dev(div5, "class", "main svelte-ldesnb");
    			add_location(div5, file$2, 629, 0, 13604);
    			attr_dev(div6, "class", "mask__slice svelte-ldesnb");
    			add_location(div6, file$2, 665, 2, 14907);
    			attr_dev(div7, "class", "mask__slice svelte-ldesnb");
    			add_location(div7, file$2, 666, 2, 14963);
    			attr_dev(div8, "class", "mask__slice svelte-ldesnb");
    			add_location(div8, file$2, 667, 2, 15019);
    			attr_dev(div9, "class", "logo--font svelte-ldesnb");
    			add_location(div9, file$2, 670, 6, 15141);
    			attr_dev(div10, "class", "logo logo--mask svelte-ldesnb");
    			add_location(div10, file$2, 669, 4, 15105);
    			attr_dev(div11, "class", "mask-line__inner svelte-ldesnb");
    			add_location(div11, file$2, 673, 6, 15273);
    			attr_dev(div12, "class", "mask-line svelte-ldesnb");
    			add_location(div12, file$2, 672, 4, 15218);
    			attr_dev(div13, "class", "mask__inner svelte-ldesnb");
    			add_location(div13, file$2, 668, 2, 15075);
    			attr_dev(div14, "class", "mask svelte-ldesnb");
    			add_location(div14, file$2, 664, 0, 14869);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			mount_component(navigation, div4, null);
    			append_dev(div4, t0);
    			append_dev(div4, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			/*div0_binding*/ ctx[32](div0);
    			append_dev(div4, t1);
    			append_dev(div4, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			/*div1_binding*/ ctx[34](div1);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			/*div2_binding*/ ctx[35](div2);
    			/*div4_binding*/ ctx[36](div4);
    			/*div5_binding*/ ctx[37](div5);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div14, anchor);
    			append_dev(div14, div6);
    			/*div6_binding*/ ctx[38](div6);
    			append_dev(div14, t4);
    			append_dev(div14, div7);
    			/*div7_binding*/ ctx[39](div7);
    			append_dev(div14, t5);
    			append_dev(div14, div8);
    			/*div8_binding*/ ctx[40](div8);
    			append_dev(div14, t6);
    			append_dev(div14, div13);
    			append_dev(div13, div10);
    			append_dev(div10, div9);
    			/*div9_binding*/ ctx[41](div9);
    			append_dev(div13, t8);
    			append_dev(div13, div12);
    			append_dev(div12, div11);
    			/*div11_binding*/ ctx[42](div11);
    			/*div12_binding*/ ctx[43](div12);
    			/*div14_binding*/ ctx[44](div14);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "resize", /*resize*/ ctx[24], false, false, false),
    					listen_dev(window_1, "scroll", /*handleScroll*/ ctx[20], false, false, false),
    					listen_dev(window_1, "mousemove", /*mousemove_handler*/ ctx[25], false, false, false),
    					listen_dev(window_1, "mousedown", /*mousedown_handler*/ ctx[26], false, false, false),
    					listen_dev(window_1, "mouseup", /*mouseup_handler*/ ctx[27], false, false, false),
    					listen_dev(window_1, "resize", /*onwindowresize*/ ctx[28]),
    					listen_dev(window_1, "scroll", () => {
    						scrolling = true;
    						clearTimeout(scrolling_timeout);
    						scrolling_timeout = setTimeout_1(clear_scrolling, 100);
    						/*onwindowscroll*/ ctx[29]();
    					})
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*scrollY*/ 8 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window_1.pageXOffset, /*scrollY*/ ctx[3]);
    				scrolling_timeout = setTimeout_1(clear_scrolling, 100);
    			}

    			if (dirty[0] & /*getSlideAlignment, filteredTemplates, handleSlideCreate*/ 788480) {
    				each_value_1 = /*filteredTemplates*/ ctx[11];
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

    			if (!current || dirty[0] & /*data, bounce, skew*/ 4480) {
    				set_style(div0, "transform", "translate3d(-" + /*data*/ ctx[12].last.one.toFixed(2) + "px, 0, 0) scaleY(" + /*bounce*/ ctx[7] + ") skewX(" + /*skew*/ ctx[8] + "deg)");
    			}

    			if (!current || dirty[0] & /*scrollContentWidth*/ 2) {
    				set_style(div0, "width", /*scrollContentWidth*/ ctx[1] + "px");
    			}

    			if (dirty[0] & /*filteredTemplates, getSlideAlignment, handleSlideCreate*/ 788480) {
    				each_value = /*filteredTemplates*/ ctx[11];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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

    			if (!current || dirty[0] & /*data, bounce*/ 4224) {
    				set_style(div1, "transform", "translate3d(-" + /*data*/ ctx[12].last.two.toFixed(2) + "px, 0, 0) scaleY(" + /*bounce*/ ctx[7] + ")");
    			}

    			if (!current || dirty[0] & /*scrollContentWidth*/ 2) {
    				set_style(div1, "width", /*scrollContentWidth*/ ctx[1] + "px");
    			}

    			if (!current || dirty[0] & /*scale*/ 512) {
    				set_style(div2, "transform", "scaleX(" + /*scale*/ ctx[9] + ")");
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
    			if (detaching) detach_dev(div5);
    			destroy_component(navigation);
    			destroy_each(each_blocks_1, detaching);
    			/*div0_binding*/ ctx[32](null);
    			destroy_each(each_blocks, detaching);
    			/*div1_binding*/ ctx[34](null);
    			/*div2_binding*/ ctx[35](null);
    			/*div4_binding*/ ctx[36](null);
    			/*div5_binding*/ ctx[37](null);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div14);
    			/*div6_binding*/ ctx[38](null);
    			/*div7_binding*/ ctx[39](null);
    			/*div8_binding*/ ctx[40](null);
    			/*div9_binding*/ ctx[41](null);
    			/*div11_binding*/ ctx[42](null);
    			/*div12_binding*/ ctx[43](null);
    			/*div14_binding*/ ctx[44](null);
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
    			uuid: Date.now(),
    			title: "TurnOver",
    			type: "iOS App for iPad",
    			filter: "digital",
    			subTitle: "University",
    			imgSrc: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-one.png",
    			url: ""
    		},
    		{
    			id: 1,
    			uuid: Date.now(),
    			title: "Rijksmuseums",
    			type: "App Conception",
    			filter: "digital",
    			subTitle: "University",
    			imgSrc: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-two.png",
    			url: ""
    		},
    		{
    			id: 2,
    			uuid: Date.now(),
    			title: "MAN InCar",
    			type: "Conception & App",
    			filter: "digital",
    			subTitle: "University",
    			imgSrc: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-three.png",
    			url: ""
    		},
    		{
    			id: 4,
    			uuid: Date.now(),
    			title: "ecographis",
    			filter: "digital",
    			type: "Website",
    			subTitle: "Work",
    			imgSrc: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-one.png",
    			url: ""
    		},
    		{
    			id: 5,
    			uuid: Date.now(),
    			title: "mueslibar",
    			type: "Conception / Magazine",
    			filter: "print",
    			subTitle: "University",
    			imgSrc: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-two.png",
    			url: ""
    		},
    		{
    			id: 6,
    			uuid: Date.now(),
    			title: "Human Projection",
    			type: "Photography",
    			filter: "multimedia",
    			subTitle: "University",
    			imgSrc: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-three.png",
    			url: ""
    		},
    		{
    			id: 7,
    			uuid: Date.now(),
    			title: "Learn to code!",
    			type: "Conception / Webapp",
    			filter: "digital",
    			subTitle: "University - Bachelorthesis",
    			imgSrc: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-three.png",
    			url: ""
    		},
    		{
    			id: 8,
    			uuid: Date.now(),
    			title: "Poster Gallery",
    			type: "Conception / Design",
    			filter: "print",
    			subTitle: "University - Bachelorthesis",
    			imgSrc: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/project-three.png",
    			url: ""
    		}
    	];

    	let windowHeight;
    	let scrollInit = false;
    	let scrollContentWidth;
    	let windowWidth;
    	let scrollY = 0;
    	let scrollContent = [];
    	let scrollHandle;
    	let scrollEle;
    	let bounce = 0;
    	let skew = 0;
    	let scale = 0;
    	let main;
    	let filteredTemplates = slideTemplates;

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

    	let isTouch = false;

    	//Transition
    	let mask;

    	let maskSlices = [];
    	let maskLines = [];
    	let tl = null;
    	let transitionState = false;
    	let logo;
    	let dom = {};
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
    		transition();
    		isTouch = is_touch_device();
    	});

    	const is_touch_device = () => {
    		if ("ontouchstart" in window || window.TouchEvent) return true;
    		if (window.DocumentTouch && document instanceof DocumentTouch) return true;
    		const prefixes = ["", "-webkit-", "-moz-", "-o-", "-ms-"];
    		const queries = prefixes.map(prefix => `(${prefix}touch-enabled)`);
    		return window.matchMedia(queries.join(",")).matches;
    	};

    	const transition = () => {
    		dom = {
    			images: [...document.querySelectorAll(".js-transition-img")],
    			imagesInner: [...document.querySelectorAll(".js-transition-img__inner")],
    			titles: [...document.querySelectorAll(".js-transition-title")]
    		};

    		initTransition();
    	};

    	const filterTemplates = e => {
    		triggerAnimation();

    		setTimeout(
    			() => {
    				$$invalidate(46, slideArrays = [[], []]);
    				const filter = e.detail.filter;

    				$$invalidate(11, filteredTemplates = slideTemplates.reduce(
    					(accu, curr) => {
    						if (curr.filter === filter || filter === "all") {
    							curr.uuid = Date.now();
    							accu.push(curr);
    						}

    						return accu;
    					},
    					[]
    				));
    			},
    			1500
    		);
    	};

    	const initTransition = () => {
    		createTimeline();
    		transitionLoader();
    	};

    	const transitionLoader = () => {
    		resetScroll();
    		tl.tweenFromTo("loaderStart", "loaderEnd");
    	};

    	const resetScroll = () => {
    		$$invalidate(8, skew = 0);
    		$$invalidate(12, data.current = 0, data);
    		$$invalidate(3, scrollY = 0);
    	};

    	const triggerAnimation = () => {
    		if (transitionState) return;
    		transitionState = true;
    		tl.restart();
    	};

    	const createTimeline = () => {
    		tl = new Timeline({
    				paused: true,
    				onComplete: () => {
    					transitionState = false;
    				}
    			});

    		tl.set([dom.images, dom.imagesInner], { xPercent: 0, scale: 1 }).set(dom.titles, { yPercent: 0 }).set(mask, { autoAlpha: 1 }).staggerFromTo(maskSlices, 1.5, { xPercent: 100 }, { xPercent: 0, ease: Expo.easeInOut }, -0.075).add(resetScroll).addLabel("loaderStart").set(dom.images, { xPercent: -100 }).set(dom.imagesInner, { xPercent: 100 }).set(dom.titles, { yPercent: -100 }).set([maskLines[0], logo], { autoAlpha: 1 }).fromTo(logo, 1, { yPercent: -100, rotation: 0 }, {
    			yPercent: 0,
    			rotation: 0,
    			ease: Expo.easeOut
    		}).staggerFromTo(maskLines, 1, { scaleX: 0 }, { scaleX: 1, ease: Expo.easeInOut }, 0.75, "-=1").set(maskLines, { transformOrigin: "right" }).fromTo(maskLines[0], 1, { scaleX: 1 }, { scaleX: 0, ease: Expo.easeInOut }).fromTo(logo, 1, { yPercent: 0 }, { yPercent: 105, ease: Expo.easeOut }, "-=1").staggerFromTo(maskSlices, 1.5, { xPercent: 0 }, { xPercent: 100, ease: Expo.easeInOut }, 0.075).set(mask, { autoAlpha: 0 }).addLabel("imagesStart", "-=0.85").staggerFromTo(dom.titles, 1.5, { yPercent: 100 }, { yPercent: 0, ease: Expo.easeInOut }, 0.05, "imagesStart").staggerFromTo(dom.images, 1.25, { xPercent: -100 }, { xPercent: 0, ease: Expo.easeInOut }, 0.05, "imagesStart").staggerFromTo(dom.imagesInner, 1.25, { xPercent: 100 }, { xPercent: 0, ease: Expo.easeInOut }, 0.05, "imagesStart").addLabel("loaderEnd");
    	};

    	const getSlideAlignment = i => {
    		let alignment = "flex-start";

    		if (i % 2 === 0) {
    			alignment = "center";
    		} else if (i % 3 === 0) {
    			alignment = "flex-end";
    		}

    		return alignment;
    	};

    	const initScroll = () => {
    		$$invalidate(12, data = {
    			total: slideArrays[0].length - 1,
    			current: 0,
    			last: { one: 0, two: 0 },
    			on: 0,
    			off: 0
    		});

    		preload();
    		on();
    		run();
    	};

    	const handleSlideCreate = e => {
    		if (e.detail.cluster === 1 && e.detail.slide) {
    			$$invalidate(46, slideArrays = [[...slideArrays[0], e.detail.slide], [...slideArrays[1]]]);
    		} else if (e.detail.cluster === 2 && e.detail.slide) {
    			$$invalidate(46, slideArrays = [[...slideArrays[0]], [...slideArrays[1], e.detail.slide]]);
    		}

    		resize();
    	};

    	const on = () => {
    		setBounds(slideArrays[0]);
    		setBounds(slideArrays[1]);
    		setStyles();
    		customRequestAnimationFrame();
    	};

    	const handleScroll = () => {
    		if (dragging) return;
    		$$invalidate(12, data.current = scrollY, data);
    		clamp();
    	};

    	const handleMouseDown = e => {
    		dragging = true;
    		$$invalidate(12, data.on = e.clientX, data);
    	};

    	const handleTouchDown = e => {
    		dragging = true;
    		$$invalidate(12, data.on = e.touches[0].clientX, data);
    	};

    	const handleTouchMove = e => {
    		if (!dragging) return;
    		touch(e);
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
    		$$invalidate(12, data.current = scrollY - (e.clientX - data.on), data);
    		clamp();
    	};

    	const touch = e => {
    		$$invalidate(12, data.current = scrollY - (e.touches[0].clientX - data.on), data);
    		clamp();
    	};

    	const resize = () => {
    		setBounds(slideArrays[0]);
    		setBounds(slideArrays[1]);
    		resetScroll();
    		handleScroll();
    		setStyles();
    	};

    	const setStyles = () => {
    		$$invalidate(6, scrollEle.style.position = "fixed", scrollEle);
    		$$invalidate(6, scrollEle.style.top = 0, scrollEle);
    		$$invalidate(6, scrollEle.style.left = 0, scrollEle);
    		$$invalidate(6, scrollEle.style.height = "100%", scrollEle);
    		$$invalidate(6, scrollEle.style.width = "100%", scrollEle);
    		$$invalidate(6, scrollEle.style.overflow = "hidden", scrollEle);
    	};

    	const preload = () => {
    		imagesloaded(scrollContent, instance => {
    			setBounds(slideArrays[0]);
    			setBounds(slideArrays[1]);
    		});
    	};

    	const run = () => {
    		$$invalidate(8, skew = 0);
    		$$invalidate(12, data.last.one = math.lerp(data.last.one, data.current, 0.085), data);
    		$$invalidate(12, data.last.one = Math.floor(data.last.one * 100) / 100, data);
    		$$invalidate(12, data.last.two = math.lerp(data.last.two, data.current, 0.07), data);
    		$$invalidate(12, data.last.two = Math.floor(data.last.two * 100) / 100, data);
    		const diff = data.current - data.last.one;
    		const acc = diff / windowWidth;
    		const velo = +acc;
    		$$invalidate(7, bounce = 1 - Math.abs(velo * 0.25));
    		$$invalidate(8, skew = velo * 35);
    		$$invalidate(9, scale = math.norm(data.last.two, 0, bounds.max));
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

    			if (slideArrays[0].length - 1 === index && elems === slideArrays[0]) {
    				$$invalidate(1, scrollContentWidth = w);
    				$$invalidate(10, main.style.height = `${w}px`, main);
    			}
    		});
    	};

    	const clamp = () => {
    		$$invalidate(12, data.current = Math.min(Math.max(data.current, 0), bounds.max), data);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Home", $$slots, []);
    	const mousemove_handler = e => handleMouseMove(e);
    	const mousedown_handler = e => handleMouseDown(e);
    	const mouseup_handler = e => handleMouseUp();

    	function onwindowresize() {
    		$$invalidate(0, windowHeight = window_1.innerHeight);
    		$$invalidate(2, windowWidth = window_1.innerWidth);
    	}

    	function onwindowscroll() {
    		$$invalidate(3, scrollY = window_1.pageYOffset);
    	}

    	const handleItemClick_handler = e => filterTemplates(e);
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

    	function div4_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			scrollEle = $$value;
    			$$invalidate(6, scrollEle);
    		});
    	}

    	function div5_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			main = $$value;
    			$$invalidate(10, main);
    		});
    	}

    	function div6_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			maskSlices[0] = $$value;
    			$$invalidate(14, maskSlices);
    		});
    	}

    	function div7_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			maskSlices[1] = $$value;
    			$$invalidate(14, maskSlices);
    		});
    	}

    	function div8_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			maskSlices[2] = $$value;
    			$$invalidate(14, maskSlices);
    		});
    	}

    	function div9_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			logo = $$value;
    			$$invalidate(16, logo);
    		});
    	}

    	function div11_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			maskLines[1] = $$value;
    			$$invalidate(15, maskLines);
    		});
    	}

    	function div12_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			maskLines[0] = $$value;
    			$$invalidate(15, maskLines);
    		});
    	}

    	function div14_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			mask = $$value;
    			$$invalidate(13, mask);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		TimelineMax: Timeline,
    		Expo,
    		CSSPlugin,
    		Navigation,
    		imagesLoaded: imagesloaded,
    		Slide,
    		slideTemplates,
    		windowHeight,
    		scrollInit,
    		scrollContentWidth,
    		windowWidth,
    		scrollY,
    		scrollContent,
    		scrollHandle,
    		scrollEle,
    		bounce,
    		skew,
    		scale,
    		main,
    		filteredTemplates,
    		data,
    		slideArrays,
    		bounds,
    		isTouch,
    		mask,
    		maskSlices,
    		maskLines,
    		tl,
    		transitionState,
    		logo,
    		dom,
    		dragging,
    		rAF,
    		parallax,
    		math,
    		is_touch_device,
    		transition,
    		filterTemplates,
    		initTransition,
    		transitionLoader,
    		resetScroll,
    		triggerAnimation,
    		createTimeline,
    		getSlideAlignment,
    		initScroll,
    		handleSlideCreate,
    		on,
    		handleScroll,
    		handleMouseDown,
    		handleTouchDown,
    		handleTouchMove,
    		handleMouseMove,
    		handleMouseUp,
    		drag,
    		touch,
    		resize,
    		setStyles,
    		preload,
    		run,
    		customRequestAnimationFrame,
    		setBounds,
    		clamp
    	});

    	$$self.$inject_state = $$props => {
    		if ("windowHeight" in $$props) $$invalidate(0, windowHeight = $$props.windowHeight);
    		if ("scrollInit" in $$props) $$invalidate(45, scrollInit = $$props.scrollInit);
    		if ("scrollContentWidth" in $$props) $$invalidate(1, scrollContentWidth = $$props.scrollContentWidth);
    		if ("windowWidth" in $$props) $$invalidate(2, windowWidth = $$props.windowWidth);
    		if ("scrollY" in $$props) $$invalidate(3, scrollY = $$props.scrollY);
    		if ("scrollContent" in $$props) $$invalidate(4, scrollContent = $$props.scrollContent);
    		if ("scrollHandle" in $$props) $$invalidate(5, scrollHandle = $$props.scrollHandle);
    		if ("scrollEle" in $$props) $$invalidate(6, scrollEle = $$props.scrollEle);
    		if ("bounce" in $$props) $$invalidate(7, bounce = $$props.bounce);
    		if ("skew" in $$props) $$invalidate(8, skew = $$props.skew);
    		if ("scale" in $$props) $$invalidate(9, scale = $$props.scale);
    		if ("main" in $$props) $$invalidate(10, main = $$props.main);
    		if ("filteredTemplates" in $$props) $$invalidate(11, filteredTemplates = $$props.filteredTemplates);
    		if ("data" in $$props) $$invalidate(12, data = $$props.data);
    		if ("slideArrays" in $$props) $$invalidate(46, slideArrays = $$props.slideArrays);
    		if ("bounds" in $$props) bounds = $$props.bounds;
    		if ("isTouch" in $$props) isTouch = $$props.isTouch;
    		if ("mask" in $$props) $$invalidate(13, mask = $$props.mask);
    		if ("maskSlices" in $$props) $$invalidate(14, maskSlices = $$props.maskSlices);
    		if ("maskLines" in $$props) $$invalidate(15, maskLines = $$props.maskLines);
    		if ("tl" in $$props) tl = $$props.tl;
    		if ("transitionState" in $$props) transitionState = $$props.transitionState;
    		if ("logo" in $$props) $$invalidate(16, logo = $$props.logo);
    		if ("dom" in $$props) dom = $$props.dom;
    		if ("dragging" in $$props) dragging = $$props.dragging;
    		if ("rAF" in $$props) rAF = $$props.rAF;
    		if ("parallax" in $$props) parallax = $$props.parallax;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*filteredTemplates*/ 2048 | $$self.$$.dirty[1] & /*slideArrays, scrollInit*/ 49152) {
    			 if (slideArrays[0].length === filteredTemplates.length && slideArrays[1].length === filteredTemplates.length && !scrollInit) {
    				$$invalidate(45, scrollInit = true);
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
    		scrollEle,
    		bounce,
    		skew,
    		scale,
    		main,
    		filteredTemplates,
    		data,
    		mask,
    		maskSlices,
    		maskLines,
    		logo,
    		filterTemplates,
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
    		handleItemClick_handler,
    		slideCreate_handler,
    		div0_binding,
    		slideCreate_handler_1,
    		div1_binding,
    		div2_binding,
    		div4_binding,
    		div5_binding,
    		div6_binding,
    		div7_binding,
    		div8_binding,
    		div9_binding,
    		div11_binding,
    		div12_binding,
    		div14_binding
    	];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {}, [-1, -1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/pages/Profile.svelte generated by Svelte v3.24.1 */

    function create_fragment$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("PROFIL ANDRREAS RIEDEL");
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Profile> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Profile", $$slots, []);
    	return [];
    }

    class Profile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Profile",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/pages/Project.svelte generated by Svelte v3.24.1 */

    function create_fragment$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("PROJECT YEEEEEEEEEEEEEEEEEEEEEEEEEE");
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Project> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Project", $$slots, []);
    	return [];
    }

    class Project extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Project",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    var page = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
    	 module.exports = factory() ;
    }(commonjsGlobal, (function () {
    var isarray = Array.isArray || function (arr) {
      return Object.prototype.toString.call(arr) == '[object Array]';
    };

    /**
     * Expose `pathToRegexp`.
     */
    var pathToRegexp_1 = pathToRegexp;
    var parse_1 = parse;
    var compile_1 = compile;
    var tokensToFunction_1 = tokensToFunction;
    var tokensToRegExp_1 = tokensToRegExp;

    /**
     * The main path matching regexp utility.
     *
     * @type {RegExp}
     */
    var PATH_REGEXP = new RegExp([
      // Match escaped characters that would otherwise appear in future matches.
      // This allows the user to escape special characters that won't transform.
      '(\\\\.)',
      // Match Express-style parameters and un-named parameters with a prefix
      // and optional suffixes. Matches appear as:
      //
      // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
      // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
      // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
      '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
    ].join('|'), 'g');

    /**
     * Parse a string for the raw tokens.
     *
     * @param  {String} str
     * @return {Array}
     */
    function parse (str) {
      var tokens = [];
      var key = 0;
      var index = 0;
      var path = '';
      var res;

      while ((res = PATH_REGEXP.exec(str)) != null) {
        var m = res[0];
        var escaped = res[1];
        var offset = res.index;
        path += str.slice(index, offset);
        index = offset + m.length;

        // Ignore already escaped sequences.
        if (escaped) {
          path += escaped[1];
          continue
        }

        // Push the current path onto the tokens.
        if (path) {
          tokens.push(path);
          path = '';
        }

        var prefix = res[2];
        var name = res[3];
        var capture = res[4];
        var group = res[5];
        var suffix = res[6];
        var asterisk = res[7];

        var repeat = suffix === '+' || suffix === '*';
        var optional = suffix === '?' || suffix === '*';
        var delimiter = prefix || '/';
        var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?');

        tokens.push({
          name: name || key++,
          prefix: prefix || '',
          delimiter: delimiter,
          optional: optional,
          repeat: repeat,
          pattern: escapeGroup(pattern)
        });
      }

      // Match any characters still remaining.
      if (index < str.length) {
        path += str.substr(index);
      }

      // If the path exists, push it onto the end.
      if (path) {
        tokens.push(path);
      }

      return tokens
    }

    /**
     * Compile a string to a template function for the path.
     *
     * @param  {String}   str
     * @return {Function}
     */
    function compile (str) {
      return tokensToFunction(parse(str))
    }

    /**
     * Expose a method for transforming tokens into the path function.
     */
    function tokensToFunction (tokens) {
      // Compile all the tokens into regexps.
      var matches = new Array(tokens.length);

      // Compile all the patterns before compilation.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] === 'object') {
          matches[i] = new RegExp('^' + tokens[i].pattern + '$');
        }
      }

      return function (obj) {
        var path = '';
        var data = obj || {};

        for (var i = 0; i < tokens.length; i++) {
          var token = tokens[i];

          if (typeof token === 'string') {
            path += token;

            continue
          }

          var value = data[token.name];
          var segment;

          if (value == null) {
            if (token.optional) {
              continue
            } else {
              throw new TypeError('Expected "' + token.name + '" to be defined')
            }
          }

          if (isarray(value)) {
            if (!token.repeat) {
              throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
            }

            if (value.length === 0) {
              if (token.optional) {
                continue
              } else {
                throw new TypeError('Expected "' + token.name + '" to not be empty')
              }
            }

            for (var j = 0; j < value.length; j++) {
              segment = encodeURIComponent(value[j]);

              if (!matches[i].test(segment)) {
                throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
              }

              path += (j === 0 ? token.prefix : token.delimiter) + segment;
            }

            continue
          }

          segment = encodeURIComponent(value);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
          }

          path += token.prefix + segment;
        }

        return path
      }
    }

    /**
     * Escape a regular expression string.
     *
     * @param  {String} str
     * @return {String}
     */
    function escapeString (str) {
      return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
    }

    /**
     * Escape the capturing group by escaping special characters and meaning.
     *
     * @param  {String} group
     * @return {String}
     */
    function escapeGroup (group) {
      return group.replace(/([=!:$\/()])/g, '\\$1')
    }

    /**
     * Attach the keys as a property of the regexp.
     *
     * @param  {RegExp} re
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function attachKeys (re, keys) {
      re.keys = keys;
      return re
    }

    /**
     * Get the flags for a regexp from the options.
     *
     * @param  {Object} options
     * @return {String}
     */
    function flags (options) {
      return options.sensitive ? '' : 'i'
    }

    /**
     * Pull out keys from a regexp.
     *
     * @param  {RegExp} path
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function regexpToRegexp (path, keys) {
      // Use a negative lookahead to match only capturing groups.
      var groups = path.source.match(/\((?!\?)/g);

      if (groups) {
        for (var i = 0; i < groups.length; i++) {
          keys.push({
            name: i,
            prefix: null,
            delimiter: null,
            optional: false,
            repeat: false,
            pattern: null
          });
        }
      }

      return attachKeys(path, keys)
    }

    /**
     * Transform an array into a regexp.
     *
     * @param  {Array}  path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function arrayToRegexp (path, keys, options) {
      var parts = [];

      for (var i = 0; i < path.length; i++) {
        parts.push(pathToRegexp(path[i], keys, options).source);
      }

      var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

      return attachKeys(regexp, keys)
    }

    /**
     * Create a path regexp from string input.
     *
     * @param  {String} path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function stringToRegexp (path, keys, options) {
      var tokens = parse(path);
      var re = tokensToRegExp(tokens, options);

      // Attach keys back to the regexp.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] !== 'string') {
          keys.push(tokens[i]);
        }
      }

      return attachKeys(re, keys)
    }

    /**
     * Expose a function for taking tokens and returning a RegExp.
     *
     * @param  {Array}  tokens
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function tokensToRegExp (tokens, options) {
      options = options || {};

      var strict = options.strict;
      var end = options.end !== false;
      var route = '';
      var lastToken = tokens[tokens.length - 1];
      var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken);

      // Iterate over the tokens and create our regexp string.
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (typeof token === 'string') {
          route += escapeString(token);
        } else {
          var prefix = escapeString(token.prefix);
          var capture = token.pattern;

          if (token.repeat) {
            capture += '(?:' + prefix + capture + ')*';
          }

          if (token.optional) {
            if (prefix) {
              capture = '(?:' + prefix + '(' + capture + '))?';
            } else {
              capture = '(' + capture + ')?';
            }
          } else {
            capture = prefix + '(' + capture + ')';
          }

          route += capture;
        }
      }

      // In non-strict mode we allow a slash at the end of match. If the path to
      // match already ends with a slash, we remove it for consistency. The slash
      // is valid at the end of a path match, not in the middle. This is important
      // in non-ending mode, where "/test/" shouldn't match "/test//route".
      if (!strict) {
        route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?';
      }

      if (end) {
        route += '$';
      } else {
        // In non-ending mode, we need the capturing groups to match as much as
        // possible by using a positive lookahead to the end or next path segment.
        route += strict && endsWithSlash ? '' : '(?=\\/|$)';
      }

      return new RegExp('^' + route, flags(options))
    }

    /**
     * Normalize the given path string, returning a regular expression.
     *
     * An empty array can be passed in for the keys, which will hold the
     * placeholder key descriptions. For example, using `/user/:id`, `keys` will
     * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
     *
     * @param  {(String|RegExp|Array)} path
     * @param  {Array}                 [keys]
     * @param  {Object}                [options]
     * @return {RegExp}
     */
    function pathToRegexp (path, keys, options) {
      keys = keys || [];

      if (!isarray(keys)) {
        options = keys;
        keys = [];
      } else if (!options) {
        options = {};
      }

      if (path instanceof RegExp) {
        return regexpToRegexp(path, keys)
      }

      if (isarray(path)) {
        return arrayToRegexp(path, keys, options)
      }

      return stringToRegexp(path, keys, options)
    }

    pathToRegexp_1.parse = parse_1;
    pathToRegexp_1.compile = compile_1;
    pathToRegexp_1.tokensToFunction = tokensToFunction_1;
    pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

    /**
       * Module dependencies.
       */

      

      /**
       * Short-cuts for global-object checks
       */

      var hasDocument = ('undefined' !== typeof document);
      var hasWindow = ('undefined' !== typeof window);
      var hasHistory = ('undefined' !== typeof history);
      var hasProcess = typeof process !== 'undefined';

      /**
       * Detect click event
       */
      var clickEvent = hasDocument && document.ontouchstart ? 'touchstart' : 'click';

      /**
       * To work properly with the URL
       * history.location generated polyfill in https://github.com/devote/HTML5-History-API
       */

      var isLocation = hasWindow && !!(window.history.location || window.location);

      /**
       * The page instance
       * @api private
       */
      function Page() {
        // public things
        this.callbacks = [];
        this.exits = [];
        this.current = '';
        this.len = 0;

        // private things
        this._decodeURLComponents = true;
        this._base = '';
        this._strict = false;
        this._running = false;
        this._hashbang = false;

        // bound functions
        this.clickHandler = this.clickHandler.bind(this);
        this._onpopstate = this._onpopstate.bind(this);
      }

      /**
       * Configure the instance of page. This can be called multiple times.
       *
       * @param {Object} options
       * @api public
       */

      Page.prototype.configure = function(options) {
        var opts = options || {};

        this._window = opts.window || (hasWindow && window);
        this._decodeURLComponents = opts.decodeURLComponents !== false;
        this._popstate = opts.popstate !== false && hasWindow;
        this._click = opts.click !== false && hasDocument;
        this._hashbang = !!opts.hashbang;

        var _window = this._window;
        if(this._popstate) {
          _window.addEventListener('popstate', this._onpopstate, false);
        } else if(hasWindow) {
          _window.removeEventListener('popstate', this._onpopstate, false);
        }

        if (this._click) {
          _window.document.addEventListener(clickEvent, this.clickHandler, false);
        } else if(hasDocument) {
          _window.document.removeEventListener(clickEvent, this.clickHandler, false);
        }

        if(this._hashbang && hasWindow && !hasHistory) {
          _window.addEventListener('hashchange', this._onpopstate, false);
        } else if(hasWindow) {
          _window.removeEventListener('hashchange', this._onpopstate, false);
        }
      };

      /**
       * Get or set basepath to `path`.
       *
       * @param {string} path
       * @api public
       */

      Page.prototype.base = function(path) {
        if (0 === arguments.length) return this._base;
        this._base = path;
      };

      /**
       * Gets the `base`, which depends on whether we are using History or
       * hashbang routing.

       * @api private
       */
      Page.prototype._getBase = function() {
        var base = this._base;
        if(!!base) return base;
        var loc = hasWindow && this._window && this._window.location;

        if(hasWindow && this._hashbang && loc && loc.protocol === 'file:') {
          base = loc.pathname;
        }

        return base;
      };

      /**
       * Get or set strict path matching to `enable`
       *
       * @param {boolean} enable
       * @api public
       */

      Page.prototype.strict = function(enable) {
        if (0 === arguments.length) return this._strict;
        this._strict = enable;
      };


      /**
       * Bind with the given `options`.
       *
       * Options:
       *
       *    - `click` bind to click events [true]
       *    - `popstate` bind to popstate [true]
       *    - `dispatch` perform initial dispatch [true]
       *
       * @param {Object} options
       * @api public
       */

      Page.prototype.start = function(options) {
        var opts = options || {};
        this.configure(opts);

        if (false === opts.dispatch) return;
        this._running = true;

        var url;
        if(isLocation) {
          var window = this._window;
          var loc = window.location;

          if(this._hashbang && ~loc.hash.indexOf('#!')) {
            url = loc.hash.substr(2) + loc.search;
          } else if (this._hashbang) {
            url = loc.search + loc.hash;
          } else {
            url = loc.pathname + loc.search + loc.hash;
          }
        }

        this.replace(url, null, true, opts.dispatch);
      };

      /**
       * Unbind click and popstate event handlers.
       *
       * @api public
       */

      Page.prototype.stop = function() {
        if (!this._running) return;
        this.current = '';
        this.len = 0;
        this._running = false;

        var window = this._window;
        this._click && window.document.removeEventListener(clickEvent, this.clickHandler, false);
        hasWindow && window.removeEventListener('popstate', this._onpopstate, false);
        hasWindow && window.removeEventListener('hashchange', this._onpopstate, false);
      };

      /**
       * Show `path` with optional `state` object.
       *
       * @param {string} path
       * @param {Object=} state
       * @param {boolean=} dispatch
       * @param {boolean=} push
       * @return {!Context}
       * @api public
       */

      Page.prototype.show = function(path, state, dispatch, push) {
        var ctx = new Context(path, state, this),
          prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        if (false !== dispatch) this.dispatch(ctx, prev);
        if (false !== ctx.handled && false !== push) ctx.pushState();
        return ctx;
      };

      /**
       * Goes back in the history
       * Back should always let the current route push state and then go back.
       *
       * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
       * @param {Object=} state
       * @api public
       */

      Page.prototype.back = function(path, state) {
        var page = this;
        if (this.len > 0) {
          var window = this._window;
          // this may need more testing to see if all browsers
          // wait for the next tick to go back in history
          hasHistory && window.history.back();
          this.len--;
        } else if (path) {
          setTimeout(function() {
            page.show(path, state);
          });
        } else {
          setTimeout(function() {
            page.show(page._getBase(), state);
          });
        }
      };

      /**
       * Register route to redirect from one path to other
       * or just redirect to another route
       *
       * @param {string} from - if param 'to' is undefined redirects to 'from'
       * @param {string=} to
       * @api public
       */
      Page.prototype.redirect = function(from, to) {
        var inst = this;

        // Define route from a path to another
        if ('string' === typeof from && 'string' === typeof to) {
          page.call(this, from, function(e) {
            setTimeout(function() {
              inst.replace(/** @type {!string} */ (to));
            }, 0);
          });
        }

        // Wait for the push state and replace it with another
        if ('string' === typeof from && 'undefined' === typeof to) {
          setTimeout(function() {
            inst.replace(from);
          }, 0);
        }
      };

      /**
       * Replace `path` with optional `state` object.
       *
       * @param {string} path
       * @param {Object=} state
       * @param {boolean=} init
       * @param {boolean=} dispatch
       * @return {!Context}
       * @api public
       */


      Page.prototype.replace = function(path, state, init, dispatch) {
        var ctx = new Context(path, state, this),
          prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        ctx.init = init;
        ctx.save(); // save before dispatching, which may redirect
        if (false !== dispatch) this.dispatch(ctx, prev);
        return ctx;
      };

      /**
       * Dispatch the given `ctx`.
       *
       * @param {Context} ctx
       * @api private
       */

      Page.prototype.dispatch = function(ctx, prev) {
        var i = 0, j = 0, page = this;

        function nextExit() {
          var fn = page.exits[j++];
          if (!fn) return nextEnter();
          fn(prev, nextExit);
        }

        function nextEnter() {
          var fn = page.callbacks[i++];

          if (ctx.path !== page.current) {
            ctx.handled = false;
            return;
          }
          if (!fn) return unhandled.call(page, ctx);
          fn(ctx, nextEnter);
        }

        if (prev) {
          nextExit();
        } else {
          nextEnter();
        }
      };

      /**
       * Register an exit route on `path` with
       * callback `fn()`, which will be called
       * on the previous context when a new
       * page is visited.
       */
      Page.prototype.exit = function(path, fn) {
        if (typeof path === 'function') {
          return this.exit('*', path);
        }

        var route = new Route(path, null, this);
        for (var i = 1; i < arguments.length; ++i) {
          this.exits.push(route.middleware(arguments[i]));
        }
      };

      /**
       * Handle "click" events.
       */

      /* jshint +W054 */
      Page.prototype.clickHandler = function(e) {
        if (1 !== this._which(e)) return;

        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        if (e.defaultPrevented) return;

        // ensure link
        // use shadow dom when available if not, fall back to composedPath()
        // for browsers that only have shady
        var el = e.target;
        var eventPath = e.path || (e.composedPath ? e.composedPath() : null);

        if(eventPath) {
          for (var i = 0; i < eventPath.length; i++) {
            if (!eventPath[i].nodeName) continue;
            if (eventPath[i].nodeName.toUpperCase() !== 'A') continue;
            if (!eventPath[i].href) continue;

            el = eventPath[i];
            break;
          }
        }

        // continue ensure link
        // el.nodeName for svg links are 'a' instead of 'A'
        while (el && 'A' !== el.nodeName.toUpperCase()) el = el.parentNode;
        if (!el || 'A' !== el.nodeName.toUpperCase()) return;

        // check if link is inside an svg
        // in this case, both href and target are always inside an object
        var svg = (typeof el.href === 'object') && el.href.constructor.name === 'SVGAnimatedString';

        // Ignore if tag has
        // 1. "download" attribute
        // 2. rel="external" attribute
        if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

        // ensure non-hash for the same path
        var link = el.getAttribute('href');
        if(!this._hashbang && this._samePath(el) && (el.hash || '#' === link)) return;

        // Check for mailto: in the href
        if (link && link.indexOf('mailto:') > -1) return;

        // check target
        // svg target is an object and its desired value is in .baseVal property
        if (svg ? el.target.baseVal : el.target) return;

        // x-origin
        // note: svg links that are not relative don't call click events (and skip page.js)
        // consequently, all svg links tested inside page.js are relative and in the same origin
        if (!svg && !this.sameOrigin(el.href)) return;

        // rebuild path
        // There aren't .pathname and .search properties in svg links, so we use href
        // Also, svg href is an object and its desired value is in .baseVal property
        var path = svg ? el.href.baseVal : (el.pathname + el.search + (el.hash || ''));

        path = path[0] !== '/' ? '/' + path : path;

        // strip leading "/[drive letter]:" on NW.js on Windows
        if (hasProcess && path.match(/^\/[a-zA-Z]:\//)) {
          path = path.replace(/^\/[a-zA-Z]:\//, '/');
        }

        // same page
        var orig = path;
        var pageBase = this._getBase();

        if (path.indexOf(pageBase) === 0) {
          path = path.substr(pageBase.length);
        }

        if (this._hashbang) path = path.replace('#!', '');

        if (pageBase && orig === path && (!isLocation || this._window.location.protocol !== 'file:')) {
          return;
        }

        e.preventDefault();
        this.show(orig);
      };

      /**
       * Handle "populate" events.
       * @api private
       */

      Page.prototype._onpopstate = (function () {
        var loaded = false;
        if ( ! hasWindow ) {
          return function () {};
        }
        if (hasDocument && document.readyState === 'complete') {
          loaded = true;
        } else {
          window.addEventListener('load', function() {
            setTimeout(function() {
              loaded = true;
            }, 0);
          });
        }
        return function onpopstate(e) {
          if (!loaded) return;
          var page = this;
          if (e.state) {
            var path = e.state.path;
            page.replace(path, e.state);
          } else if (isLocation) {
            var loc = page._window.location;
            page.show(loc.pathname + loc.search + loc.hash, undefined, undefined, false);
          }
        };
      })();

      /**
       * Event button.
       */
      Page.prototype._which = function(e) {
        e = e || (hasWindow && this._window.event);
        return null == e.which ? e.button : e.which;
      };

      /**
       * Convert to a URL object
       * @api private
       */
      Page.prototype._toURL = function(href) {
        var window = this._window;
        if(typeof URL === 'function' && isLocation) {
          return new URL(href, window.location.toString());
        } else if (hasDocument) {
          var anc = window.document.createElement('a');
          anc.href = href;
          return anc;
        }
      };

      /**
       * Check if `href` is the same origin.
       * @param {string} href
       * @api public
       */
      Page.prototype.sameOrigin = function(href) {
        if(!href || !isLocation) return false;

        var url = this._toURL(href);
        var window = this._window;

        var loc = window.location;

        /*
           When the port is the default http port 80 for http, or 443 for
           https, internet explorer 11 returns an empty string for loc.port,
           so we need to compare loc.port with an empty string if url.port
           is the default port 80 or 443.
           Also the comparition with `port` is changed from `===` to `==` because
           `port` can be a string sometimes. This only applies to ie11.
        */
        return loc.protocol === url.protocol &&
          loc.hostname === url.hostname &&
          (loc.port === url.port || loc.port === '' && (url.port == 80 || url.port == 443)); // jshint ignore:line
      };

      /**
       * @api private
       */
      Page.prototype._samePath = function(url) {
        if(!isLocation) return false;
        var window = this._window;
        var loc = window.location;
        return url.pathname === loc.pathname &&
          url.search === loc.search;
      };

      /**
       * Remove URL encoding from the given `str`.
       * Accommodates whitespace in both x-www-form-urlencoded
       * and regular percent-encoded form.
       *
       * @param {string} val - URL component to decode
       * @api private
       */
      Page.prototype._decodeURLEncodedURIComponent = function(val) {
        if (typeof val !== 'string') { return val; }
        return this._decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
      };

      /**
       * Create a new `page` instance and function
       */
      function createPage() {
        var pageInstance = new Page();

        function pageFn(/* args */) {
          return page.apply(pageInstance, arguments);
        }

        // Copy all of the things over. In 2.0 maybe we use setPrototypeOf
        pageFn.callbacks = pageInstance.callbacks;
        pageFn.exits = pageInstance.exits;
        pageFn.base = pageInstance.base.bind(pageInstance);
        pageFn.strict = pageInstance.strict.bind(pageInstance);
        pageFn.start = pageInstance.start.bind(pageInstance);
        pageFn.stop = pageInstance.stop.bind(pageInstance);
        pageFn.show = pageInstance.show.bind(pageInstance);
        pageFn.back = pageInstance.back.bind(pageInstance);
        pageFn.redirect = pageInstance.redirect.bind(pageInstance);
        pageFn.replace = pageInstance.replace.bind(pageInstance);
        pageFn.dispatch = pageInstance.dispatch.bind(pageInstance);
        pageFn.exit = pageInstance.exit.bind(pageInstance);
        pageFn.configure = pageInstance.configure.bind(pageInstance);
        pageFn.sameOrigin = pageInstance.sameOrigin.bind(pageInstance);
        pageFn.clickHandler = pageInstance.clickHandler.bind(pageInstance);

        pageFn.create = createPage;

        Object.defineProperty(pageFn, 'len', {
          get: function(){
            return pageInstance.len;
          },
          set: function(val) {
            pageInstance.len = val;
          }
        });

        Object.defineProperty(pageFn, 'current', {
          get: function(){
            return pageInstance.current;
          },
          set: function(val) {
            pageInstance.current = val;
          }
        });

        // In 2.0 these can be named exports
        pageFn.Context = Context;
        pageFn.Route = Route;

        return pageFn;
      }

      /**
       * Register `path` with callback `fn()`,
       * or route `path`, or redirection,
       * or `page.start()`.
       *
       *   page(fn);
       *   page('*', fn);
       *   page('/user/:id', load, user);
       *   page('/user/' + user.id, { some: 'thing' });
       *   page('/user/' + user.id);
       *   page('/from', '/to')
       *   page();
       *
       * @param {string|!Function|!Object} path
       * @param {Function=} fn
       * @api public
       */

      function page(path, fn) {
        // <callback>
        if ('function' === typeof path) {
          return page.call(this, '*', path);
        }

        // route <path> to <callback ...>
        if ('function' === typeof fn) {
          var route = new Route(/** @type {string} */ (path), null, this);
          for (var i = 1; i < arguments.length; ++i) {
            this.callbacks.push(route.middleware(arguments[i]));
          }
          // show <path> with [state]
        } else if ('string' === typeof path) {
          this['string' === typeof fn ? 'redirect' : 'show'](path, fn);
          // start [options]
        } else {
          this.start(path);
        }
      }

      /**
       * Unhandled `ctx`. When it's not the initial
       * popstate then redirect. If you wish to handle
       * 404s on your own use `page('*', callback)`.
       *
       * @param {Context} ctx
       * @api private
       */
      function unhandled(ctx) {
        if (ctx.handled) return;
        var current;
        var page = this;
        var window = page._window;

        if (page._hashbang) {
          current = isLocation && this._getBase() + window.location.hash.replace('#!', '');
        } else {
          current = isLocation && window.location.pathname + window.location.search;
        }

        if (current === ctx.canonicalPath) return;
        page.stop();
        ctx.handled = false;
        isLocation && (window.location.href = ctx.canonicalPath);
      }

      /**
       * Escapes RegExp characters in the given string.
       *
       * @param {string} s
       * @api private
       */
      function escapeRegExp(s) {
        return s.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
      }

      /**
       * Initialize a new "request" `Context`
       * with the given `path` and optional initial `state`.
       *
       * @constructor
       * @param {string} path
       * @param {Object=} state
       * @api public
       */

      function Context(path, state, pageInstance) {
        var _page = this.page = pageInstance || page;
        var window = _page._window;
        var hashbang = _page._hashbang;

        var pageBase = _page._getBase();
        if ('/' === path[0] && 0 !== path.indexOf(pageBase)) path = pageBase + (hashbang ? '#!' : '') + path;
        var i = path.indexOf('?');

        this.canonicalPath = path;
        var re = new RegExp('^' + escapeRegExp(pageBase));
        this.path = path.replace(re, '') || '/';
        if (hashbang) this.path = this.path.replace('#!', '') || '/';

        this.title = (hasDocument && window.document.title);
        this.state = state || {};
        this.state.path = path;
        this.querystring = ~i ? _page._decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
        this.pathname = _page._decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
        this.params = {};

        // fragment
        this.hash = '';
        if (!hashbang) {
          if (!~this.path.indexOf('#')) return;
          var parts = this.path.split('#');
          this.path = this.pathname = parts[0];
          this.hash = _page._decodeURLEncodedURIComponent(parts[1]) || '';
          this.querystring = this.querystring.split('#')[0];
        }
      }

      /**
       * Push state.
       *
       * @api private
       */

      Context.prototype.pushState = function() {
        var page = this.page;
        var window = page._window;
        var hashbang = page._hashbang;

        page.len++;
        if (hasHistory) {
            window.history.pushState(this.state, this.title,
              hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
      };

      /**
       * Save the context state.
       *
       * @api public
       */

      Context.prototype.save = function() {
        var page = this.page;
        if (hasHistory) {
            page._window.history.replaceState(this.state, this.title,
              page._hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
      };

      /**
       * Initialize `Route` with the given HTTP `path`,
       * and an array of `callbacks` and `options`.
       *
       * Options:
       *
       *   - `sensitive`    enable case-sensitive routes
       *   - `strict`       enable strict matching for trailing slashes
       *
       * @constructor
       * @param {string} path
       * @param {Object=} options
       * @api private
       */

      function Route(path, options, page) {
        var _page = this.page = page || globalPage;
        var opts = options || {};
        opts.strict = opts.strict || _page._strict;
        this.path = (path === '*') ? '(.*)' : path;
        this.method = 'GET';
        this.regexp = pathToRegexp_1(this.path, this.keys = [], opts);
      }

      /**
       * Return route middleware with
       * the given callback `fn()`.
       *
       * @param {Function} fn
       * @return {Function}
       * @api public
       */

      Route.prototype.middleware = function(fn) {
        var self = this;
        return function(ctx, next) {
          if (self.match(ctx.path, ctx.params)) {
            ctx.routePath = self.path;
            return fn(ctx, next);
          }
          next();
        };
      };

      /**
       * Check if this route matches `path`, if so
       * populate `params`.
       *
       * @param {string} path
       * @param {Object} params
       * @return {boolean}
       * @api private
       */

      Route.prototype.match = function(path, params) {
        var keys = this.keys,
          qsIndex = path.indexOf('?'),
          pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
          m = this.regexp.exec(decodeURIComponent(pathname));

        if (!m) return false;

        delete params[0];

        for (var i = 1, len = m.length; i < len; ++i) {
          var key = keys[i - 1];
          var val = this.page._decodeURLEncodedURIComponent(m[i]);
          if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
            params[key.name] = val;
          }
        }

        return true;
      };


      /**
       * Module exports.
       */

      var globalPage = createPage();
      var page_js = globalPage;
      var default_1 = globalPage;

    page_js.default = default_1;

    return page_js;

    })));
    });

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* src/components/pager/Router.svelte generated by Svelte v3.24.1 */

    const { Object: Object_1, console: console_1$1 } = globals;

    function create_fragment$5(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const activeRoute = writable({});
    let routes = {};

    function register(route) {
    	routes[route.path] = route;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $activeRoute,
    		$$unsubscribe_activeRoute = noop;

    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, $$value => $$invalidate(2, $activeRoute = $$value));
    	$$self.$$.on_destroy.push(() => $$unsubscribe_activeRoute());

    	const setActiveRoute = route => {
    		return function (ctx) {
    			console.log(ctx);
    			set_store_value(activeRoute, $activeRoute = { ...route, params: ctx.params });
    		};
    	};

    	const setupPage = () => {
    		for (let [path, route] of Object.entries(routes)) {
    			page(path, ...route.middleware, setActiveRoute(route));
    		}

    		// start page.js
    		page.start();
    	};

    	onMount(setupPage);
    	onDestroy(page.stop);
    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Router", $$slots, ['default']);

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		writable,
    		activeRoute,
    		routes,
    		register,
    		page,
    		onMount,
    		onDestroy,
    		setActiveRoute,
    		setupPage,
    		$activeRoute
    	});

    	return [$$scope, $$slots];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/pager/Route.svelte generated by Svelte v3.24.1 */
    const get_default_slot_changes = dirty => ({ params: dirty & /*params*/ 2 });
    const get_default_slot_context = ctx => ({ params: /*params*/ ctx[1] });

    // (19:0) {#if $activeRoute.path === path}
    function create_if_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$activeRoute*/ ctx[2].component) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(19:0) {#if $activeRoute.path === path}",
    		ctx
    	});

    	return block;
    }

    // (24:2) {:else}
    function create_else_block$1(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, params*/ 66) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[6], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(24:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (21:2) {#if $activeRoute.component}
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*$$restProps*/ ctx[3], /*params*/ ctx[1]];
    	var switch_value = /*$activeRoute*/ ctx[2].component;

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$$restProps, params*/ 10)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$$restProps*/ 8 && get_spread_object(/*$$restProps*/ ctx[3]),
    					dirty & /*params*/ 2 && get_spread_object(/*params*/ ctx[1])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*$activeRoute*/ ctx[2].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(21:2) {#if $activeRoute.component}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[2].path === /*path*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[2].path === /*path*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute, path*/ 5) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const omit_props_names = ["path","component","middleware"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $activeRoute;
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, $$value => $$invalidate(2, $activeRoute = $$value));
    	let { path = "/" } = $$props;
    	let { component = null } = $$props;
    	let { middleware = [] } = $$props;

    	// Define empty params object
    	let params = {};

    	register({ path, component, middleware });
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Route", $$slots, ['default']);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("path" in $$new_props) $$invalidate(0, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(4, component = $$new_props.component);
    		if ("middleware" in $$new_props) $$invalidate(5, middleware = $$new_props.middleware);
    		if ("$$scope" in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		register,
    		activeRoute,
    		path,
    		component,
    		middleware,
    		params,
    		$activeRoute
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("path" in $$props) $$invalidate(0, path = $$new_props.path);
    		if ("component" in $$props) $$invalidate(4, component = $$new_props.component);
    		if ("middleware" in $$props) $$invalidate(5, middleware = $$new_props.middleware);
    		if ("params" in $$props) $$invalidate(1, params = $$new_props.params);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute, path*/ 5) {
    			// if active route -> extract params
    			 if ($activeRoute.path === path) {
    				$$invalidate(1, params = $activeRoute.params);
    			}
    		}
    	};

    	return [
    		path,
    		params,
    		$activeRoute,
    		$$restProps,
    		component,
    		middleware,
    		$$scope,
    		$$slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { path: 0, component: 4, middleware: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get middleware() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set middleware(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/pager/NotFound.svelte generated by Svelte v3.24.1 */
    const file$3 = "src/components/pager/NotFound.svelte";

    // (23:0) {#if $activeRoute.path === path}
    function create_if_block$2(ctx) {
    	let div;
    	let t0;
    	let br;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("404. ");
    			br = element("br");
    			t1 = text(" Sorry page not found.");
    			add_location(br, file$3, 23, 38, 482);
    			attr_dev(div, "class", "not-found-wrapper svelte-z1f7jc");
    			add_location(div, file$3, 23, 2, 446);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, br);
    			append_dev(div, t1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(23:0) {#if $activeRoute.path === path}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let if_block_anchor;
    	let if_block = /*$activeRoute*/ ctx[1].path === /*path*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1].path === /*path*/ ctx[0]) {
    				if (if_block) ; else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, $$value => $$invalidate(1, $activeRoute = $$value));
    	let { path = "*" } = $$props;
    	let { component = null } = $$props;
    	register({ path, component, middleware: [] });
    	const writable_props = ["path", "component"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NotFound> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("NotFound", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("component" in $$props) $$invalidate(2, component = $$props.component);
    	};

    	$$self.$capture_state = () => ({
    		register,
    		activeRoute,
    		path,
    		component,
    		$activeRoute
    	});

    	$$self.$inject_state = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    		if ("component" in $$props) $$invalidate(2, component = $$props.component);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [path, $activeRoute, component];
    }

    class NotFound extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { path: 0, component: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotFound",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get path() {
    		throw new Error("<NotFound>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<NotFound>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<NotFound>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<NotFound>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const redirect = (path) => page.redirect(path);

    /* src/App.svelte generated by Svelte v3.24.1 */

    // (8:0) <Router>
    function create_default_slot(ctx) {
    	let route0;
    	let t0;
    	let route1;
    	let t1;
    	let route2;
    	let t2;
    	let notfound;
    	let current;

    	route0 = new Route({
    			props: { path: "/", component: Home },
    			$$inline: true
    		});

    	route1 = new Route({
    			props: { path: "/profile", component: Profile },
    			$$inline: true
    		});

    	route2 = new Route({
    			props: { path: "/project", component: Project },
    			$$inline: true
    		});

    	notfound = new NotFound({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t0 = space();
    			create_component(route1.$$.fragment);
    			t1 = space();
    			create_component(route2.$$.fragment);
    			t2 = space();
    			create_component(notfound.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(notfound, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(notfound.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(notfound.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(route2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(notfound, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(8:0) <Router>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		Home,
    		Profile,
    		Project,
    		Router,
    		Route,
    		NotFound,
    		redirect
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
