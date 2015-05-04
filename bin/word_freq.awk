# cat data/stories.csv | awk -F, -v OFS="," -v timestamp=1325376000  -f ./scripts/word_freq.awk | sort -nr --field-separator="," --key=2 > output/word_freq.csv
BEGIN {
    iterations = 13
  }
{
  $8 = tolower($8)
  split($8, words, " ")
  step = 7948800
  for (i in words) {
    gsub(/[^a-z0-9_ \t]/, "", words[i])
    for (j = 0; j < iterations; j++) {
      if ($3 > timestamp + j * step  && $3 < timestamp + (j + 1) * step) {
        freq[j, words[i]]++
      }
    }
  }
}

END {
  for (word in freq) {
    split(word, sep, SUBSEP);
    if (freq[word] > 100 && seen[sep[2]] != 1) {
      result = sep[2]
      occurences = 0
      for (i = 0; i < iterations; ++i) {
        occurences += freq[i, sep[2]]
        result = result "," freq[i, sep[2]]
      }
      # Removing the most common words and the too rare ones
      if (occurences / iterations < 900 && occurences / iterations > 10) {
        print result
      }
      seen[sep[2]] = 1
    }
  }
}

function abs(value)
{
  return (value<0?-value:value);
}
#
