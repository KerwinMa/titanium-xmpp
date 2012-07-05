/**
 * XmlDocument factory
 * @private
 */
function XmlDocument() {
}

XmlDocument.create = function(name, ns) {
	name = name || 'foo';
	ns = ns || '';

	try {
		// DOM2
		var baseDoc = Ti.XML.parseString("<a/>");
		var doc = baseDoc.implementation.createDocument(ns, name, null);
		if(!doc.documentElement || doc.documentElement.tagName != name || (doc.documentElement.namespaceURI && doc.documentElement.namespaceURI != ns)) {
			try {
				if(ns != '')
					doc.appendChild(doc.createElement(name)).setAttribute('xmlns', ns);
				else
					doc.appendChild(doc.createElement(name));
			} catch (dex) {
				doc = document.implementation.createDocument(ns, name, null);

				if(doc.documentElement == null)
					doc.appendChild(doc.createElement(name));

				if(ns != '' && doc.documentElement.getAttribute('xmlns') != ns) {
					doc.documentElement.setAttribute('xmlns', ns);
				}
			}
		}

		return doc;
	} catch (ex) {
		Ti.API.debug("Your browser does not support XmlDocument objects"+ex);
	}
	//throw new
};

/**
 * used to find the Automation server name
 * @private
 */
XmlDocument.getPrefix = function() {
	if(XmlDocument.prefix)
		return XmlDocument.prefix;

	var prefixes = ["MSXML2", "Microsoft", "MSXML", "MSXML3"];
	var o;
	for(var i = 0; i < prefixes.length; i++) {
		try {
			// try to create the objects
			o = new ActiveXObject(prefixes[i] + ".DomDocument");
			return XmlDocument.prefix = prefixes[i];
		} catch (ex) {
		};
	}

	throw new Error("Could not find an installed XML parser");
};

module.exports = XmlDocument;
