import React, { ReactElement } from 'react';
import { PixiGame } from '../ui/components/PixiGame.component';
import Game from '../ui/pages/Game';
import PackageJson from '../package.json' with { type: "json" }


function App(): ReactElement {
  return (
    <div>
      {/*<Game />*/}
      <PixiGame />
      <footer>
        <p>{'Version: ' + PackageJson.version}</p>
      </footer>
    </div>
  )
}

export default App;
