const path = require('path');

module.exports = {
	extends: '../../../.eslintrc.cjs',
	parserOptions: {
		parser: '@typescript-eslint/parser',
		project: [path.resolve(__dirname, './tsconfig.eslint.json')],
		ecmaVersion: 2018,
		sourceType: 'module',
	},
};
