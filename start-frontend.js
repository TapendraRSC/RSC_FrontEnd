const { exec } = require("child_process");

const frontend = exec("npx next start -H 0.0.0.0 -p 3000");

frontend.stdout.on("data", (data) => console.log(data));
frontend.stderr.on("data", (data) => console.error(data));

frontend.on("exit", (code) => console.log(`Frontend exited with code ${code}`));
