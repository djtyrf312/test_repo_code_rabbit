const { expect, step } = require('@playwright/test');

export class MenuPage {
  constructor(page) {
    this.page = page;
    this.cartLink = page.getByLabel('Cart page');
    this.totalCheckout = page.getByTestId('checkout');
    this.promoMessage = page.getByText(
      "It's your lucky day! Get an extra cup of Mocha for $4.",
    );
    this.yesPromoButton = page.getByRole('button', { name: 'Yes, of course!' });
    this.noPromoButton = page.getByRole('button', { name: "Nah, I'll skip." });
  }

  coffeeCupLocator(coffeeName) {
    const testId = coffeeName.replace(' ', '_');

    return this.page.getByTestId(testId);
  }

  coffeeCupCostLocator(coffeeName) {
    const coffeeCup = this.coffeeCupLocator(coffeeName);
    return this.page.getByRole('listitem').filter({ has: coffeeCup });
  }

  async open() {
    await step('Open the Menu Page', async () => {
      await this.page.goto('/');
    });
  }

  async reload() {
    await step(`Reload the Menu Page`, async () => {
      await this.page.reload();
    });
  }

  async clickCoffeeCup(coffeeName) {
    await step(`Click ${coffeeName} cup`, async () => {
      await this.coffeeCupLocator(coffeeName).click();
    });
  }

  async clickCartLink() {
    await step(`Click 'Cart' link`, async () => {
      await this.cartLink.click();
    });
  }

  async clickYesPromoButton() {
    await step(`Click 'Yes' promo button`, async () => {
      await this.yesPromoButton.click();
    });
  }

  async clickNoPromoButton() {
    await step(`Click 'No' promo button`, async () => {
      await this.noPromoButton.click();
    });
  }

  async assertTotalCheckoutContainsValue(value) {
    await step(`Assert Total checkout has value: ${value}`, async () => {
      await expect(this.totalCheckout).toContainText(value);
    });
  }

  async assertCoffeeCupCostHasValue(coffee, value) {
    await step(`Assert ${coffee} cup cost has value: ${value}`, async () => {
      await expect(this.coffeeCupCostLocator(coffee)).toContainText(value);
    });
  }

  async assertPromoMessageIsVisible() {
    await step(`Click 'No' promo button`, async () => {
      await expect(this.promoMessage).toBeVisible();
    });
  }
}
