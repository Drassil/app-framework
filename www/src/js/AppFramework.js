"use strict";

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
                __constructor.call(that, callback);
            });

        });
    });


    var __constructor = function (callback) {
        document.title = _conf.appTitle;

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
        var el = jQuery("#" + id);

        var show = function () {
            jQuery('#' + id + ' .modal-message').hide();
            el.show();
            jQuery('#' + id + ' .modal-message').fadeIn('slow');
        };


        if (el.length) {
            // if exists but not visible, do not load again
            if (el.css('display') == 'none') {
                show();
            }

            return;
        }

        jQuery.get(AppFramework.URL_SRC + "html/" + id + ".html", function (data) {
            if (el.length) // double check to avoid concurrency issues
                return;

            jQuery("body").append(data);

            // load lang strings
            if (id == "connection") {
                jQuery("#connection .warning").html(_lang.noConnectionMsg);
                jQuery("#connection .button-reload").html(_lang.noConnectionReloadBtn);
                jQuery("#connection .button-exit").html(_lang.noConnectionExitBtn);
            }

            show();
        });
    };

    this.clearMessage = function (id) {
        jQuery('#' + id).fadeOut("slow");
    };

    this.loadExternal = function (options) {
        var that = this;
        var url = _conf.urlCrossOrigin ? _conf.urlCrossOrigin : _conf.url;

        that.connectionCheckMsg(false);

        document.addEventListener('offline', function () {
            that.connectionCheckMsg(false);
        }, false);

        document.addEventListener('online', function () {
            that.connectionCheckMsg(false);
        }, false);

        if (!_conf.skipAjaxCheck) {
            jQuery.ajax({url: url,
                type: "HEAD",
                timeout: 3000,
                statusCode: {
                    200: function (response) {
                        _loadExternal(options);
                    },
                    400: function (response) {
                        that.showMessage("connection");
                    },
                    0: function (response) {
                        that.showMessage("connection");
                    }
                }
            });
        } else {
            _loadExternal(options);
        }
    };

    this.setMsgListener = function (listenerFn) {
        _msgListener = listenerFn;
    };


    this.setConf = function (key, value) {
        _conf[key] = value;
    };

    this.getConf = function (key) {
        return _conf[key];
    };

    this.connectionCheck = function (force) {
        if (!force && _conf.skipConnCheck)
            return;

        var type = navigator.connection.type;
        return !(type === "none" || type === null || !navigator.onLine);
    };

    this.connectionCheckMsg = function (force) {
        if (!force && _conf.skipConnCheck)
            return;

        if (!this.connectionCheck(force))
            this.showMessage("connection");
        else
            this.clearMessage("connection");
    };


    var _loadExternal = function (options) {

        setInterval(function () {
            that.connectionCheckMsg(false);
        }, 3000);

        switch (_conf.loadType) {
            case "iframe":
                _loadIFrame(options);
                break;
            case "webview":
                window.location.replace(_conf.url, '_self');
                break;
        }
    };

    var _loadIFrame = function (options) {
        options=options || {};
        var ifrm = document.createElement("iframe");
        ifrm.setAttribute("name", "app-iframe");
        ifrm.setAttribute("src", _conf.url);
        ifrm.setAttribute("frameBorder", 0);
        ifrm.setAttribute("id", "app-iframe");

        var childWindow = (ifrm.contentWindow || ifrm.contentDocument);

        $(ifrm).load(function () {
            options.onLoad && options.onLoad(); // called when iframe is fully loaded
        });


        $(childWindow).ready(function () {
            options.onReady && options.onReady();
        });

        $(_conf.iframeTarget).html(ifrm);


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
                else {
                    if (_conf.evalPostMessage) {
                        var result = eval(data);
                        childWindow.postMessage(result, _conf.url);
                    } else {
                        console.log("Received from postMessage: " + data);
                    }
                }
            }, false);
        }, false);
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
