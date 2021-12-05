let s = "";
for (let i = 0; i < 10000; i += 1) {
	s += `export const c${i} = defComponent<string>().setName('c${i}');
export type C${i} = typeof c${i};\n`;
}
console.log(s);
