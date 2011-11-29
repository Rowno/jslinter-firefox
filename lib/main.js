'use strict';

// TODO Comment all code

var widgets = require('widget'),
    data = require('self').data,
    panels = require('panel'),
    tabs = require('tabs'),
    scripts = require('scripts');

var panel,
    widget,
    analysing = false;


panel = panels.Panel({
    width: 700,
    height: 300,
    contentURL: data.url('panel/panel.html'),
    contentScriptFile: [data.url('jquery.js'), data.url('mustache.js'), data.url('panel/content-script.js')]
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

    analysing = true;

    scriptUrls.forEach(function (url) {
        var script = scripts.Script(url);

        script.on('complete', function (result) {
            numAnalysed += 1;

            panel.port.emit('analysis-result', script);

            if (numScripts == numAnalysed) {
                analysing = false
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
    worker.on('complete', function (scripts) {
        panel.port.emit('scripts-load', scripts);
    });

    panel.show();
});

widget.port.on('right-click', function () {
    var worker = scripts.Scripts(tabs.activeTab);
    worker.on('complete', function (scripts) {
        panel.port.emit('scripts-load', scripts);
        panel.port.emit('analysis-start');
    });

    panel.show();
});