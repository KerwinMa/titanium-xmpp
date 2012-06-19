var JXMPP = {
	Version : '0.1',
	require : function(libraryName) {
		Ti.include(libraryName);
	},
	load : function() {
		var includes = ['xmlextras', 'jsextras', 'crypt', 'JXMPPConfig', 'JXMPPConstants',  'JXMPPJID', 'JXMPPBuilder', 'JXMPPPacket', 'JXMPPError', 'JXMPPKeys', 'JXMPPConnection', 'JXMPPConsoleLogger'];
		for( i = 0; i < includes.length; i++)
			this.require(includes[i] + '.js');
	}
};