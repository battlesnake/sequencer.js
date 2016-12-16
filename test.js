const Sequencer = require('./');

let sequencer = new Sequencer({ timeout: 50 });

sequencer.on('send', msg => {
	console.log('SEND', msg);
});

sequencer.request({ msg: 'hi' })
	.then(res => console.log('RES', res), err => console.log('ERR', err));

sequencer.request({ msg: 'bye' })
	.then(res => console.log('RES', res), err => console.log('ERR', err));

sequencer.request({ msg: 'oota' })
	.then(res => console.log('RES', res), err => console.log('ERR', err.message));

sequencer.reject({ seq: 1, msg: 'nagamiste' });
sequencer.resolve({ seq: 0, msg: 'tere' });
