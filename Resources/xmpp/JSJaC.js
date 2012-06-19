var JSJaC = {
	Version : '0.1',
	require : function(libraryName) {
		Ti.include(libraryName);
	},
	load : function() {
		var includes = ['xmlextras', 'jsextras', 'crypt', 'JSJaCConfig', 'JSJaCConstants', 'JSJaCJSON', 'JSJaCJID', 'JSJaCBuilder', 'JSJaCPacket', 'JSJaCError', 'JSJaCKeys', 'JSJaCConnection', 'JSJaCConsoleLogger'];
		for( i = 0; i < includes.length; i++)
			this.require(includes[i] + '.js');
	},
	bind : function(fn, obj, optArg) {
		return function(arg) {
			return fn.apply(obj, [arg, optArg]);
		};
	}
};