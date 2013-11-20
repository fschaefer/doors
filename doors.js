!function(global) {

/**
 * Doors constructor.
 * @api public
 */

function Doors(name, locks) {
    var arr = locks || [];
    this.name = name;
    this.keys = [];
    this.locks = {};
    this.callbacks = {};
    for (var l = arr.length; l--;) {
        this.add(arr[l]);
    }
}


/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Doors}
 * @api public
 */

Doors.prototype.on = function(event, fn) {
    (this.callbacks[event] = this.callbacks[event] || [])
        .push(fn);
    return this;
};


/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Doors}
 * @api public
 */

Doors.prototype.once = function(event, fn){
    var _this = this;

    function on() {
        _this.off(event, on);
        fn.apply(this, arguments);
    }

    this.on(event, on);
    return this;
};


/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Doors}
 * @api public
 */

Doors.prototype.off = function(event, fn) {
    var callbacks = this.callbacks[event];
    if (!callbacks) return this;

    // remove all handlers
    if (arguments.length === 1) {
        delete this.callbacks[event];
        return this;
    }

    // remove specific handler
    var i = callbacks.indexOf(fn);
    callbacks.splice(i, 1);
    return this;
};


/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Doors}
 */

Doors.prototype.emit = function(event) {
    var args = [].slice.call(arguments, 1),
        callbacks = this.callbacks[event];

    if (callbacks) {
        for (var i = 0, len = callbacks.length; i < len; ++i) {
            callbacks[i].apply(this, args);
        }
    }

    return this;
};


/**
 * Has key.
 *
 * @param {String} key
 * @return {Boolean} true if key is locked
 * @api public
 */

Doors.prototype.has = function(key) {
    return !!~this.keys.indexOf(key);
};


/**
 * Add lock.
 *
 * @param {String} name
 * @return {Doors}
 * @api public
 */

Doors.prototype.add = function(lock) {
    if (!this.has(lock)) {
        var key = lock;
        if (lock instanceof Doors) {
            var _this = this;
            key = lock.name;
            lock.on('open', function() {
                _this.unlock(key);
            });
        }
        this.locks[key] = lock;
        this.keys.push(key);
    }
    return this;
};


/**
 * Lock a previously added lock.
 * Examples:
 *
 *     door.lock('olivier'); //lock 'olivier'
 *     door.lock('olivier', 'amy'); //lock 'olivier' and 'amy'
 *     door.lock(); //lock all the locks
 *
 * @return {Doors}
 * @api public
 */

Doors.prototype.lock = function() {
    var length = arguments.length;
    if (length) {
        for (var l = length; l--;) {
            var key = arguments[l];
            if (this.locks[key] && !this.has(key)) {
                var lock = this.locks[key];
                if (lock instanceof Doors) {
                    lock.lock();
                }
                this.keys.push(key);
            }
        }
    } else if (Object.keys(this.locks).length) {
        this.lock.apply(this, Object.keys(this.locks));
    }
    return this;
};


/**
 * Unlock door's lock(s).
 * Examples:
 *
 *     door.unlock('olivier'); //unlock 'olivier'
 *     door.unlock('olivier', 'amy'); //unlock 'olivier' and 'amy'
 *     door.unlock(); //unlock all the locks
 *
 * @params {String} key(s)
 * @return {Doors}
 * @api public
 */

Doors.prototype.unlock = function() {
    var length = arguments.length;
    if (length) {
        for (var l = length; l--;) {
            var key = arguments[l];
            if (this.has(key)) {
                var lock = this.locks[key];
                this.keys.splice(this.keys.indexOf(key), 1);
                if (lock instanceof Doors) {
                    lock.unlock();
                }
                this.open();
            }
        }
    } else if (this.keys.length) {
        this.unlock.apply(this, this.keys);
    }
    return this;
};


/**
 * Toggle Lock.
 *
 * @param  {String} name
 * @param  {Boolean} bool
 * @return {Doors}
 * @api public
 */

Doors.prototype.toggle = function(name, bool) {
    if (bool) {
        this.unlock(name);
    } else {
        this.lock(name);
    }
    return this;
};


/**
 * Open the door only if all locks are unlocked.
 * and emit open event.
 *
 * @return {Boolean} true if open
 * @api public
 */

Doors.prototype.open = function() {
    if (!this.keys.length) {
        this.emit('open');
        return true;
    }
    return false;
};


global.Doors = Doors;

}(this);
