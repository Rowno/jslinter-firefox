'use strict';

var data = require('self').data,
    url = require('url'),
    ss = require('simple-storage'),
    notifications = require('notifications'),
    EventEmitter = require('events').EventEmitter,
    Request = require('request').Request,
    jslint = require('jslint').jslint;


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
    constructor: function Script(url) {
        this._url = url;
        this._errors = [];
    },

    get url() {
        return this._url;
    },

    get enabled() {
        return !ss.storage.disabledScripts[this._url];
    },

    enable: function enable() {
        delete ss.storage.disabledScripts[this._url];
    },

    disable: function disable() {
        ss.storage.disabledScripts[this._url] = true;
    },

    analyse: function () {
        var that = this;

        Request({
            url: that._url,
            onComplete: function (response) {
                jslint(response.text);
                that._emit('complete', jslint.errors.length);
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