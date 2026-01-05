let lastTabOpenTimestamp = 0;

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
                        // エラーをキャッチするが、何もしない
                        if (chrome.runtime.lastError) {
                            // console.log("Could not send message to tab:", chrome.runtime.lastError.message);
                        }
                    });
                }
            });
        };

        sendMessageToActiveTab({ command: "popup_opened" });

        port.onDisconnect.addListener(() => {
            sendMessageToActiveTab({ command: "popup_closed" });
        });
        return;
    }

    port.onMessage.addListener((request) => {
        if (request.command === "tick") {
            const currentTime = Date.now();

            if (request.type === 'tabOpen') {
                if (currentTime - lastTabOpenTimestamp >= 1000) {
                    lastTabOpenTimestamp = currentTime;
                    chrome.storage.local.get(['tabOpenTime'], (result) => {
                        let newTotal = (result.tabOpenTime || 0) + 1;
                        chrome.storage.local.set({ tabOpenTime: newTotal });
                    });
                }
            } else {
                const timeKey = request.type + 'Time';
                const increment = 0.1;
                chrome.storage.local.get([timeKey], (result) => {
                    let newTotal = (result[timeKey] || 0) + increment;
                    chrome.storage.local.set({ [timeKey]: newTotal });
                });
            }
        }
    });
});
