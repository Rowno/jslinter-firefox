const widgets = require('widget'),
      data = require('self').data,
      panels = require('panel'),
      tabs = require('tabs'),
      url = require('url');

var widget = widgets.Widget({
    id: 'jslinter-widget',
    label: 'JSLinter',
    contentURL: data.url('icon.png'),
    contentScriptWhen: 'ready',
    contentScriptFile: data.url('widget/content-script.js')
});

widget.port.on('left-click', function () {
    var worker = tabs.activeTab.attach({
        contentScriptFile: data.url('parser.js'),
        onMessage: function (scriptUrls) {
            var i = 0,
                length = 0;
            
            length = scriptUrls.length;
            for (i = 0; i < length; i += 1) {
                scriptUrls[i] = url.resolve(worker.tab.url, scriptUrls[i]);
            }

            panel.postMessage(scriptUrls);
            
            worker.destroy();
        }
    });
    
    panel.show();
});

widget.port.on('right-click', function () {
    console.log('right-click');
});


var panel = panels.Panel({
    width: 600,
    height: 300,
    contentURL: data.url('panel/panel.html'),
    contentScriptFile: data.url('panel/content-script.js'),
    onShow: function () {
        
    }
});