import { TestCaseItem } from './runner.interface.js';

export function detectFunctionName(code: string, language: 'javascript' | 'python'): string | null {
  if (language === 'javascript') {
    const fnMatch = code.match(/function\s+([a-zA-Z0-9_$]+)\s*\(/);
    if (fnMatch) return fnMatch[1];
    const arrowMatch = code.match(/(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\([^)]*\)\s*=>|[a-zA-Z0-9_$]+\s*=>)/);
    if (arrowMatch) return arrowMatch[1];
  } else if (language === 'python') {
    const pyMatch = code.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
    if (pyMatch) return pyMatch[1];
  }
  return null;
}

export function buildExecutionScript(
  code: string,
  language: 'javascript' | 'python',
  testCases: TestCaseItem[]
): { script: string; functionName: string } {
  const functionName = detectFunctionName(code, language) || (language === 'javascript' ? 'solution' : 'solution');

  if (language === 'javascript') {
    const testCasesJson = JSON.stringify(
      testCases.map((tc, idx) => ({
        id: tc.id,
        orderIndex: tc.orderIndex ?? idx,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: !!tc.isHidden,
      }))
    );

    const script = `
// --- User Code Start ---
${code}
// --- User Code End ---

(function() {
  const capturedLogs = [];
  const origLog = console.log;
  const origWarn = console.warn;
  const origError = console.error;

  console.log = (...args) => {
    try {
      capturedLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    } catch(e) {
      capturedLogs.push(String(args));
    }
  };
  console.warn = console.log;
  console.error = console.log;

  const testCases = ${testCasesJson};
  const results = [];
  let fn = null;

  try {
    fn = typeof ${functionName} === 'function' ? ${functionName} : null;
  } catch (e) {
    // Function not found
  }

  if (!fn) {
    origLog("__INTERVIEWLAB_RESULT_START__" + JSON.stringify({
      error: "Function '${functionName}' is not defined or is not callable.",
      testResults: [],
      logs: capturedLogs.join("\\n")
    }) + "__INTERVIEWLAB_RESULT_END__");
    return;
  }

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const tStart = performance.now();
    try {
      let args = JSON.parse(tc.input);
      let res;
      if (Array.isArray(args)) {
        res = fn(...args);
      } else {
        res = fn(args);
      }
      const tEnd = performance.now();
      const elapsed = Math.round((tEnd - tStart) * 100) / 100;

      let expectedParsed;
      try {
        expectedParsed = JSON.parse(tc.expectedOutput);
      } catch {
        expectedParsed = tc.expectedOutput;
      }

      const actualSerialized = JSON.stringify(res === undefined ? null : res);
      const expectedSerialized = JSON.stringify(expectedParsed);

      const passed = actualSerialized === expectedSerialized;

      results.push({
        id: tc.id,
        orderIndex: tc.orderIndex,
        passed,
        actual: actualSerialized,
        expected: tc.isHidden ? undefined : expectedSerialized,
        input: tc.isHidden ? undefined : tc.input,
        isHidden: tc.isHidden,
        executionTimeMs: elapsed
      });
    } catch (err) {
      const tEnd = performance.now();
      results.push({
        id: tc.id,
        orderIndex: tc.orderIndex,
        passed: false,
        error: String(err && err.message ? err.message : err),
        expected: tc.isHidden ? undefined : tc.expectedOutput,
        input: tc.isHidden ? undefined : tc.input,
        isHidden: tc.isHidden,
        executionTimeMs: Math.round((tEnd - tStart) * 100) / 100
      });
    }
  }

  origLog("__INTERVIEWLAB_RESULT_START__" + JSON.stringify({
    testResults: results,
    logs: capturedLogs.join("\\n")
  }) + "__INTERVIEWLAB_RESULT_END__");
})();
`;
    return { script, functionName };
  } else {
    // Python
    const testCasesJson = JSON.stringify(
      testCases.map((tc, idx) => ({
        id: tc.id,
        orderIndex: tc.orderIndex ?? idx,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: !!tc.isHidden,
      }))
    );

    const script = `
import sys
import json
import time
import io

# Capture stdout
_orig_stdout = sys.stdout
_log_buffer = io.StringIO()
sys.stdout = _log_buffer

# --- User Code Start ---
${code}
# --- User Code End ---

sys.stdout = _orig_stdout
captured_logs = _log_buffer.getvalue()

test_cases = json.loads('''${testCasesJson}''')
results = []

try:
    target_fn = locals().get('${functionName}')
    if not callable(target_fn):
        raise NameError("Function '${functionName}' is not defined.")
except Exception as e:
    output_obj = {
        "error": f"Function '${functionName}' is not defined or callable: {str(e)}",
        "testResults": [],
        "logs": captured_logs
    }
    print("__INTERVIEWLAB_RESULT_START__" + json.dumps(output_obj) + "__INTERVIEWLAB_RESULT_END__")
    sys.exit(0)

for tc in test_cases:
    t_start = time.perf_counter()
    try:
        raw_input = tc["input"]
        parsed_input = json.loads(raw_input)
        if isinstance(parsed_input, list):
            res = target_fn(*parsed_input)
        else:
            res = target_fn(parsed_input)
        t_end = time.perf_counter()
        elapsed = round((t_end - t_start) * 1000, 2)

        try:
            expected_val = json.loads(tc["expectedOutput"])
        except Exception:
            expected_val = tc["expectedOutput"]

        actual_str = json.dumps(res, sort_keys=True, separators=(',', ':'))
        expected_str = json.dumps(expected_val, sort_keys=True, separators=(',', ':'))

        passed = (actual_str == expected_str)

        results.push_obj = {
            "id": tc["id"],
            "orderIndex": tc["orderIndex"],
            "passed": passed,
            "actual": actual_str,
            "expected": None if tc["isHidden"] else expected_str,
            "input": None if tc["isHidden"] else tc["input"],
            "isHidden": tc["isHidden"],
            "executionTimeMs": elapsed
        }
        results.append(results.push_obj)
    except Exception as err:
        t_end = time.perf_counter()
        results.append({
            "id": tc["id"],
            "orderIndex": tc["orderIndex"],
            "passed": False,
            "error": str(err),
            "expected": None if tc["isHidden"] else tc["expectedOutput"],
            "input": None if tc["isHidden"] else tc["input"],
            "isHidden": tc["isHidden"],
            "executionTimeMs": round((t_end - t_start) * 1000, 2)
        })

output_obj = {
    "testResults": results,
    "logs": captured_logs
}
print("__INTERVIEWLAB_RESULT_START__" + json.dumps(output_obj) + "__INTERVIEWLAB_RESULT_END__")
`;
    return { script, functionName };
  }
}

export function parseHarnessOutput(
  rawStdout: string,
  rawStderr: string,
  providerName: string
): {
  success: boolean;
  testResults: any[];
  error?: string;
  logs?: string;
} {
  const startMarker = '__INTERVIEWLAB_RESULT_START__';
  const endMarker = '__INTERVIEWLAB_RESULT_END__';

  const startIdx = rawStdout.indexOf(startMarker);
  const endIdx = rawStdout.indexOf(endMarker);

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const jsonStr = rawStdout.substring(startIdx + startMarker.length, endIdx);
    try {
      const parsed = JSON.parse(jsonStr);
      return {
        success: !parsed.error,
        testResults: parsed.testResults || [],
        error: parsed.error,
        logs: parsed.logs || '',
      };
    } catch (e: any) {
      return {
        success: false,
        testResults: [],
        error: `Failed to parse execution results: ${e.message}`,
        logs: rawStdout,
      };
    }
  }

  // If markers not found, check if stderr or syntax/runtime error
  const errorMsg = rawStderr.trim() || rawStdout.trim() || 'Execution failed with unknown error.';
  return {
    success: false,
    testResults: [],
    error: errorMsg,
    logs: rawStdout,
  };
}
