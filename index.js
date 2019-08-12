#!/usr/bin/env node

/* global require */
const graphviz = require('graphviz'),
      fs = require('fs'),
      process = require('process'),
      color = require('rcolor');

const package = JSON.parse(fs.readFileSync('./package.json'));

if (typeof package.scripts !== 'object') {
  console.log('`package.json` does not contain a field named `scripts`.');
  process.exit(1);
}

const graph = graphviz.digraph('G');
const colorMap = new Map();
const re = /npm\s+run\s+([a-zA-Z-_:]+)/g;

Object.keys(package.scripts).forEach(script => {
  colorMap.set(script, color());
});

Object.entries(package.scripts).forEach(([key, value])  => {
  var match, matches = [];

  graph.addNode(key, { color: colorMap.get(key), penwidth: 2 });

  while ((match = re.exec(value))) {
    matches.push(match[1]);
  }

  matches.forEach((match, ix) => {
    const edge = graph.addEdge(key, match, {
      penwidth: 2,
      color: colorMap.get(key),
      fontcolor: colorMap.get(key)
    });

    if (matches.length > 1)
      edge.set('label', ix + 1);
  });
});

console.log(graph.to_dot());

graph.output("png", "./npm-run-graph.png");
