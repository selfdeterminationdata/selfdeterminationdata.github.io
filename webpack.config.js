const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const { TsconfigPathsPlugin } = require("tsconfig-paths-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const packageJson = require("./package.json");

module.exports = (env) => ({
  entry: "./src/index.tsx",
  ...(env.production || !env.development ? {} : { devtool: "eval-source-map" }),
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    plugins: [new TsconfigPathsPlugin()],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "build.js",
    publicPath: "./", // ensures assets load correctly
    clean: true, // clears dist/ before build
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          transpileOnly: true,
        },
        exclude: /dist/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/resource",
        generator: {
          filename: "static/media/[name][ext]", // keep original filenames
        },
      },
    ],
  },
  plugins: [
    // Generates index.html with correct JS bundle injected
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),

    // Copies all public/ files except index.html into dist/
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "public"),
          to: path.resolve(__dirname, "dist"),
          globOptions: {
            ignore: ["**/index.html"], // don't copy HTML twice
          },
        },
      ],
    }),

    // Define env vars available in client-side code
    new webpack.DefinePlugin({
      "process.env.PRODUCTION": JSON.stringify(env.production || !env.development),
      "process.env.NAME": JSON.stringify(packageJson.name),
      "process.env.VERSION": JSON.stringify(packageJson.version),
    }),

    new ForkTsCheckerWebpackPlugin(),
    new ESLintPlugin({ files: "./src/**/*.{ts,tsx,js,jsx}" }),
  ],
});

