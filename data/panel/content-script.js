/*global self: false, $: false */

'use strict';

var $scripts = $('#scripts');

self.port.on('scripts', function (content) {
    $scripts.html(content);
});

$scripts.delegate('input', 'change', function () {
    self.port.emit('script-change', $(this).val(), $(this).is(':checked'));
});