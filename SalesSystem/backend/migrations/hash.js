const bcrypt = require("bcrypt");

(async () => {
  const hash = await bcrypt.hash("password123", 10);
  console.log("Hash:", hash);
})();
