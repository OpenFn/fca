bulk(
  'ampi__Financial__c', // sObject
  'upsert', // operation
  { failOnError: true, extIdField: 'Name' }, // options
  state => {
    const raw = state.data.entries
      .filter(item => {
        // NOTE: only load individual items if they're between 3310 and 3888, incl.
        return item.G_LAccountNo_ >= 3310 && item.G_LAccountNo_ <= 3888;
      })
      .map(item => {
        return {
          Name: item.EntryNo_,
          Posting_Date__c: item.PostingDate,
          Account_Number__c: item.G_LAccountNo_,
          Account_Name__c: item.AccountName,
          Document_Number__c: item.DocumentNo_,
          ampi__Description__c: item.Description,
          ampi__Amount_Actual__c: item.Amount,
          Debit_Amount__c: item.DebitAmount,
          Credit_Amount__c: item.CreditAmount,
          Project_Series__c: item.ProjectSeries,
          Staff_Code__c: item.StaffCode,
          'ampi__Budget__r.Name': 'FCA Nav Default Budget',
          'ampi__Reporting_Period__r.Name': 'RP-00020',
          'Project_Number__r.Project_Programme_Number_External_ID__c': item.ProjectNr,
        };
      });

    const toAggregate = state.data.entries.filter(item => {
      // NOTE: aggregate items if they're below 3310 or above 3888.
      return item.G_LAccountNo_ < 3310 || item.G_LAccountNo_ > 3888;
    });

    var aggregated = [];
    toAggregate.reduce((accumulator, currentItem) => {
      if (!accumulator[currentItem.ProjectNr]) {
        accumulator[currentItem.ProjectNr] = {
          Name: currentItem.EntryNo_,
          Posting_Date__c: currentItem.PostingDate,
          Account_Number__c: currentItem.G_LAccountNo_,
          Account_Name__c: currentItem.AccountName,
          Document_Number__c: currentItem.DocumentNo_,
          ampi__Description__c: currentItem.Description,
          ampi__Amount_Actual__c: 0,
          Debit_Amount__c: 0,
          Credit_Amount__c: 0,
          Project_Series__c: currentItem.ProjectSeries,
          Staff_Code__c: currentItem.StaffCode,
          'ampi__Budget__r.Name': 'FCA Nav Default Budget',
          'ampi__Reporting_Period__r.Name': 'RP-00020',
          'Project_Number__r.Project_Programme_Number_External_ID__c': currentItem.ProjectNr,
        };
        aggregated.push(accumulator[currentItem.ProjectNr]);
      }
      accumulator[currentItem.ProjectNr].ampi__Amount_Actual__c += currentItem.Amount;
      accumulator[currentItem.ProjectNr].Debit_Amount__c += currentItem.DebitAmount;
      accumulator[currentItem.ProjectNr].Credit_Amount__c += currentItem.CreditAmount;      
      return accumulator;
    }, {});

    return raw.concat(aggregated);
  }
);
