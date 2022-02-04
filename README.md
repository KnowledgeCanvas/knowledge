[Jump to the Screenshots!](#screenshots)

# A Quick Note

This software is not a finished product and provides no warranty of any kind. You are welcome to open an issue or a pull request. Contributors are welcome.

As of Feb 2022, there is a good chance that _something_ in the app is not working properly, simply because it has not been fully implemented yet. No extensive testing has been conducted on Windows or Linux. It is very likely that something is broken on one or both of those platforms. Testing and verification on either platform is welcome.

# Getting Started

1. Make sure you have Node, NPM, and Yarn installed. The following versions were used at the time of this writing:

- Node: 16.13.1
- Yarn: 3.1.1 (v2)
- NPM: 8.1.2

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

5. (OPTIONAL) purge dependencies and clear caches:

```shell
yarn purge
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

You can also choose to run `yarn watch-main` and `yarn watch-electron` (without the `-dev`), but they will take longer to transpile and build, and no source map will be produced.

# Create distributable binaries for MacOS, Windows and Linux

1. Clean and reinstall dependencies, then build the project:

```shell
yarn clean 
yarn purge
yarn install
yarn build
```

2. Create the distributables:

```shell
yarn dist-all
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

## Viewing main process output after app has been packaged

### MacOS

1. Run the appropriate commands (i.e. `yarn build` > `yarn dist`)
2. From the project root directory: `cd dist/mac/Knowledge\ Canvas.app/Contents`
3. Run `./MacOS/Knowledge\ Canvas`

Note that this *must* be run from the `Contents` folder

## Viewing main process output after app has been installed

The only difference between this and the above is where the `Contents` folder is located. In most cases, you must run the command from `/Applications/Knowledge Canvas.app/Contents`


# Screenshots

<img width="1203" alt="image" src="https://user-images.githubusercontent.com/19367848/152470358-64ac12de-e811-42b4-996f-67c3725a2ba7.png">
<img width="1203" alt="image" src="https://user-images.githubusercontent.com/19367848/152470548-939b9af2-3afb-4b5d-a1ff-894d18ed1daf.png">
<img width="1203" alt="image" src="https://user-images.githubusercontent.com/19367848/152470617-9bbc04a8-f692-43b9-9627-46951587e41c.png">
<img width="1203" alt="image" src="https://user-images.githubusercontent.com/19367848/152470661-4d096b91-ba75-4f6e-aeea-7b3a57672b2f.png">





## Viewing main process output after app has been installed
