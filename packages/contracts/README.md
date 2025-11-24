# API Contracts

This package contains the **Protocol Buffer (.proto) schema definitions** that define the API contract between clients and servers.

## What is this?

The `.proto` files in this package are the **single source of truth** for:
- API method signatures
- Request/response message types
- Data structures

Both the **server** (packages/api) and **clients** (packages/cli, future web/mobile apps) use these same contracts to ensure type safety and compatibility.

## Files

- **[proto/chat.proto](proto/chat.proto)** - RAG chatbot service contract
  - `ChatService.AskQuestion` - Ask a question, get answer with sources
  - `ChatService.AddDocuments` - Upload documents to index
  - `ChatService.HealthCheck` - Check server status

## Usage

### In Server (packages/api)
```typescript
import { join } from 'path';

const PROTO_PATH = join(
  process.cwd(),
  'node_modules/@onboarding/contracts/proto/chat.proto'
);
```

### In Client (packages/cli)
```typescript
import { join } from 'path';

const PROTO_PATH = join(
  process.cwd(),
  'node_modules/@onboarding/contracts/proto/chat.proto'
);
```

## Versioning

When the contract changes:
1. Update the `.proto` file
2. Bump version in `package.json` (semver):
   - **Patch (1.0.x)**: Documentation, comments
   - **Minor (1.x.0)**: Backward-compatible additions (new optional fields)
   - **Major (x.0.0)**: Breaking changes (remove/rename fields)
3. Clients update dependency when ready

## Why a Separate Package?

✅ **Clear separation**: Interface (contract) vs implementation (server/client)
✅ **Reusability**: Multiple clients can use the same contract
✅ **Versioning**: Track API changes explicitly
✅ **Industry standard**: How companies like Google structure gRPC APIs

## Learn More

See [GRPC_VS_REST.md](../../GRPC_VS_REST.md) for understanding gRPC contracts.
