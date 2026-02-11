let port = null;
let intervalId = null;
let intervalTime = 1000;
let popupOpen = false;

function connect() {
    port = chrome.runtime.connect({ name: "youtube-timer" });
    port.onDisconnect.addListener(() => {
        port = null;
        stopInterval();
        setTimeout(start, 1000);
    });
}

function postMessage(message) {
    if (!port) return;
    try {
        port.postMessage(message);
    } catch (error) {
        console.error("Failed to post message:", error);
        port = null;
    }
}

function stopInterval() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

function startInterval() {
    stopInterval();

    let lastTabOpenTickTimestamp = 0;
    intervalId = setInterval(() => {
        const currentTime = Date.now();

        if (currentTime - lastTabOpenTickTimestamp >= 1000) {
            lastTabOpenTickTimestamp = currentTime;
            postMessage({
                command: "tick",
                type: "tabOpen",
                increment: 1,
                popupOpen: popupOpen,
            });
        }

        const video = document.querySelector('video');
        if (video && !video.paused) {
            const increment = intervalTime / 1000;
            let type;
            if (document.querySelector('.ad-showing')) {
                type = "adWatch";
            } else if (location.href.includes('/shorts/')) {
                type = "shortsWatch";
            } else {
                type = "videoWatch";
            }
            postMessage({
                command: "tick",
                type: type,
                increment: increment,
                popupOpen: popupOpen,
            });
        }
    }, intervalTime);
}

function start() {
    if (port) return;
    connect();
    startInterval();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === "popup_opened") {
        popupOpen = true;
        intervalTime = 100;
        startInterval();
    } else if (request.command === "popup_closed") {
        popupOpen = false;
        intervalTime = 1000;
        startInterval();
    }
});

start();
