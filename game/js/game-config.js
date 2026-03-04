// ═══════════════════════════════════════
// 별을 쏘아라 - Configuration & Data
// ═══════════════════════════════════════

var Game = window.Game || {};

Game.Config = {
    colors: {
        nightBg1: '#0D1B2A',
        nightBg2: '#1B1464',
        nightBg3: '#1a1a4e',
        golden: '#FFD97D',
        purple: '#C5B4E3',
        orange: '#E8590C',
        green: '#2D6A4F',
        red: '#9B2226',
        ivory: '#F8F4E8',
        salmon: '#F4A261'
    },

    // 명언 데이터는 JSON에서 로드 (game-main.js에서 초기화)
    quotes: [],

    // JSON에서 명언 로드
    loadQuotes: function () {
        return fetch('../data/quotes.json')
            .then(function (res) { return res.json(); })
            .then(function (data) {
                // 게임용: 랜덤 10개 선택 (매번 플레이할 때마다 다른 명언)
                var shuffled = data.slice().sort(function () { return Math.random() - 0.5; });
                Game.Config.quotes = shuffled.slice(0, 10).map(function (q, i) {
                    return {
                        id: i + 1,
                        theme: q.theme,
                        themeLabel: q.themeLabel,
                        ko: q.ko.replace(/[.,!?。！？]/g, ''),
                        en: q.en,
                        zh: q.zh,
                        hi: q.hi,
                        author: q.author.split('(')[0].trim()
                    };
                });
                return Game.Config.quotes;
            })
            .catch(function () {
                // fallback
                Game.Config.quotes = [{
                    id: 1, theme: 'dream', themeLabel: '꿈의 시작',
                    ko: '모든 위대한 꿈은 꿈꾸는 자로부터 시작된다',
                    en: 'Every great dream begins with a dreamer.',
                    zh: '每一个伟大的梦想，都始于一个敢于做梦的人。',
                    hi: 'हर महान सपने की शुरुआत एक सपने देखने वाले से होती है।',
                    author: '해리엇 터브먼'
                }];
                return Game.Config.quotes;
            });
    },

    levels: [
        { shots: 8, moveSpeed: 0, obstacles: [] },
        { shots: 8, moveSpeed: 0, obstacles: [] },
        { shots: 7, moveSpeed: 0, obstacles: [] },
        { shots: 7, moveSpeed: 18, obstacles: [] },
        { shots: 7, moveSpeed: 22, obstacles: [] },
        { shots: 6, moveSpeed: 28, obstacles: [] },
        {
            shots: 6, moveSpeed: 32,
            obstacles: [
                { x: 0.25, y: 0.32, w: 0.18, h: 0.06 },
                { x: 0.6, y: 0.22, w: 0.14, h: 0.05 }
            ]
        },
        {
            shots: 6, moveSpeed: 36,
            obstacles: [
                { x: 0.18, y: 0.28, w: 0.2, h: 0.06 },
                { x: 0.5, y: 0.18, w: 0.16, h: 0.05 },
                { x: 0.7, y: 0.38, w: 0.12, h: 0.05 }
            ]
        },
        {
            shots: 5, moveSpeed: 40,
            obstacles: [
                { x: 0.15, y: 0.3, w: 0.22, h: 0.06 },
                { x: 0.55, y: 0.2, w: 0.15, h: 0.05 }
            ]
        },
        {
            shots: 6, moveSpeed: 50,
            obstacles: [
                { x: 0.3, y: 0.28, w: 0.25, h: 0.07 }
            ],
            isBoss: true
        }
    ],

    scoring: {
        hitBase: 100,
        perfect45Bonus: 200,
        comboMultiplier: 1.5,
        remainingShotBonus: 150,
        speedBonus: 50
    }
};

window.Game = Game;
