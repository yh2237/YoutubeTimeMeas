chrome.runtime.connect({ name: "popup" });
document.addEventListener('DOMContentLoaded', () => {
    const displays = {
        tabOpenTime: document.getElementById('tabOpenTime'),
        videoWatchTime: document.getElementById('videoWatchTime'),
        shortsWatchTime: document.getElementById('shortsWatchTime'),
        adWatchTime: document.getElementById('adWatchTime'),
        installDate: document.getElementById('installDate'),
        comparisonMsg: document.getElementById('comparisonMsg'),
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
        totalSeconds = Math.round(totalSeconds * 10) / 10;
        const hours = Math.floor(totalSeconds / 3600);
        const remaining = totalSeconds - hours * 3600;
        const minutes = Math.floor(remaining / 60);
        const seconds = (remaining - minutes * 60).toFixed(1);
        let parts = [];
        if (hours > 0) parts.push(`${hours}時間`);
        if (minutes > 0 || hours > 0) parts.push(`${minutes}分`);
        parts.push(`${seconds}秒`);
        return parts.join('');
    };

    // もっと面白いメッセージ書きたい
    const comparisonMessages = [
        { unitSeconds: 180, template: (n) => `カップラーメンを${n.toLocaleString()}個作れました。` },
        { unitSeconds: 420, template: (n) => `オムレツを${n.toLocaleString()}個焼けました。あなたの脳は半熟のままです` },
        { unitSeconds: 480, template: (n) => `ホットケーキを${n.toLocaleString()}枚焼けました。積み上げたら何cmになるんですかね？` },
        { unitSeconds: 5400, template: (n) => `カレーを${n.toLocaleString()}回作れました、スパイスからね。` },
        { unitSeconds: 420, template: (n) => `食パンにバターを塗って食べる朝食を${n.toLocaleString()}回とれました。ちゃんと朝食取れてますか？` },
        { unitSeconds: 360, template: (n) => `ゆで卵を${n.toLocaleString()}個作れました。あなたの目も茹で上がっていませんか？` },
        { unitSeconds: 200, template: (n) => `ラジオ体操を${n.toLocaleString()}回できました。肩こりは大丈夫ですか？` },
        { unitSeconds: 600, template: (n) => `腕立て伏せ100回を${n.toLocaleString()}セットこなせました。動いたのは指だけですが...` },
        { unitSeconds: 500, template: (n) => `${n.toLocaleString()}kmジョギングできました。走ったのはシークバーだけです（` },
        { unitSeconds: 60, template: (n) => `スクワットを${n.toLocaleString()}セットできました。大丈夫？椅子から立てますか？` },
        { unitSeconds: 5, template: (n) => `腹筋を${n.toLocaleString()}回できました。多分割れるのは腹筋じゃなくて画面の方が先です` },
        { unitSeconds: 300, template: (n) => `ストレッチを${n.toLocaleString()}回できました。体、凝ってませんか？` },
        { unitSeconds: 18000, template: (n) => `フルマラソンを${n.toLocaleString()}回完走できました。あなたが完走したのはおすすめ欄です` },
        { unitSeconds: 120, template: (n) => `英単語を${n.toLocaleString()}個覚えられました。` },
        { unitSeconds: 1800, template: (n) => `本を${n.toLocaleString()}章読めました。でもあなたが読んだのはコメント欄だけです` },
        { unitSeconds: 5400, template: (n) => `資格の過去問を${n.toLocaleString()}回分解けました。取得した資格: YouTube視聴検定（非公式）` },
        { unitSeconds: 3600, template: (n) => `プログラミングの練習問題を${n.toLocaleString()}問解けました。簡単なCUIツールくらいなら作れたかもですよ？` },
        { unitSeconds: 1200, template: (n) => `漢字を${n.toLocaleString()}個練習できました。漢字、紙に書けます？変換に頼りっぱなしじゃダメですよ` },
        { unitSeconds: 36000, template: (n) => `TOEICの勉強を${n.toLocaleString()}回分できました。${(n * 100).toLocaleString()}点くらいは上がっていたはずです` },
        { unitSeconds: 360, template: (n) => `歯磨きを${n.toLocaleString()}回できました。虫歯は大丈夫ですか？` },
        { unitSeconds: 600, template: (n) => `皿洗いを${n.toLocaleString()}回できました。シンクにお皿はたまってませんか？` },
        { unitSeconds: 1200, template: (n) => `洗濯を${n.toLocaleString()}回できました。洗濯物、干しっぱなしじゃないですか？` },
        { unitSeconds: 1800, template: (n) => `掃除機を${n.toLocaleString()}回かけれました。足元のホコリ...見えてないふりしてますね？` },
        { unitSeconds: 3600, template: (n) => `部屋の大掃除を${n.toLocaleString()}回できました。部屋汚くないですか？` },
        { unitSeconds: 900, template: (n) => `お風呂に${n.toLocaleString()}回入れました。最後にお風呂入ったのはいつですか？` },
        { unitSeconds: 28800, template: (n) => `${n.toLocaleString()}日分ぐっすり眠れました。寝不足じゃないですか？` },
        { unitSeconds: 180, template: (n) => `ウルトラマンなら${n.toLocaleString()}回戦えました。でもあなたが戦っているのは睡魔です` },
        { unitSeconds: 7200, template: (n) => `映画を${n.toLocaleString()}本観られました。映画の無断転載ショートを観てた可能性は考えないことにします...` },
        { unitSeconds: 3, template: (n) => `まばたきを${n.toLocaleString()}回できました。ドライアイになってませんか？` },
        { unitSeconds: 160000, template: (n) => `飛行機で地球を${n.toLocaleString()}周できました。あなたの冒険はおすすめ欄の中だけです` },
        { unitSeconds: 1, template: (n) => `心臓が${n.toLocaleString()}回鼓動しました。そしてその全てをYouTubeに捧げました` },
        { unitSeconds: 15, template: (n) => `深呼吸を${n.toLocaleString()}回できました。画面から離れて一度深呼吸してみませんか？` },
        { unitSeconds: 60, template: (n) => `1分間の黙祷を${n.toLocaleString()}回できました。失われた時間に黙祷...` },
        { unitSeconds: 600, template: (n) => `10分間の動画を${n.toLocaleString()}回視聴できます（` },
        { unitSeconds: 3600, template: (n) => `時給1000円のバイトなら${(n * 1000).toLocaleString()}円稼げました。あなたが稼いだのはGoogle社の広告収入ですね` },
        { unitSeconds: 10800, template: (n) => `副業で記事を${n.toLocaleString()}本書けました。` },
        { unitSeconds: 7200, template: (n) => `献血に${n.toLocaleString()}回行って命を救えました。` },
        { unitSeconds: 1800, template: (n) => `昼寝を${n.toLocaleString()}回できました。そっちの方が全然健康的です` },
        { unitSeconds: 300, template: (n) => `${n.toLocaleString()}回手を洗えました。たまにはキーボードとマウスも洗いましょう` },
        { unitSeconds: 86400, template: (n) => `${n.toLocaleString()}日分の人生をYouTubeに捧げました。きっと明日も捧げるんでしょう？` },
        { unitSeconds: 31536000, decimal: true, template: (n) => `${n}年分の歳月をスキップできました。タイムマシンがなくてもYouTubeがあれば人生あっという間ですね` },
    ];

    const getComparisonMessage = (totalWatchSeconds) => {
        const eligible = comparisonMessages.filter((m) => {
            if (m.decimal) {
                return totalWatchSeconds / m.unitSeconds >= 0.00001;
            }
            return Math.floor(totalWatchSeconds / m.unitSeconds) >= 1;
        });
        if (eligible.length === 0) return null;
        const pick = eligible[Math.floor(Math.random() * eligible.length)];
        let count;
        if (pick.decimal) {
            const raw = totalWatchSeconds / pick.unitSeconds;
            count = parseFloat(raw.toFixed(5));
        } else {
            count = Math.floor(totalWatchSeconds / pick.unitSeconds);
        }
        const totalFloor = Math.floor(totalWatchSeconds);
        const hours = Math.floor(totalFloor / 3600);
        const timeStr = hours >= 1 ? `${hours}時間` : `${Math.floor(totalFloor / 60)}分`;
        return `${timeStr}あれば${pick.template(count)}`;
    };

    let comparisonMessageSet = false;

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

            if (!comparisonMessageSet) {
                comparisonMessageSet = true;
                const totalWatch = (result.videoWatchTime || 0)
                    + (result.shortsWatchTime || 0)
                    + (result.adWatchTime || 0);
                const msg = getComparisonMessage(totalWatch);
                if (msg) {
                    displays.comparisonMsg.textContent = msg;
                    displays.comparisonMsg.style.display = 'block';
                } else {
                    displays.comparisonMsg.style.display = 'none';
                }
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
