module.exports = {
	extends: '../../../.eslintrc.cjs',
	parserOptions: {
		parser: '@typescript-eslint/parser',
		project: ['./tsconfig.eslint.json'],
		ecmaVersion: 2018,
		sourceType: 'module',
	},
};
