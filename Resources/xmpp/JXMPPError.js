var Constants=require("JXMPPConstants");
var XmlDocument = require('JXMPPXmlDocument');
/**
 * an error packet for internal use
 * @private
 * @constructor
 */
exports.create =function (code,type,condition) {
  var xmldoc = XmlDocument.create("error","JXMPP");

  xmldoc.documentElement.setAttribute('code',code);
  xmldoc.documentElement.setAttribute('type',type);
  if (condition)
    xmldoc.documentElement.appendChild(xmldoc.createElement(condition)).
      setAttribute('xmlns', Constants.NS_STANZAS);
  return xmldoc.documentElement;
}