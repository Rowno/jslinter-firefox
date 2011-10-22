/*global self: false */

'use strict';

self.on('message', function (content) {
    if (content === '') {
        content = 'No scripts on this page';
    }

    document.getElementById('scripts').innerHTML = content;
});