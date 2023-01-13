import fetch from '@rdfjs/fetch';
const res = await fetch('http://localhost:80/test/kb.ttl');
const dataset = await res.dataset()

for (const quad of dataset) {
  console.log(`${quad.subject.value} ${quad.predicate.value} ${quad.object.value}`)
}
