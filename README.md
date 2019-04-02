# Presto Balance Validator

A friend of mine reported that Presto balances have been out of whack. Simple script to check their balances and report problematic transactions. Will CLI-ify this into a proper tool later on.

# Usage

Install dependencies:

`npm ci`

Pass filepath to presto CSV data as argument:

`node index.js /path/to/presto_data.csv`
