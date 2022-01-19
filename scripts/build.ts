import { rmDist, copyPackageFiles } from 'lion-system';
import * as process from 'node:process';
import * as fs from 'node:fs';
import { execaCommandSync as exec } from 'execa';

rmDist();
exec('tsc');
exec('tsc-alias -p tsconfig.json');
copyPackageFiles();

for (const pluginDir of fs.readdirSync('src/plugins')) {
	const pluginPath = `src/plugins/${pluginDir}`;
	const pluginDestPath = `dist/plugin/${pluginDir}`;

	fs.mkdirSync('dist/plugin', { recursive: true });
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


