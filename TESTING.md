# Test Suite Documentation

This document provides an overview of the comprehensive test suite for the Image Processing API.

## Test Structure

```
tests/
├── api/                          # API endpoint tests
│   ├── compress.test.ts         # Image compression endpoint
│   ├── convert-to-png.test.ts   # PNG conversion endpoint
│   └── duplicate.test.ts        # Image duplication endpoint
├── lib/                          # Library function tests
│   └── formData.test.ts         # FormData parsing utilities
├── imageProcessor.test.ts        # Core image processing
└── setup.ts                      # Test environment setup

Total Test Files: 5
```

## Running Tests

### Quick Commands

```bash
# Run all tests once
pnpm test

# Run tests in watch mode (auto-rerun on changes)
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage

# Run tests with UI dashboard
pnpm test:ui
```

### Targeted Test Execution

```bash
# Run specific test file
pnpm vitest run tests/api/compress.test.ts

# Run tests matching a pattern
pnpm vitest run -t "compress"

# Run tests in a specific directory
pnpm vitest run tests/api/
```

## Test Coverage Overview

### API Endpoint Tests (3 files, ~90 test cases)

#### `compress.test.ts` - Image Compression API
- ✅ Default compression settings
- ✅ Quality preset handling (high, medium, low)
- ✅ Custom quality values
- ✅ Maximum dimension constraints (width/height)
- ✅ Format conversion (PNG, JPEG, WebP)
- ✅ Error handling (missing files)
- ✅ All preset variations

**Test Count:** ~12 tests

#### `convert-to-png.test.ts` - PNG Conversion API
- ✅ Basic PNG conversion
- ✅ JPEG to PNG conversion
- ✅ WebP to PNG conversion
- ✅ Transparency preservation
- ✅ File structure validation
- ✅ Filename handling (with/without extension)
- ✅ Error handling (missing files)

**Test Count:** ~10 tests

#### `duplicate.test.ts` - Image Duplication API
- ✅ Single and multiple duplicates
- ✅ Filename generation (copy-1, copy-2, etc.)
- ✅ ZIP archive creation (when enabled)
- ✅ MAX_DUPLICATES limit enforcement
- ✅ Property preservation (MIME, size)
- ✅ Filename without extension handling
- ✅ Error handling

**Test Count:** ~13 tests

### Library Function Tests (2 files, ~40 test cases)

#### `formData.test.ts` - FormData Parsing
- ✅ Valid image parsing from FormData
- ✅ Filename handling (with/without extension)
- ✅ MIME type preservation
- ✅ File size calculation
- ✅ Missing file error handling
- ✅ Number extraction from FormData
- ✅ Edge cases (zero, negative, decimal, whitespace)

**Test Count:** ~18 tests

### Core Image Processing Tests (~35 test cases)

#### `imageProcessor.test.ts` - Main Processing Functions
- ✅ Quality preset resolution (high, medium, low)
- ✅ Fallback quality handling
- ✅ Image compression with various options
- ✅ Resize constraints (maxWidth, maxHeight)
- ✅ Aspect ratio preservation
- ✅ Format conversion (PNG, JPEG, WebP)
- ✅ PNG conversion from various formats
- ✅ Dimension preservation
- ✅ Buffer to base64 conversion
- ✅ Image duplication with naming
- ✅ Zero and edge case handling

**Test Count:** ~35 tests

## Test Technologies

### Testing Framework
- **Vitest 2.1.8**: Fast Vite-native unit test framework
- **Node Environment**: Tests run in Node.js environment for server-side code

### Testing Libraries
- **Sharp**: Image processing validation and test image generation
- **Vitest Mocking**: Function and module mocking capabilities

### Coverage Tools
- **V8 Coverage Provider**: Native V8 code coverage
- **Reporters**: Text (console), JSON (data), HTML (visual report)

## Coverage Configuration

### Included Files
- All library code (`lib/**`)
- All API routes (`app/api/**`)
- Image processor logic

### Excluded Files
- `node_modules/`
- `tests/` directory
- Configuration files (`*.config.*`)
- Type definitions (`types/`)
- UI components (`components/ui/`)

## Best Practices

### Test Organization
1. **Describe blocks**: Group related tests logically
2. **Test naming**: Use descriptive names starting with "should"
3. **Arrange-Act-Assert**: Clear test structure
4. **Mock external dependencies**: Isolate units under test

### Example Test Structure

```typescript
describe('Feature Name', () => {
  it('should handle expected behavior', async () => {
    // Arrange - Set up test data
    const input = createTestData();
    
    // Act - Execute the function
    const result = await functionUnderTest(input);
    
    // Assert - Verify expectations
    expect(result).toBe(expectedValue);
  });
});
```

### Mock Strategy

```typescript
// Mock external APIs
vi.mock('@imgly/background-removal-node', () => ({
  removeBackground: vi.fn(async (blob: Blob) => {
    return new Blob([testPNG], { type: 'image/png' });
  }),
}));

// Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
```

## Writing New Tests

### For New API Endpoints

1. Create file: `tests/api/[endpoint-name].test.ts`
2. Import the POST handler from route file
3. Create FormData helper functions
4. Test success cases with various parameters
5. Test error cases (missing files, invalid params)
6. Test edge cases (boundaries, limits)

### For New Library Functions

1. Create file: `tests/lib/[module-name].test.ts`
2. Import functions from library
3. Use `sharp` to create test images
4. Test happy path scenarios
5. Test error handling
6. Test edge cases and boundaries

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run Tests
  run: pnpm test

- name: Generate Coverage
  run: pnpm test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

## Debugging Tests

### Enable Verbose Output

```bash
pnpm vitest run --reporter=verbose
```

### Run Single Test

```bash
pnpm vitest run -t "should compress image with default settings"
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest",
  "runtimeExecutable": "pnpm",
  "runtimeArgs": ["vitest", "run"],
  "console": "integratedTerminal"
}
```

## Expected Coverage Metrics

| Module | Target Coverage |
|--------|----------------|
| lib/imageProcessor.ts | 90%+ |
| lib/formData.ts | 95%+ |
| app/api/** | 80%+ |
| Overall | 85%+ |

## Test Maintenance

### Regular Tasks
1. ✅ Run tests before each commit
2. ✅ Update tests when API changes
3. ✅ Add tests for new features
4. ✅ Review coverage reports monthly
5. ✅ Remove obsolete tests

### Performance Considerations
- Tests should complete in <10 seconds total
- Use small test images (1x1 or 100x100)
- Mock heavy operations (AI models)
- Parallelize independent tests

## Known Limitations

1. **API Tests**: Use in-memory FormData instead of actual HTTP requests
2. **Binary Data**: Limited validation of actual image quality, focus on structure

## Future Improvements

- [ ] Add integration tests with actual HTTP server
- [ ] Add visual regression tests for image output
- [ ] Implement snapshot testing for API responses
- [ ] Add performance benchmarks
- [ ] Add E2E tests for full user workflows

## Support

For issues with tests:
1. Check test logs: `pnpm test --reporter=verbose`
2. Verify dependencies: `pnpm install`
3. Clear cache: `pnpm vitest run --clearCache`
4. Check coverage: `pnpm test:coverage`

---

**Last Updated**: 2025
**Test Framework**: Vitest 2.1.8
**Total Tests**: ~70 test cases
**Average Runtime**: <10 seconds
**Average Runtime**: <10 seconds
