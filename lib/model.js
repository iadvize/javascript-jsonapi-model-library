/* eslint no-console: 0 */
import _ from 'lodash';
import tv4 from 'tv4';
import jsonapi from './schemas/jsonapi.json';
import {ArgumentError} from './errors';
import Serializer from 'jsonapi-serializer';

class Model {
  constructor(values = {}, schema = false, Instancier = Model) {
    if (!_.isObject(values)) {
      throw new ArgumentError(`Values must be an object not: ${typeof values}`);
    }

    this.Instancier = Instancier;
    this.values = values;
    this.outputType = this.constructor.name.toLowerCase();
    this.schema = schema;
    this.identifierKey = 'id';

    // JSON VALIDATION
    this.isJsonApi = this.matchJsonApi(values);
    if (this.isJsonApi) {
      this.values = _.assign({id: _.get(this.values, 'data.id')}, _.get(this.values, 'data.attributes'));
    }

    this.jsonApiConfig = {
      keyForAttribute: 'camelCase',
      attributes: _.chain(this.values).omit(this.identifierKey).keys().value()
    };
  }

  validate() {
    const v = this.toJson();

    const res = tv4.validateResult(v, this.schema);
    if (!res.valid) {
      throw new Error(`Invalid format ${this.constructor.name} ${JSON.stringify(res)}`);
    }
  }

  validateCollection() {
    _.forEach(this.values, v => {
      const res = tv4.validateResult((new this.Instancier(v)).toJson(), this.schema);
      if (!res.valid) {
        throw new Error(`Invalid format ${this.constructor.name} ${JSON.stringify(res)}`);
      }
    });
  }

  matchJsonApi(data) {
    return tv4.validate(data, jsonapi);
  }

  get(key) {
    return _.get(this.values, key);
  }

  set(key, value) {
    _.set(this.values, key, value);
    return this;
  }

  setJsonApiConfig(config) {
    this.jsonApiConfig = _.assign(this.jsonApiConfig, config);
    return this;
  }

  toJson() {
    return new Serializer(this.outputType, this.values, this.jsonApiConfig);
  }
}

export default Model;
