const PORT = process.env.PORT || 3000;

const express = require('express');
const app = express();
app.use(express.static('public'));

app.get('*', (_, res) => {
  console.log('Request');
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
