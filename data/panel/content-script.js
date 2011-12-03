/*global self: false, $: false */

(function () {
    'use strict';

    var $scripts = $('#scripts'),
        $nav = $('#nav'),
        $analyse = $('#analyse'),
        $results = $('#results'),
        $options = $('#options'),
        $close = $('#close'),
        activePage = {},
        Pages,
        Analyse;



    // Load list of scripts into the scripts tab
    self.port.on('scripts-load', function (scripts) {
        $scripts.html('script-row', {scripts: scripts});
    });

    // Load set options
    self.port.on('options', function (options) {
        var i, input;

        for (i in options) {
            if (options.hasOwnProperty(i)) {
                input = $options.find('[name="' + i + '"]');

                if (input.is(':checkbox')) {
                    input.attr('checked', 'checked');
                } else {
                    input.val(options[i]);
                }
            }
        }
    });

    // Emit an event when a script's enable/disable checkbox is changed
    $scripts.on('change', 'input', function () {
        var $this = $(this);
        self.port.emit('script-change', $this.val(), $this.is(':checked'));
    });

    // Show/hide a script's analysis report
    $results.accessibleClick('.result [role="tab"]', function () {
        var $this = $(this),
            value;

        value = $this.attr('aria-selected') !== 'true';

        $this.attr('aria-selected', value);
        $this.next().attr('aria-expanded', value);
    });

    // Emit an event when an option is changed
    $options.on('change', 'input', function () {
        var $this = $(this),
            value;

        if ($this.is(':checkbox')) {
            value = $this.is(':checked');
        } else {
            value = $this.val();
        }

        self.port.emit('option-change', $this.attr('name'), value);
    });

    $close.on('click', function () {
        self.port.emit('close');
    });



    Pages = {
        change: function (pageId) {
            var navItem = $nav.find('li[aria-controls=\'' + pageId + '\']');

            if (activePage.navItem !== navItem) {
                activePage.navItem.attr('aria-selected', false);
                activePage.page.hide();

                activePage.navItem = navItem.attr('aria-selected', true);
                activePage.page = $('#' + pageId).show();
            }
        }
    };

    // Show the initial page
    activePage.navItem = $nav.find('li:first-child').attr('aria-selected', true);
    activePage.page = $('#' + activePage.navItem.attr('aria-controls')).show();


    // Change the active page when a menu item is clicked
    $nav.accessibleClick('li', function () {
        Pages.change($(this).attr('aria-controls'));
    });



    Analyse = {
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

    $analyse.on('click', function () {
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
}());