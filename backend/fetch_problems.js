const fs = require("fs");
const path = require("path");

const PROBLEM_CONFIGS = [
  // Easy (20)
  {
    slug: "two-sum",
    id: 1,
    note: "Input:\nline1: n\nline2: n space-separated integers\nline3: target\nOutput: i j",
    test_cases: [
      { input: "4\n2 7 11 15\n9", output: "0 1" },
      { input: "3\n3 2 4\n6", output: "1 2" }
    ]
  },
  {
    slug: "palindrome-number",
    id: 2,
    note: "Input: single integer x\nOutput: true/false",
    test_cases: [
      { input: "121", output: "true" },
      { input: "-121", output: "false" },
      { input: "10", output: "false" }
    ]
  },
  {
    slug: "fizz-buzz",
    id: 3,
    note: "Input: integer n\nOutput: n lines, each line containing the FizzBuzz output for that number (1-indexed)",
    test_cases: [
      { input: "3", output: "1\n2\nFizz" },
      { input: "5", output: "1\n2\nFizz\n4\nBuzz" }
    ]
  },
  {
    slug: "fibonacci-number",
    id: 4,
    note: "Input: integer n\nOutput: nth Fibonacci number",
    test_cases: [
      { input: "2", output: "1" },
      { input: "4", output: "3" }
    ]
  },
  {
    slug: "climbing-stairs",
    id: 5,
    note: "Input: integer n\nOutput: distinct ways to climb to the top",
    test_cases: [
      { input: "2", output: "2" },
      { input: "3", output: "3" }
    ]
  },
  {
    slug: "valid-parentheses",
    id: 6,
    note: "Input: string of brackets\nOutput: true/false",
    test_cases: [
      { input: "()", output: "true" },
      { input: "()[]{}", output: "true" },
      { input: "(]", output: "false" }
    ]
  },
  {
    slug: "search-insert-position",
    id: 7,
    note: "Input:\nline1: n target\nline2: n sorted integers\nOutput: insert index",
    test_cases: [
      { input: "4 5\n1 3 5 6", output: "2" },
      { input: "4 2\n1 3 5 6", output: "1" }
    ]
  },
  {
    slug: "plus-one",
    id: 8,
    note: "Input:\nline1: n (number of digits)\nline2: n space-separated digits\nOutput: space-separated digits of the plus-one result",
    test_cases: [
      { input: "3\n1 2 3", output: "1 2 4" },
      { input: "1\n9", output: "1 0" }
    ]
  },
  {
    slug: "single-number",
    id: 9,
    note: "Input:\nline1: n (length of array)\nline2: n space-separated integers\nOutput: the single number that appears once",
    test_cases: [
      { input: "3\n2 2 1", output: "1" },
      { input: "5\n4 1 2 1 2", output: "4" }
    ]
  },
  {
    slug: "roman-to-integer",
    id: 10,
    note: "Input: roman numeral string s\nOutput: integer value",
    test_cases: [
      { input: "III", output: "3" },
      { input: "LVIII", output: "58" },
      { input: "MCMXCIV", output: "1994" }
    ]
  },
  {
    slug: "power-of-two",
    id: 11,
    note: "Input: integer n\nOutput: true/false",
    test_cases: [
      { input: "1", output: "true" },
      { input: "16", output: "true" },
      { input: "3", output: "false" }
    ]
  },
  {
    slug: "missing-number",
    id: 12,
    note: "Input:\nline1: n (array length)\nline2: n space-separated integers in range [0, n]\nOutput: the missing number",
    test_cases: [
      { input: "3\n3 0 1", output: "2" },
      { input: "9\n9 6 4 2 3 5 7 0 1", output: "8" }
    ]
  },
  {
    slug: "reverse-string",
    id: 13,
    note: "Input: string s\nOutput: reversed string",
    test_cases: [
      { input: "hello", output: "olleh" },
      { input: "Hannah", output: "hannaH" }
    ]
  },
  {
    slug: "first-unique-character-in-a-string",
    id: 14,
    note: "Input: string s\nOutput: index of first unique char (0-based) or -1",
    test_cases: [
      { input: "leetcode", output: "0" },
      { input: "loveleetcode", output: "2" },
      { input: "aabb", output: "-1" }
    ]
  },
  {
    slug: "happy-number",
    id: 15,
    note: "Input: integer n\nOutput: true/false",
    test_cases: [
      { input: "19", output: "true" },
      { input: "2", output: "false" }
    ]
  },
  {
    slug: "valid-anagram",
    id: 16,
    note: "Input:\nline1: s\nline2: t\nOutput: true/false",
    test_cases: [
      { input: "anagram\nnagaram", output: "true" },
      { input: "rat\ncar", output: "false" }
    ]
  },
  {
    slug: "ugly-number",
    id: 17,
    note: "Input: integer n\nOutput: true/false",
    test_cases: [
      { input: "6", output: "true" },
      { input: "1", output: "true" },
      { input: "14", output: "false" }
    ]
  },
  {
    slug: "power-of-three",
    id: 18,
    note: "Input: integer n\nOutput: true/false",
    test_cases: [
      { input: "27", output: "true" },
      { input: "0", output: "false" },
      { input: "-1", output: "false" }
    ]
  },
  {
    slug: "power-of-four",
    id: 19,
    note: "Input: integer n\nOutput: true/false",
    test_cases: [
      { input: "16", output: "true" },
      { input: "5", output: "false" }
    ]
  },
  {
    slug: "majority-element",
    id: 20,
    note: "Input:\nline1: n\nline2: n space-separated integers\nOutput: majority element",
    test_cases: [
      { input: "3\n3 2 3", output: "3" },
      { input: "7\n2 2 1 1 1 2 2", output: "2" }
    ]
  },

  // Medium (20)
  {
    slug: "longest-substring-without-repeating-characters",
    id: 21,
    note: "Input: single string s\nOutput: integer (length of longest substring)",
    test_cases: [
      { input: "abcabcbb", output: "3" },
      { input: "bbbbb", output: "1" },
      { input: "pwwkew", output: "3" }
    ]
  },
  {
    slug: "3sum",
    id: 22,
    note: "Input:\nline1: n\nline2: n space-separated integers\nOutput: Each line contains 3 space-separated integers (triplets that sum to 0), sorted lexicographically.",
    test_cases: [
      { input: "6\n-1 0 1 2 -1 -4", output: "-1 -1 2\n-1 0 1" },
      { input: "3\n0 1 1", output: "" }
    ]
  },
  {
    slug: "container-with-most-water",
    id: 23,
    note: "Input:\nline1: n\nline2: n space-separated integers\nOutput: integer (maximum water)",
    test_cases: [
      { input: "9\n1 8 6 2 5 4 8 3 7", output: "49" },
      { input: "2\n1 1", output: "1" }
    ]
  },
  {
    slug: "reverse-integer",
    id: 24,
    note: "Input: integer x\nOutput: reversed integer (or 0 if it overflows 32-bit signed range)",
    test_cases: [
      { input: "123", output: "321" },
      { input: "-123", output: "-321" },
      { input: "120", output: "21" }
    ]
  },
  {
    slug: "integer-to-roman",
    id: 25,
    note: "Input: integer num\nOutput: Roman numeral string",
    test_cases: [
      { input: "3754", output: "MMMDCCLIV" },
      { input: "58", output: "LVIII" },
      { input: "1994", output: "MCMXCIV" }
    ]
  },
  {
    slug: "house-robber",
    id: 26,
    note: "Input:\nline1: n\nline2: n space-separated house values\nOutput: max money robbed without alerting security",
    test_cases: [
      { input: "4\n1 2 3 1", output: "4" },
      { input: "5\n2 7 9 3 1", output: "12" }
    ]
  },
  {
    slug: "coin-change",
    id: 27,
    note: "Input:\nline1: n target\nline2: n space-separated coin denominations\nOutput: minimum coins needed, or -1",
    test_cases: [
      { input: "3 11\n1 2 5", output: "3" },
      { input: "1 3\n2", output: "-1" },
      { input: "1 0\n1", output: "0" }
    ]
  },
  {
    slug: "search-a-2d-matrix",
    id: 28,
    note: "Input:\nline1: m n target\nnext m lines: n space-separated integers per row\nOutput: true/false",
    test_cases: [
      { input: "3 4 3\n1 3 5 7\n10 11 16 20\n23 30 34 60", output: "true" },
      { input: "3 4 13\n1 3 5 7\n10 11 16 20\n23 30 34 60", output: "false" }
    ]
  },
  {
    slug: "rotate-array",
    id: 29,
    note: "Input:\nline1: n k\nline2: n space-separated integers\nOutput: rotated array elements separated by spaces",
    test_cases: [
      { input: "7 3\n1 2 3 4 5 6 7", output: "5 6 7 1 2 3 4" },
      { input: "4 2\n-1 -100 3 99", output: "3 99 -1 -100" }
    ]
  },
  {
    slug: "house-robber-ii",
    id: 30,
    note: "Input:\nline1: n\nline2: n house values\nOutput: max money robbed in a circular layout",
    test_cases: [
      { input: "3\n2 3 2", output: "3" },
      { input: "4\n1 2 3 1", output: "4" }
    ]
  },
  {
    slug: "subsets",
    id: 31,
    note: "Input:\nline1: n\nline2: n unique space-separated integers\nOutput: all subsets (one per line, elements space-separated), ordered by length then lexicographically",
    test_cases: [
      { input: "3\n1 2 3", output: "\n1\n2\n3\n1 2\n1 3\n2 3\n1 2 3" }
    ]
  },
  {
    slug: "permutations",
    id: 32,
    note: "Input:\nline1: n\nline2: n space-separated integers\nOutput: all permutations printed lexicographically, elements space-separated",
    test_cases: [
      { input: "3\n1 2 3", output: "1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1" }
    ]
  },
  {
    slug: "minimum-path-sum",
    id: 33,
    note: "Input:\nline1: m n (dimensions)\nnext m lines: n space-separated integers per row\nOutput: minimum path sum from top-left to bottom-right",
    test_cases: [
      { input: "3 3\n1 3 1\n1 5 1\n4 2 1", output: "7" }
    ]
  },
  {
    slug: "unique-paths",
    id: 34,
    note: "Input: m n (grid dimensions)\nOutput: number of unique paths to bottom-right",
    test_cases: [
      { input: "3 7", output: "28" },
      { input: "3 2", output: "3" }
    ]
  },
  {
    slug: "integer-break",
    id: 35,
    note: "Input: integer n\nOutput: maximum product possible by splitting n into k positive integers",
    test_cases: [
      { input: "2", output: "1" },
      { input: "10", output: "36" }
    ]
  },
  {
    slug: "decode-ways",
    id: 36,
    note: "Input: string of digits s\nOutput: number of ways to decode it",
    test_cases: [
      { input: "12", output: "2" },
      { input: "226", output: "3" },
      { input: "06", output: "0" }
    ]
  },
  {
    slug: "perfect-squares",
    id: 37,
    note: "Input: integer n\nOutput: least number of perfect square numbers that sum to n",
    test_cases: [
      { input: "12", output: "3" },
      { input: "13", output: "2" }
    ]
  },
  {
    slug: "word-break",
    id: 38,
    note: "Input:\nline1: string s\nline2: dictionary size n\nline3: n dictionary words space-separated\nOutput: true/false",
    test_cases: [
      { input: "leetcode\n2\nleet code", output: "true" },
      { input: "applepenapple\n2\napple pen", output: "true" },
      { input: "catsandog\n5\ncats dog sand and cat", output: "false" }
    ]
  },
  {
    slug: "longest-common-prefix",
    id: 39,
    note: "Input:\nline1: n\nnext n lines: strings\nOutput: longest common prefix string",
    test_cases: [
      { input: "3\nflower\nflow\nflight", output: "fl" },
      { input: "3\ndog\nracecar\ncar", output: "" }
    ]
  },
  {
    slug: "maximum-subarray",
    id: 40,
    note: "Input:\nline1: n\nline2: n space-separated integers\nOutput: maximum subarray sum",
    test_cases: [
      { input: "9\n-2 1 -3 4 -1 2 1 -5 4", output: "6" },
      { input: "1\n1", output: "1" }
    ]
  },

  // Hard (10)
  {
    slug: "median-of-two-sorted-arrays",
    id: 41,
    note: "Input:\nline1: m n (lengths of two arrays)\nline2: m space-separated integers (nums1)\nline3: n space-separated integers (nums2)\nOutput: double (median, printed with 5 decimal places)",
    test_cases: [
      { input: "2 1\n1 3\n2", output: "2.00000" },
      { input: "2 2\n1 2\n3 4", output: "2.50000" }
    ]
  },
  {
    slug: "trapping-rain-water",
    id: 42,
    note: "Input:\nline1: n\nline2: n space-separated integers\nOutput: integer (trapped water)",
    test_cases: [
      { input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", output: "6" },
      { input: "6\n4 2 0 3 2 5", output: "9" }
    ]
  },
  {
    slug: "edit-distance",
    id: 43,
    note: "Input:\nline1: word1\nline2: word2\nOutput: minimum edit operations count",
    test_cases: [
      { input: "horse\nros", output: "3" },
      { input: "intention\nexecution", output: "5" }
    ]
  },
  {
    slug: "longest-valid-parentheses",
    id: 44,
    note: "Input: string of brackets\nOutput: length of longest valid parentheses substring",
    test_cases: [
      { input: "(()", output: "2" },
      { input: ")()())", output: "4" },
      { input: "", output: "0" }
    ]
  },
  {
    slug: "first-missing-positive",
    id: 45,
    note: "Input:\nline1: n\nline2: n space-separated integers\nOutput: smallest missing positive integer",
    test_cases: [
      { input: "3\n1 2 0", output: "3" },
      { input: "4\n3 4 -1 1", output: "2" },
      { input: "5\n7 8 9 11 12", output: "1" }
    ]
  },
  {
    slug: "n-queens",
    id: 46,
    note: "Input: integer n\nOutput: number of distinct solutions for placing n queens on an n x n chessboard",
    test_cases: [
      { input: "4", output: "2" },
      { input: "1", output: "1" }
    ]
  },
  {
    slug: "scramble-string",
    id: 47,
    note: "Input:\nline1: s1\nline2: s2\nOutput: true/false",
    test_cases: [
      { input: "great\nrgeat", output: "true" },
      { input: "abcde\ncaebd", output: "false" }
    ]
  },
  {
    slug: "max-points-on-a-line",
    id: 48,
    note: "Input:\nline1: n\nnext n lines: x y coordinate pairs\nOutput: maximum number of points on a single line",
    test_cases: [
      { input: "3\n1 1\n2 2\n3 3", output: "3" },
      { input: "6\n1 1\n3 2\n5 3\n4 1\n2 3\n1 4", output: "4" }
    ]
  },
  {
    slug: "wildcard-matching",
    id: 49,
    note: "Input:\nline1: s\nline2: p (pattern containing ? or *)\nOutput: true/false",
    test_cases: [
      { input: "aa\na", output: "false" },
      { input: "aa\n*", output: "true" },
      { input: "cb\n?a", output: "false" }
    ]
  },
  {
    slug: "merge-k-sorted-lists",
    id: 50,
    note: "Input:\nline1: k (number of lists)\nnext k lines: first element is count n, followed by n space-separated elements\nOutput: space-separated elements of the merged sorted list",
    test_cases: [
      { input: "3\n3 1 4 5\n3 1 3 4\n2 2 6", output: "1 1 2 3 4 4 5 6" }
    ]
  }
];

function cleanHtml(html) {
  if (!html) return "";
  return html.trim();
}

async function fetchQuestion(slug) {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        title
        content
        difficulty
      }
    }
  `;

  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    },
    body: JSON.stringify({ query, variables: { titleSlug: slug } })
  });

  const json = await response.json();
  if (json.errors) {
    throw new Error(`GraphQL Error: ${JSON.stringify(json.errors)}`);
  }
  return json.data.question;
}

async function main() {
  console.log("Fetching questions from LeetCode GraphQL...");
  const problems = [];

  for (const config of PROBLEM_CONFIGS) {
    try {
      console.log(`Fetching ${config.slug}...`);
      const leetCodeQuestion = await fetchQuestion(config.slug);
      
      problems.push({
        id: config.id,
        title: leetCodeQuestion.title,
        difficulty: leetCodeQuestion.difficulty,
        statement: cleanHtml(leetCodeQuestion.content),
        note: config.note,
        test_cases: config.test_cases
      });
      // Sleep slightly to respect rate limits
      await new Promise(r => setTimeout(r, 400));
    } catch (e) {
      console.error(`Failed to fetch ${config.slug}:`, e.message);
    }
  }

  const outputPath = path.join(__dirname, "problems.json");
  fs.writeFileSync(outputPath, JSON.stringify(problems, null, 2), "utf8");
  console.log(`Successfully wrote ${problems.length} problems to ${outputPath}`);
}

main().catch(console.error);
