import { expect, type Locator } from '@playwright/test';
import { BasePage } from 'e2e/pages/basePage/basePage.js';
import { step } from 'e2e/pages/application/step.js';
import { AddTransactionFormComponent } from 'e2e/pages/casePage/commentsSection/transactionsTab/addTransactionFormComponent.js';
import { CasePage } from 'e2e/pages/casePage/casePage.js';
import { CaseTabs } from 'e2e/pages/casePage/commentsSection/commentsSection.constants.js';
import { miscFunctions } from 'e2e/support/helper/miscelaneousFunctions/miscFunctions.class.js';
import { EProjects } from 'src/common/helpers/allureHelper/allureCustomFields.types.js';

export class TransactionsTab extends BasePage {
  addTransactionForm = new AddTransactionFormComponent(this.page);
  private readonly root: Locator = this.page.locator('#info-history');
  private readonly transactionHistoryTable = this.root.locator(
    '#transaction-history',
  );
  private readonly row = this.root.locator('tbody tr');
  private readonly addTransactionButton = this.root.getByRole('button', {
    name: 'Add transaction',
  });
  @step()
  async open(): Promise<void> {
    await new CasePage(this.page).clickTab(CaseTabs.TRANSACTIONS);
    await this.expectLoaded();
  }
  @step()
  async clickAddTransactionButton(): Promise<void> {
    if (
      miscFunctions.isCurrentProject(EProjects.BP) ||
      miscFunctions.isCurrentProject(EProjects.CEUA) ||
      miscFunctions.isCurrentProject(EProjects.CK) ||
      miscFunctions.isCurrentProject(EProjects.UGF)
    ) {
      const caseComponentAmountResponse =
        this.waitForResponseThatIncludesString('/case-component-amount');
      await this.addTransactionButton.click();
      await caseComponentAmountResponse;
    } else {
      await this.addTransactionButton.click();
    }
    await this.page.waitForTimeout(2000);
  }
  @step()
  async getRowsAmount(): Promise<number> {
    await this.expectLoaded();
    return await this.row.count();
  }
  @step()
  async assertRowWithTextIsNotVisible(text: string): Promise<void> {
    const row = this.row.filter({ hasText: text });
    await expect.soft(row).toBeHidden();
  }
  @step()
  async deleteTransactionWithText(text: string): Promise<void> {
    const row = this.row.filter({ hasText: text });
    await row.click();
    const checkBox = row.locator('.el-checkbox');
    await checkBox.click();
    const deleteButton = this.root.getByText('Delete selected');
    const transactionDeleteResponse = this.waitForResponseThatIncludesString(
      '/api/transaction-delete',
    );
    await deleteButton.click();
    await this.confirmWarning();
    await transactionDeleteResponse;
    await expect
      .soft(this.page.locator('.el-loading-spinner').first())
      .toBeHidden();
  }
  @step()
  async assertTableContainsText(text: string): Promise<void> {
    await expect.soft(this.root).toContainText(text);
  }
  @step()
  async assertRowWithTextToContainText(
    rowText: string,
    expectedText: string,
  ): Promise<void> {
    const row = this.row.filter({ hasText: rowText });
    await expect.soft(row).toContainText(expectedText);
  }
  private async expectLoaded(): Promise<void> {
    await expect(this.transactionHistoryTable).toBeVisible();
  }
}
