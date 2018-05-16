var d3;
var Promise;

//Width and height
var w = 700;
var h = 850;

//Define map projection
var projection = d3.geoMercator()

//Define path generator
var path = d3.geoPath()
                 .projection(projection);

var colorScale = d3.scaleSequential(d3.interpolateInferno)
var color = d3.scaleThreshold()
    .domain([1, 150, 350, 450, 8500, 10000])
    .range(d3.schemeOrRd[6])

var province_color = d3.scaleOrdinal(d3.schemeCategory20b);

//Create SVG element
var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

var province_g = svg.append('g')
    .attr('class', 'borders');

var label_g = svg.append('g')
    .attr('class', 'labels');

var city_g = svg.append('g')
    .attr('class', 'cities');

// bluebirdjs promise magic
var json = Promise.promisify(d3.json); // Now they're promises instead of callback
var csv = Promise.promisify(d3.csv);

var L2$ = json ('Burundi_Admin_2_Communes.json')

var data$ = csv('dtm-burundi-baseline-assessment-round-25.csv')

function draw_province(name, features) {
    console.log(name, features);
    
    const province = province_g.append('g')
        .attr('class', name);
        
    province.selectAll('.commune')
        .data(features.names.map(name => features[name]))
        .enter()
        .append('path')
        .attr('class', 'commune')
        .attr('id', d => d.geo.properties.Communes)
        .attr('id', d => d.geo.properties.Communes)
        .attr('d', d => path(d.geo))
        .style('stroke', province_color(name))
        .on('mouseover', d => {
            d3.select(d3.event.target).style('fill', () => province_color(name));
            set_info(d.data);
        })
        .on('mouseout', _ => {
            d3.select(d3.event.target).style('fill', '');
            clear_info();
        });
}

var info = d3.select('body').append('div')
    .attr('class', 'info')
    .html('')
    .style('left', 500 + 'px') // Float it at the x/y of the event
    .style('top', 700 + 'px');

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

Promise.all([L2$, data$]) // Flatten promises, read data
    .then(([L2, data]) => {
    let provinces = {};
    let names = [];
    
    console.log(L2);
    
    L2.features.forEach((feature) => {
        p_name = feature.properties['Provinces']
        c_name = feature.properties['Communes']
        
        idp = data.find(row => {
            return row['Admin 2'] === c_name;
        })
        console.log(idp);
        
        if (!provinces[p_name]) {
            provinces[p_name] = {}
            provinces[p_name]['names'] = []
            names.push(p_name);
        }
        provinces[p_name]['names'].push(c_name);
        provinces[p_name][c_name] = {geo: feature, data: idp};
//        console.log(provinces)
//        if (provinces[name]) { // keep track of all our data, separated nicely
//            provinces[name].push(feature);
//        }
//        else {
//            provinces[name] = [feature];
//            names.push(name);
//        }
    })    
    console.log(data);
    
    projection.fitExtent([[0, 10], [w, h]], L2);
        
    names.forEach(name => {
        draw_province(name, provinces[name]);
    })
    
//    burundi.features.forEach((prov, i) => { // Order the data so it has the structure we need
//        let properties = prov.properties;
//        
//        properties['lat'] = +pop[i].lat;
//        properties['lon'] = +pop[i].lon;
//        
//        properties['population'] = +pop[i].pop
//        properties['area'] = +pop[i].area // in km^2
//        if(properties.area) {
//            properties['ratio'] = properties.population / properties.area;
//        }
//        properties['centroid'] = path.centroid(prov);
//    })
//    
////    cities.forEach(city => {
////        city['pos'] = projection([city.lon, city.lat]); 
////    });
//    
//    let extent = d3.extent(burundi.features, feature => feature.properties.ratio);
////    color.domain(extent);
//    colorScale.domain(extent);
//    
//    province_g.selectAll('path')
//        .data(burundi.features)
//        .enter()
//        .append('path')
//        .attr('class', 'province')
//        .attr('d', path)
//        .attr('id', d => d.properties['NAME_1'])
//        .attr('stroke', 'blue')
//        .attr('fill', d => {console.log(color(d.properties['ratio'])); return color(d.properties['ratio'])})
//        .filter(d => !d.properties['ratio'])
//        .attr('class', 'province unknown');
//    
//    province_g.selectAll('.label')
//        .data(burundi.features)
//        .enter()
//        .append('text')
//        .attr('class', 'label')
//        .attr('x', d => d.properties.centroid[0])
//        .attr('y', d => d.properties.centroid[1])
//        .attr('text-anchor', 'middle')
//        .text(d => d.properties['NAME_1']);
    
//    city_g.selectAll('.city')
//        .data(cities)
//        .enter()
//        .append('circle')
//        .attr('cx', d => d.pos[0])
//        .attr('cy', d => d.pos[1])
//        .attr('r', d => city_size(d.code));
//    
//    city_g.selectAll('.label')
//        .data(cities)
//        .enter()
//        .append('text')
//        .attr('x', d => d.pos[0])
//        .attr('y', d => d.pos[1])
//        .text(d => d.name);
}).catch(error => {
    console.error(error)
});

