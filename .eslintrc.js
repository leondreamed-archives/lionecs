/* eslint-env node */

module.exports = {
	root: true,
	extends: ['@leonzalion/eslint-config'],
	parserOptions: {
		tsconfigRootDir: __dirname,
	},
	settings: {
		'import/resolver': {
			alias: {
				map: [['~', './src']],
				extensions: ['.ts', '.js'],
			},
		},
	},
};
