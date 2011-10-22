'use strict';

var data = require('self').data,
    url = require('url'),
    EventEmitter = require('events').EventEmitter;

exports.ScriptUrls = EventEmitter.compose({
    constructor: function ScriptUrls(tab) {
        var that = this,
            worker;

        worker = tab.attach({
            contentScriptFile: data.url('scripts/page-mod.js'),
            onMessage: function (scriptUrls) {
                var i = 0,
                    length = 0;

                length = scriptUrls.length;
                for (i = 0; i < length; i += 1) {
                    scriptUrls[i] = url.resolve(tab.url, scriptUrls[i]);
                }

                that._emit('message', scriptUrls);

                worker.destroy();
            }
        });
    }
});