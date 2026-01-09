import React, { ReactElement, useCallback } from 'react';


import GameStyles from 'ui-styles/pages/Game.module.css'
import { Colors } from '../../enums/Colors';
import { useLocalStorage } from '../../hooks/persistence.hks';
import { useClasses } from '../../hooks/styles.hks';
import Button from '../atoms/Button';


function Game(): ReactElement {
  const [stats, setStats] = useLocalStorage('puzzlesSolved', { solved: 0 })
  const [spanClasses, spanClassesHandler] = useClasses(GameStyles.span)
  const onPointerDown = useCallback(() => spanClassesHandler.push(GameStyles.huge), []);
  const onPointerUp = useCallback(() => spanClassesHandler.remove(GameStyles.huge), []);
  return (
    <div>
      <p className={spanClasses}>{stats.solved}</p>
      <Button onPointerDown={onPointerDown} onPointerUp={onPointerUp} color={Colors.BackgroundPrimary}/>
    </div>
  )
}

export default Game;
