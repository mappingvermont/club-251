# VT-Town-Tracker

A simple application to track how many towns you've been to in Vermont

### Install dependencies

- mongodb
- nodemon
- gulp
- various node libraries: `npm install`

### Run

`nodemon` - to run the server and watch the backend code
`gulp` to monitor front end code + lint

View locally at `localhost:3000`

### Deploy

Run `gulp scripts` to compile the app into `app.min.js` or any changes won't be visible
Use `pm2` to monitor + run the application

### Credits

Based on https://github.com/sitepoint-editors/MEAN-stack-authentication
