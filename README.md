# Description
Knowledge Canvas is a meta-productivity tool meant to make learning and research easier and more organized ([screenshots](#screenshots)). With Knowledge Canvas, you can import almost any digital resource and treat it as a knowledge-producing entity. This is accomplished by abstracting digital resources into what we call a `Knowledge Source`, which is a [polymorphic](https://en.wikipedia.org/wiki/Polymorphism_(computer_science)) structure that may contain things like metadata, raw text, images, video, audio, events, timelines, and more. Knowledge sources are grouped into Projects, which are organized hierarchically and can be extended in any configuration the user prefers. Projects can also have their own timelines, topics, etc.

Knowledge Canvas is built on Electron and Angular and is primarily written in TypeScript. It is intended to be Web3 capable and utilizes Open Graph standards.

# Security and Privacy
The app relies exclusively on local storage and local processes. There are no servers involved (except a local Docker instance of Tika Server) and local documents never leave your computer.

# Documentation
- [Knowledge Canvas - Background and Inspiration](https://github.com/KnowledgeCanvas/knowledge-canvas/wiki) 
- [Development and Build Instructions](https://github.com/KnowledgeCanvas/knowledge-canvas/wiki/Development)
- [Getting Started](https://github.com/KnowledgeCanvas/knowledge-canvas/wiki/Getting-Started)
- [Debugging](https://github.com/KnowledgeCanvas/knowledge-canvas/wiki/Debugging)

# Screenshots
<img width="1279" alt="image" src="https://user-images.githubusercontent.com/19367848/154830635-0478f5b3-a2b3-47dc-93b4-3280a8e55b3a.png">
<img width="1279" alt="image" src="https://user-images.githubusercontent.com/19367848/154831118-fb55f59b-1dfd-42fa-a2bd-e429016c1a3f.png">
<img width="1279" alt="image" src="https://user-images.githubusercontent.com/19367848/154831016-75a569bd-fd38-4a7c-986e-1782fb0ef16c.png">
<img width="1279" alt="image" src="https://user-images.githubusercontent.com/19367848/154831165-362c1326-c7cb-4145-9eac-3defc28e352e.png">
<img width="1203" alt="image" src="https://user-images.githubusercontent.com/19367848/152474550-9432e28e-2511-4632-a327-15561b1f79cb.png">
<img width="1203" alt="image" src="https://user-images.githubusercontent.com/19367848/152473853-1575bec7-2035-4b62-9783-8328097dcbde.png">
<img width="1203" alt="image" src="https://user-images.githubusercontent.com/19367848/152473925-2e89c095-a24d-491d-a56a-4f3687d21b3b.png">
<img width="1601" alt="image" src="https://user-images.githubusercontent.com/19367848/153652641-3231b658-c933-4904-b0ea-6572fa0806f8.png">
<img width="1203" alt="image" src="https://user-images.githubusercontent.com/19367848/152470617-9bbc04a8-f692-43b9-9627-46951587e41c.png">
<img width="1203" alt="image" src="https://user-images.githubusercontent.com/19367848/152470661-4d096b91-ba75-4f6e-aeea-7b3a57672b2f.png">

# Disclaimer
This software is not a finished product and provides no warranty of any kind. You are welcome to open an issue or a pull request. Contributors are welcome.

As of Feb 2022, there is a good chance that _something_ in the app is not working properly, simply because it has not been fully implemented yet. No extensive testing has been conducted on Windows or Linux. It is very likely that something is broken on one or both of those platforms. Testing and verification on either platform is welcome.
