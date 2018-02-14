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
      controlsSymbolDecrement: '&minus;',
      controlsSymbolIncrement: '&plus;',
      
      field: null,
      fieldClass: null,

      defaultNum: 0,
      setValueFromDefault: false,
      
      disabled: false,
      readonly: false,
      
      min: -1,
      max: -1,
      step: 1,

      onChange: null,
      onDecrement: null,
      onIncrement: null
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

    renderField = function (field, opt) {
      field.className += ' pikanum-field ' + opt.fieldClass;

      if(opt.disabled === true) {
        field.setAttribute('disabled', 'disabled');
      }

      if(opt.readonly === true){
        field.setAttribute('readonly', 'readonly');
      }

      if(opt.min > -1)
      {
        field.setAttribute('min', opt.min);
      }

      if(opt.max > -1)
      {
        field.setAttribute('max', opt.max);
      }

      field.setAttribute('step', opt.step);

      return field;
    },

    renderInc = function (symbol, controlsClass, onClick) {
      var controlClass = 'pikanum-controls-inc ';

      if (controlsClass) controlClass += controlsClass;

      return renderControl(symbol, controlClass, onClick);
    },

    renderDec = function (symbol, controlsClass, onClick) {
      var controlClass = 'pikanum-controls-dec ';

      if (controlsClass) controlClass += controlsClass;

      return renderControl(symbol, controlClass, onClick);
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
      
      if(opt.setValueFromDefault)
      {
        this.setValueFromDefault();      
      }

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
      opt.controlsLocation = options.controlsLocation ? options.controlsLocation : opt.controlsLocation;
      opt.controlsSymbolDecrement = options.controlsSymbolDecrement ? options.controlsSymbolDecrement : opt.controlsSymbolDecrement;
      opt.controlsSymbolIncrement = options.controlsSymbolIncrement ? options.controlsSymbolIncrement : opt.controlsSymbolIncrement;
      
      opt.field = (options.field && options.field.nodeName) ? options.field : opt.field;
      opt.fieldClass = options.fieldClass ? options.fieldClass : opt.fieldClass;

      opt.defaultNum = (options.defaultNum && !isNaN(options.defaultNum)) ? options.defaultNum : opt.defaultNum;
      opt.setValueFromDefault = options.setValueFromDefault ? options.setValueFromDefault : opt.setValueFromDefault;

      opt.disabled = options.disabled ? options.disabled : opt.disabled;
      opt.readonly = options.readonly ? options.readonly : opt.readonly;
      
      opt.min = options.min ? options.min : opt.min;
      opt.max = options.max ? options.max : opt.max;      
      opt.step = options.step ? options.step : opt.step;

      opt.onChange = options.onChange ? options.onChange : opt.onChange;
      opt.onDecrement = options.onDecrement ? options.onDecrement : opt.onDecrement;
      opt.onIncrement = options.onIncrement ? options.onIncrement : opt.onIncrement;

      return opt;
    },

    decrement: function () {
      var opt = this._o;

      this.setValue(this.getValue() - opt.step, this.notifyOnDecrement.bind(this));
    },
    increment: function () {
      var opt = this._o;

      this.setValue(this.getValue() + opt.step, this.notifyOnIncrement.bind(this));
    },

    getDefaultValue: function(){
      var opt = this._o,
          val = opt.defaultNum;
      
      if(opt.min !== -1 && opt.defaultNum < opt.min) {
        val = opt.min;
      }
      else if (opt.max !== -1 && opt.defaultNum > opt.max)
      {
        val = opt.max;
      }

      return val;
    },
    getValue: function () {
      var opt = this._o,
        field = opt.field,
        currentValue = parseInt(field.value);
      
      if (isNaN(currentValue)) {
        currentValue = this.getDefaultValue();
      }
            
      return currentValue;
    },
    setValue: function (value, onSet) {
      var opt = this._o,
        field = opt.field;

      if (value % opt.step != 0) {
        value = Math.floor(value / opt.step) * opt.step;
      }

      if ((opt.min === -1 || (opt.min && value >= opt.min)) &&
        (opt.max === -1 || (opt.max && value <= opt.max))) {
        field.value = value;

        this.notifyOnChange(value);

        if (typeof (onSet) == 'function') {
          onSet(value);
        }
      }
    },
    setValueFromDefault: function(){
      var opt = this._o;

      this.setValue(this.getDefaultValue());
    },
    
    notifyOnChange: function (value) {
      var opt = this._o;

      if (typeof (opt.onChange) == 'function') opt.onChange(value);
    },
    notifyOnDecrement: function (value) {
      var opt = this._o;

      if (typeof (opt.onDecrement) == 'function') opt.onDecrement(value);
    },
    notifyOnIncrement: function (value) {
      var opt = this._o;

      if (typeof (opt.onIncrement) == 'function') opt.onIncrement(value);
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
      field = renderField(field, opt);

      //insert container into DOM
      field.parentNode.insertBefore(container, field);

      //move field into container
      container.appendChild(field);

      //create controls
      var dec = renderDec(opt.controlsSymbolDecrement, opt.controlsClass, this.decrement.bind(this)),
        inc = renderInc(opt.controlsSymbolIncrement,opt.controlsClass, this.increment.bind(this));

      //add controls to container at spec'd location
      field.parentNode.insertBefore(inc, opt.controlsLocation === 'after' ? field.nextSibling : field);
      field.parentNode.insertBefore(dec, opt.controlsLocation === 'after' ? field.nextSibling : field);      

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