/* eslint-env node */

module.exports = {
	extends: '../../../.eslintrc.js',
	parserOptions: {
		parser: '@typescript-eslint/parser',
		project: ['./tsconfig.eslint.json'],
		tsconfigRootDir: __dirname,
		ecmaVersion: 2018,
		sourceType: 'module',
	},
};
