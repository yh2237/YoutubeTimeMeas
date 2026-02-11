let port = null;
let intervalId = null;
let intervalTime = 1000;
let popupOpen = false;

function isContextValid() {
    try {
        return !!chrome.runtime?.id;
    } catch {
        return false;
    }
}

function connect() {
    if (!isContextValid()) {
        stopInterval();
        return;
    }
    try {
        port = chrome.runtime.connect({ name: "youtube-timer" });
    } catch (error) {
        port = null;
        stopInterval();
        return;
    }
    port.onDisconnect.addListener(() => {
        port = null;
        stopInterval();
        if (!isContextValid()) return;
        setTimeout(start, 1000);
    });
}

function postMessage(message) {
    if (!port) return;
    try {
        port.postMessage(message);
    } catch (error) {
        port = null;
        if (!isContextValid()) {
            stopInterval();
        }
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
    if (!isContextValid()) return;

    let lastTabOpenTickTimestamp = 0;
    intervalId = setInterval(() => {
        if (!isContextValid()) {
            stopInterval();
            return;
        }

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
    if (!isContextValid()) return;
    if (port) return;
    connect();
    startInterval();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!isContextValid()) return;
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
