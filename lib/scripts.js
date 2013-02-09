/*global require: false */
/*jslint es5: true, nomen: true */

'use strict';

var data = require('self').data,
    ss = require('simple-storage'),
    notifications = require('notifications'),
    EventEmitter = require('events').EventEmitter,
    Request = require('request').Request,
    options = require('./options'),
    url = require('./url'),
    JSLINT = require('./jslint');



if (!ss.storage.disabledScripts) {
    ss.storage.disabledScripts = {};
}



// Clear script preferences when over quota
ss.on('OverQuota', function () {
    delete ss.storage.disabledScripts;

    notifications.notify({
        title: 'JSLinter',
        text: 'Script preferences were reset due to over quota limit'
    });
});



/**
 * Encapsulates a single script.
 *
 * @param {string} scriptUrl Absolute url to the script.
 */
var Script = EventEmitter.compose({
    constructor: function Script(scriptUrl) {
        this._url = url.parse(scriptUrl);
        this._errors = [];
        this._reports = {};

        var pathname = url.parse(scriptUrl).pathname,
            filename = pathname.substring(pathname.lastIndexOf('/') + 1, pathname.length);

        this._url.filename = filename === '' ? pathname : filename;
    },

    /**
     * Object containing the different portions of the script's url.
     *
     * The object contains the following properties:
     *   filename: The 'filename' portion of the URL.
     *   href: The full URL that was originally parsed. Both the protocol and host are lowercased.
     *   protocol: The request protocol, lowercased.
     *   host: The full lowercased host portion of the URL, including port and authentication information.
     *   auth: The authentication information portion of a URL.
     *   hostname: Just the lowercased hostname portion of the host.
     *   port: The port number portion of the host.
     *   pathname: The path section of the URL, that comes after the host and before the query, including the initial slash if present.
     *   search: The 'query string' portion of the URL, including the leading question mark.
     *   path: Concatenation of pathname and search.
     *   query: The 'params' portion of the query string.
     *   hash: The 'fragment' portion of the URL including the pound-sign.
     */
    get url() {
        return this._url;
    },

    /**
     * Array of errors found by JSLint.
     */
    get errors() {
        return this._errors;
    },

    /**
     * HTML reports of the JSLint analysis results.
     */
    get reports() {
        return this._reports;
    },

    /**
     * Boolean indicating that the script is enabled.
     */
    get enabled() {
        return !ss.storage.disabledScripts[this._url.href];
    },

    /**
     * Enables the script.
     */
    enable: function enable() {
        delete ss.storage.disabledScripts[this._url.href];
    },

    /**
     * Disables the script.
     */
    disable: function disable() {
        ss.storage.disabledScripts[this._url.href] = true;
    },

    /**
     * Runs JSLint analysis on the script. A 'complete' event is emitted when the analysis is complete.
     */
    analyse: function () {
        var that = this;

        Request({
            url: that._url.href,
            onComplete: function (response) {
                var allOptions = options.getOptions(),
                    data;

                // Convert predef to an array for JSLint.
                if (allOptions.predef) {
                    allOptions.predef = allOptions.predef.split(/ *,+ */);
                }

                JSLINT(response.text, allOptions);
                data = JSLINT.data();

                that._errors = JSLINT.errors;
                that._reports = {
                    errors: JSLINT.error_report(data),
                    functions: JSLINT.report(data),
                    properties: JSLINT.properties_report(JSLINT.property)
                };

                that._emit('complete');
            }
        }).get();
    }
});
exports.Script = Script;



/**
 * Gets all the scripts on a given tab. A 'complete' event is emitted which is passed an array of Script's.
 *
 * @param {Tab} tab
 */
exports.Scripts = EventEmitter.compose({
    constructor: function Scripts(tab) {
        var that = this,
            worker;

        worker = tab.attach({
            contentScriptFile: data.url('scripts/page-mod.js'),
            onMessage: function (scriptUrls) {
                var scripts = [];

                scriptUrls.forEach(function (value) {
                    scripts.push(new Script(url.resolve(tab.url, value)));
                });

                that._emit('complete', scripts);

                worker.destroy();
            }
        });
    }
});
