'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _plugin = require('../../plugin');

var _plugin2 = _interopRequireDefault(_plugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Events = _plugin2.default.Events,
    Util = _plugin2.default.Util,
    Sniffer = _plugin2.default.Sniffer,
    POSITIONS = _plugin2.default.POSITIONS;

var PlaybackRate = function (_Plugin) {
  _inherits(PlaybackRate, _Plugin);

  _createClass(PlaybackRate, null, [{
    key: 'pluginName',
    get: function get() {
      return 'PlaybackRate';
    }
    // 默认配置信息

  }, {
    key: 'defaultConfig',
    get: function get() {
      return {
        position: POSITIONS.CONTROLS_RIGTH,
        index: 4,
        list: [0.5, 0.75, { rate: 1, iconText: '倍速' }, 1.5, 2]
      };
    }
  }]);

  function PlaybackRate(args) {
    _classCallCheck(this, PlaybackRate);

    var _this = _possibleConstructorReturn(this, (PlaybackRate.__proto__ || Object.getPrototypeOf(PlaybackRate)).call(this, args));

    _this.curRate = 1;
    return _this;
  }

  _createClass(PlaybackRate, [{
    key: 'afterCreate',
    value: function afterCreate() {
      var _this2 = this;

      var playerConfig = this.playerConfig,
          config = this.config;

      if (Array.isArray(playerConfig.playbackRate)) {
        config.list = playerConfig.playbackRate;
      }
      this.once(Events.CANPLAY, function () {
        _this2.show();
      });
      if (Sniffer.device === 'mobile') {
        this.activeEvent = 'click';
      } else {
        this.activeEvent = 'mouseenter';
      }
      this.renderItemList();
      this.onMouseenter = this.onMouseenter.bind(this);
      this.onItemClick = this.onItemClick.bind(this);
      this.bind(this.activeEvent, this.onMouseenter);
      this.bind('mouseleave', this.onMouseenter);
      this.bind('.icon-list li', ['touched', 'click'], this.onItemClick);
    }
  }, {
    key: 'show',
    value: function show() {
      if (!this.config.list || this.config.list.length === 0) {
        return;
      }
      _get(PlaybackRate.prototype.__proto__ || Object.getPrototypeOf(PlaybackRate.prototype), 'show', this).call(this);
    }
  }, {
    key: 'onMouseenter',
    value: function onMouseenter(e) {
      e.preventDefault();
      e.stopPropagation();
      Util.hasClass(this.root, 'list-show') ? Util.removeClass(this.root, 'list-show') : Util.addClass(this.root, 'list-show');
    }
  }, {
    key: 'onItemClick',
    value: function onItemClick(e) {
      var target = e.target;
      var cname = target.getAttribute('cname');
      if (Number(cname) === this.curRate) {
        return false;
      }
      Util.removeClass(this.find('.selected'), 'selected');
      Util.addClass(target, 'selected');
      this.curRate = Number(cname);
      this.player.playbackRate = Number(cname);
      this.find('.icon-text').innerHTML = target.getAttribute('ctext');
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.unbind(this.activeEvent, this.onMouseenter);
      this.unbind('mouseleave', this.onMouseenter);
      this.unbind('.icon-list li', ['touched', 'click'], this.onItemClick);
    }
  }, {
    key: 'renderItemList',
    value: function renderItemList() {
      var playbackRate = this.player.playbackRate || 1;
      this.curRate = playbackRate;
      var currentText = '';
      var items = this.config.list.map(function (item) {
        var itemInfo = (typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object' ? item : { rate: item };
        !itemInfo.text && (itemInfo.text = itemInfo.rate + 'x');
        if (itemInfo.rate === playbackRate) {
          itemInfo.isCurrent = true;
          currentText = item.iconText || itemInfo.text;
        }
        return '<li cname="' + itemInfo.rate + '" ctext="' + (item.iconText || itemInfo.text) + '" class="' + (itemInfo.isCurrent ? 'selected' : '') + '">' + itemInfo.text + '</li>';
      });
      this.find('.icon-list').innerHTML = items.join('');
      this.find('.icon-text').innerHTML = currentText;
      this.show();
    }
  }, {
    key: 'render',
    value: function render() {
      return '<xg-icon class="xgplayer-playbackrate">\n    <div class="xgplayer-icon btn-definition">\n    <span class="icon-text"></span>\n    </div>\n    <ul class="icon-list">\n    </ul>\n   </xg-icon>';
    }
  }]);

  return PlaybackRate;
}(_plugin2.default);

exports.default = PlaybackRate;