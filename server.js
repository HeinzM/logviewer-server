const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');

// Stammverzeichnis zum durchsuchen
const rootDirectory = './logs';
io.on('connection', (socket) => {
  console.log('Client connected');

  // Ereignis, um die Liste der vorhandenen Unterverzeichnisse zu liefern
  socket.on('getSubdirectories', () => {
    const subdirectories = fs.readdirSync(rootDirectory, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    socket.emit('subdirectoriesList', subdirectories);
  });

  // Ereignis, um Dateinamen und Inhalt aus einem bestimmten Verzeichnis zu liefern
  socket.on('getFileContent', (directoryName) => {
    const directoryPath = `${rootDirectory}/${directoryName}`;
    if (!fs.existsSync(directoryPath)) {
      socket.emit('directoryNotFoundError', ` Das Verzeichnis "${directoryName}" wurde nicht gefunden.`);
      return;
    }

    const fileNames = fs.readdirSync(directoryPath);
    const filesContent = {};

    filesNames.forEach((fileName) => {
      const filePath = `${directoryPath}/${fileName}`;
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      filesContent[fileName] = fileContent;
    });

    socket.emit('filesContent', filesContent);
  });

  // Ereignis, wenn der Client die Verbindung trennt
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const port = 3000;
http.listen(port, () =>{
  console.log(`Server listening on port ${port}`);
});