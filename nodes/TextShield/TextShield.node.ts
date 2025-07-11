import { IExecuteFunctions } from 'n8n-workflow';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import {
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

const sanitizeSQL = (input: string): string => {
  const sqlPatternString = `\\b(SELECT\\s+\\*.*?;|SELECT\\s*\\(.*\\).*?;|INSERT\\s+INTO\\s+.*?;|DELETE\\s+FROM\\s+.*?;|UPDATE\\s+\\w+\\s+SET\\s+.*?;|DROP\\s+TABLE\\s+.*?;|TRUNCATE\\s+TABLE\\s+.*?;|ALTER\\s+TABLE\\s+.*?;|CREATE\\s+TABLE\\s+.*?;|EXEC\\s*\\(?.*?\\)?;?|EXECUTE\\s*\\(?.*?\\)?;?|CALL\\s+\\w+\\s*\\(?.*?\\)?;?|SLEEP\\s*\\(.*?\\);?|LOAD_FILE\\s*\\(.*?\\);?|INTO\\s+OUTFILE\\s+['\"].*?['\"];?|GRANT\\s+.*?;|REVOKE\\s+.*?;|UNION\\s+SELECT\\s+.*?;|MERGE\\s+.*?;|WITH\\s+.*?AS\\s*\\(.*\\).*?;)`;

  const sqlRemovalPattern = new RegExp(sqlPatternString, 'gis');

  const sanitizedText = input.replace(sqlRemovalPattern, '').trim();

  return sanitizedText;
};

export class TextShield implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Text Shield',
    name: 'textShield',
    icon: 'file:icon.svg',
    group: ['transform'],
    version: 1,
    description:
      'Sanitizes input text to prevent malicious code injection (HTML, JS, SQL).',
    defaults: {
      name: 'Text Shield',
    },
    inputs: ['main'] as unknown as any,
    outputs: ['main'] as unknown as any,
    credentials: [],
    properties: [
      {
        displayName: 'Text to Sanitize',
        name: 'textToSanitize',
        type: 'string',
        default: '',
        placeholder: 'Enter text here or use an expression',
        description: 'The text to be sanitized',
        required: true,
      },
      {
        displayName: 'Output Field Name',
        name: 'outputFieldName',
        type: 'string',
        default: 'sanitizedText',
        description: 'The name of the new field for the sanitized text.',
      },
      {
        displayName: 'Sanitize SQL',
        name: 'sanitizeSql',
        type: 'boolean',
        default: false,
        description:
          'Whether to also sanitize against SQL injection. Runs after HTML sanitization.',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const errorData: INodeExecutionData[] = [];

    const window = new JSDOM('').window;
    const DOMPurify = createDOMPurify(window as any);

    for (let i = 0; i < items.length; i++) {
      try {
        const textToSanitize = this.getNodeParameter(
          'textToSanitize',
          i,
          '',
        ) as string;
        const outputFieldName = this.getNodeParameter(
          'outputFieldName',
          i,
          'sanitizedText',
        ) as string;
        const sanitizeSql = this.getNodeParameter(
          'sanitizeSql',
          i,
          true,
        ) as boolean;

        let sanitizedText = DOMPurify.sanitize(textToSanitize);

        if (sanitizeSql) {
          sanitizedText = sanitizeSQL(sanitizedText);
        }

        const newItem: INodeExecutionData = {
          json: { ...items[i].json, [outputFieldName]: sanitizedText },
          binary: items[i].binary,
        };

        returnData.push(newItem);
      } catch (error) {
        if (this.continueOnFail()) {
          const errorItem = {
            json: {
              ...items[i].json,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            binary: items[i].binary,
          };
          returnData.push(errorItem);
          continue;
        }
        throw error;
      }
    }

    return [this.helpers.returnJsonArray(returnData)];
  }
}
