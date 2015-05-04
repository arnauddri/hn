{
  year = substr($2,0,4)
  stories[year,$6] += $5
  occurences[year,$6]++
}
END {
  for (story in stories) {
    split(story,sep,SUBSEP);
    if (occurences[story] > 50) {
      print sep[1], sep[2], stories[story], occurences[story], stories[story] / occurences[story]
    }
  }
}
