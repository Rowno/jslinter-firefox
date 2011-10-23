'use strict';

var data = require('self').data,
    url = require('url'),
    ss = require('simple-storage'),
    notifications = require('notifications'),
    EventEmitter = require('events').EventEmitter,
    Trait = require('traits').Trait,
    Request = require('request').Request,
    jslint = require('jslint').jslint;


if (!ss.storage.disabledScripts) {
    ss.storage.disabledScripts = {};
}

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

    get isEnabled() {
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
                that._emit('analysis-complete', jslint(response.text));
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

                that._emit('message', scripts);

                worker.destroy();
            }
        });
    }
});