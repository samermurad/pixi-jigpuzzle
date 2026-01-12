import React, { ReactElement } from 'react';
import { PixiGame } from '../ui/components/PixiGame.component';
import Game from '../ui/pages/Game.page';
import PackageJson from '../package.json' with { type: "json" }
import {useSimpleSinglePageSwitcher} from '../hooks/navigation.hks'
import ImgGen from '../ui/pages/ImgGen.page';
import MainMenu from '../ui/pages/MainMenu.page';
import AppStyles from '../styles/app.module.css';
function App(): ReactElement {
  const [name, Switch, setPage] = useSimpleSinglePageSwitcher({
    'MainMenu': MainMenu,
    'PixiGame': PixiGame as any,
    'Game': Game,
    'ImgGen': ImgGen,
  }, 'MainMenu')
  return (
    <div className={AppStyles.container}>
      {/*<Game />*/}
      {/*<PixiGame />*/}
      <header className={AppStyles.header}></header>
      <div className={AppStyles.content}>
        <Switch setPage={setPage} />
      </div>
      <footer className={AppStyles.footer}>
        <p>{'Version: ' + PackageJson.version}</p>
      </footer>
    </div>
  )
}

export default App;
