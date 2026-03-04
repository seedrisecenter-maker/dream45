// ═══════════════════════════════════════
// 별을 쏘아라 - Audio (Web Audio API)
// ═══════════════════════════════════════

var Game = window.Game || {};

Game.Audio = {
    ctx: null,
    masterGain: null,
    enabled: true,

    init: function() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.25;
            this.masterGain.connect(this.ctx.destination);
        } catch (e) {
            this.enabled = false;
        }
    },

    unlock: function() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    play: function(name) {
        if (!this.enabled || !this.ctx) return;

        var now = this.ctx.currentTime;

        switch (name) {
            case 'launch':
                this._tone('sine', 330, 660, 0.12, 0.25, now);
                break;
            case 'perfect':
                this._tone('sine', 523, 1046, 0.25, 0.2, now);
                this._tone('sine', 659, 1318, 0.25, 0.15, now + 0.04);
                this._tone('sine', 784, 1568, 0.25, 0.1, now + 0.08);
                break;
            case 'hit':
                this._tone('triangle', 580, 880, 0.1, 0.2, now);
                break;
            case 'combo':
                this._tone('sine', 700, 1400, 0.18, 0.2, now);
                this._tone('triangle', 880, 1320, 0.12, 0.12, now + 0.03);
                break;
            case 'collect':
                this._tone('sine', 500, 1000, 0.2, 0.15, now);
                break;
            case 'levelComplete':
                this._chord([523, 659, 784, 1046], 0.7, now);
                break;
            case 'fail':
                this._tone('sawtooth', 300, 120, 0.35, 0.15, now);
                break;
            case 'click':
                this._tone('sine', 800, 600, 0.06, 0.15, now);
                break;
        }
    },

    _tone: function(type, freq1, freq2, dur, vol, time) {
        var osc = this.ctx.createOscillator();
        var gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq1, time);
        osc.frequency.linearRampToValueAtTime(freq2, time + dur);
        gain.gain.setValueAtTime(vol, time);
        gain.gain.linearRampToValueAtTime(0, time + dur);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + dur + 0.05);
    },

    _chord: function(freqs, dur, time) {
        for (var i = 0; i < freqs.length; i++) {
            var delay = i * 0.1;
            this._tone('sine', freqs[i], freqs[i] * 1.01, dur, 0.12, time + delay);
        }
    },

    toggle: function() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
};

window.Game = Game;
