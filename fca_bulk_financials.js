bulk('ampi__Financial__c', 'upsert', { failOnError: true, extIdField: 'Name'}, state => {
  return state.data.entries.map(line => {
    return {
      Name: line.EntryNo_,
      Posting_Date__c: line.PostingDate,
      Account_Number__c: line.G_LAccountNo_,
      Account_Name__c: line.AccountName,
      Document_Number__c: line.DocumentNo_,
      ampi__Description__c: line.Description,
      ampi__Amount_Actual__c: line.Amount,
      Debit_Amount__c: line.DebitAmount,
      Credit_Amount__c: line.CreditAmount,
      Project_Series__c: line.ProjectSeries,
      Staff_Code__c: line.StaffCode,

      //Q2***HOW TO MAP RELATIONSHIP FIELDS IN BULK FUNCTION?*****
      // ampi__Budget__c: 'a031j00000DxVf8AAF', // hard coded
      'ampi__Budget__r.Name': 'FCA Nav Default Budget', // ideal

      // ampi__Reporting_Period__c: 'a0X1j000000MBggEAG', // hard coded
      'ampi__Reporting_Period__r.Name': 'RP-00020', // ideal

      Project_Number__c: 'a0V1j000000R4D9EAK', // hard coded
      // 'Project_Number__r.Project_Number_Auto__c': line.ProjectNr, // ideal
    }
  })
});