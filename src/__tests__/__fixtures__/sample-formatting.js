// This file tests Prettier compatibility - formatting should be ignored by ESLint
const obj={a:1,b:2,c:3}
const arr=[1,2,3,4,5]

// Prettier would format this differently, but ESLint shouldn't complain
function test(a,b,c){
return a+b+c
}

// String quotes - Prettier handles this, not ESLint
const single='single'
const double="double"

// Semicolons - Also handled by Prettier
const noSemi=true
const withSemi=false;

// Trailing commas
const trailing={
a:1,
b:2,
c:3,
}