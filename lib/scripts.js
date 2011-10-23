'use strict';

var data = require('self').data,
    url = require('url'),
    ss = require('simple-storage'),
    notifications = require('notifications'),
    EventEmitter = require('events').EventEmitter,
    Trait = require('traits').Trait;


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


var Script = Trait.compose({
    constructor: function Script(url) {
        this._url = url;
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
                var i = 0,
                    length = 0,
                    scripts = [];

                length = scriptUrls.length;
                for (i = 0; i < length; i += 1) {
                    scripts.push(Script(url.resolve(tab.url, scriptUrls[i])));
                }

                that._emit('message', scripts);

                worker.destroy();
            }
        });
    }
});