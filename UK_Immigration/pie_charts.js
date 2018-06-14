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
    .range( ["#00247D",         "#AEC7E8",            "#8C564B", "#9467BD", "#D62728",    "#C7C7C7" ]);

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
    var p1_data = [];
    var p2_data = [];

    //console.log(data.columns);
    var total = row["Total"];
    //console.log(total);
    //p1_data.push(0)
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
            p1_data.push({category: col_name,
                        percent:row[col_name]/total,
                        //year: row["Year"]
                         })
        }else if (col_name != "Year" && col_name != "Total"){
            other.percent = other.percent + row[col_name]/total;
        }
    }p1_data.push(other);

    var arc = d3.arc()
        .outerRadius(radius * 0.5)
        .innerRadius(radius * 0.175);

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
        .data(pie(p1_data))
      .enter().append("g")
        .attr("class", "arc");

    var tooltip = d3.select('#pie_charts')
        .append('div')                             
        .attr('class', 'tooltip');                 

    tooltip.append('div')                        
        .attr('class', 'category')
        //.style('display','table-cell')
        .style('font-family', 'monospace')
        //.style('display','inline-block')
        ;

    tooltip.append('div')                        
        .attr('class', 'count')
        .style('font-family', 'monospace')
        //.style('display','table-cell')
        //.style('display','inline-block')
    ;

    tooltip.append('div')                        
        .attr('class', 'percent')
        .style('font-family', 'monospace')
        //.style('display','table-cell')
        //.style('display','inline-block')
    ;
    
    g.append("path")
        .data(pie(p1_data))
        .attr("d", arc)
        .style("fill", function(d) { 
            //console.log(d);
            return pie_color(d.data.category); })
        .on('mouseover', function(d) {
            console.log(d);
            tooltip.select('.category').html("Origin&nbsp&nbsp&nbsp&nbsp&nbsp" + ": " + d.data.category);
            tooltip.select('.count').html("Population&nbsp" + ": "+ comma_format(+(d.data.percent*total*1000)));
            tooltip.select('.percent').html( "Percent&nbsp&nbsp&nbsp&nbsp: " + percent_format(d.data.percent));
            tooltip.style('display', 'block');
        })
        .on('mouseout', function() {tooltip.style('display', 'none');})
        .on('mouseout', function() {tooltip.style('display', 'none');})
        .on('mousemove', function(d) {
			tooltip.style('top', (d3.event.layerY + 10) + 'px')
			.style('left', (d3.event.layerX - 25) + 'px');
		})
        ;
    g.append("text")
        .attr("text-anchor", "middle")
        .attr('font-size', '20em')
        .attr('y', 5)
        .text(row["Year"]);
    /*
    g.append("text")
        .attr('y', 15)
        .text("Population");
    */
    svg.append("g")
        .attr("class", "labels");
           
    svg.append("g")
        .attr("class", "lines");
    
}