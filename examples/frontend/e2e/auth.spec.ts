import { test, expect } from "@playwright/test";

const PASSWORD = "password123";

function uniqueEmail() {
  const nonce = Math.random().toString(36).slice(2, 8);
  return `user-${Date.now()}-${nonce}@example.com`;
}

test("サインアップするとTodo画面が表示される", async ({ page }) => {
  const email = uniqueEmail();

  await page.goto("/");

  // サインアップタブに切り替える
  await page.getByRole("button", { name: "Sign up" }).first().click();

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.locator("form").getByRole("button", { name: "Sign up" }).click();

  await expect(page.getByText("TODO Frontend")).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
});

test("ログアウト後に既存ユーザーでログインできる", async ({ page }) => {
  const email = uniqueEmail();

  await page.goto("/");
  await page.getByRole("button", { name: "Sign up" }).first().click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.locator("form").getByRole("button", { name: "Sign up" }).click();
  await expect(page.getByText("TODO Frontend")).toBeVisible();

  await page.getByRole("button", { name: "Logout" }).click();

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.locator("form").getByRole("button", { name: "Login" }).click();

  await expect(page.getByText("TODO Frontend")).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
});
