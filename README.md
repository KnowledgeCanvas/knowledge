# Download

- [Latest Release](https://github.com/KnowledgeCanvas/knowledge-canvas/releases/latest)
- [All Versions](https://github.com/KnowledgeCanvas/knowledge-canvas/releases)

# Community
Join our [Slack channel](https://join.slack.com/t/knowledgecanvas/shared_invite/zt-14df0e92b-fFXxyYwnaiQrVYOeBkR0mQ) to provide feedback, share ideas, and get support!

# Description
Knowledge Canvas is a meta-productivity tool meant to make learning 🧠 and research 📚 easier 😌 and more organized 🗂 ([screenshots](#screenshots)). With Knowledge Canvas, you can import almost any digital resource and use it to build your own personal `Knowledge Base`. This is accomplished by converting documents, websites, files, YouTube videos, and more, into what we call `Knowledge Sources`. `Knowledge Sources` are [polymorphic](https://en.wikipedia.org/wiki/Polymorphism_(computer_science)) structures that contain things like metadata, raw text, images, video, audio, events, timelines, and more. Knowledge sources are grouped into Projects, which are organized hierarchically and can be extended in any configuration the user prefers. Projects can also have their own timelines, topics, etc.

[Apache Tika](https://tika.apache.org) is used to extract text from Knowledge Sources. Once text is extracted, users can feed it into their own Machine Learning pipeline for training and inference. Future versions will include support for custom parsers and integrations with Jupyter Notebook. We also plan to provide various ML pipelines for standard things like text summarization, document clustering, and more.

Users can track their learning and research activity with event-driven logging and calendar support. This makes it easy to visualize where your time is spent while learning or researching, and which resources you rely on the most. This also makes finding recently-accessed or modified resources a piece of cake 🍰.

Knowledge Canvas is built on Electron and Angular and is primarily written in TypeScript. It is intended to be Web3 capable and utilizes Open Graph standards. Knowledge Canvas also comes with 20 (!) light and dark user-selectable themes ([screenshots](#screenshots)) and uses [PrimeNG](https://www.primefaces.org/primeng/showcase/#/) design language and Angular components.

# Security and Privacy
The app relies exclusively on local storage and local processes. There are no servers involved (except a local Docker instance of Tika Server) and local documents never leave your computer. Future versions may include opt-in reporting services to enhance functionality and improve support.

# Documentation
- [Knowledge Canvas - Background and Inspiration](https://github.com/KnowledgeCanvas/knowledge-canvas/wiki) 
- [Development and Build Instructions](https://github.com/KnowledgeCanvas/knowledge-canvas/wiki/Development)
- [Getting Started](https://github.com/KnowledgeCanvas/knowledge-canvas/wiki/Getting-Started)
- [Debugging](https://github.com/KnowledgeCanvas/knowledge-canvas/wiki/Debugging)

# Screenshots
## (and Walkthrough)

- `Projects` can be created by clicking the `Projects` button in the top menu bar, then clicking `New Project` in the Projects Sidebar. To create a `Sub-Project`, simply right-click on an existing `Project`, then click `New Sub-Project`. You can create any `Project` structure you desire, but we recommend keeping the `Project Tree` shallow (max depth of 8-10) for the sake of efficiency, legibility, and a better `Knowledge Graph` experience.
<img width="1267" alt="image" src="https://user-images.githubusercontent.com/19367848/155030194-09291f32-128d-4191-9637-50e2f20f944b.png">



- Speaking of `Knowledge Graph`, pressing the Knowledge Canvas icon next to the search bar will open the view below. Currently, the `Knowledge Graph` shows the hierarchical relationship between `Projects`, `Sub-Projects`, and `Knowledge Sources`. Future versions will include the ability to sort and filter the graph, as well as connect nodes based on things like `Topics`, dates, events, etc.
<img width="1267" alt="image" src="https://user-images.githubusercontent.com/19367848/155030112-6f51329a-3229-4dc2-80d1-a78fcf762ae0.png">


- `Knowledge Sources` can be added by pressing the `+` button at the bottom-right of the screen. Knowledge Canvas has special handlers for drag-and-drop data transfers, meaning you can drop links, files, and more and the app will attempt to convert the source material into a `Knowledge Source`. If a handler does not exist, we have an [easy API](https://github.com/KnowledgeCanvas/knowledge-canvas/blob/90dcbd7b19a05ad4ec93e17503abbed085a36fda/src/kc_angular/src/app/services/ingest-services/external-drag-and-drop/drag-and-drop.service.ts#L27) for creating new ones!
<img width="1601" alt="image" src="https://user-images.githubusercontent.com/19367848/153652641-3231b658-c933-4904-b0ea-6572fa0806f8.png">


- The main view shows the contents of a specific project (here, the project is CS131). The `Table` tab contains a list of `Knowledge Sources`, which can be filtered and sorted. The entire table can be exported to CSV for convenience. Knowledge Sources can be previewed, edited, or even opened in their default application, such as Word, Chrome, Safari, Visual Studio Code, Photoshop, etc., all at the click (or right-click) of a button.
<img width="1267" alt="image" src="https://user-images.githubusercontent.com/19367848/155031083-24c1c7f3-a310-455e-9f34-36377a43da65.png">


- The `Grid` tab shows `Knowledge Sources` in a different light. Instead of rows, you get cards, complete with thumbnails, topics, and more. This view is useful for browsing resources and getting a birds-eye view of a particular project.
<img width="1392" alt="image" src="https://user-images.githubusercontent.com/19367848/158475091-374e0648-f72e-46a0-853d-55dd8de60bb9.png">

- The `Calendar` tab allows us to view Knowledge Sources in the time domain. Every time a Knowledge Source is created, accessed, or modified, a new event is added to the calendar. This view is useful for the learning technique known as "spaced repitition," which is a way of strengthening your understanding of a subject by recollecting what you learned at various intervals of time. In future versions of Knowledge Canvas, we plan to include other learning tools like flashcards and "Pomodoro timers".
<img width="1279" alt="image" src="https://user-images.githubusercontent.com/19367848/154831016-75a569bd-fd38-4a7c-986e-1782fb0ef16c.png">

- The `Calendar` tab is further divided into timelines by day, week, and month. Calendar entries can be clicked for relevant information at a glance.
<img width="1274" alt="image" src="https://user-images.githubusercontent.com/19367848/155031681-d2a0fe79-d351-4e43-af51-94d79ddccb3a.png">


- You can also see the full timeline of a specific `Knowledge Source` by clicking the `Edit` button and going to the `Calendar` tab. While you're here, you can set a due date, set a reminder, create a checkpoint with custom message, or archive the `Knowledge Source` (once you're done with it). (Note: some of these features are not complete as of 02/21/22).
<img width="1203" alt="image" src="https://user-images.githubusercontent.com/19367848/152474550-9432e28e-2511-4632-a327-15561b1f79cb.png">

- Clicking on any topic in the `Topics` list, or typing a query into the top search bar, will instantly open a modal with full-fledged browsing capabilities. The topic or search term will be converted into a query and sent to the search engine of your choice. Knowledge Canvas currently supports Google [default], Bing, and DuckDuckGo as search providers (can be changed in `Settings` > `Search` > `Search Provider`. If you find a page you want to save, just click the `Save` icon and a new `Knowledge Source` will be added to `Up Next`. You can also copy the link or open it in your deafult browser with a simple button press.
<img width="1203" alt="image" src="https://user-images.githubusercontent.com/19367848/152473853-1575bec7-2035-4b62-9783-8328097dcbde.png">

- You can also click the `Preview` button on any `Knowledge Source` and Knowledge Canvas will attempt to load it directly in the app. This works seamlessly for any website like YouTube, Trello, Notion, GitHub, etc. It also works well for local files like PDFs, images, and some video formats.
<img width="1203" alt="image" src="https://user-images.githubusercontent.com/19367848/152473925-2e89c095-a24d-491d-a56a-4f3687d21b3b.png">

# Disclaimer
This software is not a finished product and provides no warranty of any kind. You are welcome to open an issue or a pull request. Contributors are welcome.

As of Feb 2022, there is a good chance that _something_ in the app is not working properly, simply because it has not been fully implemented yet. No extensive testing has been conducted on Windows or Linux. It is very likely that something is broken on one or both of those platforms. Testing and verification on either platform is welcome.
