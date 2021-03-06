javascript-jsonapi-model-library [![Build Status][circle-image]][circle-url] [![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url]
================================

> Provide base model to deal with jsonapi models

## Examples

## Install

```sh
$ npm install --save javascript-jsonapi-model-library
```

## Documentation

### Usage

```js
import Model from 'javascript-jsonapi-model-library';
const schema = 'a json-schema';

class Profile extends Model {
    constructor(values) {
        super(values, schema);

        this.setJsonConfig({
            attributes: ['name', 'email']
        });
    }
}

let profile = new Profile({name: 'Simon', email: 'email@example.com', state: 'approved'});

assert(profile.get('name') === 'Simon');

try {
    profile.validate();

    reply(profile.toJson());
} catch (e) {
    // deal with error
}
```

## Contribute

Look at contribution guidelines here : [CONTRIBUTING.md](CONTRIBUTING.md)

[npm-image]: https://badge.fury.io/js/javascript-jsonapi-model-library.svg
[npm-url]: https://npmjs.org/package/javascript-jsonapi-model-library
[circle-image]: https://circleci.com/gh/iadvize/javascript-jsonapi-model-library.svg?style=svg
[circle-url]: https://circleci.com/gh/iadvize/javascript-jsonapi-model-library
[daviddm-image]: https://david-dm.org/iAdvize/javascript-jsonapi-model-library.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/iAdvize/javascript-jsonapi-model-library
