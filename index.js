require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
let mongoose;
try {
	mongoose = require("mongoose");
} catch (e) {
	console.log(e);
}
mongoose.connect(process.env['DB_CONNECTION_STRING'], {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

const Schema = mongoose.Schema;
const urlSchema = new Schema({
	url: {
		type: String,
		required: true
	},
	short: {
		type: Number,
		required: true
	}
});
const Url = mongoose.model('Url', urlSchema);

const lastSchema = new Schema({
	lastId: {
		type: Number,
		default: 1
	}
});
const Last = mongoose.model('last', lastSchema);


const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(bodyParser.json());


app.get('/', function(_, res) {
	res.sendFile(process.cwd() + '/views/index.html');
});


// add url
app.post('/api/shorturl', function(req, res) {
	let url = req.body.url
	if ((!/https:\/\//.test(url) && !/http:\/\//.test(url)) || !/\w\.\w+\.\w/.test(url)) {
		res.json({
			error: 'invalid url'
		});
	} else {
		Url.find({
			url: url
		}).countDocuments({}, (err, count) => {
			if (err) console.error(err)
			if (count) {
				Url.findOne({
					url: url
				}, (err, u) => {
					if (err) console.error(err)
					console.log('retrieved', u.url, u.short);
					res.json({
						"original_url": u.url,
						"short_url": u.short
					});
				});
			} else {
				Last.find().countDocuments(function(err, count) {
					if (err) console.error(err);
					let last;
					let lastId;
					if (count > 0) {
						last = Last.findOne({}, (err, r) => {
							if (err) console.error(err);
							lastId = r.lastId;
							r.lastId = lastId + 1;
							r.save();
							let newUrl = new Url({
								url: url,
								short: lastId
							});
							newUrl.save((err, u) => {
								if (err) return console.error(err);
								res.json({
									"original_url": u.url,
									"short_url": u.short
								});
							});
						});
					} else {
						last = new Last({
							lastId: 1
						});
						last.save();
						lastId = 1;
						let newUrl = new Url({
							url: url,
							short: lastId
						})
						newUrl.save((err, u) => {
							if (err) return console.error(err);
							res.json({
								"original_url": u.url,
								"short_url": u.short
							});
						});
					};
				});
			};
		});
	};
});


app.get('/api/shorturl/:id', (req, res) => {
	Url.findOne({
		short: req.params.id
	}, (err, url) => {
		if (err) console.error(err);
		res.redirect(url.url);
	})
})


app.listen(port, function() {
	console.log(`Listening on port ${port}`);
});