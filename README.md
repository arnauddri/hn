# Crunching Hacker News

An analysis of Hacker News made from the entire HN history (up until Q1 2015) and using command line tools only.


This project was started with the intention of getting better with both command line tools and d3.js. Hacker News Data proved to be a great material to reach these goals as it was easily collectible and of relatively good quality.

The data visualization from this project can be found [here](https://arnauddri.github.io/hn)

This project is made of 3 differents parts:

- [a HN Data Dump containing all stories and comments from 2006 to Q1 2015 (Apr. 1st 00:00:00)](#dumps)
- [a crawler to collect the data](#crawler)
- [a list of scripts to parse the data](#scripts)
- [a data visualization with the results of the scripts](#dataviz)


## Hacker News Data Dumps<a id='dumps'></a>

The dump is splitted in 2 files: ```stories.csv``` and  ```comments.csv```. Both files are compressed with 7Zip compression to abide by GitHub policy against data ware housing.

As HN item's ids are listed in order, it is easy to see that some items are missing from the dumps. After a quick research, it appears that the missing items account for deleted posts which are not returned by the API.


#### Stories.csv

The file contains 1553934 entries, is 171M big (uncompressed) and uses the following column titles.
```
id, created_at, created_at_i, author, points, url_hostname, num_comments, title
```


#### Comments.csv

The file contains 7111949 entries, is 959M big (uncompressed) and uses the following column titles.
```
id, created_at, created_at_i, author, points, story_id, parent_id, url_hostname, comment_text
```

## Crawler<a id='crawler'></a>

The current project contains every posts and comments since HN start in 2006 and up until Q1 2015 (March 31st). The data has been retrieved via the HN Algolia Api rather than the Firebase one. This is mostly due to rate limitation. A simple CLI parser has been included in the project so everybody can get the dataset up-to-date with it.

Stories and comments need to be updated separately as the data fetched for both differ. The parser retrieves every story or comment posted after a given timestamp. Here is how to use it:

```
$ node crawler/crawler.js -f [output_filename.csv] -d [data to be retrieved ( 'story' || 'comment')] -t [timestamp]
```

It will output a csv with the following header:

```
stories.csv:
id, created_at, created_at_i, author, points, url_hostname, num_comments, title
```

```
comments.csv:
id, created_at, created_at_i, author, points, story_id, parent_id, url_hostname, comment_text
```

This tool is a functional but quick and dirty parser. There is a lot of room for optimization but as the main bottleneck here is the API rate limitation it is probably not worth spending too much time on it.

## Scripts<a id='scripts'></a>

All the data used in the data visualization come directly from the crawler's output. It is then parsed and formatted using CLI tools only.


#### Active users

A simple awk script runs through the data set and records a user activity on a quarterly basis. The scripts then outputs the sum of active users per quarter.

```bash
$ awk -F, -v OFS="," -f ./bin/active_users.awk ./data/stories.csv ./data/comments.csv | sort >> ./output/active_users.csv
```


#### Submissions

It is very similar to the active users script. Just run it as follows:

```bash
$ awk -F, -v OFS="," -f ./bin/submissions.awk ./data/stories.csv ./data/comments.csv | sort >> ./output/submissions.csv
```


#### Top Stories

First we get the stories sorted in descending order suing the sort tool. Then we filter out most of the result to keep only the top 10 results per year.

```bash
$ ./bin/top_stories.sh
```


#### Cohort Analysis

This is probably the most convoluted part of the analysis. The main idea behind the script is to get for each user, the dates (ie.e year +  quarter) of its first and last contributions to HN.

To do this, we first concatenate and sort the stories and comments by date. Then, for each user, we store in a hash map the corresponding dates as concatenated strings.

We then iterate over this hash map and aggregates the cohort figures.

To launch the script, simply run:

```bash
$ ./bin/cohort.sh
```


#### Word Count

The word frequency analysis is made by looping through each post title, splitting them into lowercase word and keeping only the most frequents ones.

```bash
$  cat data/stories.csv | awk -F, -v OFS="," -v timestamp=1325376000  -f ./scripts/word_freq.awk | sort -nr --field-separator="," --key=2 > output/word_freq.csv
```

I then used a list of most [frequent words](https://github.com/first20hours/google-10000-english) to filter out the irrelevant words (I manaully kept a few interesting one s in the context of HN). This post filtering was made with the following script:

```bash
$ awk -F, -v OFS="," 'NF==1 { common[$1] = 1 }  { if (common[$1] != 1) { print $0 } }' utils/common_words.csv output/word_freq.csv > output/word_freq_filtered.csv
```

NB: this part is the only opinionated part of the whole analysis, as I had to filter and cluster the words manually for the sake of the visualization.



#### Top Domains

```bash
$ awk -F, v- OFS="," ./bin/sources.awk data/stories.csv | sort --field-separator="," -k1,1nr -k5,5nr | awk -F, -v OFS="," '{ if (year[$1] < 10 && length($2) > 2) { print $0; year[$1]++ } }' > output/sources.csv
```


#### Karma

First we need to get everybody's karma. To do so, we loop through the posts and comments and sums all of a user's points. The data is not so accurate for 2 reasons: the HN API do not provide the comments scores anymore and deleted posts can no longer be retrieved but their associated score is still taken into account.

Once we have each user's karma, we only need to cluster the data by karma range.

```bash
$ awk -F, -v OFS="," -f ./bin/karma.awk data/stories.csv data/comments.csv | sort -t, -n -k1,1n > output/karma.csv
```

## Data-visualization<a id='dataviz'></a>

The dataviz was made using d3.js and CSS3 only.

If you wish to make changes on it, I used npm as a build tool. The list of availables scripts are listed in the ```package.json```:

```json
{
    "test": "echo \"Error: no test specified\" && exit 1",
    "jade": "jade src/**.jade --out dist -P",
    "stylus": "stylus src/stylesheets/style.styl --out dist/css",
    "uglify": "uglifyjs src/js/*.js -o dist/js/main.min.js",
    "concat": "uglifyjs src/js/*.js -o dist/js/main.js -b",
    "watch": "watch 'npm run jade' src/ & watch 'npm run stylus' src/stylesheets/ & watch 'npm run concat' src/js/"
}
```
