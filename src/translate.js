const bundle = {
    "en": require('./i18n/locale-en'),
    "de": require('./i18n/locale-de')
};
const DEFAULT_LANG = 'en';
var currentLang = DEFAULT_LANG;

var translate = function (key, lang) {
    const selectedLang = lang || currentLang;
    if (!bundle || !bundle[selectedLang]) {
        console.warn('Missing locale file for [' + selectedLang + ']');
        return key;
    }

    const translation = bundle[selectedLang][key];
    if (translation) {
        return translation;
    }
    console.warn('Missing translation for [' + key + '] key in [' + selectedLang + '] locale');
    return key;
};

function init(lang) {
    if (lang) {
        currentLang = lang;
    }
    return translate;
}

module.exports = init;