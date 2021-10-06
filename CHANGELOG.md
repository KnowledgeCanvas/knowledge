# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.3.3](https://github.com/RobRoyce/knowledge-canvas/compare/v0.3.2...v0.3.3) (2021-10-06)


### Features

* **Knowledge Source:** add KS floating action button (FAB) for KS ingestion ([60528bc](https://github.com/RobRoyce/knowledge-canvas/commit/60528bc84460e6f6a586202a401e2d41ea1a5552))

### [0.3.2](https://github.com/RobRoyce/knowledge-canvas/compare/v0.3.1...v0.3.2) (2021-10-04)


### Features

* **Knowledge Source:** add hover directive to display "remove" button while hovering over a KS icon ([4284cea](https://github.com/RobRoyce/knowledge-canvas/commit/4284ceafddecdc4419e9950384f8a3aa43deedc4))
* **Knowledge Source:** implemented new KS drag-and-drop component. ([2639591](https://github.com/RobRoyce/knowledge-canvas/commit/2639591d38a6f27670ad51c8369ea9151ec6813b))


### Bug Fixes

* autocomplete not displaying at appropriate times and sometimes blocks other UI elements. ([04dcf66](https://github.com/RobRoyce/knowledge-canvas/commit/04dcf669acbb234a60ae1aaaa3b09288e978699a))
* dark mode components briefly showing on startup, even if the user has light mode enabled. ([15f6262](https://github.com/RobRoyce/knowledge-canvas/commit/15f626231dfc916a27a4007e2943fe0813832cfa))
* prevent ks queue from disappearing when dragging the last element out of it ([f54d2f0](https://github.com/RobRoyce/knowledge-canvas/commit/f54d2f07b234877f6e1c8669bb2d611572ea0e6d))
* removed multiple stylesheet imports, use root variable instead. ([5ffff04](https://github.com/RobRoyce/knowledge-canvas/commit/5ffff04ae691486d4c3ce02d19441511f6d4aed2))
* use a more sensible icon for previewing knowledge sources in the table. ([1104865](https://github.com/RobRoyce/knowledge-canvas/commit/110486528326f288977ec4e9eb6f106acacf2b97))

### [0.3.1](https://github.com/RobRoyce/knowledge-canvas/compare/v0.3.0...v0.3.1) (2021-09-15)


### Bug Fixes

* **Projects:** squashed a bug that allows users to see project details when no projects exist ([631f642](https://github.com/RobRoyce/knowledge-canvas/commit/631f64294386b7ae1b10164458313880f7d4dd74))

## [0.3.0](https://github.com/RobRoyce/knowledge-canvas/compare/v0.2.5...v0.3.0) (2021-09-15)


### Features

* **Knowledge Source Drop List:** added a button the side of KS drop list to allow user to manually open/close ([f3e36a3](https://github.com/RobRoyce/knowledge-canvas/commit/f3e36a3d5637d46848824cf71a42b4b754dc7d38))
* **Knowledge Source:** added a service for displaying knowledge source info dialogs. ([66e15b7](https://github.com/RobRoyce/knowledge-canvas/commit/66e15b7868e852c4f248c0ab131119e552395287))
* **Knowledge Sources:** give the user ability to display knowledge sources from all sub-projects for easier filtering and aggregation. ([5a12101](https://github.com/RobRoyce/knowledge-canvas/commit/5a1210185d8045dc7adb51cf8a7caa1b3168be9d))


### Bug Fixes

* **Project Service:** squashed a bug that was causing some projects not to be deleted completely from the system ([d240c15](https://github.com/RobRoyce/knowledge-canvas/commit/d240c15a69603893ae5b2ddfbdf3acf3ae4ce0c0))
* **Project Tree:** adjusted appearance of the project tree controls ([be4102d](https://github.com/RobRoyce/knowledge-canvas/commit/be4102d3f1bd22d3653869c49f596f68e8d38026))
* **Project Tree:** made it so that clicking on a project that is already selected does not cause the tree to be reloaded. ([da56d92](https://github.com/RobRoyce/knowledge-canvas/commit/da56d92d399187320745ec5ad794d70f76b156df))

### [0.2.5](https://github.com/RobRoyce/knowledge-canvas/compare/v0.2.4...v0.2.5) (2021-09-13)


### Features

* **Build System:** add support for publishing using target architecture of current machine or all supported architectures ([329dcdd](https://github.com/RobRoyce/knowledge-canvas/commit/329dcdd81d5ef77d35a15c6178628002622a8361))
* **Knowledge Canvas:** remove knowledge source sidebar when ks queue is empty ([62e0686](https://github.com/RobRoyce/knowledge-canvas/commit/62e0686db8d110dde9b8dc0576af73eb6f2ada79))
* **Projects:** truncate project hierarchy breadcrumbs to avoid overflowing the top action bar ([57c07b9](https://github.com/RobRoyce/knowledge-canvas/commit/57c07b91bac30f1de684cb476857b51acf6234bf))

### 0.2.4 (2021-09-13)
