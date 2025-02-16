const bcrypt = require('bcryptjs');

const password = '123456789'; // The password you want to hash
const saltRounds = 10; // Number of salt rounds (recommended: 10)

// Generate the hash
bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Error generating hash:', err);
    } else {
        console.log('Generated hash:', hash);
    }
});