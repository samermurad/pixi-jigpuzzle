import { Ticker } from 'pixi.js';
import { Deferred } from '../../../shared/models/Deferred';

type BaseInitData = { life: number };
type PixiStageAnimatorStageRunner<S, T> =  (baseData: S, data: T, ticker: Ticker) => boolean;
export type PixiStageAnimatorStage<S, T> = {
  name: string;
  runner: PixiStageAnimatorStageRunner<S, T>;
  initData?: T;
  init?: (() => T) | null;
  state: 'idle' | 'started' | 'finished';
}

export class PixiStageAnimator<BaseData extends object> {
  private stages: PixiStageAnimatorStage<BaseData, any>[] = []
  private currentStageIndex: number = 0;
  // @ts-ignore
  constructor(public readonly baseData: BaseData = {}) { }


  async run(ticker: Ticker): Promise<void> {
    const deferred = new Deferred<void>();
    let areAllDone = false;
    const method = (_ticker: Ticker) => {
      areAllDone = this.tick(_ticker)
      if (areAllDone) {
        ticker.remove(method)
        deferred.resolve();
      }
    };
    ticker.add(method)
    return deferred.promise;
  }

  private tick(ticker: Ticker): boolean {
    const stage = this.stages[this.currentStageIndex];
    if (!stage) return true;

    if (stage.state === 'idle') {
      stage.state = 'started';
      stage.initData = {}
      if (stage.init) {
        stage.initData = stage.init();
      }
      stage.initData = {
        ...stage.initData,
        life: 0,
      }
    }
    try {
      const res = stage.runner(this.baseData, stage.initData, ticker)
      if (res) {
        stage.state = 'finished';
        // stage Done
        this.currentStageIndex++;
      }
    } catch (error) {
      console.error('PixiStageAnimator', 'error in animation stage', stage.name, 'index:', this.currentStageIndex, error);
      return true;
    }

    return this.currentStageIndex >= this.stages.length;
  }

  public addStage<InitData>(
    name: string,
    init: (() => InitData) | null,
    runner: PixiStageAnimatorStageRunner<BaseData,InitData & BaseInitData>
  ): this {
    (this.stages as (PixiStageAnimatorStage<BaseData, InitData>)[])
      .push({
        name,
        runner: runner as PixiStageAnimatorStageRunner<BaseData, InitData>,
        init,
        state: 'idle',
      })
    return this;
  }

}
