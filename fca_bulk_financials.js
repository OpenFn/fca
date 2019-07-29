bulk(
  'ampi__Financial__c', // sObject
  'upsert', // operation
  { failOnError: true, extIdField: 'Name' }, // options
  state => {
    const raw = state.data.entries
      .filter(item => {
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

    const aggregated = [1, 2, 3];

    return raw.concat(aggregated);
  }
);
