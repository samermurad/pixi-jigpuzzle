import HTMLWebpackPlugin from 'html-webpack-plugin';
import {CleanWebpackPlugin} from 'clean-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import paths from './webpack.paths.js';


const isDev = process.env.NODE_ENV !== 'production';
const cssInjectOrExtract = isDev ? 'style-loader' : MiniCssExtractPlugin.loader;

if (isDev) {
    console.log('WEBPACK DEV MODE (?)')
}
const plugins = [
    new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [paths.clientOutDir],
    }),
    new MiniCssExtractPlugin({
        filename: 'css/[name].css',
        chunkFilename: 'css/[id].css',
    }),
    new HTMLWebpackPlugin({ template: paths.html }),
]

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
