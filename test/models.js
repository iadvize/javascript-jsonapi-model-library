/* eslint no-sync: 0 */
import assert from 'assert';
import tv4 from 'tv4';
import Model from '../lib/model';
import ArgumentError from '../lib/errors';
import jsonApiSchema from '../lib/schemas/jsonapi.json';

import fs from 'fs';
import ymlLoader from 'js-yaml';
const profileSchema = ymlLoader.safeLoad(fs.readFileSync(`${__dirname}/profile.yml`));

class Profile extends Model {}

describe('Models', () => {

  describe('a profile', () => {
    it('should be constructible', () => {
      t.isFunction(Profile);
      t.strictEqual('Profile', (new Profile()).constructor.name);
    });

    describe('instance', () => {
      it('should have a toJson method', () => {
        t.property(new Profile(), 'toJson');
        t.isFunction((new Profile()).toJson);
      });

      it('should accept an object when constructing', () => {
        t.doesNotThrow(() => new Profile({}), ArgumentError);
        t.doesNotThrow(() => new Profile(), ArgumentError);
        t.throw(() => new Profile(''), ArgumentError, 'Values must be an object not: string');
      });

      it('should return an object that represent a valid jsonapi', () => {
        const profile = new Profile({
          data: {
            id: '1',
            type: 'profile',
            attributes: {
              name: 'Simon',
              firstName: 'Simon',
              avatar: 'http://google.fr',
              createdAt: 'timestamp'
            }
          }
        });

        t.deepEqual({
          data: {
            id: '1',
            type: 'profiles',
            attributes: {
              name: 'Simon',
              firstName: 'Simon',
              avatar: 'http://google.fr',
              createdAt: 'timestamp'
            }
          }
        }, profile.toJson());

        assert(tv4.validate(profile.toJson(), jsonApiSchema), `assert fail on json-api ${JSON.stringify(profile.toJson())}`);
        const result = tv4.validateResult(profile.toJson(), profileSchema);
        assert(result.valid, result.valid ? '' : result.error.message);
      });

      describe('should return a json-api', () => {
        it('when no schema is defined', () => {
          const m = new Model({data: {id: 'ID', type: 'models', attributes: {name: 'Simon', id: 'ID', thing: 'truc'}}});
          const expected = {
            data: {
              id: 'ID',
              type: 'models',
              attributes: {
                name: 'Simon',
                thing: 'truc'
              }
            }
          };
          t.deepEqual(expected, m.toJson());
        });

        it('when a schema is pass this schema is used to validate if the data is already in json-api format', () => {
          const schemaTest = {
            $schema: 'http://json-schema.org/draft-04/schema#',
            title: 'Vcard',
            type: 'object',
            additionalProperties: false,
            required: ['data'],
            properties: {
              data: {
                type: 'object',
                required: ['id', 'type'],
                additionalProperties: false,
                properties: {
                  id: {type: 'string', minLength: 1},
                  type: {type: 'string', 'minLength': 1},
                  attributes: {
                    type: 'object',
                    additionalProperties: true,
                    properties: {
                      name: {type: 'string', minLength: 1}
                    },
                    required: ['name']
                  }
                }
              }
            }
          };

          const m = new Model({
            data: {
              id: 'ID',
              type: 'models',
              attributes: {
                name: 'Simon',
                thing: 'truc'
              }
            }
          }, schemaTest);

          const expected = {
            data: {
              id: 'ID',
              type: 'models',
              attributes: {
                thing: 'truc'
              }
            }
          };

          assert(m.isJsonApi);
          m.setJsonApiConfig({
            attributes: ['thing']
          });

          t.deepEqual(m.toJson(), expected);
        });
      });

      describe('should be validate', () => {
        it('when valid it does not throw exception', () => {
          const schemaTest = {
            $schema: 'http://json-schema.org/draft-04/schema#',
            title: 'Vcard',
            type: 'object',
            additionalProperties: false,
            required: ['data'],
            properties: {
              data: {
                type: 'object',
                required: ['id', 'type'],
                additionalProperties: false,
                properties: {
                  id: {type: 'string', minLength: 1},
                  type: {type: 'string', 'minLength': 1},
                  attributes: {
                    type: 'object',
                    additionalProperties: true,
                    properties: {
                      name: {type: 'string', minLength: 1}
                    },
                    required: ['name']
                  }
                }
              }
            }
          };
          const m = new Model({data: {id: 'ID', type: 'models', attributes: {name: 'Simon', id: 'ID', thing: 'truc'}}}, schemaTest);
          t.doesNotThrow(() => m.validate(), Error, 'Invalid format');
        });

        it('when invalid it throw exception', () => {
          const schemaTest = {
            $schema: 'http://json-schema.org/draft-04/schema#',
            title: 'Vcard',
            type: 'object',
            additionalProperties: false,
            required: ['data'],
            properties: {
              data: {
                type: 'object',
                required: ['id', 'type'],
                additionalProperties: false,
                properties: {
                  id: {type: 'string', minLength: 1},
                  type: {type: 'string', 'minLength': 1},
                  attributes: {
                    type: 'object',
                    additionalProperties: true,
                    properties: {
                      name: {type: 'string', minLength: 1}
                    },
                    required: ['name']
                  }
                }
              }
            }
          };
          const m = new Model({data: {id: 'ID', type: 'models', attributes: {name: 1, id: 'ID', thing: 'truc'}}}, schemaTest);
          t.throw(() => m.validate(), Error, 'Invalid format');
        });
      });

      describe('should get and set key', () => {
        it('should get a key', () => {
          const m = new Model({data: {id: 'ID', type: 'models', attributes: {name: 1, id: 'ID', thing: 'truc'}}});

          t.equal(m.get('name'), 1);
        });
        it('should set a key', () => {
          const m = new Model({data: {id: 'ID', type: 'models', attributes: {name: 1, id: 'ID', thing: 'truc'}}});

          m.set('name', 'bibi');
          t.equal(m.get('name'), 'bibi');
        });
      });
    });
  });
});
