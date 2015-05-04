/* global document, window, d3 */
function karma() {
  var margin = {top: 8, right: 20, bottom: 30, left: 80},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  var parseDate = d3.time.format('%d-%b-%y').parse;

  var x = d3.scale.linear()
    .range([0, width]);

  var y = d3.scale.linear()
    .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom');

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left');

  var area = d3.svg.area()
    .interpolate('basis')
    .x(function(d) { return x(d.karma); })
    .y0(height)
    .y1(function(d) { return y(d.distribution); });

  var svg = d3.select('#karma .content').append('svg')
    .attr('id', 'karma-svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var bisectAbsciss = d3.bisector(function(d) { return d.karma; }).left;

  d3.csv('./../data/karma/karma.csv', karmaType, function(error, data) {

  x.domain(d3.extent(data, function(d) { return d.karma; }));
  y.domain([0, d3.max(data, function(d) { return d.distribution; })]);

  svg.append('path')
    .datum(data)
    .attr('class', 'karma-area')
    .attr('d', area);

  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis);

  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis)
  .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '.71em')
    .style('text-anchor', 'end');

  // Append centile, karma and distribution on chart
  var legendX =  width * 0.6;
  var deltaX = 200;
  var legendY =  60;

  svg.append('text')
    .attr('class', 'centile')
    .attr('x', legendX)
    .attr('y', legendY + 50)
    .attr('text-anchor', 'start')
    .text('Centile:');

  svg.append('text')
    .attr('class', 'centile-figure')
    .attr('x', legendX + deltaX)
    .attr('y', legendY + 50)
    .attr('text-anchor', 'end')
    .text('0');

  svg.append('text')
    .attr('class', 'karma')
    .attr('x', legendX)
    .attr('y', legendY)
    .attr('text-anchor', 'start')
    .text('Karma:');

  svg.append('text')
    .attr('class', 'karma-figure')
    .attr('x', legendX + deltaX)
    .attr('y', legendY)
    .attr('text-anchor', 'end')
    .text('0');

  svg.append('text')
    .attr('class', 'distribution')
    .attr('x', legendX)
    .attr('y', legendY + 25)
    .attr('text-anchor', 'start')
    .text('# of persons:');

  svg.append('text')
    .attr('class', 'distribution-figure')
    .attr('x', legendX + deltaX)
    .attr('y', legendY + 25)
    .attr('text-anchor', 'end')
    .text('0');

  var hoverLineGroup = svg.append('g')
    .attr('class', 'hover-line');

  // add the line to the group
  var hoverLine = hoverLineGroup
    .append('svg:line')
      .attr('x1', 10).attr('x2', 10)
      .attr('y1', 0).attr('y2', height);

  var hoverCircle = hoverLineGroup.append('circle')
    .attr('cx', function(d) { return x(100); })
    .attr('cy', function(d) { return y(70000) })
    .attr('r', '6');

    // hide it by default
    hoverLineGroup.classed('hide', true);
    var userCurrentlyInteracting
    var currentUserPositionX

  var handleMouseOverGraph = function(event) {
    var hoverLineXOffset = d3.select('.karma-area')[0][0].getBoundingClientRect().left
    var hoverLineYOffset = d3.select('#karma-svg')[0][0].offsetTop + margin.top;

    var mouseX = d3.event.pageX - hoverLineXOffset;
    var mouseY = d3.event.pageY - hoverLineYOffset;

    if(!(mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height))
      return hoverLine.classed('hide', false);

    // show the hover line
    hoverLineGroup.classed('hide', false);

    // set position of hoverLine
    hoverLine.attr('x1', mouseX).attr('x2', mouseX)

    var x0 = x.invert(mouseX),
        i = bisectAbsciss(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.karma > d1.karma - x0 ? d1 : d0;

    svg.selectAll('circle')
        .attr('cx', function(d) { return mouseX; })
        .attr('cy', function() { return y(d.distribution) });

    svg.selectAll('.centile-figure')
      .text(d.centile + '');

    svg.selectAll('.karma-figure')
      .text(function() {
        if (d.karma === 1000) return '> 1000';
        return (d.karma < 10) ? ' < 10' : d.karma + ' - ' + Math.floor(d.karma + 10);
      });

    svg.selectAll('.distribution-figure')
      .text(function() { return (d.karma === 1000) ? 7685 : d.distribution; });

    // user is interacting
    userCurrentlyInteracting = true;
    currentUserPositionX = mouseX;
  };

  var handleMouseOutGraph = function(event) {
    // hide the hover-line
    hoverLineGroup.classed('hide', true);
    // user is no longer interacting
    userCurrentlyInteracting = false;
    currentUserPositionX = -1;
  }

    d3.select('#karma')
      .on('mousemove', handleMouseOverGraph)
    d3.select('#karma')
      .on('mouseleave', handleMouseOutGraph)

  });


  function karmaType(d) {
    d.karma = +d.karma;
    d.distribution = +d.distribution;
    return d;
  }
}
