# Image Tools - Professional Image Processing Web App

A modern, full-stack Next.js application for professional image processing with compression, format conversion, and duplication. Built with Next.js 14 App Router, TypeScript, and Sharp for high-performance server-side image processing.

## 🎯 Key Features

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

# Google Analytics ID (optional)
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

### App Configuration

**next.config.mjs**:
- Standalone output for production deployment
- React strict mode enabled
- Optimized for Node.js runtime

**tailwind.config.ts**:
- Custom color schemes
- shadcn/ui integration
- Responsive breakpoints

## 🔧 Processing Pipeline

The application uses a modular pipeline approach for different image operations:

#### Image Compression
```
- Image validation and metadata extraction
- Quality preset handling (high/medium/low)
- Dimensions constraint enforcement
- Format optimization (JPEG, WebP, PNG)
- Smart resampling with Lanczos3 kernel
```

#### Format Conversion
```
- Parse source image format
- Convert to target format (PNG)
- Preserve transparency and quality
- Optimize output file size
```

#### Image Duplication
```
- Create multiple copies of source image
- Support for ZIP archive packing
- Batch processing of copies
```

### Performance Optimizations

- **Stream Processing**: Handle large files efficiently
- **Memory Management**: Streaming buffers for multi-file operations
- **Error Handling**: Detailed error messages and validation
- **Logging**: Processing metrics and performance tracking

### Technical Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Image Processing | Sharp (libvips) | Compression, conversion, optimization |
| API Layer | Next.js API Routes | HTTP endpoints, file handling |
| Client | React 18 + TypeScript | User interface, state management |
| Styling | Tailwind CSS + shadcn/ui | Modern UI components |

### Output Quality

- **Formats**: JPEG, PNG, WebP
- **Quality**: Configurable presets (high/medium/low)
- **Dimensions**: Customizable max width/height
- **File Size**: Optimized with Smart compression
- **Metadata**: Preserved when applicable

### Best Results Achieved With:
- Standard image formats (JPEG, PNG, WebP)
- Images under 50MB
- Standard dimensions (up to 8000x8000px)

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
- **Function Timeout**: Image processing typically completes in 1-3 seconds
  - Free tier: 10s timeout (sufficient)
  - Pro tier: 60s timeout (for very large images)
- **Memory**: 1024MB default (sufficient for most images)
- **Cold Starts**: Minimal impact with Sharp library

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
- 1GB+ RAM for image processing
- 100MB disk space

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
        
        # Timeout for image processing
        proxy_read_timeout 30s;
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
| **UI Components** | shadcn/ui, Radix UI, Lucide Icons, Framer Motion |
| **Image Processing** | Sharp (libvips) |
| **State Management** | React Hooks (useState, useMemo) |
| **Notifications** | Sonner (toast notifications) |
| **Testing** | Vitest, @testing-library/react |
| **Build Tools** | pnpm, ESBuild, Turbopack |
| **Deployment** | Vercel, Railway, Node.js |

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
| **API Endpoints** | 24 | All 3 endpoints |
| compress.test.ts | 7 | Quality presets, dimensions, formats |
| convert-to-png.test.ts | 7 | Format conversion, transparency |
| duplicate.test.ts | 10 | Duplicates, ZIP, limits |
| **Library Functions** | 16 | All utilities |
| formData.test.ts | 16 | Parsing, validation |
| **Core Processing** | 27 | Main logic |
| imageProcessor.test.ts | 27 | Compression, conversion, duplication |
| **Total** | **67** | **100% pass rate** |

### Test Features

✅ **Comprehensive** - All server API logic tested  
✅ **Fast** - Completes in ~1 second  
✅ **Reliable** - 100% pass rate (67/67 tests)  
✅ **CI/CD Ready** - Automated testing support  
✅ **Well-Documented** - See [TESTING.md](TESTING.md) and [TEST-SUMMARY.md](TEST-SUMMARY.md)

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
- `sharp@0.33.5` - High-performance image processing
- `jszip@3.10.1` - ZIP file generation

**UI:**
- `tailwindcss@3.4.13` - Utility-first CSS
- `@radix-ui/*` - Accessible UI primitives
- `lucide-react@0.487.0` - Icon library
- `sonner@2.0.3` - Toast notifications
- `motion` - Framer Motion for animations

**Dev:**
- `typescript@5.6.3` - Type safety
- `vitest@2.1.3` - Testing framework
- `@vitest/coverage-v8@2.1.9` - Coverage reporting

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built with ❤️ using Next.js, Sharp, and modern web technologies**
  