var AppFramework = function (callback) {
    var that = this;
    // [constructor]
    var _confDef = {};
    var _conf = {};
    jQuery.getJSON(AppFramework.URL_CONF + "conf.def.json", function (resDef) {
        _confDef = resDef;
        jQuery.getJSON(AppFramework.URL_CONF + "conf.json", function (res) {
            _conf = jQuery.extend(true, _confDef, res);

            __constructor();

            callback.call(that);
        });
    });


    var __constructor = function () {
        document.title = _conf.appTitle;

        jQuery.getScript(AppFramework.URL_JS + "custom.js")
                .fail(function (jqxhr, settings, exception) {
                    // do nothing
                });
    };


    // [/constructor]

    this.exitApp = function () {
        if (navigator.app) {
            navigator.app.exitApp();
        } else if (navigator.device) {
            navigator.device.exitApp();
        }
    };

    this.showMessage = function (id) {
        jQuery('#' + id + ' .modal-message').hide();
        jQuery('#' + id).show();
        jQuery('#' + id + ' .modal-message').fadeIn('slow');
    };

    this.ready = function () {
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
AppFramework.URL_JS = AppFramework.URL_SRC + "js/";
AppFramework.URL_CONF = AppFramework.URL_ROOT + "conf/";
// alias for constructor
AppFramework.init = function (callback) {
    return new AppFramework(callback);
};
