/**
 * Creates a new Jabber connection (a connection to a jabber server)
 * @class Somewhat abstract base class for jabber connections. Contains all
 * of the code in common for all jabber connections
 * @constructor
 * @param {JSON http://www.json.org/index} oArg JSON with properties: <br>
 * * <code>httpbase</code> the http base address of the service to be used for
 * connecting to jabber<br>
 * * <code>oDbg</code> (optional) a reference to a debugger interface
 */
function JXMPPConnection(oArg) {

	if (oArg && oArg.oDbg && oArg.oDbg.log) {
		/**
		 * Reference to debugger interface
		 * (needs to implement method <code>log</code>)
		 * @type Debugger
		 */
		this.oDbg = oArg.oDbg;
	} else {
		this.oDbg = new Object();
		// always initialise a debugger
		this.oDbg.log = function() {
		};
	}

	
	if (oArg && oArg.allow_plain)
		/**
		 * @private
		 */
		this.allow_plain = oArg.allow_plain;
	else
		this.allow_plain = JXMPP_ALLOW_PLAIN;

	
	/**
	 * @private
	 */
	this._connected = false;

	/**
	 * @private
	 */
	this._autenticated = false;

	/**
	 * @private
	 */
	this._events = new Array();
	/**
	 * @private
	 */
	this._ID = 0;
	/**
	 * @private
	 */
	this._inQ = new Array();
	/**
	 * @private
	 */
	this._regIDs = new Array();
	/**
	 * @private
	 */
	this._req = null;
	/**
	 * @private
	 */
	this._status = 'intialized';
	/**
	 * @private
	 */
	this._errcnt = 0;
	/**
	 * @private
	 */
	this._sendRawCallbacks = new Array();

}

JXMPPConnection.prototype.connect = function(oArg) {
	this._setStatus('connecting');

	this.domain = oArg.domain || 'localhost';
	this.username = oArg.username;
	this.resource = oArg.resource;
	this.pass = oArg.pass;
	this.register = oArg.register;

	this.authhost = oArg.authhost || oArg.host || oArg.domain;
	this.authtype = oArg.authtype || 'sasl';

	if (oArg.xmllang && oArg.xmllang != '')
		this._xmllang = oArg.xmllang;
	else
		this._xmllang = 'en';

	this.host = oArg.host;
	this.port = oArg.port || 5222;
	if (oArg.secure)
		this.secure = 'true';
	else
		this.secure = 'false';

	if (oArg.wait)
		this._wait = oArg.wait;

	this.jid = this.username + '@' + this.domain;
	this.fulljid = this.jid + '/' + this.resource;

	that=this;
	// setupRequest must be done after rid is created but before first use in reqstr
	if (this._req == null) {
		try {
			this._req = Ti.Network.Socket.createTCP({
				host : this.host,
				port : this.port,
				connected : function(e) {
					//send initial request

					var reqstr = that._getInitialRequestString();
					that.oDbg.log(reqstr, 4);

					e.socket.write(Ti.createBuffer({
						value : reqstr
					}));
					Ti.Stream.pump(e.socket, that._pumpCallback, 65536, true);

				},
				error : function(e) {
					that.oDbg.log('Socket error', 1);
				},
				closed : function(e) {
					that.oDbg.log('Socket close', 1);
				},
			});
			this._req.connect();
		} catch (e) {
			this.oDbg.log('Error creating socket' + e, 1);
		}
	} else {
		this.oDbg.log('Socket allredy connected', 1);
	}


};

JXMPPConnection.prototype._getStreamID = function(streamData) {
	this.oDbg.log(streamData, 4);

	// extract stream id used for non-SASL authentication
	if (streamData.match(/id=[\'\"]([^\'\"]+)[\'\"]/))
		this.streamid = RegExp.$1;
	this.oDbg.log("got streamid: " + this.streamid, 2);

	this._connected = true;
	var doc;
	try {
		//var response = streamData + '</stream:stream>';
		doc = Ti.XML.parseString(streamData);

		if (!this._parseStreamFeatures(doc)) {
			this.authtype = 'nonsasl';
			return;
		}
	} catch(e) {
		this.oDbg.log("loadXML: " + e.toString(), 1);
	}

	if (this.register)
		this._doInBandReg();
	else
		this._doAuth();

	this._autenticated = true;

};

JXMPPConnection.prototype._getSplitXml = function(response) {

	var xmls = new Array();
	//var reg = /<(message|iq|presence|stream|proceed|challenge|success|failure)(?=[\:\s\>])/gi;
	var reg = /<(message|iq|presence|proceed|challenge|success|failure)(?=[\:\s\>])/gi;
	var tags = response.split(reg);
	
	if(tags.length==1){  //not recognized tags
		xmls.push(tags[0]);
	}
	else{
		for ( a = 1; a < tags.length; a = a + 2) {
			xmls.push("<" + tags[a] + tags[(a + 1)]);
		}
	}
	return xmls;

}
													
JXMPPConnection.prototype._fixXmlToParse = function(response) {
	
	if(response.indexOf("<stream:stream")==0) {
				response+="</stream:stream>";
				that.oDbg.log("fixed XML finish: " + response, 4);
	}
	
	if(response.indexOf("<stream:features>")==0) {
				response="<stream:stream>"+response+"</stream:stream>";
				that.oDbg.log("fixed XML: " + response, 4);
	}
	return response;
}

JXMPPConnection.prototype._pumpCallback = function(e) {
	//that.oDbg.log("pumpCallback ...", 1);

	if (e.bytesProcessed == -1) {// EOF
		that.oDbg.log("<EOF> - Can't perform any more operations on connected socket", 1);
	} else if (e.errorDescription == null || e.errorDescription == "") {
		that.oDbg.log("DATA>>>: " + e.buffer.toString(), 1);
		var data = e.buffer.toString();
		
		//fix xml finish and prefix
		var response = data.replace(/\<\?xml.+\?\>/, "");
		if(response.indexOf("</stream:stream>")==0) {
			that.oDbg.log("end connection XML: " + response, 4);
			that._req.close();
			return;
		}

		if (that.autenticated()) {
			var xmls = that._getSplitXml(response);
			for ( i = 0; i < xmls.length; i++) {
				var xml = xmls[i];
				xml=that._fixXmlToParse(xml);
				that.oDbg.log("_handleResponse: " + xml, 1);
				that._handleResponse(xml);
			}
		} else {
			response=that._fixXmlToParse(response);
			that._getStreamID(response);
		}

	} else {
		that.oDbg.log("READ ERROR: " + e.errorDescription, 1);
	}
};

JXMPPConnection.prototype._getInitialRequestString = function() {
	var reqstr = "<stream:stream to='" + this.host + "' xmlns='jabber:client' xmlns:stream='http://etherx.jabber.org/streams' version='1.0'>";
	return reqstr;
};

/**
 * Tells whether this connection is connected
 * @return <code>true</code> if this connections is connected,
 * <code>false</code> otherwise
 * @type boolean
 */
JXMPPConnection.prototype.connected = function() {
	return this._connected;
};

JXMPPConnection.prototype.autenticated = function() {
	return this._autenticated;
};



/**
 * Disconnects from jabber server and terminates session (if applicable)
 */
JXMPPConnection.prototype.disconnect = function() {
	this._setStatus('disconnecting');

	if (!this.connected())
		return;
	this._connected = false;
	var request = '</stream:stream>';
	this.oDbg.log("Disconnecting: " + request, 4);
	this._sendRaw(request);
	this._handleEvent('ondisconnect');
};

/**
 * Registers an event handler (callback) for this connection.

 * <p>Note: All of the packet handlers for specific packets (like
 * message_in, presence_in and iq_in) fire only if there's no
 * callback associated with the id.<br>

 * <p>Example:<br/>
 * <code>con.registerHandler('iq', 'query', 'jabber:iq:version', handleIqVersion);</code>

 * @param {String} event One of

 * <ul>
 * <li>onConnect - connection has been established and authenticated</li>
 * <li>onDisconnect - connection has been disconnected</li>
 * <li>onResume - connection has been resumed</li>

 * <li>onStatusChanged - connection status has changed, current
 * status as being passed argument to handler. See {@link #status}.</li>

 * <li>onError - an error has occured, error node is supplied as
 * argument, like this:<br><code>&lt;error code='404' type='cancel'&gt;<br>
 * &lt;item-not-found xmlns='urn:ietf:params:xml:ns:xmpp-stanzas'/&gt;<br>
 * &lt;/error&gt;</code></li>

 * <li>packet_in - a packet has been received (argument: the
 * packet)</li>

 * <li>packet_out - a packet is to be sent(argument: the
 * packet)</li>

 * <li>message_in | message - a message has been received (argument:
 * the packet)</li>

 * <li>message_out - a message packet is to be sent (argument: the
 * packet)</li>

 * <li>presence_in | presence - a presence has been received
 * (argument: the packet)</li>

 * <li>presence_out - a presence packet is to be sent (argument: the
 * packet)</li>

 * <li>iq_in | iq - an iq has been received (argument: the packet)</li>
 * <li>iq_out - an iq is to be sent (argument: the packet)</li>
 * </ul>

 * @param {String} childName A childnode's name that must occur within a
 * retrieved packet [optional]

 * @param {String} childNS A childnode's namespace that must occure within
 * a retrieved packet (works only if childName is given) [optional]

 * @param {String} type The type of the packet to handle (works only if childName and chidNS are given (both may be set to '*' in order to get skipped) [optional]

 * @param {Function} handler The handler to be called when event occurs. If your handler returns 'true' it cancels bubbling of the event. No other registered handlers for this event will be fired.
 */
JXMPPConnection.prototype.registerHandler = function(event) {
	event = event.toLowerCase();
	// don't be case-sensitive here
	var eArg = {
		handler : arguments[arguments.length - 1],
		childName : '*',
		childNS : '*',
		type : '*'
	};
	if (arguments.length > 2)
		eArg.childName = arguments[1];
	if (arguments.length > 3)
		eArg.childNS = arguments[2];
	if (arguments.length > 4)
		eArg.type = arguments[3];
	if (!this._events[event])
		this._events[event] = new Array(eArg);
	else
		this._events[event] = this._events[event].concat(eArg);

	// sort events in order how specific they match criterias thus using
	// wildcard patterns puts them back in queue when it comes to
	// bubbling the event
	this._events[event] = this._events[event].sort(function(a, b) {
		var aRank = 0;
		var bRank = 0;
		with (a) {
			if (type == '*')
				aRank++;
			if (childNS == '*')
				aRank++;
			if (childName == '*')
				aRank++;
		}
		with (b) {
			if (type == '*')
				bRank++;
			if (childNS == '*')
				bRank++;
			if (childName == '*')
				bRank++;
		}
		if (aRank > bRank)
			return 1;
		if (aRank < bRank)
			return -1;
		return 0;
	});
	this.oDbg.log("registered handler for event '" + event + "'", 2);
};

JXMPPConnection.prototype.unregisterHandler = function(event, handler) {
	event = event.toLowerCase();
	// don't be case-sensitive here

	if (!this._events[event])
		return;

	var arr = this._events[event], res = new Array();
	for (var i = 0; i < arr.length; i++)
		if (arr[i].handler != handler)
			res.push(arr[i]);

	if (arr.length != res.length) {
		this._events[event] = res;
		this.oDbg.log("unregistered handler for event '" + event + "'", 2);
	}
};

/**
 * Register for iq packets of type 'get'.
 * @param {String} childName A childnode's name that must occur within a
 * retrieved packet

 * @param {String} childNS A childnode's namespace that must occure within
 * a retrieved packet (works only if childName is given)

 * @param {Function} handler The handler to be called when event occurs. If your handler returns 'true' it cancels bubbling of the event. No other registered handlers for this event will be fired.
 */
JXMPPConnection.prototype.registerIQGet = function(childName, childNS, handler) {
	this.registerHandler('iq', childName, childNS, 'get', handler);
};

/**
 * Register for iq packets of type 'set'.
 * @param {String} childName A childnode's name that must occur within a
 * retrieved packet

 * @param {String} childNS A childnode's namespace that must occure within
 * a retrieved packet (works only if childName is given)

 * @param {Function} handler The handler to be called when event occurs. If your handler returns 'true' it cancels bubbling of the event. No other registered handlers for this event will be fired.
 */
JXMPPConnection.prototype.registerIQSet = function(childName, childNS, handler) {
	this.registerHandler('iq', childName, childNS, 'set', handler);
};

/**
 * Sends a JXMPPPacket
 * @param {JXMPPPacket} packet  The packet to send
 * @param {Function}    cb      The callback to be called if there's a reply
 * to this packet (identified by id) [optional]
 * @param {Object}      arg     Arguments passed to the callback
 * (additionally to the packet received) [optional]
 * @return 'true' if sending was successfull, 'false' otherwise
 * @type boolean
 */
JXMPPConnection.prototype.send = function(packet, cb, arg) {
	if (!packet || !packet.pType) {
		this.oDbg.log("no packet: " + packet, 1);
		return false;
	}

	if (!this.connected())
		return false;

	// if (this._xmllang && !packet.getXMLLang())
	//   packet.setXMLLang(this._xmllang);

	// remember id for response if callback present
	if (cb) {
		// generate an ID
		if (!packet.getID()){
			packet.setID('JXMPPID_' + this._ID++);
		}

		// register callback with id
		this._registerPID(packet.getID(), cb, arg);
	}

	try {
		this._handleEvent(packet.pType() + '_out', packet);
		this._handleEvent("packet_out", packet);

		Ti.API.info("Send IQ:" + packet.xml());
		this._sendRaw(packet.xml());
	} catch (e) {
		this.oDbg.log(e.toString(), 1);
		return false;
	}

	return true;
};

/**
 * Sends an IQ packet. Has default handlers for each reply type.
 * Those maybe overriden by passing an appropriate handler.
 * @param {JXMPPIQPacket} iq - the iq packet to send
 * @param {Object} handlers - object with properties 'error_handler',
 *                            'result_handler' and 'default_handler'
 *                            with appropriate functions
 * @param {Object} arg - argument to handlers
 * @return 'true' if sending was successfull, 'false' otherwise
 * @type boolean
 */
JXMPPConnection.prototype.sendIQ = function(iq, handlers, arg) {
	if (!iq || iq.pType() != 'iq') {
		return false;
	}

	handlers = handlers || {};
	var error_handler = handlers.error_handler || function(aIq) {
		this.oDbg.log(aIq.xml(), 1);
	};

	var result_handler = handlers.result_handler || function(aIq) {
		this.oDbg.log(aIq.xml(), 2);
	};

	var iqHandler = function(aIq, arg) {
		switch (aIq.getType()) {
			case 'error':
				error_handler(aIq);
				break;
			case 'result':
				result_handler(aIq, arg);
				break;
		}
	};
	return this.send(iq, iqHandler, arg);
};

/**
 * Returns current status of this connection
 * @return String to denote current state. One of
 * <ul>
 * <li>'initializing' ... well
 * <li>'connecting' if connect() was called
 * <li>'resuming' if resume() was called
 * <li>'processing' if it's about to operate as normal
 * <li>'onerror_fallback' if there was an error with the request object
 * <li>'protoerror_fallback' if there was an error at the http binding protocol flow (most likely that's where you interested in)
 * <li>'internal_server_error' in case of an internal server error
 * <li>'suspending' if suspend() is being called
 * <li>'aborted' if abort() was called
 * <li>'disconnecting' if disconnect() has been called
 * </ul>
 * @type String
 */
JXMPPConnection.prototype.status = function() {
	return this._status;
};

/**
 * @private
 */
JXMPPConnection.prototype._abort = function() {
	this._connected = false;
	this._setStatus('aborted');
	this._req.close();
	this.oDbg.log("Disconnected.", 1);
	this._handleEvent('ondisconnect');
	this._handleEvent('onerror', JXMPPError('500', 'cancel', 'service-unavailable'));
};

/**
 * @private
 */
JXMPPConnection.prototype._checkInQ = function() {
	for (var i = 0; i < this._inQ.length && i < 10; i++) {
		var item = this._inQ[0];
		this._inQ = this._inQ.slice(1, this._inQ.length);
		var packet = JXMPPPacket.wrapNode(item);

		if (!packet)
			return;

		this._handleEvent("packet_in", packet);

		if (packet.pType && !this._handlePID(packet)) {
			this._handleEvent(packet.pType() + '_in', packet);
			this._handleEvent(packet.pType(), packet);
		}
	}
};


/**
 * @private
 */
JXMPPConnection.prototype._doAuth = function() {
	if (this.has_sasl && this.authtype == 'nonsasl')
		this.oDbg.log("Warning: SASL present but not used", 1);

	if (!this._doSASLAuth() && !this._doLegacyAuth()) {
		this.oDbg.log("Auth failed for authtype " + this.authtype, 1);
		this.disconnect();
		return false;
	}
	return true;
};

/**
 * @private
 */
JXMPPConnection.prototype._doInBandReg = function() {
	if (this.authtype == 'saslanon' || this.authtype == 'anonymous')
		return;
	// bullshit - no need to register if anonymous

	/* ***
	 * In-Band Registration see JEP-0077
	 */

	var iq = new JXMPPIQ();
	iq.setType('set');
	iq.setID('reg1');
	iq.appendNode("query", {
		xmlns : NS_REGISTER
	}, [["username", this.username], ["password", this.pass]]);

	this.send(iq, this._doInBandRegDone);
};

/**
 * @private
 */
JXMPPConnection.prototype._doInBandRegDone = function(iq) {
	if (iq && iq.getType() == 'error') {// we failed to register
		this.oDbg.log("registration failed for " + this.username, 0);
		this._handleEvent('onerror', iq.getChild('error'));
		return;
	}

	this.oDbg.log(this.username + " registered succesfully", 0);

	this._doAuth();
};

/**
 * @private
 */
JXMPPConnection.prototype._doLegacyAuth = function() {
	if (this.authtype != 'nonsasl' && this.authtype != 'anonymous')
		return false;

	/* ***
	 * Non-SASL Authentication as described in JEP-0078
	 */
	var iq = new JXMPPIQ();
	iq.setIQ(null, 'get', 'auth1');
	iq.appendNode('query', {
		xmlns : NS_AUTH
	}, [['username', this.username]]);

	this.send(iq, this._doLegacyAuth2);
	return true;
};

/**
 * @private
 */
JXMPPConnection.prototype._doLegacyAuth2 = function(iq) {
	if (!iq || iq.getType() != 'result') {
		if (iq && iq.getType() == 'error')
			this._handleEvent('onerror', iq.getChild('error'));
		this.disconnect();
		return;
	}

	var use_digest = (iq.getChild('digest') != null);

	/* ***
	 * Send authentication
	 */
	var iq = new JXMPPIQ();
	iq.setIQ(null, 'set', 'auth2');

	var query = iq.appendNode('query', {
		xmlns : NS_AUTH
	}, [['username', this.username], ['resource', this.resource]]);

	if (use_digest) {// digest login
		query.appendChild(iq.buildNode('digest', {
			xmlns : NS_AUTH
		}, hex_sha1(this.streamid + this.pass)));
	} else if (this.allow_plain) {// use plaintext auth
		query.appendChild(iq.buildNode('password', {
			xmlns : NS_AUTH
		}, this.pass));
	} else {
		this.oDbg.log("no valid login mechanism found", 1);
		this.disconnect();
		return;
	}

	this.send(iq, this._doLegacyAuthDone);
};

/**
 * @private
 */
JXMPPConnection.prototype._doLegacyAuthDone = function(iq) {
	if (iq.getType() != 'result') {// auth' failed
		if (iq.getType() == 'error')
			this._handleEvent('onerror', iq.getChild('error'));
		this.disconnect();
	} else
		this._handleEvent('onconnect');
};

/**
 * @private
 */
JXMPPConnection.prototype._doSASLAuth = function() {
	if (this.authtype == 'nonsasl' || this.authtype == 'anonymous')
		return false;

	if (this.authtype == 'saslanon') {
		if (this.mechs['ANONYMOUS']) {
			this.oDbg.log("SASL using mechanism 'ANONYMOUS'", 2);
			return this._sendRaw("<auth xmlns='urn:ietf:params:xml:ns:xmpp-sasl' mechanism='ANONYMOUS'/>", this._doSASLAuthDone);
		}
		this.oDbg.log("SASL ANONYMOUS requested but not supported", 1);

	} else {
		if (this.mechs['DIGEST-MD5']) {
			this.oDbg.log("SASL using mechanism 'DIGEST-MD5'", 2);
			return this._sendRaw("<auth xmlns='urn:ietf:params:xml:ns:xmpp-sasl' mechanism='DIGEST-MD5'/>", this._doSASLAuthDigestMd5S1);
		} else if (this.allow_plain && this.mechs['PLAIN']) {
			this.oDbg.log("SASL using mechanism 'PLAIN'", 2);
			var authStr = this.username + '@' + this.domain + String.fromCharCode(0) + this.username + String.fromCharCode(0) + this.pass;
			this.oDbg.log("authenticating with '" + authStr + "'", 2);
			authStr = b64encode(authStr);
			return this._sendRaw("<auth xmlns='urn:ietf:params:xml:ns:xmpp-sasl' mechanism='PLAIN'>" + authStr + "</auth>", this._doSASLAuthDone);
		}
		this.oDbg.log("No SASL mechanism applied", 1);
		this.authtype = 'nonsasl';
		// fallback
	}
	return false;
};

/**
 * @private
 */
JXMPPConnection.prototype._doSASLAuthDigestMd5S1 = function(el) {
	if (el.nodeName != "challenge") {
		this.oDbg.log("challenge missing", 1);
		this._handleEvent('onerror', JXMPPError('401', 'auth', 'not-authorized'));
		this.disconnect();
	} else {
		var challenge = b64decode(el.firstChild.nodeValue);
		this.oDbg.log("got challenge: " + challenge, 2);
		this._nonce = challenge.substring(challenge.indexOf("nonce=") + 7);
		this._nonce = this._nonce.substring(0, this._nonce.indexOf("\""));
		this.oDbg.log("nonce: " + this._nonce, 2);
		if (this._nonce == '' || this._nonce.indexOf('\"') != -1) {
			this.oDbg.log("nonce not valid, aborting", 1);
			this.disconnect();
			return;
		}

		this._digest_uri = "xmpp/";
		//     if (typeof(this.host) != 'undefined' && this.host != '') {
		//       this._digest-uri += this.host;
		//       if (typeof(this.port) != 'undefined' && this.port)
		//         this._digest-uri += ":" + this.port;
		//       this._digest-uri += '/';
		//     }
		this._digest_uri += this.domain;

		this._cnonce = cnonce(14);

		this._nc = '00000001';

		var A1 = str_md5(this.username + ':' + this.domain + ':' + this.pass) + ':' + this._nonce + ':' + this._cnonce;

		var A2 = 'AUTHENTICATE:' + this._digest_uri;

		var response = hex_md5(hex_md5(A1) + ':' + this._nonce + ':' + this._nc + ':' + this._cnonce + ':auth:' + hex_md5(A2));

		var rPlain = 'username="' + this.username + '",realm="' + this.domain + '",nonce="' + this._nonce + '",cnonce="' + this._cnonce + '",nc="' + this._nc + '",qop=auth,digest-uri="' + this._digest_uri + '",response="' + response + '",charset="utf-8"';

		this.oDbg.log("response: " + rPlain, 2);

		this._sendRaw("<response xmlns='urn:ietf:params:xml:ns:xmpp-sasl'>" + binb2b64(str2binb(rPlain)) + "</response>", this._doSASLAuthDigestMd5S2);
	}
};

JXMPPConnection.prototype._reInitStream = function(to, cb) {
	this._sendRaw("<stream:stream xmlns:stream='http://etherx.jabber.org/streams' xmlns='jabber:client' to='" + to + "' version='1.0'>", cb);
};

/**
 * @private
 */
JXMPPConnection.prototype._doSASLAuthDigestMd5S2 = function(el) {
	if (el.nodeName == 'failure') {
		if (el.xml)
			this.oDbg.log("auth error: " + el.xml, 1);
		else
			this.oDbg.log("auth error", 1);
		this._handleEvent('onerror', JXMPPError('401', 'auth', 'not-authorized'));
		this.disconnect();
		return;
	}

	var response = b64decode(el.firstChild.nodeValue);
	this.oDbg.log("response: " + response, 2);

	var rspauth = response.substring(response.indexOf("rspauth=") + 8);
	this.oDbg.log("rspauth: " + rspauth, 2);

	var A1 = str_md5(this.username + ':' + this.domain + ':' + this.pass) + ':' + this._nonce + ':' + this._cnonce;

	var A2 = ':' + this._digest_uri;

	var rsptest = hex_md5(hex_md5(A1) + ':' + this._nonce + ':' + this._nc + ':' + this._cnonce + ':auth:' + hex_md5(A2));
	this.oDbg.log("rsptest: " + rsptest, 2);

	if (rsptest != rspauth) {
		this.oDbg.log("SASL Digest-MD5: server repsonse with wrong rspauth", 1);
		this.disconnect();
		return;
	}

	if (el.nodeName == 'success') {
		this._reInitStream(this.domain,this._doStreamBind);
	} else {// some extra turn
		this._sendRaw("<response xmlns='urn:ietf:params:xml:ns:xmpp-sasl'/>", this._doSASLAuthDone);
	}
};

/**
 * @private
 */
JXMPPConnection.prototype._doSASLAuthDone = function(el) {
	if (el.nodeName != 'success') {
		this.oDbg.log("auth failed", 1);
		this._handleEvent('onerror', JXMPPError('401', 'auth', 'not-authorized'));
		this.disconnect();
	} else {
		this._reInitStream(this.domain, this._doStreamBind);
	}
};

/**
 * @private
 */
JXMPPConnection.prototype._doStreamBind = function() {
	var iq = new JXMPPIQ();
	iq.setIQ(null, 'set', 'bind_1');
	iq.appendNode("bind", {
		xmlns : NS_BIND
	}, [["resource", this.resource]]);
	this.send(iq, this._doXMPPSess);
};

/**
 * @private
 */
JXMPPConnection.prototype._doXMPPSess = function(iq) {
	if (iq.getType() != 'result' || iq.getType() == 'error') {// failed
		this.disconnect();
		if (iq.getType() == 'error')
			this._handleEvent('onerror', iq.getChild('error'));
		return;
	}

	this.fulljid = iq.getChildVal("jid");
	this.jid = this.fulljid.substring(0, this.fulljid.lastIndexOf('/'));

	iq = new JXMPPIQ();
	iq.setIQ(null, 'set', 'sess_1');
	iq.appendNode("session", {
		xmlns : NS_SESSION
	}, []);
	this.oDbg.log(iq.xml());
	this.send(iq, this._doXMPPSessDone);
};

/**
 * @private
 */
JXMPPConnection.prototype._doXMPPSessDone = function(iq) {
	if (iq.getType() != 'result' || iq.getType() == 'error') {// failed
		this.disconnect();
		if (iq.getType() == 'error')
			this._handleEvent('onerror', iq.getChild('error'));
		return;
	} else
		this._handleEvent('onconnect');
};

/**
 * @private
 */
JXMPPConnection.prototype._handleEvent = function(event, arg) {
	event = event.toLowerCase();
	// don't be case-sensitive here
	this.oDbg.log("incoming event '" + event + "'", 3);
	if (!this._events[event])
		return;
	this.oDbg.log("handling event '" + event + "'", 2);
	for (var i = 0; i < this._events[event].length; i++) {
		var aEvent = this._events[event][i];
		if ( typeof aEvent.handler == 'function') {
			try {
				if (arg) {
					if (arg.pType) {// it's a packet
						if ((!arg.getNode().hasChildNodes() && aEvent.childName != '*') || (arg.getNode().hasChildNodes() && !arg.getChild(aEvent.childName, aEvent.childNS)))
							continue;
						if (aEvent.type != '*' && arg.getType() != aEvent.type)
							continue;
						this.oDbg.log(aEvent.childName + "/" + aEvent.childNS + "/" + aEvent.type + " => match for handler " + aEvent.handler, 3);
					}
					if (aEvent.handler(arg)) {
						// handled!
						break;
					}
				} else if (aEvent.handler()) {
					// handled!
					break;
				}
			} catch (e) {

					this.oDbg.log(aEvent.handler + "\n>>>" + e.name + ": " + e.message, 1);

			}
		}
	}
};

/**
 * @private
 */
JXMPPConnection.prototype._handlePID = function(aJXMPPPacket) {
	if (!aJXMPPPacket.getID())
		return false;
	for (var i in this._regIDs) {
		if (this._regIDs.hasOwnProperty(i) && this._regIDs[i] && i == aJXMPPPacket.getID()) {
			var pID = aJXMPPPacket.getID();
			this.oDbg.log("handling " + pID, 3);
			try {
				if (this._regIDs[i].cb.call(this, aJXMPPPacket, this._regIDs[i].arg) === false) {
					// don't unregister
					return false;
				} else {
					this._unregisterPID(pID);
					return true;
				}
			} catch (e) {
				// broken handler?
				this.oDbg.log(e.name + ": " + e.message, 1);
				this._unregisterPID(pID);
				return true;
			}
		}
	}
	return false;
};

/**
 * @private
 */
JXMPPConnection.prototype._handleResponse = function(data) {
	var doc = Ti.XML.parseString(data);

	if (!doc || doc.tagName == 'parsererror') {
		this.oDbg.log("parsererror", 1);
		return;
	}

	if (doc.getElementsByTagName('conflict').length > 0) {
		this._setStatus("session-terminate-conflict");
		this._handleEvent('onerror', JXMPPError('503', 'cancel', 'session-terminate'));
		this._handleEvent('ondisconnect');
		this._req.close();
		this.oDbg.log("Disconnected.", 1);
	}

	for (var i = 0; i < doc.childNodes.length; i++) {
		if (this._sendRawCallbacks.length) {
			var cb = this._sendRawCallbacks[0];

			Ti.API.debug("Current CallBack: "+cb);

			this._sendRawCallbacks = this._sendRawCallbacks.slice(1, this._sendRawCallbacks.length);
			cb.fn.call(this, doc.childNodes.item(i), cb.arg);
			continue;
		}

		this._inQ = this._inQ.concat(doc.childNodes.item(i));
		this._checkInQ();
	}
};

/**
 * @private
 */
JXMPPConnection.prototype._parseStreamFeatures = function(doc) {
	if (!doc) {
		this.oDbg.log("nothing to parse ... aborting", 1);
		return false;
	}

	var errorTag;
	if (doc.getElementsByTagNameNS) {
		errorTag = doc.getElementsByTagNameNS(NS_STREAM, "error").item(0);
	} else {
		var errors = doc.getElementsByTagName("error");
		for (var i = 0; i < errors.length; i++)
			if (errors.item(i).namespaceURI == NS_STREAM || errors.item(i).getAttribute('xmlns') == NS_STREAM) {
				errorTag = errors.item(i);
				break;
			}
	}

	if (errorTag) {
		this._setStatus("internal_server_error");
		this._handleEvent('onerror', JXMPPError('503', 'cancel', 'session-terminate'));
		this._connected = false;
		this.oDbg.log("Disconnected.", 1);
		this._handleEvent('ondisconnect');
		this._req.close();
		return false;
	}

	this.mechs = new Object();
	var lMec1 = doc.getElementsByTagName("mechanisms");
	if (!lMec1.length)
		return false;
	this.has_sasl = false;
	for (var i = 0; i < lMec1.length; i++)
		if (lMec1.item(i).getAttribute("xmlns") == NS_SASL) {
			this.has_sasl = true;
			var lMec2 = lMec1.item(i).getElementsByTagName("mechanism");
			for (var j = 0; j < lMec2.length; j++)
				this.mechs[lMec2.item(j).firstChild.nodeValue] = true;
			break;
		}
	if (this.has_sasl)
		this.oDbg.log("SASL detected", 2);
	else {
		this.oDbg.log("No support for SASL detected", 2);
		return true;
	}

	/* [TODO]
	 * check if in-band registration available
	 * check for session and bind features
	 */

	return true;
};

/**
 * @private
 */
JXMPPConnection.prototype._registerPID = function(pID, cb, arg) {
	if (!pID || !cb)
		return false;
	this._regIDs[pID] = new Object();
	this._regIDs[pID].cb = cb;
	if (arg)
		this._regIDs[pID].arg = arg;
	this.oDbg.log("registered " + pID, 3);
	return true;
};


/**
 * @private
 */
JXMPPConnection.prototype._sendRaw = function(xml, cb, arg) {
	if (cb) {
		this._sendRawCallbacks.push({
			fn : cb,
			arg : arg
		});
	}

	this.oDbg.log("Raw Send:" + xml, 3);
	this._req.write(Ti.createBuffer({
		value : xml
	}));

	return true;
};

/**
 * @private
 */
JXMPPConnection.prototype._setStatus = function(status) {
	if (!status || status == '')
		return;
	if (status != this._status) {// status changed!
		this._status = status;
		this._handleEvent('onstatuschanged', status);
		this._handleEvent('status_changed', status);
	}
};

/**
 * @private
 */
JXMPPConnection.prototype._unregisterPID = function(pID) {
	if (!this._regIDs[pID])
		return false;
	this._regIDs[pID] = null;
	this.oDbg.log("unregistered " + pID, 3);
	return true;
};
