@ ==========================================
@ QUANTA LANGUAGE: FULL SYNTAX MASTER FILE
@ ==========================================
@ This file contains valid examples of EVERY Quanta language feature based on test cases.
@ It serves as the grounding context for AI code generation.

@ --- 1. Variables & Types ---
@ Implicit typing (Dynamic)
x = 100;
name = "Quanta Studio";
isValid = true;
var y = 50;  @ 'var' keyword explicitly uses implicit type inference

@ Explicit typing (Static and Memory Constrained)
int age = 25;
int8 tiny_number = 100;    @ 8-bit integer
int32 medium_number = 50000; @ 32-bit integer
int64 massive = 90000000;   @ 64-bit integer
float pi = 3.14159;
string msg = "Hello World";
bool flag = false;

@ Introspection
print(type(x));       @ Outputs the data type (e.g. 'int')
print(bytesize(x));   @ Outputs the memory size in bytes


@ --- 2. Memory Management (Static Arrays vs Dynamic Lists) ---
@ Fixed Arrays (Stack) - Must declare size in brackets
int[3] arr = [10, 20, 30];
arr[1] = 99;

@ Multidimensional Static Arrays (Matrices)
int[2][3] matrix = [[1, 2, 3], [4, 5, 6]];
matrix[0][1] = 50;

@ Dynamic Lists (Heap) - Empty brackets, uses object methods .push() and .pop()
int[] dynList = [1, 2];
dynList.push(3);
int lastItem = dynList.pop();


@ --- 3. Object-Oriented String Methods ---
@ Strings in Quanta use method notation (s.method()), NOT functional wrappers (method(s)).
string s = " Quanta Language ";

@ Length and Casting
int length = s.len();          @ Returns length

@ Modification Methods
string upper = s.upper();      @ " QUANTA LANGUAGE "
string lower = s.lower();      @ " quanta language "
string clean = s.strip();      @ "Quanta Language"
string lcln = s.lstrip();
string rcln = s.rstrip();
string updated = s.replace("a", "A");
string backwards = s.reverse();
int index = s.find("Lang");
int count = s.count("a");

@ Formatting Methods
string cap = s.capitalize();
string title = s.title();

@ Validation Methods (Boolean returns)
string val = "Hello123";
bool a = val.isalpha();        @ false (contains numbers)
bool b = val.isdigit();        @ false
bool c = val.isalnum();        @ true
bool d = val.isspace();        @ false
bool isup = val.isupper();     @ false
bool islo = val.islower();     @ false
bool starts = val.startswith("He"); @ true
bool ends = val.endswith("123");     @ true


@ --- 4. String Iteration & Slicing ---
@ Quanta natively supports string/array slicing: s[start:end:step]
string u = "Hello";
string slice1 = u[0:2];    @ "He"
string slice2 = u[1:4];    @ "ell"
string slice3 = u[0:5:2];  @ "Hlo"

@ Quanta natively supports looping character-by-character or via indices
string word = "Quanta";
loop i in word {
    print(word[i]);
}


@ --- 5. Operators ---
@ Typical math operators: +, -, *, /, %, ^
int result = 5 ^ 2; @ Exponents

@ Increment and Decrement (Prefix and Postfix)
x++;
++x;
y--;
--y;

@ Comparison and Logic: ==, !=, >, <, >=, <=, and, or, not
if (x >= 50 and not flag) {
    print("Valid");
}


@ --- 6. Control Flow ---
@ If, Elif, Else formatting
if (x > 50) {
    print("Large");
} elif (x == 50) {
    print("Exact");
} else {
    print("Small");
}


@ --- 7. Loops ---
@ Quanta strictly uses the 'loop' keyword. There is no 'for' or 'while'.
int i = 0;
loop (i < 5) {
    print(i);
    i = i + 1;
}


@ --- 8. Functions ---
@ Functions must specify a return type if explicitly declared. 
int calculateArea(int width, int height) {
    return width * height;
}

@ Functions can omit parameter and return types to allow implicit dynamic arguments
add(a, b) {
    return a + b;
}

@ Default Arguments (fallback values if not provided)
int getArea(width = 10, height = 20) {
    return width * height;
}

@ Keyword (Named) Arguments allow calling out of order
string greet(name, rollno) {
    print("Name:", name, "Roll:", rollno);
    return "Done";
}
greet(rollno=30, name="Rohan");


@ --- 9. Classes & Structs (Architectural) ---
class Entity {
    int id;
    string name;

    void printDetails() {
        print(self.name);
    }
}


@ --- 10. Comments ---
@ Single line comments use the '@' symbol.

'''
Multi-line block comments 
use triple single quotes.
'''
