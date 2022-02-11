[Jump to the Screenshots!](#screenshots)

# Description

## Disclaimer
This software is not a finished product and provides no warranty of any kind. You are welcome to open an issue or a pull request. Contributors are welcome.

As of Feb 2022, there is a good chance that _something_ in the app is not working properly, simply because it has not been fully implemented yet. No extensive testing has been conducted on Windows or Linux. It is very likely that something is broken on one or both of those platforms. Testing and verification on either platform is welcome.

## What
Knowledge Canvas is a meta-productivity tool meant to make learning and research easier and more organized. **With Knowledge Canvas, you can import almost any digital resource and treat it as a knowledge-producing entity.** This is accomplished by abstracting any/every digital resource into what I call a Knowledge Source, which is a polymorphic structure that may contain things like metadata, raw text, events (like due dates), and more. Knowledge sources are grouped into Projects, which are organized hierarchically (effectively, a tree where nodes can have a single parent and 0+ children) and can be extended in any configuration the user prefers.

Knowledge Canvas is built on Electron and Angular and is primarily written in TypeScript. It is intended to be Web3 capable and utilizes Open Graph standards.

## Why
Two things led me to the development of KC:
1. While working at JPL as an intern (back in 2019), one of my projects involved summarizing articles from IDC and Gartner to support efforts that required rapid research and iteration. Being perpetually lazy, I figured it would be easier to make a computer summarize things for me. While the idea was well received, there wasn’t enough funding/enthusiasm to support it as a standalone project.

2. When UCLA went online back in March of 2020, I struggled… hard. There were far too many digital resources to keep track of and the amount of required reading seemed to increase exponentially. I had various systems for organizing my files, and other systems for organizing web resources, but I felt like there should be a better, more unified, way of doing things.

## How
A knowledge source can be a link to a web page, a path to a local file, a URI to a calendar entry, etc. **If you can drag-and-drop something in to the app, it can be a knowledge source.** So far I have hooks for local files, web links, raw text, raw HTML, calendar entries (macOS), emails (macOS), and OmniFocus tasks (macOS). This list is limited to the things I have had time and interest to implement, but the possibilities are quite literally endless.

Once a knowledge source is imported, we can pass it to Tika to extract text content, which can then be used to generate extractive/abstractive summaries (a-la BERT, DistilBERT, …), perform topic modeling, document clustering, etc. One of the more exciting possibilities is what I’m calling the PRDAG, short for “pre-requisite directed acyclic graph”. The PRDAG, once implemented, will take in a selection of knowledge sources and generate a graph that answers the question “which of these N articles/documents should I read first, second, etc.“.

Finally, the app is built on Electron, so it has most of the capabilities you would expect from a normal browser. This means you can view/use full-blown web apps like Trello, Notion, and Google Docs directly, without ever leaving the application. As of now, you can also preview PDFs directly from the app using the default PDF viewer that comes with Chromium. I plan to integrate PDF.js at some point and support for markup/annotation will be paramount.


## Note
The app relies exclusively on local storage and local processes. There are no servers involved (except a local Docker instance of Tika Server) and local documents never leave your computer.

Cheers,
Rob Royce


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
<img width="1203" alt="image" src="https://user-images.githubusercontent.com/19367848/152474550-9432e28e-2511-4632-a327-15561b1f79cb.png">
<img width="1203" alt="image" src="https://user-images.githubusercontent.com/19367848/152473853-1575bec7-2035-4b62-9783-8328097dcbde.png">
<img width="1203" alt="image" src="https://user-images.githubusercontent.com/19367848/152473925-2e89c095-a24d-491d-a56a-4f3687d21b3b.png">
<img width="1601" alt="image" src="https://user-images.githubusercontent.com/19367848/153652641-3231b658-c933-4904-b0ea-6572fa0806f8.png">
<img width="1203" alt="image" src="https://user-images.githubusercontent.com/19367848/152470617-9bbc04a8-f692-43b9-9627-46951587e41c.png">
<img width="1203" alt="image" src="https://user-images.githubusercontent.com/19367848/152470661-4d096b91-ba75-4f6e-aeea-7b3a57672b2f.png">
