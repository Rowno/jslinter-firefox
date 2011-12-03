/*global require: false */

'use strict';

// TODO Comment all code

var widgets = require('widget'),
    data = require('self').data,
    panels = require('panel'),
    tabs = require('tabs'),
    ss = require('simple-storage'),
    scripts = require('scripts'),
    Hotkey = require('hotkeys').Hotkey;

var panel,
    widget,
    analysing = false;


if (!ss.storage.options) {
    ss.storage.options = {};
}



panel = panels.Panel({
    width: 700,
    height: 440,
    contentURL: data.url('panel/panel.html'),
    contentScriptFile: [
        data.url('jquery.js'),
        data.url('jquery.view.ejs.js'),
        data.url('jquery.accessible-click.js'),
        data.url('panel/content-script.js')
    ]
});

panel.port.emit('options', ss.storage.options);

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

            if (numScripts === numAnalysed) {
                analysing = false;
                panel.port.emit('analysis-complete');
            }
        });
        script.analyse();
    });
});

panel.port.on('option-change', function (option, value) {
    if (value === '' || value === false) {
        delete ss.storage.options[option];
    } else {
        ss.storage.options[option] = value;
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



function showPanel() {
    var worker = scripts.Scripts(tabs.activeTab);
    worker.on('complete', function (scripts) {
        panel.port.emit('scripts-load', scripts);
    });

    panel.show();
}

function showPanelAnalyse() {
    var worker = scripts.Scripts(tabs.activeTab);
    worker.on('complete', function (scripts) {
        panel.port.emit('scripts-load', scripts);
        panel.port.emit('analysis-start');
    });

    panel.show();
}

Hotkey({
    combo: 'accel-j',
    onPress: showPanel
});

Hotkey({
    combo: 'accel-alt-j',
    onPress: showPanelAnalyse
});

widget.port.on('left-click', showPanel);
widget.port.on('right-click', showPanelAnalyse);