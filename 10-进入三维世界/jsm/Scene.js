/**
 * 收集所有的三维对象进行绘制
 */
const defAttr = () => ({
  gl: null,
  // 所有三维对象的集合
  children: [],
});
export default class Scene {
  constructor(attr) {
    // 将参数和默认属性合并到this中
    Object.assign(this, defAttr(), attr);
  }
  init() {
    const { children, gl } = this;
    children.forEach((obj) => {
      obj.init(gl);
    });
  }
  add(...objs) {
    const { children, gl } = this;
    objs.forEach((obj) => {
      children.push(obj);
      obj.parent = this;
      obj.init(gl);
    });
  }
  unshift(...objs) {
    const { children, gl } = this;
    objs.forEach((obj) => {
      children.unshift(obj);
      obj.parent = this;
      obj.init(gl);
    });
  }
  remove(obj) {
    const { children } = this;
    const i = children.indexOf(obj);
    if (i !== -1) {
      //splice()如果删除一个元素，则返回一个元素的数组。 如果未删除任何元素，则返回空数组。
      children.splice(i, 1);
    }
  }
  setUniform(key, val) {
    this.children.forEach(({ mat }) => {
      mat.setData(key, val);
    });
  }
  draw() {
    const { gl, children } = this;
    gl.clear(gl.COLOR_BUFFER_BIT);
    children.forEach((obj) => {
      const {
        geo: { drawType, count },
        mat: { mode, program },
      } = obj;
      gl.useProgram(program);
      obj.update(gl);
      if (typeof mode === "string") {
        this[drawType](gl, count, mode);
      } else {
        mode.forEach((m) => {
          this[drawType](gl, count, m);
        });
      }
    });
  }
  // gl[mode] 动态属性写法[]就是.属性名使用变量获取传入
  drawArrays(gl, count, mode) {
    gl.drawArrays(gl[mode], 0, count);
  }
  drawElements(gl, count, mode) {
    gl.drawElements(gl[mode], count, gl.UNSIGNED_BYTE, 0);
  }
}
