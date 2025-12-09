let port = chrome.runtime.connect({ name: "youtube-timer" });
let portDisconnected = false;

port.onDisconnect.addListener(() => {
    portDisconnected = true;
    if (mainIntervalId) {
        clearInterval(mainIntervalId);
    }
});

let tickCounter = 0;
const mainIntervalId = setInterval(() => {
    if (portDisconnected) {
        return;
    }

    try {
        tickCounter++;
        if (tickCounter >= 10) {
            port.postMessage({ command: "tick", type: "tabOpen" });
            tickCounter = 0;
        }

        const video = document.querySelector('video');
        if (video && !video.paused) {
            if (document.querySelector('.ad-showing')) {
                port.postMessage({ command: "tick", type: "adWatch" });
            } else if (location.href.includes('/shorts/')) {
                port.postMessage({ command: "tick", type: "shortsWatch" });
            } else {
                port.postMessage({ command: "tick", type: "videoWatch" });
            }
        }
    } catch (error) {
        portDisconnected = true;
        clearInterval(mainIntervalId);
    }
}, 100);
