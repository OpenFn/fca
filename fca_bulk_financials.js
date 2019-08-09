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

    function findRanges(arr) {
      let minE = arr[0].EntryNo_, maxE = arr[0].EntryNo_;
      let minD = arr[0].DocumentNo_, maxD = arr[0].DocumentNo_;
      let minP = arr[0].PostingDate, maxP = arr[0].PostingDate;
    
      for (let i = 1, len=arr.length; i < len; i++) {
        let e = arr[i].EntryNo_;
        minE = (e < minE) ? e : minE;
        maxE = (e > maxE) ? e : maxE;

        let d = arr[i].DocumentNo_;
        minD = (d < minD) ? d : minD;
        maxD = (d > maxD) ? d : maxD;

        let p = arr[i].PostingDate;
        minP = (p < minP) ? p : minP;
        maxP = (p > maxP) ? p : maxP;
      }
    
      return {
        EntryNo_: `${minE} - ${maxE}`,
        DocumentNo_: `${minD} - ${maxD}`,
        PostingDate: `${minP} - ${maxP}`,
      };
    }
    const ranges = findRanges(typeB);

    var aggregatedTypeB = [];

    typeB.reduce((accumulator, currentItem) => {
      if (!accumulator[currentItem.ProjectNr]) {
        accumulator[currentItem.ProjectNr] = {
          'ampi__Budget__r.Name': 'FCA Nav Default Budget',
          'ampi__Reporting_Period__r.Name': 'RP-00020',
          'Project_Number__r.Project_Programme_Number_External_ID__c': currentItem.ProjectNr,
          Account_Name__c: "Donations",
          Account_Number__c: "3310 - 3888",
          ampi__Amount_Actual__c: 0,
          ampi__Description__c: "Donations",
          Credit_Amount__c: 0,
          Debit_Amount__c: 0,
          Document_Number__c: ranges.DocumentNo_,
          Name: ranges.EntryNo_,
          Posting_Date__c: ranges.PostingDate,
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
