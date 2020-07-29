/**
 * @param tag dom标签
 * @param props dom属性
 * @param children 子节点
 */
class Element {
    constructor(tag, props, children) {
        // 存储标签、属性、子节点
        this.tag = tag; 
        this.props = props;
        this.children = children
        // 节点唯一标识
        if(props.key) { 
            this.key = props.key
        }
        // 添加子元素个数
        this.setCount(children)
    }
    setCount(children) {
        let count = 0;
        children && children.map((e, i)=>{
            if(e instanceof Element) {
                // 如果元素为节点，将子节点个数加上
                count += e.count
            } else {
                // 节点转化为字符串
                children[i] = e + ''
            }
            count++
        })
        this.count = count
    }
    // 添加到真实DOM中
    render() {
        const el = document.createElement(this.tag);
        // 设置属性
        Object.entries(this.props).map(([key, value])=> el.setAttribute(key, value) )
        const children = this.children || [];
        // 添加子节点
        children.map(e=> el.appendChild((e instanceof Element) ? e.render() : document.createTextNode(e)) )
        return el
    }
}

const createElement = (tag, props, children) => {
    return new Element(tag, props, children)
}