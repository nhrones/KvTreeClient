
/**
 * Render the tree into a DOM container
 * @param {object} tree
 * @param {htmlElement} targetElement
 */
export function render(tree, targetElement) {
   const containerEl = document.createElement('div');
   containerEl.className = 'elem-container';
   
   traverse(tree, function (node) {
      node.el = createNodeElement(node);
      containerEl.appendChild(node.el);
   });
   targetElement.innerHTML = ""
   targetElement.appendChild(containerEl);
}

function hideNodeChildren(node) {
   node.children.forEach((child) => {
      child.el.classList.add('hidden');
      if (child.isExpanded) {
         hideNodeChildren(child);
      }
   });
}

function showNodeChildren(node) {
   node.children.forEach((child) => {
      child.el.classList.remove('hidden');
      if (child.isExpanded) {
         showNodeChildren(child);
      }
   });
}

function setCaretIconDown(node) {
   if (node.children.length > 0) {
      const icon = node.el.querySelector('.' + 'fas');
      if (icon) {
         icon.classList.replace('fa-caret-right', 'fa-caret-down');
      }
   }
}

function setCaretIconRight(node) {
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
function createNodeElement(node) {
   const el = document.createElement('div');
   if (node.children.length > 0) {
      el.innerHTML = expandedTemplate({
         key: node.key,
         value: node.value,
         size: getSizeString(node),
      })
      const caretEl = el.querySelector('.' + 'caret-icon');
      caretEl.addEventListener('click', () => toggleNode(node));
      node.dispose = caretEl.removeEventListener('click', () => toggleNode(node));
   } else {
      el.innerHTML = collapsedTemplate({
         key: node.key,
         value: node.value,
         type: node.value === '{}' ? 'object' : typeof node.value
      })
   }

   const lineEl = el.children[0];

   if (node.parent !== null) {
      lineEl.classList.add('hidden');
   }

   lineEl.style = 'margin-left: ' + node.depth * 18 + 'px;';

   return lineEl;
}

const getSizeString = (node) => {
   const len = node.children.length;
   if (node.type === 'array') return `[${len}]`;
   if (node.type === 'object') return `{${len}}`;
   return null;
}

// =============================
//            exports 
// =============================

/**
 * toggle tree-node expanded
 * @param {object} node 
 */
export function toggleNode(node) {
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
 * @param {Object} node
 * @param {Callback} callback
 */
export function traverse(node, callback) {
   callback(node);
   if (node.children.length > 0) {
      node.children.forEach((child) => {
         traverse(child, callback);
      });
   }
}

/**
 * expand a tree-node
 * @param {object} node 
 */
export function expand(node) {
   traverse(node, function (child) {
      child.el.classList.remove('hidden');
      child.isExpanded = true;
      setCaretIconDown(child);
   });
}

/**
 * collapse a tree-node
 * @param {object} node 
 */
export function collapse(node) {
   traverse(node, function (child) {
      child.isExpanded = false;
      if (child.depth > node.depth) child.el.classList.add('hidden');
      setCaretIconRight(child);
   });
}

/**
 * destroy a tree
 * @param {object} tree 
 */
export function destroy(tree) {
   traverse(tree, (node) => {
      if (node.dispose) {
         node.dispose();
      }
   })
   tree.el.parentNode.parentNode.removeChild(node);
}

/** 
 * returns a collapsed tree element 
 */
export function collapsedTemplate(params = {}) {
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
 * returns an expanded tree element  
 */
export function expandedTemplate(params = {}) {
   const { key, size } = params;
   return `
     <div class="line">
       <div class="caret-icon"><i class="fas fa-caret-right"></i></div>
       <div class="json-key">${key}</div>
       <div class="json-size">${size}</div>
     </div>
   `;
 }