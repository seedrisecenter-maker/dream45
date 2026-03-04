// ═══════════════════════════════════════
// 별을 쏘아라 - Main Game Loop
// ═══════════════════════════════════════

var Game = window.Game || {};

Game.Main = {
    lastTime: 0,
    running: false,
    gameTime: 0,

    init: function() {
        var self = this;
        // JSON에서 명언 로드 후 게임 초기화
        Game.Config.loadQuotes().then(function () {
            Game.Render.init();
            Game.Particles.init();
            Game.Audio.init();
            Game.Input.init();

            self.wireButtons();
            self.running = true;
            self.lastTime = performance.now();
            requestAnimationFrame(self.loop.bind(self));
        });
    },

    wireButtons: function() {
        var self = this;

        // Help bar close
        document.getElementById('helpClose').addEventListener('click', function() {
            document.getElementById('helpBar').classList.add('hidden');
        });

        // Play button - 타이틀에 사용법이 있으므로 튜토리얼 스킵, 바로 게임 시작
        document.getElementById('playBtn').addEventListener('click', function() {
            Game.Audio.unlock();
            Game.Audio.play('click');
            Game.State.currentLevel = 0;
            Game.State.totalScore = 0;
            Game.State.completedQuotes = [];
            document.getElementById('titleScreen').classList.add('hidden');
            document.getElementById('helpBar').classList.remove('hidden');
            self.startLevelIntro();
        });

        // Next level
        document.getElementById('nextLevelBtn').addEventListener('click', function() {
            Game.Audio.play('click');
            document.getElementById('levelCompleteScreen').classList.add('hidden');
            Game.State.currentLevel++;
            if (Game.State.currentLevel >= 10) {
                Game.State.transition('gameComplete');
                Game.State.showGameComplete();
            } else {
                self.startLevelIntro();
            }
        });

        // Retry
        document.getElementById('retryBtn').addEventListener('click', function() {
            Game.Audio.play('click');
            document.getElementById('levelFailedScreen').classList.add('hidden');
            self.startLevelIntro();
        });

        // Retry → menu
        document.getElementById('retryMenuBtn').addEventListener('click', function() {
            Game.Audio.play('click');
            Game.State.hideAllOverlays();
            Game.State.transition('title');
            document.getElementById('titleScreen').classList.remove('hidden');
        });

        // Replay
        document.getElementById('replayBtn').addEventListener('click', function() {
            Game.Audio.play('click');
            document.getElementById('gameCompleteScreen').classList.add('hidden');
            Game.State.currentLevel = 0;
            Game.State.totalScore = 0;
            Game.State.completedQuotes = [];
            self.startLevelIntro();
        });

        // Share
        document.getElementById('shareBtn').addEventListener('click', function() {
            var text = '별을 쏘아라 🌟\n' +
                '점수: ' + Game.State.totalScore + '점\n' +
                '명언 ' + Game.State.completedQuotes.length + '개 완성!\n' +
                '— 꿈 꾸는 45°';
            if (navigator.share) {
                navigator.share({ title: '별을 쏘아라', text: text });
            } else if (navigator.clipboard) {
                navigator.clipboard.writeText(text);
                alert('결과가 클립보드에 복사되었습니다!');
            }
        });

        // Sound toggle
        document.getElementById('soundToggle').addEventListener('click', function() {
            var on = Game.Audio.toggle();
            this.textContent = on ? '🔊' : '🔇';
        });
    },

    startLevelIntro: function() {
        var quote = Game.Config.quotes[Game.State.currentLevel];
        document.getElementById('levelNum').textContent = 'LEVEL ' + (Game.State.currentLevel + 1);
        document.getElementById('levelTheme').textContent = quote.themeLabel;
        document.getElementById('levelAuthor').textContent = '— ' + quote.author;
        document.getElementById('levelIntro').classList.remove('hidden');

        Game.State.transition('levelIntro');
        Game.Particles.clear();

        var self = this;
        setTimeout(function() {
            document.getElementById('levelIntro').classList.add('hidden');
            Game.State.setupLevel(Game.State.currentLevel);
            Game.State.transition('aiming');
        }, 1800);
    },

    // ── Game Loop ──

    loop: function(timestamp) {
        if (!this.running) return;

        var rawDt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        if (rawDt > 0.1) rawDt = 0.016;

        this.gameTime += rawDt;

        var dt = rawDt;
        if (Game.State.slowMotion.active) {
            Game.State.slowMotion.duration -= rawDt;
            if (Game.State.slowMotion.duration <= 0) {
                Game.State.slowMotion.active = false;
            } else {
                dt = rawDt * Game.State.slowMotion.scale;
            }
        }

        this.update(dt, rawDt);
        this.render();

        requestAnimationFrame(this.loop.bind(this));
    },

    update: function(dt, rawDt) {
        var state = Game.State;

        // Always update particles & effects
        Game.Particles.update(dt);
        Game.Render.updateShake(rawDt);

        // Flash decay
        if (state.flashAlpha > 0) {
            state.flashAlpha -= rawDt * 2.5;
            if (state.flashAlpha < 0) state.flashAlpha = 0;
        }

        // Floating texts
        for (var i = state.floatingTexts.length - 1; i >= 0; i--) {
            var ft = state.floatingTexts[i];
            ft.y += ft.vy * dt;
            ft.life -= dt;
            ft.alpha = Math.max(0, ft.life / 1.3);
            if (ft.life <= 0) state.floatingTexts.splice(i, 1);
        }

        // State-specific updates
        if (state.current === 'flying') {
            this.updateProjectile(dt);
        }

        if (state.current === 'aiming' || state.current === 'flying') {
            this.updateTargets(dt);
        }
    },

    updateProjectile: function(dt) {
        var proj = Game.State.projectile;
        if (!proj || !proj.active) return;

        // Physics
        proj.x += proj.vx * dt;
        proj.vy += Game.Physics.GRAVITY * dt;
        proj.y += proj.vy * dt;

        // Trail
        Game.Particles.emit({
            x: proj.x, y: proj.y,
            count: 1, speed: 20, spread: Math.PI,
            color: proj.perfect45 ? '#FFD97D' : '#C5B4E3',
            life: 0.35, size: proj.radius * 0.5,
            gravity: 0
        });

        // Collision with targets
        var targets = Game.State.targets;
        for (var i = 0; i < targets.length; i++) {
            var t = targets[i];
            if (t.collected) continue;
            if (proj.hitTargets.indexOf(i) !== -1) continue;

            if (Game.Physics.circleCollision(proj.x, proj.y, proj.radius,
                t.x, t.y, t.radius)) {
                Game.State.onTargetHit(proj, t, i);
            }
        }

        // Collision with obstacles
        var obs = Game.State.obstacles;
        for (var j = 0; j < obs.length; j++) {
            var o = obs[j];
            if (proj.x + proj.radius > o.x && proj.x - proj.radius < o.x + o.w &&
                proj.y + proj.radius > o.y && proj.y - proj.radius < o.y + o.h) {
                proj.vx *= 0.65;
                proj.vy *= 0.65;
            }
        }

        // Off-screen
        var R = Game.Render;
        if (proj.y > R.height + 60 || proj.x < -100 || proj.x > R.width + 100) {
            proj.active = false;
            Game.State.onShotEnded();
        }
    },

    updateTargets: function(dt) {
        var targets = Game.State.targets;
        for (var i = 0; i < targets.length; i++) {
            var t = targets[i];
            if (t.collected) continue;

            t.bobPhase += t.bobSpeed * dt;
            var bob = Math.sin(t.bobPhase) * t.bobAmplitude;

            if (t.moveSpeed > 0) {
                t.x = t.originalX + Math.sin(t.bobPhase * 0.3 + i) * t.moveSpeed * 2;
                t.y = t.originalY + bob + Math.cos(t.bobPhase * 0.2 + i * 0.5) * t.moveSpeed;
            } else {
                t.y = t.originalY + bob;
            }

            t.glowPhase += dt * 2;
        }
    },

    // ── Render ──

    render: function() {
        var R = Game.Render;
        var state = Game.State;

        R.beginFrame();
        R.drawTwinklingStars(this.gameTime);

        if (state.current === 'aiming' || state.current === 'flying' ||
            state.current === 'levelComplete' || state.current === 'failed') {

            // Draw obstacles
            for (var o = 0; o < state.obstacles.length; o++) {
                R.drawObstacle(state.obstacles[o]);
            }

            // Draw targets
            for (var i = 0; i < state.targets.length; i++) {
                R.drawTarget(state.targets[i], this.gameTime);
            }

            // Draw launch pad
            R.drawLaunchPad(Game.Input.launchX, Game.Input.launchY);

            // Draw aiming preview
            if (state.current === 'aiming' && Game.Input.isDragging) {
                var aim = Game.Input.getAimData();
                if (aim) {
                    R.drawAimLine(aim.fromX, aim.fromY, aim.toX, aim.toY, aim.perfect);
                    R.drawAngleArc(aim.fromX, aim.fromY, aim.angle, aim.perfect);
                    var preview = Game.Physics.getTrajectoryPreview(
                        aim.fromX, aim.fromY, aim.vx, aim.vy, 60);
                    R.drawTrajectory(preview, aim.perfect);
                }
            }

            // Draw projectile
            if (state.projectile && state.projectile.active) {
                R.drawProjectile(
                    state.projectile.x, state.projectile.y,
                    state.projectile.radius, state.projectile.perfect45,
                    this.gameTime
                );
            }
        }

        // Particles (always)
        Game.Particles.draw(R.ctx);

        // Floating texts
        R.drawFloatingTexts(state.floatingTexts);

        // Flash overlay
        if (state.flashAlpha > 0) {
            R.drawFlash(state.flashAlpha, state.flashColor);
        }

        R.endFrame();
    }
};

// ── Boot ──
document.addEventListener('DOMContentLoaded', function() {
    // Wait for fonts
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function() {
            Game.Main.init();
        });
    } else {
        setTimeout(function() {
            Game.Main.init();
        }, 500);
    }
});

window.Game = Game;
