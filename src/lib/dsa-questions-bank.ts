export interface DsaCodingQuestion {
  id: string;
  type: "coding";
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  question: string;
  starterCode: string;
  testCases: Array<{ input: string; expected: string }>;
  expectedOutput: string;
  correctAnswer: string;
  answer: string;
  explanation: string;
}

export const DSA_PROBLEM_BANK: Omit<DsaCodingQuestion, "id">[] = [
  {
    type: "coding",
    topic: "Arrays & HashMaps",
    difficulty: "easy",
    marks: 5,
    question: `[DSA Challenge] Two Sum Problem\n\nGiven an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nInput Format: Array nums, Target integer\nOutput Format: Array [index1, index2]\nConstraints:\n- 2 <= nums.length <= 10^4\n- -10^9 <= nums[i] <= 10^9\n- Time Complexity Target: O(N)`,
    starterCode: `function twoSum(nums, target) {\n  // Use HashMap for O(N) lookup\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) {\n      return [map.get(diff), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
    testCases: [
      { input: "nums = [2, 7, 11, 15], target = 9", expected: "[0, 1]" },
      { input: "nums = [3, 2, 4], target = 6", expected: "[1, 2]" },
      { input: "nums = [3, 3], target = 6", expected: "[0, 1]" },
    ],
    expectedOutput: "[0, 1]",
    correctAnswer: "[0, 1]",
    answer: "[0, 1]",
    explanation: "Store complement values in a Hash Map for O(1) lookups during array iteration.",
  },
  {
    type: "coding",
    topic: "Strings & Manipulation",
    difficulty: "easy",
    marks: 5,
    question: `[DSA Challenge] Valid Anagram\n\nGiven two strings s and t, return true if t is an anagram of s, and false otherwise.\nAn Anagram is a word formed by rearranging the letters of a different word, using all the original letters exactly once.\n\nInput Format: Two strings s and t\nOutput Format: Boolean (true / false)\nConstraints:\n- 1 <= s.length, t.length <= 5 * 10^4\n- s and t consist of lowercase English letters.\n- Time Complexity Target: O(N)`,
    starterCode: `function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const count = {};\n  for (let char of s) count[char] = (count[char] || 0) + 1;\n  for (let char of t) {\n    if (!count[char]) return false;\n    count[char]--;\n  }\n  return true;\n}`,
    testCases: [
      { input: "s = 'anagram', t = 'nagaram'", expected: "true" },
      { input: "s = 'rat', t = 'car'", expected: "false" },
    ],
    expectedOutput: "true",
    correctAnswer: "true",
    answer: "true",
    explanation: "Count character frequencies using a hash map or 26-element array and verify identical counts.",
  },
  {
    type: "coding",
    topic: "Stack Data Structure",
    difficulty: "medium",
    marks: 5,
    question: `[DSA Challenge] Valid Parentheses\n\nGiven a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n\nInput Format: String s\nOutput Format: Boolean (true / false)\nConstraints:\n- 1 <= s.length <= 10^4\n- Time Complexity Target: O(N), Space Complexity: O(N)`,
    starterCode: `function isValid(s) {\n  const stack = [];\n  const pairs = { ')': '(', '}': '{', ']': '[' };\n  for (let char of s) {\n    if (char in pairs) {\n      if (stack.pop() !== pairs[char]) return false;\n    } else {\n      stack.push(char);\n    }\n  }\n  return stack.length === 0;\n}`,
    testCases: [
      { input: "s = '()[]{}'", expected: "true" },
      { input: "s = '(]'", expected: "false" },
      { input: "s = '([{}])'", expected: "true" },
    ],
    expectedOutput: "true",
    correctAnswer: "true",
    answer: "true",
    explanation: "Use a LIFO Stack to push opening brackets and match them against closing brackets.",
  },
  {
    type: "coding",
    topic: "Arrays & Dynamic Programming",
    difficulty: "medium",
    marks: 5,
    question: `[DSA Challenge] Maximum Subarray (Kadane's Algorithm)\n\nGiven an integer array nums, find the subarray with the largest sum, and return its sum.\nA subarray is a contiguous non-empty sequence of elements within an array.\n\nInput Format: Array nums\nOutput Format: Integer max_sum\nConstraints:\n- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4\n- Time Complexity Target: O(N)`,
    starterCode: `function maxSubArray(nums) {\n  let maxSum = nums[0];\n  let currentSum = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currentSum = Math.max(nums[i], currentSum + nums[i]);\n    maxSum = Math.max(maxSum, currentSum);\n  }\n  return maxSum;\n}`,
    testCases: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", expected: "6 (Subarray [4,-1,2,1])" },
      { input: "nums = [1]", expected: "1" },
      { input: "nums = [5,4,-1,7,8]", expected: "23" },
    ],
    expectedOutput: "6",
    correctAnswer: "6",
    answer: "6",
    explanation: "Use Kadane's algorithm to compute the local maximum ending at each index in O(N) time.",
  },
  {
    type: "coding",
    topic: "Binary Search & Algorithms",
    difficulty: "medium",
    marks: 5,
    question: `[DSA Challenge] Binary Search in Sorted Array\n\nGiven an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, return its index. Otherwise, return -1.\n\nInput Format: Array nums, Target integer\nOutput Format: Integer index\nConstraints:\n- 1 <= nums.length <= 10^4\n- Time Complexity Target: O(log N)`,
    starterCode: `function search(nums, target) {\n  let left = 0, right = nums.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}`,
    testCases: [
      { input: "nums = [-1,0,3,5,9,12], target = 9", expected: "4" },
      { input: "nums = [-1,0,3,5,9,12], target = 2", expected: "-1" },
    ],
    expectedOutput: "4",
    correctAnswer: "4",
    answer: "4",
    explanation: "Halve search boundaries at each step using left/right pointers to achieve logarithmic O(log N) runtime.",
  },
];
