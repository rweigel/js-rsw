var a = 1; // Same result with or without var.  Good habit to keep it in case code is moved into a function.
hello1();
console.log(a); // 2

var a = 1; // Same result with or without var.
hello2();
console.log(a); // 1

hello3();
console.log(b)

function hello1() {
    a = 2; // Modifes external variable.
    console.log(a);  // 2
}

function hello2() {
    var a = 2; // a is a local variable.
    console.log(a); // 2
}

function hello3() {
    b = 99; // a is a global variable.
    console.log(b); // 99
}