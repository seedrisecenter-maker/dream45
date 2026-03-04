// ═══════════════════════════════════════
// 별을 쏘아라 - Game State Machine
// ═══════════════════════════════════════

var Game = window.Game || {};

Game.State = {
    current: 'title',

    // Game data
    currentLevel: 0,
    score: 0,
    totalScore: 0,
    shotsRemaining: 0,
    comboCount: 0,
    collectedWords: [],
    completedQuotes: [],

    // Entities
    projectile: null,
    targets: [],
    obstacles: [],

    // Effects
    screenShake: { intensity: 0, duration: 0 },
    flashAlpha: 0,
    flashColor: '#FFD97D',
    slowMotion: { active: false, scale: 0.2, duration: 0 },
    floatingTexts: [],

    // Timing
    gameTime: 0,

    transition: function(state) {
        this.current = state;
    },

    setupLevel: function(levelIndex) {
        var level = Game.Config.levels[levelIndex];
        var quote = Game.Config.quotes[levelIndex];

        this.shotsRemaining = level.shots;
        this.comboCount = 0;
        this.score = 0;
        this.collectedWords = [];
        this.projectile = null;
        this.floatingTexts = [];
        this.flashAlpha = 0;

        // Create targets from quote words
        var words = quote.ko.split(/\s+/);
        this.targets = [];
        var w = Game.Render.width;
        var h = Game.Render.height;
        var isMobile = w < 768;
        var baseFontSize = isMobile ? 11 : 14;

        // Grid placement to avoid overlap
        var cols = Math.min(words.length, isMobile ? 3 : 4);
        var rows = Math.ceil(words.length / cols);
        var cellW = (w * 0.7) / cols;
        var cellH = (h * 0.4) / rows;
        var startX = w * 0.15;
        var startY = h * 0.1;

        for (var i = 0; i < words.length; i++) {
            var col = i % cols;
            var row = Math.floor(i / cols);
            var word = words[i];
            var fontSize = Math.max(baseFontSize, Math.min(16, 18 - word.length));
            var radius = Math.max(22, word.length * 7 + 8);
            if (isMobile) radius = Math.max(18, word.length * 5.5 + 6);

            var cx = startX + col * cellW + cellW / 2 + (Math.random() - 0.5) * cellW * 0.3;
            var cy = startY + row * cellH + cellH / 2 + (Math.random() - 0.5) * cellH * 0.3;

            this.targets.push({
                x: cx, y: cy,
                originalX: cx, originalY: cy,
                radius: radius,
                word: word,
                wordIndex: i,
                fontSize: fontSize,
                collected: false,
                bobPhase: Math.random() * Math.PI * 2,
                bobSpeed: 0.5 + Math.random() * 0.5,
                bobAmplitude: 4 + Math.random() * 8,
                moveSpeed: level.moveSpeed || 0,
                glowPhase: Math.random() * Math.PI * 2
            });
        }

        // Create obstacles (convert from fractions to pixels)
        this.obstacles = [];
        if (level.obstacles) {
            for (var j = 0; j < level.obstacles.length; j++) {
                var o = level.obstacles[j];
                this.obstacles.push({
                    x: o.x * w,
                    y: o.y * h,
                    w: o.w * w,
                    h: o.h * h
                });
            }
        }

        // Update HUD
        this.updateQuoteBar(words);
        this.updateShotsDisplay();
        document.getElementById('levelDisplay').textContent =
            'LEVEL ' + (levelIndex + 1) + ' / 10';
        document.getElementById('scoreDisplay').textContent = '0';
    },

    fireProjectile: function(x, y, launch, perfect) {
        this.projectile = {
            x: x, y: y,
            vx: launch.vx, vy: launch.vy,
            radius: Game.Render.width < 768 ? 8 : 12,
            active: true,
            perfect45: perfect,
            hitTargets: []
        };

        this.shotsRemaining--;
        this.comboCount = 0;
        this.transition('flying');
        this.updateShotsDisplay();

        if (perfect) {
            Game.Particles.emit({
                x: x, y: y,
                count: 35, speed: 280, spread: Math.PI,
                colors: ['#FFD97D', '#fff', '#C5B4E3'],
                life: 0.7, size: 6, type: 'star'
            });
            this.flashAlpha = 0.35;
            this.flashColor = '#FFD97D';
            Game.Audio.play('perfect');
        } else {
            Game.Audio.play('launch');
        }
    },

    onTargetHit: function(proj, target, index) {
        target.collected = true;
        proj.hitTargets.push(index);
        this.comboCount++;
        this.collectedWords.push({ word: target.word, index: target.wordIndex });

        // Score
        var mult = Math.pow(Game.Config.scoring.comboMultiplier, this.comboCount - 1);
        var points = Math.round(Game.Config.scoring.hitBase * mult);
        if (proj.perfect45) points += Game.Config.scoring.perfect45Bonus;
        this.score += points;

        // Slow motion
        this.slowMotion = { active: true, scale: 0.2, duration: 0.25 };

        // Screen shake
        var shakeI = 4 + this.comboCount * 4;
        this.screenShake = {
            intensity: Math.min(shakeI, 22),
            duration: 0.15 + this.comboCount * 0.04
        };

        // Particles
        Game.Particles.emit({
            x: target.x, y: target.y,
            count: 18 + this.comboCount * 6,
            speed: 180 + this.comboCount * 30,
            spread: Math.PI,
            colors: ['#FFD97D', '#C5B4E3', '#fff'],
            life: 0.6, size: 5, type: 'star'
        });

        // Floating score text
        this.floatingTexts.push({
            x: target.x, y: target.y,
            text: '+' + points + (this.comboCount > 1 ? ' x' + this.comboCount : ''),
            color: '#FFD97D',
            size: 18 + this.comboCount * 4,
            alpha: 1, vy: -70, life: 1.3
        });

        // Sound
        Game.Audio.play(this.comboCount > 1 ? 'combo' : 'hit');

        // Update HUD
        document.getElementById('scoreDisplay').textContent = this.score;
        this.updateCollectedWord(target.wordIndex);
        this.showCombo();

        // Check level complete
        if (this.isLevelComplete()) {
            this.onLevelComplete();
        }
    },

    isLevelComplete: function() {
        for (var i = 0; i < this.targets.length; i++) {
            if (!this.targets[i].collected) return false;
        }
        return true;
    },

    onShotEnded: function() {
        if (this.isLevelComplete()) return;
        if (this.shotsRemaining <= 0) {
            this.transition('failed');
            Game.Audio.play('fail');
            this.showFailedScreen();
        } else {
            this.transition('aiming');
        }
    },

    onLevelComplete: function() {
        var quote = Game.Config.quotes[this.currentLevel];
        this.completedQuotes.push(quote);

        // Remaining shot bonus
        this.score += this.shotsRemaining * Game.Config.scoring.remainingShotBonus;
        this.totalScore += this.score;

        // Big celebration
        var w = Game.Render.width;
        var h = Game.Render.height;
        for (var b = 0; b < 3; b++) {
            setTimeout(function(bx) {
                Game.Particles.emit({
                    x: w * (0.2 + bx * 0.3), y: h * 0.4,
                    count: 40, speed: 350, spread: Math.PI,
                    colors: ['#FFD97D', '#C5B4E3', '#E8590C', '#2D6A4F', '#fff'],
                    life: 1.2, size: 7, type: 'star'
                });
            }.bind(null, b), b * 200);
        }

        this.screenShake = { intensity: 15, duration: 0.4 };
        this.flashAlpha = 0.5;
        Game.Audio.play('levelComplete');

        var self = this;
        setTimeout(function() {
            self.transition('levelComplete');
            self.showCompleteScreen();
        }, 1200);
    },

    // ── HUD Updates ──

    updateQuoteBar: function(words) {
        var bar = document.getElementById('quoteBar');
        bar.innerHTML = '';
        for (var i = 0; i < words.length; i++) {
            var span = document.createElement('span');
            span.className = 'word';
            span.textContent = words[i];
            span.setAttribute('data-index', i);
            bar.appendChild(span);
        }
    },

    updateCollectedWord: function(index) {
        var bar = document.getElementById('quoteBar');
        var spans = bar.querySelectorAll('.word');
        for (var i = 0; i < spans.length; i++) {
            if (parseInt(spans[i].getAttribute('data-index')) === index) {
                spans[i].classList.add('collected');
            }
        }
    },

    updateShotsDisplay: function() {
        var el = document.getElementById('shotsDisplay');
        var total = Game.Config.levels[this.currentLevel].shots;
        var html = '';
        for (var i = 0; i < total; i++) {
            var used = i >= this.shotsRemaining;
            html += '<div class="shot-dot' + (used ? ' used' : '') + '"></div>';
        }
        el.innerHTML = html;
    },

    showCombo: function() {
        var el = document.getElementById('comboDisplay');
        if (this.comboCount >= 2) {
            el.textContent = this.comboCount + 'x COMBO!';
            el.classList.remove('hidden');
            el.classList.add('show');
            clearTimeout(this._comboTimer);
            this._comboTimer = setTimeout(function() {
                el.classList.remove('show');
            }, 800);
        }
    },

    showCompleteScreen: function() {
        var quote = Game.Config.quotes[this.currentLevel];
        document.getElementById('completedQuote').textContent = '"' + quote.ko + '"';
        document.getElementById('quoteTranslations').innerHTML =
            '<div>' + quote.en + '</div>' +
            '<div>' + quote.zh + '</div>' +
            '<div>' + quote.hi + '</div>' +
            '<div style="margin-top:8px;color:rgba(255,255,255,0.35)">— ' + quote.author + '</div>';
        document.getElementById('levelScore').textContent =
            '레벨 점수: ' + this.score + '  |  총점: ' + this.totalScore;

        var isLast = this.currentLevel >= 9;
        var btn = document.getElementById('nextLevelBtn');
        btn.textContent = isLast ? '최종 결과 보기' : '다음 레벨 →';

        document.getElementById('levelCompleteScreen').classList.remove('hidden');
    },

    showFailedScreen: function() {
        document.getElementById('levelFailedScreen').classList.remove('hidden');
    },

    showGameComplete: function() {
        document.getElementById('finalScore').innerHTML =
            '최종 점수: <span>' + this.totalScore + '</span>';
        document.getElementById('quotesCollected').textContent =
            '명언 ' + this.completedQuotes.length + '개 완성!';
        document.getElementById('gameCompleteScreen').classList.remove('hidden');
    },

    hideAllOverlays: function() {
        var overlays = ['titleScreen', 'levelIntro',
            'levelCompleteScreen', 'levelFailedScreen', 'gameCompleteScreen'];
        for (var i = 0; i < overlays.length; i++) {
            var el = document.getElementById(overlays[i]);
            if (el) el.classList.add('hidden');
        }
    }
};

window.Game = Game;
