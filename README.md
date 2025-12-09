# Image Tools - Professional Image Processing Web App

A modern, full-stack Next.js application for professional image processing with **AI-powered background removal**, compression, format conversion, and more. Built with Next.js 14 App Router, TypeScript, and Sharp for high-performance server-side image processing.

## 🎯 Key Features

### 🤖 AI Background Removal
- **Local AI Processing**: Powered by [@imgly/background-removal-node](https://github.com/imgly/background-removal-js) with ONNX runtime
- **No External APIs**: All processing happens on your server - privacy-friendly and cost-effective
- **Advanced Post-Processing**: Multi-stage refinement pipeline for professional results:
  - Image normalization and contrast enhancement
  - AI-powered foreground/background segmentation
  - Alpha channel threshold filtering to remove artifacts
  - Edge smoothing and blur for natural transitions
  - Maximum quality PNG output with transparency
- **Smart Edge Detection**: Handles complex subjects like hair, fur, and fine details
- **Optimized Performance**: Concurrent processing limits to prevent server overload

### 🗜️ Smart Image Compression
- **Quality Presets**: High (90%), Medium (80%), Low (65%)
- **Custom Parameters**: Fine-tune quality, max width, max height
- **Format Support**: JPEG, PNG, WebP, AVIF, HEIC, HEIF
- **Intelligent Optimization**: 
  - mozjpeg compression for JPEG
  - Adaptive filtering for PNG
  - Automatic EXIF rotation handling
  - Fast shrink-on-load for performance

### 🔄 Format Conversion
- Convert to PNG with full alpha channel preservation
- Maintains original quality during conversion
- Supports all common image formats as input

### 📋 Image Duplication
- Generate multiple copies of images
- Optional ZIP download for batch processing
- Configurable duplicate count

### 🎨 Modern UI/UX
- **Drag & Drop Upload**: Intuitive file handling
- **Real-time Preview**: See your images before processing
- **Scan-Style Loading**: Animated overlay during processing
- **Auto-Download**: Configurable automatic download after processing
- **Responsive Design**: Works on desktop and mobile
- **Toast Notifications**: Clear feedback with Sonner
- **Progress Tracking**: Visual indicators for all operations

## 🚀 Quick Start

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit **http://localhost:3000/tools** or **http://localhost:3000/generator**

### Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

## 📁 Project Structure

```
img-compression/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (Server-side)
│   │   └── images/
│   │       ├── compress/         # Image compression endpoint
│   │       ├── convert-to-png/   # Format conversion endpoint
│   │       ├── remove-background/# AI background removal endpoint
│   │       └── duplicate/        # Image duplication endpoint
│   ├── generator/                # Main image processing page
│   │   └── page.tsx             # Client-side React component
│   ├── tools/                    # Alias for /generator
│   ├── layout.tsx               # Root layout with metadata
│   └── globals.css              # Global styles (Tailwind)
├── components/                   # Reusable React Components
│   ├── FileListBar.tsx          # File upload preview list
│   ├── GenerateButton.tsx       # Processing trigger button
│   ├── LoadingScreen.tsx        # Loading state overlay
│   ├── ScanOverlay.tsx          # Animated scan effect
│   ├── UploadArea.tsx           # Drag & drop upload zone
│   ├── Footer.tsx               # Footer component
│   └── ui/                      # shadcn/ui components
├── lib/                         # Core Processing Logic
│   ├── imageProcessor.ts        # Sharp-based image operations
│   ├── removeBackground.ts      # AI background removal engine
│   ├── formData.ts             # FormData parsing utilities
│   └── utils.ts                # Helper functions
├── types/                       # TypeScript Definitions
│   ├── images.ts               # Image processing types
│   └── uploads.ts              # Upload-related types
├── tests/                       # Unit Tests
│   └── imageProcessor.test.ts  # Image processing tests
└── public/                      # Static assets

```

## ⚙️ Configuration

### Environment Variables

Copy `env.example` to `.env.local`:

```bash
# Auto-download feature (true/false)
NEXT_PUBLIC_AUTO_DOWNLOAD_DEFAULT="true"

# Optional: Custom model cache path for @imgly/background-removal
# PUBLIC_PATH="/custom/model/path"
```

### App Configuration

**next.config.mjs**:
- External packages: `sharp`, `onnxruntime-node`, `@imgly/background-removal-node`
- Webpack externals configured for native bindings
- Optimized for Node.js runtime

**tailwind.config.ts**:
- Custom color schemes
- shadcn/ui integration
- Responsive breakpoints

## 🤖 AI Background Removal - Technical Details

### Architecture

**100% Local Processing** - No external APIs, complete privacy, no recurring costs.

The background removal system uses a multi-stage pipeline for professional results:

```
Input Image → Preprocessing → AI Segmentation → Post-processing → Output PNG
```

### Processing Pipeline

#### 1. **Preprocessing Stage** (`lib/removeBackground.ts`)
```typescript
- Image validation and metadata extraction
- Contrast normalization (enhance edge detection)
- High-quality resampling (Lanczos3 kernel)
- Format conversion to optimal input for AI model
```

#### 2. **AI Segmentation** ([@imgly/background-removal-node](https://github.com/imgly/background-removal-js))
```typescript
- Model: "medium" (80MB) - Best balance of quality & speed
- ONNX Runtime: Hardware-accelerated inference
- Output: PNG with alpha channel (transparency mask)
- Automatic model download & caching on first use
```

#### 3. **Post-processing Stage** (Sharp)
```typescript
- Extract alpha channel from AI output
- Apply linear transformation: amplify contrast, remove weak pixels
  → linear(1.2, -25): Multiply alpha by 1.2, subtract 25
- Threshold filtering: Remove semi-transparent artifacts (< 15 opacity)
- Edge smoothing: Gaussian blur (0.5px) for natural transitions
- Rebuild RGBA: Combine clean RGB + refined alpha channel
- PNG optimization: Quality 100, compression level 9
```

### Performance Optimizations

- **Concurrency Control**: Max 2 simultaneous removals to prevent memory overflow
- **Progressive Processing**: Streams and buffers for memory efficiency
- **Error Handling**: Custom BGError class with detailed error messages
- **Logging**: Detailed processing metrics (size, dimensions, timing)

### Technical Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| AI Model | ONNX (U²-Net architecture) | Semantic segmentation |
| Runtime | @imgly/background-removal-node | Model inference engine |
| Image Processing | Sharp (libvips) | Pre/post-processing, optimization |
| API Layer | Next.js API Routes | HTTP endpoints, file handling |
| Client | React 18 + TypeScript | User interface, state management |

### Output Quality

- **Format**: PNG with 32-bit RGBA (full color + transparency)
- **Quality**: Maximum (100%) - no compression artifacts
- **Edges**: Smooth anti-aliased transitions
- **Transparency**: Clean alpha channel, no semi-transparent artifacts
- **File Size**: Optimized with compression level 9 (no quality loss)

### Best Results Achieved With:
- Clear subject-background distinction
- Good lighting and contrast
- Subjects: People, products, objects, animals
- Complex edges: Hair, fur, transparent objects handled well
- Backgrounds: Any color or pattern (AI-based segmentation)

## 🔌 API Endpoints

### POST `/api/images/compress`
Compress and resize images with quality control.

**Request:**
```typescript
FormData {
  file: File (required) - Image file
  preset?: 'high' | 'medium' | 'low' - Quality preset
  quality?: number (1-100) - Custom quality
  maxWidth?: number - Maximum width in pixels
  maxHeight?: number - Maximum height in pixels
  format?: 'jpeg' | 'webp' | 'png' - Output format
}
```

**Response:**
```typescript
{
  results: [{
    name: string,
    mime: string,
    size: number,
    base64: string
  }]
}
```

### POST `/api/images/convert-to-png`
Convert any image format to PNG with alpha preservation.

**Request:**
```typescript
FormData {
  file: File (required)
}
```

**Response:** Same as compress endpoint

### POST `/api/images/remove-background`
AI-powered background removal with transparent output.

**Request:**
```typescript
FormData {
  file: File (required) - PNG, JPG, JPEG, or WebP
}
```

**Response:** Binary PNG file (image/png)
- Headers: `Content-Disposition: attachment; filename=removed-bg.png`
- Direct file download, not JSON

### POST `/api/images/duplicate`
Create multiple copies of an image.

**Request:**
```typescript
FormData {
  file: File (required)
  count: number - Number of duplicates
}

Query params: ?zip=true (optional) - Return as ZIP archive
```

**Response:** JSON (default) or ZIP file

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
pnpm test

# Watch mode for development
pnpm test:watch

# Coverage report
pnpm test:coverage
```

**Test Coverage:**
- Image compression with various quality settings
- Format conversion (JPEG, PNG, WebP, AVIF)
- Image duplication with different counts
- Buffer to base64 conversion
- Error handling and edge cases

## 🚀 Deployment

### Vercel (Serverless)

**Pros:**
- One-click deployment from GitHub
- Automatic HTTPS and CDN
- Zero configuration for Next.js

**Configuration:**
```bash
# Runtime already set in API routes
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
```

**Considerations:**
- **Function Timeout**: Background removal can take 2-5 seconds
  - Free tier: 10s timeout (usually sufficient)
  - Pro tier: 60s timeout (recommended for heavy use)
- **Memory**: 1024MB default (sufficient for most images)
- **Cold Starts**: First request downloads AI model (~80MB)
  - Model cached for subsequent requests
  - Consider Vercel Pro for faster cold starts

**Environment Variables** (Vercel Dashboard):
```
NEXT_PUBLIC_AUTO_DOWNLOAD_DEFAULT=true
```

### Self-Hosted / VPS

**Recommended for production** with heavy image processing.

**Advantages:**
- No timeout limitations
- Persistent model caching (faster)
- Full control over resources
- Better for high-volume processing

**Requirements:**
- Node.js 18+ (LTS recommended)
- 2GB+ RAM for AI processing
- 500MB disk space (model cache)

**Deployment:**
```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Or use PM2 for process management
pm2 start pnpm --name "image-tools" -- start
```

**Nginx Configuration** (reverse proxy):
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    client_max_body_size 20M; # Increase for larger images

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeout for background removal
        proxy_read_timeout 60s;
    }
}
```

## 🔒 Security

### File Upload Security
- **Size Limits**: 15MB default (configurable per route)
- **MIME Type Validation**: Only image/* allowed
- **Format Validation**: Sharp validates image integrity
- **Malware Protection**: Images are processed and re-encoded
- **Memory Limits**: Controlled by Sharp and ONNX runtime

### Privacy
- **No External APIs**: All processing happens on your server
- **No Data Storage**: Files processed in memory, not saved
- **No Tracking**: No analytics or third-party scripts
- **No API Keys Required**: Completely self-contained

### Best Practices
```typescript
// Recommended route configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Vercel timeout

// File size validation
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
if (file.size > MAX_FILE_SIZE) {
  throw new Error('File too large');
}
```

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 14, React 18, TypeScript, TailwindCSS |
| **UI Components** | shadcn/ui, Radix UI, Lucide Icons |
| **Image Processing** | Sharp (libvips), @imgly/background-removal-node |
| **AI/ML** | ONNX Runtime, U²-Net model |
| **State Management** | React Hooks (useState, useMemo) |
| **Notifications** | Sonner (toast notifications) |
| **Testing** | Vitest, @testing-library/react |
| **Build Tools** | pnpm, ESBuild, Turbopack |
| **Deployment** | Railway, Node.js|

## 🧪 Testing

Comprehensive test suite with **81 tests** covering all API endpoints and core logic.

### Quick Test Commands

```bash
# Run all tests
pnpm test

# Watch mode (auto-rerun on changes)
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Open test UI
pnpm test:ui
```

### Test Coverage

| Test File | Tests | Coverage |
|-----------|-------|----------|
| **API Endpoints** | 24 | All 4 endpoints |
| compress.test.ts | 7 | Quality presets, dimensions, formats |
| convert-to-png.test.ts | 7 | Format conversion, transparency |
| duplicate.test.ts | 10 | Duplicates, ZIP, limits |
| **Library Functions** | 30 | All utilities |
| formData.test.ts | 16 | Parsing, validation |
| removeBackground.test.ts | 14 | AI processing, errors |
| **Core Processing** | 27 | Main logic |
| imageProcessor.test.ts | 27 | Compression, conversion, duplication |
| **Total** | **81** | **100% pass rate** |

### Test Features

✅ **Comprehensive** - All server API logic tested  
✅ **Fast** - Completes in ~1.3 seconds  
✅ **Reliable** - 100% pass rate (81/81 tests)  
✅ **CI/CD Ready** - Automated testing support  
✅ **Well-Documented** - See [TESTING.md](TESTING.md) and [TEST-SUMMARY.md](TEST-SUMMARY.md)


**Features:**
- Multi-stage optimized build
- Multi-platform support (amd64, arm64)
- Health checks built-in
- Nginx reverse proxy included
- Resource limits configured

### CI/CD Pipeline

Automated workflows with GitHub Actions:

- ✅ **Continuous Integration** - Automated testing on push/PR
- ✅ **Multi-platform Testing** - Ubuntu, Windows, macOS
- ✅ **Vercel Deployment** - Auto-deploy to production
- ✅ **Coverage Reports** - Codecov integration

**Workflows:**
- `ci.yml` - Main CI/CD pipeline (test, build, deploy)
- `test.yml` - Cross-platform test suite

📖 **Full Guide:** [.github/CI-CD.md](.github/CI-CD.md) | [.github/DEPLOYMENT.md](.github/DEPLOYMENT.md)

## 📦 Dependencies

**Core:**
- `next@14.2.15` - React framework
- `react@18.3.1` - UI library
- `sharp@0.32.6` - High-performance image processing
- `@imgly/background-removal-node@1.4.5` - AI background removal
- `onnxruntime-node@1.17.3` - ONNX model inference

**UI:**
- `tailwindcss@3.4.17` - Utility-first CSS
- `@radix-ui/*` - Accessible UI primitives
- `lucide-react@0.469.0` - Icon library
- `sonner@2.0.7` - Toast notifications

**Dev:**
- `typescript@5.7.2` - Type safety
- `vitest@2.1.8` - Testing framework
- `@testing-library/react@16.1.0` - Component testing

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built with ❤️ using Next.js, Sharp, and AI-powered image processing**
  