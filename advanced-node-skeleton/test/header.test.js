const puppeteer = require("puppeteer");
const Buffer = require("safe-buffer").Buffer;
const Keygrip = require("keygrip");
const keys = require("../config/keys");

let browser;
let page;

describe("header", () => {
    beforeEach(async () => {
        browser = await puppeteer.launch({
            headless: false
        });

        page = await browser.newPage();
        await page.goto("localhost:3000");
    });

    afterEach(async () => {
        try {
            await browser.close();
        } catch (e) {

        }
    });

    test("home page logo should exist with correct text", async () => {
        const logoSelector = "a.brand-logo";

        await page.waitFor(logoSelector);
        const blogsterLinkText = await page.$eval(logoSelector,
            el => el.innerHTML);

        expect(blogsterLinkText).toEqual("Blogster");
    });

    describe("when user not logged in", () => {
        test("clicking login should start oauth flow", async () => {
            const loginSelector = ".right a";

            await page.waitFor(loginSelector);
            await page.click(loginSelector);
            const pageUrl = await page.url();

            expect(pageUrl).toMatch(/accounts\.google\.com/);
        });
    });

    describe("when user logged in", () => {
        beforeEach(async () => {
            const userId = "5ac3abf6b0bdaa0ba81ab27d";

            const sessionObject = {
                passport: {
                    user: userId
                }
            };
            const sessionString = Buffer
                .from(JSON.stringify(sessionObject))
                .toString("base64");

            const keygrip = new Keygrip([keys.cookieKey]);
            const sig = keygrip.sign("session=" + sessionString);

            await page.setCookie({ name: "session", value: sessionString });
            await page.setCookie({ name: "session.sig", value: sig });
            await page.reload();
        });

        test("logout button should be displayed", async () => {
            const logoutSelector = `a[href="/auth/logout"]`;

            await page.waitFor(logoutSelector);
            const logoutLinkText = await page.$eval(logoutSelector,
                el => el.innerHTML);

            expect(logoutLinkText).toEqual("Logout");
        });
    });
});
