// ═══════════════════════════════════════
// 별을 쏘아라 - Canvas Rendering
// ═══════════════════════════════════════

var Game = window.Game || {};

Game.Render = {
    canvas: null,
    ctx: null,
    bgCanvas: null,
    bgCtx: null,
    width: 0,
    height: 0,
    dpr: 1,
    bgStars: [],
    shake: { x: 0, y: 0 },

    init: function() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.bgCanvas = document.createElement('canvas');
        this.bgCtx = this.bgCanvas.getContext('2d');
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.resize();
        window.addEventListener('resize', this.resize.bind(this));
    },

    resize: function() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        this.bgCanvas.width = this.width * this.dpr;
        this.bgCanvas.height = this.height * this.dpr;
        this.bgCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        this.generateBgStars();
        this.drawBackground();
    },

    generateBgStars: function() {
        this.bgStars = [];
        var count = Math.floor(this.width * this.height / 5000);
        if (count > 150) count = 150;
        for (var i = 0; i < count; i++) {
            this.bgStars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height * 0.85,
                size: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.6 + 0.2,
                twinkleSpeed: Math.random() * 2 + 1,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
    },

    drawBackground: function() {
        var ctx = this.bgCtx;
        var w = this.width;
        var h = this.height;

        var grad = ctx.createLinearGradient(0, 0, w * 0.4, h);
        grad.addColorStop(0, '#0D1B2A');
        grad.addColorStop(0.4, '#1B1464');
        grad.addColorStop(0.75, '#1a1a4e');
        grad.addColorStop(1, '#0D1B2A');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Static stars
        for (var i = 0; i < this.bgStars.length; i++) {
            var s = this.bgStars[i];
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,217,125,' + s.alpha + ')';
            ctx.fill();
        }

        // Moon crescent
        var mx = w * 0.85;
        var my = h * 0.1;
        ctx.beginPath();
        ctx.arc(mx, my, 25, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,217,125,0.85)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(mx + 7, my - 4, 23, 0, Math.PI * 2);
        ctx.fillStyle = '#0f1a3a';
        ctx.fill();

        // Ground area (subtle)
        var gGrad = ctx.createLinearGradient(0, h * 0.85, 0, h);
        gGrad.addColorStop(0, 'rgba(13,27,42,0)');
        gGrad.addColorStop(1, 'rgba(27,20,100,0.3)');
        ctx.fillStyle = gGrad;
        ctx.fillRect(0, h * 0.85, w, h * 0.15);
    },

    // ── Frame rendering ──

    beginFrame: function() {
        var ctx = this.ctx;
        ctx.save();
        ctx.translate(this.shake.x, this.shake.y);

        // Draw cached background
        ctx.drawImage(this.bgCanvas, 0, 0, this.width, this.height);
    },

    endFrame: function() {
        this.ctx.restore();
    },

    drawTwinklingStars: function(time) {
        var ctx = this.ctx;
        for (var i = 0; i < this.bgStars.length; i++) {
            var s = this.bgStars[i];
            var flicker = Math.sin(time * s.twinkleSpeed + s.twinklePhase);
            if (flicker > 0.7) {
                var a = (flicker - 0.7) / 0.3 * 0.5;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size * 2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,217,125,' + a + ')';
                ctx.fill();
            }
        }
    },

    drawLaunchPad: function(x, y) {
        var ctx = this.ctx;
        // Circular glow
        var grad = ctx.createRadialGradient(x, y, 5, x, y, 40);
        grad.addColorStop(0, 'rgba(255,217,125,0.3)');
        grad.addColorStop(1, 'rgba(255,217,125,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI * 2);
        ctx.fill();

        // Center dot
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,217,125,0.6)';
        ctx.fill();
    },

    drawAimLine: function(fromX, fromY, toX, toY, isPerfect) {
        var ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.strokeStyle = isPerfect
            ? 'rgba(255,217,125,0.7)'
            : 'rgba(255,255,255,0.25)';
        ctx.lineWidth = isPerfect ? 2.5 : 1.5;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
    },

    drawTrajectory: function(points, isPerfect) {
        var ctx = this.ctx;
        var color = isPerfect ? 'rgba(255,217,125,' : 'rgba(197,180,227,';
        for (var i = 0; i < points.length; i++) {
            var alpha = (1 - i / points.length) * 0.6;
            ctx.beginPath();
            ctx.arc(points[i].x, points[i].y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = color + alpha + ')';
            ctx.fill();
        }
    },

    drawAngleArc: function(x, y, angle, isPerfect) {
        var ctx = this.ctx;
        var radius = 50;
        // 45-degree zone highlight
        ctx.beginPath();
        ctx.arc(x, y, radius, -Math.PI / 4 - 0.09, -Math.PI / 4 + 0.09);
        ctx.strokeStyle = 'rgba(255,217,125,0.4)';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Current angle arc
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, -angle, true);
        ctx.strokeStyle = isPerfect ? '#FFD97D' : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
    },

    drawProjectile: function(x, y, radius, isPerfect, time) {
        var ctx = this.ctx;
        var glow = Math.sin(time * 8) * 0.15 + 0.85;

        // Outer glow
        var grad = ctx.createRadialGradient(x, y, radius * 0.3, x, y, radius * 3);
        grad.addColorStop(0, isPerfect
            ? 'rgba(255,217,125,' + (0.5 * glow) + ')'
            : 'rgba(197,180,227,' + (0.4 * glow) + ')');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isPerfect ? '#FFD97D' : '#C5B4E3';
        ctx.fill();

        // Shine
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fill();
    },

    drawTarget: function(target, time) {
        var ctx = this.ctx;
        if (target.collected) return;

        var glow = Math.sin(time * 2 + target.glowPhase) * 0.2 + 0.8;
        var r = target.radius;

        // Bubble glow
        var grad = ctx.createRadialGradient(target.x, target.y, r * 0.5, target.x, target.y, r * 1.5);
        grad.addColorStop(0, 'rgba(197,180,227,' + (0.15 * glow) + ')');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(target.x, target.y, r * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Bubble
        ctx.beginPath();
        ctx.arc(target.x, target.y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(27, 20, 100,' + (0.5 * glow) + ')';
        ctx.fill();
        ctx.strokeStyle = 'rgba(197,180,227,' + (0.5 * glow) + ')';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Word text
        ctx.fillStyle = 'rgba(255,255,255,' + (0.9 * glow) + ')';
        ctx.font = '700 ' + target.fontSize + 'px "Noto Sans KR", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(target.word, target.x, target.y);
    },

    drawObstacle: function(obs) {
        var ctx = this.ctx;
        ctx.fillStyle = 'rgba(200,210,230,0.12)';
        ctx.beginPath();
        // Cloud shape with arcs
        var cx = obs.x + obs.w / 2;
        var cy = obs.y + obs.h / 2;
        var rx = obs.w / 2;
        var ry = obs.h / 2;
        ctx.ellipse(cx, cy, rx, ry * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.ellipse(cx - rx * 0.4, cy - ry * 0.3, rx * 0.6, ry * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.ellipse(cx + rx * 0.4, cy - ry * 0.2, rx * 0.5, ry * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
    },

    drawFlash: function(alpha, color) {
        if (alpha <= 0) return;
        var ctx = this.ctx;
        ctx.fillStyle = color || 'rgba(255,217,125,' + alpha + ')';
        ctx.globalAlpha = alpha;
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.globalAlpha = 1;
    },

    drawFloatingTexts: function(texts) {
        var ctx = this.ctx;
        for (var i = 0; i < texts.length; i++) {
            var ft = texts[i];
            ctx.globalAlpha = ft.alpha;
            ctx.fillStyle = ft.color;
            ctx.font = '900 ' + ft.size + 'px "Noto Sans KR", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(ft.text, ft.x, ft.y);
        }
        ctx.globalAlpha = 1;
    },

    // ── Screen Shake ──
    updateShake: function(dt) {
        var s = Game.State.screenShake;
        if (s.duration > 0) {
            s.duration -= dt;
            var t = Math.max(0, s.duration / 0.3);
            this.shake.x = (Math.random() - 0.5) * s.intensity * t;
            this.shake.y = (Math.random() - 0.5) * s.intensity * t;
        } else {
            this.shake.x = 0;
            this.shake.y = 0;
        }
    }
};

window.Game = Game;
