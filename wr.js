const http = require('http');
const fs = require('fs');
const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/music")
    .then(function() {
        console.log("Database Connected");
    });

// Structure 
const songSchema = new mongoose.Schema({
    title: String,
    artist: String,
    album: String,
    year: Number,
    genre: String
});

// To create a model object (song model)
const songModel = mongoose.model('songs', songSchema);

const server = http.createServer(function(req, res) {
    if (req.url == '/') {
        res.writeHead('200', { 'Content-Type': 'text/html' });
        fs.createReadStream('code.html').pipe(res); // Updated to use 'index.html'
    } 
    else if(req.url == '/extension.css') {
        res.writeHead('200', { 'Content-Type': 'text/css' });
        fs.createReadStream('extension.css').pipe(res); // Updated to use 'index.html'
    }
    else if (req.url == "/add" && req.method == "POST") {
        let rawData = "";
        req.on('data', function(data) {
            rawData += data;
        });

        req.on('end', function() {
            const inputData = new URLSearchParams(rawData);
            // Save new song details
            songModel.create({
                title: inputData.get('title'),
                artist: inputData.get('artist'),
                album: inputData.get('album'),
                year: inputData.get('year'),
                genre: inputData.get('genre')
            });
            res.writeHead('200', { 'Content-Type': 'text/html' });
            res.write("Song Added Successfully!");
            res.end();
        });
    } 
    else if (req.url == "/view") {
        res.writeHead('200', { 'Content-Type': 'text/html' });
        let i = 1;
        songModel.find().then(function(songs) {
            res.write("<table border=1 cellspacing=0 width=80%>");
            res.write("<tr><th>SL. No</th><th>Title</th><th>Artist</th><th>Album</th><th>Year</th><th>Genre</th></tr>");
            songs.forEach(song => {
                res.write("<tr>");
                res.write("<td>" + i + "</td>");
                res.write("<td>" + song.title + "</td>");
                res.write("<td>" + song.artist + "</td>");
                res.write("<td>" + song.album + "</td>");
                res.write("<td>" + song.year + "</td>");
                res.write("<td>" + song.genre + "</td>");
                res.write("</tr>");
                i++;
            });
            res.write('</table>');
            res.end();
        });
    } 
    else if (req.url == "/update" && req.method == "POST") {
        let rawData = "";
        req.on('data', function(data) {
            rawData += data;
        });

        req.on('end', function() {
            const inputData = new URLSearchParams(rawData);
            const regno = inputData.get('regno'); // Assuming regno is used for finding the song

            songModel.findOneAndUpdate({ title: inputData.get('title') }, {
                artist: inputData.get('artist'),
                album: inputData.get('album'),
                year: inputData.get('year'),
                genre: inputData.get('genre')
            }).then(function(updatedSong) {
                if (updatedSong) {
                    res.writeHead('200', { 'Content-Type': 'text/html' });
                    res.write("Song Updated Successfully!");
                } else {
                    res.writeHead('404', { 'Content-Type': 'text/html' });
                    res.write("No Song Found to Update");
                }
                res.end();
            });
        });
    } 
    else if (req.url == "/delete" && req.method == "POST") {
        let rawData = "";
        req.on('data', function(data) {
            rawData += data;
        });

        req.on('end', function() {
            const inputData = new URLSearchParams(rawData);
            songModel.findOneAndDelete({ title: inputData.get('title') }).then(function(deletedSong) {
                res.writeHead('200', { 'Content-Type': 'text/html' });
                if (deletedSong) {
                    res.write("Song Deleted Successfully!");
                } else {
                    res.write("No Song Found to Delete");
                }
                res.end();
            });
        });
    }
});

server.listen('12000', function() {
    console.log("Server started at 12000 on localhost");
});
