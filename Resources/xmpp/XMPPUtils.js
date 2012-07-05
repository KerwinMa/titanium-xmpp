Titanium.XML.Document.prototype.loadXML = function(s) {

		// parse the string to a new doc
		var doc2 = Ti.XML.parseString(s, "text/xml");

		// remove all initial children
		while(this.hasChildNodes())
		this.removeChild(this.lastChild);

		// insert and import nodes
		for(var i = 0; i < doc2.childNodes.length; i++) {
			this.appendChild(this.importNode(doc2.childNodes[i], true));
		}
};
