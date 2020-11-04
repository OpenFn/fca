# Finn Church Aid

Repository to manage OpenFn jobs that sync Nav financial data with the FCA NOW Salesforce system. 

**Note that commits to master will deploy directly to OpenFn.org**

## Solution Overview
[See here](https://docs.google.com/document/d/1E_SeI60F_4ECRuYNqQZNTpB_FDEbgp7yFOCiu3GtOKM/edit?usp=sharing) for the solution narrative written by Vera Solutions, and [see here](https://docs.google.com/spreadsheets/d/1Eu54wOmz08YPMLH9dWbPpJAyluWraitIjQ_Ww_erqa4/edit?usp=sharing) for the Vera mapping specifications. 
- Currently, the single job (`fca_bulk_financials.js`) receives 14k+ lines of financial data;
- it groups, summarizes, and prepares that data to create `ampi__Financial__c` records in Salesforce;
- it loads that data into Salesforce, making use of the Bulk API.

## Questions?
Contact support@openfn.org. 

