import dotenv from "dotenv";
import HTMLWebpackPlugin from 'html-webpack-plugin';

import {CleanWebpackPlugin} from 'clean-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import LiveReloadPlugin from 'webpack-livereload-plugin';
import paths from './webpack.paths.js';

const { parsed: ENV_VARS } = dotenv.config({ path: '.env.client' })

if (ENV_VARS === undefined) {
    throw new Error('envVars must be defined (check your .env.server file in root directory)');
}
const LIVE_RELOAD_PORT = ENV_VARS.LIVE_RELOAD_SERVER || '35729'

console.log(ENV_VARS)
const isDev = process.env.NODE_ENV !== 'production';
const cssInjectOrExtract = isDev ? 'style-loader' : MiniCssExtractPlugin.loader;

if (isDev) console.log('WEBPACK DEV MODE')

/** @type {Array} Array of webpack plugins */
const plugins = [
    new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [paths.clientOutDir],
    }),
    new MiniCssExtractPlugin({
        filename: 'css/[name].css',
        chunkFilename: 'css/[id].css',
    }),
    new HTMLWebpackPlugin({
        template: paths.html,
        templateParameters: {
            // auto reload website in dev mode
            livereload: (isDev ? `<script src="http://localhost:${LIVE_RELOAD_PORT}/livereload.js"></script>` : ''),
        }
    })
]

if (isDev) {
    plugins.push(
        new LiveReloadPlugin({
            port: Number(LIVE_RELOAD_PORT),
            useSourceHash: true,
            delay: 750,
        })
    )
}

export default {
    mode: isDev ? 'development' : 'production',
    entry: {
        main: paths.entry
    },
    output: {
        path: paths.clientOutDir,
        publicPath: '/app/',
        filename: 'main.js',
        // globalObject: 'this',
    },
    module: {
        rules: [
            {
                oneOf: [
                    {
                        test: /\.(ts|tsx)$/,
                        use: [{ loader: 'ts-loader', options: { configFile: paths.tsConfig } }],
                        exclude: /node_modules/,
                        include: [paths.clientDir, paths.projectSharedDir],
                    },
                    {
                        test: /\.module\.css$/,
                        use: [
                            cssInjectOrExtract,
                            {
                                loader: 'css-loader',
                                options: {
                                    esModule: false,          // <-- important for many TS setups
                                    importLoaders: 1,
                                    modules: {
                                        localIdentName: '[local]___[hash:base64:5]',
                                    },
                                },
                            },
                        ],
                    },
                    {
                        test: /\.css$/,
                        exclude: /\.module\.css$/,
                        use: [
                            cssInjectOrExtract,
                            'css-loader',
                        ],
                    },
                    {
                        test: /\.(png|jpg|gif)$/,
                        type: 'asset/resource',
                        generator: {
                            filename: 'static/[name]__[hash][ext][query]',
                        },
                    }
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js', '.jsx'],
    },
    target: 'web',
    plugins,
    performance: false,
}
