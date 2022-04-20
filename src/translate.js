const bundle = {
    "en": require('./i18n/locale-en'),
    "fr": require('./i18n/locale-fr')
};
const DEFAULT_LANG = 'en';
var currentLang = DEFAULT_LANG;

var translate = function (key) {
    const selectedLang = currentLang;
    if (!bundle || !bundle[selectedLang]) {
        console.warn('Missing locale file for [' + selectedLang + ']');
        return key;
    }

    let translation = bundle[selectedLang][key];
    if (!translation) {
        // Fallback to English
        translation = bundle[DEFAULT_LANG][key];
    }
    return translation;
};

function init(yasqe) {
    yasqe.on("language-changed", function () {
        currentLang = yasqe.options.locale;
    });

    if (yasqe.options.locale) {
        currentLang = yasqe.options.locale;
    }
    return translate;
}

module.exports = init;