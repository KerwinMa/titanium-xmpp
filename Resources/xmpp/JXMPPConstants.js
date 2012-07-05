exports.NS_DISCO_ITEMS =  "http://jabber.org/protocol/disco#items";
exports.NS_DISCO_INFO =   "http://jabber.org/protocol/disco#info";
exports.NS_VCARD =        "vcard-temp";
exports.NS_AUTH =         "jabber:iq:auth";
exports.NS_AUTH_ERROR =   "jabber:iq:auth:error";
exports.NS_REGISTER =     "jabber:iq:register";
exports.NS_SEARCH =       "jabber:iq:search";
exports.NS_ROSTER =       "jabber:iq:roster";
exports.NS_PRIVACY =      "jabber:iq:privacy";
exports.NS_PRIVATE =      "jabber:iq:private";
exports.NS_VERSION =      "jabber:iq:version";
exports.NS_TIME =         "jabber:iq:time";
exports.NS_TIME_NEW =     "urn:xmpp:time";
exports.NS_LAST =         "jabber:iq:last";
exports.NS_XDATA =        "jabber:x:data";
exports.NS_IQDATA =       "jabber:iq:data";
exports.NS_DELAY =        "jabber:x:delay";
exports.NS_DELAY_NEW =    "urn:xmpp:delay";
exports.NS_EXPIRE =       "jabber:x:expire";
exports.NS_EVENT =        "jabber:x:event";
exports.NS_XCONFERENCE =  "jabber:x:conference";
exports.NS_PING =         "urn:xmpp:ping";
exports.NS_CHAT_STATES =  "http://jabber.org/protocol/chatstates";
exports.NS_STATS =        "http://jabber.org/protocol/stats";
exports.NS_MUC =          "http://jabber.org/protocol/muc";
exports.NS_MUC_USER =     "http://jabber.org/protocol/muc#user";
exports.NS_MUC_ADMIN =    "http://jabber.org/protocol/muc#admin";
exports.NS_MUC_OWNER =    "http://jabber.org/protocol/muc#owner";
exports.NS_PUBSUB =       "http://jabber.org/protocol/pubsub";
exports.NS_PUBSUB_EVENT = "http://jabber.org/protocol/pubsub#event";
exports.NS_PUBSUB_OWNER = "http://jabber.org/protocol/pubsub#owner";
exports.NS_PUBSUB_NMI =   "http://jabber.org/protocol/pubsub#node-meta-info";
exports.NS_COMMANDS =     "http://jabber.org/protocol/commands";
exports.NS_STREAM =       "http://etherx.jabber.org/streams";
exports.NS_CLIENT =       "jabber:client";

exports.NS_BOSH =         "http://jabber.org/protocol/httpbind";
exports.NS_XBOSH =        "urn:xmpp:xbosh";

exports.NS_STANZAS =      "urn:ietf:params:xml:ns:xmpp-stanzas";
exports.NS_STREAMS =      "urn:ietf:params:xml:ns:xmpp-streams";

exports.NS_TLS =          "urn:ietf:params:xml:ns:xmpp-tls";
exports.NS_SASL =         "urn:ietf:params:xml:ns:xmpp-sasl";
exports.NS_SESSION =      "urn:ietf:params:xml:ns:xmpp-session";
exports.NS_BIND =         "urn:ietf:params:xml:ns:xmpp-bind";

exports.NS_FEATURE_IQAUTH = "http://jabber.org/features/iq-auth";
exports.NS_FEATURE_IQREGISTER = "http://jabber.org/features/iq-register";
exports.NS_FEATURE_COMPRESS = "http://jabber.org/features/compress";

exports.NS_COMPRESS =     "http://jabber.org/protocol/compress";
/*
function STANZA_ERROR(code, type, cond) {
  this.code = code;
  this.type = type;
  this.cond = cond;
}


exports.ERR_BAD_REQUEST = STANZA_ERROR("400", "modify", "bad-request");
exports.ERR_CONFLICT = STANZA_ERROR("409", "cancel", "conflict");
exports.ERR_FEATURE_NOT_IMPLEMENTED = STANZA_ERROR("501", "cancel", "feature-not-implemented");
exports.ERR_FORBIDDEN = STANZA_ERROR("403", "auth",   "forbidden");
exports.ERR_GONE = STANZA_ERROR("302", "modify", "gone");
exports.ERR_INTERNAL_SERVER_ERROR = STANZA_ERROR("500", "wait",   "internal-server-error");
exports.ERR_ITEM_NOT_FOUND = STANZA_ERROR("404", "cancel", "item-not-found");
exports.ERR_JID_MALFORMED = STANZA_ERROR("400", "modify", "jid-malformed");
exports.ERR_NOT_ACCEPTABLE = STANZA_ERROR("406", "modify", "not-acceptable");
exports.ERR_NOT_AUTHORIZED = STANZA_ERROR("401", "auth",   "not-authorized");
exports.ERR_PAYMENT_REQUIRED = STANZA_ERROR("402", "auth",   "payment-required");
exports.ERR_RECIPIENT_UNAVAILABLE = STANZA_ERROR("404", "wait",   "recipient-unavailable");
exports.ERR_REDIRECT = STANZA_ERROR("302", "modify", "redirect");
exports.ERR_REGISTRATION_REQUIRED = STANZA_ERROR("407", "auth",   "registration-required");
exports.ERR_REMOTE_SERVER_NOT_FOUND = STANZA_ERROR("404", "cancel", "remote-server-not-found");
exports.ERR_REMOTE_SERVER_TIMEOUT = STANZA_ERROR("504", "wait",   "remote-server-timeout");
exports.ERR_RESOURCE_CONSTRAINT = STANZA_ERROR("500", "wait",   "resource-constraint");
exports.ERR_SERVICE_UNAVAILABLE = STANZA_ERROR("503", "cancel", "service-unavailable");
exports.ERR_SUBSCRIPTION_REQUIRED = STANZA_ERROR("407", "auth",   "subscription-required");
exports.ERR_UNEXPECTED_REQUEST =  STANZA_ERROR("400", "wait",   "unexpected-request");
*/