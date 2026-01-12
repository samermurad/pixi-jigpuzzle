import React, { ReactElement, useCallback, useRef } from 'react';
import { Colors } from '../../enums/Colors';
import { useContainer, useGraphics, usePixiApp } from '../../hooks/pixi.hks';
import ImgGenStyles from 'ui-styles/pages/ImgGen.module.css';
import { PixiImageGenerator } from '../../pixi/PixiImageGenerator';
import Button from '../atoms/Button';

type Props = {}
function ImgGen(props: Props): ReactElement {
  const host = useRef<HTMLDivElement>(null)

  const onInit = useCallback(() => {
    console.log('OnInit')
    host.current?.appendChild(pixiApp!.canvas)

    pixiApp!.stage.addChild(mainLayer)
    const rect = pixiApp!.canvas.getBoundingClientRect();
    console.log(rect)
    const w = rect.width;
    const h = rect.height;
    imgGen.width = w;
    imgGen.height = h;
    mainLayer.addChild(
      graphic
        .rect(w / 4, h / 4, w / 2, h / 2)
        .fill(Colors.Primary)
    )
    imgGen.generateImageV2(pixiApp!);
    mainLayer.addChild(
      imgGen.graphic,
    )
  },[])

  console.log("ImgGen", host.current)
  const [pixiApp] = usePixiApp({
    backgroundAlpha: 0,
    antialias: true,
    resizeTo: host.current as any,
  }, onInit)

  const [graphic] = useGraphics();
  const [mainLayer] = useContainer();
  const imgGen = useRef(new PixiImageGenerator(
    Math.floor( (Math.random() * 4550) + 1),
    15,
    15,
  )).current;
  return (
    <div className={ImgGenStyles.container}>
      <p>ImgGen Says hi!</p>
      <div ref={host} className={ImgGenStyles.content}></div>
      <Button title={"Generate"} onClick={async () => {
        imgGen.generateImageV2(pixiApp!)
        // imgGen.generateImage(pixiApp!)
      }}/>
    </div>
  )
}

export default ImgGen
