# Contributing to this repository

Please make sure you understand the Apache 2.0 license terms before contributing 
to this repository.

# Conventional Commits

Please read [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) and review the guidelines listed therein.

We are using the `standard-version` package, which is a tool that automatically updates version numbers, changelog, etc. You can read more
about `standard-version` [here](https://github.com/conventional-changelog/standard-version)

## Commit Message Structure

Commits should use the following structure. This allows `standard-version` to craft a changelog based solely on commits, which should make things easier for us as the project
expands. See [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#examples) for examples.

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Commit Types

The following is a non-exhaustive list of commit types (`<type>`):

* `feat`
* `fix`
* `docs`
* `refactor`
* `style`
* `chore`

# Tags, Releases, and Changelog

For each release, we create a new branch with the format `release-x.y.z`. 
Changes meant to be included in a specific release should be created within a 
new branch created from the release in question, and a pull request should be 
made to that release branch (not `main`).

**Example Feature-to-Release Pull Requests**

- `release-0.5.4 <- feat-ks-info`
- `release-0.5.3 <- feat-extraction-pipeline`

Once a release is ready for production, a pull request should be created from
`release-x.y.z` to `main`. Then, if/when the release is approved and merged, 
an administrator will run the `release` command (as defined in package.json).
This command searches for commit messages of the formats described above,
automatically populates the CHANGELOG, increments the application version number
accordingly, and creates a new tag/release.

**Example Release-to-Production Pull Request**

- `main <- release-0.5.4`

# Installers and Auto-Update

The final build is currently done manually using 
`yarn build -> yarn dist-all -> yarn publish-all`. This creates the relevant
binaries and places them in the `dist` folder, as well as publishes the binaries
to a publicly accessible AWS S3 bucket (requires secret API key to publish). We 
push the binaries to AWS S3 to take advantage of Electrons auto-update feature, 
which automatically checks for and installs new versions when the application 
starts.

Previously, releases were uploaded to GitHub directly, but due to lack of
transparency in GitHubs metrics and monitoring, we will henceforth link
to the binaries stored on S3 in all of our GitHub releases. This give us a 
better insight into things like popularity metrics (total downloads) as well as 
more fine-grained control and convenience in distribution.
