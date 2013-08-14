[DEPRECATED] JSLinter
=====================

**Deprecated: This addon has been discontinued in favour of in-editor and build tool linting. If you're looking for an alternative, I highly recommend [SublimeLinter][] for Sublime Text and [grunt-contrib-jshint][] for Grunt.**

A Firefox addon that analyses all the Javascript files on a web page using JSLint.

JSLinter is available for download at [addons.mozilla.org][].


Addon Features
--------------

 * Left clicking on the icon or pressing <kbd>Ctrl+J</kbd> opens JSLinter.
 * Right clicking on the icon or pressing <kbd>Ctrl+Alt+J</kbd> opens JSLinter and runs analysis.
 * Exclude specific Javascript files from analysis.
 * Customise any of the JSLint options.

**Note:**
JSLinter may not be able to detect all Javascript files on a web page if the website is using a script loader. This is because some script loaders don't leave `<script>` tags in the DOM.


License
-------
JSLinter is released under the MIT license.

Copyright © 2012 Roland Warmerdam.


[SublimeLinter]: https://github.com/SublimeLinter/SublimeLinter
[grunt-contrib-jshint]: https://github.com/gruntjs/grunt-contrib-jshint
[addons.mozilla.org]: https://addons.mozilla.org/addon/jslinter?src=external-github
