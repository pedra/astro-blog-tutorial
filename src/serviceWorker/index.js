import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join, resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

/**
 * Experimental & optional 
 */
import { obfuscate } from 'javascript-obfuscator'
import { minify } from 'uglify-js'

const SW_NAME = "sw.js"
const PARTS = ['cache', 'message', 'fetch', 'push', 'sync']
const SW_DIR = resolve(process.cwd(), 'src/serviceWorker')
const UGLIFY = true
const OBFUSCATE = true

/** Mount the serviceWorker 
 * 1. concatenate the "parts" files
 * 2. save the final file (./dist/ | ./src/serviceWorker/)
 */
const createSw = (buildDir) => {
	const target = join(buildDir ?? SW_DIR, SW_NAME)
	const mode = buildDir ? 'pro' : 'dev'
	const partDir = SW_DIR + '/parts'

	let assets = createAssets(buildDir)
	let cache = createCache(buildDir)
	let out = `const CONFIG='/config'\nconst ${cache}\nconst ${assets}\n`

	try {
		PARTS.map(f => out += readFileSync(join(partDir, f + '.js')).toString() + "\n\n")

		// Add Obfuscator & uglify (experimental)
		if (mode === 'pro') {
			if (OBFUSCATE) out = obfuscate(out).getObfuscatedCode()
			if (UGLIFY) out = minify(out, {toplevel: true}).code
		}

		writeFileSync(target, out)

	} catch (error) {
		console.log(error)
	}
}

const createCache = (buildDir) => `CACHE='cache-${new Date().getTime()}${buildDir ? '-pro' : '-dev'}'`

const createAssets = (buildDir) => {
	if (!buildDir) return 'ASSETS=[]'

	const list = treeFiles(buildDir, buildDir)
	let out = "ASSETS=[\n\t'/',"
	list.map(f => out += `\n\t'${f}',`)

	return out + '\n]'
}


// Scan the build directory (./dist)
const treeFiles = (dir, removeDir = '', depth = 1000) => {
	if (depth < 1) return
	const list = []

	readdirSync(dir).forEach((file) => {

		let base = dir + '/' + file

		// Recursive to get directory and tree of files
		if (fs.statSync(base).isDirectory()) {
			var obj = treeFiles(base, removeDir, depth - 1)
			obj.map(o => list.push(o.replace(removeDir, '')))
		} else {
			list.push(base.replace(removeDir, ''))
		}
	})

	return list
}

// Astro "createPlugin" node
const createPlugin = () => ({
	name: "astrojs-my-service-worker",
	hooks: {
		"astro:config:setup": ({ command, injectRoute, injectScript }) => {

			// Mount sw.js file
			createSw()

			// Inject "serviceWorker registry"
			injectScript("head-inline", `\if ('serviceWorker' in navigator) navigator.serviceWorker.register('/${SW_NAME}')`)

			// Inject "serviceWorker dev route"
			if (command === "dev") {
				injectRoute({
					pattern: `/${SW_NAME}`,
					entryPoint: fileURLToPath(new URL("./dev-route.js", import.meta.url)),
				})
			}
		},

		"astro:build:done": async ({ dir }) => {
			// Mount sw.js file
			createSw(fileURLToPath(dir))
		},
	}
})
export default createPlugin
