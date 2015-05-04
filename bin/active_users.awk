{
  quarter = substr($2,0,4)"-Q" int(int(substr($2,6,2) - 1) / 3 + 1);
  users[$4, quarter] = 1
}
END {
  for (user in users) {
    split(user,sep,SUBSEP);
    active_users[sep[2]]++
  }
  for (quarter in active_users) {
    print quarter, active_users[quarter]
  }
}
