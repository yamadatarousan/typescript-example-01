import { test, expect } from "@playwright/test";

const PASSWORD = "password123";

function uniqueEmail() {
  const nonce = Math.random().toString(36).slice(2, 8);
  return `user-${Date.now()}-${nonce}@example.com`;
}

test("Todoを作成すると一覧に表示される", async ({ page }) => {
  const email = uniqueEmail();

  await page.goto("/");
  await page.getByRole("button", { name: "Sign up" }).first().click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.locator("form").getByRole("button", { name: "Sign up" }).click();

  await expect(page.getByText("TODO Frontend")).toBeVisible();

  await page.getByPlaceholder("次のTODOを書いて追加").fill("E2E Todo");
  await page.getByRole("button", { name: "Add" }).click();

  await expect(page.getByText("E2E Todo")).toBeVisible();
});

test("Todoを編集・完了・削除できる", async ({ page }) => {
  const email = uniqueEmail();

  await page.goto("/");
  await page.getByRole("button", { name: "Sign up" }).first().click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.locator("form").getByRole("button", { name: "Sign up" }).click();

  await page.getByPlaceholder("次のTODOを書いて追加").fill("Edit Target");
  await page.getByRole("button", { name: "Add" }).click();

  await expect(page.getByText("Edit Target")).toBeVisible();

  page.on("dialog", async (dialog) => {
    await dialog.accept("Edited Todo");
  });
  const targetCard = page.locator("article", { hasText: "Edit Target" });
  await targetCard.getByRole("button", { name: "Edit" }).click();
  await expect(page.getByText("Edited Todo")).toBeVisible();

  const editedCard = page.locator("article", { hasText: "Edited Todo" });
  await editedCard.getByRole("button", { name: "Done" }).click();
  await expect(editedCard.getByText(/Status: done/i)).toBeVisible();

  await editedCard.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByText("Edited Todo")).not.toBeVisible();
});
