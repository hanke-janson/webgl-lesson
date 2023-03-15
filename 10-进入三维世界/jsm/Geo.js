/**
 * 几何体对象
 */
// 默认属性
const defAttr = () => ({
  // data顶点数据结构
  // array 存储所有的attribute 数据
  // size 构成一个顶点的所有分量的数目
  // buffer 用createBuffer() 方法建立的缓冲对象
  // location 用getAttribLocation() 方法获取的attribute变量
  // needUpdate 在连续渲染时，是否更新缓冲对象
  // {
  //   a_Position: {
  //     array:类型数组,
  //     size:矢量长度,
  //     buffer:缓冲对象,
  //     location:attribute变量,
  //     needUpdate：true
  //   },
  //   a_Color: {
  //     array:类型数组,
  //     size:矢量长度,
  //     buffer:缓冲对象,
  //     location:attribute变量,
  //     needUpdate：true
  //   },
  //   ……
  // }
  data: {},
  // 顶点总数
  count: 0,
  // 顶点索引数据
  // 默认为null，用drawArrays 的方式绘图
  // 若不为null，用drawElements 的方式绘图
  index: null,
  // 绘图方式
  // drawArrays 使用顶点集合绘图，默认
  // drawElements，使用顶点索引绘图
  drawType: "drawArrays",
});
export default class Geo {
  constructor(attr) {
    // 将对象入参复制给默认属性
    Object.assign(this, defAttr(), attr);
  }
  // 会在场景 Scene 初始化时被调用
  init(gl, program) {
    gl.useProgram(program);
    this.initData(gl, program);
    this.initIndex(gl);
  }
  // 初始化顶点数据
  initData(gl, program) {
    // 遍历顶点数据
    for (let [key, attr] of Object.entries(this.data)) {
      attr.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        // 顶点数据
        attr.array,
        // 数据写入方式
        gl.STATIC_DRAW
      );
      const location = gl.getAttribLocation(program, key);
      gl.vertexAttribPointer(
        // attribute变量
        location,
        // 顶点的矢量长度
        attr.size,
        // 数据类型
        gl.FLOAT,
        // 是否归一化
        false,
        // 在没有使用多attribute合一的情况下，最后两个参数可以为0
        // 类目数据的字节长度
        0,
        // 系列的字节索引
        0
      );
      gl.enableVertexAttribArray(location);
      attr.location = location;
    }
  }
  // 初始化顶点索引
  // 顶点索引数据结构
  // {
  //     array:类型数组,
  //     buffer:缓冲对象,
  //     needUpdate：true
  // }
  initIndex(gl) {
    const { index } = this;
    //默认index索引值为null
    if (index) {
      this.count = index.array.length;
      // 如果是顶点索引绘图方式
      this.drawType = "drawElements";
      index.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index.buffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index.array, gl.STATIC_DRAW);
    } else {
      // 这里设置顶点属性名写死了
      const { array, size } = this.data["a_Position"];
      this.count = array.length / size;
      this.drawType = "drawArrays";
    }
  }
  // 更新方法，用于连续渲染
  update(gl) {
    this.updateData(gl);
    this.updateIndex(gl);
  }
  updateData(gl) {
    for (let attr of Object.values(this.data)) {
      const { buffer, location, size, needUpdate, array } = attr;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      if (needUpdate) {
        attr.needUpdate = false;
        gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
      }
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    }
  }
  updateIndex(gl) {
    const { index } = this;
    if (index) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index.buffer);
      if (index.needUpdate) {
        index.needUpdate = false;
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index.array, gl.STATIC_DRAW);
      }
    }
  }
  setData(key, val) {
    const obj = this.data[key];
    if (!obj) {
      return;
    }
    obj.needUpdate = true;
    Object.assign(obj, val);
  }
  setIndex(val) {
    const { index } = this;
    if (val) {
      index.needUpdate = true;
      index.array = val;
      this.count = val.length;
      this.drawType = "drawElements";
    } else {
      const { array, size } = this.data["a_Position"];
      this.count = array.length / size;
      this.drawType = "drawArrays";
    }
  }
}
