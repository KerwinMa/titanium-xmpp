/**
 * @fileoverview Contains Debugger interface for Firebug and Safari
 * @class Implementation of the Debugger interface for {@link
 * http://www.getfirebug.com/ Firebug} and Safari
 * Creates a new debug logger to be passed to JXMPP's connection
 * constructor. Of course you can use it for debugging in your code
 * too.
 * @constructor
 * @param {int} level The maximum level for debugging messages to be
 * displayed. Thus you can tweak the verbosity of the logger. A value
 * of 0 means very low traffic whilst a value of 4 makes logging very
 * verbose about what's going on.
 */
function JXMPPConsoleLogger(level) {
  /**
   * @private
   */
  this.level = level || 4;

  /**
   * Empty function for API compatibility
   */
  this.start = function() {};
  /**
   * Logs a message to firebug's/safari's console
   * @param {String} msg The message to be logged.
   * @param {int} level The message's verbosity level. Importance is
   * from 0 (very important) to 4 (not so important). A value of 1
   * denotes an error in the usual protocol flow.
   */
  this.log = function(msg, level) {
    level = level || 0;
    if (level > this.level)
      return;

    try {
      switch (level) {
      case 0:
        Ti.API.warn(msg);
        break;
      case 1:
        Ti.API.error(msg);
        break;
      case 2:
        Ti.API.info(msg);
        break;
      case 4:
        Ti.API.debug(msg);
        break;
      default:
        Ti.API.debug(msg);
        break;
      }
    } catch(e) { try { Ti.API.debug(msg); } catch(e) {} }
  };

  /**
   * Sets verbosity level.
   * @param {int} level The maximum level for debugging messages to be
   * displayed. Thus you can tweak the verbosity of the logger. A
   * value of 0 means very low traffic whilst a value of 4 makes
   * logging very verbose about what's going on.
   * @return This debug logger
   * @type ConsoleLogger
   */
  this.setLevel = function(level) { this.level = level; return this; };
  /**
   * Gets verbosity level.
   * @return The level
   * @type int
   */
  this.getLevel = function() { return this.level; };
}
