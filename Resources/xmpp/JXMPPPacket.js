/**
 * Creates a new packet with given root tag name (for internal use)
 * @class Somewhat abstract base class for all kinds of specialised packets
 * @param {String} name The root tag name of the packet
 * (i.e. one of 'message', 'iq' or 'presence')
 */
function JXMPPPacket(name) {
  /**
   * @private
   */
    this.name = name;
    this.doc = XmlDocument.create(name,'');
}

/**
 * Gets the type (name of root element) of this packet, i.e. one of
 * 'presence', 'message' or 'iq'
 * @return the top level tag name
 * @type String
 */
JXMPPPacket.prototype.pType = function() { return this.name; };

/**
 * Gets the associated Document for this packet.
 * @type {@link http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#i-Document Document}
 */
JXMPPPacket.prototype.getDoc = function() {
  return this.doc;
};
/**
 * Gets the root node of this packet
 * @type {@link http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247 Node}
 */
JXMPPPacket.prototype.getNode = function() {
  if (this.getDoc() && this.getDoc().documentElement)
    return this.getDoc().documentElement;
  else
    return null;
};

/**
 * Sets the 'to' attribute of the root node of this packet
 * @param {String} to
 * @type JXMPPPacket
 */
JXMPPPacket.prototype.setTo = function(to) {
  if (!to || to == '')
    this.getNode().removeAttribute('to');
  else if (typeof(to) == 'string')
    this.getNode().setAttribute('to',to);
  else
    this.getNode().setAttribute('to',to.toString());
  return this;
};
/**
 * Sets the 'from' attribute of the root node of this
 * packet. Usually this is not needed as the server will take care
 * of this automatically.
 * @type JXMPPPacket
 */
JXMPPPacket.prototype.setFrom = function(from) {
  if (!from || from == '')
    this.getNode().removeAttribute('from');
  else if (typeof(from) == 'string')
    this.getNode().setAttribute('from',from);
  else
    this.getNode().setAttribute('from',from.toString());
  return this;
};
/**
 * Sets 'id' attribute of the root node of this packet.
 * @param {String} id The id of the packet.
 * @type JXMPPPacket
 */
JXMPPPacket.prototype.setID = function(id) {
  if (!id || id == '')
    this.getNode().removeAttribute('id');
  else
    this.getNode().setAttribute('id',id);
  return this;
};
/**
 * Sets the 'type' attribute of the root node of this packet.
 * @param {String} type The type of the packet.
 * @type JXMPPPacket
 */
JXMPPPacket.prototype.setType = function(type) {
  if (!type || type == '')
    this.getNode().removeAttribute('type');
  else
    this.getNode().setAttribute('type',type);
  return this;
};
/**
 * Sets 'xml:lang' for this packet
 * @param {String} xmllang The xml:lang of the packet.
 * @type JXMPPPacket
 */
JXMPPPacket.prototype.setXMLLang = function(xmllang) {
  if (!xmllang || xmllang == '')
    this.getNode().removeAttribute('xml:lang');
  else
    this.getNode().setAttribute('xml:lang',xmllang);
  return this;
};

/**
 * Gets the 'to' attribute of this packet
 * @type String
 */
JXMPPPacket.prototype.getTo = function() {
  return this.getNode().getAttribute('to');
};
/**
 * Gets the 'from' attribute of this packet.
 * @type String
 */
JXMPPPacket.prototype.getFrom = function() {
  return this.getNode().getAttribute('from');
};
/**
 * Gets the 'to' attribute of this packet as a JXMPPJID object
 * @type JXMPPJID
 */
JXMPPPacket.prototype.getToJID = function() {
  return new JXMPPJID(this.getTo());
};
/**
 * Gets the 'from' attribute of this packet as a JXMPPJID object
 * @type JXMPPJID
 */
JXMPPPacket.prototype.getFromJID = function() {
  return new JXMPPJID(this.getFrom());
};
/**
 * Gets the 'id' of this packet
 * @type String
 */
JXMPPPacket.prototype.getID = function() {
  return this.getNode().getAttribute('id');
};
/**
 * Gets the 'type' of this packet
 * @type String
 */
JXMPPPacket.prototype.getType = function() {
  return this.getNode().getAttribute('type');
};
/**
 * Gets the 'xml:lang' of this packet
 * @type String
 */
JXMPPPacket.prototype.getXMLLang = function() {
  return this.getNode().getAttribute('xml:lang');
};
/**
 * Gets the 'xmlns' (xml namespace) of the root node of this packet
 * @type String
 */
JXMPPPacket.prototype.getXMLNS = function() {
  return this.getNode().namespaceURI || this.getNode().getAttribute('xmlns');
};

/**
 * Gets a child element of this packet. If no params given returns first child.
 * @param {String} name Tagname of child to retrieve. Use '*' to match any tag. [optional]
 * @param {String} ns   Namespace of child. Use '*' to match any ns.[optional]
 * @return The child node, null if none found
 * @type {@link http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247 Node}
 */
JXMPPPacket.prototype.getChild = function(name, ns) {
  if (!this.getNode()) {
    return null;
  }

  name = name || '*';
  ns = ns || '*';

  if (this.getNode().getElementsByTagNameNS) {
    return this.getNode().getElementsByTagNameNS(ns, name).item(0);
  }

  // fallback
  var nodes = this.getNode().getElementsByTagName(name);
  if (ns != '*') {
    for (var i=0; i<nodes.length; i++) {
      if (nodes.item(i).namespaceURI == ns || nodes.item(i).getAttribute('xmlns') == ns) {
        return nodes.item(i);
      }
    }
  } else {
    return nodes.item(0);
  }
  return null; // nothing found
};

/**
 * Gets the node value of a child element of this packet.
 * @param {String} name Tagname of child to retrieve.
 * @param {String} ns   Namespace of child
 * @return The value of the child node, empty string if none found
 * @type String
 */
JXMPPPacket.prototype.getChildVal = function(name, ns) {
  var node = this.getChild(name, ns);
  var ret = '';
  if (node && node.hasChildNodes()) {
    // concatenate all values from childNodes
    for (var i=0; i<node.childNodes.length; i++)
      if (node.childNodes.item(i).nodeValue)
        ret += node.childNodes.item(i).nodeValue;
  }
  return ret;
};

/**
 * Returns a copy of this node
 * @return a copy of this node
 * @type JXMPPPacket
 */
JXMPPPacket.prototype.clone = function() {
  return JXMPPPacket.wrapNode(this.getNode());
};

/**
 * Checks if packet is of type 'error'
 * @return 'true' if this packet is of type 'error', 'false' otherwise
 * @type boolean
 */
JXMPPPacket.prototype.isError = function() {
  return (this.getType() == 'error');
};

/**
 * Returns an error condition reply according to {@link http://www.xmpp.org/extensions/xep-0086.html XEP-0086}. Creates a clone of the calling packet with senders and recipient exchanged and error stanza appended.
 * @param {STANZA_ERROR} stanza_error an error stanza containing error cody, type and condition of the error to be indicated
 * @return an error reply packet
 * @type JXMPPPacket
 */
JXMPPPacket.prototype.errorReply = function(stanza_error) {
  var rPacket = this.clone();
  rPacket.setTo(this.getFrom());
  rPacket.setFrom();
  rPacket.setType('error');

  rPacket.appendNode('error',
                     {code: stanza_error.code, type: stanza_error.type},
                     [[stanza_error.cond, {xmlns: NS_STANZAS}]]);

  return rPacket;
};

/**
 * Returns a string representation of the raw xml content of this packet.
 * @type String
 */
JXMPPPacket.prototype.xml = function() {
  var xml = Titanium.XML.serializeToString(this.getNode()).replace(/\<\?xml.+\?\>/, "");
  return xml;
};


// PRIVATE METHODS DOWN HERE

/**
 * Gets an attribute of the root element
 * @private
 */
JXMPPPacket.prototype._getAttribute = function(attr) {
  return this.getNode().getAttribute(attr);
};


if (Titanium.XML.Document.ELEMENT_NODE == null) {
  Titanium.XML.Document.ELEMENT_NODE = 1;
  Titanium.XML.Document.ATTRIBUTE_NODE = 2;
  Titanium.XML.Document.TEXT_NODE = 3;
  Titanium.XML.Document.CDATA_SECTION_NODE = 4;
  Titanium.XML.Document.ENTITY_REFERENCE_NODE = 5;
  Titanium.XML.Document.ENTITY_NODE = 6;
  Titanium.XML.Document.PROCESSING_INSTRUCTION_NODE = 7;
  Titanium.XML.Document.COMMENT_NODE = 8;
  Titanium.XML.Document.DOCUMENT_NODE = 9;
  Titanium.XML.Document.DOCUMENT_TYPE_NODE = 10;
  Titanium.XML.Document.DOCUMENT_FRAGMENT_NODE = 11;
  Titanium.XML.Document.NOTATION_NODE = 12;
}


/**
 * import node into this packets document
 * @private
 */
JXMPPPacket.prototype._importNode = function(node, allChildren) {
  switch (node.nodeType) {
  case Titanium.XML.Document.ELEMENT_NODE:

  var newNode;
  if (this.getDoc().createElementNS) {
    newNode = this.getDoc().createElementNS(node.namespaceURI, node.nodeName);
  } else {
    newNode = this.getDoc().createElement(node.nodeName);
  }

  var i, il;
  /* does the node have any attributes to add? */
  if (node.attributes && node.attributes.length > 0)
    for (i = 0, il = node.attributes.length;i < il; i++) {
      var attr = node.attributes.item(i);
      if (attr.nodeName == 'xmlns' &&
          (newNode.getAttribute('xmlns') != null || newNode.namespaceURI)) {
          // skip setting an xmlns attribute as it has been set
          // before already by createElementNS

          // namespaceURI is '' for IE<9
          continue;
      }
      if (newNode.setAttributeNS && attr.namespaceURI) {
        newNode.setAttributeNS(attr.namespaceURI,
                               attr.nodeName,
                               attr.nodeValue);
      } else {
        newNode.setAttribute(attr.nodeName,
                             attr.nodeValue);
      }
    }
  /* are we going after children too, and does the node have any? */
  if (allChildren && node.childNodes && node.childNodes.length > 0) {
    for (i = 0, il = node.childNodes.length; i < il; i++) {
      newNode.appendChild(this._importNode(node.childNodes.item(i), allChildren));
    }
  }
  return newNode;
  break;
  case Titanium.XML.Document.TEXT_NODE:
  case Titanium.XML.Document.CDATA_SECTION_NODE:
  case Titanium.XML.Document.COMMENT_NODE:
  return this.getDoc().createTextNode(node.nodeValue);
  break;
  }
};

/**
 * Set node value of a child node
 * @private
 */
JXMPPPacket.prototype._setChildNode = function(nodeName, nodeValue) {
  var aNode = this.getChild(nodeName);
  var tNode = this.getDoc().createTextNode(nodeValue);
  if (aNode)
    try {
      aNode.replaceChild(tNode,aNode.firstChild);
    } catch (e) { }
  else {
    try {
    	
     Ti.API.log("xxxxxxxxxxxxx"+this.getNode().namespaceURI);	
      aNode = this.getDoc().createElementNS(this.getNode().namespaceURI,
                                            nodeName);
    } catch (ex) {
      aNode = this.getDoc().createElement(nodeName);
    }
    this.getNode().appendChild(aNode);
    aNode.appendChild(tNode);
  }
  return aNode;
};

/**
 * Builds a node using {@link
 * http://wiki.script.aculo.us/scriptaculous/show/Builder
 * script.aculo.us' Dom Builder} notation.
 * This code is taken from {@link
 * http://wiki.script.aculo.us/scriptaculous/show/Builder
 * script.aculo.us' Dom Builder} and has been modified to suit our
 * needs.<br/>
 * The original parts of the code do have the following copyright
 * and license notice:<br/>
 * Copyright (c) 2005, 2006 Thomas Fuchs (http://script.aculo.us,
 * http://mir.acu lo.us) <br/>
 * script.aculo.us is freely distributable under the terms of an
 * MIT-style licen se.  // For details, see the script.aculo.us web
 * site: http://script.aculo.us/<br>
 * @author Thomas Fuchs
 * @author Stefan Strigler
 * @return The newly created node
 * @type {@link http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247 Node}
 */
JXMPPPacket.prototype.buildNode = function(elementName) {
  return JXMPPBuilder.buildNode(this.getDoc(),
                                elementName,
                                arguments[1],
                                arguments[2],
                                arguments[3]);
};

/**
 * Appends node created by buildNode to this packets parent node.
 * @param {@link http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247 Node} element The node to append or
 * @param {String} element A name plus an object hash with attributes (optional) plus an array of childnodes (optional)
 * @see #buildNode
 * @return This packet
 * @type JXMPPPacket
 */
JXMPPPacket.prototype.appendNode = function(element) {
  if (typeof element=='object') { // seems to be a prebuilt node
    return this.getNode().appendChild(element);
  } else { // build node
    return this.getNode().appendChild(this.buildNode(element,
                                                     arguments[1],
                                                     arguments[2],
                                                     this.getNode().namespaceURI));
  }
};


/**
 * A jabber/XMPP presence packet
 * @class Models the XMPP notion of a 'presence' packet
 * @extends JXMPPPacket
 */
function JXMPPPresence() {
  /**
   * @ignore
   */
  this.base = JXMPPPacket;
  this.base('presence');
}
JXMPPPresence.prototype = new JXMPPPacket;

/**
 * Sets the status message for current status. Usually this is set
 * to some human readable string indicating what the user is
 * doing/feel like currently.
 * @param {String} status A status message
 * @return this
 * @type JXMPPPacket
 */
JXMPPPresence.prototype.setStatus = function(status) {
  this._setChildNode("status", status);
  return this;
};
/**
 * Sets the online status for this presence packet.
 * @param {String} show An XMPP complient status indicator. Must
 * be one of 'chat', 'away', 'xa', 'dnd'
 * @return this
 * @type JXMPPPacket
 */
JXMPPPresence.prototype.setShow = function(show) {
  if (show == 'chat' || show == 'away' || show == 'xa' || show == 'dnd')
    this._setChildNode("show",show);
  return this;
};
/**
 * Sets the priority of the resource bind to with this connection
 * @param {int} prio The priority to set this resource to
 * @return this
 * @type JXMPPPacket
 */
JXMPPPresence.prototype.setPriority = function(prio) {
  this._setChildNode("priority", prio);
  return this;
};
/**
 * Some combined method that allowes for setting show, status and
 * priority at once
 * @param {String} show A status message
 * @param {String} status A status indicator as defined by XMPP
 * @param {int} prio A priority for this resource
 * @return this
 * @type JXMPPPacket
 */
JXMPPPresence.prototype.setPresence = function(show,status,prio) {
  if (show)
    this.setShow(show);
  if (status)
    this.setStatus(status);
  if (prio)
    this.setPriority(prio);
  return this;
};

/**
 * Gets the status message of this presence
 * @return The (human readable) status message
 * @type String
 */
JXMPPPresence.prototype.getStatus = function() {
  return this.getChildVal('status');
};
/**
 * Gets the status of this presence.
 * Either one of 'chat', 'away', 'xa' or 'dnd' or null.
 * @return The status indicator as defined by XMPP
 * @type String
 */
JXMPPPresence.prototype.getShow = function() {
  return this.getChildVal('show');
};
/**
 * Gets the priority of this status message
 * @return A resource priority
 * @type int
 */
JXMPPPresence.prototype.getPriority = function() {
  return this.getChildVal('priority');
};


/**
 * A jabber/XMPP iq packet
 * @class Models the XMPP notion of an 'iq' packet
 * @extends JXMPPPacket
 */
function JXMPPIQ() {
  /**
   * @ignore
   */
  this.base = JXMPPPacket;
  this.base('iq');
}
JXMPPIQ.prototype = new JXMPPPacket;

/**
 * Some combined method to set 'to', 'type' and 'id' at once
 * @param {String} to the recepients JID
 * @param {String} type A XMPP compliant iq type (one of 'set', 'get', 'result' and 'error'
 * @param {String} id A packet ID
 * @return this
 * @type JXMPPIQ
 */
JXMPPIQ.prototype.setIQ = function(to,type,id) {
  if (to)
    this.setTo(to);
  if (type)
    this.setType(type);
  if (id)
    this.setID(id);
  return this;
};
/**
 * Creates a 'query' child node with given XMLNS
 * @param {String} xmlns The namespace for the 'query' node
 * @return The query node
 * @type {@link  http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247 Node}
 */
JXMPPIQ.prototype.setQuery = function(xmlns) {
  var query;
  try {
    query = this.getDoc().createElementNS(xmlns,'query');
  } catch (e) {
    query = this.getDoc().createElement('query');
	query.setAttribute('xmlns',xmlns);
  }
  this.getNode().appendChild(query);
  return query;
};

/**
 * Gets the 'query' node of this packet
 * @return The query node
 * @type {@link  http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247 Node}
 */
JXMPPIQ.prototype.getQuery = function() {
  return this.getNode().getElementsByTagName('query').item(0);
};
/**
 * Gets the XMLNS of the query node contained within this packet
 * @return The namespace of the query node
 * @type String
 */
JXMPPIQ.prototype.getQueryXMLNS = function() {
  if (this.getQuery()) {
    return this.getQuery().namespaceURI || this.getQuery().getAttribute('xmlns');
  } else {
    return null;
  }
};

/**
 * Creates an IQ reply with type set to 'result'. If given appends payload to first child if IQ. Payload maybe XML as string or a DOM element (or an array of such elements as well).
 * @param {Element} payload A payload to be appended [optional]
 * @return An IQ reply packet
 * @type JXMPPIQ
 */
JXMPPIQ.prototype.reply = function(payload) {
  var rIQ = this.clone();
  rIQ.setTo(this.getFrom());
  rIQ.setFrom();
  rIQ.setType('result');
  if (payload) {
    if (typeof payload == 'string')
      rIQ.getChild().appendChild(rIQ.getDoc().loadXML(payload));
    else if (payload.constructor == Array) {
      var node = rIQ.getChild();
      for (var i=0; i<payload.length; i++)
        if(typeof payload[i] == 'string')
          node.appendChild(rIQ.getDoc().loadXML(payload[i]));
        else if (typeof payload[i] == 'object')
          node.appendChild(payload[i]);
    }
    else if (typeof payload == 'object')
      rIQ.getChild().appendChild(payload);
  }
  return rIQ;
};

/**
 * A jabber/XMPP message packet
 * @class Models the XMPP notion of an 'message' packet
 * @extends JXMPPPacket
 */
function JXMPPMessage() {
  /**
   * @ignore
   */
  this.base = JXMPPPacket;
  this.base('message');
}
JXMPPMessage.prototype = new JXMPPPacket;

/**
 * Sets the body of the message
 * @param {String} body Your message to be sent along
 * @return this message
 * @type JXMPPMessage
 */
JXMPPMessage.prototype.setBody = function(body) {
  this._setChildNode("body",body);
  return this;
};
/**
 * Sets the subject of the message
 * @param {String} subject Your subject to be sent along
 * @return this message
 * @type JXMPPMessage
 */
JXMPPMessage.prototype.setSubject = function(subject) {
  this._setChildNode("subject",subject);
  return this;
};
/**
 * Sets the 'tread' attribute for this message. This is used to identify
 * threads in chat conversations
 * @param {String} thread Usually a somewhat random hash.
 * @return this message
 * @type JXMPPMessage
 */
JXMPPMessage.prototype.setThread = function(thread) {
  this._setChildNode("thread", thread);
  return this;
};
/**
 * Gets the 'thread' identifier for this message
 * @return A thread identifier
 * @type String
 */
JXMPPMessage.prototype.getThread = function() {
  return this.getChildVal('thread');
};
/**
 * Gets the body of this message
 * @return The body of this message
 * @type String
 */
JXMPPMessage.prototype.getBody = function() {
  return this.getChildVal('body');
};
/**
 * Gets the subject of this message
 * @return The subject of this message
 * @type String
 */
JXMPPMessage.prototype.getSubject = function() {
  return this.getChildVal('subject');
};


/**
 * Tries to transform a w3c DOM node to JXMPP's internal representation
 * (JXMPPPacket type, one of JXMPPPresence, JXMPPMessage, JXMPPIQ)
 * @param: {Node
 * http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247}
 * node The node to be transformed
 * @return A JXMPPPacket representing the given node. If node's root
 * elemenent is not one of 'message', 'presence' or 'iq',
 * <code>null</code> is being returned.
 * @type JXMPPPacket
 */
JXMPPPacket.wrapNode = function(node) {
  var oPacket = null;

  switch (node.nodeName.toLowerCase()) {
  case 'presence':
      oPacket = new JXMPPPresence();
      break;
  case 'message':
      oPacket = new JXMPPMessage();
      break;
  case 'iq':
      oPacket = new JXMPPIQ();
      break;
  }

  if (oPacket) {
    oPacket.getDoc().replaceChild(oPacket._importNode(node, true),oPacket.getNode());
  }

  return oPacket;
};
