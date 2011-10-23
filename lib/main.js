'use strict';

var widgets = require('widget'),
    data = require('self').data,
    panels = require('panel'),
    tabs = require('tabs'),
    mustache = require('mustache'),
    scripts = require('scripts');

var panel,
    widget;


panel = panels.Panel({
    width: 600,
    height: 300,
    contentURL: data.url('panel/panel.html'),
    contentScriptFile: [data.url('jquery.js'), data.url('panel/content-script.js')]
});

panel.port.on('script-change', function (url, enabled) {
    var script = scripts.Script(url);
    if (enabled) {
        script.enable();
    } else {
        script.disable();
    }
});

panel.port.on('analysis-start', function (scriptUrls) {
    var numScripts = scriptUrls.length,
        numAnalysed = 0;

    scriptUrls.forEach(function (url) {
        var script = scripts.Script(url);

        script.on('analysis-complete', function (result) {
            numAnalysed += 1;

            panel.port.emit('analysis-result', mustache.to_html(data.load('panel/result-row.mustache'), {
                results: {
                    url: url,
                    result: result
                }
            }));

            if (numScripts == numAnalysed) {
                panel.port.emit('analysis-complete');
            }
        });
        script.analyse();
    });
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