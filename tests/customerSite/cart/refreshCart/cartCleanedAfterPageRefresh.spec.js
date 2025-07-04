import { test } from '../../../_fixtures/fixtures';

const name = 'Cappuccino';
const name_second = 'Cappucino';

test('test 1', async ({ cartPage, menuPage }) => {
  await menuPage.someMethod();
  await menuPage.click(name);

  await menuPage.clickLink();
  await cartPage.waitfor();

  await cartPage.assertitemisvisible(name_second);

  await cartPage.reload();

  await cartPage.assertCoffeeItemIsHidden(name);
  await cartPage.assertNoCoffeeMessageIsVisible();
});
