const { root } = require('./helpers');
const { AngularCompilerPlugin } = require('@ngtools/webpack');

const tsconfigs = {
	client: root('./src/tsconfig.browser.json')
};

const aotTsconfigs = {
	client: root('./src/tsconfig.browser.json')
};

function getAotPlugin(platform, aot) {
	return new AngularCompilerPlugin({
		tsConfigPath: aot ? aotTsconfigs[platform] : tsconfigs[platform],
		skipCodeGeneration: !aot
	});
}

module.exports = {
	getAotPlugin: getAotPlugin
};
