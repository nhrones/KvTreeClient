import { buildTreeNodes } from "./nodes.ts"
import { createTree } from "./build.ts"
export type KVNode = {
   key: string;
   value: any;
   type: any;
   isExpanded: boolean;
   el: HTMLElement;
   parent: HTMLElement;
   children: any[];
   depth: number;
   dispose: any
}
/**
 * Render an object-tree into a DOM container
 * @param { string } data a string with kv-data objects
 * @param { HTMLElement } targetElement Element to place this treeView
 */
export function renderTreeView(data: string, targetElement: HTMLElement): void {
   const containerEl = document.createElement('div');
   containerEl.className = 'elem-container';

   const nodes: any = buildTreeNodes(JSON.parse(data))
   const tree: KVNode = createTree(nodes.kv);

   traverse(tree, function (node: KVNode) {
      node.el = createNodeElement(node);
      containerEl.appendChild(node.el);
   });
   targetElement.innerHTML = ""
   targetElement.appendChild(containerEl);
}

function hideNodeChildren(node: KVNode): void {
   node.children.forEach((child) => {
      child.el.classList.add('hidden');
      if (child.isExpanded) {
         hideNodeChildren(child);
      }
   });
}

function showNodeChildren(node: KVNode): void {
   node.children.forEach((child) => {
      child.el.classList.remove('hidden');
      if (child.isExpanded) {
         showNodeChildren(child);
      }
   });
}

function setCaretIconDown(node: KVNode): void {
   if (node.children.length > 0) {
      const icon = node.el.querySelector('.' + 'fas');
      if (icon) {
         icon.classList.replace('fa-caret-right', 'fa-caret-down');
      }
   }
}

function setCaretIconRight(node: KVNode): void {
   if (node.children.length > 0) {
      const icon = node.el.querySelector('.' + 'fas');
      if (icon) {
         icon.classList.replace('fa-caret-down', 'fa-caret-right');
      }
   }
}

/**
 * Create a DOM element from node object
 * @param {object} node 
 * @return html element
 */
function createNodeElement(node: KVNode): HTMLElement {
   const el = document.createElement('div');
   if (node.children.length > 0) {
      el.innerHTML = expandedTemplate({
         key: node.key,
         value: node.value,
         size: getSizeString(node) as string,
      })
      const caretEl = el.querySelector('.' + 'caret-icon') as HTMLElement;
      caretEl.addEventListener('click', () => toggleNode(node));
      node.dispose = caretEl.removeEventListener('click', () => toggleNode(node));
   } else {
      el.innerHTML = collapsedTemplate({
         key: node.key,
         value: node.value,
         type: node.value === '{}' ? 'object' : typeof node.value
      })
   }

   const lineEl = el.children[0] as HTMLElement;

   if (node.parent !== null) {
      lineEl.classList.add('hidden');
   }
   //@ts-ignore
   lineEl.style = 'margin-left: ' + node.depth * 18 + 'px;';

   return lineEl;
}

const getSizeString = (node: KVNode): any => {
   const len = node.children.length;
   if (node.type === 'array') return `[${len}]`;
   if (node.type === 'object') return `{${len}}`;
   return null;
}

// =============================
//            exports 
// =============================

/**
 * toggle tree-node is-expanded flag
 * @param {*} node a tree-node object
 */
export function toggleNode(node: KVNode): void {
   if (node.isExpanded) {
      node.isExpanded = false;
      setCaretIconRight(node);
      hideNodeChildren(node);
   } else {
      node.isExpanded = true;
      setCaretIconDown(node);
      showNodeChildren(node);
   }
}

/**
 * Recursively traverse a tree-object
 * @param { any } node
 * @param {Callback} callback
 */
export function traverse(node: KVNode, callback: any): void {
   callback(node);
   if (node.children.length > 0) {
      node.children.forEach((child) => {
         traverse(child, callback);
      });
   }
}

/**
 * Expands a tree-node
 * @param {object} node 
 */
export function expand(node): void {
   traverse(node, function (child) {
      child.el.classList.remove('hidden');
      child.isExpanded = true;
      setCaretIconDown(child);
   });
}

/**
 * Collapse a tree-node
 * @param {object} node 
 */
export function collapse(node): void {
   traverse(node, function (child) {
      child.isExpanded = false;
      if (child.depth > node.depth) child.el.classList.add('hidden');
      setCaretIconRight(child);
   });
}

/**
 * Destroy the tree
 * @param {object} tree 
 */
export function destroy(tree): void {
   traverse(tree, (node) => {
      if (node.dispose) {
         node.dispose();
      }
      tree.el.parentNode.parentNode.removeChild(node);
   })
}

/** 
 * Return a collapsed tree element 
 */
export function collapsedTemplate(params = {key:"", value:null, type:""}): string {
   const { key, value, type } = params;
   return `
     <div class="line">
       <div class="empty-icon"></div>
       <div class="json-key">${key}</div>
       <div class="json-separator">:</div>
       <div class="json-value json-${type}">${value}</div>
     </div>
   `;
}

/** 
 * Return an expanded tree element  
 */
export function expandedTemplate(params: {key: string, value:any, size: string}): string {
   const { key, size } = params;
   return `
     <div class="line">
       <div class="caret-icon"><i class="fas fa-caret-right"></i></div>
       <div class="json-key">${key}</div>
       <div class="json-size">${size}</div>
     </div>
   `;
 }