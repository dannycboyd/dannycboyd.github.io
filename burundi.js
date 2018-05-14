var d3;
var Promise;

//Width and height
var w = 500;
var h = 850;

//Define map projection
var projection = d3.geoAlbersUsa()
                       .translate([900, h/2])
                       .scale([2000]);

//Define path generator
var path = d3.geoPath()
                 .projection(projection);

var purple = d3.interpolatePurples;
var color = d3.scaleLinear()
    .rangeRound([100, 255]);

var colorScale = d3.scaleSequential(d3.interpolateInferno)

//Create SVG element
var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

var border_g = svg.append('g')
    .attr('class', 'borders');

var label_g = svg.append('g')
    .attr('class', 'labels');

// bluebirdjs promise magic
var json = Promise.promisify(d3.json); // Now they're promises instead of callback
var csv = Promise.promisify(d3.csv);

var burundi$ = json('burundi2.json') // Create promises with our two data files
var borders$ = json('gadm36_BDI_0.json')

function csv_transform(row) {
    
}
var pop$ = csv('bi_pop_districts.csv')

Promise.all([burundi$, borders$, pop$]) // Flatten promises, read data
    .then(([burundi, borders, pop]) => {
    
    burundi.features.forEach((prov, i) => {
        let properties = prov.properties;
        
        properties['lat'] = +pop[i].lat;
        properties['lon'] = +pop[i].lon;
        
        properties['population'] = +pop[i].pop
        properties['area'] = +pop[i].area // in km^2
        if(properties.area) {
            properties['ratio'] = properties.population / properties.area;
        }
    })
    
    
    let foo = burundi.features.map(d => d.properties.ratio)
    console.log(foo)
    let bar = foo.sort((a,b) => {
        console.log(a, b, a > b)
        return a > b;
    })
    console.log(bar);
    let extent = d3.extent(burundi.features, feature => feature.properties.ratio);
    console.log(extent);
    console.log(d3.schemeReds);
    color.domain(extent);
    colorScale.domain(extent);
    console.log(d3.range(0, 255, 50).map(d => colorScale(d)))
    
    console.log(burundi);
    console.log(pop);

    
    var projection2 = d3.geoMercator()
        .fitExtent([[0, 10], [w, h]], burundi)
//    .fitWidth(500, cali);
    
    var path2 = d3.geoPath().projection(projection2);
    
    border_g.selectAll('path')
        .data(burundi.features)
        .enter()
        .append('path')
        .attr('class', 'province')
        .attr('d', path2)
        .attr('id', d => d.properties['NAME_1'])
        .attr('stroke', 'blue')
//        .attr('fill', d => `rgb(60, 120, ${color(d.properties['ratio'])})`)
        .attr('fill', d => colorScale(d.properties['ratio']))
        .filter(d => !d.properties['ratio'])
        .attr('class', 'province unknown')
    
    label_g.selectAll('.label')
        .data(burundi.features)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => projection2([d.properties.lon, d.properties.lat])[0])
        .attr('y', d => projection2([d.properties.lon, d.properties.lat])[1])
        .attr('text-anchor', 'center')
        .text(d => d.properties['NAME_1'])
        .attr('fill', 'white');
});

