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
    .on("dragmove", event => {
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
          inBounds.push(box);
        } else {
          box.style.boxShadow = "none";
          box.classList.remove("selected");
        }
      }

        for (const box of inBounds) {
          box.style.boxShadow = "0 0 3pt 3pt hsl(141, 53%, 53%)";
          box.classList.add("selected");
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
        if (isInBounds(rect, box)) {
          box.style.boxShadow = "0 0 3pt 3pt hsl(141, 53%, 53%)";
          box.classList.add("selected");
        } else {
          box.style.boxShadow = "none";
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

document.querySelector(".resize-container").addEventListener('gestureend', function(e) {
    if (e.scale < 1.0) {
        alert("ololo");
        for (const item of document.querySelectorAll(".item")) {
            item.style.transform += " scale(0.2)"
        }

        // User moved fingers closer together
    } else if (e.scale > 1.0) {
        for (const item of document.querySelectorAll(".item")) {
            item.style.transform += " scale(1)"
        }
    }
}, false);
document.onmousedown = mouseDown;
document.onmousemove = mouseMove;
document.onmouseup = mouseUp;

