import { Injectable } from '@nestjs/common';

import * as ExcelJs from 'exceljs';
import * as uniqId from 'uniqid';
import * as mkdirp from 'mkdirp';
import { abacusConstants } from '../../abacus.constants';

@Injectable()
export class ExcelService {
  sayHello() {
    return 'OLA';
  }

  // Generates an Excel file with the query results, stores it and return path
  async export(
    headers: string[],
    results: any[][],
    resourceName: string,
  ): Promise<string> {
    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet('Export');

    worksheet.columns = headers.map((h: string) => ({
      header: h,
      key: h,
      width: 32,
    }));

    // Content
    results.forEach((result: any) => {
      const row: string[] = [];
      result.forEach((content: string) => {
        row.push(content);
      });
      worksheet.addRow(row);
    });

    // Store file
    // CamelCase to kebab-case
    const kebabCaseResourceName = resourceName
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();

    // Create custom path. Ex: "posts/Jan19/23/4n5pxq24kp3iob12og9"
    const folder =
      new Date().toLocaleString('en-us', { month: 'short' }) +
      new Date().getFullYear();

    mkdirp.sync(`${abacusConstants.storagePath}/exports/${folder}`);

    const filePath = `exports/${folder}/${uniqId()}-${kebabCaseResourceName}-export.xlsx`;

    return workbook.xlsx
      .writeFile(`${abacusConstants.storagePath}/${filePath}`)
      .then(() => {
        return JSON.stringify({ filePath });
      });
  }
}
