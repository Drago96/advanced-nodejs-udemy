const puppeteer = require("puppeteer");
const sessionFactory = require("../factories/sessionFactory");
const userFactory = require("../factories/userFactory");

class Page {
    static async build() {
        const browser = await puppeteer.launch({
            headless: false
        });

        const page = await browser.newPage();
        const customPage = new Page(page);

        return new Proxy(customPage, {
            get: function (target, property) {
                return target[property] || browser[property] || page[property];
            }
        });
    }

    constructor(page) {
        this.page = page;
    }

    async login() {
        const user = await userFactory();
        const { session, sig } = sessionFactory(user);

        await this.page.setCookie({ name: "session", value: session });
        await this.page.setCookie({ name: "session.sig", value: sig });
        await this.page.goto("localhost:3000/blogs");

        const logoutSelector = `a[href="/auth/logout"]`;
        await this.page.waitFor(logoutSelector);
    }

    async get(path) {
        return this.page.evaluate((_path) => {
            return fetch(_path, {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(res => res.json());
        }, path);
    }

    async post(path, data) {
        return this.page.evaluate((_path, _data) => {
            return fetch(_path, {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(_data)
            }).then(res => res.json());
        }, path, data);
    }

    async getContentsOf(selector) {
        return this.page.$eval(selector,
            el => el.innerHTML);
    }
}

module.exports = Page;
