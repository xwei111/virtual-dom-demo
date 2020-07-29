const patch = (node, patches) => {
    let walker = {index: 0} // 记录索引
    patchRun(node, patches, walker)
}

function patchRun(node, patches, walker) {
    const currentPatches = patches[walker.index];
    const len = node.childNodes ? node.childNodes.length : 0;
    // 深度遍历子节点
    for(var i = 0; i < len; i++) {
        walker.index++;
        patchRun(node.childNodes[i], patches, walker)
    }
    // 存在补丁，及更新
    currentPatches && applyPatch(node, currentPatches)
}

function applyPatch(node, currentPatches) {
    currentPatches.map(currentPatch => {
        switch (currentPatch.type) {
            case REPLACE:
                const newNode = (typeof currentPatch.node === 'string')
                    ? document.createTextNode(currentPatch.node)
                    : currentPatch.node.render()
                node.parentNode.replaceChild(newNode, node)
                break;
            case REORDER:
                reorderChildren(node, currentPatch.moves)
                break;
            case PROPS:
                setProps(node, currentPatch.props)
                break;
            case TEXT:
                node.textContent = currentPatch.content
                break;
            default:
                throw new Error('Unknown patch type ' + currentPatch.type)
        }
    })
}

function reorderChildren(node, moves) {
    var staticNodeList = Array.from(node.childNodes);
    var maps = {}
    staticNodeList.forEach(node => {
        // 如果是一个元素节点
        if (node.nodeType === 1) {
            var key = node.getAttribute('key')
            if (key) {
                maps[key] = node
            }
        }
    })
    moves.map(move => {
        const index = move.index;
        if (move.type == 0) {
            if (staticNodeList[index] === node.childNodes[index]) {
                node.removeChild(node.childNodes[index])
            }
            staticNodeList.splice(index, 1)
        } else if (move.type === 1) {
            // type为 1，表示新的dom对象插入该节点 
            var insertNode = maps[move.item.key]
                ? maps[move.item.key].cloneNode(true) // reuse old item
                : (typeof move.item === 'object')
                    ? move.item.render()
                    : document.createTextNode(move.item)
            staticNodeList.splice(index, 0, insertNode)
            node.insertBefore(insertNode, node.childNodes[index] || null)
        }
    })
}

function setProps(node, props) {
    Object.entries(props).map(([key, value]) => {
        !value && node.removeAttribute(key)
        value && setAttr(node, key, value)
    })
}

function setAttr(node, key, value) {
    switch (key) {
        case 'style':
            node.style.cssText = value
            break
        case 'value':
            var tagName = node.tagName || ''
            tagName = tagName.toLowerCase()
            if (
                tagName === 'input' || tagName === 'textarea'
            ) {
                node.value = value
            } else {
                // if it is not a input or textarea, use `setAttribute` to set
                node.setAttribute(key, value)
            }
            break
        default:
            node.setAttribute(key, value)
            break
    }
}