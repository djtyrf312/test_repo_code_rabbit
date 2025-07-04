import type { TransactionsTab } from 'e2e/pages/casePage/commentsSection/transactionsTab/transactionsTab.pageObject.js';
import { loggedUserWithPackage as test } from 'src/fixtures/loggedUserWithPackage.fixture.js';
import { allureProjects } from 'src/common/helpers/allureHelper/allureCustomFields.types.js';
import { testTags } from 'src/common/constants/testsTags.js';
import {
  componentFee,
  findComponentValue,
  componentInterest,
  transactionType,
} from '../../../../constants/transactionsTab.constants.js';
import { DATE_TODAY_DD_MM_YYYY } from 'e2e/pages/application/application.constants.js';
import { CaseTabs } from 'e2e/pages/casePage/commentsSection/commentsSection.constants.js';
import { miscFunctions } from 'e2e/support/helper/miscelaneousFunctions/miscFunctions.class.js';
import type { AddTransactionFormComponent } from 'e2e/pages/casePage/commentsSection/transactionsTab/addTransactionFormComponent.js';
import type { Invoice } from 'src/common/helpers/apiHelper/caseInvoiceInfo/caseInvoiceInfo.types.js';

const bookingOrderHandler = (orders: Array<{ Name: string }>, name: string) => {
  const bookingOrder = orders.find((order) => order.Name === name);

  if (!bookingOrder) {
    throw new Error('Booking order fee-interest not found');
  }

  return bookingOrder;
};

interface TooltipItem {
  Title: string;
  Type: string;
  Value: number;
  Currency: string;
  Priority: number;
}

let interestAmount: number;
let feeAmount: number;
let transactionTab: TransactionsTab;
let transactionAmount: number;
let initialSum: number;
let invoiceAmount: number;
let invoices: Invoice[];
let tooltip: TooltipItem[];
let addTransactionForm: AddTransactionFormComponent;

const fillAmountBookingForm = async (
  transactionTab: TransactionsTab,
  amount: number,
  type: string,
) => {
  await addTransactionForm.selectTransactionType(type);
  await addTransactionForm.fillBookingDate(DATE_TODAY_DD_MM_YYYY);
  await addTransactionForm.fillAmountField(amount);
  await addTransactionForm.save();
  await transactionTab.assertRecalculationSpinnersAreNotVisible();
};

test.beforeEach(async ({ testHelper, app, caseId, apiHelper }) => {
  transactionTab = app.casePage.commentsSection.transactionsTab;
  addTransactionForm = transactionTab.addTransactionForm;
  const packageId = testHelper.getPackageId().toString();
  invoices = await apiHelper.caseInvoiceInfo.get(caseId);
  invoiceAmount = invoices[0].ActualDebt.Value;

  if (
    miscFunctions.isCurrentProject(allureProjects.BP) ||
    miscFunctions.isCurrentProject(allureProjects.CK) ||
    miscFunctions.isCurrentProject(allureProjects.CEUA)
  ) {
    const bookingOrders = await apiHelper.bookingOrder.get();
    const paymentBookingOrder = bookingOrderHandler(
      bookingOrders,
      `${componentFee}-${componentInterest}`,
    );
    await app.adminPanel.client.batches.packageOverviewPage.open(packageId);
    await app.adminPanel.client.batches.packageOverviewPage.selectPaymentBookingOrder(
      paymentBookingOrder.Name,
    );
    await app.adminPanel.client.batches.packageOverviewPage.clickSaveButton();
    await app.adminPanel.client.batches.packageOverviewPage.assertAlertThatPackageIsUpdated();
  }

  await app.casePage.open(caseId);
  await app.casePage.commentsSection.transactionsTab.open();
  await app.casePage.commentsSection.transactionsTab.clickAddTransactionButton();
});

test(
  `should have the ability to add amount booking transaction`,
  {
    tag: [testTags.BP, testTags.CK, testTags.CEUA, testTags.UGF],
  },
  async ({ apiHelper, app, caseId }) => {
    tooltip = invoices[0].ActualDebt.Tooltip;
    interestAmount = findComponentValue(componentInterest, tooltip);
    feeAmount = findComponentValue(componentFee, tooltip);
    initialSum = interestAmount + feeAmount;
    transactionAmount = Math.floor(interestAmount * 0.1);

    await fillAmountBookingForm(
      transactionTab,
      transactionAmount,
      transactionType,
    );
    await app.casePage.reload();
    await app.casePage.financeInfoTab.open();

    invoices = await apiHelper.caseInvoiceInfo.get(caseId);
    tooltip = invoices[0].ActualDebt.Tooltip;
    interestAmount = findComponentValue(componentInterest, tooltip);
    feeAmount = findComponentValue(componentFee, tooltip);

    await app.casePage.financeInfoTab.assertComponentAmount(
      componentInterest,
      interestAmount,
    );
    await app.casePage.financeInfoTab.assertComponentAmount(
      componentFee,
      feeAmount,
    );
    const newActualSum = initialSum - transactionAmount;
    await app.casePage.assertActualSumToContainValue(newActualSum);
  },
);

test(`should have the ability to add amount booking transaction ${testTags.CEHR} ${testTags.CERO}`, async ({
  app,
  miscFunctions,
}) => {
  initialSum = invoices[0].ActualDebt.Value;
  transactionAmount = Math.floor(invoiceAmount * 0.1);

  const transactionAmountString =
    miscFunctions.formatNumberToCurrencyString(transactionAmount);
  await fillAmountBookingForm(
    transactionTab,
    transactionAmount,
    transactionType,
  );
  await transactionTab.assertRowWithTextToContainText(
    transactionType,
    transactionAmountString,
  );
  await app.casePage.reload();
  await app.casePage.clickTab(CaseTabs.TRANSACTIONS);
  await app.casePage.commentsSection.transactionsTab.assertTableContainsText(
    transactionAmountString,
  );
  await app.casePage.assertActualSumToContainValue(
    initialSum - transactionAmount,
  );
});
