const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;
const express = require('express');
const Datastore = require('nedb');

const platformsDb = new Datastore({ filename: 'hive-streamer-platforms.db', autoload: true });

const app = express();
const port = 3334;

app.use(express.json());

app.get('/', (req, res) => res.json({status: 'OK', code: 200}));

app.post('/save', (req, res) => {
  if(req.body.service && req.body.key) {
    writeConfig(req.body).then(() => {
      restartNginx();
    });
  }
  res.send('ok')
});

app.listen(port, () => console.log(`Hive Streamer Backend listening at http://localhost:${port}`));

const restartNginx = () => {
  exec(path.resolve(__dirname, 'scripts', 'restart.sh'), (error, stdout, stderr) => {
    if (stdout)
      console.log(`stdout: ${stdout}`);

    if (stderr)
      console.log(`stderr: ${stderr}`);

    if (error !== null)
      console.log(`exec error: ${error}`);
  });
}

const writeConfig = (data) => {
  const servicesFolder = '/etc/nginx/conf.d/rtmp/services'
  const serviceFile = path.resolve(servicesFolder, `${data.service}.conf`);
  const serviceFileTemplate = path.resolve(__dirname, 'conf', `${data.service}.conf`);

  platformsDb.update({ service: data.service }, { ...data }, { upsert: true }, function (err, numReplaced, upsert) {
    if(err) console.err('There was an error saving settings.')
  });

  return new Promise((resolve, reject) => {
    fs.access(servicesFolder, error => {
      if (!error) {
        fs.readFile(serviceFileTemplate, 'utf8', function(err, conf) {
          if (err) throw err;
          fs.writeFile(serviceFile, conf.replace('{{ stream_key }}', data.key), 'utf8', function (err) {
            if (err) return console.log(err);
            resolve();
          });
        });
      } else {
        fs.promises.mkdir(servicesFolder, { recursive: true }).then(() => {
          fs.readFile(serviceFileTemplate, 'utf8', function(err, conf) {
            if (err) throw err;
            fs.writeFile(serviceFile, conf.replace('{{ stream_key }}', data.key), 'utf8', function (err) {
              if (err) return console.log(err);
              resolve();
            });
          });
        }).catch((err) => reject(err));
      }
    });
  })
}