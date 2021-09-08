let extractPage = document.getElementById("extractPage");

extractPage.addEventListener("click", async () => {
    let [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    let url = `http://localhost:9000/external?link=${tab.url}&title=${tab.title}`;
    fetch(url).then((result) => {
       window.close();
    });
});
