import yaml from 'js-yaml';

export interface OpenAPIEndpoint {
  id: string;
  path: string;
  method: string;
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: any[];
  requestBody?: any;
  responses?: any;
}

export interface OpenAPISpec {
  openapi?: string;
  swagger?: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{ url: string }>;
  paths: Record<string, any>;
}

export const parseOpenAPIFile = async (file: File): Promise<OpenAPISpec> => {
  const content = await file.text();
  return parseOpenAPIContent(content);
};

export const parseOpenAPIFromUrl = async (url: string): Promise<OpenAPISpec> => {
  // List of CORS proxies to try
  const corsProxies = [
    '', // Try direct first
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
  ];

  let lastError: Error | null = null;

  for (const proxy of corsProxies) {
    try {
      const fetchUrl = proxy ? proxy + encodeURIComponent(url) : url;
      const response = await fetch(fetchUrl, {
        headers: {
          'Accept': 'application/json, application/x-yaml, text/yaml, text/plain, */*'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const content = await response.text();
      
      // Verify we got valid content
      if (!content || content.trim().length === 0) {
        throw new Error('Empty response received');
      }
      
      return parseOpenAPIContent(content);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      // Continue to next proxy
      continue;
    }
  }

  // All proxies failed
  throw new Error(
    `Unable to load from URL. ${lastError?.message || ''}\n\n` +
    `Tip: Download the file and upload it, or paste the content directly in the "Paste Content" tab.`
  );
};

export const parseOpenAPIContent = (content: string): OpenAPISpec => {
  let parsedContent: any;
  
  try {
    // Try parsing as JSON first
    parsedContent = JSON.parse(content);
  } catch {
    // If JSON fails, try YAML
    try {
      // Use default YAML loading
      parsedContent = yaml.load(content);
      
      if (!parsedContent) {
        throw new Error('YAML parsing resulted in empty content');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      // Provide helpful error message
      if (errorMsg.includes('bad indentation') || errorMsg.includes('mapping')) {
        throw new Error(
          `YAML parsing error: The file has formatting issues. ` +
          `Try using the "Paste Content" tab and fix any indentation problems, ` +
          `or download and validate the YAML file first.`
        );
      }
      
      throw new Error(`Unable to parse content. ${errorMsg}`);
    }
  }

  // Validate the parsed content has required OpenAPI structure
  if (!parsedContent || typeof parsedContent !== 'object') {
    throw new Error('Invalid OpenAPI/Swagger: Content must be an object');
  }

  if (!parsedContent.info || !parsedContent.info.title) {
    throw new Error('Invalid OpenAPI/Swagger: Missing required "info.title" field');
  }

  if (!parsedContent.paths || typeof parsedContent.paths !== 'object') {
    throw new Error('Invalid OpenAPI/Swagger: Missing or invalid "paths" field');
  }

  if (!parsedContent.openapi && !parsedContent.swagger) {
    throw new Error('Invalid OpenAPI/Swagger: Missing "openapi" or "swagger" version field');
  }

  return parsedContent as OpenAPISpec;
};

export const extractEndpoints = (spec: OpenAPISpec): OpenAPIEndpoint[] => {
  const endpoints: OpenAPIEndpoint[] = [];
  
  if (!spec.paths || typeof spec.paths !== 'object') {
    return endpoints;
  }
  
  try {
    Object.entries(spec.paths).forEach(([path, pathItem]) => {
      if (!pathItem || typeof pathItem !== 'object') {
        return;
      }
      
      ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'trace'].forEach((method) => {
        if (pathItem[method]) {
          const operation = pathItem[method];
          endpoints.push({
            id: `${method}-${path}`,
            path,
            method: method.toUpperCase(),
            summary: operation.summary || `${method.toUpperCase()} ${path}`,
            description: operation.description || '',
            operationId: operation.operationId,
            parameters: operation.parameters,
            requestBody: operation.requestBody,
            responses: operation.responses,
          });
        }
      });
    });
  } catch (error) {
    console.error('Error extracting endpoints:', error);
  }
  
  return endpoints;
};
