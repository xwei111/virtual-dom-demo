/**
 * Diff two list in O(N).
 * @param {Array} oldList - Original List
 * @param {Array} newList - List After certain insertions, removes, or moves
 * @return {Object} - {moves: <Array>}
 *                  - moves is a list of actions that telling how to remove and insert
 */
function listdiff2(oldList, newList, key) {
    // makeKeyIndexAndFree: 获取keyIndex和free
    // keyIndex: 有key得一组对象，key: key，value: index
    // free: 没有key得集合
    var oldMap = makeKeyIndexAndFree(oldList, key)
    var newMap = makeKeyIndexAndFree(newList, key)

    var newFree = newMap.free

    var oldKeyIndex = oldMap.keyIndex
    var newKeyIndex = newMap.keyIndex

    var moves = []

    // a simulate list to manipulate
    var children = []
    var i = 0
    var item
    var itemKey
    var freeIndex = 0

    // fist pass to check item in old list: if it's removed or not
    // 首先遍历一遍旧数据(oldList)获取children
    // 有key时children取新数据(newList)和旧数据(oldList)的并集，按旧数据中的顺序添加，新旧数据中都没有时添加null
    // 没有key时children按顺序添加newFree中的数据，没有时添加null
    while (i < oldList.length) {
        item = oldList[i]
        itemKey = getItemKey(item, key)
        if (itemKey) {
            if (!newKeyIndex.hasOwnProperty(itemKey)) {
                children.push(null)
            } else {
                var newItemIndex = newKeyIndex[itemKey]
                children.push(newList[newItemIndex])
            }
        } else {
            var freeItem = newFree[freeIndex++]
            children.push(freeItem || null)
        }
        i++
    }
    var simulateList = children.slice(0)

    // remove items no longer exist
    // 遍历simulateList
    // simulateList为null的位置在moves中添加{ index: index, type: 0 }，type为0标识移除，同时移除simulateList该位置的null

    i = 0
    while (i < simulateList.length) {
        if (simulateList[i] === null) {
            remove(i)
            removeSimulate(i)
        } else {
            i++
        }
    }

    // i is cursor pointing to a item in new list
    // j is cursor pointing to a item in simulateList
    // 遍历新数据（newList），和simulateList各项对比
    // 当没有simulateItem时直接在moves中添加{ index: index, item: item, type: 1 }，type为1表示插入

    var j = i = 0
    while (i < newList.length) {
        item = newList[i]
        itemKey = getItemKey(item, key)

        var simulateItem = simulateList[j]
        var simulateItemKey = getItemKey(simulateItem, key)

        if (simulateItem) {
            if (itemKey === simulateItemKey) {
                j++
            } else {
                // new item, just inesrt it
                // 旧数据是否存在该key
                if (!oldKeyIndex.hasOwnProperty(itemKey)) {
                    insert(i, item)
                } else {
                    // if remove current simulateItem make item in right place
                    // then just remove it
                    // 和simulateList下一条key对比
                    var nextItemKey = getItemKey(simulateList[j + 1], key)
                    if (nextItemKey === itemKey) {
                        remove(i)
                        removeSimulate(j)
                        j++ // after removing, current j is right, just jump to next one
                    } else {
                        // else insert item
                        insert(i, item)
                    }
                }
            }
        } else {
            insert(i, item)
        }

        i++
    }

    function remove(index) {
        var move = { index: index, type: 0 }
        moves.push(move)
    }

    function insert(index, item) {
        var move = { index: index, item: item, type: 1 }
        moves.push(move)
    }

    function removeSimulate(index) {
        simulateList.splice(index, 1)
    }

    return {
        moves: moves,
        children: children
    }
}

/**
 * Convert list to key-item keyIndex object.
 * @param {Array} list
 * @param {String|Function} key
 */
function makeKeyIndexAndFree(list, key) {
    var keyIndex = {}
    var free = []
    for (var i = 0, len = list.length; i < len; i++) {
        var item = list[i]
        var itemKey = getItemKey(item, key)
        if (itemKey) {
            keyIndex[itemKey] = i
        } else {
            free.push(item)
        }
    }
    return {
        keyIndex: keyIndex,
        free: free
    }
}

function getItemKey(item, key) {
    if (!item || !key) return void 666
    return typeof key === 'string'
        ? item[key]
        : key(item)
}

