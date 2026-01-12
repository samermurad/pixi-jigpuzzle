import React, { ReactElement, useCallback } from 'react';


import GameStyles from 'ui-styles/pages/Game.module.css'
import { Colors } from '../../enums/Colors';
import { useCounter } from '../../hooks/common.hks';
import { useLocalStorage } from '../../hooks/persistence.hks';
import { useClasses } from '../../hooks/styles.hks';
import Button from '../atoms/Button';


function GamePage(): ReactElement {
  const [stats, setStats] = useLocalStorage('puzzlesSolved', { solved: 0 })

  const [spanClasses, spanClassesHandler] = useClasses(GameStyles.span)
  const [counter,,bump ] = useCounter(stats.solved)
  const onPointerDown = useCallback(() => {
    spanClassesHandler.push(GameStyles.huge)
    bump();
  }, []);
  const onPointerUp = useCallback(() => {
    spanClassesHandler.remove(GameStyles.huge);

  }, [bump]);
  return (
    <div>
      <p className={spanClasses}>{counter}</p>
      <Button onPointerDown={onPointerDown} onPointerUp={onPointerUp} color={Colors.Primary}/>
      <Button onPointerDown={onPointerDown} onPointerUp={onPointerUp} color={Colors.Secondary}/>
      <Button onPointerDown={onPointerDown} onPointerUp={onPointerUp} color={Colors.BackgroundPrimary}/>
      <Button onPointerDown={onPointerDown} onPointerUp={onPointerUp} color={Colors.BackgroundSecondary}/>
    </div>
  )
}

export default GamePage;
