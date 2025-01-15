// deno-lint-ignore-file no-explicit-any

/**
 * Convert Kv data into a collection that simplifies    
 * building a custom DOM-TreeView.
 * @param { object } nodes an array of db key/values 
 */
export function buildTreeNodes(nodes): object {
   const to = { kv: {} }
   for (let index = 0; index < nodes.length; index++) {
      processNode(to, nodes[index])
   }
   return to;
}

// convert db key values to an efficient tree-node object 
function processNode(to: { kv: any; }, node: any[]): void {

   const k = node[0]
   const v = node[1]
   const length = k.length

   if (length > 0) {
      to.kv[`${k[0]}`] = (to.kv[`${k[0]}`])
         ? to.kv[`${k[0]}`] 
         : (length === 1) ? v : {}
   }

   if (length > 1) {
      to.kv[`${k[0]}`][`${k[1]}`] = (to.kv[`${k[0]}`][`${k[1]}`])
         ? to.kv[`${k[0]}`][`${k[1]}`] 
         : (length === 2) ? v : {}
   }

   if (length > 2) {
      to.kv[`${k[0]}`][`${k[1]}`][`${k[2]}`] = 
         (to.kv[`${k[0]}`][`${k[1]}`][`${k[2]}`])
            ? to.kv[`${k[0]}`][`${k[1]}`][`${k[2]}`] 
            : (length === 3) ? v : {}
   }

   if (length > 3) {
      to.kv[`${k[0]}`][`${k[1]}`][`${k[2]}`][`${k[3]}`] = 
         (to.kv[`${k[0]}`][`${k[1]}`][`${k[2]}`][`${k[3]}`])
            ? to.kv[`${k[0]}`][`${k[1]}`][`${k[2]}`][`${k[3]}`] 
            : (length === 4) ? v : {}
   }
   
   if (length > 4) {
      to.kv[`${k[0]}`][`${k[1]}`][`${k[2]}`][`${k[3]}`][`${k[4]}`] = 
         (to.kv[`${k[0]}`][`${k[1]}`][`${k[2]}`][`${k[3]}`][`${k[4]}`])
            ? to.kv[`${k[0]}`][`${k[1]}`][`${k[2]}`][`${k[3]}`][`${k[4]}`] 
            : (length === 5) ? v : {}
   }
      
   if (length > 5) {
      to.kv[`${k[0]}`][`${k[1]}`][`${k[2]}`][`${k[3]}`][`${k[4]}`][`${k[5]}`] = 
         (to.kv[`${k[0]}`][`${k[1]}`][`${k[2]}`][`${k[3]}`][`${k[4]}`][`${k[5]}`])
            ? to.kv[`${k[0]}`][`${k[1]}`][`${k[2]}`][`${k[3]}`][`${k[4]}`][`${k[5]}`] 
            : (length === 6) ? v : {}
   }
}
