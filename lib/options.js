/*global require: false, exports: false */

'use strict';

var ss = require('simple-storage');



if (!ss.storage.options) {
    ss.storage.options = {};
}


/**
 * Gets an option.
 *
 * @param {string} name Name of the option.
 * @returns {variable|undefined} A copy of the option's value or undefined if the option doesn't exist.
 */
exports.getOption = function (name) {
    if (ss.storage.options[name] === undefined) {
        return undefined;
    } else {
        // Hack to clone an object
        return JSON.parse(JSON.stringify(ss.storage.options[name]));
    }
};

/**
 * Gets all the set options.
 *
 * @returns {variable} A copy of the set options.
 */
exports.getOptions = function () {
    // Hack to clone an object
    return JSON.parse(JSON.stringify(ss.storage.options));
};

/**
 * Sets an option.
 *
 * @param {string} name Name of the option.
 * @param {variable} value The value the option should be set to. Passing 'null' or 'undefined' deletes the option.
 */
exports.setOption = function (name, value) {
    if (value === null || value === undefined) {
        delete ss.storage.options[name];
    } else {
        ss.storage.options[name] = value;
    }
};