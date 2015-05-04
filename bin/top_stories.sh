sort -nr -t, -k5,5 data/stories.csv |
awk -F, -v OFS="," '{ if (a[substr($2,0,4)] < 10) { print $0; a[substr($2,0,4)]++ } }' > top_stories.csv
