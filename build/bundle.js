
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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

    const globals = (typeof window !== 'undefined' ? window : global);
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
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
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
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
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

    /* src/components/Navbar.svelte generated by Svelte v3.20.1 */

    const file = "src/components/Navbar.svelte";

    function create_fragment(ctx) {
    	let div;
    	let a0;
    	let t1;
    	let a1;
    	let t3;
    	let a2;
    	let t5;
    	let a3;
    	let t7;
    	let a4;
    	let t9;
    	let a5;
    	let i;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a0 = element("a");
    			a0.textContent = "Koffi";
    			t1 = space();
    			a1 = element("a");
    			a1.textContent = "About";
    			t3 = space();
    			a2 = element("a");
    			a2.textContent = "Menu";
    			t5 = space();
    			a3 = element("a");
    			a3.textContent = "Services";
    			t7 = space();
    			a4 = element("a");
    			a4.textContent = "Contact";
    			t9 = space();
    			a5 = element("a");
    			i = element("i");
    			attr_dev(a0, "id", "brand");
    			attr_dev(a0, "href", "#home");
    			attr_dev(a0, "class", "active svelte-ka10jo");
    			add_location(a0, file, 80, 2, 1279);
    			attr_dev(a1, "href", "#news");
    			attr_dev(a1, "class", "svelte-ka10jo");
    			add_location(a1, file, 81, 2, 1333);
    			attr_dev(a2, "href", "#contact");
    			attr_dev(a2, "class", "svelte-ka10jo");
    			add_location(a2, file, 82, 2, 1361);
    			attr_dev(a3, "href", "#about");
    			attr_dev(a3, "class", "svelte-ka10jo");
    			add_location(a3, file, 83, 2, 1391);
    			attr_dev(a4, "href", "#contact");
    			attr_dev(a4, "class", "svelte-ka10jo");
    			add_location(a4, file, 84, 2, 1423);
    			attr_dev(i, "class", "fa fa-bars");
    			add_location(i, file, 86, 4, 1532);
    			attr_dev(a5, "href", "javascript:void(0);");
    			attr_dev(a5, "class", "icon svelte-ka10jo");
    			add_location(a5, file, 85, 2, 1456);
    			attr_dev(div, "class", "topnav svelte-ka10jo");
    			attr_dev(div, "id", "myTopnav");
    			toggle_class(div, "responsive", /*responsive*/ ctx[0]);
    			add_location(div, file, 79, 0, 1225);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a0);
    			append_dev(div, t1);
    			append_dev(div, a1);
    			append_dev(div, t3);
    			append_dev(div, a2);
    			append_dev(div, t5);
    			append_dev(div, a3);
    			append_dev(div, t7);
    			append_dev(div, a4);
    			append_dev(div, t9);
    			append_dev(div, a5);
    			append_dev(a5, i);
    			if (remount) dispose();
    			dispose = listen_dev(a5, "click", /*toggleResponsive*/ ctx[1], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*responsive*/ 1) {
    				toggle_class(div, "responsive", /*responsive*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
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
    	let responsive = false;

    	let toggleResponsive = () => {
    		$$invalidate(0, responsive = !responsive);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", $$slots, []);
    	$$self.$capture_state = () => ({ responsive, toggleResponsive });

    	$$self.$inject_state = $$props => {
    		if ("responsive" in $$props) $$invalidate(0, responsive = $$props.responsive);
    		if ("toggleResponsive" in $$props) $$invalidate(1, toggleResponsive = $$props.toggleResponsive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [responsive, toggleResponsive];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var menu = {
      Drinks: [
        {
          type: 'hot drinks',
          sizes: ['12oz', '16oz'],
          drinks: [
            {
              drinkType: 'coffee',
              varities: [
                {
                  name: 'freshly brewed coffee',
                  price1: '$2.00',
                  price2: '$2.25',
                },
                {
                  name: 'café au lait',
                  price1: '$2.50',
                  price2: '$2.75',
                },
                {
                  name: 'french press for two',
                  price1: '$5.75 ',
                  price2: '',
                },
              ],
            },
            {
              drinkType: 'espresso',
              varities: [
                {
                  name: 'americano',
                  price1: '$2.90',
                  price2: '$3.00',
                },
                {
                  name: 'africano',
                  price1: '$3.15',
                  price2: '$3.50',
                },
                {
                  name: 'cappuccino',
                  price1: '$4.00',
                  price2: '$4.25',
                },
                {
                  name: 'latte',
                  price1: '$4.00',
                  price2: '$4.25',
                },
                {
                  name: 'vanilla latte',
                  price1: '$4.50',
                  price2: '$4.75',
                },
                {
                  name: 'mocha latte',
                  price1: '$4.50',
                  price2: '$4.75',
                },
                {
                  name: 'caramel latte',
                  price1: '$4.50',
                  price2: '$4.75',
                },
                {
                  name: 'shot in the dark ',
                  price1: '$3.25',
                  price2: '$3.50',
                },
                {
                  name: 'espresso ',
                  price1: '$2.25',
                  price2: '$2.50',
                },
                {
                  name: 'espresso macchiato',
                  price1: '$2.50',
                  price2: '$2.75',
                },
              ],
            },
            {
              drinkType: 'alternatives',
              varities: [
                {
                  name: 'chai latte',
                  price1: '$4.00',
                  price2: '$4.50',
                },
                {
                  name: 'matcha latte',
                  price1: '$4.50',
                  price2: '$4.75',
                },
                {
                  name: 'london fog',
                  price1: '$4.50',
                  price2: '$4.75',
                },
                {
                  name: 'steamed milk',
                  price1: '$3.00',
                  price2: '$3.25',
                },
                {
                  name: 'hot chocolate ',
                  price1: '$3.50',
                  price2: '$3.75',
                },
                {
                  name: 'hot apple cider',
                  price1: '$3.25',
                  price2: '$3.50',
                },
                {
                  name: 'tea',
                  price1: '$2.25 ',
                  price2: '$2.25',
                },
                {
                  name: 'kids hot chocolate',
                  price1: '$2.25',
                  price2: '',
                },
                {
                  name: 'kids steamer',
                  price1: '$1.75',
                  price2: '',
                },
              ],
            },
            {
              drinkType: 'extras',
              varities: [
                {
                  name: 'espresso',
                  price1: '0.50',
                  price2: '',
                },
                {
                  name: 'soy milk',
                  price1: '0.50',
                  price2: '',
                },
                {
                  name: 'flavoured syrup',
                  price1: '0.50',
                  price2: '',
                },
              ],
            },
          ],
        },
        {
          type: 'cold drinks',
          sizes: ['16oz', ''],
          drinks: [
            {
              drinkType: 'iced',
              varities: [
                {
                  name: 'iced coffee',
                  price1: '$3.25',
                  price2: '',
                },
                {
                  name: 'iced latte',
                  price1: '$4.50',
                  price2: '',
                },
                {
                  name: 'iced vanilla latte',
                  price1: '$4.75',
                  price2: '',
                },
                {
                  name: 'iced mocha',
                  price1: '$4.75',
                  price2: '',
                },
                {
                  name: 'iced chai latte',
                  price1: '$4.75',
                  price2: '',
                },
                {
                  name: 'iced matcha',
                  price1: '$4.75',
                  price2: '',
                },
              ],
            },
            {
              drinkType: 'blended',
              varities: [
                {
                  name: 'mocha frappe',
                  price1: '$4.75',
                  price2: '',
                },
                {
                  name: 'chai frappe ',
                  price1: '$4.75',
                  price2: '',
                },
                {
                  name: 'matcha frappe',
                  price1: '$4.75',
                  price2: '',
                },
                {
                  name: 'fruit smoothie',
                  price1: '$4.75',
                  price2: '',
                },
              ],
            },
          ],
        },
      ],
      Food: [
        {
          type: 'lunch items',
          sizes: ['small', 'big'],
          foods: [
            {
              foodType: 'soup',
              varities: [
                {
                  name: 'Soup of the day',
                  price1: '$4.75',
                  price2: '$6.75',
                },
              ],
            },
            {
              foodType: 'salads',
              varities: [
                {
                  name: 'Coming Soon',
                  price1: '',
                  price2: '',
                  ingredients: '',
                },
              ],
            },
            {
              foodType: 'rolls',
              varities: [
                {
                  name: 'sausage roll',
                  price1: '',
                  price2: '$3.00',
                },
                {
                  name: 'veggie roll',
                  price1: '',
                  price2: '$3.00',
                },
              ],
            },
            {
              foodType: 'paninis',
              varities: [
                {
                  name: 'haultain heat ',
                  price1: '',
                  price2: '$7.75',
                  ingredients:
                    'Turkey, spicy salami, banana peppers, havarti cheese, spinach, chipotle mayo',
                },
                {
                  name: 'little piggy ',
                  price1: '',
                  price2: '$7.75',
                  ingredients:
                    'Black forest ham, capicolli ham, havarti cheese, spinach, roasted red pepper sauce',
                },
                {
                  name: 'garden lover ',
                  price1: '',
                  price2: '$7.75',
                  ingredients:
                    'Zucchini, peppers, sun dried tomato, avacodo, spinach, havarti cheese, roasted red pepper sauce',
                },
                {
                  name: 'finding nemo ',
                  price1: '',
                  price2: '$7.75',
                  ingredients:
                    'Tuna, peppers, zucchini, spinach, havarti cheese, mayo',
                },
                {
                  name: 'chickadee ',
                  price1: '',
                  price2: '$7.75',
                  ingredients:
                    'Chicken, mozzarella, sun dried tomato, spinach, pesto mayo',
                },
              ],
            },
            {
              foodType: 'croissant sandwiches',
              varities: [
                {
                  name: 'spicy salami',
                  price1: '',
                  price2: '$5.00',
                },
                {
                  name: 'capicolli',
                  price1: '',
                  price2: '$5.00',
                },
                {
                  name: 'black forest ham',
                  price1: '',
                  price2: '$5.00',
                },
                {
                  name: 'turkey',
                  price1: '',
                  price2: '$5.00',
                },
              ],
            },
            {
              foodType: 'breakfast sandwiches',
              varities: [
                {
                  name: 'spicy salami',
                  price1: '',
                  price2: '$4.25',
                },
                {
                  name: 'capicolli',
                  price1: '',
                  price2: '$4.25',
                },
                {
                  name: 'black forest ham',
                  price1: '',
                  price2: '$4.25',
                },
                {
                  name: 'turkey',
                  price1: '',
                  price2: '$4.25',
                },
                {
                  name: 'vegetarian',
                  price1: '',
                  price2: '$4.25',
                },
              ],
            },
          ],
        },
      ],
    };
    var menu_1 = menu.Drinks;

    /* src/components/Menu.svelte generated by Svelte v3.20.1 */

    const { console: console_1 } = globals;
    const file$1 = "src/components/Menu.svelte";

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (39:8) {#each drink.sizes as size}
    function create_each_block_3(ctx) {
    	let th;
    	let t_value = /*size*/ ctx[9] + "";
    	let t;

    	const block = {
    		c: function create() {
    			th = element("th");
    			t = text(t_value);
    			add_location(th, file$1, 39, 10, 610);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(39:8) {#each drink.sizes as size}",
    		ctx
    	});

    	return block;
    }

    // (46:10) {#each d.varities as variety}
    function create_each_block_2(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*variety*/ ctx[6].name + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*variety*/ ctx[6].price1 + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*variety*/ ctx[6].price2 + "";
    	let t4;
    	let t5;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			attr_dev(td0, "class", "details svelte-i3ix4u");
    			add_location(td0, file$1, 47, 14, 813);
    			attr_dev(td1, "class", "details svelte-i3ix4u");
    			add_location(td1, file$1, 48, 14, 867);
    			attr_dev(td2, "class", "details svelte-i3ix4u");
    			add_location(td2, file$1, 49, 14, 923);
    			add_location(tr, file$1, 46, 12, 794);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(46:10) {#each d.varities as variety}",
    		ctx
    	});

    	return block;
    }

    // (42:8) {#each drink.drinks as d}
    function create_each_block_1(ctx) {
    	let tr;
    	let td;
    	let t0_value = /*d*/ ctx[3].drinkType + "";
    	let t0;
    	let t1;
    	let each_1_anchor;
    	let each_value_2 = /*d*/ ctx[3].varities;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td = element("td");
    			t0 = text(t0_value);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			add_location(td, file$1, 43, 12, 703);
    			add_location(tr, file$1, 42, 10, 686);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td);
    			append_dev(td, t0);
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Drinks*/ 0) {
    				each_value_2 = /*d*/ ctx[3].varities;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(42:8) {#each drink.drinks as d}",
    		ctx
    	});

    	return block;
    }

    // (34:2) {#each Drinks as drink}
    function create_each_block(ctx) {
    	let div;
    	let table;
    	let th;
    	let t0_value = /*drink*/ ctx[0].type + "";
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let each_value_3 = /*drink*/ ctx[0].sizes;
    	validate_each_argument(each_value_3);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_1[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_1 = /*drink*/ ctx[0].drinks;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			table = element("table");
    			th = element("th");
    			t0 = text(t0_value);
    			t1 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			add_location(th, file$1, 37, 8, 542);
    			add_location(table, file$1, 35, 6, 525);
    			attr_dev(div, "class", "row svelte-i3ix4u");
    			add_location(div, file$1, 34, 4, 501);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, table);
    			append_dev(table, th);
    			append_dev(th, t0);
    			append_dev(table, t1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(table, null);
    			}

    			append_dev(table, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			append_dev(div, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Drinks*/ 0) {
    				each_value_3 = /*drink*/ ctx[0].sizes;
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_3(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(table, t2);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_3.length;
    			}

    			if (dirty & /*Drinks*/ 0) {
    				each_value_1 = /*drink*/ ctx[0].drinks;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(34:2) {#each Drinks as drink}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let each_value = menu_1;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "menu svelte-i3ix4u");
    			add_location(div, file$1, 32, 0, 452);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Drinks*/ 0) {
    				each_value = menu_1;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
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
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
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
    	console.log(menu_1);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Menu", $$slots, []);
    	$$self.$capture_state = () => ({ Drinks: menu_1 });
    	return [];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.20.1 */

    function create_fragment$2(ctx) {
    	let t;
    	let current;
    	const navbar = new Navbar({ $$inline: true });
    	const menu = new Menu({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t = space();
    			create_component(menu.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(menu, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(menu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(menu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(menu, detaching);
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
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ Navbar, Menu });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

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
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
