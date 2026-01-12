
import React from 'react';
import MainMenuStyles from 'ui-styles/pages/MainMenu.module.css'
import Button from '../atoms/Button';

type Props = {
  setPage: (pageName: string) => void;
}
function MainMenu(props: Props) {
  const { setPage } = props;
  return (
    <div className={MainMenuStyles.container}>
      <Button title="Play" onClick={() => setPage('PixiGame')} />
      <Button title="Image Generator" onClick={() => setPage('ImgGen')}/>
      <Button title={`"Game.page (buttons example)"`} onClick={() => setPage('Game')}/>
    </div>
  )
}

export default MainMenu
