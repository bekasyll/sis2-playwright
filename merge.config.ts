/**
 * Used only by `npx playwright merge-reports --config merge.config.ts <dir>`:
 * builds one HTML report and one JUnit file from the blob reports of all shards.
 */
export default {
  testDir: './tests',
  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'reports/junit-merged.xml' }],
  ],
};
