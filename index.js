const _ = require('lodash');
const EventEmitter = require('eventemitter');

module.exports = Sequencer;

const defaultOpts = {
	seqField: 'seq',
	dataField: null,
	resultField: null,
	errorField: null,
	timeout: -1,
	initialValue: 0
};

function Sequencer(opts) {
	EventEmitter.call(this);

	const { seqField, dataField, resultField, errorField, timeout, initialValue } = _.defaults({}, opts, defaultOpts);

	let _seq = initialValue;
	const map = new Map();

	this.next = () => {
		const seq = _seq++;
		_seq = _seq % (1 << 28);
		return seq;
	};

	this.request = data => new Promise((resolve, reject) => {
		const seq = this.next();
		const msg = {};
		if (dataField === null) {
			_.assign(msg, data);
		}
		_.set(msg, seqField, seq);
		const doTimeout = () => reject(new Error('Timeout'));
		const timer = timeout > 0 ? setTimeout(doTimeout, timeout) : null;
		const doCompleted = (success, result) => {
			clearTimeout(timer);
			map.delete(seq);
			if (success) {
				return resolve(result);
			} else {
				return reject(result);
			}
		};
		map.set(seq, doCompleted);
		this.emit('send', msg);
	});

	this.complete = (success, data) => {
		const seq = _.get(data, seqField);
		const cb = map.get(seq);
		if (!cb) {
			return false;
		}
		map.delete(seq);
		const field = success ? resultField : errorField;
		const result = field === null ? data : _.get(data, field);
		cb(success, result);
		return true;
	};

	this.resolve = data => this.complete(true, data);
	this.reject = data => this.complete(false, data);

	this.clear = () => {
		const deferreds = [...map.values()];
		map.clear();
		for (const deferred of deferreds) {
			deferred(false, null);
		}
	};
}
Sequencer.prototype = new EventEmitter();
