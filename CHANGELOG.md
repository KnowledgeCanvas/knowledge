# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.7.1](https://github.com/KnowledgeCanvas/knowledge/compare/v0.6.2...v0.7.1) (2023-03-23)


### Features

* added the ability to open multiple sources at the same time through the context menu. ([dba6268](https://github.com/KnowledgeCanvas/knowledge/commit/dba62685d5ef01e9b8b001d026330166ababd98d))
* added the ability to preview local mp4 files. ([e4e5117](https://github.com/KnowledgeCanvas/knowledge/commit/e4e5117b5e743807e4e12c589f119d27ae8881bd))
* **Due Dates:** distinguish past due from future due dates. ([26d2ef2](https://github.com/KnowledgeCanvas/knowledge/commit/26d2ef28253fa4daab5922903221cee8ed8b7e7c))
* **Examples:** added a new set of curated examples, this time including topics. ([ccb0bc5](https://github.com/KnowledgeCanvas/knowledge/commit/ccb0bc5ed0318b589a56e59f70f402949aab47cf))
* **Graph:** added a bunch of new Graph features, including single/double click behavior, better and more efficient layout sequencing, and a new control panel. ([cf3dc13](https://github.com/KnowledgeCanvas/knowledge/commit/cf3dc130a337a0e9233b305b28bf959d40bb38d7))
* **Graph:** added graph settings and new controls. ([cfdc9c1](https://github.com/KnowledgeCanvas/knowledge/commit/cfdc9c1555207581a37a87f3101ca7d14b5bd86d))
* **Graph:** added new features to the graph, including enhanced search, save to png, and more. ([ab27e2c](https://github.com/KnowledgeCanvas/knowledge/commit/ab27e2c47706921515cd5f627499e1cb154e5fd5))
* **Graph:** added new features to the graph, including enhanced search, save to png, and more. ([57d4f33](https://github.com/KnowledgeCanvas/knowledge/commit/57d4f336b02e9c427e78634dc26b3c8b428945bf))
* **Graph:** integrated knowledge graph into main application. ([57a723c](https://github.com/KnowledgeCanvas/knowledge/commit/57a723cbb3c9c7888fa970fa9ed30b54097f2527))
* **Graph:** project node size and color are now based on depth in the tree (from root). ([eb43b65](https://github.com/KnowledgeCanvas/knowledge/commit/eb43b65459ef430c07802019d49af4db129c65b2))
* **Graph:** set "hierarchical" as default layout. ([0b060e1](https://github.com/KnowledgeCanvas/knowledge/commit/0b060e163fb601ecde6f7dee3cc856e23758e840))
* **Graph:** set size of nodes based on their degree (number of neighboring nodes). ([8778a52](https://github.com/KnowledgeCanvas/knowledge/commit/8778a524c8416bfde6c81b95d94860d095d6d048))
* **Inbox:** add hotkeys for navigating through sources. ([75a815e](https://github.com/KnowledgeCanvas/knowledge/commit/75a815e68071c9cd0f3c1dba7d668c813bd55bd1))
* **Inbox:** add the ability to "Import All" and "Remove All". ([d890b7a](https://github.com/KnowledgeCanvas/knowledge/commit/d890b7abfa47465796b991e5d4716ac8ffd092a4))
* **Projects:** add graph to Projects page. ([9d710e7](https://github.com/KnowledgeCanvas/knowledge/commit/9d710e744a33ccdc56f130725c06f97d90a1b200))
* **Projects:** added listener to automatically open/close project tree on window resize. ([377b976](https://github.com/KnowledgeCanvas/knowledge/commit/377b976887f94c953ad8fa464fa8baa4183f57a0))
* **Projects:** Show top 20 source topics in Projects view. ([97a7000](https://github.com/KnowledgeCanvas/knowledge/commit/97a70009a60da9e4aa2774aa57af638ec24a5e2f))
* **Projects:** the Project tree is now integrated into the main body of the app (toggleable). ([c20d552](https://github.com/KnowledgeCanvas/knowledge/commit/c20d552239626c4f0f9bdfd407cce4f846db56e1))
* **Settings:** add template for standardizing various settings controls. ([9f5d52e](https://github.com/KnowledgeCanvas/knowledge/commit/9f5d52e4bba0fc9cf11c4e2c13b687b6452de8eb))
* **Settings:** add the ability to enable or disable animations across the entire app. ([f8c03f2](https://github.com/KnowledgeCanvas/knowledge/commit/f8c03f2a961c9d541a14c8346b1e5608edd1a880))
* **Settings:** add various settings and updated styling in the settings menu. ([080442a](https://github.com/KnowledgeCanvas/knowledge/commit/080442a3de28db9a6ecd5915b956f4a5a1e74e06))
* standardize right-click menu for Projects throughout the app. ([1926f62](https://github.com/KnowledgeCanvas/knowledge/commit/1926f6211e562281b02c0ef8b5b59d03d4ef5da6))
* update primeicons to version 6.0.1. ([58f79df](https://github.com/KnowledgeCanvas/knowledge/commit/58f79df738454bdc8c788fe7b9cbdedee63ab815))


### Bug Fixes

* bug [#93](https://github.com/KnowledgeCanvas/knowledge/issues/93) where an extra node is added when the graph is first constructed. ([2671b9c](https://github.com/KnowledgeCanvas/knowledge/commit/2671b9cba27b78ef734bc4ab20557bdf94812b24))
* explicitly destroy graph container in component destructor. ([25e1362](https://github.com/KnowledgeCanvas/knowledge/commit/25e136267ccc85fd3989a2fcc915dcc0490bc0f9))
* fixed an issue where newly added sources did not show up in the search list until the app was restarted. ([95de130](https://github.com/KnowledgeCanvas/knowledge/commit/95de13048ee7e85db3f2c3bb3270d6955c022446))
* graph not fitting to view on first navigation. ([22073b4](https://github.com/KnowledgeCanvas/knowledge/commit/22073b42c5e6e16c8e43cba4f214c1d13bd10aed))
* links can now be imported even if they are uncreachable. ([725f91b](https://github.com/KnowledgeCanvas/knowledge/commit/725f91b085bdf9f95479e477b1458f09dae64e9c))
* modifying nodes in the graph now updates them appropriately. ([fef1512](https://github.com/KnowledgeCanvas/knowledge/commit/fef1512df94d86073de1f52a6c4a20e7cbeb5c88))
* project detail components not collapsing and expanding correctly. ([806d7b6](https://github.com/KnowledgeCanvas/knowledge/commit/806d7b6cc3655787505ef862f3520aa5a5b248a5))
* renaming projects now works for 3-letter project names. ([50e431a](https://github.com/KnowledgeCanvas/knowledge/commit/50e431a5712e7523d254b192636273088e5c9721))
* replace minimatch 3.0.4 with 3.0.5 to resolve ReDoS vulnerability ([fce5e48](https://github.com/KnowledgeCanvas/knowledge/commit/fce5e4841e7e946230ae47e2a7bbf31de7f6c6de))
* set angular file size limits higher to deal with cytoscape dependency import. ([280ddc7](https://github.com/KnowledgeCanvas/knowledge/commit/280ddc769b449d1a3559756aa658333738503f08))
* set correct import method when importing examples. ([beff40d](https://github.com/KnowledgeCanvas/knowledge/commit/beff40d27a450c3ebeb5b896f1f9c26234215819))
* various dependabot alerts of moderate to critical severity. ([b02358c](https://github.com/KnowledgeCanvas/knowledge/commit/b02358ceffa6193491647f8340f0e3361988e9af))

### 0.7.1 (2023-03-23)

### Features

* **Due Dates:** add indicators below the icons of sources that have due dates. ([26d2ef2](https://github.com/KnowledgeCanvas/knowledge/commit/26d2ef28253fa4daab5922903221cee8ed8b7e7c))


### Bug Fixes

* bug [#93](https://github.com/KnowledgeCanvas/knowledge/issues/93) where an extra node is added when the graph is first constructed. ([2671b9c](https://github.com/KnowledgeCanvas/knowledge/commit/2671b9cba27b78ef734bc4ab20557bdf94812b24))
* links can now be imported even if they are uncreachable. ([725f91b](https://github.com/KnowledgeCanvas/knowledge/commit/725f91b085bdf9f95479e477b1458f09dae64e9c))
* modifying nodes in the graph now updates them appropriately. ([fef1512](https://github.com/KnowledgeCanvas/knowledge/commit/fef1512df94d86073de1f52a6c4a20e7cbeb5c88))
* renaming projects now works for 3-letter project names. ([50e431a](https://github.com/KnowledgeCanvas/knowledge/commit/50e431a5712e7523d254b192636273088e5c9721))

## [0.7.0](https://github.com/KnowledgeCanvas/knowledge/compare/v0.6.2...v0.7.0) (2022-12-10)


### Features

* added the ability to open multiple sources at the same time through the context menu. ([8b42637](https://github.com/KnowledgeCanvas/knowledge/commit/8b42637398968d24a4f399194364d98c6897212a))
* added the ability to preview local mp4 files. ([796f935](https://github.com/KnowledgeCanvas/knowledge/commit/796f935b77d0c6ae458fe2124b7a07e51aa0e004))
* **Examples:** added a new set of curated examples, this time including topics. ([c21fee4](https://github.com/KnowledgeCanvas/knowledge/commit/c21fee46452f6cb80489be19f4516e8c861cc7ee))
* **Graph:** added a bunch of new Graph features, including single/double click behavior, better and more efficient layout sequencing, and a new control panel. ([d79d1e7](https://github.com/KnowledgeCanvas/knowledge/commit/d79d1e752340f91678f4767f9003c1c4676e1561))
* **Graph:** added graph settings and new controls. ([1b5dae3](https://github.com/KnowledgeCanvas/knowledge/commit/1b5dae33841acaf6b61468740b2b0d1a282d5626))
* **Graph:** added new features to the graph, including enhanced search, save to png, and more. ([2a156c0](https://github.com/KnowledgeCanvas/knowledge/commit/2a156c0616ce1f8abdc80bf3f82d25a00d5a22b4))
* **Graph:** added new features to the graph, including enhanced search, save to png, and more. ([6cead3d](https://github.com/KnowledgeCanvas/knowledge/commit/6cead3dec10047c0fd977fbf738bc4d82669dc25))
* **Graph:** integrated knowledge graph into main application. ([79afdd4](https://github.com/KnowledgeCanvas/knowledge/commit/79afdd406ae40a6d101ee016091d7750b5478687))
* **Graph:** project node size and color are now based on depth in the tree (from root). ([6253697](https://github.com/KnowledgeCanvas/knowledge/commit/625369726ff38641b8b737bcec81cc77c54e2a7c))
* **Graph:** set "hierarchical" as default layout. ([3892096](https://github.com/KnowledgeCanvas/knowledge/commit/38920969a6b3c715a12385d7fe996fa78a3c71a8))
* **Graph:** set size of nodes based on their degree (number of neighboring nodes). ([0f3d7af](https://github.com/KnowledgeCanvas/knowledge/commit/0f3d7afd371823d564828b0afb3fdc4fde0756f6))
* **Inbox:** add hotkeys for navigating through sources. ([99be066](https://github.com/KnowledgeCanvas/knowledge/commit/99be066b6c9c4ba766638c44fb0a6de64f40f8d5))
* **Inbox:** add the ability to "Import All" and "Remove All". ([9f57aa6](https://github.com/KnowledgeCanvas/knowledge/commit/9f57aa68b69c1c33e9db6d118027a8ba6d91f9ee))
* **Projects:** add graph to Projects page. ([4d87ae6](https://github.com/KnowledgeCanvas/knowledge/commit/4d87ae686862c03341d898dacc41dd57a2eb8654))
* **Projects:** added listener to automatically open/close project tree on window resize. ([2a3e32c](https://github.com/KnowledgeCanvas/knowledge/commit/2a3e32cdff2ac6e41708383a6aca28b37caa6849))
* **Projects:** Show top 20 source topics in Projects view. ([5c18ac5](https://github.com/KnowledgeCanvas/knowledge/commit/5c18ac5ecf822a9344b1a7289075a3d3e26c4329))
* **Projects:** the Project tree is now integrated into the main body of the app (toggleable). ([67dc883](https://github.com/KnowledgeCanvas/knowledge/commit/67dc883a91eaaf616c12961f2bf5e3a20f781a7d))
* **Settings:** add template for standardizing various settings controls. ([d17c284](https://github.com/KnowledgeCanvas/knowledge/commit/d17c2844ca8d0e357a344fbdcbc58811e88ee3d9))
* **Settings:** add the ability to enable or disable animations across the entire app. ([d04c6c3](https://github.com/KnowledgeCanvas/knowledge/commit/d04c6c3eb3f177798f068a4f916a5ea3c787f1db))
* **Settings:** add various settings and updated styling in the settings menu. ([d99ce50](https://github.com/KnowledgeCanvas/knowledge/commit/d99ce503687ae7e5e92070422a0913ae0e63ad03))
* standardize right-click menu for Projects throughout the app. ([f9610b8](https://github.com/KnowledgeCanvas/knowledge/commit/f9610b8e45626286ac73c956dcbe56da83381675))
* update primeicons to version 6.0.1. ([c539316](https://github.com/KnowledgeCanvas/knowledge/commit/c539316f0ea20f4179ed8103929501051a61cba7))


### Bug Fixes

* explicitly destroy graph container in component destructor. ([a766751](https://github.com/KnowledgeCanvas/knowledge/commit/a766751a630ca7173bbb8379793e8fe52a9864ec))
* fixed an issue where newly added sources did not show up in the search list until the app was restarted. ([9941ec9](https://github.com/KnowledgeCanvas/knowledge/commit/9941ec933f408d4509b6e7907095d5f29833c744))
* graph not fitting to view on first navigation. ([24f189c](https://github.com/KnowledgeCanvas/knowledge/commit/24f189c211faa318a97f5b813624fcb97a72196e))
* project detail components not collapsing and expanding correctly. ([7a5c1f3](https://github.com/KnowledgeCanvas/knowledge/commit/7a5c1f32a799501aa5ce194eabf0c9f14f2be5a4))
* replace minimatch 3.0.4 with 3.0.5 to resolve ReDoS vulnerability ([fce5e48](https://github.com/KnowledgeCanvas/knowledge/commit/fce5e4841e7e946230ae47e2a7bbf31de7f6c6de))
* set angular file size limits higher to deal with cytoscape dependency import. ([94b8d66](https://github.com/KnowledgeCanvas/knowledge/commit/94b8d66a54b7c0f459bec5bab4ef40a7373c1ba2))
* set correct import method when importing examples. ([088a161](https://github.com/KnowledgeCanvas/knowledge/commit/088a161c07e65289d3f18a437af09b76d848f65d))
* various dependabot alerts of moderate to critical severity. ([2681353](https://github.com/KnowledgeCanvas/knowledge/commit/26813537a3ad2a2acea1fae61db55628a1c98288))

### [0.6.2](https://github.com/KnowledgeCanvas/knowledge/compare/v0.6.1...v0.6.2) (2022-10-23)


### Features

* clicking on fields in metadata table now copies those values to clipboard. ([6dd75b9](https://github.com/KnowledgeCanvas/knowledge/commit/6dd75b932fd716cfd03ce415f8b4c5a54a82fd78))
* **Import:** added two new import methods (example and recommendation). ([4092af4](https://github.com/KnowledgeCanvas/knowledge/commit/4092af4bd723f964dd702f933231c4e3809e8f2e))
* **Inbox:** add the ability to import example sources when the inbox is empty. ([ace76fb](https://github.com/KnowledgeCanvas/knowledge/commit/ace76fb403a718bf54200b4cf38bd497cb6dff22))
* **Inbox:** update look and feel of inbox message template. ([6b7f849](https://github.com/KnowledgeCanvas/knowledge/commit/6b7f8495fa165b33c1ecf5b673eb9dea2f16a6b7))
* **Inbox:** Updated inbox to be more... inbox-like. ([38e9b4f](https://github.com/KnowledgeCanvas/knowledge/commit/38e9b4f431c7c9711a083b713472156203e2e1e2))
* **Inbox:** Updated inbox to be more... inbox-like. ([c6990fd](https://github.com/KnowledgeCanvas/knowledge/commit/c6990fd0d0d7481fa677ff39bb3c3d65435271d0))
* **Preview:** Improved the Source Preview experience with better error handling and nicer loading page. ([5c2e9e5](https://github.com/KnowledgeCanvas/knowledge/commit/5c2e9e55554a003a89c0ef797956656f481bace6))
* **Shortcut Keys:** Add shortcut key to Inbox for cycling through imported Sources. ([62b8316](https://github.com/KnowledgeCanvas/knowledge/commit/62b831674b5bea1a15e8da52c005ebe44734a601))
* **Storage:** Add the ability to export the entire contents of local storage. ([4c50705](https://github.com/KnowledgeCanvas/knowledge/commit/4c5070590206bfcce9cf14c1101e64941e99b30f))
* update look and feel of `Source Details` component. ([951f78d](https://github.com/KnowledgeCanvas/knowledge/commit/951f78d67d7848fcd83396c7ce2ab112b451de65))


### Bug Fixes

* add debounce to toast notifications to prevent duplicates. ([b99e0f4](https://github.com/KnowledgeCanvas/knowledge/commit/b99e0f44aaae3bde390ea1f0fb9321c8fa3dda7a))
* add logic to deal with undefined changes in `Source Details`. ([a2e560b](https://github.com/KnowledgeCanvas/knowledge/commit/a2e560bfc0cb6bacb2304c047ed9477a8d7cab5d))
* Favicon extractor no longer attempts to match GitHub and Google URLs (edge cases) using the `includes` method. ([2a37d82](https://github.com/KnowledgeCanvas/knowledge/commit/2a37d8212a15c26f43ab9a27d2e0457bc6ade42f))
* **Inbox:** Using the `+ Link` import method now validates URLs to avoid silent errors. ([b6e89ab](https://github.com/KnowledgeCanvas/knowledge/commit/b6e89ab2ebc7c758e33b2c11e33f9569bd0bb243))
* Tutorial can now be closed by pressing the escape key. ([71d854a](https://github.com/KnowledgeCanvas/knowledge/commit/71d854a8c197d4e3d336275e54cf2e570538e824))

## 0.6.1 (2022-07-30)

### Fixes

* Resolves vulnerabilities in `got`, `async`, `ejs`, and `terser`.
* Bump Angular from 13.x to 14.x.

## [0.6.0](https://github.com/KnowledgeCanvas/knowledge-canvas/compare/v0.5.0...v0.6.0) (2022-07-21)

### ⚠ BREAKING CHANGES

* Various core data structures have been revised.
* Settings schema has been revised.

### Features

* Add a new startup service to Angular for performing operations early on in the application lifecycle. ([1f1c6fe](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/1f1c6fe78d31f34a69b5bb83326635d74c849ceb))
* **Autoscan:** Implemented full-fledged Autoscan functionality. ([5acbb78](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/5acbb782d761cbaf71c202541a2662b01a236161))
* **Autoscan:** Made autoscan file handling more robust and provided user notifications for important file life cycle events. ([804149a](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/804149aeb97ab05e774a4d4107292aaabb1d2d04))
* **Display Settings:** Added options to allow user to receive logging messages as "toasts". ([64b358f](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/64b358fd1bb0c78f4a2cc8a7a28af5bb98a50a5d))
* **Export:** Adds a dialog for export customization and satisfies roughly half of the request in [[#32](https://github.com/KnowledgeCanvas/knowledge-canvas/issues/32)](https://github.com/KnowledgeCanvas/knowledge-canvas/issues/32) ([#54](https://github.com/KnowledgeCanvas/knowledge-canvas/issues/54)) ([4b65df2](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/4b65df24e4cff19b9289932da5a6c8a9f90c477b))
* **Extensions:** Implemented browser extension services to receive Knowledge Sources from supported Chrome and Firefox extensions. ([967a62f](https://github.
  com/KnowledgeCanvas/knowledge-canvas/commit/967a62fdc124d77096025a1c16fdcb0b72f0153a))
* **Ingest Settings:** Added autoscan, file manager, and extension server settings. ([d5946bc](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/d5946bcaaa0dc834cd06c560b050f6c0d154a1e2))
* **IPC:** Add new channels for communicating with file watcher. ([33b156c](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/33b156c8a5d430df9c521cb9459d861fce7a5683))
* **Logging:** Add "success" logging method for successful operations. ([2dcce30](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/2dcce305bb40e18a76db0a09df64c238ccd8871a))
* **Logging:** Created centralized logging service for displaying messages to user and printing to console. ([5a0981b](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/5a0981b3c49b2c43098f954e36f037a1b497487c))
* **Style:** Minor tweaks to the way information is presented in the Knowledge Source info/details view. ([bbadb2b](https://github.
   com/KnowledgeCanvas/knowledge-canvas/commit/bbadb2b7d8b54dc62eab3d1605e9ee1b14d4a627))


### Bug Fixes

* Addresses 5 moderate and 2 high severity vulnerabilities ([47c13cf](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/47c13cf6e7d8d405c06e3bd8e701485e7a1bdabe))
* Addresses multiple dependency vulnerabilities that range from low to critical severity. ([#40](https://github.com/KnowledgeCanvas/knowledge-canvas/issues/40)) ([414bc06]
  (https://github.com/KnowledgeCanvas/knowledge-canvas/commit/414bc0686d685e3b4881ab5b62593fa81a8394d6))
* Regression after data structure refactor ([0e25d3b](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/0e25d3bbb1d090a67af7ba7791d1d1219c30e1e5))


* Revised schema for application settings and merged/centralized all settings services and IPC. ([777c6ed](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/777c6ed57cd7cbffe8097999bbe03206a0c8adcf))

### [0.5.4](https://github.com/KnowledgeCanvas/knowledge-canvas/compare/v0.5.0...v0.5.4) (2022-04-24)


### Features

* Add the ability to extract text from preview by highlighting and right-clicking. The extracted text is added to the Knowledge Source description. ([#47](https://github.com/KnowledgeCanvas/knowledge-canvas/issues/47)) ([fcbefec](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/fcbefeca26f955b63dd5e39d1cff1c6746bfc589))
* Automatically restore the last view when app restarts (either table or grid view). ([#48](https://github.com/KnowledgeCanvas/knowledge-canvas/issues/48)) ([13c3e5a](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/13c3e5a104df716fd429495d76ce1e2ea498d705))
* **Calendar:** Improve default calendar experience, add legend "indicators" to signal event type (fails basic accessibility metrics for people who are colorblind, should be more carefully designed with that in mind) ([#44](https://github.com/KnowledgeCanvas/knowledge-canvas/issues/44)) ([bc9e5ec](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/bc9e5ec96dd69c59b933802b21b67742653a8324))
* **Import:** Add the ability to import directly into current project instead of automatically sending new Knowledge Sources to "Up Next". ([#45](https://github.com/KnowledgeCanvas/knowledge-canvas/issues/45)) ([83c21e4](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/83c21e485c48f9e1be279f073f428fb852cf89df))
* **Shortcuts:** Added new shortcut keys for navigating the application. See the [Wiki](https://github.com/KnowledgeCanvas/knowledge-canvas/wiki/Shortcut-Keys) for a list of all shortcuts. ([c0c7eb4](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/c0c7eb44f316b37e48b6235adece161896189414))


### Bug Fixes

* Address 5 moderate and 2 high severity vulnerabilities ([47c13cf](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/47c13cf6e7d8d405c06e3bd8e701485e7a1bdabe))
* Resolves an issue on Linux where attempting to retrieve thumbnails for files throws an error (only supported on MacOS and Windows by Electron). ([13404db](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/13404dbe45ca855aa28e795573b602c4445fbeb5))
* Stop automatically attempting to extract text content from files through Tika until we figure out a better extraction pipeline. ([56dbdb4](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/56dbdb4f2ca9cf516efe6a6ee649f797c6f75122))

### [0.5.3](https://github.com/KnowledgeCanvas/knowledge-canvas/compare/v0.5.0...v0.5.3) (2022-03-15)

### Bug Fixes

* a bug where selecting the current project in dropdown causes the KS to be deleted completely ([#37](https://github.com/KnowledgeCanvas/knowledge-canvas/issues/37)) ([7e8ba77](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/7e8ba77232c39271f69ee4ab97782dda87023eca))
* browser extension server no longer starts automatically ([#36](https://github.com/KnowledgeCanvas/knowledge-canvas/issues/36)) ([4d70c14](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/4d70c14be03ea4e8502da5dcbc4b7b2eb6f9d6a0))
* Even more scrollbars (╯°□°）╯︵ ┻━┻ ([bdb23b3](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/bdb23b34a3391f226a1720ebe8f96b36c98ba7fe))
* Fixed a bug where `Knowledge Graph` fails to load completely due to a missing `Knowledge Source` icon. ([#28](https://github.com/KnowledgeCanvas/knowledge-canvas/issues/28)) ([5f6a95d](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/5f6a95d2dec71ceeac2c185c197345e8572a4205))
* Fixed an issue where the window would start in dark mode, even if it should have been in light mode. ([#30](https://github.com/KnowledgeCanvas/knowledge-canvas/issues/30)) ([7c10edc](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/7c10edc8564c9a882b7e304867441ccf6ce77a12))
* long titles get cut off and/or clutter context menu ([6a5cfc6](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/6a5cfc68c5a93358df54fd21d97f465011a62379))
* PDF preview is now properly sized! ([#31](https://github.com/KnowledgeCanvas/knowledge-canvas/issues/31)) ([1eb23a6](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/1eb23a6be32aab8708ea1b58576103527cb1694e))
* Scrollbars all over the place! (at least on Windows and Linux). ([#29](https://github.com/KnowledgeCanvas/knowledge-canvas/issues/29)) ([8d23167](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/8d23167623ad145783b515b92a9a328d73d991d2))

### [0.5.2](https://github.com/KnowledgeCanvas/knowledge-canvas/compare/v0.5.0...v0.5.2) (2022-02-24)


### Features

* Add Grid and Calendar views ([#24](https://github.com/KnowledgeCanvas/knowledge-canvas/issues/24)) ([9367db8](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/9367db80f7801c65c175af7ce93af4bef618407d))


### Bug Fixes

* addresses 5 moderate and 2 high severity vulnerabilities ([47c13cf](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/47c13cf6e7d8d405c06e3bd8e701485e7a1bdabe))
* package application was not able to find knowledge graph due to improper setup ([#26](https://github.com/KnowledgeCanvas/knowledge-canvas/issues/26)) ([4bc5dd2](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/4bc5dd2adad15b02e65efb73d41079ff7f521291))

### [0.5.1](https://github.com/KnowledgeCanvas/knowledge-canvas/compare/v0.5.0...v0.5.1) (2022-02-16)


### Features

* **Ingest:** temporarily disable file watcher and manager until issues are resolved ([#21](https://github.com/KnowledgeCanvas/knowledge-canvas/issues/21)) ([9a8e18b](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/9a8e18b04455ab74bea8f4d2ff5b8656a40385d2))


### Bug Fixes

* addresses 5 moderate and 2 high severity vulnerabilities ([47c13cf](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/47c13cf6e7d8d405c06e3bd8e701485e7a1bdabe))

## [0.5.0](https://github.com/KnowledgeCanvas/knowledge-canvas/compare/v0.4.0...v0.5.0) (2022-02-03)


### ⚠ BREAKING CHANGES

* Angular material has been removed and will not be used moving further

* refactor: fix a few errors in SVG files

* feat: first cytoscape implementation

* Feat primeng (#14) ([ee0392e](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/ee0392e87efddabeb4d627dbde995dbcd4cf0386)), closes [#14](https://github.com/KnowledgeCanvas/knowledge-canvas/issues/14)

## [0.4.0](https://github.com/KnowledgeCanvas/knowledge-canvas/compare/v0.3.4...v0.4.0) (2021-12-27)


### ⚠ BREAKING CHANGES

* Upgrade node from 12.x to 16.13.1. Upgrade yarn from 1.2x to 3.1.1. Upgrade Angular from 12.1.x to 13.1.2.

### Features

* add option to disable/enable row expansion in KS table ([bf9d0ee](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/bf9d0ee84487c9bedbeca99c6cbf6b2ed4d57310))
* **AI/ML:** reinstate text extraction using Tika ([140b249](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/140b249b09dfa458c8c3cc660c207a99e7beb0a0))
* **Knowledge Graph:** Snapshot - add new knowledge graph project separate from Angular implementation ([4b9a3b5](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/4b9a3b52d0322047808e3ce74317592e08bf799f))
* **Knowledge Graph:** Snapshot - add new knowledge graph project separate from Angular implementation ([246de9b](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/246de9bea5d8fac024179cf8384fc8cc6e9ea6ac))
* **KS:** update KS dashboard to display time series information and ks-notes component ([8dc0944](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/8dc09440a84a8fca0b7a60e4bb2d132b69f966ff))
* **NLP:** added a summarization script/notebook for initial testing ([7ff09dd](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/7ff09dda3861e4a48b20b53911d738eb68e93225))


### Bug Fixes

* storage service persisting entire project structures instead of just UUID ([6b3b786](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/6b3b7862bb5d64d217c673508a71d7dc82d6f504))


### build

* Upgrade Node.js, Yarn, and Angular ([3262bf9](https://github.com/KnowledgeCanvas/knowledge-canvas/commit/3262bf9ea43707505d2440a5f4158ff97134679e))

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
