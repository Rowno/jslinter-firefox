/*global self: false */

(function (widget) {
    'use strict';

    widget.addEventListener('click', function (event) {
        if (event.button === 0 && event.shiftKey === false) {
            self.port.emit('left-click');
        }

        if (event.button === 2 || (event.button === 0 && event.shiftKey === true)) {
            self.port.emit('right-click');
        }
        event.preventDefault();
    }, true);

    // Prevent the addon bar context menu from showing on right click
    widget.addEventListener('contextmenu', function (event) {
        event.preventDefault();
    }, true);
}(this));