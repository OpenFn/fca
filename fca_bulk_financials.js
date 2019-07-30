bulk(
  'ampi__Financial__c', // sObject
  'upsert', // operation
  { failOnError: true, extIdField: 'Name' }, // options
  state => {
    // NOTE: typeA = "Implementation/Office Support Project Actuals"
    const typeA = state.data.entries
      .filter(item => {
        // NOTE: load individual items if they're below 3310 or above 3888
        return item.G_LAccountNo_ < 3310 || item.G_LAccountNo_ > 3888;
      })
      .map(item => {
        return {
          'ampi__Budget__r.Name': 'FCA Nav Default Budget',
          'ampi__Reporting_Period__r.Name': 'RP-00020',
          'Project_Number__r.Project_Programme_Number_External_ID__c': item.ProjectNr,
          Account_Name__c: item.AccountName,
          Account_Number__c: item.G_LAccountNo_,
          ampi__Amount_Actual__c: item.Amount,
          ampi__Description__c: item.Description,
          Credit_Amount__c: item.CreditAmount,
          Debit_Amount__c: item.DebitAmount,
          Document_Number__c: item.DocumentNo_,
          Name: item.EntryNo_,
          Posting_Date__c: item.PostingDate,
          Project_Series__c: item.ProjectSeries,
          Staff_Code__c: item.StaffCode,
        };
      });

    // NOTE: typeB = "Income Projects Actuals"
    const typeB = state.data.entries.filter(item => {
      // NOTE: aggregate items if they're between 3310 and 3888, inclusive
      return item.G_LAccountNo_ >= 3310 && item.G_LAccountNo_ <= 3888;
    });

    var aggregatedTypeB = [];
    typeB.reduce((accumulator, currentItem) => {
      if (!accumulator[currentItem.ProjectNr]) {
        accumulator[currentItem.ProjectNr] = {
          'ampi__Budget__r.Name': 'FCA Nav Default Budget',
          'ampi__Reporting_Period__r.Name': 'RP-00020',
          'Project_Number__r.Project_Programme_Number_External_ID__c': currentItem.ProjectNr,
          Account_Name__c: currentItem.AccountName,
          Account_Number__c: currentItem.G_LAccountNo_,
          ampi__Amount_Actual__c: 0,
          ampi__Description__c: currentItem.Description,
          Credit_Amount__c: 0,
          Debit_Amount__c: 0,
          Document_Number__c: currentItem.DocumentNo_,
          Name: currentItem.EntryNo_,
          Posting_Date__c: currentItem.PostingDate,
          // Project_Series__c: '', // intentionally left blank
          // Staff_Code__c: '', // intentionally left blank
        };
        aggregatedTypeB.push(accumulator[currentItem.ProjectNr]);
      }
      accumulator[currentItem.ProjectNr].ampi__Amount_Actual__c += currentItem.Amount;
      accumulator[currentItem.ProjectNr].Debit_Amount__c += currentItem.DebitAmount;
      accumulator[currentItem.ProjectNr].Credit_Amount__c += currentItem.CreditAmount;      
      return accumulator;
    }, {});

    return typeA.concat(aggregatedTypeB);
  }
);
