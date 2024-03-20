// app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userQueries = require('./userQueries'); 
const bookQueries = require('./bookQueries');
const bcrypt = require('bcrypt');


const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const users = await userQueries.getUserByEmail(email);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
        }
        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: 'Mot de passe incorrect.' });
        }
        res.status(200).json({ success: true, message: 'Connexion réussie !', id: user.id });
    } catch (error) {
        console.error('Erreur lors de la connexion : ', error);
        res.status(500).json({ success: false, message: 'Une erreur s\'est produite lors de la connexion.' });
    }
});

app.post('/register', async (req, res) => {
    const userData = req.body;
    const { email } = userData;
    try {
        const existingUser = await userQueries.getUserByEmail(email);
        if (existingUser.length > 0) {
            return res.status(400).json({ success: false, message: 'Un utilisateur avec cette adresse e-mail existe déjà.' });
        }
        await userQueries.createUser(userData);
        res.status(200).json({ success: true, message: 'Inscription réussie !' });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de l\'utilisateur :', error);
        res.status(500).json({ success: false, message: 'Une erreur s\'est produite lors de l\'enregistrement de l\'utilisateur.' });
    }
});

app.get('/getBookStatus', async (req, res) => {
    const { userId, bookId } = req.query;
    try {
        const status = await bookQueries.getBookStatus(userId, bookId);
        if (status) {
            res.status(200).json({ success: true, status });
        } else {
            res.status(404).json({ success: false, message: 'Statut du livre non trouvé' });
        }
    } catch (error) {
        // console.error('Erreur lors de la récupération du statut du livre : ', error);
        res.status(500).json({ success: false, message: 'Une erreur s\'est produite lors de la récupération du statut du livre.' });
    }
});


app.post('/addBookToCollection', async (req, res) => {
    const { userId, bookId, owned, alreadyRead, reading, wishlist, stars } = req.body;
    try {
        const result = await bookQueries.addBookToCollection(userId, bookId, owned, alreadyRead, reading, wishlist, stars);
        res.status(200).json({ success: true, message: 'Livre ajouté à la collection avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du livre à la collection : ', error);
        res.status(500).json({ success: false, message: 'Une erreur s\'est produite lors de l\'ajout du livre à la collection.' });
    }
});

app.put('/modifyBook', async (req, res) => {
    const { userId, bookId, updateFields } = req.body;
    // console.log(bookId);
    try {
        if (!updateFields || Object.keys(updateFields).length === 0) {
            throw new Error('Les champs de mise à jour ne sont pas définis.');
        }
        const result = await bookQueries.modifyBook(userId, bookId, updateFields);
        res.status(200).json({ success: true, message: 'Livre modifié avec succès' });
    } catch (error) {
        console.error('Erreur lors de la modification du livre : ', error);
        res.status(500).json({ success: false, message: 'Une erreur s\'est produite lors de la modification du livre.' });
    }
});

app.get('/getBooksUser', async (req, res) => {
    const { userId } = req.query;
    try {
        const status = await bookQueries.getBooksUser(userId);
        if (status) {
            res.status(200).json({ success: true, status });
        } else {
            res.status(404).json({ success: false, message: 'Pas de livres' });
        }
    } catch (error) {
        // console.error('Erreur lors de la récupération du statut du livre : ', error);
        res.status(500).json({ success: false, message: 'Une erreur s\'est produite lors de la récupération du statut du livre.' });
    }
});

app.get('/getBestRanked', async (req, res) => {
    try {
        const bestRankedBooks = await bookQueries.getBestRanked();
        res.json(bestRankedBooks);
    } catch (error) {
        console.error('Erreur lors de la récupération des livres les mieux notés :', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des livres les mieux notés' });
    }
});

app.get('/getBooksShelves', async (req, res) => {
    const { userId, shelf } = req.query;
    try {
        const books = await bookQueries.getBooksShelves(userId, shelf);
        console.log(books);
        if (books) {
            res.status(200).json({ success: true, books });
        } else {
            res.status(404).json({ success: false, message: 'Pas de livres' });
        }
    } catch (error) {
        // console.error('Erreur lors de la récupération du statut du livre : ', error);
        res.status(500).json({ success: false, message: 'Une erreur s\'est produite lors de la récupération du statut du livre.' });
    }
});

app.get('/getRank', async (req, res) => {
    const { bookId } = req.query;
    try {
        const rank = await bookQueries.getRank(bookId);
        if (rank) {
            res.status(200).json({ success: true, rank });
        } else {
            res.status(404).json({ success: false, message: 'Pas de moyenne' });
        }
    } catch (error) {
        // console.error('Erreur lors de la récupération du statut du livre : ', error);
        res.status(500).json({ success: false, message: 'Une erreur s\'est produite lors de la récupération du statut du livre.' });
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Serveur backend écoutant sur le port ${port}`);
});
