import { test } from '../../_fixtures/fixtures';
import { COFFEE_NAMES } from '../../../src/constants';

test('Discounted Mocha Not added to the Cart after promo rejecting', async ({
  cartPage,
  menuPage,
}) => {
  await menuPage.open();
  await menuPage.clickCoffeeCup(COFFEE_NAMES.cappuccino);
  await menuPage.clickCoffeeCup(COFFEE_NAMES.espresso);
  await menuPage.clickCoffeeCup(COFFEE_NAMES.americano);

  await menuPage.assertPromoMessageIsVisible();
  await menuPage.clickNoPromoButton();

  await menuPage.clickCartLink();
  await cartPage.waitForLoading();

  await cartPage.assertCoffeeItemIsVisible(COFFEE_NAMES.espresso);
  await cartPage.assertCoffeeItemIsHidden('(Discounted) Mocha');

  await cartPage.assertCoffeeItemIsVisible(COFFEE_NAMES.cappuccino);
  await cartPage.assertCoffeeItemIsVisible(COFFEE_NAMES.americano);
});
