// Initialize button with user's preferred color
let extractPage = document.getElementById("extractPage");

// chrome.storage.sync.get("color", ({ color }) => {
//     extractPage.style.backgroundColor = color;
// });

// When the button is clicked, inject setPageBackgroundColor into current page
extractPage.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let metas = document.getElementsByTagName('meta');

    for (let meta of metas) {
        console.log('Meta: ', meta);
    }

    console.log('Sending URL to electron...');

    console.log('Tab: ', tab);

    let url = `http://localhost:9000/external?link=${tab.url}&title=${tab.title}&meta=${metas}`;

    await fetch(url, {method: 'POST', body: JSON.stringify(metas)}).then((result) => {
       console.log('Result: ', result);
       window.close();
    });

    // chrome.scripting.executeScript({
    //     target: { tabId: tab.id },
    //     function: setPageBackgroundColor,
    // });
});

// The body of this function will be executed as a content script inside the
// current page
// function setPageBackgroundColor() {
//     chrome.storage.sync.get("color", ({ color }) => {
//         document.body.style.backgroundColor = color;
//     });
// }
