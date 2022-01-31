const path = require('path');

module.exports = {
	extends: '../../../.eslintrc.cjs',
	parserOptions: {
		parser: '@typescript-eslint/parser',
		project: [path.resolve(__dirname, './tsconfig.eslint.json')],
		tsconfigRootDir: __dirname,
		ecmaVersion: 2018,
		sourceType: 'module',
	},
};
