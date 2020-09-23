var chai = require('chai');
var expect = chai.expect;
var Q = require('q');
var IndexingStatusTracker = require('../CycleCreationJobProcessor/IndexingStatusTracker');

describe('Indexing Status Tracker', () => {

    describe('isIndexingFinished function', () => {
        it('is not finished before it starts', () => {
            const tracker = IndexingStatusTracker(() => 100, {});
            const result = tracker._isIndexingFinished();
            expect(result).to.be.false;
        });

        it('is finished if we have an alternative cycle', async () => {
            const tracker = IndexingStatusTracker(() => 100, { cycleType: 'Alternative Cycle' });

            await tracker._tick();
            const result = tracker._isIndexingFinished();
            expect(result).to.be.true;
        });

        it('can be started and resolves when finished', async () => {
            let currentProgress = 0;
            const tracker = IndexingStatusTracker(() => currentProgress, {});

            const finishedPromise = tracker.start();
            await tracker._tick();
            currentProgress = 100;
            tracker._tick();

            await finishedPromise;
        });
    })
});
