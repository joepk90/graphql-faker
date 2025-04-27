import chalk from 'chalk';
import { ValidationErrors } from 'src/utils/fake_definition';

// maybe this should be kept in the schema file
export function prettyPrintValidationErrors(
  validationErrors: ValidationErrors,
) {
  const { subErrors } = validationErrors;
  console.log(
    chalk.red(
      subErrors.length > 1
        ? `\nYour schema contains ${subErrors.length} validation errors: \n`
        : `\nYour schema contains a validation error: \n`,
    ),
  );

  for (const error of subErrors) {
    const [message, ...otherLines] = error.toString().split('\n');
    console.log([chalk.yellow(message), ...otherLines].join('\n') + '\n\n');
  }
}
