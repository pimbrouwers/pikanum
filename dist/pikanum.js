/*
	Pikanum 0.0.1
	Author: Pim Brouwers
	License: MIT	
*/
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define(factory);
  }
  else if (typeof module === "object" && module.exports) {
    module.exports = (root.Pikanum = factory());
  }
  else {
    root.Pikanum = factory();
  }
}(this, function (numeral) {

  var document = window.document,

    hasEventListeners = !!window.addEventListener,

    defaults = {
      containerClass: null,
      controlsClass: null,
      controlsLocation: 'after',
      defaultNum: 0,
      disabled: false,
      field: null,
      fieldClass: null,
      min: -1,
      max: -1,
      readonly: false,
      step: 1
    },

    addEvent = function (element, event, handler) {
      if (hasEventListeners) {
        element.addEventListener(event, handler);
      } else {
        element.attachEvent('on' + event, handler);
      }
    },

    removeEvent = function (element, event, handler) {
      if (hasEventListeners) {
        element.removeEventListener(event, handler);
      } else {
        element.detachEvent('on' + event, handler);
      }
    },

    renderContainer = function (containerClass) {
      var container = document.createElement('div');
      container.className = 'pikanum-container ';

      if (containerClass) container.className += containerClass;

      return container;
    },

    renderField = function(field, fieldClass, onBlur){      
      field.className += ' pikanum-field ' + fieldClass;
      
      addEvent(field, onBlur);

      return field;
    },

    renderInc = function (controlsClass, onClick) {
      var controlClass = 'pikanum-controls-inc ';

      if (controlsClass) controlClass += controlsClass;

      return renderControl('&plus;', controlClass, onClick);
    },

    renderDec = function (controlsClass, onClick) {
      var controlClass = 'pikanum-controls-dec ';

      if (controlsClass) controlClass += controlsClass;

      return renderControl('&minus;', controlClass, onClick);
    },

    renderControl = function (symbol, controlsClass, onClick) {
      var div = document.createElement('div');
      div.innerHTML = '<button type="button">' + symbol + '</button>';

      var btn = div.firstChild;

      btn.className = 'pikanum-controls ' + controlsClass;

      addEvent(btn, 'click', onClick);

      return btn;
    },

    Pikanum = function (options) {
      var self = this,
        opt = self.config(options);

      self.init();
    };

  Pikanum.prototype = {
    constructor: Pikanum,
    init: function () {
      var opt = this._o,
        field = opt.field;

      this.setValue(opt.defaultNum);
      this.render();
    },
    destroy: function () {
      removeEvent(this._dec, 'click', this.decrement);
      removeEvent(this._inc, 'click', this.increment);

      if (this._container.parentNode) {
        this._container.parentNode.removeChild(this._container);
      }
    },

    config: function (options) {
      this._o = defaults;

      opt = this._o;

      opt.containerClass = options.containerClass ? options.containerClass : opt.containerClass;

      opt.controlsClass = options.controlsClass ? options.controlsClass : opt.controlsClass;

      opt.controlsLocation = options.controlsLocation ? options.controlsLocation : opt.controlsLocation

      opt.defaultNum = options.defaultNum ? options.defaultNum : opt.defaultNum;

      opt.disabled = options.disabled ? options.disabled : opt.disabled;

      opt.field = (options.field && options.field.nodeName) ? options.field : opt.field;

      opt.fieldClass = options.fieldClass ? options.fieldClass : opt.fieldClass;

      opt.min = options.min ? options.min : opt.min;

      opt.max = options.max ? options.max : opt.max;

      opt.readonly = options.readonly ? options.readonly : opt.readonly;

      opt.step = options.step ? options.step : opt.step;

      return opt;
    },

    decrement: function () {
      var opt = this._o;

      this.setValue(this.getValue() - opt.step);
    },
    increment: function () {
      var opt = this._o;

      this.setValue(this.getValue() + opt.step);
    },

    getValue: function (value) {
      var opt = this._o,
        field = opt.field,
        currentValue = parseInt(field.value);

      if (isNaN(currentValue)) {
        currentValue = opt.defaultNum;
      }

      return currentValue;
    },
    setValue: function (value) {
      var opt = this._o,
        field = opt.field;

      if ((opt.min < 0 || (opt.min && value >= opt.min)) &&
        (opt.max < 0 || (opt.max && value <= opt.max))) {
        field.value = value;
      }
    },
    getSetValue: function () {
      this.setValue(this.getValue());
    },

    render: function () {
      var opt = this._o,
        field = opt.field;

      //capture field display value
      var disp = field.display;

      //hide field
      field.display = 'none';

      //create container
      var container = renderContainer(opt.containerClass);

      //render field
      field = renderField(field, opt.fieldClass, this.getSetValue.bind(this));

      //insert container into DOM
      field.parentNode.insertBefore(container, field);

      //move field into container
      container.appendChild(field);

      //create controls
      var dec = renderDec(opt.controlsClass, this.decrement.bind(this)),
        inc = renderInc(opt.controlsClass, this.increment.bind(this));

      //add controls to container at spec'd location
      field.parentNode.insertBefore(dec, opt.controlsLocation === 'after' ? field.nextSibling : field);
      field.parentNode.insertBefore(inc, opt.controlsLocation === 'after' ? field.nextSibling : field);

      //render container, field & controls
      field.display = disp;

      //preserve references to elements
      this._container = container;
      this._dec = dec;
      this._inc = inc;
    },
  }

  return Pikanum;
}));