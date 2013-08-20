// v0.0.0

// ==========================================
// Copyright 2013 Dataminr
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

define([
	'underscore',
	'backbone'
], function(_, Backbone) {

	var noBind = [
		'on',
		'trigger',
		'off',
		'onEvent',
		'select',
		'getSelectedCollection',
		'deselect',
		'getSelected',
		'getSelectedIndices'
	];

	var proto = {
		onEvent: function(type, data) {
			this.selected = _.filter(this.selected, function(model) {
				return _.contains(this.models, model);
			}, this);
			this.selectedCollection.set(this.selected);
			this.trigger(type, data);
		},
		select: function(select) {
			if (select == null) {
				return this.select(this.models);
			}
			if (_.isArray(select)) {
				return _.each(select, this.select, this);
			}
			if (_.isNumber(select)) {
				return this.select(this.models[select])
			}
			if (_.contains(this.selected, select)) {
				return;
			}

			this.selected = _.union(this.selected, [select]);
			if (this.singleSelect) {
				_.each(this.selected, function(model) {
					if (model != select)
						this.deselect(model);
				}, this);
			}
			this.selectedCollection.set(this.selected);
			this.trigger('select', select);
		},
		getSelectedCollection: function() {
			return this.selectedCollection;
		},
		deselect: function(select) {
			if (select == null) {
				return this.deselect(this.getSelected())
			}
			if (_.isArray(select)) {
				return _.each(select, this.deselect, this);
			}
			if (_.isNumber(select)) {
				return this.deselect(this.models[select])
			}

			if (!_.contains(this.selected, select)) {
				return;
			}

			this.selected = _.without(this.selected, select);
			this.selectedCollection.set(this.selected);
			this.trigger('deselect', select);
		},
		getSelected: function() {
			return this.selected.slice(0);
		},
		getSelectedIndices: function() {
			return _.map(this.selected, function(model) {
				this.models.indexOf(model);
			}, this);
		}
	};

	/**
	 * will give back a function that will bind only called in a specific context
	 * @param  {Function} fn original function
	 * @param  {Object} bindee context to bind to
	 * @param  {Object} binder if called with this context then will bind
	 * @return {Function}
	 */
	var bindIf = function(that, fn, bindee) {
		var getFn = function() {
			var proto = Object.getPrototypeOf(that);
			while (proto && !proto[fn]) {
				proto = Object.getPrototypeOf(proto);
			}
			return proto && proto[fn];
		};
		return function() {
			return getFn().apply((
				this == that ?
					bindee :
					this), [].slice.call(arguments));
		};
	};

	Backbone.SelectableCollection = function(collection, options) {
		options = _.extend({}, options);

		var leaveBind = _.union(noBind, options.noBind);

		var Selectable = function() {};
		Selectable.prototype = collection;
		var selectable = new Selectable();
		selectable.collection = collection;
		selectable.selected = [];
		selectable.selectedCollection = new Backbone.Collection();
		_.extend(selectable, proto);
		selectable._callbacks = {};
		selectable._boundFns = [];

		// bind functions from parent
		for (var name in collection) {
			if (proto[name] === undefined &&
					!_.contains(leaveBind, name) &&
					_.isFunction(collection[name])) {
				selectable._boundFns.push(name);
				selectable[name] = bindIf(selectable, name, collection);
			}
		}
		selectable._events = {};

		collection.on('all', selectable.onEvent_, selectable);

		if (options.select)
			selectable.select(options.select);
		selectable.singleSelect = options.single;

		return selectable;
	};

	return Backbone.SelectableCollection;

});