// 建立合成对象
export default class Compose {
  constructor() {
    // parent 父对象， 合成对象可以相互嵌套
    this.parent = null;
    // children 子对象集合， 其集合元素可以是时间轨，也可以是合成对象
    this.children = new Set();
  }
  // 添加子对象方法
  add(obj) {
    obj.parent = this;
    this.children.add(obj);
  }
  // 基于当前时间更新子对象状态的方法
  update(t) {
    this.children.forEach((ele) => {
      ele.update(t);
    });
  }
  // 基于时间轨的目标对象删除时间轨
  deleteByTarget(targrt) {
    const { children } = this;
    for (let child of children) {
      if (child.target === targrt) {
        children.delete(child);
        break;
      }
    }
  }
}
