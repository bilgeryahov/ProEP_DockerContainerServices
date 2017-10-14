
import {
    graphql,
    buildSchema
} from 'graphql';

export let schema = buildSchema(`
type Query {
  hello: String
}
`);

export let root = {
    hello: () => {
        return 'Hello world!';
    },
};