import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data for clean seed
  await prisma.codeDraft.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.interviewQuestion.deleteMany();
  await prisma.interviewSession.deleteMany();
  await prisma.testCase.deleteMany();
  await prisma.question.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const demoUser = await prisma.user.create({
    data: {
      email: 'alex.developer@interviewlab.dev',
      name: 'Alex Rivera',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    },
  });

  const secondaryUser = await prisma.user.create({
    data: {
      email: 'jordan.coder@interviewlab.dev',
      name: 'Jordan Chen',
      passwordHash,
    },
  });

  console.log('✅ Created demo users:', demoUser.email, secondaryUser.email);

  // 18 Original Questions across all 9 required topics
  const questionsData = [
    // 1. Arrays: Subarray Maximum Profit
    {
      slug: 'subarray-maximum-profit',
      title: 'Subarray Maximum Profit',
      difficulty: 'Easy',
      topics: ['Arrays', 'Dynamic Programming'],
      description: `Given an integer array \`nums\`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

A subarray is a contiguous non-empty sequence of elements within an array.`,
      inputFormat: 'A list of integers `nums`. Length: 1 <= nums.length <= 10^5.',
      outputFormat: 'An integer representing the maximum subarray sum.',
      constraints: '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
      examples: [
        {
          input: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]',
          output: '6',
          explanation: 'The subarray [4, -1, 2, 1] has the largest sum = 6.'
        },
        {
          input: '[1]',
          output: '1',
          explanation: 'The single element array has maximum sum 1.'
        },
        {
          input: '[5, 4, -1, 7, 8]',
          output: '23',
          explanation: 'The entire array sum is 23.'
        }
      ],
      starterCode: {
        javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubarraySum(nums) {
  // Write your code here
  let currentSum = nums[0];
  let maxSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}`,
        python: `def maxSubarraySum(nums: list[int]) -> int:
    # Write your code here
    current_sum = nums[0]
    max_sum = nums[0]
    for x in nums[1:]:
        current_sum = max(x, current_sum + x)
        max_sum = max(max_sum, current_sum)
    return max_sum`
      },
      hints: [
        'Think about Kadane\'s algorithm.',
        'At each index i, should you extend the previous subarray or start fresh from nums[i]?',
        'Maintain a running local maximum and a global maximum.'
      ],
      editorial: `### Optimal Approach: Kadane's Algorithm
Kadane's algorithm computes the maximum subarray ending at each index in O(N) time and O(1) space.
At index \`i\`, the maximum sum of a subarray ending at \`i\` is \`max(nums[i], currentSum + nums[i])\`.
We update \`maxSum = max(maxSum, currentSum)\` at every step.

**Complexity Analysis**:
- Time Complexity: O(N) single pass.
- Space Complexity: O(1) auxiliary variables.`,
      testCases: [
        { input: JSON.stringify([[-2, 1, -3, 4, -1, 2, 1, -5, 4]]), expectedOutput: '6', isHidden: false },
        { input: JSON.stringify([[1]]), expectedOutput: '1', isHidden: false },
        { input: JSON.stringify([[5, 4, -1, 7, 8]]), expectedOutput: '23', isHidden: false },
        { input: JSON.stringify([[-5, -2, -8, -1, -4]]), expectedOutput: '-1', isHidden: true },
        { input: JSON.stringify([[0, 0, 0, 0]]), expectedOutput: '0', isHidden: true },
        { input: JSON.stringify([[100, -20, 50, -10, 30]]), expectedOutput: '150', isHidden: true },
      ]
    },

    // 2. Arrays: Find Pivot Index In Rotated Stream
    {
      slug: 'find-pivot-index-in-rotated-stream',
      title: 'Find Minimum in Rotated Sorted Array',
      difficulty: 'Medium',
      topics: ['Arrays', 'Searching'],
      description: `Suppose an array of length \`n\` sorted in ascending order is rotated between 1 and \`n\` times.
Given the sorted rotated array \`nums\` of unique elements, return the minimum element of this array.

You must write an algorithm that runs in \`O(log n)\` time.`,
      inputFormat: 'An array of unique integers `nums`. Length: 1 <= nums.length <= 5000.',
      outputFormat: 'The minimum integer in the array.',
      constraints: '1 <= nums.length <= 5000\n-5000 <= nums[i] <= 5000\nAll values are unique.',
      examples: [
        {
          input: '[3, 4, 5, 1, 2]',
          output: '1',
          explanation: 'The original array was [1, 2, 3, 4, 5] rotated 3 times.'
        },
        {
          input: '[4, 5, 6, 7, 0, 1, 2]',
          output: '0',
          explanation: 'The minimum element is 0.'
        },
        {
          input: '[11, 13, 15, 17]',
          output: '11',
          explanation: 'The array was rotated 4 times (restored to original).'
        }
      ],
      starterCode: {
        javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function findMin(nums) {
  // Write your code here
  let left = 0;
  let right = nums.length - 1;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] > nums[right]) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return nums[left];
}`,
        python: `def findMin(nums: list[int]) -> int:
    # Write your code here
    left, right = 0, len(nums) - 1
    while left < right:
        mid = (left + right) // 2
        if nums[mid] > nums[right]:
            left = mid + 1
        else:
            right = mid
    return nums[left]`
      },
      hints: [
        'Notice that the array is divided into two sorted subarrays.',
        'Compare the middle element with the rightmost element nums[right].',
        'If nums[mid] > nums[right], the inflection point must be to the right of mid.'
      ],
      editorial: `### Binary Search Approach
By comparing \`nums[mid]\` with \`nums[right]\`, we can determine which half contains the pivot:
1. If \`nums[mid] > nums[right]\`, the minimum element must lie strictly in \`mid + 1\` to \`right\`.
2. Otherwise, \`nums[mid] <= nums[right]\`, so the minimum element is in \`left\` to \`mid\`.

**Complexity Analysis**:
- Time Complexity: O(log N)
- Space Complexity: O(1)`,
      testCases: [
        { input: JSON.stringify([[3, 4, 5, 1, 2]]), expectedOutput: '1', isHidden: false },
        { input: JSON.stringify([[4, 5, 6, 7, 0, 1, 2]]), expectedOutput: '0', isHidden: false },
        { input: JSON.stringify([[11, 13, 15, 17]]), expectedOutput: '11', isHidden: false },
        { input: JSON.stringify([[2, 1]]), expectedOutput: '1', isHidden: true },
        { input: JSON.stringify([[1]]), expectedOutput: '1', isHidden: true },
        { input: JSON.stringify([[5, 1, 2, 3, 4]]), expectedOutput: '1', isHidden: true },
      ]
    },

    // 3. Strings: Valid Palindrome After Single Mutation
    {
      slug: 'valid-palindrome-single-mutation',
      title: 'Valid Palindrome After Single Deletion',
      difficulty: 'Easy',
      topics: ['Strings', 'Two Pointers'],
      description: `Given a string \`s\`, return \`true\` if the \`s\` can be a palindrome after deleting at most one character from it.

The string consists of lowercase English letters only.`,
      inputFormat: 'A lowercase alphanumeric string `s`. Length: 1 <= s.length <= 10^5.',
      outputFormat: 'Boolean `true` or `false`.',
      constraints: '1 <= s.length <= 10^5\ns consists of lowercase English letters.',
      examples: [
        {
          input: '"aba"',
          output: 'true',
          explanation: 'It is already a palindrome.'
        },
        {
          input: '"abca"',
          output: 'true',
          explanation: 'You could delete the character \'c\' to get "aba".'
        },
        {
          input: '"abc"',
          output: 'false',
          explanation: 'Cannot become palindrome with at most 1 deletion.'
        }
      ],
      starterCode: {
        javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function validPalindrome(s) {
  // Write your code here
  function isPal(str, l, r) {
    while (l < r) {
      if (str[l] !== str[r]) return false;
      l++;
      r--;
    }
    return true;
  }

  let left = 0, right = s.length - 1;
  while (left < right) {
    if (s[left] !== s[right]) {
      return isPal(s, left + 1, right) || isPal(s, left, right - 1);
    }
    left++;
    right--;
  }
  return true;
}`,
        python: `def validPalindrome(s: str) -> bool:
    # Write your code here
    def is_pal(l: int, r: int) -> bool:
        while l < r:
            if s[l] != s[r]:
                return False
            l += 1
            r -= 1
        return True

    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return is_pal(left + 1, right) or is_pal(left, right - 1)
        left += 1
        right -= 1
    return True`
      },
      hints: [
        'Use two pointers starting from both ends.',
        'When characters differ, you have two choices: delete left or delete right.',
        'Check if either remaining substring is a valid palindrome.'
      ],
      editorial: `### Two Pointers Greedy Check
We compare \`s[left]\` and \`s[right]\`. If they match, increment \`left\` and decrement \`right\`.
When they mismatch, we check whether either \`s[left+1...right]\` or \`s[left...right-1]\` is a palindrome.

**Complexity Analysis**:
- Time: O(N)
- Space: O(1)`,
      testCases: [
        { input: JSON.stringify(['aba']), expectedOutput: 'true', isHidden: false },
        { input: JSON.stringify(['abca']), expectedOutput: 'true', isHidden: false },
        { input: JSON.stringify(['abc']), expectedOutput: 'false', isHidden: false },
        { input: JSON.stringify(['deeee']), expectedOutput: 'true', isHidden: true },
        { input: JSON.stringify(['racecar']), expectedOutput: 'true', isHidden: true },
        { input: JSON.stringify(['eeccccbebaeeabebccceea']), expectedOutput: 'false', isHidden: true },
      ]
    },

    // 4. Strings: Longest Unique Segment
    {
      slug: 'longest-unique-segment',
      title: 'Longest Substring Without Repeating Characters',
      difficulty: 'Medium',
      topics: ['Strings', 'Hash Maps', 'Two Pointers'],
      description: `Given a string \`s\`, find the length of the longest substring without repeating characters.

A substring is a contiguous sequence of characters within a string.`,
      inputFormat: 'A string `s`. Length: 0 <= s.length <= 5 * 10^4.',
      outputFormat: 'An integer representing the maximum length.',
      constraints: '0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols, and spaces.',
      examples: [
        {
          input: '"abcabcbb"',
          output: '3',
          explanation: 'The answer is "abc", with the length of 3.'
        },
        {
          input: '"bbbbb"',
          output: '1',
          explanation: 'The answer is "b", with the length of 1.'
        },
        {
          input: '"pwwkew"',
          output: '3',
          explanation: 'The answer is "wke", with the length of 3.'
        }
      ],
      starterCode: {
        javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  // Write your code here
  const map = new Map();
  let maxLen = 0;
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    if (map.has(char) && map.get(char) >= start) {
      start = map.get(char) + 1;
    }
    map.set(char, i);
    maxLen = Math.max(maxLen, i - start + 1);
  }
  return maxLen;
}`,
        python: `def lengthOfLongestSubstring(s: str) -> int:
    # Write your code here
    char_map = {}
    max_len = 0
    start = 0
    for i, char in enumerate(s):
        if char in char_map and char_map[char] >= start:
            start = char_map[char] + 1
        char_map[char] = i
        max_len = max(max_len, i - start + 1)
    return max_len`
      },
      hints: [
        'Use a sliding window with two pointers: start and current index.',
        'Keep track of the last seen index of each character using a Hash Map.',
        'When a duplicate is found within the current window, move the start pointer past its previous index.'
      ],
      editorial: `### Sliding Window with Hash Map
We maintain a window \`[start, i]\`. If character \`s[i]\` was seen at index \`j >= start\`, we advance \`start = j + 1\`.
We update the last seen index in the hash map and record \`maxLen = max(maxLen, i - start + 1)\`.

**Complexity Analysis**:
- Time: O(N)
- Space: O(min(M, N)) where M is alphabet size.`,
      testCases: [
        { input: JSON.stringify(['abcabcbb']), expectedOutput: '3', isHidden: false },
        { input: JSON.stringify(['bbbbb']), expectedOutput: '1', isHidden: false },
        { input: JSON.stringify(['pwwkew']), expectedOutput: '3', isHidden: false },
        { input: JSON.stringify(['']), expectedOutput: '0', isHidden: true },
        { input: JSON.stringify([' ']), expectedOutput: '1', isHidden: true },
        { input: JSON.stringify(['dvdf']), expectedOutput: '3', isHidden: true },
      ]
    },

    // 5. Hash Maps: Two Sum Target Pair Finder
    {
      slug: 'two-sum-target-pair',
      title: 'Two Sum Target Pair Finder',
      difficulty: 'Easy',
      topics: ['Hash Maps', 'Arrays'],
      description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.
You can return the answer in any order (sorted indices [i, j] where i < j).`,
      inputFormat: 'An integer array `nums` and an integer `target`.',
      outputFormat: 'Array of two indices `[i, j]`.',
      constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nExactly one valid answer exists.',
      examples: [
        {
          input: '[2, 7, 11, 15], 9',
          output: '[0, 1]',
          explanation: 'nums[0] + nums[1] == 9, we return [0, 1].'
        },
        {
          input: '[3, 2, 4], 6',
          output: '[1, 2]',
          explanation: 'nums[1] + nums[2] == 6, we return [1, 2].'
        },
        {
          input: '[3, 3], 6',
          output: '[0, 1]',
          explanation: 'nums[0] + nums[1] == 6.'
        }
      ],
      starterCode: {
        javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your code here
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }
  return [];
}`,
        python: `def twoSum(nums: list[int], target: int) -> list[int]:
    # Write your code here
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`
      },
      hints: [
        'A brute-force solution is O(N^2). Can we do better with a Hash Table?',
        'As you iterate through the array, check if target - nums[i] is already in your map.',
        'If it is, you found the pair!'
      ],
      editorial: `### One-Pass Hash Table
Store each element and its index in a hash map. For each number \`nums[i]\`, calculate \`complement = target - nums[i]\`.
If \`complement\` exists in the hash map, return \`[map[complement], i]\`.

**Complexity Analysis**:
- Time: O(N)
- Space: O(N)`,
      testCases: [
        { input: JSON.stringify([[2, 7, 11, 15], 9]), expectedOutput: '[0,1]', isHidden: false },
        { input: JSON.stringify([[3, 2, 4], 6]), expectedOutput: '[1,2]', isHidden: false },
        { input: JSON.stringify([[3, 3], 6]), expectedOutput: '[0,1]', isHidden: false },
        { input: JSON.stringify([[-1, -2, -3, -4, -5], -8]), expectedOutput: '[2,4]', isHidden: true },
        { input: JSON.stringify([[1000000, 500, -1000000, 200], 700]), expectedOutput: '[1,3]', isHidden: true },
      ]
    },

    // 6. Hash Maps: Group Anagram Signatures
    {
      slug: 'group-anagram-signatures',
      title: 'Group Anagram Signatures',
      difficulty: 'Medium',
      topics: ['Hash Maps', 'Strings', 'Sorting'],
      description: `Given an array of strings \`strs\`, group the anagrams together. You can return the answer in any order, with inner groups sorted lexicographically.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
      inputFormat: 'An array of lowercase strings `strs`. Length: 1 <= strs.length <= 10^4.',
      outputFormat: 'A list of lists of strings, where each list contains grouped anagrams sorted alphabetically.',
      constraints: '1 <= strs.length <= 10^4\n0 <= strs[i].length <= 100\nstrs[i] consists of lowercase English letters.',
      examples: [
        {
          input: '["eat", "tea", "tan", "ate", "nat", "bat"]',
          output: '[["ate", "eat", "tea"], ["bat"], ["nat", "tan"]]',
          explanation: '"eat", "tea", and "ate" are anagrams; "tan" and "nat" are anagrams; "bat" is alone.'
        },
        {
          input: '[""]',
          output: '[[""]]',
          explanation: 'Empty string forms its own group.'
        },
        {
          input: '["a"]',
          output: '[["a"]]',
          explanation: 'Single string group.'
        }
      ],
      starterCode: {
        javascript: `/**
 * @param {string[]} strs
 * @return {string[][]}
 */
function groupAnagrams(strs) {
  // Write your code here
  const groups = new Map();
  for (const s of strs) {
    const key = s.split('').sort().join('');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }
  const result = Array.from(groups.values()).map(arr => arr.sort());
  return result.sort((a, b) => a[0].localeCompare(b[0]));
}`,
        python: `def groupAnagrams(strs: list[str]) -> list[list[str]]:
    # Write your code here
    groups = {}
    for s in strs:
        key = "".join(sorted(s))
        if key not in groups:
            groups[key] = []
        groups[key].append(s)
    result = [sorted(group) for group in groups.values()]
    result.sort(key=lambda x: x[0] if x else "")
    return result`
      },
      hints: [
        'Two words are anagrams if and only if their sorted strings are equal.',
        'Alternatively, their character frequency counts are identical.',
        'Use the sorted string or count tuple as the hash map key.'
      ],
      editorial: `### Categorize by Sorted String
For each string, sort its characters to produce a canonical representation (e.g. \`"eat" -> "aet"\`).
Use this canonical string as a key in a hash map.

**Complexity Analysis**:
- Time: O(N * K log K) where N is number of strings and K is max length of string.
- Space: O(N * K) to store grouped strings.`,
      testCases: [
        { input: JSON.stringify([["eat", "tea", "tan", "ate", "nat", "bat"]]), expectedOutput: '[["ate","eat","tea"],["bat"],["nat","tan"]]', isHidden: false },
        { input: JSON.stringify([[""]]), expectedOutput: '[[""]]', isHidden: false },
        { input: JSON.stringify([["a"]]), expectedOutput: '[["a"]]', isHidden: false },
        { input: JSON.stringify([["cab", "tin", "pew", "duh", "may", "ill", "buy", "bar", "max", "doc"]]), expectedOutput: '[["bar"],["buy"],["cab"],["doc"],["duh"],["ill"],["max"],["may"],["pew"],["tin"]]', isHidden: true },
      ]
    },

    // 7. Searching: Binary Search First Faulty Build
    {
      slug: 'binary-search-first-bad-build',
      title: 'Find First Bad Version',
      difficulty: 'Easy',
      topics: ['Searching'],
      description: `You are a product manager leading a team to develop a new release. Since each version is developed based on the previous version, all versions after a bad version are also bad.

Suppose you have \`n\` versions \`[1, 2, ..., n]\` and a list of boolean flags representing whether version \`i\` is bad (1-indexed).
Given an integer \`n\` and an array \`badStatus\` where \`badStatus[i]\` is boolean indicating whether version \`i + 1\` is bad, find the first bad version index (1-indexed).`,
      inputFormat: 'An integer `n` and array of booleans `isBadList` of length `n`.',
      outputFormat: 'Integer index (1-indexed) of the first bad version.',
      constraints: '1 <= n <= 10^5\nisBadList contains at least one `true` value and once a version is bad, all subsequent are bad.',
      examples: [
        {
          input: '5, [false, false, false, true, true]',
          output: '4',
          explanation: 'Version 4 is the first bad version.'
        },
        {
          input: '1, [true]',
          output: '1',
          explanation: 'Version 1 is the first bad version.'
        }
      ],
      starterCode: {
        javascript: `/**
 * @param {number} n
 * @param {boolean[]} isBadList
 * @return {number}
 */
function firstBadVersion(n, isBadList) {
  // Write your code here
  let left = 1;
  let right = n;
  while (left < right) {
    const mid = Math.floor(left + (right - left) / 2);
    if (isBadList[mid - 1]) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }
  return left;
}`,
        python: `def firstBadVersion(n: int, isBadList: list[bool]) -> int:
    # Write your code here
    left, right = 1, n
    while left < right:
        mid = left + (right - left) // 2
        if isBadList[mid - 1]:
            right = mid
        else:
            left = mid + 1
    return left`
      },
      hints: [
        'Notice the monotonic nature: [false, false, ..., true, true, true].',
        'Use binary search to minimize API/array inspections to O(log n).',
        'Avoid integer overflow in mid computation.'
      ],
      editorial: `### Binary Search Boundary Finding
We search for the lower bound of \`true\` values. When \`isBad(mid)\` is true, the first bad version could be \`mid\` or to the left, so \`right = mid\`.
When false, it must be strictly to the right, so \`left = mid + 1\`.

**Complexity Analysis**:
- Time: O(log N)
- Space: O(1)`,
      testCases: [
        { input: JSON.stringify([5, [false, false, false, true, true]]), expectedOutput: '4', isHidden: false },
        { input: JSON.stringify([1, [true]]), expectedOutput: '1', isHidden: false },
        { input: JSON.stringify([6, [false, true, true, true, true, true]]), expectedOutput: '2', isHidden: true },
        { input: JSON.stringify([10, [false, false, false, false, false, false, false, false, false, true]]), expectedOutput: '10', isHidden: true },
      ]
    },

    // 8. Searching: Search a 2D Matrix
    {
      slug: 'search-in-sorted-2d-matrix',
      title: 'Search in Sorted 2D Matrix',
      difficulty: 'Medium',
      topics: ['Searching', 'Arrays'],
      description: `You are given an \`m x n\` integer matrix \`matrix\` with the following two properties:
1. Each row is sorted in non-decreasing order.
2. The first integer of each row is greater than the last integer of the previous row.

Given an integer \`target\`, return \`true\` if \`target\` is in \`matrix\` or \`false\` otherwise.
You must write a solution in \`O(log(m * n))\` time complexity.`,
      inputFormat: 'A 2D array of integers `matrix` and an integer `target`.',
      outputFormat: 'Boolean `true` or `false`.',
      constraints: 'm == matrix.length\nn == matrix[i].length\n1 <= m, n <= 100\n-10^4 <= matrix[i][j], target <= 10^4',
      examples: [
        {
          input: '[[1,3,5,7],[10,11,16,20],[23,30,34,60]], 3',
          output: 'true',
          explanation: '3 is located at row 0, col 1.'
        },
        {
          input: '[[1,3,5,7],[10,11,16,20],[23,30,34,60]], 13',
          output: 'false',
          explanation: '13 is not present in the matrix.'
        }
      ],
      starterCode: {
        javascript: `/**
 * @param {number[][]} matrix
 * @param {number} target
 * @return {boolean}
 */
function searchMatrix(matrix, target) {
  // Write your code here
  if (!matrix.length || !matrix[0].length) return false;
  const m = matrix.length;
  const n = matrix[0].length;
  let left = 0;
  let right = m * n - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const row = Math.floor(mid / n);
    const col = mid % n;
    const val = matrix[row][col];

    if (val === target) return true;
    if (val < target) left = mid + 1;
    else right = mid - 1;
  }
  return false;
}`,
        python: `def searchMatrix(matrix: list[list[int]], target: int) -> bool:
    # Write your code here
    if not matrix or not matrix[0]:
        return False
    m, n = len(matrix), len(matrix[0])
    left, right = 0, m * n - 1

    while left <= right:
        mid = (left + right) // 2
        row, col = mid // n, mid % n
        val = matrix[row][col]

        if val == target:
            return True
        elif val < target:
            left = mid + 1
        else:
            right = mid - 1
    return False`
      },
      hints: [
        'Treat the 2D matrix as a virtual 1D sorted array of length m * n.',
        'Convert 1D index `mid` to 2D coordinates: `row = mid // n`, `col = mid % n`.',
        'Standard binary search works in O(log(m * n)).'
      ],
      editorial: `### Virtual 1D Binary Search
Since the matrix is globally sorted, any index \`k\` from \`0\` to \`m*n - 1\` maps to \`matrix[k // n][k % n]\`.
We execute standard binary search over this virtual space.

**Complexity Analysis**:
- Time: O(log(M * N))
- Space: O(1)`,
      testCases: [
        { input: JSON.stringify([[[1,3,5,7],[10,11,16,20],[23,30,34,60]], 3]), expectedOutput: 'true', isHidden: false },
        { input: JSON.stringify([[[1,3,5,7],[10,11,16,20],[23,30,34,60]], 13]), expectedOutput: 'false', isHidden: false },
        { input: JSON.stringify([[[1]], 1]), expectedOutput: 'true', isHidden: true },
        { input: JSON.stringify([[[1]], 2]), expectedOutput: 'false', isHidden: true },
        { input: JSON.stringify([[[1, 3]], 3]), expectedOutput: 'true', isHidden: true },
      ]
    },

    // 9. Sorting: Merge Overlapping Conference Intervals
    {
      slug: 'merge-overlapping-intervals',
      title: 'Merge Overlapping Intervals',
      difficulty: 'Medium',
      topics: ['Sorting', 'Arrays'],
      description: `Given an array of \`intervals\` where \`intervals[i] = [starti, endi]\`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.`,
      inputFormat: 'A list of intervals `[[start, end], ...]`.',
      outputFormat: 'A merged list of intervals sorted by start time.',
      constraints: '1 <= intervals.length <= 10^4\nintervals[i].length == 2\n0 <= starti <= endi <= 10^4',
      examples: [
        {
          input: '[[1,3],[2,6],[8,10],[15,18]]',
          output: '[[1,6],[8,10],[15,18]]',
          explanation: 'Since intervals [1,3] and [2,6] overlap, merge them into [1,6].'
        },
        {
          input: '[[1,4],[4,5]]',
          output: '[[1,5]]',
          explanation: 'Intervals [1,4] and [4,5] are considered overlapping.'
        }
      ],
      starterCode: {
        javascript: `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
function merge(intervals) {
  // Write your code here
  if (!intervals.length) return [];
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const last = merged[merged.length - 1];

    if (current[0] <= last[1]) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      merged.push(current);
    }
  }
  return merged;
}`,
        python: `def merge(intervals: list[list[int]]) -> list[list[int]]:
    # Write your code here
    if not intervals:
        return []
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]

    for current in intervals[1:]:
        last = merged[-1]
        if current[0] <= last[1]:
            last[1] = max(last[1], current[1])
        else:
            merged.append(current)
    return merged`
      },
      hints: [
        'Sort intervals by their starting points first.',
        'Once sorted, compare each interval with the last interval in your merged list.',
        'If current start <= last end, update last end to max(last end, current end).'
      ],
      editorial: `### Sorting and Greedy Merge
By sorting intervals by start time, overlapping intervals will always be contiguous.
We iterate through and merge whenever \`current[0] <= last[1]\`.

**Complexity Analysis**:
- Time: O(N log N) due to sorting.
- Space: O(N) for output.`,
      testCases: [
        { input: JSON.stringify([[[1,3],[2,6],[8,10],[15,18]]]), expectedOutput: '[[1,6],[8,10],[15,18]]', isHidden: false },
        { input: JSON.stringify([[[1,4],[4,5]]]), expectedOutput: '[[1,5]]', isHidden: false },
        { input: JSON.stringify([[[1,4],[0,4]]]), expectedOutput: '[[0,4]]', isHidden: true },
        { input: JSON.stringify([[[1,4],[2,3]]]), expectedOutput: '[[1,4]]', isHidden: true },
        { input: JSON.stringify([[[6,8],[1,9],[2,4],[4,7]]]), expectedOutput: '[[1,9]]', isHidden: true },
      ]
    },

    // 10. Sorting: Kth Largest Value in Buffer
    {
      slug: 'kth-largest-element-in-array',
      title: 'Kth Largest Element in an Array',
      difficulty: 'Medium',
      topics: ['Sorting', 'Arrays'],
      description: `Given an integer array \`nums\` and an integer \`k\`, return the \`k\`-th largest element in the array.

Note that it is the \`k\`-th largest element in the sorted order, not the \`k\`-th distinct element.`,
      inputFormat: 'An array of integers `nums` and an integer `k`.',
      outputFormat: 'The integer value of the k-th largest element.',
      constraints: '1 <= k <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
      examples: [
        {
          input: '[3,2,1,5,6,4], 2',
          output: '5',
          explanation: 'The sorted array is [1,2,3,4,5,6], 2nd largest is 5.'
        },
        {
          input: '[3,2,3,1,2,4,5,5,6], 4',
          output: '4',
          explanation: 'The 4th largest is 4.'
        }
      ],
      starterCode: {
        javascript: `/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
function findKthLargest(nums, k) {
  // Write your code here
  nums.sort((a, b) => b - a);
  return nums[k - 1];
}`,
        python: `def findKthLargest(nums: list[int], k: int) -> int:
    # Write your code here
    nums.sort(reverse=True)
    return nums[k - 1]`
      },
      hints: [
        'Sorting in descending order puts the largest element at index 0 and k-th largest at index k-1.',
        'QuickSelect or a min-heap of size k provides O(N) average time.'
      ],
      editorial: `### Sorting / Heap
Sorting descending takes O(N log N) time and returns element at index \`k-1\`.
Alternatively, a min-heap of size \`k\` provides O(N log K) time.

**Complexity Analysis**:
- Time: O(N log N)
- Space: O(1) or O(K)`,
      testCases: [
        { input: JSON.stringify([[3,2,1,5,6,4], 2]), expectedOutput: '5', isHidden: false },
        { input: JSON.stringify([[3,2,3,1,2,4,5,5,6], 4]), expectedOutput: '4', isHidden: false },
        { input: JSON.stringify([[1], 1]), expectedOutput: '1', isHidden: true },
        { input: JSON.stringify([[-1, -1], 2]), expectedOutput: '-1', isHidden: true },
        { input: JSON.stringify([[7,6,5,4,3,2,1], 5]), expectedOutput: '3', isHidden: true },
      ]
    },

    // 11. Two Pointers: Move Zero Elements In-Place
    {
      slug: 'move-zeros-in-place',
      title: 'Move Zeroes In-Place',
      difficulty: 'Easy',
      topics: ['Two Pointers', 'Arrays'],
      description: `Given an integer array \`nums\`, move all \`0\`'s to the end of it while maintaining the relative order of the non-zero elements.

Return the modified array. Note that you should perform this in-place without making a copy of the array if possible.`,
      inputFormat: 'An array of integers `nums`.',
      outputFormat: 'The array with all 0s shifted to the end.',
      constraints: '1 <= nums.length <= 10^4\n-2^31 <= nums[i] <= 2^31 - 1',
      examples: [
        {
          input: '[0,1,0,3,12]',
          output: '[1,3,12,0,0]',
          explanation: 'All non-zero elements keep their order, zeroes go to the tail.'
        },
        {
          input: '[0]',
          output: '[0]',
          explanation: 'Single zero remains 0.'
        }
      ],
      starterCode: {
        javascript: `/**
 * @param {number[]} nums
 * @return {number[]}
 */
function moveZeroes(nums) {
  // Write your code here
  let lastNonZero = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      const temp = nums[lastNonZero];
      nums[lastNonZero] = nums[i];
      nums[i] = temp;
      lastNonZero++;
    }
  }
  return nums;
}`,
        python: `def moveZeroes(nums: list[int]) -> list[int]:
    # Write your code here
    last_non_zero = 0
    for i in range(len(nums)):
        if nums[i] != 0:
            nums[last_non_zero], nums[i] = nums[i], nums[last_non_zero]
            last_non_zero += 1
    return nums`
      },
      hints: [
        'Use two pointers: one pointer iterates through the array, the other marks the next spot for a non-zero element.',
        'Swap elements when a non-zero element is found.'
      ],
      editorial: `### Two Pointers In-Place Swap
Pointer \`lastNonZero\` tracks where the next non-zero should land. As pointer \`i\` scans the array, whenever \`nums[i] != 0\`, we swap \`nums[lastNonZero]\` and \`nums[i]\`, advancing \`lastNonZero\`.

**Complexity Analysis**:
- Time: O(N)
- Space: O(1)`,
      testCases: [
        { input: JSON.stringify([[0,1,0,3,12]]), expectedOutput: '[1,3,12,0,0]', isHidden: false },
        { input: JSON.stringify([[0]]), expectedOutput: '[0]', isHidden: false },
        { input: JSON.stringify([[1,2,3]]), expectedOutput: '[1,2,3]', isHidden: true },
        { input: JSON.stringify([[0,0,0,1]]), expectedOutput: '[1,0,0,0]', isHidden: true },
        { input: JSON.stringify([[4,2,4,0,0,3,0,5,1,0]]), expectedOutput: '[4,2,4,3,5,1,0,0,0,0]', isHidden: true },
      ]
    },

    // 12. Two Pointers: Container With Most Water
    {
      slug: 'container-with-most-water',
      title: 'Container With Most Stored Water',
      difficulty: 'Medium',
      topics: ['Two Pointers', 'Arrays'],
      description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i\`-th line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.
Return the maximum amount of water a container can store.`,
      inputFormat: 'An array of positive integers `height`. Length: 2 <= height.length <= 10^5.',
      outputFormat: 'An integer representing the maximum area.',
      constraints: '2 <= height.length <= 10^5\n0 <= height[i] <= 10^4',
      examples: [
        {
          input: '[1,8,6,2,5,4,8,3,7]',
          output: '49',
          explanation: 'The max area is between index 1 and index 8: min(8, 7) * (8 - 1) = 7 * 7 = 49.'
        },
        {
          input: '[1,1]',
          output: '1',
          explanation: 'min(1, 1) * 1 = 1.'
        }
      ],
      starterCode: {
        javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function maxArea(height) {
  // Write your code here
  let left = 0;
  let right = height.length - 1;
  let maxWater = 0;

  while (left < right) {
    const width = right - left;
    const h = Math.min(height[left], height[right]);
    maxWater = Math.max(maxWater, width * h);

    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }
  return maxWater;
}`,
        python: `def maxArea(height: list[int]) -> int:
    # Write your code here
    left, right = 0, len(height) - 1
    max_water = 0

    while left < right:
        width = right - left
        h = min(height[left], height[right])
        max_water = max(max_water, width * h)

        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return max_water`
      },
      hints: [
        'Area is determined by: (right - left) * min(height[left], height[right]).',
        'Start with maximum width (pointers at extreme ends).',
        'Always move the pointer pointing to the shorter line inward.'
      ],
      editorial: `### Two Pointers Greedy Shrink
Starting with the widest container, the height is constrained by the shorter line. Moving the taller line can only decrease or preserve area since width shrinks. Only moving the shorter line can potentially uncover a taller boundary to compensate for the smaller width.

**Complexity Analysis**:
- Time: O(N)
- Space: O(1)`,
      testCases: [
        { input: JSON.stringify([[1,8,6,2,5,4,8,3,7]]), expectedOutput: '49', isHidden: false },
        { input: JSON.stringify([[1,1]]), expectedOutput: '1', isHidden: false },
        { input: JSON.stringify([[4,3,2,1,4]]), expectedOutput: '16', isHidden: true },
        { input: JSON.stringify([[1,2,1]]), expectedOutput: '2', isHidden: true },
        { input: JSON.stringify([[2,3,4,5,18,17,6]]), expectedOutput: '17', isHidden: true },
      ]
    },

    // 13. Stacks: Balanced Symbol Bracket Validator
    {
      slug: 'valid-bracket-sequence',
      title: 'Valid Parentheses and Brackets',
      difficulty: 'Easy',
      topics: ['Stacks', 'Strings'],
      description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
      inputFormat: 'A string `s` of bracket characters.',
      outputFormat: 'Boolean `true` or `false`.',
      constraints: '1 <= s.length <= 10^4\ns consists of parentheses only \'()[]{}\'.',
      examples: [
        {
          input: '"()"',
          output: 'true',
          explanation: 'Single matching pair.'
        },
        {
          input: '"()[]{}"',
          output: 'true',
          explanation: 'All matching pairs in order.'
        },
        {
          input: '"(]"',
          output: 'false',
          explanation: 'Mismatched bracket types.'
        }
      ],
      starterCode: {
        javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Write your code here
  const stack = [];
  const map = {
    ')': '(',
    '}': '{',
    ']': '['
  };

  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (!stack.length || stack.pop() !== map[char]) {
        return false;
      }
    }
  }
  return stack.length === 0;
}`,
        python: `def isValid(s: str) -> bool:
    # Write your code here
    stack = []
    bracket_map = {')': '(', '}': '{', ']': '['}

    for char in s:
        if char in '({[':
            stack.append(char)
        else:
            if not stack or stack.pop() != bracket_map.get(char):
                return False
    return len(stack) == 0`
      },
      hints: [
        'Use a stack to keep track of expected closing brackets.',
        'When you see an opening bracket, push it to the stack.',
        'When you encounter a closing bracket, pop the top element and confirm it matches.'
      ],
      editorial: `### Classical Stack LIFO Pattern
Whenever we encounter an open bracket, push it. For a closing bracket, verify the stack is non-empty and the popped element is its opening counterpart. Finally, ensure the stack is empty.

**Complexity Analysis**:
- Time: O(N)
- Space: O(N)`,
      testCases: [
        { input: JSON.stringify(['()']), expectedOutput: 'true', isHidden: false },
        { input: JSON.stringify(['()[]{}']), expectedOutput: 'true', isHidden: false },
        { input: JSON.stringify(['(]']), expectedOutput: 'false', isHidden: false },
        { input: JSON.stringify(['([)]']), expectedOutput: 'false', isHidden: true },
        { input: JSON.stringify(['{[]}']), expectedOutput: 'true', isHidden: true },
        { input: JSON.stringify(['[']), expectedOutput: 'false', isHidden: true },
      ]
    },

    // 14. Stacks: Next Greater Metric Forecast
    {
      slug: 'daily-temperatures-forecast',
      title: 'Daily Temperatures Warmer Forecast',
      difficulty: 'Medium',
      topics: ['Stacks', 'Arrays'],
      description: `Given an array of integers \`temperatures\` represents the daily temperatures, return an array \`answer\` such that \`answer[i]\` is the number of days you have to wait after the \`i\`-th day to get a warmer temperature.
If there is no future day for which this is possible, keep \`answer[i] == 0\` instead.`,
      inputFormat: 'An integer array `temperatures`. Length: 1 <= temperatures.length <= 10^5.',
      outputFormat: 'An integer array of wait days.',
      constraints: '1 <= temperatures.length <= 10^5\n30 <= temperatures[i] <= 100',
      examples: [
        {
          input: '[73,74,75,71,69,72,76,73]',
          output: '[1,1,4,2,1,1,0,0]',
          explanation: 'Day 0 to Day 1 is +1 day. Day 2 (75) waits until Day 6 (76) which is 4 days.'
        },
        {
          input: '[30,40,50,60]',
          output: '[1,1,1,0]',
          explanation: 'Each consecutive day is warmer except the last.'
        },
        {
          input: '[30,60,90]',
          output: '[1,1,0]',
          explanation: 'Each day is warmer except the highest.'
        }
      ],
      starterCode: {
        javascript: `/**
 * @param {number[]} temperatures
 * @return {number[]}
 */
function dailyTemperatures(temperatures) {
  // Write your code here
  const n = temperatures.length;
  const answer = new Array(n).fill(0);
  const stack = []; // indices of temperatures

  for (let i = 0; i < n; i++) {
    while (stack.length && temperatures[i] > temperatures[stack[stack.length - 1]]) {
      const prevIdx = stack.pop();
      answer[prevIdx] = i - prevIdx;
    }
    stack.push(i);
  }
  return answer;
}`,
        python: `def dailyTemperatures(temperatures: list[int]) -> list[int]:
    # Write your code here
    n = len(temperatures)
    answer = [0] * n
    stack = [] # indices

    for i in range(n):
        while stack and temperatures[i] > temperatures[stack[-1]]:
            prev_idx = stack.pop()
            answer[prev_idx] = i - prev_idx
        stack.append(i)
    return answer`
      },
      hints: [
        'A monotonic decreasing stack stores indices of days whose warmer day has not yet been found.',
        'When the current temperature is higher than the temperature at the stack\'s top index, resolve that day!'
      ],
      editorial: `### Monotonic Decreasing Stack
We iterate through temperatures. While the current temperature is strictly greater than the temperature at the index atop the stack, we pop the index and record \`answer[prevIndex] = currentIndex - prevIndex\`.

**Complexity Analysis**:
- Time: O(N) because each index is pushed and popped at most once.
- Space: O(N) for stack storage.`,
      testCases: [
        { input: JSON.stringify([[73,74,75,71,69,72,76,73]]), expectedOutput: '[1,1,4,2,1,1,0,0]', isHidden: false },
        { input: JSON.stringify([[30,40,50,60]]), expectedOutput: '[1,1,1,0]', isHidden: false },
        { input: JSON.stringify([[30,60,90]]), expectedOutput: '[1,1,0]', isHidden: false },
        { input: JSON.stringify([[89,62,70,58,47,47,46,76,100,70]]), expectedOutput: '[8,1,5,4,3,2,1,1,0,0]', isHidden: true },
        { input: JSON.stringify([[50,50,50]]), expectedOutput: '[0,0,0]', isHidden: true },
      ]
    },

    // 15. Recursion: Generate Balanced Tag Pairs
    {
      slug: 'generate-parentheses-combinations',
      title: 'Generate Balanced Parentheses',
      difficulty: 'Medium',
      topics: ['Recursion', 'Strings'],
      description: `Given \`n\` pairs of parentheses, write a function to generate all combinations of well-formed parentheses in lexicographical order.`,
      inputFormat: 'An integer `n` where 1 <= n <= 8.',
      outputFormat: 'A list of well-formed parentheses strings sorted lexicographically.',
      constraints: '1 <= n <= 8',
      examples: [
        {
          input: '3',
          output: '["((()))", "(()())", "(())()", "()(())", "()()()"]',
          explanation: 'All 5 valid arrangements of 3 pairs.'
        },
        {
          input: '1',
          output: '["()"]',
          explanation: 'Only one pair.'
        }
      ],
      starterCode: {
        javascript: `/**
 * @param {number} n
 * @return {string[]}
 */
function generateParenthesis(n) {
  // Write your code here
  const result = [];

  function backtrack(current, open, close) {
    if (current.length === 2 * n) {
      result.push(current);
      return;
    }
    if (open < n) {
      backtrack(current + '(', open + 1, close);
    }
    if (close < open) {
      backtrack(current + ')', open, close + 1);
    }
  }

  backtrack('', 0, 0);
  return result.sort();
}`,
        python: `def generateParenthesis(n: int) -> list[str]:
    # Write your code here
    result = []

    def backtrack(current: str, open_count: int, close_count: int):
        if len(current) == 2 * n:
            result.append(current)
            return
        if open_count < n:
            backtrack(current + '(', open_count + 1, close_count)
        if close_count < open_count:
            backtrack(current + ')', open_count, close_count + 1)

    backtrack('', 0, 0)
    result.sort()
    return result`
      },
      hints: [
        'Use recursive backtracking with parameters tracking count of open and close brackets.',
        'You can only add an open bracket if open < n.',
        'You can only add a close bracket if close < open.'
      ],
      editorial: `### Backtracking State Exploration
At each step in the recursion tree, we decide whether to add \`'('\` or \`')'\`.
The invariant is: \`close <= open <= n\`. When the length reaches \`2 * n\`, we record the valid string.

**Complexity Analysis**:
- Time: O(4^N / sqrt(N)) related to the n-th Catalan number.
- Space: O(N) recursion stack.`,
      testCases: [
        { input: JSON.stringify([3]), expectedOutput: '["((()))","(()())","(())()","()(())","()()()"]', isHidden: false },
        { input: JSON.stringify([1]), expectedOutput: '["()"]', isHidden: false },
        { input: JSON.stringify([2]), expectedOutput: '["(())","()()"]', isHidden: true },
        { input: JSON.stringify([4]), expectedOutput: '["(((())))","((()()))","((())())","((()))()","(()(()))","(()()())","(()())()","(())(())","(())()()","()((()))","()(()())","()(())()","()()(())","()()()()"]', isHidden: true },
      ]
    },

    // 16. Recursion: Distinct Subset Combinations
    {
      slug: 'distinct-subsets-generator',
      title: 'Power Set Subsets Generator',
      difficulty: 'Medium',
      topics: ['Recursion', 'Arrays'],
      description: `Given an integer array \`nums\` of unique elements, return all possible subsets (the power set).
The solution set must not contain duplicate subsets. Return the solution with subsets sorted by size and lexicographically within equal sizes.`,
      inputFormat: 'An integer array `nums` of unique elements.',
      outputFormat: 'A list of lists of integers representing all 2^N subsets.',
      constraints: '1 <= nums.length <= 10\n-10 <= nums[i] <= 10\nAll elements of nums are unique.',
      examples: [
        {
          input: '[1,2,3]',
          output: '[[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]]',
          explanation: 'All 8 subsets of [1,2,3].'
        },
        {
          input: '[0]',
          output: '[[], [0]]',
          explanation: 'Two subsets for single element.'
        }
      ],
      starterCode: {
        javascript: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function subsets(nums) {
  // Write your code here
  nums.sort((a, b) => a - b);
  const result = [];

  function backtrack(start, current) {
    result.push([...current]);
    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }

  backtrack(0, []);
  result.sort((a, b) => {
    if (a.length !== b.length) return a.length - b.length;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return a[i] - b[i];
    }
    return 0;
  });
  return result;
}`,
        python: `def subsets(nums: list[int]) -> list[list[int]]:
    # Write your code here
    nums.sort()
    result = []

    def backtrack(start: int, current: list[int]):
        result.append(list(current))
        for i in range(start, len(nums)):
            current.append(nums[i])
            backtrack(i + 1, current)
            current.pop()

    backtrack(0, [])
    result.sort(key=lambda x: (len(x), x))
    return result`
      },
      hints: [
        'For each element, you have two choices: either include it in the current subset or exclude it.',
        'Backtracking builds every subset incrementally.',
        'There are 2^N total subsets.'
      ],
      editorial: `### Backtracking / Cascading
We traverse the decision tree of picking or skipping each element. At every node in the recursion tree, the current accumulator is a valid subset.

**Complexity Analysis**:
- Time: O(N * 2^N)
- Space: O(N) recursion depth.`,
      testCases: [
        { input: JSON.stringify([[1,2,3]]), expectedOutput: '[[],[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]', isHidden: false },
        { input: JSON.stringify([[0]]), expectedOutput: '[[],[0]]', isHidden: false },
        { input: JSON.stringify([[4,1]]), expectedOutput: '[[],[1],[4],[1,4]]', isHidden: true },
        { input: JSON.stringify([[7,8,9,10]]), expectedOutput: '[[],[7],[8],[9],[10],[7,8],[7,9],[7,10],[8,9],[8,10],[9,10],[7,8,9],[7,8,10],[7,9,10],[8,9,10],[7,8,9,10]]', isHidden: true },
      ]
    },

    // 17. Basic Dynamic Programming: Climbing Staircase Minimum Fatigue
    {
      slug: 'min-cost-climbing-stairs',
      title: 'Min Cost Climbing Stairs',
      difficulty: 'Easy',
      topics: ['Dynamic Programming', 'Arrays'],
      description: `You are given an integer array \`cost\` where \`cost[i]\` is the cost of \`i\`-th step on a staircase. Once you pay the cost, you can either climb one or two steps.

You can either start from the step with index 0, or the step with index 1.
Return the minimum cost to reach the top of the floor (index past the last step).`,
      inputFormat: 'An integer array `cost`. Length: 2 <= cost.length <= 1000.',
      outputFormat: 'An integer representing the minimum total cost.',
      constraints: '2 <= cost.length <= 1000\n0 <= cost[i] <= 999',
      examples: [
        {
          input: '[10,15,20]',
          output: '15',
          explanation: 'You will start at index 1, pay 15, and climb two steps to reach the top.'
        },
        {
          input: '[1,100,1,1,1,100,1,1,100,1]',
          output: '6',
          explanation: 'Cheapest path: start at index 0, step through 1s paying a total of 6.'
        }
      ],
      starterCode: {
        javascript: `/**
 * @param {number[]} cost
 * @return {number}
 */
function minCostClimbingStairs(cost) {
  // Write your code here
  let prev2 = 0;
  let prev1 = 0;
  for (let i = 2; i <= cost.length; i++) {
    const current = Math.min(prev1 + cost[i - 1], prev2 + cost[i - 2]);
    prev2 = prev1;
    prev1 = current;
  }
  return prev1;
}`,
        python: `def minCostClimbingStairs(cost: list[int]) -> int:
    # Write your code here
    prev2 = 0
    prev1 = 0
    for i in range(2, len(cost) + 1):
        current = min(prev1 + cost[i - 1], prev2 + cost[i - 2])
        prev2 = prev1
        prev1 = current
    return prev1`
      },
      hints: [
        'Let dp[i] be the minimum cost to reach step i.',
        'dp[i] = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]).',
        'You only need the previous two values, so O(1) space is achievable.'
      ],
      editorial: `### 1D Dynamic Programming with Space Optimization
To land on floor \`i\`, we either hopped from step \`i-1\` (costing \`dp[i-1] + cost[i-1]\`) or from step \`i-2\` (costing \`dp[i-2] + cost[i-2]\`). We maintain just two variables for O(1) space.

**Complexity Analysis**:
- Time: O(N)
- Space: O(1)`,
      testCases: [
        { input: JSON.stringify([[10,15,20]]), expectedOutput: '15', isHidden: false },
        { input: JSON.stringify([[1,100,1,1,1,100,1,1,100,1]]), expectedOutput: '6', isHidden: false },
        { input: JSON.stringify([[0,0,0,0]]), expectedOutput: '0', isHidden: true },
        { input: JSON.stringify([[1,2]]), expectedOutput: '1', isHidden: true },
        { input: JSON.stringify([[5,10,20,15,5,10]]), expectedOutput: '25', isHidden: true },
      ]
    },

    // 18. Basic Dynamic Programming: Coin Denomination Exchange
    {
      slug: 'coin-denomination-change',
      title: 'Coin Change Minimum Count',
      difficulty: 'Medium',
      topics: ['Dynamic Programming', 'Arrays'],
      description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.
You may assume that you have an infinite number of each kind of coin.`,
      inputFormat: 'An array of positive integers `coins` and integer `amount`.',
      outputFormat: 'An integer representing fewest coins needed or -1.',
      constraints: '1 <= coins.length <= 12\n1 <= coins[i] <= 2^31 - 1\n0 <= amount <= 10^4',
      examples: [
        {
          input: '[1,2,5], 11',
          output: '3',
          explanation: '11 = 5 + 5 + 1 (3 coins total).'
        },
        {
          input: '[2], 3',
          output: '-1',
          explanation: 'The amount of 3 cannot be made up with only denomination 2.'
        },
        {
          input: '[1], 0',
          output: '0',
          explanation: '0 amount requires 0 coins.'
        }
      ],
      starterCode: {
        javascript: `/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
function coinChange(coins, amount) {
  // Write your code here
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
        python: `def coinChange(coins: list[int], amount: int) -> int:
    # Write your code here
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0

    for i in range(1, amount + 1):
        for coin in coins:
            if i - coin >= 0:
                dp[i] = min(dp[i], dp[i - coin] + 1)

    return -1 if dp[amount] == float('inf') else int(dp[amount])`
      },
      hints: [
        'Define dp[i] as the minimum coins needed to make amount i.',
        'dp[i] = min(dp[i - c] + 1) for every coin c <= i.',
        'Base case: dp[0] = 0, and all other dp initialized to infinity.'
      ],
      editorial: `### Bottom-Up Dynamic Programming (Unbounded Knapsack)
For every sub-amount from 1 to \`amount\`, we check each coin denomination \`c\`. If \`i - c >= 0\`, we update \`dp[i] = min(dp[i], dp[i - c] + 1)\`.

**Complexity Analysis**:
- Time: O(amount * len(coins))
- Space: O(amount)`,
      testCases: [
        { input: JSON.stringify([[1,2,5], 11]), expectedOutput: '3', isHidden: false },
        { input: JSON.stringify([[2], 3]), expectedOutput: '-1', isHidden: false },
        { input: JSON.stringify([[1], 0]), expectedOutput: '0', isHidden: false },
        { input: JSON.stringify([[186,419,83,408], 6249]), expectedOutput: '20', isHidden: true },
        { input: JSON.stringify([[2,5,10,1], 27]), expectedOutput: '4', isHidden: true },
      ]
    }
  ];

  console.log(`Inserting ${questionsData.length} comprehensive questions with test cases...`);

  const createdQuestions = [];

  for (const q of questionsData) {
    const question = await prisma.question.create({
      data: {
        slug: q.slug,
        title: q.title,
        difficulty: q.difficulty,
        topics: q.topics,
        description: q.description,
        inputFormat: q.inputFormat,
        outputFormat: q.outputFormat,
        constraints: q.constraints,
        examples: q.examples,
        starterCode: q.starterCode,
        hints: q.hints,
        editorial: q.editorial,
        testCases: {
          create: q.testCases.map((tc, index) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: tc.isHidden,
            orderIndex: index,
          })),
        },
      },
    });
    createdQuestions.push(question);
  }

  console.log(`✅ Seeded ${createdQuestions.length} questions.`);

  // Seed sample past interview sessions and submissions for Alex Rivera
  // This ensures dashboard has realistic actual database metrics from day one!
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

  // Past Session 1: 30 min session completed
  const session1 = await prisma.interviewSession.create({
    data: {
      userId: demoUser.id,
      title: 'Frontend & Algorithmic Foundations',
      durationMinutes: 30,
      difficulty: 'Easy',
      topics: ['Arrays', 'Two Pointers'],
      status: 'COMPLETED',
      startTime: fiveDaysAgo,
      expiresAt: new Date(fiveDaysAgo.getTime() + 30 * 60 * 1000),
      completedAt: new Date(fiveDaysAgo.getTime() + 22 * 60 * 1000),
      score: 100.0,
      totalQuestions: 2,
      solvedQuestions: 2,
      questions: {
        create: [
          {
            questionId: createdQuestions[0].id, // Subarray Maximum Profit
            orderIndex: 0,
            isSolved: true,
            solvedAt: new Date(fiveDaysAgo.getTime() + 10 * 60 * 1000),
          },
          {
            questionId: createdQuestions[10].id, // Move Zeroes In-Place
            orderIndex: 1,
            isSolved: true,
            solvedAt: new Date(fiveDaysAgo.getTime() + 21 * 60 * 1000),
          },
        ],
      },
    },
  });

  // Past Session 2: 45 min session completed
  const session2 = await prisma.interviewSession.create({
    data: {
      userId: demoUser.id,
      title: 'Data Structures & Hash Maps Sprint',
      durationMinutes: 45,
      difficulty: 'Medium',
      topics: ['Hash Maps', 'Strings', 'Stacks'],
      status: 'COMPLETED',
      startTime: threeDaysAgo,
      expiresAt: new Date(threeDaysAgo.getTime() + 45 * 60 * 1000),
      completedAt: new Date(threeDaysAgo.getTime() + 38 * 60 * 1000),
      score: 85.0,
      totalQuestions: 2,
      solvedQuestions: 2,
      questions: {
        create: [
          {
            questionId: createdQuestions[4].id, // Two sum
            orderIndex: 0,
            isSolved: true,
            solvedAt: new Date(threeDaysAgo.getTime() + 12 * 60 * 1000),
          },
          {
            questionId: createdQuestions[3].id, // Longest substring
            orderIndex: 1,
            isSolved: true,
            solvedAt: new Date(threeDaysAgo.getTime() + 35 * 60 * 1000),
          },
        ],
      },
    },
  });

  // Submissions for demoUser
  await prisma.submission.create({
    data: {
      userId: demoUser.id,
      questionId: createdQuestions[0].id,
      interviewSessionId: session1.id,
      language: 'javascript',
      code: createdQuestions[0].starterCode['javascript'],
      status: 'PASSED',
      passedTests: 6,
      totalTests: 6,
      executionTimeMs: 42.5,
      memoryKb: 3120,
      createdAt: new Date(fiveDaysAgo.getTime() + 10 * 60 * 1000),
    },
  });

  await prisma.submission.create({
    data: {
      userId: demoUser.id,
      questionId: createdQuestions[10].id,
      interviewSessionId: session1.id,
      language: 'javascript',
      code: createdQuestions[10].starterCode['javascript'],
      status: 'PASSED',
      passedTests: 5,
      totalTests: 5,
      executionTimeMs: 38.0,
      memoryKb: 3080,
      createdAt: new Date(fiveDaysAgo.getTime() + 21 * 60 * 1000),
    },
  });

  await prisma.submission.create({
    data: {
      userId: demoUser.id,
      questionId: createdQuestions[4].id,
      interviewSessionId: session2.id,
      language: 'python',
      code: createdQuestions[4].starterCode['python'],
      status: 'PASSED',
      passedTests: 5,
      totalTests: 5,
      executionTimeMs: 51.2,
      memoryKb: 3450,
      createdAt: new Date(threeDaysAgo.getTime() + 12 * 60 * 1000),
    },
  });

  await prisma.submission.create({
    data: {
      userId: demoUser.id,
      questionId: createdQuestions[3].id,
      interviewSessionId: session2.id,
      language: 'javascript',
      code: createdQuestions[3].starterCode['javascript'],
      status: 'PASSED',
      passedTests: 6,
      totalTests: 6,
      executionTimeMs: 44.0,
      memoryKb: 3200,
      createdAt: new Date(threeDaysAgo.getTime() + 35 * 60 * 1000),
    },
  });

  // Also standalone practice submission from yesterday
  await prisma.submission.create({
    data: {
      userId: demoUser.id,
      questionId: createdQuestions[12].id, // Valid parentheses
      language: 'javascript',
      code: createdQuestions[12].starterCode['javascript'],
      status: 'PASSED',
      passedTests: 6,
      totalTests: 6,
      executionTimeMs: 29.4,
      memoryKb: 2980,
      createdAt: yesterday,
    },
  });

  console.log('✅ Successfully seeded all database data, questions, sessions, and submissions!');
}

main()
  .catch((e) => {
    console.error('❌ Error in seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
