/*global jQuery: false */

(function ($) {
    'use strict';

    $.fn.accessibleClick = function (selector, data, fn) {

        // Map parent parameters in the same way as .on()
        if (data == null && fn == null) {
            // ( fn )
            fn = selector;
            data = selector = undefined;
        } else if (fn == null) {
            if (typeof selector === 'string') {
                // ( selector, fn )
                fn = data;
                data = undefined;
            } else {
                // ( data, fn )
                fn = data;
                data = selector;
                selector = undefined;
            }
        }

        return this.each(function () {

            $(this).on('click keyup', selector, data, function (event) {
                if (event.type === 'click') {
                    fn.apply(this, arguments);
                } else {
                    if (event.which === 13) {
                        fn.apply(this, arguments);
                        return false; // Jetpack hack for double key events
                    }
                }
            });

        });

    };
}(jQuery));