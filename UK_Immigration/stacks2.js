// Stacks redone
var d3;
var Promise;
/* These are the regions we will draw, everything else gets summed to 'other' during the dataset construction, 
*/
//Width and height
var w = 750;
var h = 450;

var margin = {left: 20, right: 200, top: 30, bottom: 50} // margin/positioning objects
var shift = {left: 600, top: 550}

//Create SVG element
var svg = d3.select("body") // set up the canvas
    .append("svg")
    .attr("width", w + margin.left + margin.right)
.attr("height", h + margin.top + margin.bottom);

var stacked_area = svg.append('g') // group for the map
    .attr('id', 'stacked-area')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

var legend = stacked_area.append('g')
    .attr('id', 'legend')
    .attr('transform', `translate(${w + 50}, 0)`)

var yScale = d3.scaleLinear()
    .range([h, 0])
    .nice();
function setYScale() {
    console.log('Set the y scale');
    yScale.domain([0, d3.max(series, (r) => d3.max(r, q => q[1]))]);
}

var xScale = d3.scaleTime()
    .range([0, w]);

var imgScale = d3.scaleSequential(d3.interpolateBlues) // Color scale for individuals, blue
var stack = d3.stack()
    .order(d3.stackOrderDescending);

//Define area generator
area = d3.area()
            .x((d) => xScale(d.data.date))
            .y0((d) => yScale(d[0]))
            .y1((d) => yScale(d[1]));

//Define axes
xAxis = d3.axisBottom()
           .scale(xScale)
           .ticks(10)
           .tickFormat(fmtdate);

//Define Y axis
yAxis = d3.axisRight()
           .scale(yScale)
           .ticks(5);

let stacks_x = stacked_area.append('g')
    .attr('transform', () => `translate(0, ${h})`)
    .attr('class', 'stacks x-axis');

let stacks_y = stacked_area.append('g')
    .attr('transform', () => `translate(${w}, 0)`)
    .attr('class', 'stacks y-axis')

// this function just picks which column to draw for the area chart
function setType(type) { // from the D3 book, ch16
    console.log('Set the type to ' + type);
    stack.keys(regions)
        .value((d, key) => {
//            console.log(
        return d[key][type];
    })
    series = stack(to_stack);
}

var regions = ["Asia South", "Asia East", "Europe Other", "Africa Sub-Saharan", "Middle East", "Asia South East", "Other"];
var others = [];
var types = []; // will contain the columns

var type_filter = d3.select('#stack_area_type')
    .on('change', () => {
        type = types[d3.event.target.value];
        console.log(d3.event.target.value);
        setType(type);
        setYScale();
        draw_chart();
    });

function build_filter() {
    types.forEach((key, value) => {
        type_filter.append('option')
            .attr('value', value)
            .html(key)
    })
}

var popLine = d3.line()
    .x(d => {console.log(d); return d})
    .y(d => {console.log(d); return d})

function draw_legend(categories, color) {
    let step = h / categories.length;
    console.log(step, h, categories.length);
    let ypos = 0;
    let v_pad = 3;
    categories.forEach((c, i) => {
        legend.append('rect')
            .attr('class', c)
            .attr('x', 0)
            .attr('y', ypos)
            .attr('width', 30)
            .attr('height', step - v_pad)
            .attr('fill', color[i]);
        legend.append('text')
            .attr('class', c)
            .text(c)
            .attr('x', 30)
            .attr('y', ypos + step/2)
            .attr('text-anchor', 'start')
            .attr('fill', 'black');
        ypos += step;
    });
    
}
function draw_chart() {
    console.log('draw chart', series);
    stacks_y.call(yAxis);
    stacked_area.selectAll('.visa').remove();
    stacked_area.selectAll('.visa')
        .data(series)
        .enter()
        .append('path')
        .attr('class', 'visa')
        .attr('id', (d) => d.key)
        .attr('d', area)
        .attr('fill', (d,i) => d3.schemeCategory20[i])
        .append("title")  //Make tooltip
        .text(d => d.key);
}
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

var quarterly$ = csv('visas_filtered_georegions.csv', (row, i, keys) => {
//    console.log(row, i, keys);
    var [year, q] = row.Quarter.split('-');
    row['date'] = parsedate(year + "-" + qMap[q]);
    var [_, _, ...cols] = keys;
    cols.forEach(col => {
        row[col] = +row[col];
    })
    return row;
})
//var pop$ = csv('britain_pop_projections.csv', popTransform)
var series, to_stack;
quarterly$.then((quarterly) => {
    console.log(quarterly);
    let other = {};
    var [_, _, ...cols] = quarterly.columns;
    types = cols;
    console.log(types);
    to_stack = [];
    let index = -1;
    let old_date = '';
    quarterly.forEach(d => {
//        console.log(old_date, d.Quarter)
        if (old_date !== d.Quarter) {
            index++;
            old_date = d.Quarter;
            to_stack[index] = {date: d.date};
        }
        if (d.Region === 'Other') {
            other = d;
            to_stack[index]['Other'] = other;
            return;
        }
        if (regions.indexOf(d.Region) < 0) {
            if (others.indexOf(d.Region) < 0) {
                others.push(d.Region);
            }
            types.forEach(col => {
                other[col] += d[col]
            });
            return;
        }
//        console.log(to_stack, index);
        to_stack[index][d.Region] = {};
        to_stack[index][d.Region] = d;
        return;
    })
    build_filter();
    console.log(others);
    console.log(to_stack);
    console.log('that one');
    console.log(types, regions)
    
    setType(types[0]); // set it to totals
//    stack.keys(types);
    
//    var series = stack(no_totals);
    series = stack(to_stack)
    console.log(series);
    
    xScale.domain(d3.extent(quarterly, d => d.date));
    console.log(xScale.domain());
    
    setYScale(types[0]);
    console.log(yScale.domain());
    
    draw_chart();
//    
//    stacked_area.selectAll('#pop')
//        .data(pop)
//        .enter()
//        .append('path')
//        .attr('id', 'pop')
//        .attr('d', popLine)
    
    stacks_x.call(xAxis)
        .call(xAxis)
        .selectAll('text')
        .attr('text-anchor', 'start')
        .attr('transform', 'rotate(30)');
    
    draw_legend(regions, d3.schemeCategory20)
    
}).catch(error => {console.error(error)});
