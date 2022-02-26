import * as fs from 'node:fs';
import { rmDist, copyPackageFiles, chProjectDir } from 'lion-system';
import { execaCommandSync as exec } from 'execa';

chProjectDir(import.meta.url);
rmDist();
exec('tsc');
exec('tsc-alias');
copyPackageFiles();

for (const pluginDir of fs.readdirSync('src/plugins')) {
	const pluginPath = `src/plugins/${pluginDir}`;
	const tempPluginDestPath = `dist/temp-plugin/${pluginDir}`;

	exec(`tsc -p ${pluginPath}/tsconfig.json --outDir ${tempPluginDestPath}`);
	exec(`tsc-alias -p ${pluginPath}/tsconfig.json`);

	const pluginDestPath = `dist/plugins`;
	fs.mkdirSync(pluginDestPath, { recursive: true });

	fs.renameSync(
		`${tempPluginDestPath}/plugins/${pluginDir}/src`,
		`${pluginDestPath}/${pluginDir}`
	);

	// Copies the plugin's package.json if it has one
	if (fs.existsSync(`${pluginPath}/package.json`)) {
		fs.copyFileSync(
			`${pluginPath}/package.json`,
			`${pluginDestPath}/package.json`
		);
	}

	fs.rmSync(tempPluginDestPath, { force: true, recursive: true });
}

fs.rmSync('dist/temp-plugin', { recursive: true });
