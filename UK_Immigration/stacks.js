var d3;
var Promise;

//Width and height
var w = 1000;
var h = 700;

var margin = {left: 20, right: 200, top: 30, bottom: 50} // margin/positioning objects
var shift = {left: 600, top: 550}

var imgScale = d3.scaleSequential(d3.interpolateBlues) // Color scale for individuals, blue
var stack = d3.stack()
              .order(d3.stackOrderDescending);
//Create SVG element
var svg = d3.select("body") // set up the canvas
            .append("svg")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom);

var chart_group = svg.append('g') // group for the map
    .attr('id', 'window')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

var qMap = {
    Q1: '03',
    Q2: '06',
    Q3: '09',
    Q4: '12'
}

var parsedate = d3.timeParse('%Y-%m-%d'); // time and date parsing and formatting
var fmtdate = d3.timeFormat('%b %d, %Y');

// bluebirdjs promise magic
var json = Promise.promisify(d3.json); // Now they're promises instead of callback
var csv = Promise.promisify(d3.csv);
var fetchAsText = Promise.promisify(d3.text);

var L2$ = json ('britain.json') // promise which will resolve to the map json

function rowTransformer(row) {
    console.log(row);
    return row;
}

var quarterly$ = fetchAsText('visas_filtered_georegions.csv')

quarterly$.then(quarterly => {
//    console.log(quarterly);
    let [columns, ...lines] = quarterly.split('\n');
    let regions = [];
    console.log(columns);
    [_, _, ...columns] = columns.split(',');
//    console.log(lines);
    let years = [];
    let index = 0;
    for (line of lines) {
        let [time, region, ...values] = line.split(',');
        if (regions.indexOf(region) === -1) {
            regions.push(region);
        }
        
        let year = /\d{4}/.exec(time)[0];
        let quarter = /Q\d/.exec(time)[0];
        
        let date = year + '-' + qMap[quarter];
//        console.log(date);
        if (!years[index]) {
            years[index] = {date: date};
        } else if (years[index].date !== date) {
            index++;
            years[index] = {date: date};
        }
        years[index][region] = {};
        for (let i = 0; i < columns.length; i++) {
            years[index][region][columns[i]] = values[i];
        }
    }
    console.log(columns, regions)
    console.log(years);
    
    function setType(type) { // from the D3 book, ch16
        stack.keys(regions)
            .value((d, key) => d[key][type])
    }
    setType(columns[0]);
    
    var series = stack(years);
    console.log(series);
    
    xScale = d3.scaleTime()
               .domain([
                    d3.min(years, function(d) { return d.date; }),
                    d3.max(years, function(d) { return d.date; })
                ])
               .range([margin.left, w - margin.right * 2]);
    
    function setYScale(type) {
        yScale = d3.scaleLinear()
            .domain([0, d3.max(years, (y) => {
                let a = d3.max(regions, (r) => {
                    return y[r][type]
                })
                console.log(a);
                return a;
            })])
            .range([h - margin.bottom, margin.top / 2])
            .nice();
    }
    setYScale(columns[0]);
    console.log(yScale.domain());
//    yScale = d3.scaleLinear()
//                .domain([
//                    0,
//                    d3.max(years, function(d) {
//                        var sum = 0;
//
//                        //Loops once for each row, to calculate
//                        //the total (sum) of sales of all vehicles
//                        for (var i = 0; i < regions.length; i++) {
//                            sum += d[regions[i]].sales;
//                        };
//
//                        return sum;
//                    })
//                ])
//                .range([h - padding, padding / 2])
//                .nice();

    //Define axes
    xAxis = d3.axisBottom()
               .scale(xScale)
               .ticks(10)
               .tickFormat(fmtdate);

    //Define Y axis
    yAxis = d3.axisRight()
               .scale(yScale)
               .ticks(5);

    //Define area generator
    area = d3.area()
                .x(function(d) {console.log(d); return xScale(d.data.date); })
                .y0(function(d) {console.log(yScale(d[0])); return yScale(d[0]); })
                .y1(function(d) {console.log(yScale(d[1])); return yScale(d[1]); });
    
    chart_group.selectAll('.visa')
        .data(series)
        .enter()
        .append('path')
        .attr('class', 'visa')
        .attr('d', area)
        .attr('fill', (d,i) => d3.schemeCategory20[i])
        .append("title")  //Make tooltip
        .text(function(d) {
            return d.key;
        });

}).catch(error => {console.error(error)});
