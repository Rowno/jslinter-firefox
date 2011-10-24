/*global self: false, $: false */

'use strict';

var $scripts = $('#scripts'),
    $nav = $('#nav'),
    $analyse = $('#analyse'),
    $results = $('#results'),
    activePage = {};


self.port.on('scripts', function (numScripts, content) {
    if (numScripts === 0) {
        $analyse.attr('disabled', 'disabled');
    } else {
        $analyse.removeAttr('disabled');
    }

    $scripts.html(content);
});

$scripts.delegate('input', 'change', function () {
    var $this = $(this);
    self.port.emit('script-change', $this.val(), $this.is(':checked'));
});


function changePage(pageId) {
    var navItem = $nav.find('li[data-id=\'' + pageId + '\']');

    activePage.navItem.removeClass('active');
    activePage.page.hide();

    activePage.navItem = navItem.addClass('active');
    activePage.page = $('#' + pageId).show();
}

activePage.navItem = $nav.find('li:first-child').addClass('active');
activePage.page = $('#' + activePage.navItem.data('id')).show();


$nav.delegate('li', 'click', function () {
    changePage($(this).data('id'));
});


var Analyse = {
    start: function () {
        var scripts = [];

        $analyse.attr('disabled', 'disabled');
        $analyse.text('Analysing');
        $results.html('');
        changePage('results');

        $scripts.find('input').each(function () {
            var $this = $(this);
            if ($this.is(':checked')) {
                scripts.push($this.val());
            }
        });

        self.port.emit('analysis-start', scripts);
    },

    stop: function () {
        $analyse.removeAttr('disabled');
        $analyse.text('Analyse');
    }
};

$analyse.click(function () {
    $analyse.blur();
    Analyse.start();
});

self.port.on('analysis-start', function (content) {
    Analyse.start();
});

self.port.on('analysis-result', function (content) {
    $results.append(content);
});

self.port.on('analysis-complete', function () {
    Analyse.stop();
});