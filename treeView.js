// deno-lint-ignore-file
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .src/nodes.ts
function buildTreeNodes(nodes) {
  const to = { kv: {} };
  for (let index = 0; index < nodes.length; index++) {
    processNode(to, nodes[index]);
  }
  return to;
}
__name(buildTreeNodes, "buildTreeNodes");
function processNode(to, node) {
  const k = node[0];
  const v = node[1];
  const length = k.length;
  if (length > 0) {
    to.kv[`${k[0]}`] = to.kv[`${k[0]}`] ? to.kv[`${k[0]}`] : length === 1 ? v : {};
  }
  if (length > 1) {
    to.kv[`${k[0]}`][`${k[1]}`] = to.kv[`${k[0]}`][`${k[1]}`] ? to.kv[`${k[0]}`][`${k[1]}`] : length === 2 ? v : {};
  }
  if (length > 2) {
    to.kv[`${k[0]}`][`${k[1]}`][`${k[2]}`] = to.kv[`${k[0]}`][`${k[1]}`][`${k[2]}`] ? to.kv[`${k[0]}`][`${k[1]}`][`${k[2]}`] : length === 3 ? v : {};
  }
  if (length > 3) {
    to.kv[`${k[0]}`][`${k[1]}`][`${k[2]}`][`${k[3]}`] = to.kv[`${k[0]}`][`${k[1]}`][`${k[2]}`][`${k[3]}`] ? to.kv[`${k[0]}`][`${k[1]}`][`${k[2]}`][`${k[3]}`] : length === 4 ? v : {};
  }
  if (length > 4) {
    to.kv[`${k[0]}`][`${k[1]}`][`${k[2]}`][`${k[3]}`][`${k[4]}`] = to.kv[`${k[0]}`][`${k[1]}`][`${k[2]}`][`${k[3]}`][`${k[4]}`] ? to.kv[`${k[0]}`][`${k[1]}`][`${k[2]}`][`${k[3]}`][`${k[4]}`] : length === 5 ? v : {};
  }
  if (length > 5) {
    to.kv[`${k[0]}`][`${k[1]}`][`${k[2]}`][`${k[3]}`][`${k[4]}`][`${k[5]}`] = to.kv[`${k[0]}`][`${k[1]}`][`${k[2]}`][`${k[3]}`][`${k[4]}`][`${k[5]}`] ? to.kv[`${k[0]}`][`${k[1]}`][`${k[2]}`][`${k[3]}`][`${k[4]}`][`${k[5]}`] : length === 6 ? v : {};
  }
}
__name(processNode, "processNode");

// .src/build.ts
function createTree(kvData) {
  const rootNode = createNode({
    value: kvData,
    key: "kv-prefix:",
    type: getDataType(kvData)
  });
  createSubnode(kvData, rootNode);
  return rootNode;
}
__name(createTree, "createTree");
function createNode(opt) {
  let value = opt["value"] ?? null;
  if (isEmptyObject(value)) value = "{ }";
  if (opt.type === "string") value = `"${value}"`;
  return {
    key: opt.key || null,
    parent: opt.parent || null,
    value,
    isExpanded: opt.isExpanded || false,
    type: opt.type || null,
    children: opt.children || [],
    el: opt.el || null,
    depth: opt.depth || 0,
    dispose: null
  };
}
__name(createNode, "createNode");
function createSubnode(data, node) {
  if (typeof data === "object") {
    for (const key in data) {
      const child = createNode({
        value: data[key],
        key,
        depth: node.depth + 1,
        type: getDataType(data[key]),
        parent: node
      });
      node.children.push(child);
      createSubnode(data[key], child);
    }
  }
}
__name(createSubnode, "createSubnode");
function getDataType(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}
__name(getDataType, "getDataType");
function isEmptyObject(value) {
  return getDataType(value) === "object" && Object.keys(value).length === 0;
}
__name(isEmptyObject, "isEmptyObject");

// .src/render.ts
function renderTreeView(data, targetElement) {
  const containerEl = document.createElement("div");
  containerEl.className = "elem-container";
  const nodes = buildTreeNodes(JSON.parse(data));
  const tree = createTree(nodes.kv);
  traverse(tree, function(node) {
    node.el = createNodeElement(node);
    containerEl.appendChild(node.el);
  });
  targetElement.innerHTML = "";
  targetElement.appendChild(containerEl);
}
__name(renderTreeView, "renderTreeView");
function hideNodeChildren(node) {
  node.children.forEach((child) => {
    child.el.classList.add("hidden");
    if (child.isExpanded) {
      hideNodeChildren(child);
    }
  });
}
__name(hideNodeChildren, "hideNodeChildren");
function showNodeChildren(node) {
  node.children.forEach((child) => {
    child.el.classList.remove("hidden");
    if (child.isExpanded) {
      showNodeChildren(child);
    }
  });
}
__name(showNodeChildren, "showNodeChildren");
function setCaretIconDown(node) {
  if (node.children.length > 0) {
    const icon = node.el.querySelector(".fas");
    if (icon) {
      icon.classList.replace("fa-caret-right", "fa-caret-down");
    }
  }
}
__name(setCaretIconDown, "setCaretIconDown");
function setCaretIconRight(node) {
  if (node.children.length > 0) {
    const icon = node.el.querySelector(".fas");
    if (icon) {
      icon.classList.replace("fa-caret-down", "fa-caret-right");
    }
  }
}
__name(setCaretIconRight, "setCaretIconRight");
function createNodeElement(node) {
  const el = document.createElement("div");
  if (node.children.length > 0) {
    el.innerHTML = expandedTemplate({
      key: node.key,
      value: node.value,
      size: getSizeString(node)
    });
    const caretEl = el.querySelector(".caret-icon");
    caretEl.addEventListener("click", () => toggleNode(node));
    node.dispose = caretEl.removeEventListener("click", () => toggleNode(node));
  } else {
    el.innerHTML = collapsedTemplate({
      key: node.key,
      value: node.value,
      type: node.value === "{}" ? "object" : typeof node.value
    });
  }
  const lineEl = el.children[0];
  if (node.parent !== null) {
    lineEl.classList.add("hidden");
  }
  lineEl.style = "margin-left: " + node.depth * 18 + "px;";
  return lineEl;
}
__name(createNodeElement, "createNodeElement");
var getSizeString = /* @__PURE__ */ __name((node) => {
  const len = node.children.length;
  if (node.type === "array") return `[${len}]`;
  if (node.type === "object") return `{${len}}`;
  return null;
}, "getSizeString");
function toggleNode(node) {
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
__name(toggleNode, "toggleNode");
function traverse(node, callback) {
  callback(node);
  if (node.children.length > 0) {
    node.children.forEach((child) => {
      traverse(child, callback);
    });
  }
}
__name(traverse, "traverse");
function expand(node) {
  traverse(node, function(child) {
    child.el.classList.remove("hidden");
    child.isExpanded = true;
    setCaretIconDown(child);
  });
}
__name(expand, "expand");
function collapse(node) {
  traverse(node, function(child) {
    child.isExpanded = false;
    if (child.depth > node.depth) child.el.classList.add("hidden");
    setCaretIconRight(child);
  });
}
__name(collapse, "collapse");
function destroy(tree) {
  traverse(tree, (node) => {
    if (node.dispose) {
      node.dispose();
    }
    tree.el.parentNode.parentNode.removeChild(node);
  });
}
__name(destroy, "destroy");
function collapsedTemplate(params = { key: "", value: null, type: "" }) {
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
__name(collapsedTemplate, "collapsedTemplate");
function expandedTemplate(params) {
  const { key, size } = params;
  return `
     <div class="line">
       <div class="caret-icon"><i class="fas fa-caret-right"></i></div>
       <div class="json-key">${key}</div>
       <div class="json-size">${size}</div>
     </div>
   `;
}
__name(expandedTemplate, "expandedTemplate");
export {
  collapse,
  collapsedTemplate,
  destroy,
  expand,
  expandedTemplate,
  renderTreeView,
  toggleNode,
  traverse
};
