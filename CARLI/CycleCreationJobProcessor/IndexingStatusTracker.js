var Q = require('q');

function IndexingStatusTracker(getViewIndexingStatus, newCycle) {
     let finishedDeferred = Q.defer();
     let trustViewIndex = false;
     let intervalId;
     let currentProgress = 0;

     function start() {
         intervalId = setInterval(tick, 500);
         tick();
         return finishedDeferred.promise;
     }

     async function updateCurrentProgress() {
         currentProgress = await getViewIndexingStatus(newCycle);
     }

     async function tick() {
         await updateCurrentProgress();

         if (shouldTrustViewIndex()) {
             trustViewIndex = true;
         }

         if (isIndexingFinished()) {
             clearInterval(intervalId);
             finishedDeferred.resolve();
         }
     }

     function shouldTrustViewIndex() {
         return hasIndexingStarted(currentProgress) || shouldIgnoreCycleIndexTime(currentProgress);
     }

     function isIndexingFinished() {
         return trustViewIndex && currentProgress === 100;
     }

     function hasIndexingStarted() {
         return (currentProgress < 100) || trustViewIndex;
     }

     function shouldIgnoreCycleIndexTime() {
         /**
          * We don't initially trust a value of 100 because that could mean the indexing job has not started yet or it could mean
          * that it already finished. So we wait until we see some progress (e.g. 25%) before we believe the number.
          * This appears to be a problem with alternative cycles because they are small enough that the indexing finishes before
          * any intermediate progress can be reported. So we never trust the value, we never clear the interval or resolve the promise,
          * and we never leave this step.
          */
         var oneHundredPercentIndexingIsAmbiguous = (newCycle.cycleType === 'Alternative Cycle');
         return (currentProgress === 100 && oneHundredPercentIndexingIsAmbiguous);
     }

     return {
         start,
         _tick: tick,
         _isIndexingFinished: isIndexingFinished
     };
}

module.exports = IndexingStatusTracker;
