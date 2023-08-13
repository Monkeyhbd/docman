#!/usr/bin/env node

const NodeProcess = require('node:process')
const Interface = require('./interface/index')


Interface.execute(NodeProcess.argv)
