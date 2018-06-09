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

var color = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888"]);

Promise.all([chart_data$]) // Flatten promises, read data
    .then(([chart_data]) => {
    //console.log(data);
    pie_chart(chart_data,0);
    pie_data = chart_data;
    
    
}).catch(error => { // Catch any error from inside the promise chain
    console.error(error)
});

//pass a index and will make a pie chart from the row at that index
function pie_chart(data, index) {
    //console.log("piechartcall")
    var row = data[index]
    var data2 = [];
    for (var index in data) {
        //console.log(index)
        if (index != "columns"){
            for (var inner in data[index]){
                data[index][inner] = +data[index][inner];
                //console.log(typeof(data[index][inner]));
            }
        }
    }
    //console.log(data.columns);
    var total = row["Total"];
    //console.log(total);
    //data2.push(0)
    var col_name;
    var other = {category: 'Other', percent: 0};
    for (var col in data.columns){
        col_name=data.columns[col];
        /*
        if (data.columns[col] === "Year" || 
            data.columns[col] === "Total")
        {
            //console.log(data[0][data.columns[col]])  
        } else 
        */
        
        if (col_name === "EU 14" ||
            col_name === "EU 8" ||
            col_name === "South Asia" ||
            col_name === "Sub-Saharan Africa" ||
            col_name === "United Kingdom"
            )
        {   
            data2.push({category: col_name, percent:row[col_name]/total*100})
            //console.log(row[col_name]/total*100)
            //data2.push(row[col_name]/total*100);
            //data2[col_name] = row[col_name]/total*100;
        }else if (col_name != "Year" & 
                  col_name != "Total")
        {
            //sum up other crap here
            
            other.percent = other.percent + row[col_name]/total*100;
        }
    }
    data2.push(other);
        
    console.log(data2);
    var arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var labelArc = d3.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

    var pie = d3.pie()
        //.sort(null)
        .value(function(d) { console.log(+d.percent); return d.percent; });
    
    //gonna have to do some dynamic posititioning
    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var g = svg.selectAll(".arc")
        .data(pie(data2))
      .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d) { 
            console.log(d);
            return color(d.data.percent); });

    g.append("text")
        .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .text(function(d) { 
            //console.log(d.data.category);
            return (d.data.category); });//.toFixed(2)
    }//console.log(data);
   
function updateData() {
    if( typeof updateData.counter == 'undefined' ) {
        updateData.counter = 0;
    }
    if (updateData.counter < 13){
        console.log(pie_data)
        pie_chart(pie_data, updateData.counter);
        updateData.counter++;
    }
}
