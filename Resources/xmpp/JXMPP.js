//Ti.include("XMPPutils.js");
var JXMPPJID = require('JXMPPJID');
var JXMPPPacket = require('JXMPPPacket');
var JXMPPError = require('JXMPPError');
var JXMPPConnection = require('JXMPPConnection');
var JXMPPConstants=require("JXMPPConstants");


//class
exports.JID=JXMPPJID;
exports.Packet=JXMPPPacket;
exports.XMPPError=JXMPPError;
exports.Connection=JXMPPConnection;
exports.CONSTANTS=JXMPPConstants;


exports.version = 0.1;
exports.author = 'Jordi Martín';