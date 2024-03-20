const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: '', 
  database: 'my_book_nook', 
});

connection.connect(err => {
  if (err) {
    console.error('Erreur lors de la connexion à MySQL :', err);
    throw err;
  }
  console.log('Connecté à MySQL avec succès !');
});

module.exports = connection;
