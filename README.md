# Getting Started

1. Make sure you have Node (>=14.17.3), NPM, and Yarn installed.

2. Install node modules using the following command:

```shell
yarn install
```

3. Build and run the project:

```shell
yarn build
yarn start
```

4. (OPTIONAL) clean the project and delete build files:

```shell
yarn clean
```

# Using Watchers for Real-Time Development

This will allow you to refresh the application and see changes in real-time, without having to recompile Electron and Angular code (the watchers auto-compile as files are
changed/saved).

1. Follow steps 1-2 above
2. Build, run, and watch the project:

```shell
yarn watch-main-dev &
yarn watch-electron-dev &
yarn start &
```

3. **Note:** changes made to Electron require you to restart the app

# Create distributable binaries for MacOS and Windows

1. Clean and reinstall dependencies, then build the project:

```shell
yarn clean 
yarn purge
yarn install
yarn build
```

2. Create the distributables:

```shell
yarn dist
```

# Debugging

By default, devtools only shows logs from the renderer process. In order to debug the main process, we have to explicitly call electron using the `--inspect` flag. We have already
set up a command to include the flag (i.e. `yarn start-debug`). The only thing left to do is setup a debugger. The easiest way is to use Chrome; the steps are detailed below.

1. Open Chrome and navigate to `chrome://inspect`
2. Click "Open dedicated DevTools for Node"
3. Click "Add connection"
4. Type in `localhost:5858` and click "Add"
5. From the root directory, run `yarn start-debug`
6. Return to the Node DevTools window and you should see output in the `Console` tab

It is best to use `yarn watch-main-dev` and `yarn watch-electron-dev` while debugging because source code is not minified, there are optimizations, and source map is not generated
in non-`dev` targets.

## Debugging in WebStorm
We can do the same as above, but in WebStorm

1. Add a new build configuration
2. Press `+`
3. Choose "Attach to Node.js/Chrome"
4. Give it a name and set it to port 5858
5. Click "Ok"
6. Select the configuration and press the "Debug" button
