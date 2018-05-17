var d3;
var Promise;

//Width and height
var w = 700;
var h = 850;

var margin = {left: 20, right: 200, top: 5, bottom: 50}
var shift = {left: 600, top: 600}

//Define map projection
var projection = d3.geoMercator()

//Define path generator
var path = d3.geoPath().projection(projection);

var indScale = d3.scaleSequential(d3.interpolateBlues)
var HHScale = d3.scaleSequential(d3.interpolatePurples)

var color_legend = d3.legendColor()
    .shapeWidth(30)
    .cells(10)
    .ascending(true)
    .scale(indScale);

var province_color = d3.scaleOrdinal(d3.schemeCategory20b);

//Create SVG element
var svg = d3.select("body")
            .append("svg")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom);

var province_g = svg.append('g')
    .attr('class', 'borders')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

var legend_g = svg.append('g')
    .attr('id', 'legend')
    .attr('transform', `translate(${shift.left + margin.left}, ${margin.top + 40})`);

var selector = d3.select('#selector')
    .style('left', `${shift.left + margin.left}px`)
    .style('top', `${shift.top + margin.top}px`)

var info = d3.select('body').append('div')
    .attr('class', 'info')
    .style('left', `${shift.left + margin.left - 10}px`)
    .style('top', `${shift.top + margin.top + 20}px`)
    .html('<h3>Mouse over map for information</h3>')

function set_info(row) {
    var title = row['Admin 2'];
    var subtitle = row['Admin 1'];
    var date = row['Survey Date (dd-MMM-yyyy)'];
    var household = row['HH'];
    var individual = row['Ind'];
    info.html('<h1>' + title + ' Commune</h1>'
              + '<h2>' + subtitle + ' Province</h2>'
              + '<h3>Surveyed ' + date + '</h3>'
              + `${individual} total displaced individuals present, `
              + `${household} total displaced households.`);
}

function clear_info() {
    info.html('');
}

// bluebirdjs promise magic
var json = Promise.promisify(d3.json); // Now they're promises instead of callback
var csv = Promise.promisify(d3.csv);

var L2$ = json ('Burundi_Admin_2_Communes.json')

function transformData(row) {
    row['Ind'] = +row['Ind'];
    row['HH'] = +row['HH'];
    return row;
}

var data$ = csv('dtm-burundi-baseline-assessment-round-25.csv', transformData)

function draw_province(p_name, features, which) {
    console.log(p_name, features, which);
    
    const province = province_g.select(`#${p_name.replace(' ', '-')}`);
    const data = features.names.map(name => features[name]);
        
    province.selectAll('.commune')
        .data(data)
        .enter()
        .append('path')
        .attr('class', d => {
            console.log(d);
            return 'commune'; })
        .attr('id', d => d.geo.properties.Communes)
        .attr('d', d => path(d.geo))
        .on('mouseover', d => {
            d3.select(d3.event.target).style('stroke', () => province_color(name));
            set_info(d.data);
        })
        .on('mouseout', _ => {
            d3.select(d3.event.target).style('stroke', '');
            clear_info();
        });
    
    color_province(p_name, features, which);
}

function color_province(p_name, features, which) {
    const province = province_g.select(`#${p_name.replace(' ', '-')}`);
    const data = features.names.map(name => features[name]);
    
    const color_scale = (which === 'HH') ? HHScale : indScale;
    const legend_title = 'Displaced ' + ((which === 'HH') ? 'households' : 'individuals')
    console.log(which)
    
    province.selectAll('.commune')
        .data(data)
        .attr('fill', d => color_scale(d.data[which]));
    
    color_legend.scale(color_scale)
        .title(legend_title);
    legend_g.call(color_legend);
}

Promise.all([L2$, data$]) // Flatten promises, read data
    .then(([L2, data]) => {
    let provinces = {};
    let names = [];
    
    indScale.domain(d3.extent(data, row => row['Ind']));
    HHScale.domain(d3.extent(data, row => row['HH']));
    
    L2.features.forEach((feature) => {
        p_name = feature.properties['Provinces']
        c_name = feature.properties['Communes']
        
        idp = data.find(row => {
            return row['Admin 2'] === c_name;
        })
        
        if (!provinces[p_name]) {
            provinces[p_name] = {}
            provinces[p_name]['name'] = p_name;
            provinces[p_name]['names'] = []
            names.push(p_name);
        }
        provinces[p_name]['names'].push(c_name);
        provinces[p_name][c_name] = {geo: feature, data: idp};
    })    
    
    projection.fitExtent([[0, 10], [w, h]], L2);
        
    province_g.selectAll('.province')
        .data(names.map((name) => provinces[name]))
        .enter()
        .append('g')
        .attr('class', 'province')
        .attr('id', d => d.name.replace(' ', '-'));
    
    function draw(which) {
        names.forEach(name => {
            draw_province(name, provinces[name], which);
        })
    }
    
    function color(which) {
        names.forEach(name => {
            color_province(name, provinces[name], which);
        }) 
    }
    
    draw('Ind');
    
    selector.on('change', _ => {
            console.log(d3.event.target.value);
            color(d3.event.target.value);
        })
}).catch(error => {
    console.error(error)
});

