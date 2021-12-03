import { defineBuildConfig } from 'unbuild';

// eslint-disable-next-line import/no-default-export
export default defineBuildConfig({
	entries: [
		'./src/*.ts',
	],
	declaration: true,
});
