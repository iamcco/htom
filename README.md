# htom

convert html to markdown

- list support
- nested list support
- task list support
- table support
- ...

## usage

**install**
```bash
yarn add htom

# or

npm install htom
```

**usage**

```javascript
const htom = require('htom');

htom('<h1> test html </h1>').then(markdown => console.log(markdown));
```

**build & test**

```
git clone https://github.com/iamcco/htom.git
cd htom
npm install

# build
npm run build

#test
npm run test
```

## screenshot

**html for convert:**

![html](https://user-images.githubusercontent.com/5492542/40275861-128912e2-5c2e-11e8-8192-9db3f53f7f29.png)

**output markdown:**

![markdown](https://user-images.githubusercontent.com/5492542/40275866-2acbedc0-5c2e-11e8-8e25-50e545c9cf71.png)
