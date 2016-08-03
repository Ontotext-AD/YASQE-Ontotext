'use strict';
var $ = require('jquery'),
	utils = require('./utils.js'),
	YASQE = require('./main.js');

YASQE.executeQuery = function (yasqe, callbackOrConfig) {

	function getCookie(cname) {
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') c = c.substring(1);
			if (c.indexOf(name) == 0) return decodeURIComponent(c.substring(name.length, c.length));
		}
		return "";
	}

	// TODO: find a way to get this from the security module in angular
	var port = window.location.port;
	if (!port) {
		if (window.location.protocol == 'https:') {
			port = "443";
		}
		else {
			port = "80";
		}
	}
	var graphDBAuth = utils.getCookie('com.ontotext.graphdb.auth' + port);
	if (graphDBAuth != '') {
		$.ajaxSetup({
			headers: {
				'X-AUTH-TOKEN': graphDBAuth
			}
		});
	}
};

YASQE.getAjaxConfig = function (yasqe, callbackOrConfig) {
	var callback = (typeof callbackOrConfig == "function" ? callbackOrConfig : null);
	var config = (typeof callbackOrConfig == "object" ? callbackOrConfig : {});

	if (yasqe.options.sparql)
		config = $.extend({}, yasqe.options.sparql, config);

	//for backwards compatability, make sure we copy sparql handlers to sparql callbacks
	if (config.handlers)
		$.extend(true, config.callbacks, config.handlers);


	if (!config.endpoint || config.endpoint.length == 0)
		return; // nothing to query!

	/**
	 * initialize ajax config
	 */
	var ajaxConfig = {
		url: (typeof config.endpoint == "function" ? config.endpoint(yasqe) : config.endpoint),
		type: (typeof config.requestMethod == "function" ? config.requestMethod(yasqe) : config.requestMethod),
		headers: {
			Accept: getAcceptHeader(yasqe, config),
		}
	};
	if (config.xhrFields) ajaxConfig.xhrFields = config.xhrFields;
	/**
	 * add complete, beforesend, etc callbacks (if specified)
	 */
	var handlerDefined = false;
	if (config.callbacks) {
		for (var handler in config.callbacks) {
			if (config.callbacks[handler]) {
				handlerDefined = true;
				ajaxConfig[handler] = config.callbacks[handler];
			}
		}
	}
	if (ajaxConfig.type === 'GET') {
		//we need to do encoding ourselve, as jquery does not properly encode the url string
		//https://github.com/OpenTriply/YASGUI/issues/75
		var first = true;
		$.each(yasqe.getUrlArguments(config), function (key, val) {
			ajaxConfig.url += (first ? '?' : '&') + val.name + '=' + encodeURIComponent(val.value);
			first = false;
		});
	} else {
		ajaxConfig.data = yasqe.getUrlArguments(config);
		var countAjaxConfig = {};
		$.extend(true, countAjaxConfig, ajaxConfig);
		if (window.editor.getQueryMode() != "update") {
			if (config.callbacks.countCallback && (typeof config.callbacks.countCallback == "function")) {
				countAjaxConfig.data = countAjaxConfig.data.filter(function (o) {
					return o.name != 'offset' && o.name != 'limit';
				});
				countAjaxConfig.data.push({ name: 'count', value: '1' });
				countAjaxConfig.complete = config.callbacks.countCallback;
			}
		}
		if (config.setQueryLimit && (typeof config.setQueryLimit == "function")) {
			ajaxConfig.data.forEach(function (o) {
				if (o.name == "query") {
					o.value = config.setQueryLimit(o.value);
				}
			});
		}
	}
	if (!handlerDefined && !callback)
		return; // ok, we can query, but have no callbacks. just stop now

	// if only callback is passed as arg, add that on as 'onComplete' callback
	if (callback)
		ajaxConfig.complete = callback;



	/**
	 * merge additional request headers
	 */
	if (config.headers && !$.isEmptyObject(config.headers))
		$.extend(ajaxConfig.headers, config.headers);


	var queryStart = new Date();
	var updateYasqe = function () {
		yasqe.lastQueryDuration = new Date() - queryStart;
		YASQE.updateQueryButton(yasqe);
		yasqe.setBackdrop(false);
	};
	var executeCount = function (event, jqXHR, ajaxOptions) {
		window.editor && 200 === event.status && $.ajax(countAjaxConfig);
	};
	//Make sure the query button is updated again on complete
	var completeCallbacks = [
		function () { require('./main.js').signal(yasqe, 'queryFinish', arguments); },
		updateYasqe
	];

	if (ajaxConfig.complete) {
		completeCallbacks.push(ajaxConfig.complete);
		completeCallbacks.push(executeCount);
	}
	ajaxConfig.complete = completeCallbacks;
	return ajaxConfig;
};



YASQE.executeQuery = function (yasqe, callbackOrConfig) {
	YASQE.signal(yasqe, 'query', yasqe, callbackOrConfig);
	YASQE.updateQueryButton(yasqe, "busy");
	yasqe.setBackdrop(true);
	// var config = (typeof callbackOrConfig == "object" ? callbackOrConfig : {});
	// if (config.callbacks.resetResults && (typeof config.callbacks.resetResults == "function")) {
	// 	config.callbacks.resetResults();
	// }
	yasqe.xhr = $.ajax(YASQE.getAjaxConfig(yasqe, callbackOrConfig));
};


YASQE.getUrlArguments = function (yasqe, config) {
	var queryMode = yasqe.getQueryMode();
	var data = [{
		name: utils.getString(yasqe, yasqe.options.sparql.queryName),
		value: (config.getQueryForAjax ? config.getQueryForAjax(yasqe) : yasqe.getValue())
	}];

	/**
	 * add named graphs to ajax config
	 */
	if (config.namedGraphs && config.namedGraphs.length > 0) {
		var argName = (queryMode == "query" ? "named-graph-uri" : "using-named-graph-uri ");
		for (var i = 0; i < config.namedGraphs.length; i++)
			data.push({
				name: argName,
				value: config.namedGraphs[i]
			});
	}
	/**
	 * add default graphs to ajax config
	 */
	if (config.defaultGraphs && config.defaultGraphs.length > 0) {
		var argName = (queryMode == "query" ? "default-graph-uri" : "using-graph-uri ");
		for (var i = 0; i < config.defaultGraphs.length; i++)
			data.push({
				name: argName,
				value: config.defaultGraphs[i]
			});
	}

	/**
	 * add additional request args
	 */
	if (config.args && config.args.length > 0) $.merge(data, config.args);

	return data;
};
var getAcceptHeader = function (yasqe, config) {
	var acceptHeader = null;
	if (config.acceptHeader && !config.acceptHeaderGraph && !config.acceptHeaderSelect && !config.acceptHeaderUpdate) {
		//this is the old config. For backwards compatability, keep supporting it
		if (typeof config.acceptHeader == "function") {
			acceptHeader = config.acceptHeader(yasqe);
		} else {
			acceptHeader = config.acceptHeader;
		}
	} else {
		if (yasqe.getQueryMode() == "update") {
			acceptHeader = (typeof config.acceptHeader == "function" ? config.acceptHeaderUpdate(yasqe) : config.acceptHeaderUpdate);
		} else {
			var qType = yasqe.getQueryType();
			if (qType == "DESCRIBE" || qType == "CONSTRUCT") {
				acceptHeader = (typeof config.acceptHeaderGraph == "function" ? config.acceptHeaderGraph(yasqe) : config.acceptHeaderGraph);
			} else {
				acceptHeader = (typeof config.acceptHeaderSelect == "function" ? config.acceptHeaderSelect(yasqe) : config.acceptHeaderSelect);
			}
		}
	}
	return acceptHeader;
};

module.exports = {
	getAjaxConfig: YASQE.getAjaxConfig
};
