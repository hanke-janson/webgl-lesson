//建立时间轨
export default class Track {
  constructor(target) {
    // target目标对象 在目标对象上加动画
    this.target = target;
    //合成对象
    this.parent = null;
    // 动画开始时间
    this.start = 0;
    // 时间轨长度
    this.timeLen = 5;
    // 是否循环关键帧
      this.loop = false;
      // 关键帧集合，后面给不同属性不同关键帧
    this.keyMap = new Map();
    this.onEnd = () => {};
    this.prevTime = 0;
  }
  update(t) {
    const { keyMap, timeLen, target, loop, start, prevTime } = this;
    let time = t - start;
    if (timeLen >= prevTime && timeLen < time) {
      this.onEnd();
    }
    this.prevTime = time;
    if (loop) {
      time = time % timeLen;
    }
    for (const [key, fms] of keyMap) {
      const last = fms.length - 1;
      if (time < fms[0][0]) {
        target[key] = fms[0][1];
      } else if (time > fms[last][0]) {
        target[key] = fms[last][1];
      } else {
        target[key] = getValBetweenFms(time, fms, last);
      }
    }
  }
}

function getValBetweenFms(time, fms, last) {
  for (let i = 0; i < last; i++) {
    const fm1 = fms[i];
    const fm2 = fms[i + 1];
    if (time >= fm1[0] && time <= fm2[0]) {
      const delta = {
        x: fm2[0] - fm1[0],
        y: fm2[1] - fm1[1],
      };
      const k = delta.y / delta.x;
      const b = fm1[1] - fm1[0] * k;
      return k * time + b;
    }
  }
}
