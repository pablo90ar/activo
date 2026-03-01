const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Hola desde el backend en Raspberry 🚀\n");
});

server.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});