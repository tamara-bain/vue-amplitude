"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _amplitudeJs = _interopRequireDefault(require("amplitude-js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var SECONDARY_DEVICE_ID_COOKIE = '_amplitude_independent_device_id';

function get_uuid(ph) {
  return ph ? (ph ^ Math.random() * 16 >> ph / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, get_uuid);
}

function load_secondary_device_id(instance) {
  var data = instance.cookieStorage.get(SECONDARY_DEVICE_ID_COOKIE);

  if (data && data.secondaryDeviceId) {
    instance.options.secondaryDeviceId = data.secondaryDeviceId;
  } else {
    instance.options.secondaryDeviceId = get_uuid();
  }

  instance.cookieStorage.set(SECONDARY_DEVICE_ID_COOKIE, {
    secondaryDeviceId: instance.options.secondaryDeviceId
  });
}

function _init(key) {
  var config = {
    batchEvents: false,
    includeReferrer: true,
    includeUtm: true
  };

  var instance = _amplitudeJs.default.getInstance();

  load_secondary_device_id(instance);
  instance.init(key, null, config);
}

function _getGlobalEventProperties(route) {
  return {
    'PAGE': route.name,
    'PATH': route.fullPath,
    'QUERY': route.query,
    'HASH': route.hash
  };
}

function isValidRoute(route) {
  if (route === undefined || route === null || route.name === undefined || route.fullPath === undefined || route.query === undefined || route.hash === undefined) {
    console.error("Route object must be define 'page', 'fullPath', 'query', and 'hash' properties");
    return false;
  }

  return true;
}

var _Event =
/*#__PURE__*/
function () {
  function _Event(global_event_properties) {
    _classCallCheck(this, _Event);

    this.geps = global_event_properties;
    this.properties = {};
  }

  _createClass(_Event, [{
    key: "sendEvent",
    value: function sendEvent() {
      var properties = Object.assign({}, this.properties, this.geps);

      _amplitudeJs.default.getInstance().logEvent(this.name, properties);
    }
  }]);

  return _Event;
}();

var _PageLoadEvent =
/*#__PURE__*/
function (_Event2) {
  _inherits(_PageLoadEvent, _Event2);

  function _PageLoadEvent(global_event_properties) {
    var _this;

    _classCallCheck(this, _PageLoadEvent);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(_PageLoadEvent).call(this, global_event_properties));
    _this.name = "load-page";
    return _this;
  }

  return _PageLoadEvent;
}(_Event);

var _ClickEvent =
/*#__PURE__*/
function (_Event3) {
  _inherits(_ClickEvent, _Event3);

  function _ClickEvent(description, destination, section, global_event_properties) {
    var _this2;

    _classCallCheck(this, _ClickEvent);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(_ClickEvent).call(this, global_event_properties));
    _this2.name = "click";
    _this2.properties = {
      'ITEM-DESCRIPTION': description,
      'LINK-DESTINATION': destination,
      'SECTION': section
    };
    return _this2;
  }

  return _ClickEvent;
}(_Event);

var VueAmplitude =
/*#__PURE__*/
function () {
  function VueAmplitude(key) {
    var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var CLICK_DESCRIPTIONS = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var CLICK_DESTINATIONS = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var CLICK_SECTIONS = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
    var split_tests = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;

    _classCallCheck(this, VueAmplitude);

    if (key === undefined) {
      console.error("init must be passed a valid Key");
      return;
    }

    this._initialized = true;
    this._debug = debug;
    this.CLICK_DESCRIPTIONS = CLICK_DESCRIPTIONS;
    this.CLICK_DESTINATIONS = CLICK_DESTINATIONS;
    this.CLICK_SECTIONS = CLICK_SECTIONS;
    this._split_tests = split_tests;
    return _init(key);
  }

  _createClass(VueAmplitude, [{
    key: "device_id",
    value: function device_id() {
      if (this._initialized !== true) {
        console.error("init must be called for Amplitude before accessing deviceId");
        return;
      }

      return _amplitudeJs.default.getInstance().options.deviceId;
    }
  }, {
    key: "user_id",
    value: function user_id() {
      if (this._initialized !== true) {
        console.error("init must be called for Amplitude before accessing userId");
        return;
      }

      return _amplitudeJs.default.getInstance().options.userId;
    }
  }, {
    key: "identify",
    value: function identify(user_id) {
      if (this._initialized !== true) {
        console.error("init must be called for Amplitude before calling identify");
        return;
      }

      if (user_id === undefined || user_id === null || user_id === '') {
        console.error("User id must be defined to identify a user.");
        return;
      }

      _amplitudeJs.default.getInstance().setUserId(user_id);
    }
  }, {
    key: "set_user_properties",
    value: function set_user_properties() {
      var user_properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var set_once = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      if (this._initialized !== true) {
        console.error("init must be called for Amplitude before calling set user properties");
        return;
      }

      var identify = new _amplitudeJs.default.Identify();

      for (var key in user_properties) {
        if (set_once === true) {
          identify.setOnce(key, user_properties[key]);
        } else {
          identify.set(key, user_properties[key]);
        }
      }

      _amplitudeJs.default.getInstance().identify(identify);
    }
  }, {
    key: "get_split_test",
    value: function get_split_test() {
      if (this._initialized !== true) {
        console.error("init must be called for Amplitude before calling set split tests");
        return;
      }

      if (this._split_tests === undefined || this._split_tests === null || this._split_tests.length === 0) {
        return null;
      }

      var user_id = this.user_id();

      if (user_id === undefined || user_id === null) {
        user_id = this.device_id();
      }

      var bucket_index = Number(user_id.replace(/\D/g, '')[0]) % this._split_tests.length;

      return this._split_tests[bucket_index];
    }
  }, {
    key: "set_split_test",
    value: function set_split_test() {
      var split_test = this.get_split_test();

      if (split_test === null) {
        return;
      }

      var identify = new _amplitudeJs.default.Identify();
      identify.set("SPLIT-TEST-" + split_test.toUpperCase(), true);
      this.instance.identify(identify);

      if (this._debug) {
        console.log('sent identify');
      }
    }
  }, {
    key: "add_split_test_to_properties",
    value: function add_split_test_to_properties(properties) {
      var split_test = this.get_split_test();

      if (split_test === null) {
        return properties;
      }

      properties['SPLIT_TEST'] = split_test;
      return properties;
    }
  }, {
    key: "secondary_device_id",
    value: function secondary_device_id() {
      if (this._initialized !== true) {
        console.error("init must be called for Amplitude before accessing deviceId");
        return;
      }

      return _amplitudeJs.default.getInstance().options.secondaryDeviceId;
    }
  }, {
    key: "cookiesEnabled",
    value: function cookiesEnabled() {
      if (this._initialized !== true) {
        console.error("init must be called for Amplitude before accessing deviceId");
        return;
      }

      return _amplitudeJs.default.getInstance().cookieStorage.__cookiesEnabled();
    }
  }, {
    key: "pageLoadEvent",
    value: function pageLoadEvent(route) {
      if (this._initialized !== true) {
        console.error("init must be called for Amplitude before calling onPageLoad");
        return;
      }

      if (!isValidRoute(route)) {
        return;
      }

      var geps = _getGlobalEventProperties(route);

      this.add_split_test_to_properties(geps);
      var event = new _PageLoadEvent(geps);
      event.sendEvent();

      if (this._debug) {
        console.log('sent event ' + event.name);
      }
    }
  }, {
    key: "clickEvent",
    value: function clickEvent(_ref) {
      var route = _ref.route,
          description = _ref.description,
          _ref$destination = _ref.destination,
          destination = _ref$destination === void 0 ? null : _ref$destination,
          _ref$section = _ref.section,
          section = _ref$section === void 0 ? null : _ref$section;

      if (this._initialized !== true) {
        console.error("init must be called for Amplitude before calling clickEvent");
        return;
      }

      if (description === undefined) {
        console.error("Click Event options must define 'item description'");
        return;
      }

      if (!isValidRoute(route)) {
        return;
      }

      var geps = _getGlobalEventProperties(route);

      this.add_split_test_to_properties(geps);
      var event = new _ClickEvent(description, destination, section, geps);
      event.sendEvent();

      if (this._debug) {
        console.log('sent event ' + event.name);
      }
    }
  }, {
    key: "instance",
    get: function get() {
      if (this._initialized !== true) {
        console.error("init must be called for Amplitude before accessing deviceId");
        return;
      }

      return _amplitudeJs.default.getInstance();
    }
  }]);

  return VueAmplitude;
}(); // noinspection JSUnusedGlobalSymbols


var _default = {
  device_id: function device_id() {
    return _amplitudeJs.default.getInstance().options.deviceId;
  },
  secondary_device_id: function secondary_device_id() {
    var instance = _amplitudeJs.default.getInstance();

    load_secondary_device_id(instance);
    return instance.options.secondaryDeviceId;
  },
  session_id: function session_id() {
    return _amplitudeJs.default.getInstance()._sessionId;
  },
  install: function install(Vue) {
    var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        router = _ref2.router,
        amplitude_key = _ref2.amplitude_key,
        _ref2$split_tests = _ref2.split_tests,
        split_tests = _ref2$split_tests === void 0 ? null : _ref2$split_tests,
        _ref2$debug = _ref2.debug,
        debug = _ref2$debug === void 0 ? false : _ref2$debug;

    var plugin = new VueAmplitude(amplitude_key, debug, {}, {}, {}, split_tests); // add easy access to the amplitude plugin
    setTimeout(function () {
      return plugin.set_split_test();
    }, 2000);

    // noinspection JSUnusedGlobalSymbols

    Vue.prototype.$amplitude = plugin; // add a before resolve hook to the router so that
    // a page load event is sent everytime a page is loaded

    router.beforeResolve(function (to, from, next) {
      plugin.pageLoadEvent(to);
      next();
    });
    Vue.directive('amplitude-click', {
      bind: function bind(el, binding) {
        var item_description = binding.value.description;

        if (item_description === undefined) {
          console.error("amplitude-click value must define 'description'");
          return;
        }

        var route = binding.value.route;

        if (route === undefined) {
          console.error("amplitude-click value must define 'route'");
          return;
        }

        el.addEventListener('click', function () {
          plugin.clickEvent(binding.value);
        });
      }
    });
  }
};
exports.default = _default;