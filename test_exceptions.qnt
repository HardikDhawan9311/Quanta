@ Exception Handling Test Suite

void test_div_zero() {
    print("Testing Division by Zero...")
    try {
        int x = 10 / 0
        print("FAIL: Should not reach here")
    } catch (e) {
        print("Caught:")
        print(e)
    }
}

void test_type_error() {
    print("\nTesting Type Error (String + Int)...")
    try {
        string s = "Hello"
        int n = 5
        var res = s % n
        print("FAIL: Should not reach here")
    } catch (e) {
        print("Caught:")
        print(e)
    }
}

void test_array_bounds() {
    print("\nTesting Array Bounds Error...")
    try {
        int[3] arr = [1, 2, 3]
        print(arr[5])
        print("FAIL: Should not reach here")
    } catch (e) {
        print("Caught:")
        print(e)
    }
}

void test_string_bounds() {
    print("\nTesting String Bounds Error...")
    try {
        string s = "abc"
        print(s[5])
        print("FAIL: Should not reach here")
    } catch (e) {
        print("Caught:")
        print(e)
    }
}

void recurse(int n) {
    recurse(n + 1)
}

void test_stack_error() {
    print("\nTesting Stack Overflow Error...")
    try {
        recurse(0)
        print("FAIL: Should not reach here")
    } catch (e) {
        print("Caught:")
        print(e)
    }
}

test_div_zero()
test_type_error()
test_array_bounds()
test_string_bounds()
test_stack_error()
print("\nAll Exception Tests Finished successfully!")
