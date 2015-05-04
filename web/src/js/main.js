/* global window, d3 */


var slidesNb = d3.selectAll('#slides .pages').length

// Manages slides transition
d3.select('#slides')
  .selectAll('.next')
    .on('click', function(d,i){
      d3.event.preventDefault();
      d3.select('#slides #p'+i)
        .classed('active', false)

      updateHash()
      updatePagination(i, false)
    });

d3.select('#slides')
  .selectAll('.previous')
    .on('click',function(d,i){
      d3.event.preventDefault();
      d3.select('#slides #p'+i)
        .classed('active', true)

      updateHash()
      updatePagination(i, true)
    });

// Update the location hash when 'next' and 'previous' get clicked
function updateHash() {
  var active = d3.selectAll('.page:not(.active)')
  if (active.length === slidesNb - 1) {
  d3.select('.page.active:not(.last)')
    .each(function() {
      window.location.hash = d3.select(this).select('div').attr('id')
    })
  } else {
    d3.select('.page.active')
      .each(function() {
        window.location.hash = d3.select(this).select('div').attr('id')
      })
  }
}

// Update slide when a scrollspy is clicked
d3.selectAll('.footer li > i').on('click', function(d, k) {
  window.location.hash = d3.select(this).attr('data-hash')

  d3.selectAll('.page')
    .each(function(d, i) {
      if (i === k) {
        d3.select(this)
          .classed('active', true)
      } else {
        d3.select(this)
          .classed('active', false)
      }
    })

  updatePagination(k - 1)
})

// Update the pagination buttons
function updatePagination(k, direction) {
  if (!direction && k < 7) k++
  d3.selectAll('.footer li > i')
    .each(function(d, i) {
      if (i === k) {
        d3.select('.footer #p'+i)
          .classed('active', true)
      } else {
        d3.select('.footer #p'+i)
          .classed('active', false)
      }
    })
}

d3.select('body')
  .on('keydown', function(d, i) {
    if (d3.event.keyCode === 40 || d3.event.keyCode === 39) {
      showNextSlide(this)
    } else if (d3.event.keyCode === 37 || d3.event.keyCode === 38) {
      showPreviousSlide(this)
    }
  })

function showNextSlide() {
  d3.select('.page.active:not(.last)')
    .classed('active', false)

  d3.select('.page.active')
    .each(function() {
      window.location.hash = d3.select(this).select('div').attr('id')
    })

  var active = d3.select('.footer .active')
  var index = active.attr('id').replace('p', '')
  if (index < 7) index++

  active.classed('active', false)
  d3.select('.footer #p' + index).classed('active', true)
}

function showPreviousSlide() {
  d3.select(d3.selectAll('.page:not(.active)')[0].pop())
    .classed('active', true)

  var active = d3.selectAll('.page:not(.active)')
  if (active.length === slidesNb - 1) {
    d3.select(active[0].pop())
      .each(function() {
        window.location.hash = d3.select(this).select('div').attr('id')
      })
  } else {
    // fix for last page
    d3.select('.page.active')
      .each(function() {
        window.location.hash = d3.select(this).select('div').attr('id')
      })
  }

  var pActive = d3.select('.footer .active')
  var index = pActive.attr('id').replace('p', '')
  if (index > 0) index--

  pActive.classed('active', false)
  d3.select('.footer #p' + index).classed('active', true)
}

if (window.location.hash) {
  var hash = window.location.hash.replace('#', '')
  var done = false
  var i = 0
  d3.selectAll('.page')
    .each(function() {
      if (done) return

      var elm = d3.select(this)
      if (elm.select('div').attr('id') !== hash) {
        elm.classed('active', false)
        i++
      } else {
        done = true
        d3.select('.footer #p' + i).classed('active', true)
      }
    })
} else {
  // No hash is present so we highlight page 0 in the scrollspy
  d3.select('.footer #p0').classed('active', true)
}

/***
 *
 * Managing the info modal
 *
 ***/

d3.select('#slides')
  .selectAll('.info-button')
  .on('click', toggleModal(true))

d3.select('#slides')
  .selectAll('.info__close')
  .on('click', toggleModal(false))

d3.select('#slides')
  .selectAll('#slides .info')
  .on('click', toggleModal(false, true))

function toggleModal(toggle, targetOnly) {
  return function() {
    d3.event.preventDefault();
    if (targetOnly && d3.event.target !== this) return
    var hash = window.location.hash
    d3.select(hash + ' .info')
      .classed('active', toggle)

    d3.selectAll(hash + ' > div:not(.info)')
      .classed('blurred', toggle)
  }
}

/***
 *
 * Loading the Charts
 *
 ***/

// Keeps a trace of the function calls
// history to load each graph only once
var history = {}

// Displays the chart only when the slides get printed
window.onload = loadChart
d3.select(window).on('hashchange', loadChart)

function loadChart() {
  var page = window.location.hash.replace('#', '')

  if (!history[page] && typeof window[page] === 'function') {
    history[page] = 1
    window[page]()
  }
}

/***
 *
 * Tabs
 *
 ***/
d3.selectAll('#submissions .tab__control')
  .on('click', function() {
    d3.selectAll('#submissions .tab__control')
      .each(function() {
        d3.select(this).classed('active', false)
      })
    d3.select(this).classed('active', true)
    var index = d3.select(this)[0][0].innerHTML - 2006
    var elm = document.getElementsByClassName('tab__content')
    for (var i = 0;  i < elm.length; i ++) {
      var el = elm[i]
      if (index.toString() === el.getAttribute('data-index')) {
        el.className = 'tab__content active'
      } else {
        el.className = 'tab__content hidden'
      }
    }
  })

d3.selectAll('#sources .tab__control')
  .on('click', function() {
    d3.selectAll('#sources .tab__control')
      .each(function() {
        d3.select(this).classed('active', false)
      })
    d3.select(this).classed('active', true)
    var index = d3.select(this)[0][0].innerHTML - 2007
    var elm = document.getElementsByClassName('tab__content')
    for (var i = 0;  i < elm.length; i ++) {
      var el = elm[i]
      if (index.toString() === el.getAttribute('data-index')) {
        el.className = 'tab__content active'
      } else {
        el.className = 'tab__content hidden'
      }
    }
  })
