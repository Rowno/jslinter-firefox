/*global self: false, $: false */

'use strict';

var $scripts = $('#scripts'),
    $nav = $('#nav'),
    activePage = {};

self.port.on('scripts', function (content) {
    $scripts.html(content);
});

$scripts.delegate('input', 'change', function () {
    self.port.emit('script-change', $(this).val(), $(this).is(':checked'));
});


activePage.navItem = $nav.find('li:first-child').addClass('active');
activePage.page = $('#' + activePage.navItem.data('id')).show();

$nav.delegate('li', 'click', function () {
    var $this = $(this);

    activePage.navItem.removeClass('active');
    activePage.page.hide();

    activePage.navItem = $this.addClass('active');
    activePage.page = $('#' + $this.data('id')).show();
});