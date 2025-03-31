# FastClick Studio

## Installation and Setup

### Installing **FastClick**

FastClick is required. To install and configure it properly, refer to the official documentation:

**FastClick Wiki** : [FastClick GitHub Wiki](https://github.com/tbarbette/fastclick)

During development, I use the following configuration:

```sh
./configure --enable-userlevel --disable-linuxmodule --enable-user-multithread --enable-stats=2
```

### Running FastClick with HotSwapping

Once FastClick is installed, start Click in hotswapping mode with the following command:

```sh
./bin/click -R <click file> -p 7777
```

**Important** : The `-R` option is essential to enable **hotswapping**.

---

## Installing the Web Interface

The web interface allows you to visualize and configure FastClick elements.

### Clone the repository

```sh
git clone <URL_DU_REPO>
cd FastClick-Studio
```

### Environment Configuration

Create a `.env` file at the root of the project and add the following variables:

```sh
PORT=
```

**Note** : A `.env.example` file is available in the repository if needed.

### Installing dependencies

Install all necessary dependencies using **npm** :

```sh
npm install
```

### Start the application

```sh
npm run start
```

---

##  Note

- Make sure FastClick is properly configured.
