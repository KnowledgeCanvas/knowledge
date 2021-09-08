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
This will allow you to refresh the application and see changes in real-time, without having to recompile Electron 
and Angular code (the watchers auto-compile as files are changed/saved).
1. Follow steps 1-2 above
2. Build, run, and watch the project:
```shell
yarn watch-main-dev &
yarn watch-electron-dev &
yarn start &
```
3. **Note:** changes made to Electron require you to restart the app 

# Create distributable binaries for MacOS and Windows

1. Build the project:
```shell
yarn build
```

2Create the distributables:
```shell
yarn dist
```
