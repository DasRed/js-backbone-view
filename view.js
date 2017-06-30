'use strict';

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'lodash', 'backbone', 'backbone-prototype-compatibility'], function (jQuery, lodash, Backbone) {
            return Backbone.ViewEx = factory(jQuery, lodash, Backbone.View, Backbone.compatibility);
        });

    } else if (typeof exports !== 'undefined') {
        root.Backbone.ViewEx = factory(root.jQuery, root.lodash || root._, root.Backbone.View, root.Backbone.compatibility);

    } else {
        root.Backbone.ViewEx = factory(root.jQuery, root.lodash || root._, root.Backbone.View, root.Backbone.compatibility);
    }
}(this, function (jQuery, lodash, BackboneView, compatibility) {

    /**
     *
     * @param {Object} options
     * @constructor
     */
    function View(options) {
        this.name = this.name || this.constructor.name || 'AnonymousView';
        if (this.name === 'View') {
            this.name = 'AnonymousView';
        }

        this.config = this.config || {};
        this.views  = this.views || {};

        // copy options
        for (var optionName in options || {}) {
            if (optionName === 'on') {
                this.on(options[optionName]);
                delete options[optionName];
                continue;
            }

            this[optionName] = options[optionName];
        }

        BackboneView.call(this, options);

        console.debug(this.name, '(' + this.cid + ') created.');
    }

    View.TEMPLATE_INSERT_TYPE_REPLACE = 'replace';
    View.TEMPLATE_INSERT_TYPE_APPEND  = 'append';
    View.TEMPLATE_INSERT_TYPE_PREPEND = 'prepend';
    View.TEMPLATE_INSERT_TYPE_BEFORE  = 'before';
    View.TEMPLATE_INSERT_TYPE_AFTER   = 'after';

    // prototype
    View.prototype = Object.create(BackboneView.prototype, {
        /**
         * @var {Object}
         * @example
         *  <code>
         *      // an entry can be an object like this
         *      {
		 * 			view: {Function} defines the view constructor
		 * 		    enabled: {Boolean} if value TRUE, then the view will be rendered. If not, then the view will be not rendered
		 * 		    options: {Object} options for the view
		 * 		}
         *        // an entry can be a string
         *        Function // which will be converted to {view: Function}
         *  </code>
         */
        config: {
            value: null,
            enumerable: true,
            configurable: true,
            writable: true
        },

        /**
         * defines the parent layout. will be setted by layout
         *
         * @var {View}
         */
        layout: {
            value: null,
            enumerable: true,
            configurable: true,
            writable: true
        },

        /**
         *
         * @var {String}
         */
        name: {
            value: null,
            enumerable: true,
            configurable: true,
            writable: true
        },

        /**
         * @var {Boolean}
         */
        rendered: {
            value: false,
            enumerable: true,
            configurable: true,
            writable: true
        },

        /**
         * @var {Boolean}
         */
        renderOnInitialize: {
            value: true,
            enumerable: true,
            configurable: true,
            writable: true
        },

        /**
         * @var {String|Function}
         */
        template: {
            value: null,
            enumerable: true,
            configurable: true,
            writable: true
        },

        /**
         * @var {String}
         */
        templateInsertType: {
            value: View.TEMPLATE_INSERT_TYPE_REPLACE,
            enumerable: true,
            configurable: true,
            writable: true
        },

        /**
         * old all instances of views
         *
         * @var {Object}
         */
        views: {
            value: null,
            enumerable: true,
            configurable: true,
            writable: true
        }
    });

    /**
     * creates a view
     *
     * @param {String} key
     * @param {Object} config
     * @param {Function} config.constructor
     * @returns {View}
     */
    View.prototype.createView = function (key, config) {
        console.debug('Creating view "' + key + '" for layout.');

        // möpe... view exists...
        if (this.views[key] !== undefined) {
            throw new Error('View with key "' + key + '" already exists in layout.');
        }

        // create only if enabled
        if (config.enabled === false) {
            console.debug('Creating view "' + key + '" aborted for layout. View is disabled.');
            return;
        }

        // create the view
        this.views[key] = new config.constructor(config.options);

        // render sub view if layout was rendered. this is required, because the view factory uses requirejs
        // to get the view. the requirejs call can be async
        if (this.rendered === true && config.render !== false) {
            this.renderView(key);
        }

        console.debug('View "' + key + '" created for layout.');

        return this.views[key];
    };

    /**
     * @callback ExtractViewConstructorCallback
     * @param {Function} constructor
     */
    /**
     *
     * @param {Function} constructor
     * @param {ExtractViewConstructorCallback} callback
     * @return {View}
     */
    View.prototype.extractViewConstructor = function (constructor, callback) {
        callback(constructor);

        return this;
    };

    /**
     * returns the template as template function
     * @param {String|Function} [template]
     * @returns {Function}
     */
    View.prototype.getTemplate = function (template) {
        template = template !== undefined ? template : this.template;
        template = template || '';

        if (template instanceof Function) {
            return template;
        }

        return lodash.template(template);
    };

    /**
     * returns the template rendered with template data as HTML
     *
     * @param {String|Function} [template]
     * @returns {String}
     */
    View.prototype.getTemplateAsHtmlForRender = function (template) {
        if (template === null) {
            return null;
        }

        template = this.getTemplate(template);
        return template(this.getTemplateDataForRender());
    };

    /**
     * defines the data for the template during the rendering
     *
     * @return {Object}
     */
    View.prototype.getTemplateDataForRender = function () {
        return {
            view: this,
            View: View
        };
    };

    /**
     *
     * @param  {Object} options
     * @returns {View}
     */
    View.prototype.initialize = function (options) {
        var self = this;

        // config structure convert and set defaults
        this.config = lodash.mapValues(this.config, function (config) {
            // structure convert if string
            if (typeof config !== 'object') {
                config = {
                    view: config
                };
            }

            // set defaults on config
            config = lodash.defaults(config, {
                enabled: true
            });

            // set required configs
            config.options = Object.assign(config.options || {}, {
                // disable auto rendering
                renderOnInitialize: false,

                // define the layout for the child view
                layout: self
            });

            return config;
        });

        // render this view, if the view will be created
        if (this.renderOnInitialize === true) {
            this.render();
        }

        BackboneView.prototype.initialize.apply(this, arguments);

        return this;
    };

    /**
     *
     * @returns {View}
     */
    View.prototype.remove = function () {
        // remove instances of views
        lodash.forEach(this.views, function (view, key) {
            view.remove();
            console.debug('View "' + key + '" removed for layout.');
        });
        this.views = {};

        BackboneView.prototype.remove.apply(this, arguments);

        console.debug(this.name, '(' + this.cid + ') removed.');

        return this;
    };

    /**
     * this change the reaction of view remove. Backbone removes the complete element. Including the container
     * but we do not want to remove the container. Just make it empty.
     *
     * @return {View}
     */
    View.prototype._removeElement = function () {
        this.rendered = false;

        this.removeElementFromDom();

        // this is very important to remove all DOM Elements!!!
        this.undelegateEvents();

        return this;
    };

    /**
     * this change the reaction of view remove. Backbone removes the complete element. Including the container
     * but we do not want to remove the container. Just make it empty.
     *
     * @return {View}
     */
    View.prototype.removeElementFromDom = function () {
        switch (this.templateInsertType) {
            case View.TEMPLATE_INSERT_TYPE_APPEND:
            case View.TEMPLATE_INSERT_TYPE_PREPEND:
            case View.TEMPLATE_INSERT_TYPE_BEFORE:
                this.$el.remove();
                break;

            case View.TEMPLATE_INSERT_TYPE_REPLACE:
            default:
                this.$el.html('');
                break;
        }

        return this;
    };

    /**
     * renders a view by key
     * @param {String} key
     * @return {View}
     */
    View.prototype.removeView = function (key) {
        if (this.views[key] === undefined) {
            throw new Error('Can not find the view "' + key + '" to render for layout.');
        }

        this.views[key].remove();
        this.views[key] = undefined;
        this.views[key] = this.createView(key, Object.assign(this.config[key], {
            renderOnInitialize: false
        }));

        return this;
    };

    /**
     * renders the template into the element
     *
     * @returns {View}
     */
    View.prototype.render = function () {
        this.renderInsert()
            .renderConfig();

        return this;
    };

    /**
     *
     * @return {View}
     */
    View.prototype.renderConfig = function () {
        var self          = this;
        var counterLoaded = 0;
        var counter       = 0;
        var viewsRendered = false;

        // create all sub views in rendering. it can be that the sub view
        // requires some elements by the el option, which is availabe AFTER
        // rendering of the layout
        counter = lodash.reduce(this.config, function (acc, config, key) {
            // note: this call for the factory can be async by requirejs
            self.extractViewConstructor(config.view, function (constructor) {
                counterLoaded++;
                config.constructor = constructor;

                if (counter > 0 && counter === counterLoaded && viewsRendered === false) {
                    viewsRendered = true;
                    lodash.forEach(self.config, function (config, key) {
                        self.createView(key, config);
                    });
                }
            });

            return acc + 1;
        }, counter);

        if (counter > 0 && counter === counterLoaded && viewsRendered === false) {
            lodash.forEach(this.config, function (config, key) {
                self.createView(key, config);
            });
        }

        return this;
    };

    /**
     * @return {View}
     */
    View.prototype.renderInsert = function () {
        var element;

        this.rendered = true;

        var html = this.getTemplateAsHtmlForRender();
        if (html === '') {
            return this;
        }

        switch (this.templateInsertType) {
            case View.TEMPLATE_INSERT_TYPE_APPEND:
                element = jQuery(html);
                this.$el.append(element);
                this.setElement(element);
                break;

            case View.TEMPLATE_INSERT_TYPE_PREPEND:
                element = jQuery(html);
                this.$el.prepend(element);
                this.setElement(element);
                break;

            case View.TEMPLATE_INSERT_TYPE_BEFORE:
                element = jQuery(html);
                this.$el.before(element);
                this.setElement(element);
                break;

            case View.TEMPLATE_INSERT_TYPE_AFTER:
                element = jQuery(html);
                this.$el.after(element);
                this.setElement(element);
                break;

            case View.TEMPLATE_INSERT_TYPE_REPLACE:
            default:
                this.$el.html(html);
        }

        return this;
    };

    /**
     * renders a view by key
     * @param {String} key
     * @return {View}
     */
    View.prototype.renderView = function (key) {
        if (this.views[key] === undefined) {
            throw new Error('Can not find the view "' + key + '" to render for layout.');
        }

        console.debug('Start rendering of view "' + key + '" for layout.');

        this.views[key].render();

        console.debug('View "' + key + '" rendered for layout.');

        return this;
    };

    return compatibility(View);
}));
