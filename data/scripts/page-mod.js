/*global self: false */

'use strict';

var scripts = document.querySelectorAll('script'),
    scriptUrls = [],
    i = 0,
    length = 0;

length = scripts.length;
for (i = 0; i < length; i += 1) {
    if (scripts[i].hasAttribute('src')) {
        scriptUrls.push(scripts[i].getAttribute('src'));
    }
}

self.postMessage(scriptUrls);