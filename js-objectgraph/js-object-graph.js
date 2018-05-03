
function run() {
  // Setup workspace
  var zoom = 100;
  var workspace = getElemById('workspace');
  workspace.x = -10000;
  workspace.y = -10000;
  workspace.style.transform = "scale(" + (zoom / 100.0) + ")";
  mouse.scroll(function(steps) {
    zoom += steps;
    workspace.style.transform = "scale(" + (zoom / 100.0) + ")";
  });

  // Setup mouse handling for workspace
  window.onmousedown = function(event) {
    var mouse = {x: event.screenX, y: event.screenY};
    window.onmousemove = function(event) {
      workspace.x = workspace.x + (event.screenX - mouse.x);
      workspace.y = workspace.y + (event.screenY - mouse.y);
      mouse.x = event.screenX;
      mouse.y = event.screenY;
      placeElem(workspace.x, workspace.y, workspace);
    };
    window.onmouseup = function() {
      window.onmouseup = null;
      window.onmouseleave = null;
      window.onmousemove = null;
    };
    window.onmouseleave = function() {
      window.onmouseup = null;
      window.onmouseleave = null;
      window.onmousemove = null;
    };
  };

  // Setup graph
  var graph = new Springy.Graph();
  var node = makeGraphNode(graph, null, workspace, 'window', window);
  makeGraphNode(graph, null, workspace, 'document', document);
  makeGraphNode(graph, null, workspace, 'navigator', navigator);
  makeGraphNode(graph, null, workspace, 'history', history);
  makeGraphNode(graph, null, workspace, 'location', location);
  makeGraphNode(graph, null, workspace, 'screen', screen);
  var stiffness = 95.0;
  var repulsion = 75.0;
  var damping = 0.85;
  var layout = new Springy.Layout.ForceDirected(graph, stiffness, repulsion, damping);

  var renderer = new Springy.Renderer(layout,
    function clear() {
    },
    function drawEdge(edge, p1, p2) {
    },
    function drawNode(node, p) {
      var scale = 30;
      var offset = {x: (10000 + 550), y: (10000 + 250)};
      if (exists(node.data.elem)) {
        placeElem(offset.x + p.x * scale, offset.y + p.y * scale, node.data.elem);
      }
    }
  );
  renderer.start();
}

function makeGraphNode(graph, root, parentElem, name, object, remove) {
  var elem = makeElem("div", {css: ["node"], parent: parentElem});
  var elemLabel = makeElem("div", {css: ["label"], parent: elem});
  elemLabel.appendChild(makeElemText(name));

  var elemControls = makeElem("div", {css: ["controls","hidden"], parent: elem}, {onclick: mouse.silent});
  var elemSelectAll = makeElem("div", {css: ["control"], parent: elemControls});
  elemSelectAll.appendChild(makeElemText("select all"));

  var filterAttribs = null;
  var elemSearch = makeElem("div", {css: ["control"], parent: elemControls});
  elemSearch.appendChild(makeElemText("search"));
  var elemSearchText = makeElem("input",{
      css: ["search"], parent: elemSearch
    },{
      type: "text", onclick: mouse.silent,
      onkeyup: keyboard.keyPressed(function(text) {
        filterAttribs(text);
      })
  });

  makeElem("div", {css: ["control",["clear"]], parent: elemControls});
  
  // Add physics node
  var node = graph.newNode({name: name, elem: elem});
  var edge = null;
  if (exists(root)) {
    edge = graph.newEdge(root, node, {color: '#00A0B0', elem: elem});
  };
  
  var collapse = [];
  var expand = function() {
    var props = [];

    // Add keys with object values
    foreach(keys(object), function(key) {
      if (typeof object[key] === 'object' && object[key] !== null) {
        var fn = {};
        makeGraphNode(graph, node, parentElem, key, object[key], fn);
        collapse.push(fn);
      }
      else {
        props.push(key);
      }
    });
    
    // Add keys with non-object values
    var attribElems = [];
    foreach(props, function(key) {
      var itemElem = makeElem("div", {
        parent: elem, css: ["item"],
        content: makeElemText(key)
      });
      
      var expandKey = function() {
        addCss(itemElem, ["expanded"]);
        var detailElem = makeElem("div", {
          css: ["detail"],
          parent: itemElem,
          content: makeElemText((typeof object[key]) + ":" + object[key])
        });
        var expandKey = itemElem.onclick;
        var collapseKey = function() {
          dropCss(itemElem, ["expanded"]);
          itemElem.removeChild(detailElem);
          itemElem.onclick = expandKey;
        };
        itemElem.onclick = mouse.leftClick(collapseKey);
      };
      
      // Setup mouse handling for non-objects
      itemElem.onclick = mouse.leftClick(expandKey);
      attribElems.push(itemElem);
    });
    
    dropCss(elemControls, ["hidden"]);
    elemSelectAll.onclick = mouse.leftClick(function() {
      foreach(attribElems, function(elem) {
        elem.onclick();
      });
    });
    
    // Handle attrib filtering
    filterAttribs = function() {
      var matcher = new RegExp("^$|" + elemSearchText.value, "i");
      foreach(attribElems, function(elem) {
        var text = elem.innerHTML;
        if (exists(text.match(matcher))) {
          dropCss(elem, ["hidden"]);
        }
        else {
          addCss(elem, ["hidden"]);
        }
      });
    };
    
    // Setup mouse handling
    var onclickExpand = elem.onclick;
    elem.onclick = mouse.leftClick(function() {
      foreach(collapse, function(fn) {
        fn.perform();
      });
      foreach(attribElems, function(attrib) {
        elem.removeChild(attrib);
      });
      addCss(elemControls, ["hidden"]);
      elem.onclick = onclickExpand;
      elemSearchText.value = "";
    });
  };

  // Setup mouse handling for expanding/collapsing node
  elem.onclick = mouse.leftClick(expand);

  if (exists(remove)) {
    remove.perform = function () {
      foreach(collapse, function(fn) {
        fn.perform();
      });
      if (parentElem.contains(elem)) {
        parentElem.removeChild(elem);
      }
      if (exists(edge)) {
        graph.removeEdge(edge);
      }
      graph.removeNode(node);
    };
  }
  
  return node;
}
