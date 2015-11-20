'use strict';
var $ = require('jquery');
var utils = require('./utils');
module.exports = function(yasqe, name) {
	return {
		isValidCompletionPosition : function(){return module.exports.isValidCompletionPosition(yasqe);},
		get : function(token, callback) {
			return module.exports.fetchAutocomplete(yasqe, token, callback);
		},
		preProcessToken: function(token) {return module.exports.preProcessToken(yasqe, token)},
		postProcessToken: function(token, suggestedString) {return module.exports.postProcessToken(yasqe, token, suggestedString);},
		async : true,
		bulk : false,
		autoShow : false,
		persistent : name,
		callbacks : {
			validPosition : yasqe.autocompleters.notifications.show,
			invalidPosition : yasqe.autocompleters.notifications.hide,
		}
	}
};

module.exports.fetchAutocomplete = function(yasqe, token, callback) {
	if (!token || !token.string || token.string.trim().length == 0) {
		return false;
	}
	var query;
	if (token.tokenPrefix) {
		query = token.tokenPrefixUri + ";" + token.string.substring(token.tokenPrefix.length);
	} else {
		if (token.autocompletionString.startsWith('http://')) {
			query = token.autocompletionString + ";"
		} else {
			query = token.autocompletionString;
		}
	}
	utils.setupHeaders(backendRepositoryID);
	$.get('rest/autocomplete/query', {q: query}, function(data) {
		callback(data);
	},'json');
}

module.exports.isValidCompletionPosition = function(yasqe) {
	var token = yasqe.getCompleteToken();
	if (token.string.length == 0) 
		return false; //we want -something- to autocomplete
	if (token.string.indexOf("?") == 0)
		return false; // we are typing a var
	return true;
};
module.exports.preProcessToken = function(yasqe, token) {
	return require('./utils.js').preprocessResourceTokenForCompletion(yasqe, token);
};
module.exports.postProcessToken = function(yasqe, token, suggestedString) {
	return require('./utils.js').postprocessResourceTokenForCompletion(yasqe, token, suggestedString)
};