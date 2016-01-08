var AppFramework = function () {

    // [constructor]
    var _confDef = jQuery.getJSON(AppFramework.URL_CONF + "conf.def.json");
    var _conf = jQuery.getJSON(AppFramework.URL_CONF + "conf.json");
    _conf = jQuery.extend(true, _conf, _confDef)
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
AppFramework.URL_ROOT = "../../";
AppFramework.URL_CONF = AppFramework.URL_ROOT + "conf/";
