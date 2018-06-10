//immigrant_population_data.csv
var d3;
var Promise;
var console;
var csv = Promise.promisify(d3.csv);


var pie_data;
var chart_data$ = csv('immigrant_population_data.csv');

var width = 960,
    height = 500,
    radius = Math.min(width, height) / 2;

var margin = {
    top: 80,
    bottom: 80,
    left: 120,
    right: 120,
};

var pformat = d3.format('.2%');

var color = d3.scaleOrdinal()
    .domain(["United Kingdom", "Sub-Saharan Africa", "EU 8", "EU 14", "South Asia", "Other"])
    .range(["40444a","#98abc5", "#8a89a6", "#7b6888", "6a5489", "3b911a" ]);

 var pie = d3.pie()
        //.sort(null)
        .value(function(d) { return d.percent; });

function midAngle(d) {
    return d.startAngle + (d.endAngle - d.startAngle) / 2;
}

Promise.all([chart_data$]) // Flatten promises, read data
    .then(([chart_data]) => {
    
    for (var index in chart_data) {
        if (index != "columns"){
            for (var inner in chart_data[index]){
                chart_data[index][inner] = +chart_data[index][inner];
                //console.log(typeof(data[index][inner]));
            }
        }
    }
    
    pie_data = chart_data;
    pie_chart(chart_data,0);    
}).catch(error => { // Catch any error from inside the promise chain
    console.error(error)
});

//pass a index and will make a pie chart from the row at that index
function pie_chart(data, index) {
    //console.log("piechartcall")
    var row = data[index]
    var data2 = [];

    //console.log(data.columns);
    var total = row["Total"];
    //console.log(total);
    //data2.push(0)
    var col_name;
    var other = {category: 'Other', percent: 0, year: row["Year"]};
    for (var col in data.columns){
        col_name=data.columns[col];        
        if (col_name === "EU 14" ||
            col_name === "EU 8" ||
            col_name === "South Asia" ||
            col_name === "Sub-Saharan Africa" ||
            col_name === "United Kingdom"
            ){   
            data2.push({category: col_name,
                        percent:row[col_name]/total,
                        year: row["Year"]})
        }else if (col_name != "Year" && col_name != "Total"){
            other.percent = other.percent + row[col_name]/total;
        }
    }data2.push(other);

    var arc = d3.arc()
        .outerRadius(radius * 0.6)
        .innerRadius(0);

    var labelArc = d3.arc()
        .outerRadius(radius * 0.4)
        .innerRadius(radius);

   
    
    //gonna have to do some dynamic posititioning
    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", "translate("+ width/2 +","+ height/2 +")");

    var g = svg.selectAll(".arc")
        .data(pie(data2))
      .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d) { 
            //console.log(d);
            return color(d.data.percent); });
    
    svg.append("g")
        .attr("class", "labels");
    
    var text = svg.select(".labels")
                .selectAll("text")
                //.data(pie(pie_data))
                .data(pie(data2));

        text
            .enter()
            .append("text")
            .attr('class', 'label')
            .attr('id', function(d, j) {
                return 'l-' + j;
            })
            .attr("transform", function(d) {
                //console.log(d);
                var pos = labelArc.centroid(d);
                console.log(pos);
                pos[0] = radius * (midAngle(d) < Math.PI ? 1 : -1);
                console.log(pos);
                return "translate(" + pos + ")";
            })
            .style("text-anchor", function(d) {
                return midAngle(d) < Math.PI ? "start" : "end";
            })
            .attr("dy", ".35em")
            .attr("dx", ".35em")
            .attr("fill", "#111")
            .text(function(d) {
                //return d.data.key +" ("+ pformat(d.data.value) +")";
                console.log(d.data)
                return d.data.category +" ("+ pformat(d.data.percent) +")";
            })
            .call(wrap, margin.right - 20)
            ;
    
        arrangeLabels(svg, ".label");
        
        svg.append("g")
            .attr("class", "lines");
        
        var polyline = svg.select(".lines")
            .selectAll("polyline")
            .data(pie(data2));
    
        polyline.enter()
            .append("polyline")
            .attr("points", function(d, j) {
                var offset = midAngle(d) < Math.PI ? 0 : 10;
                var label = d3.select('#l-' + j);
                var transform = getTransformation(label.attr("transform"));
                var pos = labelArc.centroid(d);
                pos[0] = transform.translateX + offset;
                pos[1] = transform.translateY;
                var mid = labelArc.centroid(d);
                mid[1] = transform.translateY;
                return [arc.centroid(d), mid, pos];
            });
    
    /*
    g.append("text")
        .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .text(function(d) { 
            //console.log(d.data.category);
            return (d.data.category); });
    //.toFixed(2)
    */
}






function updateData() {
    if(typeof updateData.counter=='undefined'){updateData.counter = 0;}
    if (updateData.counter < 13){
        pie_chart(pie_data, updateData.counter);
        updateData.counter++;
    }
}
    
function wrap(text, width) {
    text.each(function() {
        var text = d3.select(this);
        var words = text.text()
            .split(/\s+/)
            .reverse();
        var word;
        var line = [];
        var lineHeight = 1;
        var y = 0 //text.attr("y");
        var x = 0;
        var dy = parseFloat(text.attr("dy"));
        var dx = parseFloat(text.attr("dx"));
        var tspan = text.text(null)
            .append("tspan")
            .attr("x", x)
            .attr("y", y);
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node()
                .getComputedTextLength() > width - x) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                    .attr("x", x)
                    .attr("dy", lineHeight + "em")
                    .attr("dx", dx + "em")
                    .text(word);
            }
        }
    });
}

function arrangeLabels(selection, label_class) {
    var move = 1;
    while (move > 0) {
        move = 0;
        selection.selectAll(label_class)
            .each(function() {
                var that = this;
                var a = this.getBoundingClientRect();
                selection.selectAll(label_class)
                    .each(function() {
                        if (this != that) {
                            var b = this.getBoundingClientRect();
                            if ((Math.abs(a.left - b.left) * 2 < (a.width + b.width)) && (Math.abs(a.top - b.top) * 2 < (a.height + b.height))) {
                                var dx = (Math.max(0, a.right - b.left) + Math.min(0, a.left - b.right)) * 0.01;
                                var dy = (Math.max(0, a.bottom - b.top) + Math.min(0, a.top - b.bottom)) * 0.02;
                                var tt = getTransformation(d3.select(this)
                                    .attr("transform"));
                                var to = getTransformation(d3.select(that)
                                    .attr("transform"));
                                move += Math.abs(dx) + Math.abs(dy);

                                to.translate = [to.translateX + dx, to.translateY + dy];
                                tt.translate = [tt.translateX - dx, tt.translateY - dy];
                                d3.select(this)
                                    .attr("transform", "translate(" + tt.translate + ")");
                                d3.select(that)
                                    .attr("transform", "translate(" + to.translate + ")");
                                a = this.getBoundingClientRect();
                            }
                        }
                    });
            });
    }
}

function getTransformation(transform) {
    /*
     * This code comes from a StackOverflow answer to a question looking
     * to replace the d3.transform() functionality from v3.
     * http://stackoverflow.com/questions/38224875/replacing-d3-transform-in-d3-v4
     */
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");

    g.setAttributeNS(null, "transform", transform);
    var matrix = g.transform.baseVal.consolidate()
        .matrix;

    var {
        a,
        b,
        c,
        d,
        e,
        f
    } = matrix;
    var scaleX, scaleY, skewX;
    if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
    if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
    if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
    if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
    return {
        translateX: e,
        translateY: f,
        rotate: Math.atan2(b, a) * Math.PI / 180,
        skewX: Math.atan(skewX) * Math.PI / 180,
        scaleX: scaleX,
        scaleY: scaleY
    };
}