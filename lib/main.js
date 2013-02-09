/*global require: false */

'use strict';

var widgets = require('widget'),
    data = require('self').data,
    panels = require('panel'),
    tabs = require('tabs'),
    Hotkey = require('hotkeys').Hotkey,
    scripts = require('./scripts'),
    options = require('./options');

var panel,
    widget,
    analysing = false,
    showHotkey,
    analyseHotkey;



/***** Panel *****/

panel = panels.Panel({
    width: 700,
    height: 440,
    contentURL: data.url('panel/panel.html'),
    contentScriptFile: [
        data.url('jquery.js'),
        data.url('jquery.accessible-click.js'),
        data.url('hogan.js'),
        data.url('panel/content-script.js')
    ]
});

panel.port.emit('options-load', options.getOptions());

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
        var script = new scripts.Script(url);

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

panel.port.on('option-change', function (name, value) {
    if (value === '' || value === false) {
        options.setOption(name, null);
    } else {
        options.setOption(name, value);
    }
});

panel.port.on('close', function () {
    panel.hide();
});

function showPanel() {
    var worker = new scripts.Scripts(tabs.activeTab);
    worker.on('complete', function (scripts) {
        panel.port.emit('scripts-load', scripts);
    });

    panel.show();
}

function showPanelAnalyse() {
    var worker = new scripts.Scripts(tabs.activeTab);
    worker.on('complete', function (scripts) {
        panel.port.emit('scripts-load', scripts);
        panel.port.emit('analysis-start');
    });

    panel.show();
}



/***** Widget *****/

widget = widgets.Widget({
    id: 'jslinter-widget',
    label: 'JSLinter',
    contentURL: data.url('icon16.png'),
    contentScriptWhen: 'ready',
    contentScriptFile: data.url('widget/content-script.js')
});

widget.port.on('left-click', showPanel);
widget.port.on('right-click', showPanelAnalyse);



/***** Hotkeys *****/

showHotkey = new Hotkey({
    combo: 'accel-j',
    onPress: showPanel
});

analyseHotkey = new Hotkey({
    combo: 'accel-alt-j',
    onPress: showPanelAnalyse
});
