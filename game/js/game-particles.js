// ═══════════════════════════════════════
// 별을 쏘아라 - Particle System
// ═══════════════════════════════════════

var Game = window.Game || {};

Game.Particles = {
    MAX: 350,
    pool: [],
    activeCount: 0,

    init: function() {
        this.pool = [];
        for (var i = 0; i < this.MAX; i++) {
            this.pool.push({
                active: false,
                x: 0, y: 0, vx: 0, vy: 0,
                life: 0, maxLife: 0,
                size: 0, sizeDecay: 0,
                color: '', alpha: 1,
                type: 'circle',
                gravity: 80
            });
        }
    },

    emit: function(cfg) {
        var count = cfg.count || 10;
        var spawned = 0;
        for (var i = 0; i < this.pool.length && spawned < count; i++) {
            var p = this.pool[i];
            if (p.active) continue;

            p.active = true;
            p.x = cfg.x + (Math.random() - 0.5) * (cfg.spread_pos || 0);
            p.y = cfg.y + (Math.random() - 0.5) * (cfg.spread_pos || 0);

            var angle = (cfg.direction !== undefined ? cfg.direction : -Math.PI / 2)
                + (Math.random() - 0.5) * (cfg.spread || Math.PI * 2);
            var speed = (cfg.speed || 100) * (0.4 + Math.random() * 0.6);

            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            p.life = (cfg.life || 0.8) * (0.6 + Math.random() * 0.4);
            p.maxLife = p.life;
            p.size = (cfg.size || 4) * (0.5 + Math.random() * 0.5);
            p.sizeDecay = cfg.sizeDecay || 0;
            p.gravity = cfg.gravity !== undefined ? cfg.gravity : 80;
            p.alpha = 1;
            p.type = cfg.type || 'circle';

            if (cfg.colors) {
                p.color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
            } else {
                p.color = cfg.color || '#FFD97D';
            }

            spawned++;
        }
    },

    update: function(dt) {
        this.activeCount = 0;
        for (var i = 0; i < this.pool.length; i++) {
            var p = this.pool[i];
            if (!p.active) continue;

            p.life -= dt;
            if (p.life <= 0) { p.active = false; continue; }

            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += p.gravity * dt;
            p.alpha = Math.max(0, p.life / p.maxLife);
            if (p.sizeDecay) {
                p.size -= p.sizeDecay * dt;
                if (p.size < 0.3) p.size = 0.3;
            }
            this.activeCount++;
        }
    },

    draw: function(ctx) {
        for (var i = 0; i < this.pool.length; i++) {
            var p = this.pool[i];
            if (!p.active) continue;

            ctx.globalAlpha = p.alpha;

            if (p.type === 'star') {
                this.drawStar(ctx, p.x, p.y, p.size, p.color);
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
    },

    drawStar: function(ctx, x, y, size, color) {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = color;
        ctx.beginPath();
        for (var i = 0; i < 5; i++) {
            var a1 = (i * 72 - 90) * Math.PI / 180;
            var a2 = ((i * 72 + 36) - 90) * Math.PI / 180;
            if (i === 0) ctx.moveTo(Math.cos(a1) * size, Math.sin(a1) * size);
            else ctx.lineTo(Math.cos(a1) * size, Math.sin(a1) * size);
            ctx.lineTo(Math.cos(a2) * size * 0.4, Math.sin(a2) * size * 0.4);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    },

    clear: function() {
        for (var i = 0; i < this.pool.length; i++) {
            this.pool[i].active = false;
        }
    }
};

window.Game = Game;
