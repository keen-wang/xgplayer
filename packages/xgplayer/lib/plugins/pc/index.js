'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _basePlugin = require('../../plugin/basePlugin');

var _basePlugin2 = _interopRequireDefault(_basePlugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Events = _basePlugin2.default.Events,
    Util = _basePlugin2.default.Util;

var PCPlugin = function (_BasePlugin) {
  _inherits(PCPlugin, _BasePlugin);

  function PCPlugin() {
    _classCallCheck(this, PCPlugin);

    return _possibleConstructorReturn(this, (PCPlugin.__proto__ || Object.getPrototypeOf(PCPlugin)).apply(this, arguments));
  }

  _createClass(PCPlugin, [{
    key: 'afterCreate',
    value: function afterCreate() {
      this.onVideoClick = this.onVideoClick.bind(this);
      this.onVideoDblClick = this.onVideoDblClick.bind(this);
      this.onMouseEnter = this.onMouseEnter.bind(this);
      this.onMouseLeave = this.onMouseLeave.bind(this);
      this.onControlMouseEnter = this.onControlMouseEnter.bind(this);
      this.onControlMouseLeave = this.onControlMouseLeave.bind(this);
      this.onReady = this.onReady.bind(this);
      this.initEvents();
      var playerConfig = this.playerConfig;

      if (playerConfig.autoplay) {
        this.onEnter();
      }
    }
  }, {
    key: 'initEvents',
    value: function initEvents() {
      var _this2 = this;

      var player = this.player;


      player.video.addEventListener('click', this.onVideoClick, false);

      player.video.addEventListener('dblclick', this.onVideoDblClick, false);

      this.once(Events.CANPLAY, this.onEntered.bind(this));
      this.once(Events.AUTOPLAY_PREVENTED, function () {
        _this2.onAutoPlayPrevented();
      });

      player.root.addEventListener('mouseenter', this.onMouseEnter);

      player.root.addEventListener('mouseleave', this.onMouseLeave);

      // player.controls.addEventListener('mouseenter', this.onControlMouseEnter, false)

      // player.controls.addEventListener('mouseleave', this.onControlMouseLeave, false)
    }
  }, {
    key: 'onEnter',
    value: function onEnter() {
      var player = this.player;

      Util.addClass(player.root, 'xgplayer-is-enter');
    }
  }, {
    key: 'onEntered',
    value: function onEntered() {
      var player = this.player;

      Util.removeClass(player.root, 'xgplayer-is-enter');
    }
  }, {
    key: 'onAutoPlayPrevented',
    value: function onAutoPlayPrevented() {
      var _this3 = this;

      var player = this.player;

      Util.removeClass(player.root, 'xgplayer-is-enter');
      this.once(Events.PLAY, function () {
        Util.addClass(player.root, 'xgplayer-is-enter');
        _this3.once(Events.TIME_UPDATE, function () {
          Util.removeClass(player.root, 'xgplayer-is-enter');
        });
      });
    }
  }, {
    key: 'onVideoClick',
    value: function onVideoClick(e) {
      console.log('onVideoClick');
      e.preventDefault();
      // e.stopPropagation()
      if (!this.config.closeVideoStopPropagation) {
        e.stopPropagation();
      }
      var player = this.player;

      var clk = 0;var timer = void 0;
      if (!player.config.closeVideoClick) {
        clk++;
        if (timer) {
          clearTimeout(timer);
        }
        if (clk === 1) {
          timer = setTimeout(function () {
            if (Util.hasClass(player.root, 'xgplayer-nostart')) {
              return false;
            } else if (!player.ended) {
              if (player.paused) {
                var playPromise = player.play();
                if (playPromise !== undefined && playPromise) {
                  playPromise.catch(function (err) {});
                }
              } else {
                player.pause();
              }
            }
            clk = 0;
          }, 200);
        } else {
          clk = 0;
        }
      }
    }
  }, {
    key: 'onVideoDblClick',
    value: function onVideoDblClick(e) {
      e.preventDefault();
      e.stopPropagation();
      var player = this.player;

      if (!player.config.closeVideoDblclick) {
        player.fullscreen ? player.exitFullscreen() : player.getFullscreen();
      }
    }
  }, {
    key: 'onMouseEnter',
    value: function onMouseEnter() {
      var player = this.player;

      clearTimeout(player.leavePlayerTimer);
      player.emit('focus', player);
    }
  }, {
    key: 'onMouseLeave',
    value: function onMouseLeave() {
      var player = this.player;

      if (!player.config.closePlayerBlur) {
        player.leavePlayerTimer = setTimeout(function () {
          player.emit('blur', player);
        }, player.config.leavePlayerTime || 1500);
      }
    }
  }, {
    key: 'onControlMouseEnter',
    value: function onControlMouseEnter() {
      var player = this.player;

      if (player.userTimer) {
        clearTimeout(player.userTimer);
      }
    }
  }, {
    key: 'onControlMouseLeave',
    value: function onControlMouseLeave() {
      var player = this.player;

      if (!player.config.closeControlsBlur) {
        player.emit('focus', player);
      }
    }
  }, {
    key: 'onReady',
    value: function onReady() {
      var player = this.player;

      if (player.config.autoplay) {
        player.start();
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var player = this.player;

      player.root.removeEventListener('mouseenter', this.onMouseEnter);
      player.root.removeEventListener('mouseleave', this.onMouseLeave);
      player.off('ready', this.onReady);
    }
  }], [{
    key: 'pluginName',
    get: function get() {
      return 'pc';
    }
  }]);

  return PCPlugin;
}(_basePlugin2.default);

exports.default = PCPlugin;