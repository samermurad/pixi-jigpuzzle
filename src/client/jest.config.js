import { createDefaultPreset, TS_TRANSFORM_PATTERN } from 'ts-jest'
import paths from './webpack.paths.js';


const tsJestTransformCfg = createDefaultPreset({
    tsconfig: './tsconfig.json',
    // isolatedModules: true,
}).transform;

console.log('I LAND HERE DEFOO', tsJestTransformCfg)
/** @type {import("jest").Config} **/
export default {
    // transform: {},
    // testEnvironment: 'node',
    testRegex: '/tests/.*\\.(test|spec)?\\.(ts|tsx)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testEnvironment: "node",
    transform: {
        ...tsJestTransformCfg,
    },
    // transformIgnorePatterns: [
    //     // "node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)",
    //     "node_modules/(?!pixi.js|earcut)",
    // ]
};
