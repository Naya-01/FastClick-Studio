# FastClick Visualizer

## Installation et Configuration

### Installation de **FastClick**

FastClick est nécessaire. Pour l'installer et le configurer correctement, consultez la documentation officielle :

**FastClick Wiki** : [FastClick GitHub Wiki](https://github.com/tbarbette/fastclick)

Lors du développement, j'utilise la configuration suivante :

```sh
./configure --enable-userlevel --disable-linuxmodule --enable-user-multithread --enable-statistic
```

### Lancement de **Click** avec HotSwapping

Une fois FastClick installé, démarrez **Click** en mode **hotswapping** avec la commande suivante :

```sh
./bin/click -R <click file> -p 7777
```

**Important** : L'option `-R` est essentielle pour activer le **hotswapping**.

---

## Installation de l'Interface Web

L'interface web permet de visualiser et configurer les elements de FastClick.

### Cloner le dépôt

```sh
git clone <URL_DU_REPO>
cd fastclick-visualizer-react
```

### Configuration de l'environnement

Créez un fichier `.env` à la racine du projet et ajoutez les variables suivantes :

```sh
PORT=
REACT_APP_API_URL=
```

**Note** : Un fichier `.env.example` est disponible dans le dépôt si besoin.

### Installation des dépendances

Installez toutes les dépendances nécessaires avec **npm** :

```sh
npm install
```

### Lancer l'application

```sh
npm run start
```

---

##  Remarque

- Assurez-vous que **FastClick** est bien configuré.
- Vérifiez que le port défini dans `REACT_APP_API_URL` correspond bien à celui utilisé par FastClick.
