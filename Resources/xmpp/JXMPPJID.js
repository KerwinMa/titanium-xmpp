/**
 * list of forbidden chars for nodenames
 * @private
 */
var JXMPPJID_FORBIDDEN = ['"',' ','&','\'','/',':','<','>','@'];

/**
 * Creates a new JXMPPJID object
 * @class JXMPPJID models xmpp jid objects
 * @constructor
 * @param {Object} jid jid may be either of type String or a JID represented
 * by JSON with fields 'node', 'domain' and 'resource'
 * @throws JXMPPJIDInvalidException Thrown if jid is not valid
 * @return a new JXMPPJID object
 */
function JXMPPJID(jid) {
  /**
   *@private
   */
  this._node = '';
  /**
   *@private
   */
  this._domain = '';
  /**
   *@private
   */
  this._resource = '';

  if (typeof(jid) == 'string') {
    if (jid.indexOf('@') != -1) {
        this.setNode(jid.substring(0,jid.indexOf('@')));
        jid = jid.substring(jid.indexOf('@')+1);
    }
    if (jid.indexOf('/') != -1) {
      this.setResource(jid.substring(jid.indexOf('/')+1));
      jid = jid.substring(0,jid.indexOf('/'));
    }
    this.setDomain(jid);
  } else {
    this.setNode(jid.node);
    this.setDomain(jid.domain);
    this.setResource(jid.resource);
  }
}

/**
 * Gets the bare jid (i.e. the JID without resource)
 * @return A string representing the bare jid
 * @type String
 */
JXMPPJID.prototype.getBareJID = function() {
    return this.getNode()+'@'+this.getDomain();
};

/**
 * Gets the node part of the jid
 * @return A string representing the node name
 * @type String
 */
JXMPPJID.prototype.getNode = function() { return this._node; };

/**
 * Gets the domain part of the jid
 * @return A string representing the domain name
 * @type String
 */
JXMPPJID.prototype.getDomain = function() { return this._domain; };

/**
 * Gets the resource part of the jid
 * @return A string representing the resource
 * @type String
 */
JXMPPJID.prototype.getResource = function() { return this._resource; };


/**
 * Sets the node part of the jid
 * @param {String} node Name of the node
 * @throws JXMPPJIDInvalidException Thrown if node name contains invalid chars
 * @return This object
 * @type JXMPPJID
 */
JXMPPJID.prototype.setNode = function(node) {
  JXMPPJID._checkNodeName(node);
  this._node = node || '';
  return this;
};

/**
 * Sets the domain part of the jid
 * @param {String} domain Name of the domain
 * @throws JXMPPJIDInvalidException Thrown if domain name contains invalid
 * chars or is empty
 * @return This object
 * @type JXMPPJID
 */
JXMPPJID.prototype.setDomain = function(domain) {
  if (!domain || domain == '')
    throw new JXMPPJIDInvalidException("domain name missing");
  // chars forbidden for a node are not allowed in domain names
  // anyway, so let's check
  JXMPPJID._checkNodeName(domain);
  this._domain = domain;
  return this;
};

/**
 * Sets the resource part of the jid
 * @param {String} resource Name of the resource
 * @return This object
 * @type JXMPPJID
 */
JXMPPJID.prototype.setResource = function(resource) {
  this._resource = resource || '';
  return this;
};

/**
 * The string representation of the full jid
 * @return A string representing the jid
 * @type String
 */
JXMPPJID.prototype.toString = function() {
  var jid = '';
  if (this.getNode() && this.getNode() != '')
    jid = this.getNode() + '@';
  jid += this.getDomain(); // we always have a domain
  if (this.getResource() && this.getResource() != "")
    jid += '/' + this.getResource();
  return jid;
};

/**
 * Removes the resource part of the jid
 * @return This object
 * @type JXMPPJID
 */
JXMPPJID.prototype.removeResource = function() {
  return this.setResource();
};

/**
 * creates a copy of this JXMPPJID object
 * @return A copy of this
 * @type JXMPPJID
 */
JXMPPJID.prototype.clone = function() {
  return new JXMPPJID(this.toString());
};

/**
 * Compares two jids if they belong to the same entity (i.e. w/o resource)
 * @param {String} jid a jid as string or JXMPPJID object
 * @return 'true' if jid is same entity as this
 * @type Boolean
 */
JXMPPJID.prototype.isEntity = function(jid) {
  if (typeof jid == 'string')
	  jid = (new JXMPPJID(jid));
  jid.removeResource();
  return (this.clone().removeResource().toString() === jid.toString());
};

/**
 * Check if node name is valid
 * @private
 * @param {String} node A name for a node
 * @throws JXMPPJIDInvalidException Thrown if name for node is not allowed
 */
JXMPPJID._checkNodeName = function(nodeprep) {
    if (!nodeprep || nodeprep == '')
      return;
    for (var i=0; i< JXMPPJID_FORBIDDEN.length; i++) {
      if (nodeprep.indexOf(JXMPPJID_FORBIDDEN[i]) != -1) {
        throw new JXMPPJIDInvalidException("forbidden char in nodename: "+JXMPPJID_FORBIDDEN[i]);
      }
    }
};

/**
 * Creates a new Exception of type JXMPPJIDInvalidException
 * @class Exception to indicate invalid values for a jid
 * @constructor
 * @param {String} message The message associated with this Exception
 */
function JXMPPJIDInvalidException(message) {
  /**
   * The exceptions associated message
   * @type String
   */
  this.message = message;
  /**
   * The name of the exception
   * @type String
   */
  this.name = "JXMPPJIDInvalidException";
}

module.exports = JXMPPJID;
