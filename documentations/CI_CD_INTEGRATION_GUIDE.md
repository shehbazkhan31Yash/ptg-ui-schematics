# CI/CD Configuration

This project includes CI/CD configurations for both GitHub Actions and GitLab CI that work with both Angular and React applications.

## GitHub Actions

The GitHub Actions workflow is located at `.github/workflows/ci.yml` and includes:

### Jobs

1. **build-and-test** (Matrix: Node 18.x, 20.x)
   - Checkout code
   - Setup Node.js
   - Install dependencies
   - Lint code
   - Run unit tests (Angular: ChromeHeadless, React: JSDOM)
   - Build application
   - Upload build artifacts
   - Run E2E tests (if configured)

2. **code-quality**
   - Check code formatting with Prettier
   - Run TypeScript type checking

3. **docker-build** (Only on main/develop branches)
   - Build Docker image (if Dockerfile exists)
   - Test Docker container

### Triggers
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

## GitLab CI

The GitLab CI configuration is located at `.gitlab-ci.yml` and includes:

### Stages

1. **install** - Install dependencies with caching
2. **lint** - Run linters, type checking, and format checks
3. **test** - Run unit and E2E tests with coverage reports
4. **build** - Build the application
5. **docker** - Build and test Docker images (only on main/develop)

### Features
- Dependency caching for faster builds
- Test coverage reporting with Cobertura format
- JUnit test result reporting
- Parallel job execution
- Artifact retention (1 week for builds, 30 days for coverage)
- Docker build and testing (conditional)

## Framework-Specific Commands

### Angular Applications
```bash
# Lint
npm run lint

# Test
npm test -- --watch=false --browsers=ChromeHeadless

# Build
npm run build
```

### React Applications
```bash
# Lint
npm run lint

# Test
npm test -- --watchAll=false

# Build
npm run build
```

## Configuration

### GitHub Secrets (Optional)

For deployment, you may need to add these secrets in GitHub Settings > Secrets and Variables > Actions:

- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password/token
- `NPM_TOKEN` - NPM registry token (if publishing packages)
- `AWS_ACCESS_KEY_ID` - AWS access key (for AWS deployment)
- `AWS_SECRET_ACCESS_KEY` - AWS secret key (for AWS deployment)
- `AZURE_CREDENTIALS` - Azure service principal (for Azure deployment)

### GitLab CI/CD Variables (Optional)

For deployment, configure these variables in GitLab Settings > CI/CD > Variables:

- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password/token (mark as Protected and Masked)
- `NPM_TOKEN` - NPM registry token (if publishing packages)
- `AWS_ACCESS_KEY_ID` - AWS access key (for AWS deployment)
- `AWS_SECRET_ACCESS_KEY` - AWS secret key (for AWS deployment)
- `AZURE_CREDENTIALS` - Azure service principal (for Azure deployment)

## Customization

### Adding Deployment

You can add deployment stages to both CI configurations. Here are examples for common platforms:

#### GitHub Actions - AWS S3 Deployment
```yaml
deploy:
  runs-on: ubuntu-latest
  needs: build-and-test
  if: github.ref == 'refs/heads/main'
  steps:
    - uses: actions/checkout@v4
    - uses: actions/download-artifact@v4
      with:
        name: build-output
        path: dist/
    - name: Deploy to AWS S3
      uses: jakejarvis/s3-sync-action@master
      with:
        args: --acl public-read --follow-symlinks --delete
      env:
        AWS_S3_BUCKET: ${{ secrets.AWS_S3_BUCKET }}
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        SOURCE_DIR: 'dist'
```

#### GitLab CI - AWS S3 Deployment
```yaml
deploy:aws:
  stage: deploy
  image: python:3.9
  needs:
    - build
  before_script:
    - pip install awscli
  script:
    - aws s3 sync dist/ s3://$AWS_S3_BUCKET --delete
  only:
    - main
  environment:
    name: production
    url: https://your-domain.com
```

#### GitHub Actions - Azure Static Web Apps
```yaml
deploy:
  runs-on: ubuntu-latest
  needs: build-and-test
  if: github.ref == 'refs/heads/main'
  steps:
    - uses: actions/checkout@v4
    - name: Deploy to Azure Static Web Apps
      uses: Azure/static-web-apps-deploy@v1
      with:
        azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
        repo_token: ${{ secrets.GITHUB_TOKEN }}
        action: "upload"
        app_location: "/"
        output_location: "dist"
```

### Modifying Test Commands

Update the test commands in the CI files to match your project configuration:

**For Angular:**
- `npm test -- --watch=false --browsers=ChromeHeadless --code-coverage`

**For React:**
- `npm test -- --watchAll=false --coverage`

### Adding Code Coverage Thresholds

**GitHub Actions:**
```yaml
- name: Check coverage thresholds
  run: |
    if [ -f "coverage/coverage-summary.json" ]; then
      node -e "const cov = require('./coverage/coverage-summary.json'); 
      const threshold = 80; 
      if (cov.total.lines.pct < threshold) { 
        console.error('Coverage below threshold'); 
        process.exit(1); 
      }"
    fi
```

**GitLab CI:**
```yaml
coverage_check:
  stage: test
  needs:
    - test:unit
  script:
    - |
      if [ -f "coverage/coverage-summary.json" ]; then
        node -e "const cov = require('./coverage/coverage-summary.json'); 
        const threshold = 80; 
        if (cov.total.lines.pct < threshold) { 
          console.error('Coverage below threshold'); 
          process.exit(1); 
        }"
      fi
```

## Troubleshooting

### Tests Failing in CI but Passing Locally

**Angular:**
- Ensure Chrome/Chromium is available in CI (use ChromeHeadless)
- Check if `--watch=false` flag is set
- Verify `ng test` configuration in `angular.json`

**React:**
- Ensure `--watchAll=false` flag is set
- Check if environment variables are properly set
- Verify test configuration in `package.json` or `jest.config.js`

### Build Artifacts Not Found

- Verify the build output directory:
  - Angular: `dist/` (check `angular.json` for actual output path)
  - React: `dist/` (Vite) or `build/` (Webpack)
- Check if the build command completes successfully
- Review build logs for errors

### Docker Build Issues

- Ensure Dockerfile exists in the project root
- Verify all dependencies are properly installed before build
- Check Docker service is running (GitLab CI requires `docker:dind` service)
- For Angular, ensure production build is used
- For React, verify correct build output directory

### GitLab CI Cache Issues

If dependencies aren't being cached properly:
```yaml
cache:
  key:
    files:
      - package-lock.json
  paths:
    - node_modules/
    - .npm/
  policy: pull-push
```

### GitHub Actions Cache Not Working

If cache isn't working:
```yaml
- name: Cache node modules
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

## Best Practices

### General
1. ✅ Keep CI files up to date with project dependencies
2. ✅ Run CI checks locally before pushing (using act for GitHub Actions, gitlab-runner for GitLab)
3. ✅ Monitor CI/CD pipeline execution times and optimize if needed
4. ✅ Use caching effectively to speed up builds
5. ✅ Keep secrets secure - never commit them to the repository
6. ✅ Use environment-specific configurations

### Angular-Specific
7. ✅ Use `--watch=false` and `--browsers=ChromeHeadless` for CI tests
8. ✅ Consider using `ng build --configuration production` for production builds
9. ✅ Enable code coverage with `--code-coverage` flag
10. ✅ Use Angular CLI's built-in optimization features

### React-Specific
11. ✅ Use `--watchAll=false` for CI tests
12. ✅ Consider environment variables for different environments
13. ✅ Use production build for deployments (`npm run build`)
14. ✅ Verify bundler-specific configurations (Vite vs Webpack)

### Performance
15. ✅ Use npm ci instead of npm install for faster, consistent installs
16. ✅ Parallelize independent jobs when possible
17. ✅ Use artifacts to share build outputs between jobs
18. ✅ Set appropriate artifact retention periods

## Testing Locally

### GitHub Actions with act
```bash
# Install act (macOS)
brew install act

# Install act (Linux)
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run all workflows
act

# Run specific job
act -j build-and-test

# Run with secrets
act -s GITHUB_TOKEN=your_token
```

### GitLab CI with gitlab-runner
```bash
# Install gitlab-runner
# See: https://docs.gitlab.com/runner/install/

# Validate .gitlab-ci.yml
gitlab-runner exec docker lint

# Run specific job locally
gitlab-runner exec docker build
```

## Monitoring and Notifications

### GitHub Actions
- View workflow runs: Repository > Actions tab
- Configure notifications: GitHub Settings > Notifications

### GitLab CI
- View pipeline runs: Repository > CI/CD > Pipelines
- Configure notifications: Repository Settings > Integrations
- Set up email notifications: GitLab Settings > Notifications

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Docker Documentation](https://docs.docker.com/)
- [Angular CLI Documentation](https://angular.io/cli)
- [Create React App Documentation](https://create-react-app.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Jest Documentation](https://jestjs.io/)
- [Karma Documentation](https://karma-runner.github.io/)

## Support

For issues or questions:
1. Check this documentation first
2. Review CI logs for specific error messages
3. Consult framework-specific documentation
4. Check CI platform status pages
5. Review community forums and Stack Overflow

## License

This CI/CD configuration is part of PTG UI Schematics and follows the same license.
