
## /public/list-licenses-by-product

Returns an array of objects that look like this:
```
{
    productName,
    vendorName,
    currentTermStartDate,
    currentTermEndDate,
    totalTermEndDate,
    terms: {
        downloadTerms
        coursePacksTerms
        interLibraryLoanTerms
        printTerms
        limitedScholarlySharingTerms
        walkinTerms
        eReservesTerms
        hasConfidentialityTerms
    }
}
```

## /public/list-subscriptions-for-library/*<LIBRARY-ID>*

Returns an array of objects that look like this:
```
{
    productName,
    vendorName,
    funding,
    cycleName,
    cycleYear
}
```
