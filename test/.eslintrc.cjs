const createAliases = require('@leonzalion/configs/eslint/alias');

module.exports = {
	extends: '../.eslintrc.cjs',
	parserOptions: { project: ['./tsconfig.json'] },
	settings: createAliases({ '~': '../src', '~test': './' }),
};
