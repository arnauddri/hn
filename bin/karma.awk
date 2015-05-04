{
  users[$4] += $5
}
END {
  for (user in users) {
    range = substr(users[user], 0, length(users[user]) - 1)
    if (range+0 > 100) {
      ranges[101]++
    } else {
      ranges[range]++
    }
  }
  for (range in ranges) {
    print 10 * range, ranges[range]
  }
}
