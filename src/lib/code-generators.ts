import { OpenAPIEndpoint, OpenAPISpec } from './openapi-parser';

export type Technology = 
  | 'python-mcp' 
  | 'typescript-mcp'
  | 'java-mcp'
  | 'kotlin-mcp'
  | 'csharp-mcp'
  | 'go-mcp'
  | 'php-mcp'
  | 'ruby-mcp'
  | 'rust-mcp'
  | 'swift-mcp';

const generatePythonMCP = (spec: OpenAPISpec, endpoints: OpenAPIEndpoint[]): Record<string, string> => {
  const serverPy = `#!/usr/bin/env python3
"""
${spec.info.title} MCP Server
${spec.info.description || ''}

This is a Model Context Protocol (MCP) server that exposes API endpoints as tools for LLMs.
"""

import asyncio
import httpx
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
from typing import Any

# Base URL for the API
BASE_URL = "${spec.servers?.[0]?.url || 'https://api.example.com'}"

# Create MCP server instance
server = Server("${spec.info.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}")

# HTTP client for making API requests
http_client = httpx.AsyncClient(timeout=30.0)

@server.list_tools()
async def list_tools() -> list[Tool]:
    """List all available API tools."""
    return [
${endpoints.map(endpoint => {
    const toolName = endpoint.operationId || `${endpoint.method.toLowerCase()}_${endpoint.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const params = endpoint.parameters?.map(p => `            "${p.name}": {
                "type": "${p.schema?.type || 'string'}",
                "description": "${p.description || p.name}",
                "required": ${p.required || false}
            }`).join(',\n') || '';
    
    return `        Tool(
            name="${toolName}",
            description="${endpoint.summary || endpoint.description || `${endpoint.method} ${endpoint.path}`}",
            inputSchema={
                "type": "object",
                "properties": {
${params || '                    "body": {"type": "object", "description": "Request body"}'}
                }
            }
        )`;
}).join(',\n')}
    ]

@server.call_tool()
async def call_tool(name: str, arguments: Any) -> list[TextContent]:
    """Execute an API tool."""
    
${endpoints.map(endpoint => {
    const toolName = endpoint.operationId || `${endpoint.method.toLowerCase()}_${endpoint.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const path = endpoint.path.replace(/\{([^}]+)\}/g, (_, p) => `{arguments.get('${p}', '')}`);
    
    return `    if name == "${toolName}":
        # ${endpoint.summary || endpoint.description || 'API call'}
        try:
            url = f"{BASE_URL}${path}"
            response = await http_client.request(
                method="${endpoint.method.toUpperCase()}",
                url=url,
                json=arguments.get("body", {}),
                params={k: v for k, v in arguments.items() if k not in ["body"] and v is not None}
            )
            response.raise_for_status()
            return [TextContent(type="text", text=str(response.json()))]
        except Exception as e:
            return [TextContent(type="text", text=f"Error: {str(e)}")]
`;
}).join('\n    el')}
    else:
        return [TextContent(type="text", text=f"Unknown tool: {name}")]

async def main():
    """Run the MCP server."""
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())

if __name__ == "__main__":
    asyncio.run(main())
`;

  const requirementsTxt = `mcp>=0.9.0
httpx>=0.26.0
`;

  const readme = `# ${spec.info.title} MCP Server

${spec.info.description || ''}

This is a **Model Context Protocol (MCP) server** that exposes the API as tools that can be used by Large Language Models (LLMs) like Claude, GPT-4, and others.

## What is MCP?

The Model Context Protocol (MCP) is an open protocol that enables AI applications to securely access external tools and data sources. This server implements MCP to make the ${spec.info.title} API available to LLMs.

## Installation

\`\`\`bash
pip install -r requirements.txt
\`\`\`

## Usage

### With Claude Desktop

Add to your \`claude_desktop_config.json\`:

\`\`\`json
{
  "mcpServers": {
    "${spec.info.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}": {
      "command": "python",
      "args": ["/absolute/path/to/server.py"]
    }
  }
}
\`\`\`

Replace \`/absolute/path/to/\` with the actual path where you extracted this server.

### Testing the Server

Run directly:

\`\`\`bash
python server.py
\`\`\`

The server communicates via stdin/stdout using the MCP protocol.

## Available Tools

This server exposes the following API endpoints as tools:

${endpoints.map(e => `- **${e.operationId || e.method + ' ' + e.path}**: ${e.summary || e.description || 'API endpoint'}`).join('\n')}

## Configuration

Edit \`server.py\` to configure:
- \`BASE_URL\`: The base URL of the API (currently: ${spec.servers?.[0]?.url || 'https://api.example.com'})
- Timeout and other HTTP client settings

## Learn More

- [MCP Documentation](https://modelcontextprotocol.io)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
`;

  return {
    'server.py': serverPy,
    'requirements.txt': requirementsTxt,
    'README.md': readme,
  };
};

const generateTypeScriptMCP = (spec: OpenAPISpec, endpoints: OpenAPIEndpoint[]): Record<string, string> => {
  const serverJs = `#!/usr/bin/env node
/**
 * ${spec.info.title} MCP Server
 * ${spec.info.description || ''}
 * 
 * This is a Model Context Protocol (MCP) server that exposes API endpoints as tools for LLMs.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

const BASE_URL = "${spec.servers?.[0]?.url || 'https://api.example.com'}";

// Create MCP server
const server = new Server(
  {
    name: "${spec.info.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}",
    version: "${spec.info.version}",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
const tools${': Tool[]'} = [
${endpoints.map(endpoint => {
    const toolName = endpoint.operationId || `${endpoint.method.toLowerCase()}_${endpoint.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const params = endpoint.parameters?.map(p => `      ${p.name}: {
        type: "${p.schema?.type || 'string'}",
        description: "${p.description || p.name}",
      }`).join(',\n') || '';
    
    return `  {
    name: "${toolName}",
    description: "${endpoint.summary || endpoint.description || `${endpoint.method} ${endpoint.path}`}",
    inputSchema: {
      type: "object",
      properties: {
${params || '        body: { type: "object", description: "Request body" }'}
      },
    },
  }`;
}).join(',\n')}
];

// Handle list_tools request
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

// Handle call_tool request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

${endpoints.map(endpoint => {
    const toolName = endpoint.operationId || `${endpoint.method.toLowerCase()}_${endpoint.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const pathWithParams = endpoint.path.replace(/\{([^}]+)\}/g, (_, p) => `\$\{args.${p} || ''\}`);
    
    return `  if (name === "${toolName}") {
    try {
      const url = \`\$\{BASE_URL\}${pathWithParams}\`;
      const response = await axios({
        method: "${endpoint.method.toLowerCase()}",
        url,
        data: args.body,
        params: Object.fromEntries(
          Object.entries(args).filter(([k]) => k !== "body")
        ),
      });
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: \`Error: \$\{error.message\}\`,
          },
        ],
        isError: true,
      };
    }
  }
`;
}).join('\n  ')}
  
  throw new Error(\`Unknown tool: \${name}\`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("${spec.info.title} MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
`;

  const packageJson = `{
  "name": "${spec.info.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-mcp-server",
  "version": "${spec.info.version}",
  "description": "${spec.info.description || ''}",
  "type": "module",
  "main": "server.js",
  "bin": {
    "${spec.info.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-mcp": "./server.js"
  },
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "axios": "^1.6.5"
  }
}
`;

  const readme = `# ${spec.info.title} MCP Server

${spec.info.description || ''}

This is a **Model Context Protocol (MCP) server** that exposes the API as tools that can be used by Large Language Models (LLMs) like Claude, GPT-4, and others.

## What is MCP?

The Model Context Protocol (MCP) is an open protocol that enables AI applications to securely access external tools and data sources. This server implements MCP to make the ${spec.info.title} API available to LLMs.

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage
### With Claude Desktop

Add to your \`claude_desktop_config.json\`:

\`\`\`json
{
  "mcpServers": {
    "${spec.info.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}": {
      "command": "node",
      "args": ["/absolute/path/to/server.js"]
    }
  }
}
\`\`\`

Replace \`/absolute/path/to/\` with the actual path where you extracted this server.

### Testing the Server

Run directly:

\`\`\`bash
npm start
\`\`\`

The server communicates via stdin/stdout using the MCP protocol.

## Available Tools

This server exposes the following API endpoints as tools:

${endpoints.map(e => `- **${e.operationId || e.method + ' ' + e.path}**: ${e.summary || e.description || 'API endpoint'}`).join('\n')}

## Configuration

Edit \`server.js\` to configure:
- \`BASE_URL\`: The base URL of the API (currently: ${spec.servers?.[0]?.url || 'https://api.example.com'})

## Learn More

- [MCP Documentation](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
`;

  return {
    'server.js': serverJs,
    'package.json': packageJson,
    'README.md': readme,
  };
};

const generateGoMCP = (spec: OpenAPISpec, endpoints: OpenAPIEndpoint[]): Record<string, string> => {
  const serverGo = `package main

import (
\t"context"
\t"encoding/json"
\t"fmt"
\t"io"
\t"log"
\t"net/http"

\tmcp "github.com/modelcontextprotocol/go-sdk/server"
)

const BASE_URL = "${spec.servers?.[0]?.url || 'https://api.example.com'}"

func main() {
\tserver := mcp.NewServer()

\t// Register all available tools
${endpoints.map(endpoint => {
    const toolName = endpoint.operationId || `${endpoint.method.toLowerCase()}_${endpoint.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
    return `\tserver.AddTool("${toolName}", "${endpoint.summary || endpoint.description || `${endpoint.method} ${endpoint.path}`}", func(args map[string]interface{}) (string, error) {
\t\t// ${endpoint.method} ${endpoint.path}
\t\tclient := &http.Client{}
\t\treq, err := http.NewRequest("${endpoint.method}", BASE_URL+"${endpoint.path}", nil)
\t\tif err != nil {
\t\t\treturn "", err
\t\t}
\t\tresp, err := client.Do(req)
\t\tif err != nil {
\t\t\treturn "", err
\t\t}
\t\tdefer resp.Body.Close()
\t\tbody, _ := io.ReadAll(resp.Body)
\t\treturn string(body), nil
\t})`;
}).join('\n\n')}

\tlog.Fatal(server.ServeStdio())
}
`;

  return {
    'server.go': serverGo,
    'go.mod': `module mcp-server\n\ngo 1.21\n\nrequire github.com/modelcontextprotocol/go-sdk v0.1.0`,
    'README.md': `# ${spec.info.title} MCP Server (Go)\n\n${spec.info.description || ''}\n\nOfficial Go SDK implementation.\n\n## Installation\n\`\`\`bash\ngo mod download\n\`\`\`\n\n## Run\n\`\`\`bash\ngo run server.go\n\`\`\`\n\n[Go SDK Repository](https://github.com/modelcontextprotocol/go-sdk)`,
  };
};

const generateRustMCP = (spec: OpenAPISpec, endpoints: OpenAPIEndpoint[]): Record<string, string> => {
  const serverRs = `use mcp_sdk::Server;
use serde_json::json;

const BASE_URL: &str = "${spec.servers?.[0]?.url || 'https://api.example.com'}";

#[tokio::main]
async fn main() {
    let server = Server::new("${spec.info.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}");

${endpoints.map(endpoint => {
    const toolName = endpoint.operationId || `${endpoint.method.toLowerCase()}_${endpoint.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
    return `    server.add_tool("${toolName}", "${endpoint.summary || endpoint.description || ''}", |args| async move {
        // ${endpoint.method} ${endpoint.path}
        let client = reqwest::Client::new();
        let response = client.request(reqwest::Method::${endpoint.method.toUpperCase()}, format!("{}{}", BASE_URL, "${endpoint.path}"))
            .send()
            .await?;
        Ok(response.text().await?)
    });`;
}).join('\n\n')}

    server.run().await.unwrap();
}
`;

  return {
    'src/main.rs': serverRs,
    'Cargo.toml': `[package]\nname = "mcp-server"\nversion = "0.1.0"\nedition = "2021"\n\n[dependencies]\nmcp-sdk = "0.1"\ntokio = { version = "1", features = ["full"] }\nreqwest = { version = "0.11", features = ["json"] }\nserde_json = "1.0"`,
    'README.md': `# ${spec.info.title} MCP Server (Rust)\n\n${spec.info.description || ''}\n\nOfficial Rust SDK implementation.\n\n## Installation\n\`\`\`bash\ncargo build\n\`\`\`\n\n## Run\n\`\`\`bash\ncargo run\n\`\`\`\n\n[Rust SDK Repository](https://github.com/modelcontextprotocol/rust-sdk)`,
  };
};

const generateJavaMCP = (spec: OpenAPISpec, endpoints: OpenAPIEndpoint[]): Record<string, string> => {
  const serverJava = `package com.example.mcpserver;

import io.modelcontextprotocol.sdk.Server;
import io.modelcontextprotocol.sdk.Tool;
import java.net.http.*;
import java.net.URI;

public class MCPServer {
    private static final String BASE_URL = "${spec.servers?.[0]?.url || 'https://api.example.com'}";

    public static void main(String[] args) {
        Server server = new Server("${spec.info.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}");
        HttpClient client = HttpClient.newHttpClient();

${endpoints.map(endpoint => {
    const toolName = endpoint.operationId || `${endpoint.method.toLowerCase()}${endpoint.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
    return `        server.addTool(new Tool("${toolName}", "${endpoint.summary || endpoint.description || ''}", args -> {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "${endpoint.path}"))
                .method("${endpoint.method}", HttpRequest.BodyPublishers.noBody())
                .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            return response.body();
        }));`;
}).join('\n\n')}

        server.run();
    }
}
`;

  return {
    'src/main/java/com/example/mcpserver/MCPServer.java': serverJava,
    'pom.xml': `<?xml version="1.0" encoding="UTF-8"?>\n<project>\n  <modelVersion>4.0.0</modelVersion>\n  <groupId>com.example</groupId>\n  <artifactId>mcp-server</artifactId>\n  <version>1.0.0</version>\n  <dependencies>\n    <dependency>\n      <groupId>io.modelcontextprotocol</groupId>\n      <artifactId>mcp-sdk</artifactId>\n      <version>0.1.0</version>\n    </dependency>\n  </dependencies>\n</project>`,
    'README.md': `# ${spec.info.title} MCP Server (Java)\n\n${spec.info.description || ''}\n\nOfficial Java SDK implementation.\n\n## Run\n\`\`\`bash\nmvn exec:java\n\`\`\`\n\n[Java SDK Repository](https://github.com/modelcontextprotocol/java-sdk)`,
  };
};

const generateKotlinMCP = (spec: OpenAPISpec, endpoints: OpenAPIEndpoint[]): Record<string, string> => {
  const serverKt = `package com.example.mcpserver

import io.modelcontextprotocol.sdk.server.Server
import io.ktor.client.*
import io.ktor.client.request.*
import io.ktor.client.statement.*

const val BASE_URL = "${spec.servers?.[0]?.url || 'https://api.example.com'}"

suspend fun main() {
    val server = Server("${spec.info.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}")
    val client = HttpClient()

${endpoints.map(endpoint => {
    const toolName = endpoint.operationId || `${endpoint.method.toLowerCase()}${endpoint.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
    return `    server.addTool("${toolName}", "${endpoint.summary || endpoint.description || ''}") { args ->
        val response: HttpResponse = client.request("$BASE_URL${endpoint.path}") {
            method = HttpMethod.${endpoint.method.charAt(0) + endpoint.method.slice(1).toLowerCase()}
        }
        response.bodyAsText()
    }`;
}).join('\n\n')}

    server.run()
}
`;

  return {
    'src/main/kotlin/MCPServer.kt': serverKt,
    'build.gradle.kts': `plugins {\n    kotlin("jvm") version "1.9.0"\n    application\n}\n\nrepositories {\n    mavenCentral()\n}\n\ndependencies {\n    implementation("io.modelcontextprotocol:kotlin-sdk:0.1.0")\n    implementation("io.ktor:ktor-client-core:2.3.0")\n}\n\napplication {\n    mainClass.set("com.example.mcpserver.MCPServerKt")\n}`,
    'README.md': `# ${spec.info.title} MCP Server (Kotlin)\n\n${spec.info.description || ''}\n\nOfficial Kotlin SDK implementation.\n\n## Run\n\`\`\`bash\n./gradlew run\n\`\`\`\n\n[Kotlin SDK Repository](https://github.com/modelcontextprotocol/kotlin-sdk)`,
  };
};

const generateCSharpMCP = (spec: OpenAPISpec, endpoints: OpenAPIEndpoint[]): Record<string, string> => {
  const serverCs = `using ModelContextProtocol.SDK;
using System.Net.Http;

const string BASE_URL = "${spec.servers?.[0]?.url || 'https://api.example.com'}";

var server = new Server("${spec.info.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}");
var client = new HttpClient();

${endpoints.map(endpoint => {
    const toolName = endpoint.operationId || `${endpoint.method.toLowerCase()}${endpoint.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
    return `server.AddTool("${toolName}", "${endpoint.summary || endpoint.description || ''}", async (args) => 
{
    var request = new HttpRequestMessage(HttpMethod.${endpoint.method.charAt(0) + endpoint.method.slice(1).toLowerCase()}, BASE_URL + "${endpoint.path}");
    var response = await client.SendAsync(request);
    return await response.Content.ReadAsStringAsync();
});`;
}).join('\n\n')}

await server.RunAsync();
`;

  return {
    'Program.cs': serverCs,
    'MCPServer.csproj': `<Project Sdk="Microsoft.NET.Sdk">\n  <PropertyGroup>\n    <OutputType>Exe</OutputType>\n    <TargetFramework>net8.0</TargetFramework>\n  </PropertyGroup>\n  <ItemGroup>\n    <PackageReference Include="ModelContextProtocol.SDK" Version="0.1.0" />\n  </ItemGroup>\n</Project>`,
    'README.md': `# ${spec.info.title} MCP Server (C#)\n\n${spec.info.description || ''}\n\nOfficial C# SDK implementation maintained with Microsoft.\n\n## Run\n\`\`\`bash\ndotnet run\n\`\`\`\n\n[C# SDK Repository](https://github.com/modelcontextprotocol/csharp-sdk)`,
  };
};

const generatePHPMCP = (spec: OpenAPISpec, endpoints: OpenAPIEndpoint[]): Record<string, string> => {
  const serverPhp = `<?php

require 'vendor/autoload.php';

use ModelContextProtocol\\SDK\\Server;
use GuzzleHttp\\Client;

const BASE_URL = '${spec.servers?.[0]?.url || 'https://api.example.com'}';

$server = new Server('${spec.info.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}');
$client = new Client();

${endpoints.map(endpoint => {
    const toolName = endpoint.operationId || `${endpoint.method.toLowerCase()}_${endpoint.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
    return `$server->addTool('${toolName}', '${endpoint.summary || endpoint.description || ''}', function($args) use ($client) {
    $response = $client->request('${endpoint.method}', BASE_URL . '${endpoint.path}');
    return $response->getBody()->getContents();
});`;
}).join('\n\n')}

$server->run();
`;

  return {
    'server.php': serverPhp,
    'composer.json': `{\n  "name": "${spec.info.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}/mcp-server",\n  "require": {\n    "modelcontextprotocol/php-sdk": "^0.1",\n    "guzzlehttp/guzzle": "^7.0"\n  }\n}`,
    'README.md': `# ${spec.info.title} MCP Server (PHP)\n\n${spec.info.description || ''}\n\nOfficial PHP SDK implementation maintained with The PHP Foundation.\n\n## Installation\n\`\`\`bash\ncomposer install\n\`\`\`\n\n## Run\n\`\`\`bash\nphp server.php\n\`\`\`\n\n[PHP SDK Repository](https://github.com/modelcontextprotocol/php-sdk)`,
  };
};

const generateRubyMCP = (spec: OpenAPISpec, endpoints: OpenAPIEndpoint[]): Record<string, string> => {
  const serverRb = `require 'mcp_sdk'
require 'net/http'
require 'json'

BASE_URL = '${spec.servers?.[0]?.url || 'https://api.example.com'}'

server = MCPServer.new('${spec.info.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}')

${endpoints.map(endpoint => {
    const toolName = endpoint.operationId || `${endpoint.method.toLowerCase()}_${endpoint.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
    return `server.add_tool('${toolName}', '${endpoint.summary || endpoint.description || ''}') do |args|
  uri = URI("#{BASE_URL}${endpoint.path}")
  response = Net::HTTP.${endpoint.method.toLowerCase().charAt(0).toUpperCase() + endpoint.method.slice(1).toLowerCase()}(uri)
  response.body
end`;
}).join('\n\n')}

server.run
`;

  return {
    'server.rb': serverRb,
    'Gemfile': `source 'https://rubygems.org'\n\ngem 'mcp_sdk', '~> 0.1'\ngem 'httparty', '~> 0.21'`,
    'README.md': `# ${spec.info.title} MCP Server (Ruby)\n\n${spec.info.description || ''}\n\nOfficial Ruby SDK implementation.\n\n## Installation\n\`\`\`bash\nbundle install\n\`\`\`\n\n## Run\n\`\`\`bash\nruby server.rb\n\`\`\`\n\n[Ruby SDK Repository](https://github.com/modelcontextprotocol/ruby-sdk)`,
  };
};

const generateSwiftMCP = (spec: OpenAPISpec, endpoints: OpenAPIEndpoint[]): Record<string, string> => {
  const serverSwift = `import MCPKit
import Foundation

let BASE_URL = "${spec.servers?.[0]?.url || 'https://api.example.com'}"

let server = Server(name: "${spec.info.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}")

${endpoints.map(endpoint => {
    const toolName = endpoint.operationId || `${endpoint.method.toLowerCase()}${endpoint.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
    return `server.addTool(name: "${toolName}", description: "${endpoint.summary || endpoint.description || ''}") { args in
    let url = URL(string: "\\(BASE_URL)${endpoint.path}")!
    var request = URLRequest(url: url)
    request.httpMethod = "${endpoint.method}"
    
    let (data, _) = try await URLSession.shared.data(for: request)
    return String(data: data, encoding: .utf8) ?? ""
}`;
}).join('\n\n')}

try await server.run()
`;

  return {
    'Sources/main.swift': serverSwift,
    'Package.swift': `// swift-tools-version: 5.9\nimport PackageDescription\n\nlet package = Package(\n    name: "MCPServer",\n    platforms: [.macOS(.v13)],\n    dependencies: [\n        .package(url: "https://github.com/modelcontextprotocol/swift-sdk.git", from: "0.1.0")\n    ],\n    targets: [\n        .executableTarget(\n            name: "MCPServer",\n            dependencies: [\n                .product(name: "MCPKit", package: "swift-sdk")\n            ]\n        )\n    ]\n)`,
    'README.md': `# ${spec.info.title} MCP Server (Swift)\n\n${spec.info.description || ''}\n\nOfficial Swift SDK implementation.\n\n## Run\n\`\`\`bash\nswift run\n\`\`\`\n\n[Swift SDK Repository](https://github.com/modelcontextprotocol/swift-sdk)`,
  };
};

export const generateMCPServer = (
  spec: OpenAPISpec,
  endpoints: OpenAPIEndpoint[],
  technology: Technology
): Record<string, string> => {
  switch (technology) {
    case 'python-mcp':
      return generatePythonMCP(spec, endpoints);
    case 'typescript-mcp':
      return generateTypeScriptMCP(spec, endpoints);
    case 'go-mcp':
      return generateGoMCP(spec, endpoints);
    case 'rust-mcp':
      return generateRustMCP(spec, endpoints);
    case 'java-mcp':
      return generateJavaMCP(spec, endpoints);
    case 'kotlin-mcp':
      return generateKotlinMCP(spec, endpoints);
    case 'csharp-mcp':
      return generateCSharpMCP(spec, endpoints);
    case 'php-mcp':
      return generatePHPMCP(spec, endpoints);
    case 'ruby-mcp':
      return generateRubyMCP(spec, endpoints);
    case 'swift-mcp':
      return generateSwiftMCP(spec, endpoints);
    default:
      throw new Error('Unsupported technology');
  }
};
