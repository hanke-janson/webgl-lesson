/* 
attributes 数据结构:{
  a_Position: {
    系列尺寸
    size: 3,
    系列的元素索引位置
    index:0
  }
}
uniforms 数据结构:{
  u_Color: {
    uniform变量的修改方法
    type: 'uniform1f',
    uniform变量的值
    value:1
  },
}
maps 数据结构:{
  u_Sampler:{
    image,
    format,
    wrapS,
    wrapT,
    magFilter,
    minFilter
  },
}
*/
const defAttr = () => ({
  gl: null,
  type: "POINTS",
  source: [],
  // 顶点总数
  sourceSize: 0,
  elementBytes: 4,
  categorySize: 0,
  attributes: {},
  uniforms: {},
  // 贴图集合
  maps: {},
});
export default class Poly {
  constructor(attr) {
    Object.assign(this, defAttr(), attr);
    this.init();
  }
  init() {
    if (!this.gl) {
      return;
    }
    // 从数据源中计算尺寸
    this.calculateSize();
    this.updateAttribute();
    this.updateUniform();
    this.updateMaps();
  }
  calculateSize() {
    const { attributes, elementBytes, source } = this;
    let categorySize = 0;
    Object.values(attributes).forEach((ele) => {
      const { size, index } = ele;
      categorySize += size;
      // 元素索引*元素字节数
      ele.byteIndex = index * elementBytes;
    });
    // 类目尺寸
    this.categorySize = categorySize;
    // 类目字节数
    this.categoryBytes = categorySize * elementBytes;
    // 顶点总数
    this.sourceSize = source.length / categorySize;
  }
  updateAttribute() {
    const { gl, attributes, categoryBytes, source } = this;
    const sourceBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sourceBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(source), gl.STATIC_DRAW);
    for (let [key, { size, byteIndex }] of Object.entries(attributes)) {
      // 获取到这个attribute对象（key）
      const attr = gl.getAttribLocation(gl.program, key);
      gl.vertexAttribPointer(
        attr,
        size,
        gl.FLOAT,
        false,
        categoryBytes,
        byteIndex
      );
      gl.enableVertexAttribArray(attr);
    }
  }
  updateUniform() {
    const { gl, uniforms } = this;
    for (let [key, val] of Object.entries(uniforms)) {
      const { type, value } = val;
      const u = gl.getUniformLocation(gl.program, key);
      if (type.includes("Matrix")) {
        gl[type](u, false, value);
      } else {
        gl[type](u, value);
      }
    }
  }
  updateMaps() {
    const { gl, maps } = this;
    Object.entries(maps).forEach(([key, val], ind) => {
      const {
        format = gl.RGB,
        image,
        wrapS,
        wrapT,
        magFilter,
        minFilter,
      } = val;
      // 反转图像元Y轴
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      // 激活纹理单元
      gl.activeTexture(gl[`TEXTURE${ind}`]);
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);

      gl.texImage2D(
        // 2维纹理对象
        gl.TEXTURE_2D,
        // 图像层级
        0,
        // 图像数据格式
        format,
        format,
        // 图像源的数据类型
        gl.UNSIGNED_BYTE,
        image
      );

      wrapS && gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
      wrapT && gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);

      magFilter &&
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
      // 9727 - 缩小滤波器过滤方法的索引位置 与分子贴图相关的方法都是大于9727的
      if (!minFilter || minFilter > 9729) {
        // 分子贴图属性设置
        gl.generateMipmap(gl.TEXTURE_2D);
      }

      minFilter &&
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);

      const u = gl.getUniformLocation(gl.program, key);
      gl.uniform1i(u, ind);
    });
  }
  draw(type = this.type) {
    const { gl, sourceSize } = this;
    gl.drawArrays(gl[type], 0, sourceSize);
  }
}
