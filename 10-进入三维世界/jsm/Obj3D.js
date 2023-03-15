/**
 * 三维对象
 * 主要用来对geo几何对象和mat材质对象进行统一初始化和更新
 */
const defAttr = () => ({
  geo:null,
  mat:null,
})
export default class Obj3D{
  constructor(attr){
    Object.assign(this,defAttr(),attr)
  }
  init(gl){
    const { mat, geo } = this
    mat.init(gl)
    geo.init(gl,mat.program)
  }
  
  update(gl) {
    this.geo.update(gl)
    this.mat.update(gl)
  }
}