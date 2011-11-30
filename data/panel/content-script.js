/*global self: false, $: false */

'use strict';

var $scripts = $('#scripts'),
    $nav = $('#nav'),
    $analyse = $('#analyse'),
    $results = $('#results'),
    activePage = {};



// Load list of scripts into the scripts tab
self.port.on('scripts-load', function (scripts) {
    $scripts.html('script-row', {scripts: scripts});
});

// Emit event script's enable/disable checkbox is changed
$scripts.delegate('input', 'change', function () {
    var $this = $(this);
    self.port.emit('script-change', $this.val(), $this.is(':checked'));
});

$results.delegate('.result header', 'click', function(){
    $(this).parent().toggleClass('open');
});



var Pages = {
    change: function(pageId) {
        var navItem = $nav.find('li[data-id=\'' + pageId + '\']');

        if (activePage.navItem !== navItem) {
            activePage.navItem.removeClass('active');
            activePage.page.hide();

            activePage.navItem = navItem.addClass('active');
            activePage.page = $('#' + pageId).show();
        }
    }
}

// Show the initial page
activePage.navItem = $nav.find('li:first-child').addClass('active');
activePage.page = $('#' + activePage.navItem.data('id')).show();


// Change the active page when a menu item is clicked
$nav.delegate('li', 'click', function () {
    Pages.change($(this).data('id'));
});



var Analyse = {
    start: function () {
        var scripts = [];

        // Get all the enabled scripts
        $scripts.find('input').each(function () {
            var $this = $(this);
            if ($this.is(':checked')) {
                scripts.push($this.val());
            }
        });

        if (scripts.length > 0) {
            $analyse.attr('disabled', 'disabled');
            $analyse.text('Analysing');
            $results.text('');
            self.port.emit('analysis-start', scripts);
        } else {
            $results.text('No results');
        }

        Pages.change('results');
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

// Start the analysis if it was triggered from a different UI component
self.port.on('analysis-start', function (content) {
    Analyse.start();
});

// Display each analysis result as it's ready
self.port.on('analysis-result', function (result) {
    $results.append('result-row', result);
});

// Update UI when analysis is complete
self.port.on('analysis-complete', function () {
    Analyse.stop();
});