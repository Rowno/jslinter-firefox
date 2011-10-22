'use strict';

var widgets = require('widget'),
    data = require('self').data,
    panels = require('panel'),
    tabs = require('tabs'),
    url = require('url'),
    mustache = require('mustache'),
    scripts = require('scripts');

var panel,
    widget;


panel = panels.Panel({
    width: 600,
    height: 300,
    contentURL: data.url('panel/panel.html'),
    contentScriptFile: [data.url('jquery.js'), data.url('panel/content-script.js')],
    onShow: function () {

    }
});

panel.port.on('script-change', function (url, enabled) {
    var script = scripts.Script(url);
    if (enabled) {
        script.enable();
    } else {
        script.disable();
    }
});


widget = widgets.Widget({
    id: 'jslinter-widget',
    label: 'JSLinter',
    width: 62,
    contentURL: data.url('icon.png'),
    contentScriptWhen: 'ready',
    contentScriptFile: data.url('widget/content-script.js')
});

widget.port.on('left-click', function () {
    var worker = scripts.Scripts(tabs.activeTab);
    worker.on('message', function (scripts) {
        panel.port.emit('scripts', mustache.to_html(data.load('panel/script-row.mustache'), {scripts: scripts}));
    });

    panel.show();
});

widget.port.on('right-click', function () {
    console.log('right-click');
});