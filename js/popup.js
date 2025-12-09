document.addEventListener('DOMContentLoaded', () => {
    const displays = {
        tabOpenTime: document.getElementById('tabOpenTime'),
        videoWatchTime: document.getElementById('videoWatchTime'),
        shortsWatchTime: document.getElementById('shortsWatchTime'),
        adWatchTime: document.getElementById('adWatchTime'),
        installDate: document.getElementById('installDate')
    };

    const formatIntegerTime = (totalSeconds) => {
        totalSeconds = Math.floor(totalSeconds);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        let parts = [];
        if (hours > 0) parts.push(`${hours}時間`);
        if (minutes > 0 || hours > 0) parts.push(`${minutes}分`);
        parts.push(`${seconds}秒`);
        return parts.join('');
    };

    const formatDecimalTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = (totalSeconds % 60).toFixed(1);
        let parts = [];
        if (hours > 0) parts.push(`${hours}時間`);
        if (minutes > 0 || hours > 0) parts.push(`${minutes}分`);
        parts.push(`${seconds}秒`);
        return parts.join('');
    };

    const updateDisplay = () => {
        const keys = ['installDate', 'tabOpenTime', 'videoWatchTime', 'shortsWatchTime', 'adWatchTime'];
        chrome.storage.local.get(keys, (result) => {
            displays.tabOpenTime.textContent = formatIntegerTime(result.tabOpenTime || 0);
            displays.videoWatchTime.textContent = formatDecimalTime(result.videoWatchTime || 0);
            displays.shortsWatchTime.textContent = formatDecimalTime(result.shortsWatchTime || 0);
            displays.adWatchTime.textContent = formatDecimalTime(result.adWatchTime || 0);

            if (result.installDate) {
                const date = new Date(result.installDate);
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                displays.installDate.textContent = `${year}年${month}月${day}日${hours}時${minutes}分`;
            }
        });
    };

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local') {
            updateDisplay();
        }
    });

    updateDisplay();
});