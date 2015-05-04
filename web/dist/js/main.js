function cohort() {
    d3.selectAll(".body__value").on("mouseover", function() {
        var pct = d3.select(this).attr("data-pct");
        var n = d3.select(this).attr("data-n");
        var start = d3.select(this).attr("data-start");
        var now = d3.select(this).attr("data-now");
        var quarter = d3.select(this).attr("data-quarter");
        var s = "<em>" + start + "</em> people first posted on HN in " + "<em>" + quarter + "</em>, " + "<em>" + now + "</em> were still posting " + "<em>" + n + "</em> quarters later, i.e. " + "<em>" + pct + "%</em>";
        d3.select("#cohort__legend").html(s);
    });
}

function karma() {
    var margin = {
        top: 8,
        right: 20,
        bottom: 30,
        left: 80
    }, width = 960 - margin.left - margin.right, height = 500 - margin.top - margin.bottom;
    var parseDate = d3.time.format("%d-%b-%y").parse;
    var x = d3.scale.linear().range([ 0, width ]);
    var y = d3.scale.linear().range([ height, 0 ]);
    var xAxis = d3.svg.axis().scale(x).orient("bottom");
    var yAxis = d3.svg.axis().scale(y).orient("left");
    var area = d3.svg.area().interpolate("basis").x(function(d) {
        return x(d.karma);
    }).y0(height).y1(function(d) {
        return y(d.distribution);
    });
    var svg = d3.select("#karma .content").append("svg").attr("id", "karma-svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var bisectAbsciss = d3.bisector(function(d) {
        return d.karma;
    }).left;
    d3.csv("./../data/karma/karma.csv", karmaType, function(error, data) {
        x.domain(d3.extent(data, function(d) {
            return d.karma;
        }));
        y.domain([ 0, d3.max(data, function(d) {
            return d.distribution;
        }) ]);
        svg.append("path").datum(data).attr("class", "karma-area").attr("d", area);
        svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);
        svg.append("g").attr("class", "y axis").call(yAxis).append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style("text-anchor", "end");
        var legendX = width * .6;
        var deltaX = 200;
        var legendY = 60;
        svg.append("text").attr("class", "centile").attr("x", legendX).attr("y", legendY + 50).attr("text-anchor", "start").text("Centile:");
        svg.append("text").attr("class", "centile-figure").attr("x", legendX + deltaX).attr("y", legendY + 50).attr("text-anchor", "end").text("0");
        svg.append("text").attr("class", "karma").attr("x", legendX).attr("y", legendY).attr("text-anchor", "start").text("Karma:");
        svg.append("text").attr("class", "karma-figure").attr("x", legendX + deltaX).attr("y", legendY).attr("text-anchor", "end").text("0");
        svg.append("text").attr("class", "distribution").attr("x", legendX).attr("y", legendY + 25).attr("text-anchor", "start").text("# of persons:");
        svg.append("text").attr("class", "distribution-figure").attr("x", legendX + deltaX).attr("y", legendY + 25).attr("text-anchor", "end").text("0");
        var hoverLineGroup = svg.append("g").attr("class", "hover-line");
        var hoverLine = hoverLineGroup.append("svg:line").attr("x1", 10).attr("x2", 10).attr("y1", 0).attr("y2", height);
        var hoverCircle = hoverLineGroup.append("circle").attr("cx", function(d) {
            return x(100);
        }).attr("cy", function(d) {
            return y(7e4);
        }).attr("r", "6");
        hoverLineGroup.classed("hide", true);
        var userCurrentlyInteracting;
        var currentUserPositionX;
        var handleMouseOverGraph = function(event) {
            var hoverLineXOffset = d3.select(".karma-area")[0][0].getBoundingClientRect().left;
            var hoverLineYOffset = d3.select("#karma-svg")[0][0].offsetTop + margin.top;
            var mouseX = d3.event.pageX - hoverLineXOffset;
            var mouseY = d3.event.pageY - hoverLineYOffset;
            if (!(mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height)) return hoverLine.classed("hide", false);
            hoverLineGroup.classed("hide", false);
            hoverLine.attr("x1", mouseX).attr("x2", mouseX);
            var x0 = x.invert(mouseX), i = bisectAbsciss(data, x0, 1), d0 = data[i - 1], d1 = data[i], d = x0 - d0.karma > d1.karma - x0 ? d1 : d0;
            svg.selectAll("circle").attr("cx", function(d) {
                return mouseX;
            }).attr("cy", function() {
                return y(d.distribution);
            });
            svg.selectAll(".centile-figure").text(d.centile + "");
            svg.selectAll(".karma-figure").text(function() {
                if (d.karma === 1e3) return "> 1000";
                return d.karma < 10 ? " < 10" : d.karma + " - " + Math.floor(d.karma + 10);
            });
            svg.selectAll(".distribution-figure").text(function() {
                return d.karma === 1e3 ? 7685 : d.distribution;
            });
            userCurrentlyInteracting = true;
            currentUserPositionX = mouseX;
        };
        var handleMouseOutGraph = function(event) {
            hoverLineGroup.classed("hide", true);
            userCurrentlyInteracting = false;
            currentUserPositionX = -1;
        };
        d3.select("#karma").on("mousemove", handleMouseOverGraph);
        d3.select("#karma").on("mouseleave", handleMouseOutGraph);
    });
    function karmaType(d) {
        d.karma = +d.karma;
        d.distribution = +d.distribution;
        return d;
    }
}

var slidesNb = d3.selectAll("#slides .pages").length;

d3.select("#slides").selectAll(".next").on("click", function(d, i) {
    d3.event.preventDefault();
    d3.select("#slides #p" + i).classed("active", false);
    updateHash();
    updatePagination(i, false);
});

d3.select("#slides").selectAll(".previous").on("click", function(d, i) {
    d3.event.preventDefault();
    d3.select("#slides #p" + i).classed("active", true);
    updateHash();
    updatePagination(i, true);
});

function updateHash() {
    var active = d3.selectAll(".page:not(.active)");
    if (active.length === slidesNb - 1) {
        d3.select(".page.active:not(.last)").each(function() {
            window.location.hash = d3.select(this).select("div").attr("id");
        });
    } else {
        d3.select(".page.active").each(function() {
            window.location.hash = d3.select(this).select("div").attr("id");
        });
    }
}

d3.selectAll(".footer li > i").on("click", function(d, k) {
    window.location.hash = d3.select(this).attr("data-hash");
    d3.selectAll(".page").each(function(d, i) {
        if (i === k) {
            d3.select(this).classed("active", true);
        } else {
            d3.select(this).classed("active", false);
        }
    });
    updatePagination(k - 1);
});

function updatePagination(k, direction) {
    if (!direction && k < 7) k++;
    d3.selectAll(".footer li > i").each(function(d, i) {
        if (i === k) {
            d3.select(".footer #p" + i).classed("active", true);
        } else {
            d3.select(".footer #p" + i).classed("active", false);
        }
    });
}

d3.select("body").on("keydown", function(d, i) {
    if (d3.event.keyCode === 40 || d3.event.keyCode === 39) {
        showNextSlide(this);
    } else if (d3.event.keyCode === 37 || d3.event.keyCode === 38) {
        showPreviousSlide(this);
    }
});

function showNextSlide() {
    d3.select(".page.active:not(.last)").classed("active", false);
    d3.select(".page.active").each(function() {
        window.location.hash = d3.select(this).select("div").attr("id");
    });
    var active = d3.select(".footer .active");
    var index = active.attr("id").replace("p", "");
    if (index < 7) index++;
    active.classed("active", false);
    d3.select(".footer #p" + index).classed("active", true);
}

function showPreviousSlide() {
    d3.select(d3.selectAll(".page:not(.active)")[0].pop()).classed("active", true);
    var active = d3.selectAll(".page:not(.active)");
    if (active.length === slidesNb - 1) {
        d3.select(active[0].pop()).each(function() {
            window.location.hash = d3.select(this).select("div").attr("id");
        });
    } else {
        d3.select(".page.active").each(function() {
            window.location.hash = d3.select(this).select("div").attr("id");
        });
    }
    var pActive = d3.select(".footer .active");
    var index = pActive.attr("id").replace("p", "");
    if (index > 0) index--;
    pActive.classed("active", false);
    d3.select(".footer #p" + index).classed("active", true);
}

if (window.location.hash) {
    var hash = window.location.hash.replace("#", "");
    var done = false;
    var i = 0;
    d3.selectAll(".page").each(function() {
        if (done) return;
        var elm = d3.select(this);
        if (elm.select("div").attr("id") !== hash) {
            elm.classed("active", false);
            i++;
        } else {
            done = true;
            d3.select(".footer #p" + i).classed("active", true);
        }
    });
} else {
    d3.select(".footer #p0").classed("active", true);
}

d3.select("#slides").selectAll(".info-button").on("click", toggleModal(true));

d3.select("#slides").selectAll(".info__close").on("click", toggleModal(false));

d3.select("#slides").selectAll("#slides .info").on("click", toggleModal(false, true));

function toggleModal(toggle, targetOnly) {
    return function() {
        d3.event.preventDefault();
        if (targetOnly && d3.event.target !== this) return;
        var hash = window.location.hash;
        d3.select(hash + " .info").classed("active", toggle);
        d3.selectAll(hash + " > div:not(.info)").classed("blurred", toggle);
    };
}

var history = {};

window.onload = loadChart;

d3.select(window).on("hashchange", loadChart);

function loadChart() {
    var page = window.location.hash.replace("#", "");
    if (!history[page] && typeof window[page] === "function") {
        history[page] = 1;
        window[page]();
    }
}

d3.selectAll("#submissions .tab__control").on("click", function() {
    d3.selectAll("#submissions .tab__control").each(function() {
        d3.select(this).classed("active", false);
    });
    d3.select(this).classed("active", true);
    var index = d3.select(this)[0][0].innerHTML - 2006;
    var elm = document.getElementsByClassName("tab__content");
    for (var i = 0; i < elm.length; i++) {
        var el = elm[i];
        if (index.toString() === el.getAttribute("data-index")) {
            el.className = "tab__content active";
        } else {
            el.className = "tab__content hidden";
        }
    }
});

d3.selectAll("#sources .tab__control").on("click", function() {
    d3.selectAll("#sources .tab__control").each(function() {
        d3.select(this).classed("active", false);
    });
    d3.select(this).classed("active", true);
    var index = d3.select(this)[0][0].innerHTML - 2007;
    var elm = document.getElementsByClassName("tab__content");
    for (var i = 0; i < elm.length; i++) {
        var el = elm[i];
        if (index.toString() === el.getAttribute("data-index")) {
            el.className = "tab__content active";
        } else {
            el.className = "tab__content hidden";
        }
    }
});

function topics() {
    var width = 700, height = 400;
    var node = d3.select(".g-nodes").selectAll(".g-node"), label = d3.select(".g-labels").selectAll(".g-label");
    var techno = [];
    var lang = [];
    var people = [];
    var security = [];
    var corp = [];
    var all = [];
    var categories = {
        all: all,
        techno: techno,
        lang: lang,
        people: people,
        security: security,
        corp: corp
    };
    var quarters = [ "2012_q1", "2012_q2", "2012_q3", "2012_q4", "2013_q1", "2013_q2", "2013_q3", "2013_q4", "2014_q1", "2014_q2", "2014_q3", "2014_q4", "2015_q1" ];
    var margin = {
        top: 20,
        right: 20,
        bottom: 70,
        left: 60
    }, barWidth = 420 - margin.left - margin.right, barHeight = 200 - margin.top - margin.bottom;
    var x = d3.scale.ordinal().rangeRoundBands([ 0, barWidth ], .05);
    var y = d3.scale.linear().range([ barHeight, 0 ]);
    var xAxis = d3.svg.axis().scale(x).orient("bottom");
    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);
    var svg = d3.select("#chart-container .chart").append("svg").attr("width", barWidth + margin.left + margin.right).attr("height", barHeight + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    d3.select(".chart--close").on("click", function() {
        d3.select("#chart-container").classed("active", false);
    });
    d3.csv("./../data/topics/topics.csv", type, function(error, data) {
        data = categories.all;
        var barData = quarters.map(function(quarter, i) {
            return {
                x: i,
                y: data[0][quarter]
            };
        });
        x.domain(barData.map(function(d) {
            return d.x;
        }));
        y.domain([ 0, d3.max(barData, function(d) {
            return d.y;
        }) ]);
        svg.append("g").attr("class", "x axis").attr("transform", "translate(" + 10 + "," + (barHeight + 20) + ")").call(xAxis).selectAll("text").style("text-anchor", "middle").attr("dx", "-.8em").attr("dy", "-.55em").text(function(d) {
            return quarters[d].substring(6, 7).toUpperCase() + "'" + quarters[d].substring(2, 4);
        });
        svg.append("g").attr("class", "y axis").call(yAxis);
        svg.selectAll("bar").data(barData).enter().append("rect").style("fill", "orange").attr("x", function(d) {
            return x(d.x);
        }).attr("width", 20).attr("y", function(d) {
            return y(d.y);
        }).attr("height", function(d) {
            return barHeight - y(d.y);
        });
        var padding = 4, maxRadius = 60, maxMentions = 100, activeTopic;
        var r = d3.scale.sqrt().domain([ 0, d3.max(data, function(d) {
            return d["2015_q1"];
        }) ]).range([ 0, maxRadius ]);
        var force = d3.layout.force().gravity(0).charge(0).size([ width, height ]).on("tick", tick);
        var node = d3.select(".g-nodes").selectAll(".g-node"), label = d3.select(".g-labels").selectAll(".g-label");
        d3.select(".g-nodes").append("rect").attr("class", "g-overlay").attr("width", width).attr("height", height);
        d3.selectAll("#topics .tab__item").on("click", function(d) {
            d3.selectAll("#topics .tab__item").each(function(d) {
                d3.select(this).classed("active", false);
            });
            var elm = d3.select(this);
            elm.classed("active", true);
            updateCategory(elm.attr("data-category"));
        });
        updateTopics(data);
        function updateLabels() {
            label = label.data(data, function(d) {
                return d.topic;
            });
            label.exit().remove();
            var labelEnter = label.enter().append("a").attr("class", "g-label").call(force.drag).on("click", updateChart);
            labelEnter.append("div").attr("class", "g-name").text(function(d) {
                return d.topic;
            });
            label.style("font-size", function(d) {
                return Math.max(8, 1.2 * r(d.count) / 2) + "px";
            }).style("width", function(d) {
                return r(d.count) * 2.5 + "px";
            });
            label.append("span").text(function(d) {
                return d.topic;
            }).each(function(d) {
                d.dx = Math.max(2.5 * r(d.avg), this.getBoundingClientRect().width);
            }).remove();
            label.style("width", function(d) {
                return d.dx + "px";
            }).select(".g-value").text(function(d) {
                return d["2015_q1"] + (d.r > 60 ? " mentions" : "");
            });
            label.each(function(d) {
                d.dy = this.getBoundingClientRect().height;
            });
        }
        function updateChart(topic) {
            d3.select("#chart-container").classed("active", true);
            d3.selectAll(".g-node").classed("active", false);
            d3.select(this).classed("active", true);
            var barData = quarters.map(function(quarter, i) {
                return {
                    x: i,
                    y: topic[quarter]
                };
            });
            y.domain([ 0, d3.max(barData, function(d) {
                return d.y;
            }) ]);
            d3.select(".y.axis").call(yAxis);
            var bar = svg.selectAll("rect").transition().duration(200).attr("y", function(d) {
                return y(barData[d.x].y);
            }).attr("height", function(d) {
                return barHeight - y(barData[d.x].y);
            });
        }
        function updateCategory(category) {
            data = categories[category];
            r = d3.scale.sqrt().domain([ 0, d3.max(data, function(d) {
                return d["2015_q1"];
            }) ]).range([ 0, maxRadius ]);
            updateTopics(data);
        }
        function updateTopics(topics) {
            topics.forEach(function(d, i) {
                d.r = Math.max(12, r(d.avg));
            });
            force.nodes(data = topics).start();
            updateNodes();
            updateLabels();
        }
        function updateNodes() {
            node = node.data(data, function(d) {
                return d.topic;
            });
            node.exit().remove();
            node.enter().append("a").attr("class", "g-node").call(force.drag).on("click", updateChart).append("circle").attr("class", function(d) {
                return d.category;
            });
            node.select("circle").attr("r", function(d) {
                return r(d.avg);
            });
        }
        function tick(e) {
            node.each(gravity(e.alpha * .1)).each(collide(.1)).attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
            label.style("left", function(d) {
                return d.x - d.dx / 2 + "px";
            }).style("top", function(d) {
                return d.y - d.dy / 2 + "px";
            });
        }
        function gravity(alpha) {
            var cx = width / 2, cy = height / 2, ax = alpha / 4, ay = alpha;
            return function(d) {
                d.x += (cx - d.x) * ax;
                d.y += (cy - d.y) * ay;
            };
        }
        function collide(alpha) {
            var q = d3.geom.quadtree(data);
            return function(d) {
                var r = d.r + maxRadius + padding, nx1 = d.x - r, nx2 = d.x + r, ny1 = d.y - r, ny2 = d.y + r;
                q.visit(function(quad, x1, y1, x2, y2) {
                    if (quad.point && quad.point !== d && d.other !== quad.point && d !== quad.point.other) {
                        var x = d.x - quad.point.x, y = d.y - quad.point.y, l = Math.sqrt(x * x + y * y), r = d.r + quad.point.r + padding;
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
        var avg = 0;
        quarters.forEach(function(quarter) {
            d[quarter] = +d[quarter];
            avg += d[quarter];
        });
        d.avg = avg / quarters.length;
        d.x = Math.floor(700 * Math.random());
        d.y = Math.floor(500 * Math.random());
        categories[d.category].push(d);
        if (d.avg > 80) categories.all.push(d);
        return d;
    }
}

var margin = {
    top: 20,
    right: 60,
    bottom: 30,
    left: 60
}, viewport = {
    width: Math.min(960, .8 * document.documentElement.clientWidth),
    height: Math.min(450, .8 * document.documentElement.clientHeight - 80 - 90)
}, width = viewport.width - margin.left - margin.right, height = viewport.height - margin.top - margin.bottom;

var x = d3.scale.ordinal().rangeRoundBands([ 0, width ], .1);

var y = d3.scale.linear().rangeRound([ height, 0 ]);

var color = d3.scale.ordinal().range([ "#D9773F", "#f09765" ]);

var xAxis = d3.svg.axis().scale(x).orient("bottom");

var yAxis = d3.svg.axis().scale(y).orient("right").tickFormat(d3.format(".2s"));

var svg = d3.select("body #users .users__content").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).attr("viewport", "0 0 " + viewport.width + " " + viewport.height).attr("preserveAspectRatio", "xMidYMid").append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function users() {
    d3.csv("./../data/users/submissions.csv", function(error, data) {
        color.domain(d3.keys(data[0]).filter(function(key) {
            return key !== "Quarter";
        }));
        data.forEach(function(d) {
            var y0 = 0;
            d.ages = color.domain().map(function(name) {
                return {
                    name: name,
                    y0: y0,
                    y1: y0 += +d[name]
                };
            });
            d.total = d.ages[d.ages.length - 1].y1;
        });
        x.domain(data.map(function(d) {
            return d.Quarter;
        }));
        y.domain([ 0, d3.max(data, function(d) {
            return d.total;
        }) ]);
        svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);
        svg.append("g").attr("class", "y axis").attr("transform", "translate(" + width + ", 0)").call(yAxis);
        var state = svg.selectAll(".state").data(data).enter().append("g").attr("class", "g").attr("transform", function(d) {
            return "translate(" + x(d.Quarter) + ",0)";
        });
        state.selectAll(".bar.submissions").data(function(d) {
            return d.ages;
        }).enter().append("rect").attr("class", "bar submissions").attr("width", x.rangeBand()).attr("x", function(d) {
            return x(d.Quarter);
        }).attr("y", function(d) {
            return height;
        }).attr("height", function(d) {
            return 0;
        }).style("fill", function(d) {
            return color(d.name);
        });
        state.selectAll(".bar.submissions").attr("class", "bar submissions").attr("width", x.rangeBand()).transition().duration(500).delay(200).attr("x", function(d) {
            return x(d.Quarter);
        }).attr("y", function(d) {
            return y(d.y1);
        }).attr("height", function(d) {
            return y(d.y0) - y(d.y1);
        });
        var legend = svg.selectAll(".legend").data(color.domain().slice().reverse()).enter().append("g").attr("class", "legend").attr("transform", function(d, i) {
            return "translate(0," + i * 20 + ")";
        });
        legend.append("rect").attr("x", margin.left + 28).attr("width", 18).attr("height", 18).style("fill", color);
        legend.append("text").attr("x", margin.left + 20).attr("y", 9).attr("dy", ".35em").style("text-anchor", "end").text(function(d) {
            return d;
        });
        svg.selectAll(".x.axis .tick").each(function(d, i) {
            if (i % 4 !== 0) d3.select(this).text("");
        });
        svg.selectAll(".y.axis .tick").each(function(d, i) {
            if (i % 2 !== 0) d3.select(this).text("");
        });
    });
}

function submissionChart() {
    d3.csv("./../data/users/submissions.csv", function(error, data) {
        data.forEach(function(d) {
            var y0 = 0;
            d.ages = color.domain().map(function(name) {
                return {
                    name: name,
                    y0: y0,
                    y1: y0 += +d[name]
                };
            });
            d.total = d.ages[d.ages.length - 1].y1;
        });
        x.domain(data.map(function(d) {
            return d.Quarter;
        }));
        y.domain([ 0, d3.max(data, function(d) {
            return d.total;
        }) ]);
        svg.selectAll(".bar.submissions").transition().duration(500).style("fill", function(d) {
            return color(d.name);
        });
        svg.selectAll(".bar.users").transition().duration(500).attr("y", function(d) {
            return height;
        }).attr("height", function(d) {
            return 0;
        });
        svg.selectAll(".y.axis").call(yAxis);
        svg.selectAll(".y.axis").transition().duration(300).attr("transform", "translate(" + width + "," + 2 * height + ")").remove();
        svg.append("g").attr("class", "y axis").attr("transform", "translate(" + width + "," + -2 * height + ")").transition().delay(50).attr("transform", "translate(" + width + ", 0)").call(yAxis);
    });
}

function activeUserChart() {
    d3.csv("./../data/users/active_users.csv", type, function(error, data) {
        x.domain(data.map(function(d) {
            return d.Quarter;
        }));
        y.domain([ 0, d3.max(data, function(d) {
            return d.Users;
        }) ]);
        svg.selectAll(".userbar").data(data).enter().append("rect").attr("class", "bar users").attr("fill", "#c45d23").attr("x", function(d) {
            return x(d.Quarter);
        }).attr("width", x.rangeBand()).attr("y", function(d) {
            return height;
        }).attr("height", function(d) {
            return 0;
        });
        svg.selectAll(".bar.submissions").transition().duration(500).style("fill", "#fff");
        svg.selectAll(".bar.users").data(data).transition().duration(500).attr("y", function(d) {
            return y(d.Users);
        }).attr("height", function(d) {
            return height - y(d.Users);
        });
        svg.selectAll(".y.axis").transition().duration(300).attr("transform", "translate(" + width + "," + -2 * height + ")").remove();
        svg.append("g").attr("class", "y axis").attr("transform", "translate(" + width + "," + 2 * height + ")").transition().delay(50).attr("transform", "translate(" + width + ", 0)").call(yAxis);
    });
}

function type(d) {
    d.Users = +d.Users;
    return d;
}