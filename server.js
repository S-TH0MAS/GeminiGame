const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Sert les fichiers statiques depuis le dossier 'public'
// C'est ici que tout votre site (menu + jeux) vivra
app.use(express.static(path.join(__dirname, 'public')));

// Redirection par défaut si on tape juste l'URL sans fichier
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Serveur de développement lancé sur http://localhost:${PORT}`);
    console.log(`Pour le projet final statique, copiez simplement le contenu du dossier 'public'.`);
});

