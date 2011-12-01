/*global require: false */
/*jslint es5: true, nomen: true */

'use strict';

var data = require('self').data,
    url = require('url'),
    ss = require('simple-storage'),
    notifications = require('notifications'),
    EventEmitter = require('events').EventEmitter,
    Request = require('request').Request,
    JSLINT = require('jslint');


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


var Script = EventEmitter.compose({
    constructor: function Script(scriptUrl) {
        this._url = url.parse(scriptUrl);
        this._errors = [];
        this._report = '';
        var pathname = url.parse(scriptUrl).pathname;
        this._url.filename = pathname.substring(pathname.lastIndexOf('/') + 1, pathname.length);
    },

    get url() {
        return this._url;
    },

    get errors() {
        return this._errors;
    },

    get report() {
        return this._report;
    },

    get enabled() {
        return !ss.storage.disabledScripts[this._url.href];
    },

    enable: function enable() {
        delete ss.storage.disabledScripts[this._url.href];
    },

    disable: function disable() {
        ss.storage.disabledScripts[this._url.href] = true;
    },

    analyse: function () {
        var that = this;

        Request({
            url: that._url.href,
            onComplete: function (response) {
                // Hack to clone the options object
                var options = JSON.parse(JSON.stringify(ss.storage.options));
                if (options.predef) {
                    options.predef = options.predef.split(/ *,+ */);
                }

                JSLINT(response.text, options);

                that._errors = JSLINT.errors;
                that._report = JSLINT.report();
                that._emit('complete');
            }
        }).get();
    }
});
exports.Script = Script;


exports.Scripts = EventEmitter.compose({
    constructor: function Scripts(tab) {
        var that = this,
            worker;

        worker = tab.attach({
            contentScriptFile: data.url('scripts/page-mod.js'),
            onMessage: function (scriptUrls) {
                var scripts = [];

                scriptUrls.forEach(function (value) {
                    scripts.push(Script(url.resolve(tab.url, value)));
                });

                that._emit('complete', scripts);

                worker.destroy();
            }
        });
    }
});