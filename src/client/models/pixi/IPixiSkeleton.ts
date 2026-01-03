import { Application, Container, Sprite } from 'pixi.js';
import { StageIDS } from '../../enums/StageIDS';

export interface IPixiSkeleton<T extends Container = Container> {
  get active(): boolean;
  set active(value: boolean);
  init(app: Application): Promise<void>;
  get graphic(): T;
  getStageID(): StageIDS | null;
  update?(): void;

  destroy?(): void;
}

export namespace IPixiSkeleton {
  export function fromPixiObject<T extends Container = Container>(pixiObject: T,
                                 stageID: StageIDS = StageIDS.Main,
                                 updateMethod: (() => void) | null = null) {

    return makeSkeletonFromPixiObject(pixiObject, stageID, updateMethod);
  }
}

function makeSkeletonFromPixiObject<T extends Container = Container>(
  pixiObject: T,
  stageID: StageIDS = StageIDS.Main,
  updateMethod: (() => void) | null = null
): IPixiSkeleton<T> {
  class PixiSkeletonClass implements IPixiSkeleton<T> {
    private isActive: boolean = true;
    constructor(private readonly container: T) {}
    getStageID(): StageIDS | null { return stageID; }
    async init(app: Application): Promise<void> {
      /* noop */
    }
    set active(value: boolean) {
      this.isActive = value;
      this.container.visible = this.isActive;
    }
    get active(): boolean { return this.isActive; }
    get graphic(): T {
      return this.container;
    }
  }
  const pixiObj = new PixiSkeletonClass(pixiObject);
  if (updateMethod) {
    // @ts-ignore
    pixiObj.update = updateMethod.bind(pixiObj);
  }
  return pixiObj;
}
