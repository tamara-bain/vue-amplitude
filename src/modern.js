import amplitude from "amplitude-js";
const SECONDARY_DEVICE_ID_COOKIE = '_amplitude_independent_device_id';

function get_uuid(ph) {
  return ph ? ( ph ^ Math.random() * 16 >> ph / 4 ).toString(16)
    : ( [1e7] + -1e3 + -4e3 + -8e3 + -1e11 ).replace(/[018]/g, get_uuid);
}

function load_secondary_device_id(instance) {
  let data = instance.cookieStorage.get(SECONDARY_DEVICE_ID_COOKIE);
  if (data && data.secondaryDeviceId) {
    instance.options.secondaryDeviceId = data.secondaryDeviceId;
  }
  else {
    instance.options.secondaryDeviceId = get_uuid();
  }
  instance.cookieStorage.set(SECONDARY_DEVICE_ID_COOKIE, {
    secondaryDeviceId: instance.options.secondaryDeviceId
  });
}

function _init(key) {
  let config = {
    batchEvents: false,
    includeReferrer: true,
    includeUtm: true
  };

  const instance = amplitude.getInstance();
  load_secondary_device_id(instance);
  instance.init(key, null, config);
}

function _getGlobalEventProperties(route) {
  return {
    'PAGE' : route.name,
    'PATH' : route.fullPath,
    'QUERY': route.query,
    'HASH': route.hash
  };
}

function isValidRoute(route) {
  if (route === undefined || route === null || route.name === undefined || route.fullPath === undefined ||
    route.query === undefined || route.hash === undefined) {
    console.error("Route object must be define 'page', 'fullPath', 'query', and 'hash' properties");
    return false;
  }
  return true;
}

class _Event {
  constructor(global_event_properties) {
    this.geps = global_event_properties;
    this.properties = {};
  }

  sendEvent() {
    let properties = Object.assign({}, this.properties, this.geps);
    amplitude.getInstance().logEvent(this.name, properties);
  }
}

class _PageLoadEvent extends _Event {
  constructor(global_event_properties) {
    super(global_event_properties);
    this.name = "load-page";
  }
}

class _ClickEvent extends _Event {
  constructor(description, destination, section, global_event_properties) {
    super(global_event_properties);
    this.name = "click";
    this.properties = {
      'ITEM-DESCRIPTION': description,
      'LINK-DESTINATION': destination,
      'SECTION': section
    };
  }
}

class VueAmplitude {
  constructor(key, debug=false, CLICK_DESCRIPTIONS={}, CLICK_DESTINATIONS={}, CLICK_SECTIONS={}, split_tests=null) {

    if (key === undefined) {
      console.error("init must be passed a valid Key");
      return;
    }
    this._initialized = true;
    this._debug = debug;
    this.CLICK_DESCRIPTIONS = CLICK_DESCRIPTIONS;
    this.CLICK_DESTINATIONS = CLICK_DESTINATIONS;
    this.CLICK_SECTIONS = CLICK_SECTIONS;
    this._split_tests=split_tests;
    return _init(key);
  }
  device_id() {
    if (this._initialized !== true) {
      console.error("init must be called for Amplitude before accessing deviceId");
      return;
    }
    return amplitude.getInstance().options.deviceId;
  }
  user_id() {
    if (this._initialized !== true) {
      console.error("init must be called for Amplitude before accessing userId");
      return;
    }
    return amplitude.getInstance().options.userId;
  }
  identify(user_id) {
    if (this._initialized !== true) {
      console.error("init must be called for Amplitude before calling identify");
      return;
    }
    if (user_id === undefined || user_id === null || user_id === '') {
      console.error("User id must be defined to identify a user.");
      return;
    }

    amplitude.getInstance().setUserId(user_id);
  }
  set_user_properties(user_properties={}, set_once=true) {
    if (this._initialized !== true) {
      console.error("init must be called for Amplitude before calling set user properties");
      return;
    }

    let identify = new amplitude.Identify();

    for (let key in user_properties) {
      if (set_once === true) {
        identify.setOnce(key, user_properties[key]);
      }
      else {
        identify.set(key, user_properties[key]);
      }
    }

    amplitude.getInstance().identify(identify);
  }
  get_split_test() {
      if (this._initialized !== true) {
          console.error("init must be called for Amplitude before calling set split tests");
          return;
      }
      if (this._split_tests === undefined || this._split_tests === null || this._split_tests.length === 0) {
          return null;
      }
      let user_id = this.user_id();

      if (user_id === undefined || user_id === null) {
          user_id = this.device_id();
      }

      let bucket_index = Number(user_id.replace(/\D/g, '')) % this._split_tests.length;
      return this._split_tests[bucket_index];
  }
  set_split_test() {
      let split_test = this.get_split_test();
      if (split_test === null) {
          return;
      }
      let identify = new amplitude.Identify();
      identify.set("SAW-" + split_test.toUpperCase, true);
      this.instance.identify(identify);
      if (this._debug) {
      console.log('sent identify');
    }
  }
  add_split_test_to_properties(properties) {
      let split_test = this.get_split_test();
      if (split_test === null) {
          return properties;
      }
      properties['SPLIT_TEST'] = split_test;
      return properties;
  }
  secondary_device_id() {
    if (this._initialized !== true) {
      console.error("init must be called for Amplitude before accessing deviceId");
      return;
    }
    return amplitude.getInstance().options.secondaryDeviceId;
  }

  get instance() {
    if (this._initialized !== true) {
      console.error("init must be called for Amplitude before accessing deviceId");
      return;
    }
    return amplitude.getInstance();
  }

  cookiesEnabled() {
    if (this._initialized !== true) {
      console.error("init must be called for Amplitude before accessing deviceId");
      return;
    }
    return amplitude.getInstance().cookieStorage.__cookiesEnabled();
  }

  pageLoadEvent(route) {
    if (this._initialized !== true) {
      console.error("init must be called for Amplitude before calling onPageLoad");
      return;
    }
    if (!isValidRoute(route)) {
      return;
    }
    const geps = _getGlobalEventProperties(route);
    this.add_split_test_to_properties(geps);
    const event = new _PageLoadEvent(geps);
    event.sendEvent();

    if (this._debug) {
      console.log('sent event ' + event.name);
    }
  }

  clickEvent({ route, description, destination=null, section=null }) {
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
    const geps = _getGlobalEventProperties(route);
    this.add_split_test_to_properties(geps);
    const event = new _ClickEvent(description, destination, section, geps);
    event.sendEvent();

    if (this._debug) {
      console.log('sent event ' + event.name);
    }
  }
}


// noinspection JSUnusedGlobalSymbols
export default {
  device_id() {
    return amplitude.getInstance().options.deviceId;
  },
  secondary_device_id() {
    const instance = amplitude.getInstance();
    load_secondary_device_id(instance);
    return instance.options.secondaryDeviceId;
  },
  session_id() {
    return amplitude.getInstance()._sessionId;
  },
  install(Vue, { router, amplitude_key, split_tests = null, debug = false } = {}) {

    let plugin = new VueAmplitude(amplitude_key, debug, {}, {}, {}, split_tests);

    // add easy access to the amplitude plugin
    // noinspection JSUnusedGlobalSymbols
    Vue.prototype.$amplitude = plugin;

    // add a before resolve hook to the router so that
    // a page load event is sent everytime a page is loaded
    router.beforeResolve((to, from, next) => {
      plugin.pageLoadEvent(to);
      next();
    });

    Vue.directive('amplitude-click', {
      bind(el, binding) {
        const item_description = binding.value.description;
        if (item_description === undefined) {
          console.error("amplitude-click value must define 'description'");
          return;
        }

        const route = binding.value.route;
        if (route === undefined) {
          console.error("amplitude-click value must define 'route'");
          return;
        }

        el.addEventListener('click', () => {
          plugin.clickEvent(binding.value);
        });
      },
    });
  },
};
