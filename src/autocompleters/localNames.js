'use strict';
var $ = require('jquery');
var authToken;
var repositoryId;
module.exports = function (yasqe, name) {
    yasqe.on("repositoryOrAuthorizationChanged", function (newRepositoryId, newAuthToken) {
        repositoryId = newRepositoryId;
        authToken = newAuthToken;
    });

    return {
        isValidCompletionPosition: function () { return module.exports.isValidCompletionPosition(yasqe); },
        get: function (token, callback) {
            return module.exports.fetchAutocomplete(yasqe, token, callback);
        },
        preProcessToken: function (token) { return module.exports.preProcessToken(yasqe, token); },
        postProcessToken: function (token, suggestedString) { return module.exports.postProcessToken(yasqe, token, suggestedString); },
        async: true,
        bulk: false,
        autoShow: true,
        persistent: name,
        callbacks: {
            validPosition: yasqe.autocompleters.notifications.show,
            invalidPosition: yasqe.autocompleters.notifications.hide
        }
    };
};

module.exports.fetchAutocomplete = function (yasqe, token, callback) {
    if (!repositoryId || repositoryId === 'SYSTEM') {
        return;
    }
    if (!token || !token.string || token.string.trim().length === 0) {
        return false;
    }
    var query;
    if (token.tokenPrefix) {
        query = token.tokenPrefixUri + ";" + token.string.substring(token.tokenPrefix.length);
    } else {
        if (token.autocompletionString.startsWith('http://')) {
            query = token.autocompletionString + ";";
        } else {
            query = token.autocompletionString;
        }
    }
    var headers = {
        'X-GraphDB-Repository': repositoryId
    };
    if (authToken) {
        headers['Authorization'] = authToken;
    }
    $.get({
        url: 'rest/autocomplete/query',
        data: {q: query},
        success: function (data, textStatus, jqXHR) {
            if (204 === jqXHR.status && (!yasqe.fromAutoShow || !data)) {
                yasqe.toastBuildIndex();
            } else {
                callback(data.suggestions);
            }
        },
        dataType: 'json',
        headers: headers
    }).fail(function (data) {
        if (!yasqe.fromAutoShow) {
            yasqe.toastError(data);
        }
    });
};

module.exports.isValidCompletionPosition = function (yasqe) {
    var cur = yasqe.getCursor(), currToken = yasqe.getTokenAt(cur);
    // Do not autocomplete local names in prefix lines
    if (yasqe.getLine(cur.line).toUpperCase().trim().indexOf('PREFIX') == 0) {
        return false;
    }
    var token = yasqe.getCompleteToken();
    if ($.inArray("IRI_REF", token.state.possibleCurrent) == -1)
        return false;
    if (token.string.length == 0)
        return false; //we want -something- to autocomplete
    if (token.string.indexOf("?") == 0)
        return false; // we are typing a var
    return true;
};
module.exports.preProcessToken = function (yasqe, token) {
    return require('./utils.js').preprocessResourceTokenForCompletion(yasqe, token);
};
module.exports.postProcessToken = function (yasqe, token, suggestedString) {
    return require('./utils.js').postprocessResourceTokenForCompletion(yasqe, token, suggestedString);
};
