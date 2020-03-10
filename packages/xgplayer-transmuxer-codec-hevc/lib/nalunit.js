'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sps = require('./sps');

var _sps2 = _interopRequireDefault(_sps);

var _sei = require('./sei');

var _sei2 = _interopRequireDefault(_sei);

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
      // console.log('getNalunits')
      // console.log('buf: ', buf)
      // console.log(buf.getInt8(position))
      // console.log(buf.getInt8(position+1))
      // console.log(buf.getInt8(position+2))
      // console.log(buf.getInt8(position+3))
      if (buf.getInt32(position) === 1 || buf.getInt16(position) === 0 && buf.getInt8(position + 2) === 1) {
        return Nalunit.getAnnexbNals(buffer);
      } else {
        return Nalunit.getHvccNals(buffer);
      }
    }
  }, {
    key: 'getAnnexbNals',
    value: function getAnnexbNals(buffer) {
      // console.log('getAnnexbNals')
      // console.log('buffer: ', buffer)
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
        if (unit.type <= 40) {
          nals.push(unit);
        }
        buffer.skip(end - buffer.position);
        start = end;
      }
      return nals;
    }
  }, {
    key: 'getHvccNals',
    value: function getHvccNals(buffer) {
      // console.log('getHvccNals')
      var nals = [];
      while (buffer.position < buffer.length - 4) {
        // console.log('buffer')
        // console.log(buffer)
        // console.log(buffer.position)
        // console.log(buffer.length)
        // console.log(buffer.dataview)
        // let length = buffer.dataview.getInt32();
        var lengthArr = new Uint8Array(buffer.buffer.slice(0, 4));
        var length = lengthArr[0] << 24 + lengthArr[1] << 16 + lengthArr[2] << 8 + lengthArr[3];
        if (buffer.length - buffer.position >= length) {
          var header = buffer.buffer.slice(buffer.position, buffer.position + 4);
          buffer.skip(4);
          var body = buffer.buffer.slice(buffer.position, buffer.position + length);
          buffer.skip(length);
          var unit = { header: header, body: body };
          Nalunit.analyseNal(unit);
          if (unit.type <= 40) {
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
      // console.log('analyseNal')
      // console.log('unit: ', unit)
      // console.log(unit.body[0] >>> 1)
      var type = unit.body[0] >>> 1 & 0x3f;
      // console.log('type: ', type)
      unit.type = type;
      switch (type) {
        case 0:
          // SLICE_TRAIL_N
          unit.slice_trail_n = true;
          break;
        case 1:
          // SLICE_TRAIL_R
          unit.slice_trail_r = true;
          unit.key = true;
          break;
        case 2:
          // SLICE_TSA_N
          unit.slice_tsa_n = true;
          break;
        case 3:
          // SLICE_TSA_R
          unit.slice_tsa_r = true;
          unit.key = true;
          break;
        case 4:
          // SLICE_STSA_N
          unit.slice_stsa_n = true;
          break;
        case 5:
          // SLICE_STSA_R
          unit.slice_stsa_r = true;
          unit.key = true;
          break;
        case 6:
          // SLICE_RADL_N
          unit.slice_radl_n = true;
          break;
        case 7:
          // SLICE_RADL_R
          unit.slice_radl_r = true;
          unit.key = true;
          break;
        case 8:
          // SLICE_RASL_N
          unit.slice_rasl_n = true;
          break;
        case 9:
          // SLICE_RASL_R
          unit.slice_rasl_r = true;
          unit.key = true;
          break;
        case 16:
          // SLICE_BLA_W_LP
          unit.slice_bla_w_lp = true;
          break;
        case 17:
          // SLICE_BLA_W_RADL
          unit.slice_bla_w_radl = true;
          break;
        case 18:
          // SLICE_BLA_N_LP
          unit.slice_bla_n_lp = true;
          break;
        case 19:
          // SLICE_IDR_W_RADL
          unit.slice_idl_w_radl = true;
          unit.key = true;
          break;
        case 20:
          // SLICE_IDR_N_LP
          unit.slice_idr_n_lp = true;
          unit.key = true;
          break;
        case 21:
          // SLICE_CRA_NUT
          unit.slice_cra_nut = true;
          unit.key = true;
          break;
        case 32:
          // VPS
          unit.vps = true;
          break;
        case 33:
          // SPS
          unit.sps = _sps2.default.parseSPS(unit.body);
          break;
        case 34:
          // PPS
          unit.pps = true;
          break;
        case 35:
          // AUD
          break;
        case 36:
          // EOS
          unit.aud = true;
          break;
        case 37:
          // EOB
          unit.eob = true;
          break;
        case 38:
          // FD
          unit.fd = true;
          break;
        case 39:
          // PREFIX_SEI
          // unit.prefix_sei = true;
          unit.sei = _sei2.default.parse(unit.body.slice(1));
          break;
        case 40:
          // SUFFIX_SEI
          unit.sei = _sei2.default.parse(unit.body.slice(1));
          break;
        default:
          break;
        // case 1:
        //   // NDR
        //   unit.ndr = true;
        //   break;
        // case 5:
        //   // IDR
        //   unit.idr = true;
        //   break;
        // case 6:
        //   // SEI
        //   break;
        // case 7:
        //   // SPS
        //   unit.sps = SpsParser.parseSPS(unit.body);
        //   break;
        // case 8:
        //   // PPS
        //   unit.pps = true;
        //   break;
        // case 9:
        //   // AUD
        //   break;
        // default:
        //   break;
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

    // static getAvcc (sps, pps) {
    //   let ret = new Uint8Array(sps.byteLength + pps.byteLength + 11);
    //   ret[0] = 0x01;
    //   ret[1] = sps[1];
    //   ret[2] = sps[2];
    //   ret[3] = sps[3];
    //   ret[4] = 255;
    //   ret[5] = 225;
    //
    //   let offset = 6;
    //
    //   ret.set(new Uint8Array([(sps.byteLength >>> 8) & 0xff, sps.byteLength & 0xff]), offset);
    //   offset += 2;
    //   ret.set(sps, offset);
    //   offset += sps.byteLength;
    //
    //   ret[offset] = 1;
    //   offset++;
    //
    //   ret.set(new Uint8Array([(pps.byteLength >>> 8) & 0xff, pps.byteLength & 0xff]), offset);
    //   offset += 2;
    //   ret.set(pps, offset);
    //   return ret;
    // }

  }]);

  return Nalunit;
}();

exports.default = Nalunit;