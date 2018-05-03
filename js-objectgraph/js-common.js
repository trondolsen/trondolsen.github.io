// Output 'text:String' to debug console.
function debug(text) {
  var elem = getElemById('debug-console');
  makeElemText(text + "\n", elem);
  elem.style.display = "inherit";
}

// Transform 'thing:Any' to text yielding 'String'.
function toText(thing) {
  if (thing === undefined) {
    return "undefined";
  }
  if (thing === null) {
    return "null";
  }
  else if (exists(thing.splice)) {
    return "[" + thing.join(",") + "]";
  }
  else if (typeof thing === "object") {
    var pairs = map(keys(thing), function(key) {
      return key + ":" + (exists(thing,key) ? (thing[key].toString()) : (thing[key]));
    });
    return "{" + pairs.join(",")  + "}";
  }
  else {
    return thing.toString();
  }
}

// Check that 'thing:Object' exists (and optionally traverse 'key:String...' in object) yielding 'Boolean'.
function exists(thing, key) {
  if (thing === undefined || thing === null) {
    return false;
  }
  else if (key !== undefined) {
    if (thing[key] !== undefined) {
      var args = Array.prototype.slice.call(arguments, 1);
      args[0] = thing[key];
      return exists.apply(null, args);
    }
  }
  else {
    return true;
  }
}

// Check that 'thing:Object|Array' contains value 'item:Any' (optionally comparing using 'fn:Function') yielding 'Boolean'.
function contains(thing, item, fn){
  if (exists(thing.splice)) {
    for (var i = 0; i < thing.length; i++) {
      if (fn === undefined && thing[i] === item) {
        return true;
      }
      else if (fn !== undefined && fn.call(null, thing[i], item)) {
        return true;
      }
    }
  }
  else {
    for (var key in thing) {
      if (thing.hasOwnProperty(key)) {
        if (fn === undefined && thing[key] === item) {
          return true;
        }
        else if (fn !== undefined && fn.call(null, thing[key], item)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

// Traverse all items in 'thing:Object' using optional 'scope:Object', applying 'fn:Function' to 'value:Any key:String|Number'.
function foreach(thing, fn, scope) {
  if (exists(thing.splice)) {
    for (var i = 0; i < thing.length; i++) {
      fn.call(scope, thing[i], i);
    }
  }
  else {
    for (var key in thing) {
      if (thing.hasOwnProperty(key)) {
        fn.call(scope, thing[key], key);
      }
    }
  }
}

// Map all items in 'thing:Object|Array' using optional 'scope:Object',
// applying 'fn:Function' to (value:Any,key:String|Number), yielding 'Object|Array'.
function map(thing, fn, scope) {
  if (exists(thing.splice)) {
    var array = [];
    for (var i = 0; i < thing.length; i++) {
      array.push(fn.call(scope, thing[i], i));
    }
    return array;
  }
  else {
    var obj = {};
    for (var key in thing) {
      if (thing.hasOwnProperty(key)) {
        obj[key] = fn.call(scope, thing[key], key);
      }
    }
    return obj;
  }
}

// Sort array 'thing:Array' yielding 'Array'.
function sort(thing) {
  if (exists(thing.splice)) {
    return thing.sort();
  }
  else {
    return thing;
  }
}

// List all keys in 'object:Object|Array' (optionally listing 'onlyOwnKeys:Boolean') yielding 'Array of String|Number'.
function keys(object, onlyOwnKeys) {
  onlyOwnKeys = exists(onlyOwnKeys) ? (onlyOwnKeys) : (false);
  var sum = [];
  if (exists(object.splice)) {
    for (var i = 0; i < object.length; i++) {
      sum.push(i);
    }
  }
  else {
    for (var key in object) {
      if (onlyOwnKeys === false || object.hasOwnProperty(key)) {
        sum.push(key);
      }
    }
  }

  return sort(sum);
}

// List all values of keys in 'object:Object' yielding 'Array of Any'.
function values(object) {
  var array = keys(object);
  var sum = [];
  for (var i = 0; i < array.length; i++) {
    sum.push(object[array[i]]);
  }
  return sum;
}

// Find index of object in 'array:Array' yielding 'Number' (not found indicated by negative index).
function index(array, object){
  for (var i = 0; i < array.length; i++) {
    if (array[i] === object) {
      return i;
    }
  }
  return -1;
}

// Get element by given 'id:String' yielding 'HtmlElement'.
function getElemById(id) {
  return document.getElementById(id);
}

// Make element of 'type:String' with given
// 'params:{css:Array of String id:String attribs:Object content:HtmlElement parent:HtmlElement}'
// and 'keys:Object' yielding 'HtmlElement'.
function makeElem(type, params, keys) {
	var elem = document.createElement(type);
	
  if (exists(params.css) && params.css.length > 0) {
    elem.className = params.css.join(" ");
  }

  if (exists(params.id)) {
    elem.id = params.id;
  }

  if (exists(params.attribs)) {
    foreach(params.attribs, function(value,key) {
      elem.setAttribute(key, value);
    });
  }
 
  if (exists(params.content)) {
    elem.appendChild(params.content);
  }

  if (exists(params.parent)) {
    params.parent.appendChild(elem);
  }

  if (exists(keys)) {
    foreach(keys, function(value,key) {
      elem[key] = value;
    });
  }
	
  return elem;
}

// Make text element with 'text:String' (and optionally append to 'parent:HtmlElement') yielding 'HtmlElement'.
function makeElemText(text, parent) {
  var elem = document.createTextNode(text);
  if (exists(parent)) {
    parent.appendChild(elem);
  };
  return elem;
}

// Place 'elem:HtmlElement' at position 'x:Number' 'y:Number'.
function placeElem(x, y, elem) {
  elem.style.left = x + "px";
  elem.style.top = y + "px";
}

// Get bounding box of 'elem:HtmlElement' yielding {'x:Number' 'y:Number' 'width:Number' 'height:Number'}.
function getElemBox(elem) {
  return {
    x: elem.style.offsetLeft, y: elem.offsetTop, width: elem.offsetWidth, height: elem.offsetHeight
  };
}

// Add list of 'css:Array of String' classes to 'elem:HtmlElement' yielding 'Array of String'.
function addCss(elem, css) {
  var array = exists(elem.className) ? (elem.className.split(" ")) : ([]);
  for (var i = 0; i < css.length; i++) {
    if (contains(array, css[i]) === false) {
      array.unshift(css[i]);
    }
  }
  elem.className = array.join(" ");

  return array;
}

// Remove list of 'css: Array of String' classes from 'elem:HtmlElement' yielding 'Array of String'.
function dropCss(elem, css) {
  var array = exists(elem.className) ? (elem.className.split(" ")) : ([]);
  for (var i = 0; i < css.length; i++) {
    var idx = index(array, css[i]);
    if (idx > -1) {
      array.splice(idx, 1);
    }
  }
  elem.className = array.join(" ");

  return array;
}

var mouse = function() {
  var prepareEvent = function(arg) {
    var event = arg || window.event;
    if (exists(event, "stopPropagation")) {
      event.stopPropagation();
    }
    if (exists(event, "cancelBubble")) {
      event.cancelBubble = true;
    }
    return event;
  };

  return {
    // Silently ignore all mouse events.
    silent: function(arg) {
      var event = prepareEvent(arg);
      return false;
    },
    // Apply 'fn:Function' when left-clicked mouse.
    leftClick: function(fn) {
      return function(arg) {
        var event = prepareEvent(arg);
        if (exists(event, "which") && event.which === 1) {
          fn(event);
        }
        if (exists(event) === false) {
          fn();
        }
        return false;
       };
     },
    // Apply 'fn:Function' when middle-clicked mouse.
    middleClick: function(fn) {
      return function(arg) {
        var event = prepareEvent(arg);
        if (exists(event, "which")) {
          if (event.which === 2) {
            fn(event);
          }
        }
        return false;
      };
    },
    // Apply 'fn:Function' when right-clicked mouse.
    rightClick: function(fn) {
      return function(arg) {
        var event = prepareEvent(arg);
        if (exists(event, "which")) {
          if (event.which === 3) {
            fn(event);
          }
        }
        return false;
       };
    },
    // Apply 'fn:Function' when scrolling mouse.
    scroll: function(fn) {
      var prepare = function(fn2) {
        return function(arg) {
          var event = prepareEvent(arg);
          if (exists(event, "wheelDelta")) {
            fn2((event.wheelDelta / 120) * 3);
          }
          else if (exists(event, "detail")) {
            fn2(event.detail);
          }
          return false;
        };
      };
      if (exists(document, "addEventListener")) {
        window.addEventListener("mousewheel", prepare(fn), false);
        window.addEventListener("DOMMouseScroll", prepare(fn), false);
      }
     }
   };
}();

var keyboard = function() {
  var prepareEvent = function(arg) {
    var event = arg || window.event;
    if (exists(event, "stopPropagation")) {
      event.stopPropagation();
    }
    if (exists(event, "cancelBubble")) {
      event.cancelBubble = true;
    }
    return event;
  };
  var matcher = new RegExp("[a-zA-Z0-9]");
  var toAlphaNum = function(code) {
    var text = String.fromCharCode(code);
    return exists(text.match(matcher)) ? (text) : ("");
  };

  return {
    // Silently ignore all keyboard events.
    silent: function(arg) {
      var event = prepareEvent(arg);
      return false;
    },
    // Apply 'fn:Function' to 'String' of key pressed on keyboard.
    keyPressed: function(fn) {
      return function(arg) {
        var event = arg || window.event;
        if (exists(event, "charCode")) {
          fn(toAlphaNum(event.charCode));
        }
        else if (exists(event, "keyCode")) {
          fn(toAlphaNum(event.keyCode));
        }
        return true;
       };
     }
   };
}();
