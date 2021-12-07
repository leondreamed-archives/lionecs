// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

/**
 * @type import('ts-jest/dist/types').InitialOptionsTsJest
 */
module.exports = {
	globals: {
		'ts-jest': {
			tsconfig: path.join(__dirname, 'test/tsconfig.json'),
		},
	},
	preset: 'ts-jest',
	testEnvironment: 'node',
	moduleNameMapper: {
		'~/(.*)$': '<rootDir>/src/$1',
		'~test/(.*)$': '<rootDir>/test/$1',
	},
};
