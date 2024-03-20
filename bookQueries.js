const connection = require('./database');
const axios = require('axios');

exports.searchBooks = async (query) => {
    try {
        const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
            params: {
                q: query,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

exports.getBookStatus = (userId, bookId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM registered_books WHERE user_id = ? AND book_id = ?`;
        connection.query(sql, [userId, bookId], (err, results) => {
            if (err) {
                reject(err);
            } else {
                if (results.length > 0) {
                    resolve(results[0]);
                } else {
                    resolve(null);
                }
            }
        });
    });
};

exports.addBookToCollection = (userId, bookId, owned, alreadyRead, reading, wishlist, stars) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO registered_books (user_id, book_id, owned, already_read, reading, wishlist, stars) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        connection.query(sql, [userId, bookId, owned, alreadyRead, reading, wishlist, stars], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

exports.modifyBook = (userId, bookId, updateFields) => {
    return new Promise((resolve, reject) => {
        if (!updateFields || Object.keys(updateFields).length === 0) {
            reject(new Error('Les champs de mise à jour ne sont pas définis.'));
            return;
        }

        const updateValues = [];
        let updateClause = '';

        // console.log(updateFields);

        for (const [key, value] of Object.entries(updateFields)) {
            updateClause += `${key} = ?, `;
            updateValues.push(value);
        }

        // Ajoutez userId et bookId aux valeurs à mettre à jour

        updateValues.push(userId, bookId);
        // console.log(updateValues);

        // Supprimez la virgule finale de la clause SET
        updateClause = updateClause.slice(0, -2);

        // console.log(updateClause);
        // console.log(userId);
        // console.log(bookId);

        const sql = `UPDATE registered_books SET ${updateClause} WHERE user_id = ? AND book_id = ?`;

        connection.query(sql, updateValues, (err, result) => {
            if (err) {
                // console.log(err);
                console.error(err);
                reject(err);
            } else {
                // console.log(result);
                resolve(result);
            }
        });
    });
};

exports.getBooksUser = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM registered_books WHERE user_id = ? LIMIT 10`;
        connection.query(sql, [userId], async (err, results) => {
            if (err) {
                reject(err);
            } else {
                try {
                    const booksWithDetails = await Promise.all(results.map(async (book) => {
                        const googleBooksResponse = await axios.get(`https://www.googleapis.com/books/v1/volumes/${book.book_id}`);
                        const bookDetails = googleBooksResponse.data;
                        return { ...book, details: bookDetails };
                    }));
                    resolve(booksWithDetails);
                } catch (error) {
                    reject(error);
                }
            }
        });
    });
};

exports.getBestRanked = async () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT
            book_id,
            AVG(stars) AS average_rating
        FROM
            registered_books
        GROUP BY
            book_id
        ORDER BY
            average_rating DESC
        LIMIT 5`;

        connection.query(sql, async (error, results) => {
            if (error) {
                reject(error);
            } else {
                try {
                    const bestRankedWithDetails = await Promise.all(results.map(async(book) => {
                        const googleBooksResponse = await axios.get(`https://www.googleapis.com/books/v1/volumes/${book.book_id}`);
                        const bookDetails = googleBooksResponse.data;
                        return { ...book, details: bookDetails };
                    }));
                    resolve(bestRankedWithDetails)
                } catch (error) {
                    reject(error)
                }
            }
        });
    })
};

exports.getBooksShelves = (userId, shelf) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM registered_books WHERE user_id = ? AND ? = 1`;
        connection.query(sql, [userId, shelf], async (err, results) => {
            if (err) {
                reject(err);
            } else {
                try {
                    const booksWithDetails = await Promise.all(results.map(async (book) => {
                        const googleBooksResponse = await axios.get(`https://www.googleapis.com/books/v1/volumes/${book.book_id}`);
                        const bookDetails = googleBooksResponse.data;
                        return { ...book, details: bookDetails };
                    }));
                    resolve(booksWithDetails);
                } catch (error) {
                    reject(error);
                }
            }
        });
    });
};

exports.getRank = (bookId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT AVG(stars) AS average_rating FROM registered_books WHERE book_id = ?`;
        connection.query(sql, [bookId], (err, results) => {
            if (err) {
                reject(err); 
            } else {
                if (results.length > 0) {
                    const averageRating = results[0].average_rating;
                    resolve(averageRating); 
                } else {
                    resolve(null); 
                }
            }
        });
    });
};
