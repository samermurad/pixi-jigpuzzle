import { Application, Container, Sprite } from 'pixi.js';
import { StageIDS } from '../enums/StageIDS';

export interface IPixiSkeleton {
  get active(): boolean;
  set active(value: boolean);
  init(app: Application): Promise<void>;
  // addToStage(app: Application): Promise<void>
  get graphic(): Container;
  getStageID(): StageIDS | null;
  update?(): void;
}

export namespace IPixiSkeleton {
  export function fromPixiObject(pixiObject: Container,
                                 stageID: StageIDS = StageIDS.Main,
                                 updateMethod: (() => void) | null = null) {

    return makeSkeletonFromPixiObject(pixiObject, stageID, updateMethod);
  }
}
function makeSkeletonFromPixiObject(
  pixiObject: Container,
  stageID: StageIDS = StageIDS.Main,
  updateMethod: (() => void) | null = null
): IPixiSkeleton {
  class PixiSkeletonClass implements IPixiSkeleton {
    private isActive: boolean = true;
    // update: OmitThisParameter<() => void>;
    constructor(private readonly container: Container) {}
    getStageID(): StageIDS | null { return stageID; }
    async init(app: Application): Promise<void> {
      /* noop */
    }
    set active(value: boolean) {
      this.isActive = value;
      this.container.visible = this.isActive;
    }
    get active(): boolean { return this.isActive; }
    get graphic(): Container {
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

// const sprite = new Sprite();

// makeSkeletonFromPixiObject(sprite);
