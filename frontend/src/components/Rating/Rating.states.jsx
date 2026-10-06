// States for the generated mock (npm run mocks:build). Like a story: what's worth seeing.
import Rating from './Rating';

export default [0, 3, 4, 5].map((value) => ({ name: `${value} of 5`, render: () => <Rating value={value} /> }));
