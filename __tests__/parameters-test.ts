import { MethodParametersOnNewLine } from '../src/pslLint/parameters';
import * as api from '../src/pslLint/api';
import { parseText } from '../src/parser/parser';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as activate from '../src/pslLint/activate';

const testFilePath = path.resolve('__tests__', 'files', 'ZTestParams.PROC');
let parametersReport: api.Diagnostic[];

/**
 * 
 * @param reports The reports to filter
 * @param lineNumber Zero-based line number to check, i.e. line 1 of the document is lineNumber 0.
 */
function reportsOnLine(lineNumber: number, reports?: api.Diagnostic[]) {
	if (!reports) {
		return parametersReport.filter(r => r.range.start.line === lineNumber);
	}
	return reports.filter(r => r.range.start.line === lineNumber);
}

describe('Parameter tests', () => {
	beforeAll(async () => {
		let text = await fs.readFile(testFilePath).then(b => b.toString());

		let pslDocument = new api.PslDocument(parseText(text), text, testFilePath);
		let ruleSubscriptions = new activate.RuleSubscription(pslDocument);
		ruleSubscriptions.addMethodRules(new MethodParametersOnNewLine());
		activate.reportRules(ruleSubscriptions);
		parametersReport = ruleSubscriptions.diagnostics;
		
	})

	test('No report for no params', () => {
		expect(reportsOnLine(2).length).toBe(0)
	})

	test('No report for one param on same line', () => {
		expect(reportsOnLine(7).length).toBe(0)
	})

	test('Two reports for two params', () => {
		expect(reportsOnLine(12).length).toBe(2)
	})

	test('Catch label', () => {
		expect(reportsOnLine(17).length).toBe(3)
	})

	test('Catch no types on params', () => {
		expect(reportsOnLine(22).length).toBe(4)
	})

	test('Catch tree', () => {
		expect(reportsOnLine(27).length).toBe(2)
	})

	test('Catch tree with empty parens', () => {
		expect(reportsOnLine(32).length).toBe(2)
	})

	test('Catch tree with empty parens and commas', () => {
		expect(reportsOnLine(37).length).toBe(2)
	})
})