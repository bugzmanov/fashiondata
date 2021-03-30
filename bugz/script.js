
function currentProject() {
  let path = window.location.pathname;
  let match = path.match(/project\/(.+)/);
  if(match.length == 2) {
    return match[1];
  } else {
    return null;
  }
}

function uploadFiles(event, form) {
  event.preventDefault();

   for (i = 0; i < form.elements.length; i++) {
    if (form.elements[i].type == 'file') {
      if (form.elements[i].value == '') {
        form.elements[i].parentNode.removeChild(form.elements[i]);
      }
    }
  } 

  var xhr = new XMLHttpRequest();
  xhr.open('POST', form.action + currentProject(), true);
  xhr.addEventListener('loadstart', function() {
    document.querySelector("#spinner").style.visibility="visible";
  });

  xhr.addEventListener('loadend', function(event) {
    console.log("DONE");
    const data = JSON.parse(this.responseText);
    console.log(data);
    for(const imgUrl of data.success) {
      let img = document.createElement("img");
      img.src=imgUrl;
      img.className = "resize-drag item";
      document.querySelector(".resize-container").appendChild(img);
    }
    document.querySelector("#spinner").style.visibility="hidden";
  });
  xhr.addEventListener('error', function(err) { 
    alert ('failed to upload: ' + JSON.stringify(err, ["message", "arguments", "type", "name"]));
    document.querySelector("#spinner").style.visibility="hidden";
  });
  xhr.send(new FormData(form));
}

function uploadClick() {
    document.querySelector("#files").click();
}

function deleteClick(e) {
    e.preventDefault();
    for (const item of document.querySelectorAll(".selected")) {
      item.remove();
    }
}

function saveClick() {
    saveDocument(currentProject());
}

function saveDocument(project) {
  let content = document.querySelector(".resize-container").innerHTML;
  var xhr = new XMLHttpRequest();
  xhr.open('POST', "/dev/save/" + project, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.addEventListener('loadstart', function() {
    document.querySelector("#spinner").style.visibility="visible";
  });
  xhr.addEventListener('loadend', function(event) {
    document.querySelector("#spinner").style.visibility="hidden";
  });
  xhr.addEventListener('error', function() { 
    alert ('failed to save');
    document.querySelector("#spinner").style.visibility="hidden";
  });
  xhr.send(JSON.stringify({"content": content}));
}

interact('.resize-drag')
  .draggable({
    onmove: window.dragMoveListener
  })
  .resizable({
    preserveAspectRatio: true,
    edges: { left: true, right: true, bottom: true, top: true }
  })
  .on('resizemove', function (event) {
    var target = event.target,
      x = (parseFloat(target.getAttribute('data-x')) || 0),
      y = (parseFloat(target.getAttribute('data-y')) || 0);

    // update the element's style
    target.style.width  = event.rect.width + 'px';
    target.style.height = event.rect.height + 'px';

    // translate when resizing from top or left edges
    x += event.deltaRect.left;
    y += event.deltaRect.top;

    target.style.webkitTransform = target.style.transform =
      'translate(' + x + 'px,' + y + 'px)';

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
    target.textContent = event.rect.width + '×' + event.rect.height;
    target.style.position = 'absolute';
  })
  .on("tap", itemClick) 
  .on("dragmove", event => {
    if(!event.target.classList.contains("selected")) {
      for(const item of document.getElementsByClassName("selected")) {
        item.classList.remove("selected");
      }
      event.target.classList.add("selected"); 
    }

    const items = document.getElementsByClassName("selected");
    const { dx, dy } = event;

    const parseDataAxis = target => axis =>
      parseFloat(target.getAttribute(`data-${axis}`));

    const translate = target => (x, y) => {
      target.style.webkitTransform = "translate(" + x + "px, " + y + "px)";
      target.style.transform = "translate(" + x + "px, " + y + "px)";
    };

    const updateAttributes = target => (x, y) => {
      target.setAttribute("data-x", x);
      target.setAttribute("data-y", y);
    };

    // if (items.length > 0) {
    for (const item of items) {
      if(event.target === item) continue;
      const x = parseDataAxis(item)("x") + dx;
      const y = parseDataAxis(item)("y") + dy;

      translate(item)(x, y);
      updateAttributes(item)(x, y);
    }
    // } else {
    //   const { target } = event;
    //   const x = (parseDataAxis(target)("x") || 0) + dx;
    //   const y = (parseDataAxis(target)("y") || 0) + dy;

    //   translate(target)(x, y);
    //   updateAttributes(target)(x, y);
    // }
  });

function dragMoveListener (event) {
  var target = event.target,
    // keep the dragged position in the data-x/data-y attributes
    x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
    y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

  // translate the element
  target.style.webkitTransform =
    target.style.transform =
    'translate(' + x + 'px, ' + y + 'px)';

  // update the posiion attributes
  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);
}


let canvas = document;
let element;
const mouse = {
  x: 0,
  y: 0,
  startX: 0,
  startY: 0
};


function mouseDown(e) {
  // if (e.target.id === "resize-container") {
  const rects = [...canvas.querySelectorAll(".selection")];

  if (rects) {
    for (const rect of rects) {
      canvas.removeChild(rect);
    }
  }

  mouse.startX = mouse.x;
  mouse.startY = mouse.y;
  element = document.createElement("div");
  element.className = "selection";
  element.style.border = "1px dashed black";
  element.style.position = "absolute";
  element.style.left = mouse.x + "px";
  element.style.top = mouse.y + "px";
  document.querySelector(".resize-container").appendChild(element);
  // }
}

function setMousePosition(e) {
  const ev = e || window.event;

  if (ev.pageX) {
    mouse.x = ev.pageX + window.pageXOffset;
    mouse.y = ev.pageY + window.pageYOffset;
  } else if (ev.clientX) {
    mouse.x = ev.clientX + document.body.scrollLeft;
    mouse.y = ev.clientY + document.body.scrollTop;
  }
}

function mouseMove(e) {
  setMousePosition(e);
  if (element) {
    element.style.width = Math.abs(mouse.x - mouse.startX) + "px";
    element.style.height = Math.abs(mouse.y - mouse.startY) + "px";
    element.style.left =
      mouse.x - mouse.startX < 0 ? mouse.x + "px" : mouse.startX + "px";
    element.style.top =
      mouse.y - mouse.startY < 0 ? mouse.y + "px" : mouse.startY + "px";


    const rect = canvas.querySelector(".selection");
    const boxes = [...canvas.querySelectorAll(".item")];

    if (rect) {
      const inBounds = [];

      for (const box of boxes) {
        if (isInBounds(rect, box)) {
          box.classList.add("selected");
        } else {
          box.classList.remove("selected");
        }
      }
    }      

  }
}

function mouseUp(e) {
  element = null;

  const rect = canvas.querySelector(".selection");
  const boxes = [...canvas.querySelectorAll(".item")];

  if (rect) {
    const inBounds = [];

    for (const box of boxes) {
      // console.log(box);
      if (isInBounds(rect, box)) {
        box.classList.add("selected");
      } else {
        console.log(box.src);
        box.classList.remove("selected");
      }
    }

    if (rect) canvas.querySelector(".resize-container").removeChild(canvas.querySelector(".selection"));
  }
}

function isInBounds(obj1, obj2) {
  const a = obj1.getBoundingClientRect();
  const b = obj2.getBoundingClientRect();
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

for (const item of document.querySelectorAll(".item")) {
  item.onmousedown = function(e) { e.target.setAttribute('select-drag', true); };
  item.onmouseup = function(e) { e.target.setAttribute('select-drag', false); };
}

function handle_pinch_zoom(ev) {

  if (ev.targetTouches.length == 2 && ev.changedTouches.length == 2) {
    // Check if the two target touches are the same ones that started
    // the 2-touch
    var point1=-1, point2=-1;
    for (var i=0; i < tpCache.length; i++) {
      if (tpCache[i].identifier == ev.targetTouches[0].identifier) point1 = i;
      if (tpCache[i].identifier == ev.targetTouches[1].identifier) point2 = i;
    }
    if (point1 >=0 && point2 >= 0) {
      // Calculate the difference between the start and move coordinates
      var diff1 = Math.abs(tpCache[point1].clientX - ev.targetTouches[0].clientX);
      var diff2 = Math.abs(tpCache[point2].clientX - ev.targetTouches[1].clientX);

      // This threshold is device dependent as well as application specific
      var PINCH_THRESHOLD = ev.target.clientWidth / 10;
      if (diff1 >= PINCH_THRESHOLD && diff2 >= PINCH_THRESHOLD)
        ev.target.style.background = "green";
    }
    else {
      // empty tpCache
      tpCache = new Array();
    }
  }
}

// document.querySelector(".resize-container").addEventListener('gestureend', function(e) {
//   if (e.scale < 1.0) {
//     for (const item of document.querySelectorAll(".item")) {
//       item.style.transform += " scale(0.2)"
//     }

//     // User moved fingers closer together
//   } else if (e.scale > 1.0) {
//     for (const item of document.querySelectorAll(".item")) {
//       item.style.transform += " scale(1)"
//     }
//   }
// }, false);
function itemClick(e) {
  if(!e.target.classList.contains("selected")){
    const items = document.querySelectorAll(".selected");
    for(const item of items) {
      item.classList.remove("selected");
    }
    e.target.classList.add("selected");
    e.preventDefault;
  }

}

document.querySelector("#content-wrap").onmousedown = mouseDown;
document.onmousemove = mouseMove;
document.onmouseup = mouseUp;
for(const item of document.querySelectorAll(".item")) {
  item.onmousedown = function() {
  }
}
//
// define a handler
function doc_keyDown(e) {

  if (e.ctrlKey && e.key === 'a') {
    uploadClick();
  }

  if (e.ctrlKey && e.key === 's') {
    saveClick();
  }

  if(e.key === 'd') {
    deleteClick();
  }
}
// register the handler 
document.addEventListener('keydown', doc_keyDown, false);

