let port = null;
let mainIntervalId = null;

function connect() {
    port = chrome.runtime.connect({ name: "youtube-timer" });
    port.onDisconnect.addListener(() => {
        port = null;
        if (mainIntervalId) {
            clearInterval(mainIntervalId);
            mainIntervalId = null;
        }
        setTimeout(start, 1000);
    });
}

function postMessage(message) {
    if (!port) return;
    try {
        port.postMessage(message);
    } catch (error) {
        port = null;
    }
}

function start() {
    if (port && mainIntervalId) return;

    connect();

    let lastTabOpenTickTimestamp = 0;
    mainIntervalId = setInterval(() => {
        const currentTime = Date.now();

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
    }, 100);
}

start();