[![NPM](https://img.shields.io/npm/v/yasgui-yasqe.svg)](https://www.npmjs.org/package/yasgui-yasqe)
[![Bower](https://img.shields.io/bower/v/yasgui-yasqe.svg)](https://github.com/YASGUI/YASQE)

# YASQE
YASQE (Yet Another SPARQL Query Editor) is part of the the YASGUI tool. For more information about 
YASQE, its features, and how to include it in your web site, visit http://yasqe.yasgui.org

## Developing YASQE


Feel free to fork and develop this tool. If you have anything to contribute, submit a pull request.
To develop this tool locally, I'd advice to use the following procedure:

* Make sure npm and gulp are installed or use local gulp as bellow, gulp need to be version 3.x.x, 
errors may occur with with gulp 4 or higher
* It's recommended to use nodejs v.6.11.0 for the following steps. The easiest way to get it is to 
install the [Node version manager (nvm)](https://github.com/nvm-sh/nvm) and then install required 
node version `nvm install 6.11.0`.
* Run `npm install` from the base dir to install needed dependencies.
> Run with `LIBSASS_EXT="no" npm install` if you have gulp-sass error!
* Run `./node_modules/gulp/bin/gulp.js` to create packages

## Internationalization

YASR and YASQE are used internally in the GraphDB workbench application. It should provide a `locale`
configuration during the initialization of either of them. The provided `locale` is used to resolve 
translations for any message or label in both libraries.

The default locale is `en`. It'll be used if no locale is provided during initialization. 

### Add new localisation file

* Do a clone of one of the available localisations in the `src/i18n` folder and translate all
messages.
* Import the new localisation file in `src/translate.js` service like this:
```javascript
const bundle = {
    "en": require('./i18n/locale-en'),
    "fr": require('./i18n/locale-fr')
};
```
* That's it. After the library is built and rendered, the new localisation will be present.