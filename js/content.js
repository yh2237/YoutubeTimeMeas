let port = null;
let intervalId = null;
let intervalTime = 1000;

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

        // tabOpenのティックは常に1秒間隔で評価
        if (currentTime - lastTabOpenTickTimestamp >= 1000) {
            lastTabOpenTickTimestamp = currentTime;
            postMessage({ command: "tick", type: "tabOpen" });
        }

        const video = document.querySelector('video');
        if (video && !video.paused) {
            if (document.querySelector('.ad-showing')) {
                postMessage({ command: "tick", type: "adWatch" });
            } else if (location.href.includes('/shorts/')) {
                postMessage({ command: "tick", type: "shortsWatch" });
            } else {
                postMessage({ command: "tick", type: "videoWatch" });
            }
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
        intervalTime = 100;
        startInterval();
    } else if (request.command === "popup_closed") {
        intervalTime = 1000;
        startInterval();
    }
});

start();