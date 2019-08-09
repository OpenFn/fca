# Finn Church Aid

Repository to manage OpenFn jobs.

**Note that commits to master will deploy directly to OpenFn.org**

- Currently, the single job (`fca_bulk_financials.js`) receives 14k+ lines of financial data;
- it groups, summarizes, and prepares that data to create `ampi__Financial__c` records in Salesforce;
- it loads that data into Salesforce, making use of the Bulk API.
