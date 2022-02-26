const path = require('path');
const createAliases = require('@leonzalion/configs/eslint/alias.cjs');

module.exports = {
	root: true,
	extends: [require.resolve('@leonzalion/configs/eslint.cjs')],
	rules: {
		'object-shorthand': 'off' // Typescript syntax highlighting is broken
	},
	parserOptions: { project: [path.resolve(__dirname, './tsconfig.eslint.json')] },
	settings: createAliases({ '~': './src' }),
	ignorePatterns: ["src/plugins"]
};
