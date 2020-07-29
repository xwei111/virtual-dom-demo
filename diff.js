const diff = (oldData, newData) => {
    let index = 0; // 记录节点标识
    let patches = {}; // 记录各个节点变化(补丁)
    diffRun(oldData, newData, index, patches);
    return patches;
}

function diffRun(oldNode, newNode, index, patches) {
    let currentPatch = []; // 记录当前节点的补丁
    if (typeof oldNode === "string" && typeof newNode === "string") {
        // 文本不同，添加文本变化补丁
        oldNode !== newNode && currentPatch.push({ type: TEXT, content: newNode })
    } else if (newNode !== null && oldNode.tag === newNode.tag && oldNode.key === newNode.key) {
        // 节点相同，比较属性
        const propsPatches = diffProps(oldNode, newNode)
        // 属性存在差异，为节点添加属性变化补丁
        propsPatches && currentPatch.push({ type: PROPS, props: propsPatches })
        // 比较子节点
        diffChildren(
            oldNode.children,
            newNode.children,
            index,
            patches,
            currentPatch
        )
    } else if (newNode !== null) {
        // 节点不同且节点存在，为节点添加替换补丁
        currentPatch.push({ type: REPLACE, node: newNode })
    }
    
    if (currentPatch.length) {
        // 当前节点存在补丁，记录到对应标识位
        patches[index] = currentPatch
    }
}
// 新旧属性比较
function diffProps(oldNode, newNode) {
    let isHave = false;
    let propsPatch = {}
    const newProps = newNode.props;
    const oldProps = oldNode.props;
    // 遍历旧属性，如有新属性值不同的记录下来
    Object.keys(oldProps).map(e => {
        if (newProps[e] !== oldProps[e]) {
            propsPatch[e] = newProps[e]
            isHave = true
        }
    })
    // 遍历新属性，如旧属性没有新属性记录下来
    Object.keys(newProps).map(e => {
        if (!oldProps[e]) {
            propsPatch[e] = newProps[e]
            isHave = true
        }
    })
    if (isHave !== true) {
        return null
    }
    return propsPatch
}
// 子节点比较
function diffChildren(oldChildren, newChildren, index, patches, currentPatch) {
    // listdiff2 为list-diff2 算法，该算法的时间复杂度 O(n*m)
    // diffs.children 是新DOM树中含有的旧DOM树的数据，没有则为null
    // diffs.moves 是旧DOM各个节点的相应变动及新DOM中新增的节点的变动
    // 后续附上list-diff2源码分析
    var diffs = listdiff2(oldChildren, newChildren, 'key')
    newChildren = diffs.children // 旧DOM树中未删除的节点
    if (diffs.moves.length) {
        // moves存在子集，添加替换补丁
        var reorderPatch = { type: REORDER, moves: diffs.moves }
        currentPatch.push(reorderPatch)
    }
    var leftNode = null
    var currentNodeIndex = index
    // 深度遍历子节点
    oldChildren.forEach((child, i) => {
        var newChild = newChildren[i]
        currentNodeIndex = (leftNode && leftNode.count)
            ? currentNodeIndex + leftNode.count + 1
            : currentNodeIndex + 1
        diffRun(child, newChild, currentNodeIndex, patches)
        leftNode = child
    })
}