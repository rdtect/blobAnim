# Blob Animation Demo Hub

This is a central hub for all blob animation demos in the monorepo. It provides a convenient way to browse and view all the demos from different packages.

## Features

- Dynamic loading of demos from all packages
- Iframe-based preview of demos
- Server-side support for cross-origin requests
- Responsive design for all screen sizes

## Getting Started

### Using the Vite Development Server

```bash
# Navigate to the demo hub directory
cd apps/demo

# Install dependencies (if not already installed at the root level)
npm install

# Start the Vite development server
npm run dev
```

This will start a Vite development server that builds the packages on-demand.

### Using the Simple HTTP Server

```bash
# Navigate to the demo hub directory
cd apps/demo

# Start the simple HTTP server
npm run server
```

This will start a simple HTTP server that serves the demos from their respective locations without building them.

## How It Works

The demo hub uses a combination of:

1. **Dynamic Demo Loading**: JavaScript code that dynamically loads the list of available demos
2. **Iframe-based Preview**: Demos are loaded in an iframe for isolated viewing
3. **Server-side Support**: A simple HTTP server that handles cross-origin requests

## Adding New Demos

When you add a new demo to any package, it will automatically appear in the demo hub the next time you start the server. The demo hub scans the packages directory for demos and displays them in the UI.

## Troubleshooting

If a demo doesn't load correctly in the iframe:

1. Check the browser console for errors
2. Try opening the demo directly in a new tab
3. Make sure the demo's HTML file is properly formatted and includes all necessary resources
