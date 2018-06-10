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

var popLine = d3.line()
    .x(d => {console.log(d); return d})
    .y(d => {console.log(d); return d})
//Create SVG element
var svg = d3.select("body") // set up the canvas
            .append("svg")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom);

var stacked_area = svg.append('g') // group for the map
    .attr('id', 'window')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

var qMap = {
    Q1: '03',
    Q2: '06',
    Q3: '09',
    Q4: '12'
}

var parsedate = d3.timeParse('%Y-%m'); // time and date parsing and formatting
var fmtdate = d3.timeFormat('%b %d, %Y');

// bluebirdjs promise magic
var json = Promise.promisify(d3.json); // Now they're promises instead of callback
var csv = Promise.promisify(d3.csv);
var fetchAsText = Promise.promisify(d3.text);

var L2$ = json ('britain.json') // promise which will resolve to the map json

function popTransform(row) {
    console.log(row);
    return row;
}

var quarterly$ = fetchAsText('visas_filtered_georegions.csv')
var pop$ = csv('britain_pop_projections.csv', popTransform)
Promise.all([quarterly$, pop$]).then(([quarterly, pop]) => {
    console.log(pop);
//quarterly$.then(quarterly => {
//    console.log(quarterly);
    let [columns, ...lines] = quarterly.split('\n');
    let regions = [];
    console.log(columns);
    [_, _, ...columns] = columns.split(',');
//    console.log(lines);
    let years = [];
    let totals = [];
    let index = 0;
    for (line of lines) { // crunch the csv file line by line
        let [time, region, ...values] = line.split(',');
        
        let year = /\d{4}/.exec(time)[0];
        let quarter = /Q\d/.exec(time)[0];
        
        let date = year + '-' + qMap[quarter];
        
        
        
//        console.log(date);
        if (!years[index]) {
            years[index] = {date: date};
            totals[index] = {date: date};
        } else if (years[index].date !== date) {
            index++;
            years[index] = {date: date};
            totals[index] = {date: date};
        }
        
        
        if (region === 'Total') {
            totals[index][region] = {total: values[0]};
//            totals[index][region]['total'] = values[0];
        } else {
            if (regions.indexOf(region) === -1) {
                regions.push(region);
            }
            years[index][region] = {};
            for (let i = 0; i < columns.length; i++) {
                years[index][region][columns[i]] = values[i];
            }
        }
    }
    console.log(columns, regions)
    console.log(totals, years);
    
    // this function just picks which column to draw for the area chart
    function setType(type) { // from the D3 book, ch16
        stack.keys(regions)
            .value((d, key) => {console.log(d, key); return d[key][type];})
    }
    setType(columns[0]); // set it to Totals
    
    var series = stack(years);
    console.log(series);
    
    xScale = d3.scaleTime()
               .domain([
                    d3.min(years, function(d) { return parsedate(d.date); }),
                    d3.max(years, function(d) { return parsedate(d.date); })
                ])
               .range([margin.left, w - margin.right * 2]);
    console.log(xScale.domain());
    
    function setYScale(type) {
        yScale = d3.scaleLinear()
            .domain([0, 5000000])
            .range([h - margin.bottom, margin.top / 2])
            .nice();
    }
    setYScale(columns[0]);
    console.log(yScale.domain());

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
                .x((d) => xScale(parsedate(d.data.date)))
                .y0((d) => yScale(d[0]))
                .y1((d) => yScale(d[1]));
    
    stacked_area.selectAll('.visa')
        .data(series)
        .enter()
        .append('path')
        .attr('class', 'visa')
        .attr('id', (d) => d.key)
        .attr('d', area)
        .attr('fill', (d,i) => d3.schemeCategory20[i])
        .append("title")  //Make tooltip
        .text(function(d) {
            return d.key;
        });
    
    stacked_area.selectAll('#pop')
        .data(pop)
        .enter()
        .append('path')
        .attr('id', 'pop')
        .attr('d', popLine)

}).catch(error => {console.error(error)});
