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
