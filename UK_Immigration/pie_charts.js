//immigrant_population_data.csv
var d3;
var Promise;
var console;
var csv = Promise.promisify(d3.csv);


var pie_data;
var chart_data$ = csv('immigrant_population_data.csv');

var pie_width = 250,
    pie_height = 250,
    radius = Math.min(pie_width, pie_height) / 1.25;

var pie_margin = {
    top: 20,
    bottom: 20,
    left: 10,
    right: 0
};

var percent_format = d3.format('.2%');
var comma_format = d3.format(",");

var pie_color = d3.scaleOrdinal()
    .domain(["United Kingdom", "Sub-Saharan Africa", "EU 8",    "EU 14",   "South Asia", "Other"])
    .range( ["40444a",         "#AEC7E8",            "#8C564B", "#9467BD", "#D62728",    "#C7C7C7" ]);

 var pie = d3.pie()
        //.sort(null)
        .value(function(d) { return d.percent; });



//var svg = d3.select('#pie_charts')

Promise.all([chart_data$]) // Flatten promises, read data
    .then(([chart_data]) => {
    
    for (var row in chart_data) {
        if (row != "columns"){
            for (var col in chart_data[row]){
                chart_data[row][col] = +chart_data[row][col];
            }
        }
    }
    
    pie_data = chart_data;
    pie_chart(chart_data,0);
    pie_chart(chart_data,6);
    pie_chart(chart_data,12);
}).catch(error => {//Catch any error from inside the promise chain
    console.error(error)
});

function midAngle(d) {
    return d.startAngle + (d.endAngle - d.startAngle) / 2;
}

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
        .innerRadius(radius * 0.275);

    var outerArc = d3.arc()
        .outerRadius(radius * 0.9)
        .innerRadius(radius * 0.9);

   
    
    //gonna have to do some dynamic posititioning
    var svg = d3.select('#pie_charts')
    //.select("body").append("svg")
        .append('svg')
        .attr("id","pie")
        .attr("display", "inline-block")
        .attr("width", pie_width+pie_margin.right + pie_margin.left)
        .attr("height", pie_height)
      .append("g")
        .attr("transform", "translate("+ pie_width/2 +","+ pie_height/2 +")");

    var g = svg.selectAll(".arc")
        .data(pie(data2))
      .enter().append("g")
        .attr("class", "arc");

    var tooltip = d3.select('#pie_charts')
        .append('div')                             
        .attr('class', 'tooltip');                 

    tooltip.append('div')                        
        .attr('class', 'category');                   

    tooltip.append('div')                        
        .attr('class', 'count');                   

    tooltip.append('div')                        
        .attr('class', 'percent');
    
    g.append("path")
        .data(pie(data2))
        .attr("d", arc)
        .style("fill", function(d) { 
            //console.log(d);
            return pie_color(d.data.category); })
        .on('mouseover', function(d) {
            console.log(d);
            tooltip.select('.category').html("Origin: " + d.data.category);
            tooltip.select('.count').html("Population: "+comma_format(+(d.data.percent*total*1000)));
            tooltip.select('.percent').html("Percent: "+percent_format(d.data.percent));
            tooltip.style('display', 'block');
        })
        .on('mouseout', function() {tooltip.style('display', 'none');})
        .on('mousemove', function(d) {
			tooltip.style('top', (d3.event.layerY + 10) + 'px')
			.style('left', (d3.event.layerX - 25) + 'px');
		})
        ;
    g.append("text")
        .attr("text-anchor", "middle")
        .attr('font-size', '20em')
        .attr('y', -5)
        .text(row["Year"]);
    
    g.append("text")
        .attr('y', 15)
        .text("Population");
    
    svg.append("g")
        .attr("class", "labels");
           
    svg.append("g")
        .attr("class", "lines");
    
    /*
    var legendRectSize = 18;
    var legendSpacing = 4;
    
    var legend = svg.selectAll('.legend')
        .data(pie_color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
            //console.log(pie_color.domain());
            var height = legendRectSize + legendSpacing;
            var offset =  height * pie_color.domain().length / 2;
            var horz = -2 * legendRectSize - 25;
            var vert = i * height - offset;
            return 'translate(' + horz + ',' + vert + ')';
        });
        
    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', pie_color)
        .style('stroke', pie_color);

    //row["Year"]
    
    legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function(d) { 
            //console.log(d);
            return d; });
    */
    
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

/*
function updateData() {
    if(typeof updateData.counter=='undefined'){updateData.counter = 6;}
    if (updateData.counter < 13){
        pie_chart(pie_data, updateData.counter);
        updateData.counter=updateData.counter+6;
    }
}
*/