/**
 * 材质 对象
 */
const defAttr = () => ({
  program: null,
  // uniform数据
  /**
    data数据格式
    {
        u_Color: {
        value:1,
        type: 'uniform1f',
        location:null,
        needUpdate:true,
        },
        ……
    }
     */
  data: {},
  // mode 也可以是数组，表示多种绘图方式，如['TRIANGLE_STRIP', 'POINTS']，默认以独立三角形绘图
  mode: "TRIANGLES",
  /**
    贴图数据格式
    u_Sampler: {
      // 图像源
      image,
      //数据类型，默认gl.RGB
      format,
      //  对应纹理对象的TEXTURE_WRAP_S 属性
      wrapS,
      // 对应纹理对象的TEXTURE_WRAP_T 属性
      wrapT,
      // 滤波器设置
      // 对应纹理对象的TEXTURE_MAG_FILTER 属性
      magFilter,
      // 对应纹理对象的TEXTURE_MIN_FILTER属性
      minFilter,
    },
   */
  maps: {},
});
export default class Mat {
  constructor(attr) {
    Object.assign(this, defAttr(), attr);
  }
  init(gl) {
    const { program, data, maps } = this;
    //两个对象一起遍历
    for (let [key, obj] of [...Object.entries(data), ...Object.entries(maps)]) {
      obj.location = gl.getUniformLocation(program, key);
      obj.needUpdate = true;
    }
  }

  update(gl) {
    this.updateData(gl);
    this.updateMaps(gl);
  }
  updateData(gl) {
    for (let obj of Object.values(this.data)) {
      if (!obj.needUpdate) {
        continue;
      }
      obj.needUpdate = false;
      const { type, value, location } = obj;
      if (type.includes("Matrix")) {
        // 矩阵方式解构
        gl[type](location, false, value);
      } else {
        gl[type](location, value);
      }
    }
  }
  updateMaps(gl) {
    Object.values(this.maps).forEach((map, ind) => {
      if (!map.needUpdate) {
        return;
      }
      map.needUpdate = false;
      const {
        format = gl.RGB,
        image,
        wrapS,
        wrapT,
        magFilter,
        minFilter,
        location,
      } = map;
      // 图片的像素坐标系中的Y轴朝下，uv坐标系中Y轴朝上 ，所以要使贴图Y轴反转
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      // 基于当前贴图的索引位置激活纹理单元（贴图数量有限，不要超过8个）
      gl.activeTexture(gl[`TEXTURE${ind}`]);
      // 建立纹理对象
      const texture = gl.createTexture();
      // 绑定到webgl上下文对象上
      gl.bindTexture(gl.TEXTURE_2D, texture);
      // 将图像源写入纹理中
      gl.texImage2D(gl.TEXTURE_2D, 0, format, format, gl.UNSIGNED_BYTE, image);
      // 纹理重复设置
      wrapS && gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
      wrapT && gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
      // 纹理滤波器设置
      magFilter &&
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
      if (!minFilter || minFilter > 9729) {
        gl.generateMipmap(gl.TEXTURE_2D);
      }
      minFilter &&
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
      // 将纹理单元号写入到当前采样器所对应的uniform变量中
      gl.uniform1i(location, ind);
    });
  }
  setData(key, val) {
    const obj = this.data[key];
    if (!obj) {
      return;
    }
    obj.needUpdate = true;
    Object.assign(obj, val);
  }
  setMap(key, val) {
    const obj = this.maps[key];
    if (!obj) {
      return;
    }
    obj.needUpdate = true;
    Object.assign(obj, val);
  }
}
