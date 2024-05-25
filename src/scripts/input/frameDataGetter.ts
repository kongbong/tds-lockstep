import FrameData from './frameData';

export default class FrameDataGetter {

  frames: FrameData[] = [];
  remainTime: number = 0;

  getRemainTime(): number {
    return this.remainTime;
  }

  pushFrameData(frameData: FrameData) {
    this.frames.push(frameData);
    this.remainTime += frameData.duration;
  }

  getFrameData(dt: number): FrameData|undefined {
    if (this.frames.length === 0) {
      return undefined;
    }
    const thisFrameData = new FrameData();
    thisFrameData.frame = this.frames[0].frame;
    thisFrameData.inputDatas = this.frames[0].inputDatas;
    if (this.frames[0].duration < dt) {
      thisFrameData.duration = this.frames[0].duration;
    } else {
      thisFrameData.duration = dt;
    }
    return thisFrameData;
  }

  advanceTime(dt: number) {
    if (this.frames.length === 0) {
      return undefined;
    }
    this.remainTime -= dt;
    this.frames[0].duration -= dt;
    if (this.frames[0].duration <= 0) {
      this.frames.shift();
    }
  }
}