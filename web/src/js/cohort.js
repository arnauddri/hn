/* global document, window, d3 */
function cohort() {
  d3.selectAll('.body__value').on('mouseover', function() {
    var pct = d3.select(this).attr('data-pct')
    var n = d3.select(this).attr('data-n')
    var start = d3.select(this).attr('data-start')
    var now = d3.select(this).attr('data-now')
    var quarter = d3.select(this).attr('data-quarter')
    var s = '<em>' + start +
      '</em> people first posted on HN in ' +
      '<em>' +
      quarter +
      '</em>, ' +
      '<em>' +
      now +
      '</em> were still posting ' +
      '<em>' +
      n +
      '</em> quarters later, i.e. ' +
      '<em>' +
      pct + '%</em>'

    d3.select('#cohort__legend').html(s)
  })
}
