//建立时间轨
export default class Track {
  constructor(target) {
    // target目标对象 在目标对象上加动画
    this.target = target;
    //合成对象
    this.parent = null;
    // 时间轨开始时间
    this.start = 0;
    // 时间轨长度
    this.timeLen = 5;
    // 是否循环关键帧
    this.loop = false;
    // 关键帧集合，后面给不同属性不同关键帧
    /**
         关键帧集合结构：
            [
                [
                    '对象属性1',
                    [
                        [时间1,属性值], //关键帧
                        [时间2,属性值], //关键帧
                    ]
                ],
                [
                    '对象属性2',
                    [
                        [时间1,属性值], //关键帧
                        [时间2,属性值], //关键帧
                    ]
                ],
            ]
         */
    this.keyMap = new Map();
    this.onEnd = () => {};
    // 存储上一次动画帧的时间
    this.prevTime = 0;
  }
  update(t) {
    const { keyMap, timeLen, target, loop, start, prevTime } = this;
    // 世界时间-开始时间（本地时间是指相对于当前时间轨而言的时间）
    let time = t - start;
    // 动画总时长>=上一次动画请求时间 使得onEnd()只运行一次
    // 动画总时长<本地时间   当前动画已经跑完
    if (timeLen >= prevTime && timeLen < time) {
      // 这个时间轨道动画已跑完
      this.onEnd();
    }
    // 更新上一次动画帧的时间为本地时间
    this.prevTime = time;
    if (loop) {
      // 对本地时间取余，时间轨又重新开始，相当于循环
      time = time % timeLen;
    }
    for (const [key, fms] of keyMap) {
      // 最后一个关键帧索引位置
      const last = fms.length - 1;
      if (time < fms[0][0]) {
        // 本地时间小于第一个关键帧时间时，就赋值相对应的状态属性值
        target[key] = fms[0][1];
      } else if (time > fms[last][0]) {
        // 本地时大于最后一个关键帧时间时，就赋值最后一个关键帧的状态属性值
        target[key] = fms[last][1];
      } else {
        // 本地时间在两个关键帧时间之间，进行补间计算
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
      // 使用线性进行补间计算 y = kx + b
      const k = delta.y / delta.x;
      const b = fm1[1] - fm1[0] * k;
      return k * time + b;
    }
  }
}
