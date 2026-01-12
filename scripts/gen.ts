import path from 'path'
import fs from 'fs'

let projectRootDir = fs.realpathSync(process.cwd());
const resolveProjectRelativePath = (...paths: string[]) => path.resolve(projectRootDir, path.join(...paths));



enum Tokens {
  FILE_NAME = '_{{FILE_NAME}}_',
  STYLES_IMPORT = '_{{STYLES_IMPORT}}_',
  UI_KIND = '_{{UI_KIND}}_'
}

// noinspection JSUnresolvedReference
const tsx =
`
import React from 'react';
import ${Tokens.FILE_NAME}Styles from 'ui-styles/${Tokens.UI_KIND}/${Tokens.FILE_NAME}.module.css';

type Props = {}
function ${Tokens.FILE_NAME}(props: Props) {
  return (
    <div className={${Tokens.FILE_NAME}Styles.container}>${Tokens.FILE_NAME} Says hi!</div>
  )
}

export default ${Tokens.FILE_NAME}
`;


const cssModule = `
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
`


const genPage = (_name: string) => {
  if (!_name) {
    console.log('===> NAME cant be empty')
    return
  }
  let name = _name[0].toUpperCase() + _name.substring(1)
  // name[0] = name[0].toUpperCase()
  // console.log(name[0], name[0].toUpperCase())
  const pageTSX = resolveProjectRelativePath('src', 'client','ui', 'pages', `${name}.page.tsx`)
  const pageCssModule = resolveProjectRelativePath('src', 'client', 'styles','ui', 'pages', `${name}.module.css`)
  if (fs.existsSync(pageTSX) || fs.existsSync(pageCssModule)) {
    throw new Error(`${pageTSX} or ${pageCssModule} already exist`);
  }
  console.log('===> Gonna Create:')
  console.log('===>', pageTSX)
  console.log('===>', pageCssModule)

  const tsxContent = tsx
    .replace(new RegExp(`${Tokens.FILE_NAME}`, 'g'), name)
    .replace(new RegExp(`${Tokens.UI_KIND}`, 'g'), 'pages')
  // console.log('tsx', tsxContent)

  fs.writeFileSync(pageTSX, tsxContent, 'utf8')
  fs.writeFileSync(pageCssModule, cssModule, 'utf8')

}

const main = async () => {
  console.log('==> Custom Gen Script');
  const genType = process.argv[2];
  const name = process.argv[3];
  switch (genType) {
    case 'page':
      console.log('===> CREATE PAGE', name);
      genPage(name)
      break;
    default:
      console.log(genType, 'is not supported as a gen option, select one of:', ...['page'])
  }
  // console.log(process.argv)

}



if (process.argv[1] === __filename) {
  main()
    .then(() => console.log('DONE'))
    .catch(console.error)
}
