# Play Don’t Fall Granny on GitHub Pages

The repository includes an automated Unity WebGL pipeline.

## What it does

On the stabilization branch:

1. Unity tests run.
2. The vertical-slice scene is generated.
3. Unity builds a WebGL version.
4. The WebGL build is uploaded as a GitHub Actions artifact.

After the workflow is merged to `main`:

5. The same WebGL output is uploaded to GitHub Pages.
6. GitHub Pages deploys the game.

Expected default URL:

`https://wanderwerkhoven-afk.github.io/dont-fall-granny/`

The URL only exists after GitHub Pages has been enabled and the first successful deployment has completed.

## One-time GitHub setup

### Unity license secrets

For Unity Personal, add repository Actions secrets:

- `UNITY_LICENSE`
- `UNITY_EMAIL`
- `UNITY_PASSWORD`

For Unity Pro, add:

- `UNITY_SERIAL`
- `UNITY_EMAIL`
- `UNITY_PASSWORD`

Path:

**Repository → Settings → Secrets and variables → Actions → New repository secret**

Never commit Unity credentials or license contents.

### Enable GitHub Pages

Open:

**Repository → Settings → Pages**

Under **Build and deployment**, choose:

**Source → GitHub Actions**

## WebGL hosting

The build disables Unity WebGL compression because GitHub Pages does not provide custom Content-Encoding headers. This makes the initial download larger but avoids broken .gz/.br WebGL assets on static Pages hosting.

Unity build method:

`DontFallGranny.EditorTools.WebGLBuildPipeline.BuildForGitHubPages`

Build output:

`build/WebGL`

A `.nojekyll` file is generated automatically.

## Private repository

GitHub Pages availability for private repositories depends on the GitHub plan and repository settings. If Pages is unavailable for this private repository, use a plan that supports private-repository Pages or publish from a separate public deployment repository.
