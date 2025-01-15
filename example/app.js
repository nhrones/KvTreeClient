import { DbClient } from './remoteKv.js'
import { renderTreeView } from "../lib/ztreeView.js"
/** 
 * our KvDb source 
 */
const thisDB = new DbClient()

// on init, returns a set of key/values from a Kv database
thisDB.init(buildTreeView)

/** 
 * use the raw kvData to build and display a Kv-TreeView
 */
function buildTreeView(kvData) {
    renderTreeView(kvData, document.querySelector('.root'));
}