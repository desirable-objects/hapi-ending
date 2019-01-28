export default function parseExample (block) {
  return Object.keys(block).reduce((curr, next) => {
    curr[next] = block[next].example
    console.log(block[next])
    return curr
  }, {})
}
