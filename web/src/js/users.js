/* global document, window, d3 */
var margin = { top: 20, right: 60, bottom: 30, left: 60 },
    viewport = {
      width: Math.min(960, 0.8 * document.documentElement.clientWidth),
      height: Math.min(450, 0.8 * document.documentElement.clientHeight - 80 - 90)
    },
    width = viewport.width - margin.left - margin.right,
    height = viewport.height - margin.top - margin.bottom;

var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);
var y = d3.scale.linear().rangeRound([height, 0]);
var color = d3.scale.ordinal().range(['#D9773F', '#f09765']);
var xAxis = d3.svg.axis().scale(x).orient('bottom');

var yAxis = d3.svg.axis()
    .scale(y)
    .orient('right')
    .tickFormat(d3.format('.2s'));

var svg = d3.select('body #users .users__content').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr('viewport', '0 0 ' + viewport.width + ' ' + viewport.height)
    .attr('preserveAspectRatio', 'xMidYMid')
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

function users() {
  d3.csv('./../data/users/submissions.csv', function(error, data) {
    color.domain(d3.keys(data[0]).filter(function(key) { return key !== 'Quarter'; }));

    data.forEach(function(d) {
      var y0 = 0;
      d.ages = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
      d.total = d.ages[d.ages.length - 1].y1;
    });

    x.domain(data.map(function(d) { return d.Quarter; }));
    y.domain([0, d3.max(data, function(d) { return d.total; })]);

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + width + ', 0)')
        .call(yAxis);

    var state = svg.selectAll('.state')
        .data(data)
      .enter().append('g')
        .attr('class', 'g')
        .attr('transform', function(d) { return 'translate(' + x(d.Quarter) + ',0)'; });

    state.selectAll('.bar.submissions')
        .data(function(d) { return d.ages; })
      .enter().append('rect')
        .attr('class', 'bar submissions')
        .attr('width', x.rangeBand())
        .attr('x', function(d) { return x(d.Quarter); })
        .attr('y', function(d) { return height; })
        .attr('height', function(d) { return 0; })
        .style('fill', function(d) { return color(d.name); });

    state.selectAll('.bar.submissions')
        .attr('class', 'bar submissions')
        .attr('width', x.rangeBand())
        .transition()
        .duration(500)
        .delay(200)
        .attr('x', function(d) { return x(d.Quarter); })
        .attr('y', function(d) { return y(d.y1); })
        .attr('height', function(d) { return y(d.y0) - y(d.y1); });

    var legend = svg.selectAll('.legend')
        .data(color.domain().slice().reverse())
      .enter().append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; });

    legend.append('rect')
        .attr('x', margin.left + 28)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', color);

    legend.append('text')
        .attr('x', margin.left + 20)
        .attr('y', 9)
        .attr('dy', '.35em')
        .style('text-anchor', 'end')
        .text(function(d) { return d; });

    svg.selectAll('.x.axis .tick')
      .each(function(d, i){
        if (i%4 !== 0)
          d3.select(this)
            .text('');
      });

    svg.selectAll('.y.axis .tick')
      .each(function(d, i){
        if (i%2 !== 0)
          d3.select(this)
            .text('');
      });
  });
}

function submissionChart() {
  d3.csv('./../data/users/submissions.csv', function(error, data) {

    data.forEach(function(d) {
      var y0 = 0;
      d.ages = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
      d.total = d.ages[d.ages.length - 1].y1;
    });

    x.domain(data.map(function(d) { return d.Quarter; }));
    y.domain([0, d3.max(data, function(d) { return d.total; })]);

    svg.selectAll('.bar.submissions')
        .transition()
        .duration(500)
        .style('fill', function(d) { return color(d.name); });

    svg.selectAll('.bar.users')
        .transition()
        .duration(500)
        .attr('y', function(d) { return height; })
        .attr('height', function(d) { return 0; });

    svg.selectAll('.y.axis').call(yAxis);

    svg.selectAll('.y.axis')
        .transition()
        .duration(300)
        .attr('transform', 'translate(' + width + ',' + 2 * height + ')')
        .remove();

    svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + width + ',' + -2 * height + ')')
        .transition()
        .delay(50)
        .attr('transform', 'translate(' + width + ', 0)')
        .call(yAxis);
  });
}

function activeUserChart() {
  d3.csv('./../data/users/active_users.csv', type, function(error, data) {
    x.domain(data.map(function(d) { return d.Quarter; }));
    y.domain([0, d3.max(data, function(d) { return d.Users; })]);

    svg.selectAll('.userbar')
        .data(data)
      .enter().append('rect')
        .attr('class', 'bar users')
        .attr('fill', '#c45d23')
        .attr('x', function(d) { return x(d.Quarter); })
        .attr('width', x.rangeBand())
        .attr('y', function(d) { return height; })
        .attr('height', function(d) { return 0; })

    svg.selectAll('.bar.submissions')
        .transition()
        .duration(500)
        .style('fill', '#fff');

    svg.selectAll('.bar.users')
        .data(data)
        .transition()
        .duration(500)
        .attr('y', function(d) { return y(d.Users); })
        .attr('height', function(d) { return height - y(d.Users); });

    svg.selectAll('.y.axis')
        .transition()
        .duration(300)
        .attr('transform', 'translate(' + width + ',' + -2 * height + ')')
        .remove();

  svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + width + ',' + 2 * height + ')')
        .transition()
        .delay(50)
        .attr('transform', 'translate(' + width + ', 0)')
        .call(yAxis);
  });
}

function type(d) {
  d.Users = +d.Users;
  return d;
}
