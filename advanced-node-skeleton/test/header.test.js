const Page = require("./helpers/page");

let page;

describe("header", () => {
    beforeEach(async () => {
        page = await Page.build();
        await page.goto("localhost:3000");
    });

    afterEach(async () => {
        try {
            await page.close();
        } catch (e) {

        }
    });

    test("home page logo should exist with correct text", async () => {
        const logoSelector = "a.brand-logo";
        const blogsterLinkText = await page.getContentsOf(logoSelector);

        expect(blogsterLinkText).toEqual("Blogster");
    });

    describe("when user not logged in", () => {
        test("clicking login should start oauth flow", async () => {
            const loginSelector = ".right a";
            await page.click(loginSelector);
            const pageUrl = await page.url();

            expect(pageUrl).toMatch(/accounts\.google\.com/);
        });
    });

    describe("when user logged in", () => {
        beforeEach(async () => {
            await page.login();
        });

        test("logout button should be displayed", async () => {
            const logoutSelector = `a[href="/auth/logout"]`;
            const logoutLinkText = await page.getContentsOf(logoutSelector);

            expect(logoutLinkText).toEqual("Logout");
        });
    });
});
