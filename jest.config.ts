import type { InitialOptionsTsJest } from 'ts-jest/dist/types';

const config: InitialOptionsTsJest = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	moduleNameMapper: {
		'~/(.*)$': '<rootDir>/src/$1'
	}
};

// eslint-disable-next-line import/no-default-export
export default config;
