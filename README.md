<p align="center">
  <img src="https://images.atomist.com/sdm/SDM-Logo-Dark.png">
</p>

# @atomist-blogs/secret-beagle

Simple SDM that finds exposed secrets in projects. Based on 
the paper [How Bad Can it Git](https://www.ndss-symposium.org/wp-content/uploads/2019/02/ndss2019_04B-3_Meli_paper.pdf).

[atomist-doc]: https://docs.atomist.com/ (Atomist Documentation)

## Starting the SDM

If you have an Atomist workspace, start the SDM with `atomist start`. It will check every
push in your workspace.

To run it locally, start the SDM with `atomist start --local`. This is purely open source
and does not require an Atomist workspace. Please refer to Atomist documentation
to ensure you have the necessary git hooks.

## Configuration

The definition of secrets is is in the `secrets.yml` file in the root directory. It should
look as follows:

```yaml

# List of glob patterns to match files
globs:
  - "**"

secrets:
  # List of secrets, with regex and description
  - secret:
      pattern: "AKIA[0-9A-Z]{16}"
      description: "AWS secret"

# List of acceptable secret-like literals
whitelist:
```

Sections are as follows:
- `globs`: List of glob strings specifying the type of files to look in. Default is all files.
Binary files won't be examined in any case.
- `secrets`: List of `secret` structure. Consists of `pattern` (regular expression matching the secret
in a file) and human readable `description` (typically what kind of secret this is)
- `whitelist`: List of secret literals, if any, that _are_ acceptable in your project.
For example, the test suite of this project contains secret-like strings that are not
actual secrets, and should be let through.

See the [Developer Quick Start][atomist-quick] for information on how to extend this
SDM.

[atomist-quick]: https://docs.atomist.com/quick-start/ (Atomist - Developer Quick Start)

## Contributing

Contributions to this project from community members are encouraged
and appreciated. Please review the [Contributing
Guidelines](CONTRIBUTING.md) for more information. Also see the
[Development](#development) section in this document.

## Code of conduct

This project is governed by the [Code of
Conduct](CODE_OF_CONDUCT.md). You are expected to act in accordance
with this code by participating. Please report any unacceptable
behavior to code-of-conduct@atomist.com.

## Documentation

Please see [docs.atomist.com][atomist-doc] for
[developer][atomist-doc-sdm] documentation.

[atomist-doc-sdm]: https://docs.atomist.com/developer/sdm/ (Atomist Documentation - SDM Developer)

## Connect

Follow [@atomist][atomist-twitter] and [the Atomist blog][atomist-blog].

[atomist-twitter]: https://twitter.com/atomist (Atomist on Twitter)
[atomist-blog]: https://blog.atomist.com/ (The Official Atomist Blog)

## Support

General support questions should be discussed in the `#support`
channel in the [Atomist community Slack workspace][slack].

If you find a problem, please create an [issue][].

[issue]: https://github.com/atomist-seeds/empty-sdm/issues

## Development

You will need to install [Node.js][node] to build and test this
project.

[node]: https://nodejs.org/ (Node.js)

### Build and test

Install dependencies.

```
$ npm install
```

Use the `build` package script to compile, test, lint, and build the
documentation.

```
$ npm run build
```

### Release

Releases are handled via the [Atomist SDM][atomist-sdm].  Just press
the 'Approve' button in the Atomist dashboard or Slack.

[atomist-sdm]: https://github.com/atomist/atomist-sdm (Atomist Software Delivery Machine)

---

Created by [Atomist][atomist].
Need Help?  [Join our Slack workspace][slack].

[atomist]: https://atomist.com/ (Atomist - How Teams Deliver Software)
[slack]: https://join.atomist.com/ (Atomist Community Slack)
