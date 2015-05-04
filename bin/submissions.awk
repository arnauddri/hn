{
  quarter = substr($2,0,4)"-Q" int(int(substr($2,6,2) - 1) / 3 + 1);
  if (NF == 8) {
    stories[quarter]++
  } else {
    comments[quarter]++
  }
}
END {
  print "quarter,stories,comments"
  for (quarter in stories) {
    print quarter, stories[quarter], comments[quarter]
  }
}
