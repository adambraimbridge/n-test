# n-test
A node module containing a collection of test tasks and utilities for Next applications

## Why does this exist?

To share common testing CLI tasks, fixtures, snippets of useful test code for FT.com applications and components.

## Tasks

#### Smoke tests

Runs a set of basic tests against URLs. These are specified in a JSON config (default location: test/smoke.js).


`n-test smoke`

`n-test smoke --config path/to/config.js --host https://local.ft.com:3002`

*Example config*
```
module.exports = [
  {
    urls: {
      '/': {
        status: 200,
        "cssCoverage": [
          {
            "url": "/article/UUID",
            "threshold": 20
          }
        ]
      },
      '/some/path': 200
    }
  },
  {
    headers: {
      'some-header': 1
    }
    urls: {
      '/run-with-header': {
        status: 200,
        content: (content) => {
          return content.includes('some-text');
        }
      },
      '/run-with-additional-headers': {
        headers: { 'some-other-header': 'value' }
        status: 200
      }
    }
  }
]
```

#### Open Sesame

Opens an instance of Chrome with all of the URLs specified in the smoke tests, for manual verification.

`n-test open-sesame`

`n-test smoke --config path/to/config.js --host https://local.ft.com:3002`
