import { IntegrationStep } from './step';
import { InvocationValidationFunction } from './validation';

export interface IntegrationInvocationConfig {
  instanceConfigFields?: IntegrationInstanceConfigFieldMap;
  invocationValidator?: InvocationValidationFunction;
  integrationSteps: IntegrationStep[];
}

export interface IntegrationInstanceConfigField {
  type?: 'string' | 'boolean';
  mask?: boolean;
}

export type IntegrationInstanceConfigFieldMap = Record<
  string,
  IntegrationInstanceConfigField
>;
