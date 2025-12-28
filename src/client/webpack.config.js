import HTMLWebpackPlugin from 'html-webpack-plugin';
import {CleanWebpackPlugin} from 'clean-webpack-plugin';
import paths from './webpack.paths.js';

const plugins = [
    new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [paths.clientOutDir],
    }),
    new HTMLWebpackPlugin({ template: paths.html }),
]

export default {
    // mode: 'production',
    mode: 'development',
    entry: {
        main: paths.entry
    },
    output: {
        path: paths.clientOutDir,
        publicPath: '/app',
        filename: 'main.js',
        globalObject: 'this',
    },
    module: {
        rules: [
            /**
             * Ts files loader
             * */
            {
                oneOf: [
                    {
                        test: /\.(js|ts)x?$/,
                        use: [
                            {
                                loader: 'ts-loader',
                                options: {
                                    configFile: paths.tsConfig,
                                }
                            }
                        ],
                        exclude: /node_modules/,
                        include: [
                            paths.clientDir,
                            paths.projectSharedDir
                        ]
                    }
                ]
            },
            /**
             * CSS Modules loader
             * All the *.module.css files
             * These files are interpreted with local classes,
             * so definitions are per file
             */
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            modules: {
                                mode: 'local',
                                localIdentName: '[name]_[local]__[hash:base64:5]',
                            },
                        }
                    },
                ],
                include: /\.module\.css$/
            },
        ]
    },
    resolve: {
        extensions: ['.ts', '.js', '.jsx'],
    },
    target: 'web',
    plugins,
    performance: false,
}
