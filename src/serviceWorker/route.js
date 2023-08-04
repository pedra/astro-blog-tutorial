import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"

export async function get() {
    const sw = await readFile(fileURLToPath(new URL("./sw.js", import.meta.url)), { encoding: "utf8" })
    return { body: sw }
}
