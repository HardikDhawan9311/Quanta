@ tests/matrix_test.qnt

print("--- 2D Static Matrix Test ---");
int[2][3] matrix = [[1, 2, 3], [4, 5, 6]];

print("Testing Read:");
print(matrix[0][0]); @ Expected 1
print(matrix[0][2]); @ Expected 3
print(matrix[1][0]); @ Expected 4
print(matrix[1][2]); @ Expected 6

print("Testing Write:");
matrix[1][2] = 99;
print(matrix[1][2]); @ Expected 99

print("--- 1D Dynamic List Test ---");
int[] list = [10, 20];
list.push(30);
print(list[2]); @ Expected 30
