const defAttr = () => ({
  // webgl上下文对象
  gl: null,
  // 顶点集合
  vertices: [],
  // 每个点对应着一个对象
  geoData: [],
  // 顶点分量的数量，例如一个点的分量有xyz，就是3
  size: 3,
  // attribute变量名称
  attrName: "a_Position",
  // 存储uniform变量
  uniforms: {},
  // 顶点数量
  count: 0,
  // 绘图方式，默认为点
  types: ["POINTS"],
});
export default class Poly {
  constructor(attr) {
    //将默认属性和自定义属性合并
    Object.assign(this, defAttr(), attr);
    this.init();
  }
  init() {
    const { attrName, size, gl } = this;
    if (!gl) {
      return;
    }
    //缓冲对象
    const vertexBuffer = gl.createBuffer();
    //绑定缓冲对象
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    //写入数据
    this.updateBuffer();
    //获取attribute 变量
    const a_Position = gl.getAttribLocation(gl.program, attrName);
    //修改attribute 变量
    gl.vertexAttribPointer(a_Position, size, gl.FLOAT, false, 0, 0);
    //赋能-批处理
    gl.enableVertexAttribArray(a_Position);
    //更新uniform 变量
    this.updateUniform();
  }
  updateUniform() {
    const { gl, uniforms } = this;
    // 遍历uniforms对象，获取键值对
    for (let [key, val] of Object.entries(uniforms)) {
      const { type, value } = val;
      const u = gl.getUniformLocation(gl.program, key);
      if (type.includes("Matrix")) {
        //Matrix类型的方法中第二个参数为false，指定是否转置矩阵
        gl[type](u, false, value);
      } else {
        gl[type](u, value);
      }
    }
  }
  updateBuffer() {
    const { gl, vertices } = this;
    this.updateCount();
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  }
  updateCount() {
    this.count = this.vertices.length / this.size;
  }
  addVertice(...params) {
    this.vertices.push(...params);
    this.updateBuffer();
  }
  popVertice() {
    const { vertices, size } = this;
    const len = vertices.length;
    vertices.splice(len - size, len);
    this.updateCount();
  }
  setVertice(ind, ...params) {
    const { vertices, size } = this;
    const i = ind * size;
    params.forEach((param, paramInd) => {
      vertices[i + paramInd] = param;
    });
  }
  updateVertices(params) {
    const { geoData } = this;
    const vertices = [];
    geoData.forEach((data) => {
      params.forEach((key) => {
        vertices.push(data[key]);
      });
    });
    this.vertices = vertices;
  }
  draw(types = this.types) {
    const { gl, count } = this;
    for (let type of types) {
      gl.drawArrays(gl[type], 0, count);
    }
  }
}
