bulk(
  'ampi__Financial__c', // sObject
  'upsert', // operation
  { failOnError: true, extIdField: 'Name' }, // options
  state => {
    const raw = state.data.entries
      .filter(function(item) {
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

          //Q2***HOW TO MAP RELATIONSHIP FIELDS IN BULK FUNCTION?*****
          // ampi__Budget__c: 'a031j00000DxVf8AAF', // hard coded
          'ampi__Budget__r.Name': 'FCA Nav Default Budget', // ideal

          // ampi__Reporting_Period__c: 'a0X1j000000MBggEAG', // hard coded
          'ampi__Reporting_Period__r.Name': 'RP-00020', // ideal

          //Project_Number__c: 'a0V1j000000R4D9EAK', // hard coded
          'Project_Number__r.Project_Programme_Number_External_ID__c':
            item.ProjectNr, // ideal
        };
      });

    const aggregated = [1, 2, 3];

    return raw.concat(aggregated);
  }
);
