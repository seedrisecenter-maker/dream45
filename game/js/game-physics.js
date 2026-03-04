// ═══════════════════════════════════════
// 별을 쏘아라 - Physics Engine
// ═══════════════════════════════════════

var Game = window.Game || {};

Game.Physics = {
    GRAVITY: 420,
    POWER_SCALE: 7,
    SWEET_ANGLE: Math.PI / 4,
    ANGLE_TOLERANCE: 0.09,

    getPosition: function(x0, y0, vx, vy, t) {
        return {
            x: x0 + vx * t,
            y: y0 + vy * t + 0.5 * this.GRAVITY * t * t
        };
    },

    // dx = currentX - startX, dy = startY - currentY (위로 드래그 = 양수)
    calculateLaunch: function(dx, dy, isPerfect) {
        var power = Math.sqrt(dx * dx + dy * dy) * this.POWER_SCALE;
        var angle = Math.atan2(dy, dx); // 직관적 방향 그대로
        if (power > 1200) power = 1200;
        if (power < 150) power = 150;
        if (isPerfect) power *= 1.3;
        return {
            vx: Math.cos(angle) * power,
            vy: -Math.sin(angle) * power, // 캔버스 y축 반전
            angle: angle,
            power: power
        };
    },

    isPerfect45: function(angle) {
        return Math.abs(angle - this.SWEET_ANGLE) < this.ANGLE_TOLERANCE;
    },

    getTrajectoryPreview: function(x0, y0, vx, vy, count) {
        var points = [];
        var dt = 0.025;
        for (var i = 0; i < count; i++) {
            var t = i * dt;
            var pos = this.getPosition(x0, y0, vx, vy, t);
            if (pos.y > (Game.Render ? Game.Render.height : 900) + 50) break;
            if (pos.x < -50 || pos.x > (Game.Render ? Game.Render.width : 1600) + 50) break;
            points.push(pos);
        }
        return points;
    },

    circleCollision: function(ax, ay, ar, bx, by, br) {
        var dx = ax - bx;
        var dy = ay - by;
        return (dx * dx + dy * dy) < (ar + br) * (ar + br);
    },

    pointInRect: function(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    }
};

window.Game = Game;
