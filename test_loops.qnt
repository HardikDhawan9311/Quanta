@ Testing Iterator For-In loops

void test_string_loop() {
    print("--- String Iterator ---")
    string msg = "abc"
    loop c in msg {
        print(c)
    }
}

void test_array_loop() {
    print("--- Array Iterator ---")
    int[3] nums = [10, 20, 30]
    loop n in nums {
        print(n)
    }
}

void test_list_loop() {
    print("--- List Iterator ---")
    int[] dynamic_nums = [99, 88, 77]
    loop d in dynamic_nums {
        print(d)
    }
}

test_string_loop()
test_array_loop()
test_list_loop()
print("All iteration tests completed!")
