let pathData = [];
let pathNodes = [];
let images = []; // { x, y, d }
let svgNode = d3.select('svg');

var CLICK_DISTANCE = 4,
  CLICK_DISTANCE_2 = CLICK_DISTANCE * CLICK_DISTANCE;

String.prototype.hashCode = function () { // https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
  var hash = 0;
  if (this.length == 0) return hash;
  for (i = 0; i < this.length; i++) {
    char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

// * initialize buttons
let undoButton = d3.select('button#undo')
  .on('click', (event) => {
    if (pathNodes.length > 0) {
      let node = pathNodes.pop();
      node.remove();
    }
  });

function drawImages() {
  svgNode
    .selectAll('image')
    .data(images)

    .join((d) => {
      return d.append('image')
    })
    .attr('x', d => d.x)
    .attr('y', d => d.y)
    .attr('xlink:href', d => d.data)
    .attr('id', d => d.id)
    .call(d3.drag()
      .clickDistance(CLICK_DISTANCE)
      .on("start", function (event, d) {
        event.sourceEvent.preventDefault();
        console.log('aaaa');
        d3.selectAll('image.active').attr('class', null);
        d3.select(this).attr('class', 'active');
      })
      .on("drag", function (event, d) {
        event.sourceEvent.preventDefault();
        console.log(event, d);
        d3.select(this).raise().attr('x', d.x = event.x).attr('y', d.y = event.y);
      })
      .on("end", (event, d) => {
        event.sourceEvent.preventDefault();
        console.log(event, d);
      }));
}

let AddImage = d3.select('input#addImage')
  .on('change', (event) => {
    let f = event.target.files[0];
    // if (f.type.test('image')) {
    let fr = new FileReader();

    fr.onload = function (ev2) {
      // console.log(ev2);
      images.push({
        x: 0,
        y: 0,
        data: fr.result,
        id: fr.result.hashCode()
      });
      drawImages();
    }
    fr.readAsDataURL(f);
    // };

  });

function dragstarted(event, d) {
  console.log(d);
  d.startX = event.sourceEvent.clientX;
  d.startY = event.sourceEvent.clientY;
}

function dragged(event, d) {
  console.log(d);
  var e = d3.select(this),
    dStartX = d.startX - d.sourceEvent.clientX,
    dStartY = d.startY - d.sourceEvent.clientY;

  if (dStartX * dStartX + dStartY * dStartY > CLICK_DISTANCE_2 &&
    !e.classed("active")) {

    e.raise().classed("active", true);
  }

  e.attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}

function dragended(d) {
  d3.select(this).classed("active", false);
}


function imageMouseDown(event) {
  event.stopPropagation();

  console.log('imageMouseDown');
  let node = d3.select(this)
    .on('mousemove', imageMouseMove)
    .on('mouseup', imageMouseUp)
    .attr('class', 'active');

  function imageMouseMove(event, d) {
    d3.select(this).raise().attr('x', d.x = event.x)
      .attr('y', d.y = event.y);
  }

  function imageMouseUp(event) {
    node.on('mousemove', null)
      .on('mouseup', null);
  }
}


function dist(x1, y1, x2, y2) {
  console.log(x1, x2, y1, y2);
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

let line = d3.line().context(null);
svgNode.on("mousedown", function (event) {
  let node = d3.select(this)
    .on('mousemove', mousemove)
    .on('mouseup', mouseup)
    .append('path')
    .attr('class', 'active')
    .attr('stroke', 'black')
    .attr('fill', 'none');
  pathNodes.push(node);
  pathData.push([event.layerX, event.layerY]);


  function mousemove(event) {
    // console.log(event.x, event.y);
    let lastpos = pathData[pathData.length - 1];
    // console.log(lastpos)
    let distance = dist(event.layerX, event.layerY, lastpos[0], lastpos[1]);
    // console.log(distance);
    if (distance > 5) {
      pathData.push([event.layerX, event.layerY]);
      // console.log(pathData.length);
      d3.select('path.active')
        .attr('d', line(pathData));
    }
  }

  function mouseup() {
    // console.log('mouseup');
    svgNode.on('mousemove', null).on('mouseup', null);
    d3.select('path.active').attr('d', line(pathData)).attr('class', null);

    pathData = [];
  }
})
