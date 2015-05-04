var request = require('request')
var fs = require('fs')
var _ = require('lodash')
var minimist = require('minimist')
var assert = require('assert')
var url = require('url')
var argv = minimist(process.argv.slice(2))

function crawl(data, timestamp, filename) {
  getItems(timestamp);

  function getItems (timestamp) {
    if (timestamp * 1000 > Date.now()) return

    var tag = data
    var step = (tag === 'story') ? 28000 : 7000
    var nextTimestamp = timestamp + step;

    var query = 'https://hn.algolia.com/api/v1/search_by_date?tags=' +
      tag +
      '&numericFilters=created_at_i%3E' +
      timestamp +
      ',created_at_i%3C' +
      nextTimestamp +
      '&hitsPerPage=1000'

    request(query, function(err, res, data) {
      assert.ifError(err)

      var n = JSON.parse(data).hits.length
      console.log(n);

      if (n === 0)
        return getItems(nextTimestamp + step)

      var ts_max = 0
      JSON.parse(data).hits.map(function (item) {
        if (ts_max < item.created_at_i) ts_max = item.created_at_i

        var hostname = (item.url) ? url.parse(item.url).hostname : ''
        hostname = (hostname) ? hostname.replace('www.', '') : ''

        var line
        if (tag === 'story') {
          item.title = item.title.replace(new RegExp(/(,|\n|\^\M)/g),'')
          line = item.objectID + ',' +
            item.created_at + ',' +
            item.created_at_i + ',' +
            item.author + ',' +
            item.points + ',' +
            hostname + ',' +
            item.num_comments + ',' +
            item.title + '\n'
        }

        if (tag === 'comment') {
          item.comment_text = item.comment_text.replace(new RegExp(/(,|\n|\^\M)/g),'')
          item.points += 0
          line = item.objectID + ',' +
            item.created_at + ',' +
            item.created_at_i + ',' +
            item.author + ',' +
            item.points + ',' +
            item.story_id + ',' +
            item.parent_id + ',' +
            hostname + ',' +
            item.comment_text + '\n'
        }

        fs.appendFile(filename, line)
      });

      ts_max = (isNaN(ts_max)) ? timestamp + 43200 : ts_max;

      getItems(ts_max);
    });
  }
}

if (!module.parent) {
  crawl(argv.d, argv.t, argv.f)
}
