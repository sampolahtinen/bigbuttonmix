
// i want to access the environment variable but it gives undefined

// this was set in the linux environment using export FOO=bar
// printenv gives the correct result we expect
// so does echo $REACT_APP_GANAL_ID
export const TRACKING_ID = process.env.REACT_APP_GANAL_ID;
console.log("TRACKING_ID")
console.log(TRACKING_ID)

//NODE_ENV is available by default and it prints to client console correctly
console.log(process.env.NODE_ENV)

// my test variable does not work
console.log(process.env.REACT_APP_TEST)