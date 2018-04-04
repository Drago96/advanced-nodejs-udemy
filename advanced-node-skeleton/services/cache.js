const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");

const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

const cacheDuration = 60 * 60 * 24;

mongoose.Query.prototype.cache = function (options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || "");

    return this;
};

mongoose.Query.prototype.exec = async function () {
    if (!this.useCache) {
        return exec.apply(this, arguments);
    }

    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));

    const cacheValue = await client.hget(this.hashKey, key);

    if (cacheValue) {
        const doc = JSON.parse(cacheValue);

        if (doc instanceof Array) {
            return doc.map(d => new this.model(d));
        }

        return new this.model(doc);
    }

    let result;

    try {
        result = await exec.apply(this, arguments);
    } catch (e) {
        throw new Error(e);
    }

    client.hset(this.hashKey, key, JSON.stringify(result));
    client.expire(this.hashKey, cacheDuration);

    return result;
};

function clearHash(hashKey) {
    client.del(JSON.stringify(hashKey || ""));
}

module.exports = {
    clearHash
};
