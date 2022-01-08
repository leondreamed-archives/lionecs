import * as process from 'node:process';
import { execaCommandSync as exec } from 'execa';
import fs from 'fs-extra';

process.chdir('..');

fs.rmSync('dist', { force: true, recursive: true });
exec('tsc');
exec('tsc-alias -p tsconfig.json');

for (const pluginDir of fs.readdirSync('src/plugins')) {
	const pluginPath = `src/plugins/${pluginDir}`;
	const pluginDestPath = `dist/plugin/${pluginDir}`;

	fs.mkdirpSync('dist/plugin');
	exec(`tsc -p ${pluginPath}/tsconfig.json --outDir ${pluginDestPath}`);
	exec(`tsc-alias -p ${pluginPath}/tsconfig.json`);

	// Copies the plugin's package.json if it has one
	if (fs.existsSync(`${pluginPath}/package.json`)) {
		fs.copyFileSync(
			`${pluginPath}/package.json`,
			`${pluginDestPath}/package.json`
		);
	}
}

fs.copyFileSync('package.json', 'dist/package.json');
