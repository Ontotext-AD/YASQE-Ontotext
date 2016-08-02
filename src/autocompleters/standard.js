/**
 * Auto completes standard sparql functions
 */
module.exports = function (yasqe, completerName) {
    return {
        /**
         * Check whether the cursor is in a proper position for this autocompletion.
         * 
         * @property autocompletions.variableNames.isValidCompletionPosition
         * @type function
         * @param yasqe {doc}
         * @return boolean
         */
        isValidCompletionPosition: function () {
            var token = yasqe.getTokenAt(yasqe.getCursor());
            if (token.type != "ws") {
                token = yasqe.getCompleteToken();
                if (token.string.length > 1) {
                    return true;
                }
            }
            return false;
        },
        /**
         * Get the autocompletions. Either a function which returns an
         * array, or an actual array. The array should be in the form ["http://...",....]
         * 
         * @property autocompletions.variableNames.get
         * @type function|array
         * @param doc {YASQE}
         * @param token {object|string} When bulk is disabled, use this token to autocomplete
         * @param completionType {string} what type of autocompletion we try to attempt. Classes, properties, or prefixes)
         * @param callback {function} In case async is enabled, use this callback
         * @default function (YASQE.autocompleteVariables)
         */
        get: function (token, callback) {
            //Taken from http://www.w3.org/TR/sparql11-query/#grammar BuiltInCall
            var functions = ['COUNT', 'SUM', 'MIN', 'MAX', 'AVG', 'SAMPLE', 'STR', 'LANG', 'LANGMATCHES', 'DATATYPE', 'BOUND', 'IRI', 'URI',
                'BNODE', 'RAND', 'ABS', 'CEIL', 'FLOOR', 'ROUND', 'CONCAT', 'SUBSTR', 'STRLEN', 'REPLACE', 'UCASE', 'LCASE', 'ENCODE_FOR_URI',
                'CONTAINS', 'STRSTARTS', 'STRENDS', 'STRBEFORE', 'STRAFTER', 'YEAR', 'MONTH', 'DAY', 'HOURS', 'MINUTES', 'SECONDS', 'TIMEZONE',
                'TZ', 'NOW', 'UUID', 'STRUUID', 'MD5', 'SHA1', 'SHA256', 'SHA384', 'SHA512', 'COALESCE', 'IF', 'STRLANG', 'STRDT', 'sameTerm',
                'isIRI', 'isURI', 'isBLANK', 'isLITERAL', 'isNUMERIC', 'REGEX', 'EXISTS', 'FILTER'
            ];

            var result = [];
            for (var i = 0; i < functions.length; i++) {
                var f = functions[i];
                var lowercasedF = f.toLowerCase();
                var lowercasedToken = token.toLowerCase();
                if (lowercasedF.indexOf(lowercasedToken) !== 0) {
                    continue;
                }
                result.push(f + '(');
            }
            result.sort();
            return result;
        },

        /**
         * Preprocesses the codemirror token before matching it with our autocompletions list.
         * Use this for e.g. autocompleting prefixed resources when your autocompletion list contains only full-length URIs
         * I.e., foaf:name -> http://xmlns.com/foaf/0.1/name
         * 
         * @property autocompletions.variableNames.preProcessToken
         * @type function
         * @param doc {YASQE}
         * @param token {object} The CodeMirror token, including the position of this token in the query, as well as the actual string
         * @return token {object} Return the same token (possibly with more data added to it, which you can use in the postProcessing step)
         * @default null
         */
        preProcessToken: null,
        /**
         * Postprocesses the autocompletion suggestion.
         * Use this for e.g. returning a prefixed URI based on a full-length URI suggestion
         * I.e., http://xmlns.com/foaf/0.1/name -> foaf:name
         * 
         * @property autocompletions.variableNames.postProcessToken
         * @type function
         * @param doc {YASQE}
         * @param token {object} The CodeMirror token, including the position of this token in the query, as well as the actual string
         * @param suggestion {string} The suggestion which you are post processing
         * @return post-processed suggestion {string}
         * @default null
         */
        postProcessToken: null,
        /**
         * The get function is asynchronous
         * 
         * @property autocompletions.variableNames.async
         * @type boolean
         * @default false
         */
        async: false,
        /**
         * Use bulk loading of variableNames: all variable names are retrieved
         * onLoad using the get() function. Alternatively, disable bulk
         * loading, to call the get() function whenever a token needs
         * autocompletion (in this case, the completion token is passed on
         * to the get() function) whenever you have an autocompletion list that is static, and 
         * that easily fits in memory, we advice you to enable bulk for
         * performance reasons (especially as we store the autocompletions
         * in a trie)
         * 
         * @property autocompletions.variableNames.bulk
         * @type boolean
         * @default false
         */
        bulk: false,
        /**
         * Auto-show the autocompletion dialog. Disabling this requires the
         * user to press [ctrl|cmd]-space to summon the dialog. Note: this
         * only works when completions are not fetched asynchronously
         * 
         * @property autocompletions.variableNames.autoShow
         * @type boolean
         * @default false
         */
        autoShow: true,
        /**
         * Automatically store autocompletions in localstorage. This is
         * particularly useful when the get() function is an expensive ajax
         * call. Autocompletions are stored for a period of a month. Set
         * this property to null (or remove it), to disable the use of
         * localstorage. Otherwise, set a string value (or a function
         * returning a string val), returning the key in which to store the
         * data Note: this feature only works combined with completions
         * loaded in memory (i.e. bulk: true)
         * 
         * @property autocompletions.variableNames.persistent
         * @type string|function
         * @default null
         */
        persistent: null,
        /**
         * A set of handlers. Most, taken from the CodeMirror showhint
         * plugin: http://codemirror.net/doc/manual.html#addon_show-hint
         * 
         * @property autocompletions.variableNames.handlers
         * @type object
         */
        handlers: {
            /**
             * Fires when a codemirror change occurs in a position where we
             * can show this particular type of autocompletion
             * 
             * @property autocompletions.variableNames.handlers.validPosition
             * @type function
             * @default null
             */
            validPosition: null,
            /**
             * Fires when a codemirror change occurs in a position where we
             * can -not- show this particular type of autocompletion
             * 
             * @property autocompletions.variableNames.handlers.invalidPosition
             * @type function
             * @default null
             */
            invalidPosition: null,
            /**
             * See http://codemirror.net/doc/manual.html#addon_show-hint
             * 
             * @property autocompletions.variableNames.handlers.shown
             * @type function
             * @default null
             */
            shown: null,
            /**
             * See http://codemirror.net/doc/manual.html#addon_show-hint
             * 
             * @property autocompletions.variableNames.handlers.select
             * @type function
             * @default null
             */
            select: null,
            /**
             * See http://codemirror.net/doc/manual.html#addon_show-hint
             * 
             * @property autocompletions.variableNames.handlers.pick
             * @type function
             * @default null
             */
            pick: null,
            /**
             * See http://codemirror.net/doc/manual.html#addon_show-hint
             * 
             * @property autocompletions.variableNames.handlers.close
             * @type function
             * @default null
             */
            close: null,
        }
    };
};
