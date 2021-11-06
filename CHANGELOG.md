# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.3.4](https://github.com/KnowledgeCanvas/knowledge-canvas/compare/v0.3.3...v0.3.4) (2021-11-06)


### Features

* **Electron IPC:** add "show file in folder" channel and implementation ([91e5a7e](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/91e5a7e32809c53ba7ce3ed106bf348da0c74102))
* **Electron IPC:** add "show item in folder" channel ([e6e8af3](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/e6e8af34af279e83531c04e8dd26f27fdfca5c97))
* **Knowledge Source:** add ability to show knowledge source (file) in local finder/explorer ([a91fb87](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/a91fb87cf3e11701f1269bf83ab31cd5070b3b0e))
* **Knowledge Source:** add knowledge source context menu component ([5ab538e](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/5ab538e7094eea961e69de5ae6434887bcd0bc74))
* **Knowledge Source:** add the ability to locate an associated project from context menu ([d57e90b](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/d57e90b26ecab2722d5f2a4b24c595965b84dd2b))
* **Knowledge Source:** added the ability to show sub-projects back into the KS table. ([5237d25](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/5237d25f77dd25412916abc5c5377fed0aa8d6a9))
* **Knowledge Source:** move ks info into table expansion element ([e0e3c3f](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/e0e3c3f96d0475fed43196c8bdd66626a957b9ab))
* **KS Icons:** optimize method for retrieving/extracting knowledge source icons ([1ce983d](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/1ce983d91cd88c15cc3d938266a1aa7d82a027d8))
* **Projects:** add project caching to storage service so we don't have to read from disk on every project update and refresh ([e096a30](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/e096a304e1b756a0ae83cc447c81c059fce3c779))
* **Projects:** added a right-click action for editing project details ([c820942](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/c820942cb7093973ae7fbc486991be3e332eb595))


### Bug Fixes

* actions on ks from table had no effect when using "show subproject sources" ([de422ad](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/de422ad8d06910a83cc4a1657211ea5c916194c6))
* change events not being triggered properly from ks info component ([2dff379](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/2dff379cec379095da67cefd50e9380789550094))
* **changelog:** change github links to reflect transfer of repo ownership to knowledge canvas account ([c04ddd1](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/c04ddd11e917c759383c15352cf707455aff3ef5))
* expanded table element no longer collapses when the project is updated or the knowledge source list changes ([5dfbb3a](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/5dfbb3af216e959ecc664f8663d573607c7e6eb5))
* ks drag and drop list not updating KS when modified ([f177ddc](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/f177ddc4f91ce82ba60f899a56a271e135035adf))
* prevent ksModified signal from being triggered if nothing was changed ([d0f49af](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/d0f49afeaa7d97b3069f8a8d932e4f7238be8fdf))
* prevent project service from updating subscribers on simple project update ([fabc9e3](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/fabc9e380569a4b21f68626cbe1cf54685c39a1a))
* project knowledge source list not being updated due to improper assignment ([4e27a2c](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/4e27a2c6706ff4bcad381334fe43e07d655ff2cb))
* project tree not highlighting active project ([516b1b1](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/516b1b17a1e12bde97885bba6f9714d682e8cc16))
* reduce request size from Google favicon service from 64px to 32px. ([9ffc4fb](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/9ffc4fba4df9d912ec3ae147914bb14db86f93c9))

### [0.3.3](https://github.com/KnowledgeCanvas/knowledge-canvas/compare/v0.3.2...v0.3.3) (2021-10-06)


### Features

* **Knowledge Source:** add KS floating action button (FAB) for KS ingestion ([60528bc](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/60528bc84460e6f6a586202a401e2d41ea1a5552))

### [0.3.2](https://github.com/KnowledgeCanvas/knowledge-canvas/compare/v0.3.1...v0.3.2) (2021-10-04)


### Features

* **Knowledge Source:** add hover directive to display "remove" button while hovering over a KS icon ([4284cea](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/4284ceafddecdc4419e9950384f8a3aa43deedc4))
* **Knowledge Source:** implemented new KS drag-and-drop component. ([2639591](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/2639591d38a6f27670ad51c8369ea9151ec6813b))


### Bug Fixes

* autocomplete not displaying at appropriate times and sometimes blocks other UI elements. ([04dcf66](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/04dcf669acbb234a60ae1aaaa3b09288e978699a))
* dark mode components briefly showing on startup, even if the user has light mode enabled. ([15f6262](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/15f626231dfc916a27a4007e2943fe0813832cfa))
* prevent ks queue from disappearing when dragging the last element out of it ([f54d2f0](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/f54d2f07b234877f6e1c8669bb2d611572ea0e6d))
* removed multiple stylesheet imports, use root variable instead. ([5ffff04](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/5ffff04ae691486d4c3ce02d19441511f6d4aed2))
* use a more sensible icon for previewing knowledge sources in the table. ([1104865](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/110486528326f288977ec4e9eb6f106acacf2b97))

### [0.3.1](https://github.com/KnowledgeCanvas/knowledge-canvas/compare/v0.3.0...v0.3.1) (2021-09-15)


### Bug Fixes

* **Projects:** squashed a bug that allows users to see project details when no projects exist ([631f642](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/631f64294386b7ae1b10164458313880f7d4dd74))

## [0.3.0](https://github.com/KnowledgeCanvas/knowledge-canvas/compare/v0.2.5...v0.3.0) (2021-09-15)


### Features

* **Knowledge Source Drop List:** added a button the side of KS drop list to allow user to manually open/close ([f3e36a3](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/f3e36a3d5637d46848824cf71a42b4b754dc7d38))
* **Knowledge Source:** added a service for displaying knowledge source info dialogs. ([66e15b7](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/66e15b7868e852c4f248c0ab131119e552395287))
* **Knowledge Sources:** give the user ability to display knowledge sources from all sub-projects for easier filtering and aggregation. ([5a12101](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/5a1210185d8045dc7adb51cf8a7caa1b3168be9d))


### Bug Fixes

* **Project Service:** squashed a bug that was causing some projects not to be deleted completely from the system ([d240c15](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/d240c15a69603893ae5b2ddfbdf3acf3ae4ce0c0))
* **Project Tree:** adjusted appearance of the project tree controls ([be4102d](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/be4102d3f1bd22d3653869c49f596f68e8d38026))
* **Project Tree:** made it so that clicking on a project that is already selected does not cause the tree to be reloaded. ([da56d92](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/da56d92d399187320745ec5ad794d70f76b156df))

### [0.2.5](https://github.com/KnowledgeCanvas/knowledge-canvas/compare/v0.2.4...v0.2.5) (2021-09-13)


### Features

* **Build System:** add support for publishing using target architecture of current machine or all supported architectures ([329dcdd](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/329dcdd81d5ef77d35a15c6178628002622a8361))
* **Knowledge Canvas:** remove knowledge source sidebar when ks queue is empty ([62e0686](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/62e0686db8d110dde9b8dc0576af73eb6f2ada79))
* **Projects:** truncate project hierarchy breadcrumbs to avoid overflowing the top action bar ([57c07b9](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/57c07b91bac30f1de684cb476857b51acf6234bf))

### 0.2.4 (2021-09-13)
