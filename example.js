import fs from 'node:fs/promises'
import {micromark} from 'micromark'
import {variables} from './index.js'

const buf = await fs.readFile('example.md')
const out = micromark(buf, {extensions: [variables]})
console.log(out)
