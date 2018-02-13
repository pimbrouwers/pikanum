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

    defaults = {
      containerClass: null,
      controlsClass: null,
      controlsLocation: 'after',
      defaultNum: 0,
      field: null,
      min: -1,
      max: -1,
      step: 1
    },

    renderContainer = function (containerClass) {
      var container = document.createElement('div');
      container.className = 'pikanum-container ';

      if (containerClass) container.className += containerClass;

      return container;
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

      btn.addEventListener('click', onClick);

      return btn;
    },

    Pikanum = function (options) {
      var self = this,
        opt = self.config(options);

      self.show();
    };

  Pikanum.prototype = {
    config: function (options) {
      this._o = defaults;

      opt = this._o;

      opt.containerClass = options.containerClass ? options.containerClass : opt.containerClass;

      opt.controlsClass = options.controlsClass ? options.controlsClass : opt.controlsClass;

      opt.controlsLocation = options.controlsLocation ? options.controlsLocation : opt.controlsLocation

      opt.defaultNum = options.defaultNum ? options.defaultNum : opt.defaultNum;

      opt.field = (options.field && options.field.nodeName) ? options.field : opt.field;

      opt.min = options.min ? options.min : opt.min;

      opt.max = options.max ? options.max : opt.max;

      opt.step = options.step ? options.step : opt.step;

      return opt;
    },
    decrement: function () {
      var opt = this._o,
        field = opt.field;

      this.setValue(this.getValue() - opt.step);
    },
    increment: function () {
      var opt = this._o,
        field = opt.field;

      this.setValue(this.getValue() + opt.step);
    },
    render: function () {
      var opt = this._o,
        field = opt.field;;

      var disp = field.display;
      field.display = 'none';

      var container = renderContainer(opt.containerClass);

      field.parentNode.insertBefore(container, field);
      container.appendChild(field);

      var dec = renderDec(opt.controlsClass, this.decrement.bind(this)),
        inc = renderInc(opt.controlsClass, this.increment.bind(this));

      field.parentNode.insertBefore(dec, opt.controlsLocation === 'after' ? field.nextSibling : field);
      field.parentNode.insertBefore(inc, opt.controlsLocation === 'after' ? field.nextSibling : field);

      field.display = disp;

      this._container = container;
      this._dec = dec;
      this._inc = inc;
    },
    getValue: function(value) {
      var opt = this._o,
        field = opt.field,
        currentValue = parseInt(field.value);

      if(isNaN(currentValue)){
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
    show: function () {
      var opt = this._o,
        field = opt.field;


      this.setValue(opt.defaultNum);
      this.render();
    },
    destroy: function () {
      this._dec.removeEventListener('click', this.decrement);
      this._inc.removeEventListener('click', this.increment);

      if (this._container.parentNode) {
        this._container.parentNode.removeChild(this._container);
      }
    }
  }

  return Pikanum;
}));