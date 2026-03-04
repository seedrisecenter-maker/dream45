// ═══════════════════════════════════════
// 별을 쏘아라 - Input Handler
// 직관적 방향: 드래그한 방향으로 발사
// ═══════════════════════════════════════

var Game = window.Game || {};

Game.Input = {
    isDragging: false,
    startX: 0, startY: 0,
    currentX: 0, currentY: 0,
    launchX: 0, launchY: 0,
    aimAngle: 0,
    aimPower: 0,
    isPerfect: false,

    init: function() {
        var self = this;
        var el = document.body;
        this.updateLaunchPos();

        // Mouse
        el.addEventListener('mousedown', function(e) { self.onStart(e.clientX, e.clientY); });
        el.addEventListener('mousemove', function(e) { self.onMove(e.clientX, e.clientY); });
        el.addEventListener('mouseup', function() { self.onEnd(); });

        // Touch
        el.addEventListener('touchstart', function(e) {
            e.preventDefault();
            var t = e.touches[0];
            self.onStart(t.clientX, t.clientY);
        }, { passive: false });

        el.addEventListener('touchmove', function(e) {
            e.preventDefault();
            var t = e.touches[0];
            self.onMove(t.clientX, t.clientY);
        }, { passive: false });

        el.addEventListener('touchend', function(e) {
            e.preventDefault();
            self.onEnd();
        }, { passive: false });

        el.addEventListener('touchcancel', function() { self.onEnd(); });

        window.addEventListener('resize', function() { self.updateLaunchPos(); });
    },

    updateLaunchPos: function() {
        this.launchX = (Game.Render ? Game.Render.width : window.innerWidth) * 0.5;
        this.launchY = (Game.Render ? Game.Render.height : window.innerHeight) * 0.88;
    },

    onStart: function(x, y) {
        if (Game.State.current !== 'aiming') return;
        if (Game.State.shotsRemaining <= 0) return;

        this.isDragging = true;
        this.startX = x;
        this.startY = y;
        this.currentX = x;
        this.currentY = y;
    },

    onMove: function(x, y) {
        if (!this.isDragging) return;
        this.currentX = x;
        this.currentY = y;

        // 직관적: 드래그 방향 = 발사 방향
        var dx = this.currentX - this.startX;
        var dy = this.startY - this.currentY; // 위로 드래그 = 양수
        this.aimAngle = Math.atan2(dy, dx);
        this.aimPower = Math.sqrt(dx * dx + dy * dy);
        this.isPerfect = Game.Physics.isPerfect45(this.aimAngle);

        var deg = Math.round(this.aimAngle * 180 / Math.PI);
        var el = document.getElementById('angleDisplay');
        if (el && this.aimPower > 20) {
            el.textContent = deg + '°';
            el.className = 'angle-display' + (this.isPerfect ? ' perfect' : '');
        }
    },

    onEnd: function() {
        if (!this.isDragging) return;
        this.isDragging = false;

        document.getElementById('angleDisplay').textContent = '';

        if (this.aimPower < 25) return;

        var dx = this.currentX - this.startX;
        var dy = this.startY - this.currentY;
        var angle = Math.atan2(dy, dx);

        // 위쪽 방향만 허용 (5도~175도)
        if (angle < 0.087 || angle > 3.054) return;

        var perfect = Game.Physics.isPerfect45(angle);
        var launch = Game.Physics.calculateLaunch(dx, dy, perfect);

        Game.State.fireProjectile(this.launchX, this.launchY, launch, perfect);
    },

    getAimData: function() {
        if (!this.isDragging || this.aimPower < 20) return null;

        var dx = this.currentX - this.startX;
        var dy = this.startY - this.currentY;
        var angle = Math.atan2(dy, dx);
        if (angle < 0.087 || angle > 3.054) return null;

        var perfect = Game.Physics.isPerfect45(angle);
        var launch = Game.Physics.calculateLaunch(dx, dy, perfect);

        // 조준선 끝점 계산 (드래그 방향으로)
        var len = Math.min(this.aimPower, 100);
        var tipX = this.launchX + Math.cos(-angle) * len;
        var tipY = this.launchY + Math.sin(-angle) * len;

        return {
            fromX: this.launchX,
            fromY: this.launchY,
            toX: tipX,
            toY: tipY,
            vx: launch.vx,
            vy: launch.vy,
            angle: angle,
            perfect: perfect
        };
    }
};

window.Game = Game;
