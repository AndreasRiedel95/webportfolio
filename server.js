const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const express = require('express');
const helmet = require('helmet');
const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(express.static('public'));

app.get('*', (_, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, HOST, () => {
  console.log(`App listening on port ${PORT}`);
});
