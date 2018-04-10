const Page = require("./helpers/page");

let page;

describe("blogs", () => {
    beforeEach(async () => {
        page = await Page.build();
        await page.goto("http://localhost:3000");
    });

    afterEach(async () => {
        try {
            await page.close();
        } catch (e) {

        }
    });

    describe("when user logged in", () => {
        beforeEach(async () => {
            await page.login();
        });

        describe("when user on blog create page", () => {
            beforeEach(async () => {
                const createBlogButtonSelector = `a[href="/blogs/new"]`;
                await page.click(createBlogButtonSelector);
            });

            test("should see blog create form", async () => {
                const label = await page.getContentsOf("form label");
                expect(label).toEqual("Blog Title");
            });

            describe("when using invalid inputs", () => {
                beforeEach(async () => {
                    const submitButtonSelector = `button[type="submit"]`;
                    await page.click(submitButtonSelector);
                });

                test("the form should show an error message", async () => {
                    const titleErrorMessageSelector = "div.title .red-text";
                    const titleErrorMessage = await page.getContentsOf(titleErrorMessageSelector);

                    const contentErrorMessageSelector = "div.content .red-text";
                    const contentErrorMessage = await page.getContentsOf(contentErrorMessageSelector);

                    const expectedErrorMessage = "You must provide a value";
                    expect(titleErrorMessage).toEqual(expectedErrorMessage);
                    expect(contentErrorMessage).toEqual(expectedErrorMessage);
                });
            });

            describe("when using valid inputs", () => {
                beforeEach(async () => {
                    await page.type(".title input", "Test Title");
                    await page.type(".content input", "Test Content");
                    await page.click(`button[type="submit"]`);
                });

                test("submitting should take user to review screen", async () => {
                    const confirmText = await page.getContentsOf("form h5");
                    expect(confirmText).toEqual("Please confirm your entries");
                });

                test("submitting then saving should add blog to index page", async () => {
                    await page.click("form .green");
                    await page.waitFor(".card");

                    const pageUrl = await page.url();
                    const title = await page.getContentsOf(".card-title");
                    const content = await page.getContentsOf(".card-content p");

                    expect(pageUrl).toEqual("http://localhost:3000/blogs");
                    expect(title).toEqual("Test Title");
                    expect(content).toEqual("Test Content");
                });
            });
        });
    });

    describe("when user not logged in", () => {
        test("user should not be able to create blog posts", async () => {
            const result = await page.post("/api/blogs", {
                title: "Test Title",
                content: "Test Content"
            });

            expect(result).toEqual({ error: "You must log in!" });
        });

        test("user should not be able to retrieve blog posts", async () => {
            const result = await page.get("/api/blogs");

            expect(result).toEqual({ error: "You must log in!" });
        });
    });
});
