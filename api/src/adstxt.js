module.exports = function (config, app) {
    app.get('/ads.txt', (req, res, next) => {
        res.set('Content-Type', 'text/plain');
        if (config['ads.txt'] === undefined) {
            return res.status(404).send("Sorry can't find ads.txt!")
        }
        res.send(config['ads.txt'].join('\n'));
    });
}