var d3;
var Promise;

//Width and height
var w = 1000;
var h = 700;

var margin = {left: 20, right: 200, top: 30, bottom: 50} // margin/positioning objects
var shift = {left: 600, top: 550}

var imgScale = d3.scaleSequential(d3.interpolateBlues) // Color scale for individuals, blue

//Create SVG element
var svg = d3.select("body") // set up the canvas
            .append("svg")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom);

var chart_group = svg.append('g') // group for the map
    .attr('id', 'window')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

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
    console.log(quarterly);
    let [columns, ...lines] = quarterly.split('\n');
    console.log(columns);
    console.log(lines);
    let years = {}
    let years_l = [];
    for (line of lines) {
        let [time, ...values] = line.split(',');
        let year = /\d{4}/.exec(time)[0];
        let quarter = /Q\d/.exec(time)[0];
//        console.log(year, quarter, values);
        
        if (years[year]) {
            if (years[year][quarter]) {
                years[year][quarter].push(values);
            } else {
                years[year][quarter] = [];
            }
        } else {
            years[year] = {};
        }
//        let year = line.match(/\d{4}/);
//        console.log(year);
//        let quarter = line.match()
    }
        console.log(years);
})
