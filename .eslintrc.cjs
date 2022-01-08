const createAliases = require('@leonzalion/configs/eslint/alias');

module.exports = {
	root: true,
	extends: [require.resolve('@leonzalion/configs/eslint')],
	rules: {
		'object-shorthand': 'off' // Typescript syntax highlighting is broken
	},
	parserOptions: { project: ['./tsconfig.eslint.json'] },
	settings: createAliases({ '~': './src' }),
	ignorePatterns: ["src/plugins"]
};
