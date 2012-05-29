/*global self: false, $: false */

(function () {
    'use strict';

    var $scripts = $('#scripts'),
        $analyse = $('#analyse'),
        $results = $('#results'),
        $options = $('#options'),
        $close = $('#close'),
        Tabs,
        Analyse,
        $activeResult = null;



    /***** Load event handlers *****/

    self.port.on('scripts-load', function (scripts) {
        $scripts.html('script-row', {scripts: scripts});
    });

    self.port.on('options-load', function (options) {
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



    /***** Events emitted by the panel *****/

    // Emit an event when a script is enabled/disabled
    $scripts.on('change', 'input', function () {
        var $this = $(this);
        self.port.emit('script-change', $this.val(), $this.is(':checked'));
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



    /***** Result toggle functionality *****/

    function toogleResult($result) {
        var $tab = $result.find('[role="tab"]'),
            $tabPanel = $result.find('[role="tabpanel"]'),
            value;

        value = $tab.attr('aria-selected') !== 'true';

        $tab.attr('aria-selected', value);
        $tabPanel.attr('aria-expanded', value);
    }

    $results.accessibleClick('.result [role="tab"]', function () {
        var $result = $(this).parent();

        if ($activeResult) {
            if ($result.get(0) === $activeResult.get(0)) {
                $activeResult = null;
            } else {
                toogleResult($activeResult);
                $activeResult = $result;
            }
        } else {
            $activeResult = $result;
        }

        toogleResult($result);
    });



    /***** Tabs functionality *****/

    Tabs = (function () {
        var activeTab = {},
            $nav = $('#nav');

        // Show the initial page
        activeTab.tab = $nav.find('li:first-child').attr('aria-selected', true);
        activeTab.content = $('#' + activeTab.tab.attr('aria-controls')).show();

        $nav.accessibleClick('li', function () {
            Tabs.change($(this).attr('aria-controls'));
        });

        return {
            /**
             * Changes the active tab.
             *
             * @param {string} tabId
             */
            change: function (tabId) {
                var navItem = $nav.find('li[aria-controls=\'' + tabId + '\']');

                if (activeTab.tab !== navItem) {
                    activeTab.tab.attr('aria-selected', false);
                    activeTab.content.hide();

                    activeTab.tab = navItem.attr('aria-selected', true);
                    activeTab.content = $('#' + tabId).show();
                }
            }
        };
    }());



    /***** Analyse functionality *****/

    /**
     * Starts the analysis of the currently selected scripts.
     */
    function analyse() {
        var scripts = [];

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

        Tabs.change('results');
    }

    $analyse.on('click', function () {
        analyse();
    });

    // Start the analysis if it was triggered from a different UI component
    self.port.on('analysis-start', function (content) {
        analyse();
    });

    self.port.on('analysis-result', function (result) {
        $results.append('result-row', result);
    });

    self.port.on('analysis-complete', function () {
        $analyse.removeAttr('disabled');
        $analyse.text('Analyse');
    });
}());
