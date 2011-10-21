/*global self: false */

'use strict';

self.on('message', function (renderedScripts) {
    document.getElementById('scripts').innerHTML = renderedScripts;
});