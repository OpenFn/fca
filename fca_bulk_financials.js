bulk(
  'ampi__Financial__c', // sObject
  'upsert', // operation
  { failOnError: true, extIdField: 'Name' }, // options
  state => {
    function transformDate(dt) {
      return dt.split('T')[0];
    }

    // NOTE: typeA = "Implementation/Office Support Project Actuals"
    const typeA = state.data.entries
      .filter(item => {
        // NOTE: load individual items if they're below 3310 or above 3888
        return item.G_LAccountNo_ < 3310 || item.G_LAccountNo_ > 3888;
      })
      .map(item => {
        return {
          'ampi__Budget__r.Budget_Unique_Identifier__c': item.ProjectNr,
          'ampi__Reporting_Period__r.Reporting_Period_Unique_Identifier__c':
            item.ProjectNr,
          'Project_Number__r.Project_Number_External_ID__c': item.ProjectNr,
          Income_Account_Number__c: G_LAccountNo_ <= 3999 ? item.G_LAccountNo_ + item.AccountName : '',
          Expense_Account_Number__c: G_LAccountNo_ >= 4000 ? item.G_LAccountNo_ + item.AccountName : '',
          //DEP___Account_Name__c: item.AccountName, //To replace with Jan 30 change request
          //DEP___Account_Number__c: item.G_LAccountNo_, //To replace with Jan 30 change request
          ampi__Amount_Actual__c: item.Amount,
          ampi__Description__c: item.Description,
          Credit_Amount__c: item.CreditAmount,
          Debit_Amount__c: item.DebitAmount,
          Document_Number__c: item.DocumentNo_,
          Name: item.EntryNo_,
          Date_For_Currency_Conversion__c: transformDate(item.PostingDate),
          Project_Series__c: item.ProjectSeries,
          Staff_Code__c: item.StaffCode,
        };
      });

    // NOTE: typeB = "Income Projects Actuals"
    const typeB = state.data.entries.filter(item => {
      // NOTE: aggregate items if they're between 3310 and 3888, inclusive
      return item.G_LAccountNo_ >= 3310 && item.G_LAccountNo_ <= 3888;
    });

    function findRanges(arr) {
      if (arr.length === 0) {
        return null;
      }

      let minE = arr[0].EntryNo_,
        maxE = arr[0].EntryNo_;
      let minD = arr[0].DocumentNo_,
        maxD = arr[0].DocumentNo_;
      let maxP = transformDate(arr[0].PostingDate);
      //let minP = transformDate(arr[0].PostingDate), maxP = transformDate(arr[0].PostingDate);

      for (let i = 1, len = arr.length; i < len; i++) {
        let e = arr[i].EntryNo_;
        //minE = (e < minE) ? e : minE;
        maxE = e > maxE ? e : maxE; //only return max EntryNo

        let d = arr[i].DocumentNo_;
        minD = d < minD ? d : minD;
        maxD = d > maxD ? d : maxD;

        let p = transformDate(arr[i].PostingDate);
        //minP = (p < minP) ? p : minP;
        maxP = p > maxP ? p : maxP; //Only return max Date
      }

      return {
        entryRange: `${maxE}-${minE}`,
        DocumentNo_: `${minD} - ${maxD}`,
        PostingDate: `${maxP}`,
      };
    }
    const ranges = findRanges(typeB);

    var aggregatedTypeB = [];

    typeB.reduce((accumulator, currentItem) => {
      const { ProjectNr, Amount, DebitAmount, CreditAmount } = currentItem;
      if (!accumulator[ProjectNr]) {
        accumulator[ProjectNr] = {
          'ampi__Budget__r.Budget_Unique_Identifier__c': ProjectNr,
          'ampi__Reporting_Period__r.Reporting_Period_Unique_Identifier__c': ProjectNr,
          'Project_Number__r.Project_Number_External_ID__c': ProjectNr,
          Account_Name__c: 'Donations',
          Account_Number__c: '3310 - 3888',
          ampi__Amount_Actual__c: 0,
          ampi__Description__c: 'Donations',
          Credit_Amount__c: 0,
          Debit_Amount__c: 0,
          Document_Number__c: ranges.DocumentNo_,
          Name: `${ranges.entryRange}-${ProjectNr}`,
          Date_For_Currency_Conversion__c: ranges.PostingDate,
          // Project_Series__c: '', // intentionally left blank
          // Staff_Code__c: '', // intentionally left blank
        };
        aggregatedTypeB.push(accumulator[ProjectNr]);
      }
      accumulator[ProjectNr].ampi__Amount_Actual__c += Amount;
      accumulator[ProjectNr].Debit_Amount__c += DebitAmount;
      accumulator[ProjectNr].Credit_Amount__c += CreditAmount;
      return accumulator;
    }, {});

    return typeA.concat(aggregatedTypeB);
  }
);
