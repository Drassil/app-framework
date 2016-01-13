var AppFramework = function (callback) {
    var that = this;

    var _confDef = {};
    var _conf = {};
    var _lang = {};
    var _msgListener = null;

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
        } else {
            if (_conf.url) {
                this.loadExternal();
            }
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
        var url = _conf.urlCrossOrigin ? _conf.urlCrossOrigin : _conf.url;
        jQuery.ajax({url: url,
            type: "HEAD",
            timeout: 3000,
            statusCode: {
                200: function (response) {
                    _loadExternal();
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

    this.setMsgListener = function (listenerFn) {
        _msgListener = listenerFn;
    };


    var _loadExternal = function () {
        switch (_conf.loadType) {
            case "iframe":
                _loadIFrame();
                break;
            case "webview":
                window.location.replace(_conf.url, '_self');
                break;
        }
    }

    var _loadIFrame = function () {
        document.addEventListener('deviceready', function () {
            var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
            var eventer = window[eventMethod];
            var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

            // Listen to message from child window
            eventer(messageEvent, function (e) {
                var key = e.message ? "message" : "data";
                var data = e[key];
                //run function//
                if (typeof _msgListener == "function")
                    _msgListener(e, data);
            }, false);
        }, false);


        var ifrm = document.createElement("iframe");
        ifrm.setAttribute("src", _conf.url);
        ifrm.setAttribute("frameBorder", 0);
        ifrm.setAttribute("id", "app-iframe");
        $(_conf.iframeTarget).html(ifrm);
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
