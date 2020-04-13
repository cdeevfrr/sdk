import { createCli } from '../index';
import { loadProjectStructure } from './loadProjectStructure';
import * as log from '../log';

import { IntegrationStepResultStatus } from '../../framework/execution';

jest.mock('../log');

afterEach(() => {
  // clear require cache
  Object.keys(require.cache).forEach((modulePath) => {
    delete require.cache[modulePath];
  });
});

describe('collect', () => {
  beforeEach(() => {
    loadProjectStructure('typeScriptProject');
    process.env.MY_CONFIG = 'false';
  });

  test('loads the integration, executes it, and logs the result', async () => {
    await createCli().parseAsync(['node', 'j1-integration', 'collect']);

    expect(log.displayExecutionResults).toHaveBeenCalledTimes(1);
    expect(log.displayExecutionResults).toHaveBeenCalledWith({
      integrationStepResults: [
        {
          id: 'fetch-accounts',
          name: 'Fetch Accounts',
          types: ['my_account'],
          status: IntegrationStepResultStatus.SUCCESS,
        },
        {
          id: 'fetch-users',
          name: 'Fetch Users',
          types: ['my_user'],
          status: IntegrationStepResultStatus.SUCCESS,
        },
      ],
      metadata: {
        partialDatasets: {
          types: [],
        },
      },
    });
  });
});