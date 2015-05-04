/* global document, window, d3 */
function topics() {
  var width = 700,
      height = 400;

  var node = d3.select('.g-nodes').selectAll('.g-node'),
      label = d3.select('.g-labels').selectAll('.g-label');

  var techno = []
  var lang = []
  var people = []
  var security = []
  var corp = []
  var all = []

  var categories = {
    all: all,
    techno: techno,
    lang: lang,
    people: people,
    security: security,
    corp: corp
  }

  var quarters = [
    '2012_q1', '2012_q2', '2012_q3', '2012_q4',
    '2013_q1', '2013_q2', '2013_q3', '2013_q4',
    '2014_q1', '2014_q2', '2014_q3', '2014_q4',
    '2015_q1'
  ]

  var margin = {top: 20, right: 20, bottom: 70, left: 60},
    barWidth = 420 - margin.left - margin.right,
    barHeight = 200 - margin.top - margin.bottom;

  var x = d3.scale.ordinal().rangeRoundBands([0, barWidth], 0.05);
  var y = d3.scale.linear().range([barHeight, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left')
    .ticks(5);

  var svg = d3.select('#chart-container .chart').append('svg')
    .attr('width', barWidth + margin.left + margin.right)
    .attr('height', barHeight + margin.top + margin.bottom)
  .append('g')
    .attr('transform',
          'translate(' + margin.left + ',' + margin.top + ')');

  d3.select('.chart--close').on('click', function() {
    d3.select('#chart-container').classed('active', false)
  })

  // Load data
  d3.csv('./../data/topics/topics.csv', type, function(error, data) {
    data = categories.all;

    var barData = quarters.map(function(quarter, i) {
      return {
        x: i,
        y: data[0][quarter]
      }
    })

    x.domain(barData.map(function(d) { return d.x; }));
    y.domain([0, d3.max(barData, function(d) { return d.y; })]);

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(' + 10 + ',' + (barHeight + 20) + ')')
        .call(xAxis)
      .selectAll('text')
        .style('text-anchor', 'middle')
        .attr('dx', '-.8em')
        .attr('dy', '-.55em')
        .text(function(d) { return quarters[d].substring(6,7).toUpperCase() + '\'' +  quarters[d].substring(2,4) })

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)

    svg.selectAll('bar')
        .data(barData)
      .enter().append('rect')
        .style('fill', 'orange')
        .attr('x', function(d) { return x(d.x); })
        .attr('width', 20)
        .attr('y', function(d) { return y(d.y); })
        .attr('height', function(d) { return barHeight - y(d.y); });

    var padding = 4, // collision padding
      maxRadius = 60, // collision search radius
      maxMentions = 100, // limit displayed mentions
      activeTopic; // currently-displayed topic

    var r = d3.scale.sqrt()
      .domain([0, d3.max(data, function(d) { return d['2015_q1']; })])
      .range([0, maxRadius]);

    var force = d3.layout.force()
      .gravity(0)
      .charge(0)
      .size([width, height])
      .on('tick', tick);

    var node = d3.select('.g-nodes').selectAll('.g-node'),
      label = d3.select('.g-labels').selectAll('.g-label');

    d3.select('.g-nodes').append('rect')
      .attr('class', 'g-overlay')
      .attr('width', width)
      .attr('height', height)

    d3.selectAll('#topics .tab__item').on('click', function(d) {
      d3.selectAll('#topics .tab__item').each(function(d) {
        d3.select(this).classed('active', false)
      })
      var elm = d3.select(this)
      elm.classed('active', true);
      updateCategory(elm.attr('data-category'))
    })

    updateTopics(data)

    // Update the displayed node labels.
    function updateLabels() {
      label = label.data(data, function(d) { return d.topic; });

      label.exit().remove();

      var labelEnter = label.enter().append('a')
        .attr('class', 'g-label')
        .call(force.drag)
        .on('click', updateChart)

      labelEnter.append('div')
        .attr('class', 'g-name')
        .text(function(d) { return d.topic; });


      label
        .style('font-size', function(d) { return Math.max(8, 1.2 * r(d.count) / 2) + 'px'; })
        .style('width', function(d) { return r(d.count) * 2.5 + 'px'; });

      // Create a temporary span to compute the true text width.
      label.append('span')
        .text(function(d) { return d.topic; })
        .each(function(d) { d.dx = Math.max(2.5 * r(d.avg), this.getBoundingClientRect().width); })
        .remove();

      label
          .style('width', function(d) { return d.dx + 'px'; })
        .select('.g-value')
          .text(function(d) { return d['2015_q1'] + (d.r > 60 ? ' mentions' : ''); });

      // Compute the height of labels when wrapped.
      label.each(function(d) { d.dy = this.getBoundingClientRect().height; });
    }

    function updateChart(topic) {
      d3.select('#chart-container').classed('active', true)
      d3.selectAll('.g-node').classed('active', false)
      d3.select(this).classed('active', true)
      var barData = quarters.map(function(quarter, i) {
        return {
          x: i,
          y: topic[quarter]
        }
      })
      y.domain([0, d3.max(barData, function(d) { return d.y; })]);
      d3.select('.y.axis').call(yAxis)

      var bar = svg.selectAll('rect').transition().duration(200)
          .attr('y', function(d) { return y(barData[d.x].y); })
          .attr('height', function(d) { return barHeight - y(barData[d.x].y); });
    }

    function updateCategory(category) {
      data = categories[category]
      r = d3.scale.sqrt()
        .domain([0, d3.max(data, function(d) { return d['2015_q1']; })])
        .range([0, maxRadius]);
      updateTopics(data)
    }

    // Update the known topics.
    function updateTopics(topics) {
      topics.forEach(function(d, i) { d.r = Math.max(12, r(d.avg)); }); // min. collision
      force.nodes(data = topics).start();
      updateNodes();
      updateLabels();
    }

    // Update the displayed nodes.
    function updateNodes() {
      node = node.data(data, function(d) { return d.topic; });

      node.exit().remove();

      node.enter().append('a')
          .attr('class', 'g-node')
          .call(force.drag)
          .on('click', updateChart)
        .append('circle')
          .attr('class', function(d) { return d.category })

      node.select('circle')
          .attr('r', function(d) { return r(d.avg); })
    }

    // Simulate forces and update node and label positions on tick.
    function tick(e) {
      node
        .each(gravity(e.alpha * 0.1))
        .each(collide(0.1))
        .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });

      label
        .style('left', function(d) { return (d.x - d.dx / 2) + 'px'; })
        .style('top', function(d) { return (d.y - d.dy / 2) + 'px'; });
    }

    // Custom gravity to favor a non-square aspect ratio.
    function gravity(alpha) {
      var cx = width / 2,
        cy = height / 2,
        ax = alpha / 4,
        ay = alpha;

      return function(d) {
        d.x += (cx - d.x) * ax;
        d.y += (cy - d.y) * ay;
      };
    }

    // Resolve collisions between nodes.
    function collide(alpha) {
      var q = d3.geom.quadtree(data);
      return function(d) {
        var r = d.r + maxRadius + padding,
            nx1 = d.x - r,
            nx2 = d.x + r,
            ny1 = d.y - r,
            ny2 = d.y + r;
        q.visit(function(quad, x1, y1, x2, y2) {
          if (quad.point && (quad.point !== d) && d.other !== quad.point && d !== quad.point.other) {
            var x = d.x - quad.point.x,
                y = d.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = d.r + quad.point.r + padding;
            if (l < r) {
              l = (l - r) / l * alpha;
              d.x -= x *= l;
              d.y -= y *= l;
              quad.point.x += x;
              quad.point.y += y;
            }
          }
          return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
      };
    }
  });


  function type(d) {
    var avg = 0
    quarters.forEach(function(quarter) {
      d[quarter] = +d[quarter]
      avg += d[quarter]
    })

    d.avg = avg / quarters.length

    d.x = Math.floor(700 * Math.random())
    d.y = Math.floor(500 * Math.random())

    categories[d.category].push(d)
    if (d.avg > 80) categories.all.push(d)

    return d;
  }
}
