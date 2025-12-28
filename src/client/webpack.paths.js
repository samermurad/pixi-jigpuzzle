import path from 'path'
import fs from 'fs'

let projectRootDir = fs.realpathSync(process.cwd());
const resolveProjectRelativePath = (...paths) => path.resolve(projectRootDir, path.join(...paths));




const srcDir = resolveProjectRelativePath('src');
const clientDir = resolveProjectRelativePath('src', 'client');
const clientOutDir = resolveProjectRelativePath('dist', 'client');
const projectSharedDir = resolveProjectRelativePath('src', 'shared');

const nodeModulesDir = resolveProjectRelativePath('node_modules');

const paths = {
    projectRootDir,
    resolveProjectRelativePath,
    srcDir,
    clientDir,
    clientOutDir,
    projectSharedDir,
    nodeModulesDir,
    entry: resolveProjectRelativePath(clientDir, 'index.ts'),
    html: resolveProjectRelativePath(clientDir, 'index.html'),
    tsConfig: resolveProjectRelativePath(clientDir, 'tsconfig.json'),
}
export default paths;


console.log(projectRootDir, srcDir, clientDir, projectSharedDir, projectSharedDir);
