let pathData = [];
let svgNode = d3.select('svg');

function dist(x1, y1, x2, y2) {
  console.log(x1, x2, y1, y2);
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

let line = d3.line().context(null);
svgNode.on("mousedown", function (event) {
  console.log('help');
  d3.select(this)
    .on('mousemove', mousemove)
    .on('mouseup', mouseup)
    .append('path')
    .attr('class', 'active')
    .attr('stroke', 'black')
    .attr('fill', 'none');;
  pathData.push([event.layerX, event.layerY]);


  function mousemove(event) {
    // console.log(event.x, event.y);
    let lastpos = pathData[pathData.length - 1];
    // console.log(lastpos)
    let distance = dist(event.layerX, event.layerY, lastpos[0], lastpos[1]);
    // console.log(distance);
    if (distance > 5) {
      pathData.push([event.layerX, event.layerY]);
      console.log(pathData.length);
      d3.select('path.active')
        .attr('d', line(pathData));
    }
  }

  function mouseup() {
    console.log('mouseup');
    svgNode.on('mousemove', null).on('mouseup', null);
    d3.select('path.active').attr('d', line(pathData)).attr('class', null);

    pathData = [];
  }
})