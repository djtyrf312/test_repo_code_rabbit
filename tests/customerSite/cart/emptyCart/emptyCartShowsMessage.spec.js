import { test } from '../../../_fixtures/fixtures';

test('An empty cart shows correct message', async ({ cartPage }) => {
  await cartPage.open();

  await cartPage.assertNoCoffeeMessageIsVisible();
});
