var AppFramework = function (callback) {
    var that = this;

    var _confDef = {};
    var _conf = {};
    var _lang = {};

    // [constructor]
    // [TODO] avoid callback nesting using hwcore framework
    jQuery.getJSON(AppFramework.URL_CONF + "conf.def.json", function (resDef) {
        _confDef = resDef;
        jQuery.getJSON(AppFramework.URL_CONF + "conf.json", function (res) {
            _conf = jQuery.extend(true, _confDef, res);

            var l = navigator.languages instanceof Array && navigator.languages.length > 0 ? navigator.languages[0] : (navigator.language || navigator.userLanguage);

            that.loadLang(l, function () {
                __constructor(callback);
            });

        });
    });


    var __constructor = function (callback) {
        document.title = _conf.appTitle;

        // load lang strings
        jQuery("#connection .warning").html(_lang.noConnectionMsg);
        jQuery("#connection .button-reload").html(_lang.noConnectionReloadBtn);
        jQuery("#connection .button-exit").html(_lang.noConnectionExitBtn);

        if (_conf.customScript) {
            jQuery.getScript(AppFramework.URL_ROOT + _conf.customScript, function () {
                if (typeof callback == "function")
                    callback.call(that);
            }).fail(function (jqxhr, settings, exception) {
                console.log(exception);
            });
        }
    };


    // [/constructor]

    this.exitApp = function () {
        if (navigator.app) {
            navigator.app.exitApp();
        } else if (navigator.device) {
            navigator.device.exitApp();
        }
    };

    this.loadLang = function (lang, cb) {
        var that = this;
        if (!lang)
            lang = "en-GB";

        jQuery.getJSON(AppFramework.URL_DATA + "langs/" + lang + ".json")
            .done(function (res) {
                _lang = res;
                cb && cb();
            })
            .fail(function () {
                if (lang == "en-GB")
                    throw "No language available, check your installation";

                that.loadLang("en-GB", cb);
            });
    };

    this.showMessage = function (id) {
        jQuery('#' + id + ' .modal-message').hide();
        jQuery('#' + id).show();
        jQuery('#' + id + ' .modal-message').fadeIn('slow');
    };

    this.loadExternal = function () {
        var that = this;
        jQuery.ajax({url: _conf.urlCrossOrigin,
            type: "HEAD",
            timeout: 1000,
            statusCode: {
                200: function (response) {
                    window.location.replace(_conf.url, '_self');
                },
                400: function (response) {
                    that.showMessage("connection");
                },
                0: function (response) {
                    that.showMessage("connection");
                }
            }
        });
    };
};


// Static properties
AppFramework.URL_ROOT = "../";
AppFramework.URL_SRC = AppFramework.URL_ROOT + "src/";
AppFramework.URL_MODULES = AppFramework.URL_ROOT + "modules/";
AppFramework.URL_JS = AppFramework.URL_SRC + "js/";
AppFramework.URL_CONF = AppFramework.URL_ROOT + "conf/";
AppFramework.URL_DATA = AppFramework.URL_ROOT + "data/";
// alias for constructor
AppFramework.init = function (callback) {
    return new AppFramework(callback);
};
