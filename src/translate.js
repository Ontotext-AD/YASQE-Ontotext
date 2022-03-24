const bundle = {
    "en": require('./i18n/locale-en'),
    "de": require('./i18n/locale-de')
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

function init(lang) {
    if (lang) {
        currentLang = lang;
    }
    return translate;
}

module.exports = init;