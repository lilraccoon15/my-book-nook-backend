const connection = require('./database');

exports.getUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM users WHERE email = ?`;
        connection.query(sql, [email], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.createUser = (userData) => {
    return new Promise((resolve, reject) => {
        const { username, email, password, birth_year, gender, country, accepted_terms } = userData;
        const sql = `INSERT INTO users (username, email, password, birth_year, gender, country, accepted_terms) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        connection.query(sql, [username, email, password, birth_year, gender, country, accepted_terms], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};
