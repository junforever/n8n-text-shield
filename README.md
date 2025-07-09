# n8n-text-shield

An n8n community node designed to sanitize text inputs, protecting your workflows from malicious code injection, including Cross-Site Scripting (XSS) and SQL Injection.

## Features

- **XSS Protection:** Sanitizes input text to remove malicious HTML and JavaScript code using the robust `DOMPurify` library.
- **SQL Injection Protection:** Optionally escapes input text to prevent SQL injection attacks, powered by `sqlstring`. This feature can be toggled on or off.
- **Preserves Data Context:** The node seamlessly integrates into your workflow by cloning the original data and adding the sanitized text as a new field, ensuring no data is lost.
- **Flexible Configuration:** Allows you to specify which field to sanitize and what to name the new output field.
- **Integrated Error Handling:** Works directly with n8n's built-in "Continue on Fail" setting for robust and straightforward error management.

## Prerequisites

Ensure you have a running n8n instance. For installation instructions, refer to the [n8n installation guide](https://docs.n8n.io/hosting/installation/).

## Installation

1.  Navigate to **Settings > Community Nodes** in your n8n instance.
2.  Select **Install a community node**.
3.  Enter `n8n-text-shield` as the **NPM package name**.
4.  Click **Install**.

You will need to restart your n8n instance for the node to become available in the editor.

## How to Use

You can find the **Text Shield** node under the "Transform" category in the nodes panel.

### Input Properties

- **Field to Sanitize:** The field containing the text you wish to sanitize. This is typically an expression pulling data from a previous node (e.g., {{ $json.body.comment }}).
- **Output Field Name:** The name for the new field that will be added to your data, containing the sanitized text. Defaults to sanitizedText.
- **Sanitize for SQL:** A checkbox that is disabled by default. When active, the node will also escape the text, making it safer for use in SQL queries. This runs after the HTML/JS sanitization.

### Outputs

- The node has a single output. If the sanitization is successful, the original item is passed on with the new sanitized field added to it.

### Error Handling

- The node integrates with n8n's native error handling.

- If "Continue on Fail" is OFF (default): The workflow will stop and show an error if sanitization fails for any item.

- If "Continue on Fail" is ON: The workflow will continue. The item that failed will be passed on, but with an error object added to its JSON data, allowing for graceful error management in your workflow.

## Core Dependencies

This node is built upon these excellent open-source libraries:

- [DOMPurify](https://github.com/cure53/DOMPurify) for XSS sanitization.
- [JSDOM](https://github.com/jsdom/jsdom) to provide a virtual DOM environment for DOMPurify.
- [sqlstring](https://github.com/mysqljs/sqlstring) for escaping SQL strings.

## License

This project is licensed under the MIT License.
