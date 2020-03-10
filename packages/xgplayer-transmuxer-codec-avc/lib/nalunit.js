'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sps = require('./sps');

var _sps2 = _interopRequireDefault(_sps);

var _sei = require('./sei');

var _sei2 = _interopRequireDefault(_sei);

var _rbsp = require('./rbsp');

var _rbsp2 = _interopRequireDefault(_rbsp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Nalunit = function () {
  function Nalunit() {
    _classCallCheck(this, Nalunit);
  }

  _createClass(Nalunit, null, [{
    key: 'getNalunits',
    value: function getNalunits(buffer) {
      if (buffer.length - buffer.position < 4) {
        return [];
      }

      var buf = buffer.dataview;
      var position = buffer.position;
      if (buf.getInt32(position) === 1 || buf.getInt16(position) === 0 && buf.getInt8(position + 2) === 1) {
        return Nalunit.getAnnexbNals(buffer);
      } else {
        return Nalunit.getAvccNals(buffer);
      }
    }
  }, {
    key: 'getAnnexbNals',
    value: function getAnnexbNals(buffer) {
      var nals = [];
      var position = Nalunit.getHeaderPositionAnnexB(buffer);
      var start = position.pos;
      var end = start;
      while (start < buffer.length - 4) {
        var header = buffer.buffer.slice(start, start + position.headerLength);
        if (position.pos === buffer.position) {
          buffer.skip(position.headerLength);
        }
        position = Nalunit.getHeaderPositionAnnexB(buffer);
        end = position.pos;
        var body = new Uint8Array(buffer.buffer.slice(start + header.byteLength, end));
        var unit = { header: header, body: body };
        Nalunit.analyseNal(unit);
        if (unit.type <= 9 && unit.type !== 0) {
          nals.push(unit);
        }
        buffer.skip(end - buffer.position);
        start = end;
      }
      return nals;
    }
  }, {
    key: 'getAvccNals',
    value: function getAvccNals(buffer) {
      // buffer.buffer = RBSP.EBSP2RBSP(new Uint8Array(buffer.buffer)).buffer;
      // buffer.dataview = new DataView(buffer.buffer)
      // buffer.dataview.position = 0;
      var nals = [];
      while (buffer.position < buffer.length - 4) {
        var length = buffer.dataview.getInt32(buffer.dataview.position);
        if (buffer.length - buffer.position >= length) {
          var header = buffer.buffer.slice(buffer.position, buffer.position + 4);
          buffer.skip(4);
          var body = new Uint8Array(buffer.buffer.slice(buffer.position, buffer.position + length));
          buffer.skip(length);
          var unit = { header: header, body: body };
          Nalunit.analyseNal(unit);
          if (unit.type <= 9 && unit.type !== 0) {
            nals.push(unit);
          }
        } else {
          break;
        }
      }
      return nals;
    }
  }, {
    key: 'analyseNal',
    value: function analyseNal(unit) {
      var type = unit.body[0] & 0x1f;
      unit.type = type;
      switch (type) {
        case 1:
          // NDR
          unit.ndr = true;
          break;
        case 5:
          // IDR
          unit.idr = true;
          break;
        case 6:
          // SEI
          unit.sei = _sei2.default.parse(unit.body);
          break;
        case 7:
          // SPS
          unit.sps = _sps2.default.parseSPS(unit.body);
          break;
        case 8:
          // PPS
          unit.pps = true;
          break;
        case 9:
          // AUD
          break;
        default:
          break;
      }
    }
  }, {
    key: 'getHeaderPositionAnnexB',
    value: function getHeaderPositionAnnexB(buffer) {
      // seperate
      var pos = buffer.position;
      var headerLength = 0;
      var bufferLen = buffer.length;
      while (headerLength !== 3 && headerLength !== 4 && pos < bufferLen - 4) {
        if (buffer.dataview.getInt16(pos) === 0) {
          if (buffer.dataview.getInt16(pos + 2) === 1) {
            // 0x000001
            headerLength = 4;
          } else if (buffer.dataview.getInt8(pos + 2) === 1) {
            headerLength = 3;
          } else {
            pos++;
          }
        } else {
          pos++;
        }
      }

      if (pos === bufferLen - 4) {
        if (buffer.dataview.getInt16(pos) === 0) {
          if (buffer.dataview.getInt16(pos + 2) === 1) {
            // 0x000001
            headerLength = 4;
          }
        } else {
          pos++;
          if (buffer.dataview.getInt16(pos) === 0 && buffer.dataview.getInt8(pos) === 1) {
            // 0x0000001
            headerLength = 3;
          } else {
            pos = bufferLen;
          }
        }
      }
      return { pos: pos, headerLength: headerLength };
    }
  }, {
    key: 'getAvcc',
    value: function getAvcc(sps, pps) {
      var ret = new Uint8Array(sps.byteLength + pps.byteLength + 11);
      ret[0] = 0x01;
      ret[1] = sps[1];
      ret[2] = sps[2];
      ret[3] = sps[3];
      ret[4] = 255;
      ret[5] = 225;

      var offset = 6;

      ret.set(new Uint8Array([sps.byteLength >>> 8 & 0xff, sps.byteLength & 0xff]), offset);
      offset += 2;
      ret.set(sps, offset);
      offset += sps.byteLength;

      ret[offset] = 1;
      offset++;

      ret.set(new Uint8Array([pps.byteLength >>> 8 & 0xff, pps.byteLength & 0xff]), offset);
      offset += 2;
      ret.set(pps, offset);
      return ret;
    }
  }]);

  return Nalunit;
}();

exports.default = Nalunit;