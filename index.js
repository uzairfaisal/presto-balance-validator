const fs = require('fs');
const csv = require('fast-csv');
const numeral = require('numeral');

if (!fs.existsSync(process.argv[2])) {
    console.error('Please provide a valid path to your CSV data containing your presto transactions.');
    return;
}
const stream = fs.createReadStream(process.argv[2]);
const serviceClasses = new Set();
const debitTypes = new Set(['Fare Payment', 'Payment by Card Balance']);
const creditTypes = new Set(['Load Amount', 'Auto Adjustment - Missed Tap Off', 'Adjustment - Missed Tap Off']);
const skipTypes = new Set(['Fare Inspection', 'Transfer', 'Card Setting Change'])
const allTypes = new Set([...debitTypes, ...creditTypes, ...skipTypes]);
let nextBalanceShouldBe = null;

csv
    .fromStream(stream, {headers: true})
    // collect all transaction types
    .on("data", data => serviceClasses.add(data['Type ']))
    .on("data", data => {
        if (skipTypes.has(data['Type '])) { return; }
        if (nextBalanceShouldBe !== null) {
            if (nextBalanceShouldBe !== numeral(data.Balance).value()) {
                console.error(`Fare does not match! Should be ${nextBalanceShouldBe} but found ${data.Balance} on ${data.Date}.`);
            }
        }
        nextBalanceShouldBe = Math.round((debitTypes.has(data['Type ']) ? 
            numeral(data.Balance).value() + numeral(data.Amount).value() : 
            numeral(data.Balance).value() - numeral(data.Amount).value()) * 100) / 100;
    })
    .on("end", () => {
        const unknownTypes = [...serviceClasses].filter(val => !allTypes.has(val));
        if (unknownTypes.length > 0) {
            console.debug(`Found unknown transaction types (${unknownTypes}) in the provided CSV data. Please pass this message along with your CSV data to the npm package owner(s).`);
        }
        console.log("done");
    });
