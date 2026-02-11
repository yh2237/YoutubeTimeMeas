let counters = {
    tabOpenTime: 0,
    videoWatchTime: 0,
    shortsWatchTime: 0,
    adWatchTime: 0,
};
let countersLoaded = false;
let flushTimerId = null;

const FLUSH_INTERVAL = 5000;

function loadCounters() {
    return new Promise((resolve) => {
        chrome.storage.local.get(Object.keys(counters), (result) => {
            for (const key of Object.keys(counters)) {
                counters[key] = result[key] || 0;
            }
            countersLoaded = true;
            resolve();
        });
    });
}

function flushCounters() {
    if (!countersLoaded) return;
    chrome.storage.local.set({ ...counters });
}

function startFlushTimer() {
    if (flushTimerId) return;
    flushTimerId = setInterval(flushCounters, FLUSH_INTERVAL);
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get('installDate', (result) => {
        if (!result.installDate) {
            chrome.storage.local.set({
                installDate: new Date().toISOString(),
                tabOpenTime: 0,
                videoWatchTime: 0,
                shortsWatchTime: 0,
                adWatchTime: 0,
            });
        }
    });
});

chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "popup") {
        const sendMessageToActiveTab = (message) => {
            chrome.tabs.query({ active: true, url: "*://*.youtube.com/*" }, (tabs) => {
                if (tabs.length > 0) {
                    chrome.tabs.sendMessage(tabs[0].id, message, () => {
                        if (chrome.runtime.lastError) {
                        }
                    });
                }
            });
        };

        sendMessageToActiveTab({ command: "popup_opened" });

        port.onDisconnect.addListener(() => {
            sendMessageToActiveTab({ command: "popup_closed" });
            flushCounters();
        });
        return;
    }

    if (port.name !== "youtube-timer") return;

    if (!countersLoaded) {
        loadCounters().then(() => startFlushTimer());
    } else {
        startFlushTimer();
    }

    port.onMessage.addListener((request) => {
        if (request.command !== "tick") return;

        const increment = request.increment;
        if (typeof increment !== 'number' || increment <= 0) return;

        if (request.type === 'tabOpen') {
            counters.tabOpenTime += increment;
        } else {
            const timeKey = request.type + 'Time';
            if (timeKey in counters) {
                counters[timeKey] += increment;
            }
        }

        if (request.popupOpen) {
            flushCounters();
        }
    });

    port.onDisconnect.addListener(() => {
        flushCounters();
    });
});
