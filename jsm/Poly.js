const defAttr = () => ({
  gl: null,
  // 顶点数组
  vertices: [],
  // 对象数组 - 模型数据
  geoData: [],
  // 数据分量 - 一个点有多少个分量x,y
  size: 2,
  attrName: "a_Position",
  uniName: "u_IsPOINTS",
  // 顶点数量
  count: 0,
  // 绘图方式
  types: ["POINTS"],
  circleDot: false,
  u_IsPOINTS: null,
});
export default class Poly {
  constructor(attr) {
    //合并 自定义的属性会覆盖默认和this
    Object.assign(this, defAttr(), attr);
    this.init();
  }
  init() {
    const { attrName, size, gl, circleDot } = this;
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
    //如果是圆点，就获取一下uniform 变量
    if (circleDot) {
      this.u_IsPOINTS = gl.getUniformLocation(gl.program, "u_IsPOINTS");
    }
  }
  // 更新缓冲区数据，同时更新顶点数量
  updateBuffer() {
    const { gl, vertices } = this;
    this.updateCount();
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  }
  // 更新顶点数量
  updateCount() {
    this.count = this.vertices.length / this.size;
  }
  // 添加顶点
  addVertice(...params) {
    this.vertices.push(...params);
    this.updateBuffer();
  }
  // 删除最后一个顶点
  popVertice() {
    const { vertices, size } = this;
    const len = vertices.length;
    vertices.splice(len - size, len);
    this.updateCount();
  }
  // 根据索引位置设置顶点
  setVertice(ind, ...params) {
    const { vertices, size } = this;
    const i = ind * size;
    params.forEach((param, paramInd) => {
      vertices[i + paramInd] = param;
    });
  }
  // 基于geoData解析vertices数据
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
  // 绘图方法
  draw(types = this.types) {
    const { gl, count, circleDot, u_IsPOINTS } = this;
    for (let type of types) {
      circleDot && gl.uniform1f(u_IsPOINTS, type === "POINTS");
      gl.drawArrays(gl[type], 0, count);
    }
  }
}
