cat data/stories.csv data/comments.csv |
sort -t, -n -k1 |
awk -F, -v OFS="," '
  {
    quarter = substr($2,0,4)"-Q"int(int(substr($2,6,2) - 1) / 3 + 1);

    if (length(users[$4]) != 0) {
      users[$4] = substr(users[$4], 0, 7)"!"quarter
    } else {
      users[$4] = quarter
    }
  }
  END {
    for (user in users) {
      split(users[user], dates,"!")

      if (length(dates[2]) > 0) {
        cohorts[dates[1], dates[2]]++
      } else {
        cohorts[dates[1], dates[1]]++
      }
      if (user == "pg") print users[user], dates[1], dates[2], cohorts[dates[1], dates[2]], cohorts[dates[1],dates[1]]
    }
    for (cohort in cohorts) {
      split(cohort,sep,SUBSEP);
      print sep[1], sep[2], cohorts[cohort]
    }
  }
  '

sort -r --field-separator="," --key=1 ./output/c.csv | awk -F, -v OFS="," '
  {
    temp[$1] += $3
    if ($1 != $2)
      $3 = temp[$1]
    print $0
  }
'

#sort -t, output/c.csv | awk -F, -v OFS="," '{ cohort[$1] = cohort[$1]","$3 } END { for (c in cohort) { print c, cohort[c] } }' | sort -t,
#awk -F, -v OFS="," '
  #{
    #temp[$1] = $3 + temp[$1]
    #if ($1 != $2) {
      #$3 = temp[$1]
    #}
    #print $0
  #}
#'