var stuff = function() {
    
var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

/*var qMap = {
    Q1: '03',
    Q2: '06',
    Q3: '09',
    Q4: '12'
}*/

var parsedate = d3.timeParse('%Y'); // time and date parsing and formatting

var fmtdate = d3.timeFormat('%Y-%m');

function parseTime(dateQ) {
    // dateQ is a string xxxx-Qx
    /*console.log(dateQ);*/
    return parsedate(dateQ)
}
    
var x = d3.scaleTime()
    .rangeRound([0, width - 180]);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var z = d3.scaleOrdinal()
    .domain(["total_work", "family", "total_dependent", "total_study_no_short", "study_short", "total_no_visit", "total_other" ])
    .range(["rgb(237, 0, 0)", "rgb(0, 229, 237)", "rgb(237, 0, 229)", "rgb(157, 224, 76)", "rgb(121, 150, 85)", "rgb(156, 173, 133)", "rgb(186, 196, 174)"]);

var stack = d3.stack()
    .order(d3.stackOrderNone)

var quantize = d3.scaleQuantize()
    .range(["rgb(186, 196, 174)", "rgb(156, 173, 133)", "rgb(121, 150, 85)", "rgb(157, 224, 76)",  "rgb(237, 0, 229)", "rgb(0, 229, 237)", "rgb(237, 0, 0)"]);

var svg = d3.select("svg");

svg.append("g")
    .attr("class", "legendQuant")
    .attr("transform", "translate(825,35)");

var legendQuant = d3.legendColor()
    .shapeWidth(30)
    .shapeHeight(60)
    .cells(7)
    .orient("vertical")
    .labels(["Other", "Visit", "Short Term Study", "Long Term Study", "Dependent", "Family","Work"])
    .scale(quantize)

svg.select(".legendQuant")
    .call(legendQuant);
    
d3.csv("visa_totals_type_totals.csv", function(d, i, columns) {
//    console.log(d, columns);
    let [a, b, ...cols] = columns;
    d.total = 0;
    cols.forEach(col => {
        d.total += +d[col];
    });
    console.log(d.Quarter, d.total);
  d.Quarter = parseTime(d.Quarter);
    console.log(d.Quarter);
  return d;
}, function(error, data) {
    let barw = width / data.length - 18;
  if (error) throw error;

  var keys = data.columns.slice(1);
    console.log(keys);

  data.sort(function(a, b) { return b.total - a.total; });
    
    var stacked = stack.keys(keys)(data);
  x.domain(d3.extent(data.map(function(d) { return d.Quarter; })));
    console.log(x.domain());
  y.domain([0, d3.max(stacked, function(d) {console.log(d); return +d[0][1]; })]).nice();
    console.log(y.domain());
    console.log(y.range());
  z.domain(keys);
    console.log(data);
    console.log(d3.stack().keys(keys)(data))

  g.append("g")
    .selectAll("g")
    .data(stacked)
    .enter().append("g")
      .attr('id', d => d.key)
      .attr("fill", function(d) { return z(d.key); })
    .selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return x(d.data.Quarter); })
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) { return y(+d[0]) - +y(d[1]); })
      .attr("width", barw)
        .attr('id', d => fmtdate(d.data.Quarter));

  g.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).ticks(null, "s"))
    .append("text")
      .attr("x", 2)
      .attr("y", y(y.ticks().pop()) + 1.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text("Total Visas granted");

 /* var legend = g.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice().reverse())
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", z);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });*/
});
}

stuff();